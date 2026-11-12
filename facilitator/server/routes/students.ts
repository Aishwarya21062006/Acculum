import express from 'express';
import dbManager from '../db/database.js';
import { authenticate } from './auth.js';
import { aiService } from '../services/aiService.js';
import { LearningActivity, LearningSignal, StudentProfile } from '../types.js';

export const router = express.Router();

function calcPriority(signals: any[]): string {
  const active = signals.filter((s) => s.status === 'active');
  if (active.length === 0) return 'on_track';
  const hasHigh = active.some((s) => s.severity === 'high');
  const hasMedium = active.some((s) => s.severity === 'medium');
  if (hasHigh) return 'intervention_required';
  if (hasMedium) return 'needs_attention';
  return 'on_track';
}

// GET /api/students
router.get('/', authenticate, (req, res) => {
  try {
    const students = dbManager.all<any>(`
      SELECT s.*,
        (SELECT sr.report_date FROM student_reports sr WHERE sr.student_id = s.id ORDER BY sr.report_date DESC LIMIT 1) as last_report_date,
        (SELECT COUNT(*) FROM learning_signals ls WHERE ls.student_id = s.id AND ls.status = 'active') as signal_count
      FROM students s
      ORDER BY s.full_name ASC
    `);

    const result = students.map((s) => {
      // Parse interests
      try { s.interests = JSON.parse(s.interests || '[]'); } catch { s.interests = []; }

      // Get active signals for priority
      const signals = dbManager.all('SELECT * FROM learning_signals WHERE student_id = ? AND status = ?', [s.id, 'active']);
      s.priority = calcPriority(signals);

      // Latest topic and score
      const latestQuiz = dbManager.get<any>(
        `SELECT subject, topic, score_numerator, score_denominator FROM learning_activities
         WHERE student_id = ? AND activity_type = 'quiz' ORDER BY activity_date DESC LIMIT 1`,
        [s.id]
      );
      if (latestQuiz) {
        s.current_topic = latestQuiz.topic;
        s.current_subject = latestQuiz.subject;
        if (latestQuiz.score_denominator) {
          s.latest_score = Math.round((latestQuiz.score_numerator / latestQuiz.score_denominator) * 100);
        }
      }

      // Top signal type
      const topSignal = signals[0];
      s.top_signal_type = topSignal?.signal_type || null;

      return s;
    });

    res.json(result);
  } catch (err: any) {
    console.error('[STUDENTS] List error:', err.message);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

// GET /api/students/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const student = dbManager.get<any>('SELECT * FROM students WHERE id = ?', [req.params.id]);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    try { student.interests = JSON.parse(student.interests || '[]'); } catch { student.interests = []; }

    const reports = dbManager.all(`
      SELECT id, report_version, report_date, imported_at, is_demo,
        (SELECT COUNT(*) FROM learning_activities WHERE report_id = student_reports.id) as activities_count
      FROM student_reports WHERE student_id = ? ORDER BY report_date ASC
    `, [student.id]);

    const activities = dbManager.all<LearningActivity>(
      'SELECT * FROM learning_activities WHERE student_id = ? ORDER BY activity_date DESC, created_at DESC',
      [student.id]
    );

    const signals = dbManager.all<LearningSignal>(
      'SELECT * FROM learning_signals WHERE student_id = ? ORDER BY severity DESC, created_at DESC',
      [student.id]
    );

    // Parse evidence JSON
    const parsedSignals = signals.map((s) => {
      const raw = s.evidence as any;
      const ev = Array.isArray(raw) ? raw : (typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch { return [raw]; } })() : []);
      return { ...s, evidence: ev };
    });

    const interventions = dbManager.all(
      'SELECT * FROM interventions WHERE student_id = ? ORDER BY assigned_at DESC',
      [student.id]
    );

    const reassessments = dbManager.all(
      'SELECT * FROM reassessments WHERE student_id = ? ORDER BY created_at DESC',
      [student.id]
    );

    const activeSignals = parsedSignals.filter((s) => s.status === 'active');
    const priority = calcPriority(activeSignals);

    // Generate AI summary
    const aiSummary = await aiService.analyzeSummary(student as StudentProfile, activeSignals as any, activities);

    res.json({
      ...student,
      priority,
      reports,
      activities,
      signals: parsedSignals,
      interventions,
      reassessments,
      ai_summary: aiSummary,
    });
  } catch (err: any) {
    console.error('[STUDENTS] Detail error:', err.message);
    res.status(500).json({ message: 'Failed to fetch student detail' });
  }
});

// GET /api/students/:id/signals
router.get('/:id/signals', authenticate, (req, res) => {
  const signals = dbManager.all<any>(
    'SELECT * FROM learning_signals WHERE student_id = ? ORDER BY severity DESC, created_at DESC',
    [req.params.id]
  );
  const parsed = signals.map((s) => {
    const raw = s.evidence as any;
    const ev = Array.isArray(raw) ? raw : (typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch { return [raw]; } })() : []);
    return { ...s, evidence: ev };
  });
  res.json(parsed);
});
