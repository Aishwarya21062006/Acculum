import React, { useEffect, useState } from 'react';
import { analyticsApi, textbookAnalyticsApi } from '../api';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Users, AlertTriangle, BarChart3, BookOpen, Layers, Zap, CheckCircle2 } from 'lucide-react';

interface ClassAnalyticsPageProps { navigate: (to: string) => void; }

export function ClassAnalyticsPage({ navigate }: ClassAnalyticsPageProps) {
  const [classData, setClassData] = useState<any[]>([]);
  const [topicData, setTopicData] = useState<{ topics: any[]; total_students: number; class_wide_threshold: number } | null>(null);
  const [textbookStats, setTextbookStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'textbook' | 'signals'>('textbook');

  useEffect(() => {
    Promise.all([
      analyticsApi.class(),
      analyticsApi.topics(),
      textbookAnalyticsApi.get('7').catch(() => null),
    ])
      .then(([cls, topics, tbStats]) => {
        setClassData(cls);
        setTopicData(topics);
        setTextbookStats(tbStats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-xl border border-gray-200 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Sub navigation switcher */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Class & Textbook Analytics</h1>
          <p className="text-xs text-gray-500">Monitor student performance, weak topics, and adaptive quiz mastery.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('textbook')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'textbook' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen size={14} /> Textbook Quiz Insights
          </button>
          <button
            onClick={() => setActiveTab('signals')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'signals' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 size={14} /> Report Signals & Heatmap
          </button>
        </div>
      </div>

      {activeTab === 'textbook' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Topics Evaluated
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {textbookStats?.topic_statistics?.length || 0}
              </span>
              <span className="text-xs text-gray-500 block mt-1">Across Class 7 Curriculum</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block mb-1">
                Weak Topics Identified
              </span>
              <span className="text-2xl font-bold text-amber-600">
                {textbookStats?.weak_topics?.length || 0}
              </span>
              <span className="text-xs text-gray-500 block mt-1">Avg Score &lt; 60%</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider block mb-1">
                Remedial Interventions
              </span>
              <span className="text-2xl font-bold text-indigo-700">
                {textbookStats?.active_interventions?.length || 0}
              </span>
              <span className="text-xs text-gray-500 block mt-1">Adaptive Support Triggered</span>
            </div>
          </div>

          {/* Weak Topics / Most Difficult Topics */}
          {textbookStats?.topic_statistics && textbookStats.topic_statistics.length > 0 ? (
            <Card padding={false}>
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Most Difficult Topics in Class</h3>
                  <p className="text-xs text-gray-500">Ranked by lowest average quiz performance</p>
                </div>
              </div>
              <div className="p-5 space-y-4">
                {textbookStats.topic_statistics.map((t: any, idx: number) => {
                  const isStruggling = t.avg_score < 60;
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        isStruggling ? 'bg-red-50/40 border-red-200' : 'bg-gray-50/70 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 text-sm">{t.topic}</span>
                          <span className="text-xs text-gray-400">({t.chapter})</span>
                          {isStruggling && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-bold">
                              Needs Remediation
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-gray-500">{t.total_attempts} Attempts</span>
                          <span className="font-bold text-gray-900">{t.avg_score}% Avg</span>
                        </div>
                      </div>
                      <ProgressBar value={t.avg_score} color={isStruggling ? 'red' : 'indigo'} />
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <Zap size={36} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">No quiz attempts recorded yet.</p>
              <p className="text-xs text-gray-400 mt-1">
                Have students take adaptive topic quizzes to see difficulty and mastery insights here.
              </p>
            </Card>
          )}

          {/* Chapter Wise Performance Breakdown */}
          {textbookStats?.chapter_statistics && textbookStats.chapter_statistics.length > 0 && (
            <Card padding={false}>
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm">Chapter-wise Performance</h3>
                <p className="text-xs text-gray-500">Aggregate quiz scores grouped by textbook chapters</p>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {textbookStats.chapter_statistics.map((c: any, cIdx: number) => (
                  <div key={cIdx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 text-xs">{c.chapter}</span>
                      <span className="font-bold text-indigo-700 text-xs">{c.avg_chapter_score}%</span>
                    </div>
                    <ProgressBar value={c.avg_chapter_score} />
                    <span className="text-[11px] text-gray-400 block">{c.attempts_count} total quiz attempts</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'signals' && (
        <div className="space-y-6">
      {classData.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <BarChart3 size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No class data available yet.</p>
            <p className="text-sm text-gray-400 mt-1">Import student reports to see class analytics.</p>
          </div>
        </Card>
      ) : (
        classData.map(cls => (
          <Card key={cls.class} padding={false}>
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold text-sm">
                  {cls.class}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Class {cls.class}</h2>
                  <p className="text-xs text-gray-500">{cls.total_students} student{cls.total_students !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            {cls.topics.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-400">No topic data for this class.</p>
            ) : (
              <div className="p-5 space-y-4">
                {cls.topics.map((t: any) => {
                  const isClassWide = t.class_wide;
                  return (
                    <div key={`${t.subject}::${t.topic}`} className={`p-3 rounded-lg border ${isClassWide ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800">{t.topic}</span>
                          <span className="text-xs text-gray-400">{t.subject}</span>
                          {isClassWide && (
                            <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                              <AlertTriangle size={10} />
                              Class-wide issue
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Users size={11} />{t.students_with_signal} with signal</span>
                          {t.avg_score !== null && <span className="font-semibold text-gray-700">{t.avg_score}%</span>}
                        </div>
                      </div>
                      {t.avg_score !== null && (
                        <ProgressBar value={t.avg_score} showLabel={false} color={isClassWide ? 'red' : 'indigo'} />
                      )}
                      {isClassWide && (
                        <p className="text-xs text-red-700 mt-2">
                          {t.students_with_signal} of {cls.total_students} students are showing difficulty with this topic.
                          Consider a class-wide revision session.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        ))
      )}

      {/* Topic heatmap across all classes */}
      {topicData && topicData.topics.length > 0 && (
        <Card padding={false}>
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Topic Heatmap — All Classes</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Class-wide threshold: {topicData.class_wide_threshold} of {topicData.total_students} students
            </p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                {['Topic', 'Subject', 'Avg Score', 'Students', 'With Signal', 'Scope'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topicData.topics.sort((a, b) => (a.avg_score ?? 100) - (b.avg_score ?? 100)).map((t: any) => (
                <tr key={`${t.subject}::${t.topic}`} className={t.class_wide ? 'bg-red-50/50' : ''}>
                  <td className="px-4 py-3 font-medium text-gray-900">{t.topic}</td>
                  <td className="px-4 py-3 text-gray-500">{t.subject}</td>
                  <td className="px-4 py-3">
                    {t.avg_score !== null ? (
                      <div className="flex items-center gap-2 w-32">
                        <ProgressBar value={t.avg_score} />
                        <span className="text-xs font-semibold text-gray-700 w-10">{t.avg_score}%</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.student_count}</td>
                  <td className="px-4 py-3">
                    {t.students_with_signal > 0 ? (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.class_wide ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {t.students_with_signal}
                      </span>
                    ) : <span className="text-gray-300">0</span>}
                  </td>
                  <td className="px-4 py-3">
                    {t.class_wide ? (
                      <span className="text-xs font-medium text-red-700 flex items-center gap-1">
                        <AlertTriangle size={11} /> Class-wide
                      </span>
                    ) : t.students_with_signal > 0 ? (
                      <span className="text-xs text-amber-700">Individual</span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      </div>
      )}
    </div>
  );
}
