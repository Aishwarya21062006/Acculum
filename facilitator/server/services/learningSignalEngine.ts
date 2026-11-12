import { LearningActivity, RawSignal } from '../types.js';

interface QuizGroup {
  subject: string;
  topic: string;
  subtopic?: string;
  quizzes: LearningActivity[];
  totalCorrect: number;
  totalQuestions: number;
  totalHints: number;
  totalRepeatedMistakes: number;
  avgConfidence?: number;
  attempts: number;
}

export class LearningSignalEngine {
  analyze(
    activities: LearningActivity[],
    studentName: string
  ): RawSignal[] {
    const signals: RawSignal[] = [];
    const quizActivities = activities.filter((a) => a.activity_type === 'quiz');
    const lessonActivities = activities.filter((a) => a.activity_type === 'lesson');
    const aiActivities = activities.filter((a) => a.activity_type === 'ai_question');

    const quizGroups = this.groupQuizzesByTopic(quizActivities);

    // Signal 1: PERFORMANCE_SIGNAL
    for (const [, group] of quizGroups) {
      if (group.totalQuestions === 0) continue;
      const pct = (group.totalCorrect / group.totalQuestions) * 100;
      if (pct < 65) {
        const severity = pct < 40 ? 'high' : 'medium';
        const evidence: string[] = [];
        for (const q of group.quizzes) {
          if (q.score_numerator !== undefined && q.score_denominator) {
            const qPct = Math.round((q.score_numerator / q.score_denominator) * 100);
            evidence.push(`Quiz score: ${q.score_numerator}/${q.score_denominator} (${qPct}%)`);
          }
        }
        evidence.push(`Overall topic score: ${group.totalCorrect}/${group.totalQuestions} (${Math.round(pct)}%)`);

        signals.push({
          signal_type: 'PERFORMANCE_SIGNAL',
          subject: group.subject,
          topic: group.topic,
          subtopic: group.subtopic,
          severity,
          evidence,
          confidence_score: 0.85,
          recommended_action: `Assign targeted revision for ${group.topic} in ${group.subject}. Consider using visual or interactive formats to reinforce conceptual understanding.`,
        });
      }
    }

    // Signal 2: REPEATED_ERROR_SIGNAL
    for (const [, group] of quizGroups) {
      const totalRepeated = group.totalRepeatedMistakes;
      if (totalRepeated >= 2) {
        const evidence: string[] = [
          `${totalRepeated} repeated incorrect attempts recorded in ${group.topic}`,
        ];
        // Look for subtopics with repeated mistakes
        for (const q of group.quizzes) {
          if ((q.repeated_mistakes || 0) > 0) {
            evidence.push(`Repeated errors detected: ${q.repeated_mistakes} time(s)`);
          }
        }
        signals.push({
          signal_type: 'REPEATED_ERROR_SIGNAL',
          subject: group.subject,
          topic: group.topic,
          subtopic: group.subtopic,
          severity: totalRepeated >= 4 ? 'high' : 'medium',
          evidence,
          confidence_score: 0.9,
          recommended_action: `Review the specific concepts within ${group.topic} where errors are recurring. A guided practice session focusing on the repeated mistakes may help.`,
        });
      }
    }

    // Signal 3: CONFIDENCE_PERFORMANCE_SIGNAL
    for (const [, group] of quizGroups) {
      if (group.totalQuestions === 0) continue;
      const pct = (group.totalCorrect / group.totalQuestions) * 100;
      const hasHighConfidence = group.avgConfidence !== undefined && group.avgConfidence >= 4;
      if (hasHighConfidence && pct < 60) {
        signals.push({
          signal_type: 'CONFIDENCE_PERFORMANCE_SIGNAL',
          subject: group.subject,
          topic: group.topic,
          subtopic: group.subtopic,
          severity: 'medium',
          evidence: [
            `Confidence rating: ${group.avgConfidence}/5`,
            `Quiz performance: ${group.totalCorrect}/${group.totalQuestions} (${Math.round(pct)}%)`,
            'Confidence is higher than recent performance — conceptual understanding may need checking.',
          ],
          confidence_score: 0.8,
          recommended_action: `Engage the student in a targeted discussion or activity to check conceptual understanding of ${group.topic}. The student may benefit from worked examples or guided practice.`,
        });
      }
    }

    // Signal 4: ENGAGEMENT_SIGNAL
    const skippedLessons = lessonActivities.filter((l) => {
      const extra = l.extra_data ? JSON.parse(l.extra_data) : {};
      return extra.skipped === true;
    });
    const incompleteLessons = lessonActivities.filter((l) => {
      const extra = l.extra_data ? JSON.parse(l.extra_data) : {};
      return extra.partially_completed === true && !extra.skipped;
    });
    if (skippedLessons.length >= 2) {
      const skippedTopics = [...new Set(skippedLessons.map((l) => l.topic).filter(Boolean))];
      signals.push({
        signal_type: 'ENGAGEMENT_SIGNAL',
        subject: skippedLessons[0]?.subject || 'Multiple',
        topic: skippedTopics[0] || 'Multiple topics',
        severity: skippedLessons.length >= 4 ? 'high' : 'medium',
        evidence: [
          `${skippedLessons.length} lesson(s) were skipped`,
          `Topics skipped: ${skippedTopics.join(', ')}`,
          incompleteLessons.length > 0 ? `${incompleteLessons.length} lesson(s) partially completed` : '',
        ].filter(Boolean),
        confidence_score: 0.75,
        recommended_action: `Check in with the student about the skipped lessons. Consider whether the format or difficulty needs adjustment to improve engagement.`,
      });
    }

    // Signal 5: HELP_SEEKING_SIGNAL
    const aiByTopic: Record<string, { count: number; subject: string; questions: string[] }> = {};
    for (const ai of aiActivities) {
      const key = `${ai.subject}::${ai.topic}`;
      if (!aiByTopic[key]) {
        aiByTopic[key] = { count: 0, subject: ai.subject || '', questions: [] };
      }
      aiByTopic[key].count++;
      const extra = ai.extra_data ? JSON.parse(ai.extra_data) : {};
      if (extra.question) aiByTopic[key].questions.push(extra.question);
    }
    for (const [, group] of quizGroups) {
      const key = `${group.subject}::${group.topic}`;
      const totalHints = group.totalHints;
      const aiCount = aiByTopic[key]?.count || 0;
      if (totalHints >= 2 || aiCount >= 2) {
        const evidence: string[] = [];
        if (totalHints > 0) evidence.push(`${totalHints} hint(s) requested during quizzes on this topic`);
        if (aiCount > 0) {
          evidence.push(`${aiCount} AI question(s) asked on this topic`);
          if (aiByTopic[key]?.questions[0]) {
            evidence.push(`Example question: "${aiByTopic[key].questions[0]}"`);
          }
        }
        signals.push({
          signal_type: 'HELP_SEEKING_SIGNAL',
          subject: group.subject,
          topic: group.topic,
          severity: 'low',
          evidence,
          confidence_score: 0.7,
          recommended_action: `Provide additional support resources for ${group.topic}. Consider worked examples or a guided walkthrough of the key concepts.`,
        });
      }
    }

    // Signal 6: PERSISTENCE_SIGNAL (positive)
    for (const [, group] of quizGroups) {
      if (group.attempts >= 3) {
        signals.push({
          signal_type: 'PERSISTENCE_SIGNAL',
          subject: group.subject,
          topic: group.topic,
          severity: 'low',
          evidence: [
            `${studentName} attempted ${group.topic} ${group.attempts} times`,
            'Continued engagement with a challenging topic shows persistence.',
          ],
          confidence_score: 0.95,
          recommended_action: `Acknowledge the student's continued effort. Ensure the support provided is effective and consider adjusting the difficulty or format if progress remains slow.`,
        });
      }
    }

    // Deduplicate signals on same type+topic (keep highest severity)
    return this.deduplicateSignals(signals);
  }

