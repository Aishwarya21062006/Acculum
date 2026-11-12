import { v4 as uuidv4 } from 'uuid';
import dbManager from '../db/database.js';
import { QuizAttempt, QuizResponse, TopicMastery } from '../types.js';
import supabaseService from './supabaseService.js';

export interface SubmitQuizPayload {
  student_id: string;
  quiz_id: string;
  answers: {
    question_id: string;
    student_answer: string;
  }[];
  time_taken_seconds?: number;
}

export interface QuizEvaluationResult {
  attempt: QuizAttempt;
  responses: QuizResponse[];
  mastery: TopicMastery;
  intervention_recommended?: {
    recommended: boolean;
    reason: string;
    suggested_action: string;
    intervention_id?: string;
  };
}

class QuizEvaluationService {
  /**
   * Evaluates a quiz attempt, persists answers, updates topic mastery,
   * and integrates directly with Acculum's adaptive learning and intervention engine.
   */
  async evaluateSubmission(payload: SubmitQuizPayload): Promise<QuizEvaluationResult> {
    const { student_id, quiz_id, answers, time_taken_seconds = 0 } = payload;

    // 1. Fetch Quiz and Questions
    const quiz = dbManager.get<any>('SELECT * FROM generated_quizzes WHERE id = ?', [quiz_id]);
    if (!quiz) throw new Error('Quiz not found.');

    const questions = dbManager.all<any>(
      'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY question_number ASC',
      [quiz_id]
    );
    if (questions.length === 0) throw new Error('Quiz contains no questions.');

    const student = dbManager.get<any>('SELECT * FROM students WHERE id = ?', [student_id]) || {
      id: student_id,
      full_name: 'Student',
      class: quiz.class_grade,
    };

    // 2. Evaluate each question
    const attemptId = uuidv4();
    const now = new Date().toISOString();
    let scoreNumerator = 0;
    const scoreDenominator = questions.length;
    const responses: QuizResponse[] = [];
    const questionMap = new Map<string, any>(questions.map((q) => [q.id, q]));

    for (const ans of answers) {
      const q = questionMap.get(ans.question_id);
      if (!q) continue;

      const studentAnsClean = (ans.student_answer || '').trim().toLowerCase();
      const correctAnsClean = (q.correct_answer || '').trim().toLowerCase();
      const isCorrect = studentAnsClean === correctAnsClean;

      if (isCorrect) scoreNumerator++;

      const respId = uuidv4();
      dbManager.run(
        `INSERT INTO quiz_responses (id, attempt_id, question_id, student_answer, is_correct, correct_answer, explanation, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          respId,
          attemptId,
          q.id,
          ans.student_answer,
          isCorrect ? 1 : 0,
          q.correct_answer,
          q.explanation,
          now,
        ]
      );

      responses.push({
        id: respId,
        attempt_id: attemptId,
        question_id: q.id,
        student_answer: ans.student_answer,
        is_correct: isCorrect,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        created_at: now,
      });
    }

    const scorePct = parseFloat(((scoreNumerator / scoreDenominator) * 100).toFixed(1));

    // 3. Save Quiz Attempt
    dbManager.run(
      `INSERT INTO quiz_attempts (
        id, quiz_id, student_id, textbook_id, chapter, topic, difficulty,
        score_numerator, score_denominator, score_percentage, time_taken_seconds, submitted_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        attemptId,
        quiz_id,
        student_id,
        quiz.textbook_id || null,
        quiz.chapter || null,
        quiz.topic,
        quiz.difficulty,
        scoreNumerator,
        scoreDenominator,
        scorePct,
        time_taken_seconds,
        now,
        now,
      ]
    );

    const attempt: QuizAttempt = {
      id: attemptId,
      quiz_id,
      student_id,
      textbook_id: quiz.textbook_id,
      chapter: quiz.chapter,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      score_numerator: scoreNumerator,
      score_denominator: scoreDenominator,
      score_percentage: scorePct,
      time_taken_seconds,
      submitted_at: now,
      created_at: now,
      student_name: student.full_name,
      responses,
    };

    // 4. Record into existing Acculum learning_activities table
    const activityId = uuidv4();
    dbManager.run(
      `INSERT INTO learning_activities (
        id, report_id, student_id, activity_type, subject, topic, subtopic,
        difficulty, language, score_numerator, score_denominator, time_spent_seconds,
        completed, attempts, repeated_mistakes, activity_date, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        activityId,
        'quiz-session-' + attemptId.slice(0, 8),
        student_id,
        'quiz',
        quiz.subject,
        quiz.topic,
        quiz.chapter || null,
        quiz.difficulty,
        quiz.language,
        scoreNumerator,
        scoreDenominator,
        time_taken_seconds,
        1,
        1,
        scoreDenominator - scoreNumerator > 2 ? 2 : 0,
        now,
        now,
      ]
    );

    // 5. Update Topic Mastery
    const existingMastery = dbManager.get<any>(
      'SELECT * FROM topic_mastery WHERE student_id = ? AND subject = ? AND topic = ?',
      [student_id, quiz.subject, quiz.topic]
    );

    let newAttempts = 1;
    let newScore = scorePct;
    if (existingMastery) {
      newAttempts = (existingMastery.total_attempts || 1) + 1;
      // Exponential moving average (40% previous, 60% latest attempt)
      newScore = parseFloat((existingMastery.mastery_score * 0.4 + scorePct * 0.6).toFixed(1));
    }

    const masteryLevel: 'Low' | 'Medium' | 'High' =
      newScore >= 75 ? 'High' : newScore >= 50 ? 'Medium' : 'Low';

    if (existingMastery) {
      dbManager.run(
        `UPDATE topic_mastery SET
          mastery_level = ?, mastery_score = ?, total_attempts = ?, last_attempt_date = ?, updated_at = ?
         WHERE id = ?`,
        [masteryLevel, newScore, newAttempts, now, now, existingMastery.id]
      );
    } else {
      dbManager.run(
        `INSERT INTO topic_mastery (
          id, student_id, subject, topic, mastery_level, mastery_score, total_attempts, last_attempt_date, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), student_id, quiz.subject, quiz.topic, masteryLevel, newScore, newAttempts, now, now, now]
      );
    }

