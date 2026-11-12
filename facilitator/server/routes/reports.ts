import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import dbManager from '../db/database.js';
import { authenticate } from './auth.js';
import { validateReport } from '../services/reportValidator.js';
import { parseReport } from '../services/reportParser.js';
import { learningSignalEngine } from '../services/learningSignalEngine.js';
import { aiService } from '../services/aiService.js';
import { AccumulReportSchema, LearningActivity } from '../types.js';

export const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are supported'));
    }
  },
});

// POST /api/reports/import
router.post('/import', authenticate, upload.single('report'), async (req: any, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const rawJson = req.file.buffer.toString('utf-8');
    const isDemo = req.body.demo === 'true';

    // Step 1: Validate
    const validation = validateReport(rawJson);
    if (!validation.valid) {
      return res.status(422).json({ valid: false, errors: validation.errors, warnings: validation.warnings });
    }

    const reportDbId = uuidv4();
    const parsed = parseReport(JSON.parse(rawJson), reportDbId);
    const reportDate = validation.reportDate || new Date().toISOString();
    const reportVersion = validation.reportVersion || '1.0';

    // Step 2: Check duplicate
    const existingStudent = dbManager.get<{ id: string }>(
      'SELECT id FROM students WHERE student_id = ?',
      [parsed.student.student_id]
    );

    if (existingStudent) {
      const dupReport = dbManager.get<{ id: string }>(
        'SELECT id FROM student_reports WHERE student_id = ? AND report_date = ?',
        [existingStudent.id, reportDate]
      );
      if (dupReport) {
        const studentRecord = dbManager.get<any>('SELECT * FROM students WHERE id = ?', [existingStudent.id]);
        return res.status(200).json({
          valid: true,
          validation,
          student: { id: existingStudent.id, full_name: studentRecord?.full_name || parsed.student.full_name, class: studentRecord?.class || parsed.student.class },
          report_id: dupReport.id,
          signals_detected: validation.signalsDetected || 0,
          ai_summary: `This report was previously imported. Viewing analysis for ${studentRecord?.full_name || parsed.student.full_name}.`,
          warnings: ['This report was already imported previously. Displaying current student analysis.'],
        });
      }
    }

    const now = new Date().toISOString();

    // Step 4: Upsert student
    let studentDbId: string;
    if (existingStudent) {
      studentDbId = existingStudent.id;
      dbManager.run(
        'UPDATE students SET full_name=?, class=?, school=?, preferred_language=?, interests=?, updated_at=? WHERE id=?',
        [parsed.student.full_name, parsed.student.class, parsed.student.school,
         parsed.student.preferred_language, JSON.stringify(parsed.student.interests || []),
         now, studentDbId]
      );
    } else {
      studentDbId = parsed.student.id;
      dbManager.run(
        'INSERT INTO students (id, student_id, full_name, class, school, preferred_language, interests, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)',
        [studentDbId, parsed.student.student_id, parsed.student.full_name,
         parsed.student.class, parsed.student.school, parsed.student.preferred_language,
         JSON.stringify(parsed.student.interests || []), now, now]
      );
    }

    // Fix student_id in all parsed activities
    const allActivities = [...parsed.lessons, ...parsed.quizzes, ...parsed.aiQuestions, ...parsed.peerCompetitions];
    for (const act of allActivities) {
      act.student_id = studentDbId;
    }

    // Step 5: Insert report
    dbManager.run(
      'INSERT INTO student_reports (id, student_id, report_version, report_date, raw_json, imported_at, imported_by, is_demo) VALUES (?,?,?,?,?,?,?,?)',
      [reportDbId, studentDbId, reportVersion, reportDate, rawJson, now, req.facilitatorId, isDemo ? 1 : 0]
    );

    // Step 6: Insert activities
    for (const act of allActivities) {
      dbManager.run(
        `INSERT INTO learning_activities (id, report_id, student_id, activity_type, subject, topic, subtopic, difficulty, language, score_numerator, score_denominator, time_spent_seconds, completed, attempts, hints_requested, questions_skipped, repeated_mistakes, confidence_rating, activity_date, extra_data, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [act.id!, reportDbId, studentDbId, act.activity_type!, act.subject ?? null, act.topic ?? null,
         act.subtopic ?? null, act.difficulty ?? null, act.language ?? null,
         act.score_numerator ?? null, act.score_denominator ?? null, act.time_spent_seconds ?? null,
         act.completed ?? 0, act.attempts ?? 1, act.hints_requested ?? 0,
         act.questions_skipped ?? 0, act.repeated_mistakes ?? 0, act.confidence_rating ?? null,
         act.activity_date ?? null, act.extra_data ?? null, now]
      );
    }

    // Step 7: Deactivate old signals for this student before re-analyzing
    dbManager.run(
      'UPDATE learning_signals SET status=? WHERE student_id=? AND status=?',
      ['monitoring', studentDbId, 'active']
    );

    // Step 8: Run signal engine
    const dbActivities = dbManager.all<LearningActivity>(
      'SELECT * FROM learning_activities WHERE student_id = ?',
      [studentDbId]
    );
    const student = dbManager.get<any>('SELECT * FROM students WHERE id = ?', [studentDbId]);
    const rawSignals = learningSignalEngine.analyze(dbActivities, student.full_name);

    for (const sig of rawSignals) {
      const sigId = uuidv4();
      dbManager.run(
        `INSERT INTO learning_signals (id, student_id, report_id, signal_type, subject, topic, subtopic, severity, evidence, confidence_score, recommended_action, status, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [sigId, studentDbId, reportDbId, sig.signal_type, sig.subject ?? null, sig.topic ?? null,
         sig.subtopic ?? null, sig.severity, JSON.stringify(sig.evidence), sig.confidence_score,
         sig.recommended_action, 'active', now, now]
      );
    }

    validation.signalsDetected = rawSignals.length;

    // Step 9: AI summary
    const signals = dbManager.all<any>('SELECT * FROM learning_signals WHERE student_id = ? AND status = ?', [studentDbId, 'active']);
    const summaryText = await aiService.analyzeSummary(student, signals, dbActivities);

    // Step 10: Notifications
    if (rawSignals.length > 0) {
      const notifId = uuidv4();
      const topSignal = rawSignals[0];
      dbManager.run(
        'INSERT INTO notifications (id, facilitator_id, type, title, message, student_id, report_id, read, created_at) VALUES (?,?,?,?,?,?,?,?,?)',
        [notifId, req.facilitatorId, 'new_signal',
         `New learning signal for ${student.full_name}`,
         `${rawSignals.length} learning signal(s) detected in ${topSignal.subject} — ${topSignal.topic}. Recommended: ${topSignal.recommended_action.substring(0, 80)}...`,
         studentDbId, reportDbId, 0, now]
      );
    }

    // Step 11: Log action
    dbManager.run(
      'INSERT INTO facilitator_action_log (id, facilitator_id, action_type, target_student_id, target_report_id, details, created_at) VALUES (?,?,?,?,?,?,?)',
      [uuidv4(), req.facilitatorId, 'report_imported', studentDbId, reportDbId,
       `Imported report v${reportVersion} for ${student.full_name}`, now]
    );

    return res.status(201).json({
      valid: true,
      validation,
      student: { id: studentDbId, full_name: student.full_name, class: student.class },
      report_id: reportDbId,
      signals_detected: rawSignals.length,
      ai_summary: summaryText,
      warnings: validation.warnings,
    });
  } catch (err: any) {
    console.error('[REPORTS] Import error:', err.message, err.stack);
    return res.status(500).json({ message: 'Report import failed: ' + err.message });
  }
});