  private groupQuizzesByTopic(quizzes: LearningActivity[]): Map<string, QuizGroup> {
    const groups = new Map<string, QuizGroup>();
    for (const q of quizzes) {
      const key = `${q.subject}::${q.topic}`;
      if (!groups.has(key)) {
        groups.set(key, {
          subject: q.subject || '',
          topic: q.topic || '',
          subtopic: q.subtopic,
          quizzes: [],
          totalCorrect: 0,
          totalQuestions: 0,
          totalHints: 0,
          totalRepeatedMistakes: 0,
          attempts: 0,
        });
      }
      const g = groups.get(key)!;
      g.quizzes.push(q);
      g.totalCorrect += q.score_numerator || 0;
      g.totalQuestions += q.score_denominator || 0;
      g.totalHints += q.hints_requested || 0;
      g.totalRepeatedMistakes += q.repeated_mistakes || 0;
      g.attempts += q.attempts || 1;

      // Average confidence
      if (q.confidence_rating) {
        const existing = g.avgConfidence || 0;
        const count = g.quizzes.filter((qq) => qq.confidence_rating).length;
        g.avgConfidence = count > 1 ? (existing * (count - 1) + q.confidence_rating) / count : q.confidence_rating;
      }
    }
    return groups;
  }

  private deduplicateSignals(signals: RawSignal[]): RawSignal[] {
    const seen = new Map<string, RawSignal>();
    const severityRank = { high: 3, medium: 2, low: 1 };
    for (const s of signals) {
      const key = `${s.signal_type}::${s.subject}::${s.topic}`;
      const existing = seen.get(key);
      if (!existing || severityRank[s.severity] > severityRank[existing.severity]) {
        seen.set(key, s);
      }
    }
    return Array.from(seen.values());
  }
}

export const learningSignalEngine = new LearningSignalEngine();
