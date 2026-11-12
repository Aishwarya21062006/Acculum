import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import dbManager from '../db/database.js';
import { authenticate } from './auth.js';
import { AccumulReportSchema } from '../types.js';
import { aiService } from '../services/aiService.js';

export const router = express.Router();

// POST /api/interventions
router.post('/', authenticate, async (req: any, res) => {
  try {
    const {
      student_id, signal_id, intervention_type, subject, topic, subtopic,
      language, format, difficulty, notes,
    } = req.body;

    if (!student_id || !intervention_type) {
      return res.status(400).json({ message: 'student_id and intervention_type are required' });
    }

    const student = dbManager.get('SELECT id, full_name FROM students WHERE id = ?', [student_id]);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const now = new Date().toISOString();
    const id = uuidv4();
    dbManager.run(
      `INSERT INTO interventions (id, student_id, signal_id, facilitator_id, intervention_type, subject, topic, subtopic, language, format, difficulty, notes, status, assigned_at, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, student_id, signal_id || null, req.facilitatorId, intervention_type,
       subject || null, topic || null, subtopic || null,
       language || 'English', format || null, difficulty || null, notes || null,
       'assigned', now, now]
    );

    // Update signal status if linked
    if (signal_id) {
      dbManager.run(
        'UPDATE learning_signals SET status=?, updated_at=? WHERE id=?',
        ['monitoring', now, signal_id]
      );
    }

    // Notification
    const s = student as any;
    dbManager.run(
      `INSERT INTO notifications (id, facilitator_id, type, title, message, student_id, read, created_at)
       VALUES (?,?,?,?,?,?,?,?)`,
      [uuidv4(), req.facilitatorId, 'intervention_assigned',
       `Intervention assigned for ${s.full_name}`,
       `${intervention_type} intervention assigned for ${topic || subject || 'general learning'}`,
       student_id, 0, now]
    );

    // Log action
    dbManager.run(
      `INSERT INTO facilitator_action_log (id, facilitator_id, action_type, target_student_id, details, created_at) VALUES (?,?,?,?,?,?)`,
      [uuidv4(), req.facilitatorId, 'intervention_assigned', student_id,
       `Assigned ${intervention_type} for ${topic || subject}`, now]
    );

    const intervention = dbManager.get('SELECT * FROM interventions WHERE id = ?', [id]);
    return res.status(201).json(intervention);
  } catch (err: any) {
    console.error('[INTERVENTIONS] Create error:', err.message);
    return res.status(500).json({ message: 'Failed to create intervention' });
  }
});

// GET /api/interventions
router.get('/', authenticate, (_req, res) => {
  const interventions = dbManager.all(`
    SELECT i.*, s.full_name as student_name, s.class as student_class,
      r.improvement_percentage, r.status as reassessment_status,
      r.before_score_numerator, r.before_score_denominator,
      r.after_score_numerator, r.after_score_denominator
    FROM interventions i
    JOIN students s ON s.id = i.student_id
    LEFT JOIN reassessments r ON r.intervention_id = i.id
    ORDER BY i.assigned_at DESC
  `);
  res.json(interventions);
});

// GET /api/interventions/student/:studentId
router.get('/student/:studentId', authenticate, (req, res) => {
  const interventions = dbManager.all(`
    SELECT i.*,
      r.improvement_percentage, r.status as reassessment_status,
      r.before_score_numerator, r.before_score_denominator,
      r.after_score_numerator, r.after_score_denominator,
      r.completed_at as reassessment_completed_at
    FROM interventions i
    LEFT JOIN reassessments r ON r.intervention_id = i.id
    WHERE i.student_id = ?
    ORDER BY i.assigned_at DESC
  `, [req.params.studentId]);
  res.json(interventions);
});

// GET /api/interventions/:id
router.get('/:id', authenticate, (req, res) => {
  const intervention = dbManager.get<any>('SELECT * FROM interventions WHERE id = ?', [req.params.id]);
  if (!intervention) return res.status(404).json({ message: 'Intervention not found' });
  const reassessment = dbManager.get('SELECT * FROM reassessments WHERE intervention_id = ?', [req.params.id]);
  const signal = intervention.signal_id
    ? dbManager.get('SELECT * FROM learning_signals WHERE id = ?', [intervention.signal_id])
    : null;
  res.json({ ...intervention, reassessment, signal });
});

// PATCH /api/interventions/:id
router.patch('/:id', authenticate, (req: any, res) => {
  const { status, notes } = req.body;
  const now = new Date().toISOString();
  dbManager.run(
    'UPDATE interventions SET status=?, notes=?, completed_at=? WHERE id=?',
    [status, notes || null, status === 'completed' ? now : null, req.params.id]
  );
  res.json(dbManager.get('SELECT * FROM interventions WHERE id = ?', [req.params.id]));
});

const handleCreateReassessment = async (req: any, res: any) => {
  try {
    const { intervention_id, student_id, subject, topic, before_report_id, after_report_id } = req.body;

    if (!intervention_id || !student_id || !before_report_id || !after_report_id) {
      return res.status(400).json({ message: 'intervention_id, student_id, before_report_id, after_report_id are required' });
    }

    const beforeReport = dbManager.get<any>('SELECT raw_json FROM student_reports WHERE id = ?', [before_report_id]);
    const afterReport = dbManager.get<any>('SELECT raw_json FROM student_reports WHERE id = ?', [after_report_id]);
    if (!beforeReport || !afterReport) return res.status(404).json({ message: 'One or both reports not found' });

    const beforeJson: AccumulReportSchema = JSON.parse(beforeReport.raw_json);
    const afterJson: AccumulReportSchema = JSON.parse(afterReport.raw_json);

    const comparison = await aiService.compareReports(beforeJson, afterJson, topic || '');

    // Get before/after quiz totals for the topic
    const getQuizTotals = (report: AccumulReportSchema, topicName: string) => {
      const needle = (topicName || '').toLowerCase().trim();
      let relevant = report.quizzes.filter((q) =>
        !needle ||
        q.topic.toLowerCase().includes(needle) ||
        needle.includes(q.topic.toLowerCase()) ||
        (q.subtopic && (q.subtopic.toLowerCase().includes(needle) || needle.includes(q.subtopic.toLowerCase())))
      );
      if (relevant.length === 0) relevant = report.quizzes;
      const correct = relevant.reduce((s, q) => s + q.correct, 0);
      const total = relevant.reduce((s, q) => s + q.total_questions, 0);
      return { correct, total };
    };

    const beforeTotals = getQuizTotals(beforeJson, topic);
    const afterTotals = getQuizTotals(afterJson, topic);

    const now = new Date().toISOString();
    const id = uuidv4();
    dbManager.run(
      `INSERT INTO reassessments (id, intervention_id, student_id, subject, topic, before_score_numerator, before_score_denominator, after_score_numerator, after_score_denominator, before_report_id, after_report_id, improvement_percentage, status, completed_at, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, intervention_id, student_id, subject || null, topic || null,
       beforeTotals.correct, beforeTotals.total,
       afterTotals.correct, afterTotals.total,
       before_report_id, after_report_id,
       comparison.change_percentage,
       'completed', now, now]
    );

    // Update intervention status
    dbManager.run('UPDATE interventions SET status=?, completed_at=? WHERE id=?', ['completed', now, intervention_id]);

    // Notification
    const student = dbManager.get<any>('SELECT full_name FROM students WHERE id = ?', [student_id]);
    dbManager.run(
      `INSERT INTO notifications (id, facilitator_id, type, title, message, student_id, read, created_at) VALUES (?,?,?,?,?,?,?,?)`,
      [uuidv4(), req.facilitatorId, 'reassessment_complete',
       `Reassessment completed for ${student?.full_name}`,
       comparison.summary, student_id, 0, now]
    );

    res.status(201).json({ id, comparison, before: beforeTotals, after: afterTotals });
  } catch (err: any) {
    console.error('[REASSESSMENTS] Error:', err.message);
    res.status(500).json({ message: 'Failed to create reassessment: ' + err.message });
  }
};

const handleGetReassessmentsByStudent = (req: any, res: any) => {
  const reassessments = dbManager.all(
    'SELECT * FROM reassessments WHERE student_id = ? ORDER BY created_at DESC',
    [req.params.studentId]
  );
  res.json(reassessments);
};

// Mount on interventions router
router.post('/reassessments', authenticate, handleCreateReassessment);
router.get('/reassessments/student/:studentId', authenticate, handleGetReassessmentsByStudent);

// Dedicated reassessments router
export const reassessmentsRouter = express.Router();
reassessmentsRouter.post('/', authenticate, handleCreateReassessment);
reassessmentsRouter.get('/student/:studentId', authenticate, handleGetReassessmentsByStudent);