// GET /api/reports
router.get('/', authenticate, (_req, res) => {
  const reports = dbManager.all(`
    SELECT sr.id, sr.report_version, sr.report_date, sr.imported_at, sr.is_demo,
           s.id as student_db_id, s.full_name, s.class, s.student_id,
           (SELECT COUNT(*) FROM learning_activities WHERE report_id = sr.id) as activities_count,
           (SELECT COUNT(*) FROM learning_activities WHERE report_id = sr.id AND activity_type = 'quiz') as quizzes_count
    FROM student_reports sr
    JOIN students s ON s.id = sr.student_id
    ORDER BY sr.imported_at DESC
  `);
  res.json(reports);
});

// GET /api/reports/student/:studentId
router.get('/student/:studentId', authenticate, (req, res) => {
  const reports = dbManager.all(`
    SELECT sr.id, sr.report_version, sr.report_date, sr.imported_at, sr.is_demo,
           (SELECT COUNT(*) FROM learning_activities WHERE report_id = sr.id) as activities_count
    FROM student_reports sr
    WHERE sr.student_id = ?
    ORDER BY sr.report_date ASC
  `, [req.params.studentId]);
  res.json(reports);
});

// GET /api/reports/:id
router.get('/:id', authenticate, (req, res) => {
  const report = dbManager.get('SELECT * FROM student_reports WHERE id = ?', [req.params.id]);
  if (!report) return res.status(404).json({ message: 'Report not found' });
  const activities = dbManager.all('SELECT * FROM learning_activities WHERE report_id = ?', [req.params.id]);
  res.json({ ...report, activities });
});
