import express from 'express';
import dbManager from '../db/database.js';
import { authenticate } from './auth.js';

export const router = express.Router();

// GET /api/analytics/dashboard
router.get('/dashboard', authenticate, (_req, res) => {
  try {
    const totalStudents = (dbManager.get<any>('SELECT COUNT(*) as c FROM students') || { c: 0 }).c;

    // Compute priority per student
    const students = dbManager.all<any>('SELECT id FROM students');
    let onTrack = 0, needsAttention = 0, requiresIntervention = 0;

    for (const s of students) {
      const signals = dbManager.all<any>(
        'SELECT severity FROM learning_signals WHERE student_id = ? AND status = ?',
        [s.id, 'active']
      );
      if (signals.length === 0) { onTrack++; continue; }
      const hasHigh = signals.some((sig: any) => sig.severity === 'high');
      const hasMedium = signals.some((sig: any) => sig.severity === 'medium');
      if (hasHigh) requiresIntervention++;
      else if (hasMedium) needsAttention++;
      else onTrack++;
    }

    const recentSignals = dbManager.all(`
      SELECT ls.*, s.full_name as student_name, s.class as student_class
      FROM learning_signals ls
      JOIN students s ON s.id = ls.student_id
      WHERE ls.status = 'active'
      ORDER BY ls.created_at DESC LIMIT 5
    `).map((s: any) => ({ ...s, evidence: typeof s.evidence === 'string' ? JSON.parse(s.evidence) : s.evidence }));

    const recentInterventions = dbManager.all(`
      SELECT i.*, s.full_name as student_name
      FROM interventions i
      JOIN students s ON s.id = i.student_id
      ORDER BY i.assigned_at DESC LIMIT 5
    `);

    res.json({
      total_students: totalStudents,
      on_track: onTrack,
      needs_attention: needsAttention,
      requires_intervention: requiresIntervention,
      recent_signals: recentSignals,
      recent_interventions: recentInterventions,
    });
  } catch (err: any) {
    console.error('[ANALYTICS] Dashboard error:', err.message);
    res.status(500).json({ message: 'Failed to compute dashboard stats' });
  }
});

// GET /api/analytics/class
router.get('/class', authenticate, (_req, res) => {
  try {
    const students = dbManager.all<any>('SELECT id, full_name, class FROM students');
    const classBuckets: Record<string, { students: string[]; ids: string[] }> = {};

    for (const s of students) {
      const cls = s.class || 'Unknown';
      if (!classBuckets[cls]) classBuckets[cls] = { students: [], ids: [] };
      classBuckets[cls].students.push(s.full_name);
      classBuckets[cls].ids.push(s.id);
    }

    const classData: any[] = [];
    for (const [cls, data] of Object.entries(classBuckets)) {
      const classSignals: Record<string, number[]> = {}; // topic → [count of students with signal]
      const topicScores: Record<string, { correct: number; total: number }> = {};

      for (const sid of data.ids) {
        const quizzes = dbManager.all<any>(
          'SELECT topic, subject, score_numerator, score_denominator FROM learning_activities WHERE student_id = ? AND activity_type = ?',
          [sid, 'quiz']
        );
        for (const q of quizzes) {
          const key = `${q.subject}::${q.topic}`;
          if (!topicScores[key]) topicScores[key] = { correct: 0, total: 0 };
          topicScores[key].correct += q.score_numerator || 0;
          topicScores[key].total += q.score_denominator || 0;
        }

        const signals = dbManager.all<any>(
          'SELECT topic FROM learning_signals WHERE student_id = ? AND status = ?',
          [sid, 'active']
        );
        for (const sig of signals) {
          if (!classSignals[sig.topic]) classSignals[sig.topic] = [];
          classSignals[sig.topic].push(1);
        }
      }

      // Classify class-wide vs individual signals
      const classWideThreshold = Math.ceil(data.ids.length * 0.4);
      const topicAnalysis = Object.entries(topicScores).map(([key, scores]) => {
        const [subject, topic] = key.split('::');
        const avgPct = scores.total > 0 ? Math.round((scores.correct / scores.total) * 100) : null;
        const studentsWithSignal = (classSignals[topic] || []).length;
        return {
          subject, topic, avg_score: avgPct,
          students_with_signal: studentsWithSignal,
          class_wide: studentsWithSignal >= classWideThreshold,
          total_students: data.ids.length,
        };
      });

      classData.push({
        class: cls,
        total_students: data.ids.length,
        student_names: data.students,
        topics: topicAnalysis,
      });
    }

    res.json(classData);
  } catch (err: any) {
    console.error('[ANALYTICS] Class error:', err.message);
    res.status(500).json({ message: 'Failed to compute class analytics' });
  }
});

// GET /api/analytics/topics
router.get('/topics', authenticate, (_req, res) => {
  try {
    const totalStudents = (dbManager.get<any>('SELECT COUNT(*) as c FROM students') || { c: 1 }).c;
    const threshold = Math.ceil(totalStudents * 0.4);

    const topicRows = dbManager.all<any>(`
      SELECT subject, topic,
        SUM(score_numerator) as total_correct,
        SUM(score_denominator) as total_questions,
        COUNT(DISTINCT student_id) as student_count
      FROM learning_activities
      WHERE activity_type = 'quiz' AND score_denominator > 0
      GROUP BY subject, topic
    `);

    const signalRows = dbManager.all<any>(`
      SELECT topic, COUNT(DISTINCT student_id) as signal_count
      FROM learning_signals
      WHERE status = 'active'
      GROUP BY topic
    `);
    const signalMap: Record<string, number> = {};
    for (const r of signalRows) signalMap[r.topic] = r.signal_count;

    const topics = topicRows.map((r: any) => ({
      subject: r.subject,
      topic: r.topic,
      avg_score: r.total_questions > 0 ? Math.round((r.total_correct / r.total_questions) * 100) : null,
      student_count: r.student_count,
      students_with_signal: signalMap[r.topic] || 0,
      class_wide: (signalMap[r.topic] || 0) >= threshold,
    }));

    res.json({ topics, total_students: totalStudents, class_wide_threshold: threshold });
  } catch (err: any) {
    console.error('[ANALYTICS] Topics error:', err.message);
    res.status(500).json({ message: 'Failed to compute topic analytics' });
  }
});

// GET /api/notifications
router.get('/notifications', authenticate, (req: any, res) => {
  const notifications = dbManager.all(
    'SELECT * FROM notifications WHERE facilitator_id = ? ORDER BY created_at DESC LIMIT 50',
    [req.facilitatorId]
  );
  res.json(notifications);
});

// PATCH /api/notifications/:id/read
router.patch('/notifications/:id/read', authenticate, (req, res) => {
  dbManager.run('UPDATE notifications SET read = 1 WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});
