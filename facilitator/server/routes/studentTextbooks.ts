import express from 'express';
import dbManager from '../db/database.js';
import { authenticate } from './auth.js';
import ragService from '../services/ragService.js';

export const router = express.Router();

// ─── GET /api/student/textbooks ─────────────────────────────────────────────
// Returns assigned textbooks for students (filtered by class_grade if specified, or all assigned)
router.get('/', (req, res) => {
  try {
    const classGrade = (req.query.class_grade as string) || '7';

    // Find textbooks assigned to this class grade
    const textbooks = dbManager.all<any>(`
      SELECT t.*,
        (SELECT COUNT(DISTINCT chapter_name) FROM textbook_topics WHERE textbook_id = t.id) as chapter_count,
        (SELECT COUNT(*) FROM textbook_topics WHERE textbook_id = t.id) as topic_count
      FROM textbooks t
      WHERE t.id IN (
        SELECT textbook_id FROM textbook_assignments WHERE class_grade = ?
      ) OR t.class_grade = ?
      ORDER BY t.created_at DESC
    `, [classGrade, classGrade]);

    return res.json(textbooks);
  } catch (err: any) {
    console.error('[StudentTextbooks] List error:', err.message);
    return res.status(500).json({ message: 'Failed to fetch student textbooks.' });
  }
});

// ─── GET /api/student/textbooks/:id ─────────────────────────────────────────
// Returns textbook with its chapters and topics
router.get('/:id', (req, res) => {
  try {
    const textbook = dbManager.get<any>('SELECT * FROM textbooks WHERE id = ?', [req.params.id]);
    if (!textbook) {
      return res.status(404).json({ message: 'Textbook not found.' });
    }

    const topics = dbManager.all<any>(
      'SELECT * FROM textbook_topics WHERE textbook_id = ? AND published = 1 ORDER BY order_index ASC',
      [textbook.id]
    ).map((t) => {
      try {
        t.subtopics = JSON.parse(t.subtopics || '[]');
      } catch {
        t.subtopics = [];
      }
      return t;
    });

    // Group by chapters for clean tree view
    const chaptersMap: Record<string, { chapter_name: string; chapter_number?: number; topics: any[] }> = {};
    for (const top of topics) {
      const cName = top.chapter_name || 'General';
      if (!chaptersMap[cName]) {
        chaptersMap[cName] = {
          chapter_name: cName,
          chapter_number: top.chapter_number,
          topics: [],
        };
      }
      chaptersMap[cName].topics.push(top);
    }

    return res.json({
      ...textbook,
      topics,
      chapters: Object.values(chaptersMap),
    });
  } catch (err: any) {
    console.error('[StudentTextbooks] Detail error:', err.message);
    return res.status(500).json({ message: 'Failed to fetch textbook details.' });
  }
});

// ─── POST /api/student/textbooks/:id/explain ────────────────────────────────
// RAG Q&A: Student asks a question about textbook content
router.post('/:id/explain', async (req, res) => {
  try {
    const { question, topic, chapter } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question is required.' });
    }

    const textbook = dbManager.get<any>('SELECT * FROM textbooks WHERE id = ?', [req.params.id]);
    if (!textbook) {
      return res.status(404).json({ message: 'Textbook not found.' });
    }

    const result = await ragService.explainConcept(question.trim(), {
      textbookId: textbook.id,
      topic,
      chapter,
      classGrade: textbook.class_grade,
      subject: textbook.subject,
    });

    return res.json(result);
  } catch (err: any) {
    console.error('[StudentTextbooks] Explain error:', err.message);
    return res.status(500).json({ message: err.message || 'Failed to explain concept.' });
  }
});

