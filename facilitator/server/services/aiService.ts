import {
  LearningSignal,
  StudentProfile,
  LearningActivity,
  InterventionRecommendation,
  ComparisonResult,
  AccumulReportSchema,
} from '../types.js';

const FORMAT_ALTERNATIVES: Record<string, string[]> = {
  text: ['visual', 'interactive', 'audio'],
  visual: ['interactive', 'story', 'text'],
  audio: ['visual', 'interactive', 'text'],
  interactive: ['visual', 'story', 'text'],
  story: ['visual', 'interactive', 'text'],
  quiz: ['interactive', 'visual', 'text'],
};

class AIService {
  private useRealAI(): boolean {
    return !!(process.env.OPENAI_API_KEY || process.env.GOOGLE_AI_API_KEY);
  }

  async analyzeSummary(
    student: StudentProfile,
    signals: LearningSignal[],
    activities: LearningActivity[]
  ): Promise<string> {
    if (this.useRealAI()) {
      // Placeholder for real AI integration
      // return await this.callOpenAI(student, signals, activities);
    }
    return this.mockSummary(student, signals, activities);
  }

  private mockSummary(
    student: StudentProfile,
    signals: LearningSignal[],
    activities: LearningActivity[]
  ): string {
    const name = student.full_name;
    const quizzes = activities.filter((a) => a.activity_type === 'quiz');
    const lessons = activities.filter((a) => a.activity_type === 'lesson');

    // Find well-performing topics
    const wellTopics: string[] = [];
    const struggleTopics: string[] = [];

    const topicMap: Record<string, { correct: number; total: number }> = {};
    for (const q of quizzes) {
      const key = q.topic || 'Unknown';
      if (!topicMap[key]) topicMap[key] = { correct: 0, total: 0 };
      topicMap[key].correct += q.score_numerator || 0;
      topicMap[key].total += q.score_denominator || 0;
    }
    for (const [topic, data] of Object.entries(topicMap)) {
      if (data.total === 0) continue;
      const pct = (data.correct / data.total) * 100;
      if (pct >= 75) wellTopics.push(topic);
      else if (pct < 65) struggleTopics.push(topic);
    }

    const activeSignals = signals.filter((s) => s.status === 'active');
    const performanceSignals = activeSignals.filter(
      (s) => s.signal_type === 'PERFORMANCE_SIGNAL' || s.signal_type === 'REPEATED_ERROR_SIGNAL'
    );
    const confidenceSignal = activeSignals.find((s) => s.signal_type === 'CONFIDENCE_PERFORMANCE_SIGNAL');

    let summary = '';

    if (wellTopics.length > 0) {
      summary += `${name} is progressing well in ${wellTopics.join(', ')}. `;
    } else if (lessons.length > 0) {
      summary += `${name} has been actively engaged in ${lessons.length} lesson${lessons.length > 1 ? 's' : ''} across the recent report period. `;
    }

    if (performanceSignals.length > 0) {
      const sig = performanceSignals[0];
      const rawEv = sig.evidence as any;
      const evidence = Array.isArray(rawEv) ? rawEv : (typeof rawEv === 'string' ? (() => { try { return JSON.parse(rawEv); } catch { return [rawEv]; } })() : []);
      summary += `Recent activity indicates difficulty with ${sig.topic} in ${sig.subject}. `;
      if (evidence.length > 0) {
        summary += `The evidence includes ${evidence.slice(0, 2).join(' and ').toLowerCase()}. `;
      }
    }

    if (confidenceSignal) {
      summary += `It is worth noting that confidence is currently higher than recent performance on this topic, which may indicate a gap in conceptual understanding. `;
    }

    if (activeSignals.length > 0) {
      summary += `A targeted revision activity followed by reassessment is recommended to support ${name}'s current learning needs.`;
    } else {
      summary += `${name} is currently showing a positive learning trajectory. Continue monitoring progress through regular assessments.`;
    }

    return summary.trim();
  }

  async recommendIntervention(
    signal: LearningSignal,
    student: StudentProfile
  ): Promise<InterventionRecommendation> {
    const rawEv = signal.evidence as any;
    const evidence = Array.isArray(rawEv) ? rawEv : (typeof rawEv === 'string' ? (() => { try { return JSON.parse(rawEv); } catch { return [rawEv]; } })() : []);
    let format: string;
    let type: string;
    let priority: 'high' | 'medium' | 'low';

    if (signal.signal_type === 'CONFIDENCE_PERFORMANCE_SIGNAL') {
      format = 'interactive';
      type = 'revision';
    } else if (signal.signal_type === 'REPEATED_ERROR_SIGNAL') {
      format = 'visual';
      type = 'revision';
    } else if (signal.signal_type === 'HELP_SEEKING_SIGNAL') {
      format = 'text';
      type = 'explanation';
    } else if (signal.signal_type === 'ENGAGEMENT_SIGNAL') {
      format = 'story';
      type = 'revision';
    } else {
      format = 'visual';
      type = 'practice';
    }

    priority = signal.severity === 'high' ? 'high' : signal.severity === 'medium' ? 'medium' : 'low';

    return {
      intervention_type: type,
      topic: signal.topic || '',
      format,
      reason: evidence[0] || `Signal detected for ${signal.topic}`,
      priority,
    };
  }

  async compareReports(
    beforeReport: AccumulReportSchema,
    afterReport: AccumulReportSchema,
    topic: string
  ): Promise<ComparisonResult> {
    const getTopicScore = (report: AccumulReportSchema, topicName: string) => {
      const needle = (topicName || '').toLowerCase().trim();
      let relevant = report.quizzes.filter(
        (q) =>
          !needle ||
          q.topic.toLowerCase().includes(needle) ||
          needle.includes(q.topic.toLowerCase()) ||
          (q.subtopic && (q.subtopic.toLowerCase().includes(needle) || needle.includes(q.subtopic.toLowerCase())))
      );
      if (relevant.length === 0) relevant = report.quizzes;
      if (relevant.length === 0) return null;
      const totalCorrect = relevant.reduce((s, q) => s + q.correct, 0);
      const totalQs = relevant.reduce((s, q) => s + q.total_questions, 0);
      return totalQs > 0 ? (totalCorrect / totalQs) * 100 : null;
    };

    const beforeScore = getTopicScore(beforeReport, topic);
    const afterScore = getTopicScore(afterReport, topic);

    if (beforeScore === null || afterScore === null) {
      return {
        improvement: false,
        change_percentage: 0,
        before_score: beforeScore || 0,
        after_score: afterScore || 0,
        summary: 'Insufficient data to compare performance on this topic between the two reports.',
      };
    }

    const change = afterScore - beforeScore;
    const improved = change > 0;
    let summary: string;

    if (change >= 15) {
      summary = `Improvement was observed following the intervention. Performance on ${topic} increased from ${Math.round(beforeScore)}% to ${Math.round(afterScore)}%.`;
    } else if (change > 0) {
      summary = `Limited improvement was observed following the previous intervention. Performance on ${topic} changed from ${Math.round(beforeScore)}% to ${Math.round(afterScore)}%.`;
    } else if (change === 0) {
      summary = `No change in performance was observed for ${topic} between the two reports.`;
    } else {
      summary = `Performance on ${topic} decreased from ${Math.round(beforeScore)}% to ${Math.round(afterScore)}% in the latest report. Further support may be needed.`;
    }

    return {
      improvement: improved,
      change_percentage: Math.round(change * 10) / 10,
      before_score: Math.round(beforeScore * 10) / 10,
      after_score: Math.round(afterScore * 10) / 10,
      summary,
    };
  }
}

export const aiService = new AIService();