    const mastery: TopicMastery = {
      id: existingMastery?.id || uuidv4(),
      student_id,
      subject: quiz.subject,
      topic: quiz.topic,
      mastery_level: masteryLevel,
      mastery_score: newScore,
      total_attempts: newAttempts,
      last_attempt_date: now,
      created_at: now,
      updated_at: now,
    };

    // 6. Connect to Acculum Learning Signals & Interventions
    let interventionRecommended: QuizEvaluationResult['intervention_recommended'];

    if (scorePct < 60 || masteryLevel === 'Low') {
      const signalId = uuidv4();
      const severity = scorePct < 40 ? 'high' : 'medium';
      const evidence = [
        `Quiz score: ${scoreNumerator}/${scoreDenominator} (${scorePct}%) on ${quiz.topic}`,
        `Current mastery level: ${masteryLevel} (${newScore}%) after ${newAttempts} attempt(s)`,
      ];

      // Emit Learning Signal into learning_signals table
      dbManager.run(
        `INSERT INTO learning_signals (
          id, student_id, report_id, signal_type, subject, topic, subtopic,
          severity, evidence, confidence_score, recommended_action, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          signalId,
          student_id,
          'quiz-eval-' + attemptId.slice(0, 8),
          'PERFORMANCE_SIGNAL',
          quiz.subject,
          quiz.topic,
          quiz.chapter || null,
          severity,
          JSON.stringify(evidence),
          0.9,
          `Provide a simplified explanation with worked examples for ${quiz.topic}, followed by 5 easier practice questions and reassessment.`,
          'active',
          now,
          now,
        ]
      );

      // Auto-create or recommend intervention
      const interventionId = uuidv4();
      const facilitator = dbManager.get<any>('SELECT id FROM facilitators LIMIT 1');
      const facilitatorId = facilitator?.id || 'FAC-DEFAULT-001';

      dbManager.run(
        `INSERT INTO interventions (
          id, student_id, signal_id, facilitator_id, intervention_type, subject,
          topic, subtopic, language, format, difficulty, notes, status, assigned_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          interventionId,
          student_id,
          signalId,
          facilitatorId,
          'remedial',
          quiz.subject,
          quiz.topic,
          quiz.chapter || null,
          quiz.language || 'English',
          'Visual & Guided Practice',
          'Easier Practice Level',
          `Adaptive Remediation: Student scored ${scorePct}% on ${quiz.topic}. Recommend worked examples and follow-up reassessment.`,
          'assigned',
          now,
          now,
        ]
      );

      // Facilitator Notification
      dbManager.run(
        `INSERT INTO notifications (id, facilitator_id, type, title, message, student_id, read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          facilitatorId,
          'adaptive_intervention_triggered',
          `Intervention recommended for ${student.full_name}`,
          `${student.full_name} scored ${scoreNumerator}/${scoreDenominator} (${scorePct}%) in ${quiz.topic}. Remedial practice assigned.`,
          student_id,
          0,
          now,
        ]
      );

      interventionRecommended = {
        recommended: true,
        reason: `Score of ${scoreNumerator}/${scoreDenominator} (${scorePct}%) indicates conceptual gaps in ${quiz.topic}.`,
        suggested_action: 'Generate simpler explanation, provide worked example, and complete 5 remedial practice questions.',
        intervention_id: interventionId,
      };
    }

    return {
      attempt,
      responses,
      mastery,
      intervention_recommended: interventionRecommended,
    };
  }
}

export const quizEvaluationService = new QuizEvaluationService();
export default quizEvaluationService;

