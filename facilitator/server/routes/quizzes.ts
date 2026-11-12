import express from 'express';
import dbManager from '../db/database.js';
import quizGenerationService from '../services/quizGenerationService.js';
import quizEvaluationService from '../services/quizEvaluationService.js';

export const router = express.Router();

// ─── POST /api/quizzes/generate ─────────────────────────────────────────────
router.post('/generate', async (req: any, res) => {
  try {
    const {
      textbook_id,
      class_grade = '7',
      subject = 'Science',
      chapter,
      topic,
      difficulty = 'Medium',
      question_count = 5,
      language = 'English',
      question_types = ['MCQ'],
    } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ message: 'Topic is required to generate a quiz.' });
    }

    const quiz = await quizGenerationService.generateQuiz({
      textbook_id,
      class_grade: String(class_grade).trim(),
      subject: subject.trim(),
      chapter: chapter?.trim(),
      topic: topic.trim(),
      difficulty,
      question_count: parseInt(String(question_count), 10) || 5,
      language,
      question_types,
      created_by: req.facilitatorId || undefined,
    });

    // Strip answers and explanations so students cannot cheat before submission
    const sanitizedQuestions = (quiz.questions || []).map((q) => ({
      id: q.id,
      quiz_id: q.quiz_id,
      question_number: q.question_number,
      question_type: q.question_type,
      question_text: q.question_text,
      options: q.options,
      chapter: q.chapter,
      topic: q.topic,
      page_reference: q.page_reference,
    }));

    return res.status(201).json({
      ...quiz,
      questions: sanitizedQuestions,
    });
  } catch (err: any) {
    console.error('[Quizzes] Generate error:', err.message);
    return res.status(500).json({ message: err.message || 'Failed to generate quiz.' });
  }
});

// ─── GET /api/quizzes ───────────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const { class_grade, subject, topic } = req.query;
    let sql = 'SELECT * FROM generated_quizzes WHERE status = ?';
    const params: any[] = ['active'];

    if (class_grade) {
      sql += ' AND class_grade = ?';
      params.push(class_grade);
    }
    if (subject) {
      sql += ' AND subject LIKE ?';
      params.push(`%${subject}%`);
    }
    if (topic) {
      sql += ' AND topic LIKE ?';
      params.push(`%${topic}%`);
    }

    sql += ' ORDER BY created_at DESC LIMIT 20';
    const quizzes = dbManager.all<any>(sql, params);
    return res.json(quizzes);
  } catch (err: any) {
    console.error('[Quizzes] List error:', err.message);
    return res.status(500).json({ message: 'Failed to list quizzes.' });
  }
});

// ─── GET /api/quizzes/:id ───────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  try {
    const quiz = dbManager.get<any>('SELECT * FROM generated_quizzes WHERE id = ?', [req.params.id]);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    const rawQuestions = dbManager.all<any>(
      'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY question_number ASC',
      [quiz.id]
    );

    // Sanitize question options (do not expose correct_answer or explanation)
    const questions = rawQuestions.map((q) => {
      let options = [];
      try {
        options = JSON.parse(q.options || '[]');
      } catch {
        options = [];
      }
      return {
        id: q.id,
        quiz_id: q.quiz_id,
        question_number: q.question_number,
        question_type: q.question_type,
        question_text: q.question_text,
        options,
        chapter: q.chapter,
        topic: q.topic,
        page_reference: q.page_reference,
      };
    });

    return res.json({
      ...quiz,
      questions,
    });
  } catch (err: any) {
    console.error('[Quizzes] Detail error:', err.message);
    return res.status(500).json({ message: 'Failed to fetch quiz.' });
  }
});

// ─── POST /api/quizzes/:id/submit ───────────────────────────────────────────
router.post('/:id/submit', async (req, res) => {
  try {
    const { student_id, answers, time_taken_seconds = 0 } = req.body;
    if (!student_id) {
      return res.status(400).json({ message: 'student_id is required.' });
    }
    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'answers array is required.' });
    }

    const result = await quizEvaluationService.evaluateSubmission({
      student_id,
      quiz_id: req.params.id,
      answers,
      time_taken_seconds,
    });

    return res.json(result);
  } catch (err: any) {
    console.error('[Quizzes] Submit error:', err.message);
    return res.status(500).json({ message: err.message || 'Failed to submit quiz.' });
  }
});

// ─── GET /api/quizzes/student/:studentId/attempts ───────────────────────────
router.get('/student/:studentId/attempts', (req, res) => {
  try {
    const attempts = dbManager.all<any>(
      'SELECT * FROM quiz_attempts WHERE student_id = ? ORDER BY submitted_at DESC',
      [req.params.studentId]
    );
    return res.json(attempts);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch student attempts.' });
  }
});

// ─── GET /api/quizzes/student/:studentId/mastery ────────────────────────────
router.get('/student/:studentId/mastery', (req, res) => {
  try {
    const mastery = dbManager.all<any>(
      'SELECT * FROM topic_mastery WHERE student_id = ? ORDER BY mastery_score ASC',
      [req.params.studentId]
    );
    return res.json(mastery);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch student topic mastery.' });
  }
});

