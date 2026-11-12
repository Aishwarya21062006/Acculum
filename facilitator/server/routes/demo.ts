import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import dbManager from '../db/database.js';
import { authenticate } from './auth.js';
import { validateReport } from '../services/reportValidator.js';
import { parseReport } from '../services/reportParser.js';
import { learningSignalEngine } from '../services/learningSignalEngine.js';
import { aiService } from '../services/aiService.js';
import { AccumulReportSchema, LearningActivity } from '../types.js';

export const router = express.Router();

// ─── Demo Report Generators ───────────────────────────────────────────────────

function makeRahulReport(): AccumulReportSchema {
  const base = '2026-09-10T08:00:00.000Z';
  return {
    report_version: '1.0',
    generated_at: '2026-09-12T14:00:00.000Z',
    student: {
      student_id: 'STU-RAHUL-001',
      full_name: 'Rahul Sharma',
      class: '8',
      school: 'Delhi Public School',
      preferred_language: 'English',
      interests: ['cricket', 'science', 'puzzles'],
    },
    learning_activities: [
      { lesson_id: 'L001', title: 'Meaning of Fractions', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Meaning', difficulty: 'easy', format: 'text', language: 'English', completed: true, partially_completed: false, skipped: false, time_spent_seconds: 720, date: '2026-09-10T09:00:00Z' },
      { lesson_id: 'L002', title: 'Equivalent Fractions', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Equivalent Fractions', difficulty: 'medium', format: 'visual', language: 'English', completed: true, partially_completed: false, skipped: false, time_spent_seconds: 850, date: '2026-09-10T10:00:00Z' },
      { lesson_id: 'L003', title: 'Comparing Fractions', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Comparing Fractions', difficulty: 'medium', format: 'text', language: 'English', completed: false, partially_completed: true, skipped: false, time_spent_seconds: 400, date: '2026-09-11T09:00:00Z' },
      { lesson_id: 'L004', title: 'Fraction Addition', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Addition', difficulty: 'medium', format: 'text', language: 'English', completed: false, partially_completed: true, skipped: false, time_spent_seconds: 300, date: '2026-09-11T10:00:00Z' },
      { lesson_id: 'L005', title: 'Fraction Word Problems', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Word Problems', difficulty: 'hard', format: 'interactive', language: 'English', completed: false, partially_completed: false, skipped: true, time_spent_seconds: 0, date: '2026-09-12T09:00:00Z' },
    ],
    quizzes: [
      { quiz_id: 'Q001', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Meaning', total_questions: 2, correct: 2, incorrect: 0, score_percentage: 100, attempts: 1, time_taken_seconds: 180, questions_skipped: 0, hints_requested: 0, repeated_mistakes: 0, date: '2026-09-10T09:30:00Z' },
      { quiz_id: 'Q002', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Equivalent Fractions', total_questions: 2, correct: 2, incorrect: 0, score_percentage: 100, attempts: 1, time_taken_seconds: 200, questions_skipped: 0, hints_requested: 0, repeated_mistakes: 0, date: '2026-09-10T10:30:00Z' },
      { quiz_id: 'Q003', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Comparing Fractions', total_questions: 3, correct: 1, incorrect: 2, score_percentage: 33, attempts: 2, time_taken_seconds: 450, questions_skipped: 0, hints_requested: 2, repeated_mistakes: 3, date: '2026-09-11T09:30:00Z' },
      { quiz_id: 'Q004', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Fraction Addition', total_questions: 3, correct: 1, incorrect: 2, score_percentage: 33, attempts: 2, time_taken_seconds: 500, questions_skipped: 0, hints_requested: 1, repeated_mistakes: 2, date: '2026-09-11T10:30:00Z' },
      { quiz_id: 'Q005', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Word Problems', total_questions: 2, correct: 0, incorrect: 1, score_percentage: 0, attempts: 1, time_taken_seconds: 300, questions_skipped: 1, hints_requested: 1, repeated_mistakes: 1, date: '2026-09-12T09:30:00Z' },
    ],
    ai_questions: [
      { question: 'How do I compare 2/3 and 3/5?', subject: 'Mathematics', topic: 'Fractions', lesson_context: 'Comparing Fractions', help_type: 'explanation', date: '2026-09-11T09:00:00Z' },
      { question: 'Why do we need a common denominator to compare fractions?', subject: 'Mathematics', topic: 'Fractions', lesson_context: 'Comparing Fractions', help_type: 'clarification', date: '2026-09-11T09:15:00Z' },
      { question: 'Can you give me an example of comparing fractions with different denominators?', subject: 'Mathematics', topic: 'Fractions', lesson_context: 'Comparing Fractions', help_type: 'example', date: '2026-09-11T09:25:00Z' },
    ],
    peer_competitions: [
      { competition_id: 'PC001', subject: 'Mathematics', topic: 'Fractions', difficulty: 'medium', total_questions: 5, student_score: 2, completed: true, time_taken_seconds: 600, correct: 2, incorrect: 3, date: '2026-09-12T11:00:00Z', xp_earned: 20 },
    ],
    confidence_data: [
      { topic: 'Fractions', subject: 'Mathematics', confidence_rating: 4, associated_quiz_score: 50, date: '2026-09-12T12:00:00Z' },
    ],
    adaptive_learning: {
      difficulty_served: 'medium',
      difficulty_changes: 1,
      recommended_revisions: ['Comparing Fractions', 'Unlike Denominators'],
      topics_revisited: ['Comparing Fractions'],
      formats_used: ['text', 'visual', 'interactive'],
      languages_used: ['English'],
      interests_used: ['puzzles'],
    },
  };
}

function makeRahulReport2(): AccumulReportSchema {
  // After intervention — improved scores on Comparing Fractions (80%)
  return {
    ...makeRahulReport(),
    report_version: '1.0',
    generated_at: '2026-09-15T14:00:00.000Z',
    quizzes: [
      { quiz_id: 'Q006', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Comparing Fractions', total_questions: 10, correct: 8, incorrect: 2, score_percentage: 80, attempts: 1, time_taken_seconds: 360, questions_skipped: 0, hints_requested: 0, repeated_mistakes: 0, date: '2026-09-15T10:00:00Z' },
    ],
    confidence_data: [
      { topic: 'Fractions', subject: 'Mathematics', confidence_rating: 4, associated_quiz_score: 80, date: '2026-09-15T11:00:00Z' },
    ],
  };
}

function makePriyaReport(): AccumulReportSchema {
  return {
    report_version: '1.0',
    generated_at: '2026-09-11T10:00:00.000Z',
    student: {
      student_id: 'STU-PRIYA-002',
      full_name: 'Priya Nair',
      class: '8',
      school: 'Delhi Public School',
      preferred_language: 'English',
      interests: ['biology', 'painting', 'reading'],
    },
    learning_activities: [
      { lesson_id: 'L010', title: 'Cell Structure', subject: 'Science', topic: 'Biology', subtopic: 'Cell Structure', difficulty: 'medium', format: 'visual', language: 'English', completed: true, partially_completed: false, skipped: false, time_spent_seconds: 900, date: '2026-09-09T09:00:00Z' },
      { lesson_id: 'L011', title: 'Photosynthesis', subject: 'Science', topic: 'Biology', subtopic: 'Photosynthesis', difficulty: 'medium', format: 'interactive', language: 'English', completed: true, partially_completed: false, skipped: false, time_spent_seconds: 1100, date: '2026-09-10T09:00:00Z' },
    ],
    quizzes: [
      { quiz_id: 'Q010', subject: 'Science', topic: 'Biology', subtopic: 'Cell Structure', total_questions: 5, correct: 4, incorrect: 1, score_percentage: 80, attempts: 1, time_taken_seconds: 300, questions_skipped: 0, hints_requested: 0, repeated_mistakes: 0, date: '2026-09-09T10:00:00Z' },
      { quiz_id: 'Q011', subject: 'Science', topic: 'Biology', subtopic: 'Photosynthesis', total_questions: 5, correct: 4, incorrect: 1, score_percentage: 80, attempts: 1, time_taken_seconds: 350, questions_skipped: 0, hints_requested: 0, repeated_mistakes: 0, date: '2026-09-10T10:00:00Z' },
    ],
    ai_questions: [],
    peer_competitions: [],
    confidence_data: [
      { topic: 'Biology', subject: 'Science', confidence_rating: 4, associated_quiz_score: 80, date: '2026-09-11T09:00:00Z' },
    ],
    adaptive_learning: { difficulty_served: 'medium', difficulty_changes: 0, recommended_revisions: [], topics_revisited: [], formats_used: ['visual', 'interactive'], languages_used: ['English'], interests_used: ['biology'] },
  };
}

function makeArjunReport(): AccumulReportSchema {
  return {
    report_version: '1.0',
    generated_at: '2026-09-11T10:00:00.000Z',
    student: {
      student_id: 'STU-ARJUN-003',
      full_name: 'Arjun Mehta',
      class: '9',
      school: 'Delhi Public School',
      preferred_language: 'English',
      interests: ['football', 'coding', 'music'],
    },
    learning_activities: [
      { lesson_id: 'L020', title: 'Introduction to Algebra', subject: 'Mathematics', topic: 'Algebra', subtopic: 'Introduction', difficulty: 'medium', format: 'text', language: 'English', completed: true, partially_completed: false, skipped: false, time_spent_seconds: 800, date: '2026-09-09T09:00:00Z' },
      { lesson_id: 'L021', title: 'Linear Equations', subject: 'Mathematics', topic: 'Algebra', subtopic: 'Linear Equations', difficulty: 'medium', format: 'text', language: 'English', completed: false, partially_completed: true, skipped: false, time_spent_seconds: 500, date: '2026-09-10T09:00:00Z' },
    ],
    quizzes: [
      { quiz_id: 'Q020', subject: 'Mathematics', topic: 'Algebra', subtopic: 'Introduction', total_questions: 5, correct: 2, incorrect: 3, score_percentage: 40, attempts: 2, time_taken_seconds: 600, questions_skipped: 0, hints_requested: 3, repeated_mistakes: 4, date: '2026-09-09T10:00:00Z' },
      { quiz_id: 'Q021', subject: 'Mathematics', topic: 'Algebra', subtopic: 'Linear Equations', total_questions: 5, correct: 2, incorrect: 3, score_percentage: 40, attempts: 3, time_taken_seconds: 700, questions_skipped: 0, hints_requested: 4, repeated_mistakes: 5, date: '2026-09-10T10:00:00Z' },
    ],
    ai_questions: [
      { question: 'How do I solve for x in 2x + 5 = 13?', subject: 'Mathematics', topic: 'Algebra', lesson_context: 'Linear Equations', help_type: 'explanation', date: '2026-09-10T09:30:00Z' },
      { question: 'What does it mean to balance an equation?', subject: 'Mathematics', topic: 'Algebra', lesson_context: 'Linear Equations', help_type: 'clarification', date: '2026-09-10T09:45:00Z' },
      { question: 'Can you show me another example?', subject: 'Mathematics', topic: 'Algebra', lesson_context: 'Linear Equations', help_type: 'example', date: '2026-09-10T10:00:00Z' },
    ],
    peer_competitions: [],
    confidence_data: [
      { topic: 'Algebra', subject: 'Mathematics', confidence_rating: 2, associated_quiz_score: 40, date: '2026-09-11T09:00:00Z' },
    ],
    adaptive_learning: { difficulty_served: 'medium', difficulty_changes: 0, recommended_revisions: ['Linear Equations'], topics_revisited: ['Algebra'], formats_used: ['text'], languages_used: ['English'], interests_used: [] },
  };
}

function makeAnanyaReport(): AccumulReportSchema {
  return {
    report_version: '1.0',
    generated_at: '2026-09-11T10:00:00.000Z',
    student: {
      student_id: 'STU-ANANYA-004',
      full_name: 'Ananya Singh',
      class: '8',
      school: 'Delhi Public School',
      preferred_language: 'English',
      interests: ['literature', 'drama', 'writing'],
    },
    learning_activities: [
      { lesson_id: 'L030', title: 'Reading Comprehension Strategies', subject: 'English', topic: 'Reading Comprehension', difficulty: 'medium', format: 'text', language: 'English', completed: true, partially_completed: false, skipped: false, time_spent_seconds: 900, date: '2026-09-09T09:00:00Z' },
    ],
    quizzes: [
      { quiz_id: 'Q030', subject: 'English', topic: 'Reading Comprehension', subtopic: 'Inference', total_questions: 8, correct: 4, incorrect: 4, score_percentage: 50, attempts: 1, time_taken_seconds: 600, questions_skipped: 0, hints_requested: 0, repeated_mistakes: 2, date: '2026-09-09T10:00:00Z' },
      { quiz_id: 'Q031', subject: 'English', topic: 'Reading Comprehension', subtopic: 'Main Idea', total_questions: 6, correct: 2, incorrect: 4, score_percentage: 33, attempts: 2, time_taken_seconds: 540, questions_skipped: 0, hints_requested: 1, repeated_mistakes: 3, date: '2026-09-10T10:00:00Z' },
    ],
    ai_questions: [],
    peer_competitions: [],
    confidence_data: [
      { topic: 'Reading Comprehension', subject: 'English', confidence_rating: 5, associated_quiz_score: 42, date: '2026-09-11T09:00:00Z' },
    ],
    adaptive_learning: { difficulty_served: 'medium', difficulty_changes: 0, recommended_revisions: ['Inference Skills'], topics_revisited: [], formats_used: ['text'], languages_used: ['English'], interests_used: ['literature'] },
  };
}

function makeRaviReport(): AccumulReportSchema {
  return {
    report_version: '1.0',
    generated_at: '2026-09-11T10:00:00.000Z',
    student: {
      student_id: 'STU-RAVI-005',
      full_name: 'Ravi Kumar',
      class: '9',
      school: 'Delhi Public School',
      preferred_language: 'Hindi',
      interests: ['gaming', 'robotics'],
    },
    learning_activities: [
      { lesson_id: 'L040', title: 'Polynomials', subject: 'Mathematics', topic: 'Polynomials', difficulty: 'hard', format: 'text', language: 'Hindi', completed: false, partially_completed: true, skipped: false, time_spent_seconds: 300, date: '2026-09-09T09:00:00Z' },
      { lesson_id: 'L041', title: 'Chemical Reactions', subject: 'Science', topic: 'Chemistry', difficulty: 'medium', format: 'text', language: 'Hindi', completed: false, partially_completed: false, skipped: true, time_spent_seconds: 0, date: '2026-09-10T09:00:00Z' },
      { lesson_id: 'L042', title: 'Acids and Bases', subject: 'Science', topic: 'Chemistry', difficulty: 'medium', format: 'text', language: 'Hindi', completed: false, partially_completed: false, skipped: true, time_spent_seconds: 0, date: '2026-09-10T10:00:00Z' },
    ],
    quizzes: [
      { quiz_id: 'Q040', subject: 'Mathematics', topic: 'Polynomials', subtopic: 'Degree', total_questions: 5, correct: 2, incorrect: 3, score_percentage: 40, attempts: 2, time_taken_seconds: 600, questions_skipped: 0, hints_requested: 3, repeated_mistakes: 4, date: '2026-09-09T10:00:00Z' },
      { quiz_id: 'Q041', subject: 'Science', topic: 'Chemistry', subtopic: 'Chemical Reactions', total_questions: 5, correct: 1, incorrect: 4, score_percentage: 20, attempts: 2, time_taken_seconds: 700, questions_skipped: 0, hints_requested: 2, repeated_mistakes: 5, date: '2026-09-10T11:00:00Z' },
      { quiz_id: 'Q042', subject: 'Science', topic: 'Chemistry', subtopic: 'Acids and Bases', total_questions: 4, correct: 1, incorrect: 3, score_percentage: 25, attempts: 1, time_taken_seconds: 500, questions_skipped: 0, hints_requested: 2, repeated_mistakes: 3, date: '2026-09-11T09:00:00Z' },
    ],
    ai_questions: [],
    peer_competitions: [],
    confidence_data: [
      { topic: 'Chemistry', subject: 'Science', confidence_rating: 2, associated_quiz_score: 22, date: '2026-09-11T09:00:00Z' },
    ],
    adaptive_learning: { difficulty_served: 'hard', difficulty_changes: 2, recommended_revisions: ['Polynomials', 'Chemical Reactions', 'Acids and Bases'], topics_revisited: ['Polynomials'], formats_used: ['text'], languages_used: ['Hindi'], interests_used: [] },
  };
}

function makeMeeraReport(): AccumulReportSchema {
  // Same fractions weakness as Rahul — triggers class-wide signal
  return {
    report_version: '1.0',
    generated_at: '2026-09-12T10:00:00.000Z',
    student: {
      student_id: 'STU-MEERA-006',
      full_name: 'Meera Patel',
      class: '8',
      school: 'Delhi Public School',
      preferred_language: 'English',
      interests: ['dance', 'art', 'cooking'],
    },
    learning_activities: [
      { lesson_id: 'L050', title: 'Meaning of Fractions', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Meaning', difficulty: 'easy', format: 'text', language: 'English', completed: true, partially_completed: false, skipped: false, time_spent_seconds: 700, date: '2026-09-10T09:00:00Z' },
      { lesson_id: 'L051', title: 'Comparing Fractions', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Comparing Fractions', difficulty: 'medium', format: 'text', language: 'English', completed: false, partially_completed: true, skipped: false, time_spent_seconds: 350, date: '2026-09-11T09:00:00Z' },
    ],
    quizzes: [
      { quiz_id: 'Q050', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Meaning', total_questions: 3, correct: 3, incorrect: 0, score_percentage: 100, attempts: 1, time_taken_seconds: 200, questions_skipped: 0, hints_requested: 0, repeated_mistakes: 0, date: '2026-09-10T10:00:00Z' },
      { quiz_id: 'Q051', subject: 'Mathematics', topic: 'Fractions', subtopic: 'Comparing Fractions', total_questions: 4, correct: 1, incorrect: 3, score_percentage: 25, attempts: 2, time_taken_seconds: 480, questions_skipped: 0, hints_requested: 2, repeated_mistakes: 3, date: '2026-09-11T10:00:00Z' },
    ],
    ai_questions: [
      { question: 'Which is bigger — 3/4 or 5/6?', subject: 'Mathematics', topic: 'Fractions', lesson_context: 'Comparing Fractions', help_type: 'explanation', date: '2026-09-11T09:00:00Z' },
    ],
    peer_competitions: [],
    confidence_data: [
      { topic: 'Fractions', subject: 'Mathematics', confidence_rating: 3, associated_quiz_score: 50, date: '2026-09-12T09:00:00Z' },
    ],
    adaptive_learning: { difficulty_served: 'medium', difficulty_changes: 0, recommended_revisions: ['Comparing Fractions'], topics_revisited: [], formats_used: ['text'], languages_used: ['English'], interests_used: ['art'] },
  };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

async function importDemoReport(report: AccumulReportSchema, facilitatorId: string): Promise<void> {
  const rawJson = JSON.stringify(report);
  const validation = validateReport(rawJson);
  if (!validation.valid) throw new Error('Demo report invalid: ' + validation.errors.join(', '));

  const now = new Date().toISOString();
  const reportDbId = uuidv4();
  const parsed = parseReport(report, reportDbId);

  // Upsert student
  let studentDbId: string;
  const existing = dbManager.get<{ id: string }>('SELECT id FROM students WHERE student_id = ?', [report.student.student_id]);

  if (existing) {
    studentDbId = existing.id;
    dbManager.run(
      'UPDATE students SET full_name=?, class=?, school=?, preferred_language=?, interests=?, updated_at=? WHERE id=?',
      [parsed.student.full_name, parsed.student.class, parsed.student.school, parsed.student.preferred_language,
       JSON.stringify(parsed.student.interests || []), now, studentDbId]
    );
  } else {
    studentDbId = parsed.student.id;
    dbManager.run(
      'INSERT INTO students (id, student_id, full_name, class, school, preferred_language, interests, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)',
      [studentDbId, report.student.student_id, parsed.student.full_name, parsed.student.class,
       parsed.student.school, parsed.student.preferred_language,
       JSON.stringify(parsed.student.interests || []), now, now]
    );
  }

  // Check duplicate report
  const dupReport = dbManager.get('SELECT id FROM student_reports WHERE student_id = ? AND report_date = ?', [studentDbId, report.generated_at]);
  if (dupReport) return; // Skip if already loaded

  // Fix student_ids
  const allActivities = [...parsed.lessons, ...parsed.quizzes, ...parsed.aiQuestions, ...parsed.peerCompetitions];
  for (const act of allActivities) act.student_id = studentDbId;

  // Insert report
  dbManager.run(
    'INSERT INTO student_reports (id, student_id, report_version, report_date, raw_json, imported_at, imported_by, is_demo) VALUES (?,?,?,?,?,?,?,?)',
    [reportDbId, studentDbId, report.report_version, report.generated_at, rawJson, now, facilitatorId, 1]
  );

  // Insert activities
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

  // Deactivate old signals, re-analyze
  dbManager.run('UPDATE learning_signals SET status=? WHERE student_id=? AND status=?', ['monitoring', studentDbId, 'active']);

  const dbActivities = dbManager.all<LearningActivity>('SELECT * FROM learning_activities WHERE student_id = ?', [studentDbId]);
  const rawSignals = learningSignalEngine.analyze(dbActivities, parsed.student.full_name);

  for (const sig of rawSignals) {
    dbManager.run(
      `INSERT INTO learning_signals (id, student_id, report_id, signal_type, subject, topic, subtopic, severity, evidence, confidence_score, recommended_action, status, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [uuidv4(), studentDbId, reportDbId, sig.signal_type, sig.subject ?? null, sig.topic ?? null,
       sig.subtopic ?? null, sig.severity, JSON.stringify(sig.evidence), sig.confidence_score,
       sig.recommended_action, 'active', now, now]
    );
  }
}

// POST /api/demo/load
router.post('/load', authenticate, async (req: any, res) => {
  try {
    const reports = [
      makeRahulReport(),
      makePriyaReport(),
      makeArjunReport(),
      makeAnanyaReport(),
      makeRaviReport(),
      makeMeeraReport(),
    ];

    const loaded: string[] = [];
    for (const report of reports) {
      await importDemoReport(report, req.facilitatorId);
      loaded.push(report.student.full_name);
    }

    res.json({
      message: 'Demo data loaded successfully',
      students_loaded: loaded,
      note: 'Demo data is clearly marked and separate from real student reports.',
    });
  } catch (err: any) {
    console.error('[DEMO] Load error:', err.message, err.stack);
    res.status(500).json({ message: 'Failed to load demo data: ' + err.message });
  }
});

// DELETE /api/demo/clear
router.delete('/clear', authenticate, (_req, res) => {
  try {
    // Get demo report ids
    const demoReports = dbManager.all<{ id: string; student_id: string }>('SELECT id, student_id FROM student_reports WHERE is_demo = 1');
    const demoReportIds = demoReports.map((r) => r.id);
    const demoStudentIds = [...new Set(demoReports.map((r) => r.student_id))];

    for (const rid of demoReportIds) {
      dbManager.run('DELETE FROM learning_activities WHERE report_id = ?', [rid]);
    }
    for (const sid of demoStudentIds) {
      dbManager.run('DELETE FROM learning_signals WHERE student_id = ?', [sid]);
      dbManager.run('DELETE FROM interventions WHERE student_id = ?', [sid]);
      dbManager.run('DELETE FROM reassessments WHERE student_id = ?', [sid]);
    }
    dbManager.run('DELETE FROM student_reports WHERE is_demo = 1');
    for (const sid of demoStudentIds) {
      const remaining = dbManager.get('SELECT id FROM student_reports WHERE student_id = ?', [sid]);
      if (!remaining) dbManager.run('DELETE FROM students WHERE id = ?', [sid]);
    }

    res.json({ message: 'Demo data cleared' });
  } catch (err: any) {
    console.error('[DEMO] Clear error:', err.message);
    res.status(500).json({ message: 'Failed to clear demo data: ' + err.message });
  }
});

// GET /api/demo/rahul-report-1 — download the first Rahul report as JSON
router.get('/rahul-report-1', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="rahul-report-1.json"');
  res.send(JSON.stringify(makeRahulReport(), null, 2));
});

// GET /api/demo/rahul-report-2 — download the second Rahul report as JSON
router.get('/rahul-report-2', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="rahul-report-2.json"');
  res.send(JSON.stringify(makeRahulReport2(), null, 2));
});
