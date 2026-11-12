import express from 'express';
import dbManager from '../db/database.js';
import { authenticate } from './auth.js';

export const router = express.Router();

// ─── GET /api/analytics/textbook ────────────────────────────────────────────
// Comprehensive textbook mastery, quiz analytics, and difficulty insights
router.get('/', authenticate, (req, res) => {
  try {
    const classGrade = (req.query.class_grade as string) || '7';

    // 1. Most difficult topics & average quiz scores by topic
    const topicStats = dbManager.all<any>(`
      SELECT
        qa.topic,
        qa.chapter,
        COUNT(qa.id) as total_attempts,
        ROUND(AVG(qa.score_percentage), 1) as avg_score,
        MIN(qa.score_percentage) as min_score,
        MAX(qa.score_percentage) as max_score,
        COUNT(CASE WHEN qa.score_percentage < 50 THEN 1 END) as low_score_count
      FROM quiz_attempts qa
      GROUP BY qa.topic, qa.chapter
      ORDER BY avg_score ASC
    `);

    // 2. Topic mastery distribution across students (High, Medium, Low)
    const masteryDist = dbManager.all<any>(`
      SELECT
        mastery_level,
        COUNT(*) as count
      FROM topic_mastery
      GROUP BY mastery_level
    `);

    // 3. Chapter-wise performance
    const chapterStats = dbManager.all<any>(`
      SELECT
        COALESCE(qa.chapter, 'General') as chapter,
        COUNT(qa.id) as attempts_count,
        ROUND(AVG(qa.score_percentage), 1) as avg_chapter_score
      FROM quiz_attempts qa
      GROUP BY qa.chapter
      ORDER BY avg_chapter_score ASC
    `);

    // 4. Weak topics with high student distress
    const weakTopics = topicStats.filter((t) => t.avg_score < 60 || t.low_score_count >= 2);

    // 5. Recent Quiz Attempts
    const recentAttempts = dbManager.all<any>(`
      SELECT
        qa.*,
        s.full_name as student_name,
        s.class as student_class
      FROM quiz_attempts qa
      LEFT JOIN students s ON s.id = qa.student_id
      ORDER BY qa.submitted_at DESC
      LIMIT 10
    `);

    // 6. Remediation & Reassessment recommendations
    const activeInterventions = dbManager.all<any>(`
      SELECT
        i.*,
        s.full_name as student_name,
        s.class as student_class
      FROM interventions i
      JOIN students s ON s.id = i.student_id
      WHERE i.status = 'assigned'
      ORDER BY i.assigned_at DESC
      LIMIT 6
    `);

    return res.json({
      class_grade: classGrade,
      topic_statistics: topicStats,
      weak_topics: weakTopics,
      chapter_statistics: chapterStats,
      mastery_distribution: masteryDist,
      recent_attempts: recentAttempts,
      active_interventions: activeInterventions,
    });
  } catch (err: any) {
    console.error('[TextbookAnalytics] Error:', err.message);
    return res.status(500).json({ message: 'Failed to compute textbook analytics.' });
  }
});

