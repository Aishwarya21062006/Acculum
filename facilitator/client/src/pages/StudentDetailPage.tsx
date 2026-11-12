import React, { useEffect, useState } from 'react';
import { studentsApi } from '../api';
import { StudentDetail, LearningSignal, LearningActivity } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PriorityBadge } from '../components/ui/Badge';
import { SignalBadge } from '../components/ui/SignalBadge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { InterventionModal } from '../components/InterventionModal';
import {
  ArrowLeft, Brain, BookOpen, Zap, Activity, FileText,
  Clock, ChevronDown, ChevronUp, GraduationCap, Star
} from 'lucide-react';

interface StudentDetailPageProps {
  studentId: string;
  navigate: (to: string) => void;
}

const SEVERITY_COLOR: Record<string, string> = {
  high: 'bg-red-100 border-red-200',
  medium: 'bg-amber-50 border-amber-200',
  low: 'bg-blue-50 border-blue-100',
};

const SEVERITY_DOT: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-400',
};

const ACTIVITY_ICON: Record<string, React.FC<any>> = {
  lesson: BookOpen,
  quiz: GraduationCap,
  ai_question: Brain,
  peer_competition: Star,
  revision: Activity,
};

function ConfidenceChart({ confidence, score }: { confidence: number; score: number }) {
  const x = Math.round((score / 100) * 180) + 20;
  const y = Math.round(((5 - confidence) / 4) * 100) + 20;
  const isGap = confidence >= 4 && score < 60;

  return (
    <div>
      <svg viewBox="0 0 220 150" className="w-full max-w-xs">
        {/* Axes */}
        <line x1="20" y1="20" x2="20" y2="130" stroke="#e2e8f0" strokeWidth="1.5" />
        <line x1="20" y1="130" x2="210" y2="130" stroke="#e2e8f0" strokeWidth="1.5" />
        {/* Labels */}
        <text x="10" y="25" fontSize="8" fill="#94a3b8" textAnchor="middle">5</text>
        <text x="10" y="75" fontSize="8" fill="#94a3b8" textAnchor="middle">3</text>
        <text x="10" y="125" fontSize="8" fill="#94a3b8" textAnchor="middle">1</text>
        <text x="105" y="145" fontSize="8" fill="#94a3b8" textAnchor="middle">Score %</text>
        <text x="25" y="148" fontSize="7" fill="#94a3b8">0</text>
        <text x="195" y="148" fontSize="7" fill="#94a3b8">100</text>
        {/* Y-axis label */}
        <text x="5" y="80" fontSize="7" fill="#94a3b8" textAnchor="middle" transform="rotate(-90,5,80)">Confidence</text>
        {/* Quadrant shade: high conf + low perf = concerning */}
        <rect x="20" y="20" width="90" height="65" fill={isGap ? '#fef3c7' : '#f8fafc'} opacity="0.5" />
        {/* Student dot */}
        <circle cx={x} cy={y} r="7" fill={isGap ? '#f59e0b' : '#6366f1'} opacity="0.9" />
        <title>{`Confidence: ${confidence}/5, Score: ${score}%`}</title>
      </svg>
      {isGap && (
        <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2 mt-1">
          ⚠ Confidence is higher than recent performance. Consider checking conceptual understanding through targeted practice.
        </p>
      )}
    </div>
  );
}

export function StudentDetailPage({ studentId, navigate }: StudentDetailPageProps) {
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSignal, setSelectedSignal] = useState<LearningSignal | null>(null);
  const [expandedSignals, setExpandedSignals] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'interventions' | 'reports'>('overview');

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const data = await studentsApi.getById(studentId);
      setStudent(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudent(); }, [studentId]);

  const toggleSignal = (id: string) => {
    setExpandedSignals(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-white rounded-xl border border-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <p className="text-red-600 text-sm">{error || 'Student not found'}</p>
          <Button variant="ghost" onClick={() => navigate('students')} icon={<ArrowLeft size={15} />} className="mt-3">
            Back to Students
          </Button>
        </Card>
      </div>
    );
  }

  // Compute subject performance
  const subjectScores: Record<string, { correct: number; total: number }> = {};
  for (const act of student.activities.filter(a => a.activity_type === 'quiz')) {
    const sub = act.subject || 'Other';
    if (!subjectScores[sub]) subjectScores[sub] = { correct: 0, total: 0 };
    subjectScores[sub].correct += act.score_numerator || 0;
    subjectScores[sub].total += act.score_denominator || 0;
  }

  // Compute topic performance
  const topicScores: Record<string, { correct: number; total: number; subject: string }> = {};
  for (const act of student.activities.filter(a => a.activity_type === 'quiz')) {
    const key = `${act.subject}::${act.topic}`;
    if (!topicScores[key]) topicScores[key] = { correct: 0, total: 0, subject: act.subject || '' };
    topicScores[key].correct += act.score_numerator || 0;
    topicScores[key].total += act.score_denominator || 0;
  }

  // Confidence data
  const confActivity = student.activities.find(a => a.confidence_rating !== undefined && a.confidence_rating !== null);
  const hasConfidence = confActivity && confActivity.score_denominator;

  // Active signals
  const activeSignals = student.signals.filter(s => s.status === 'active');

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'activity' as const, label: `Activity (${student.activities.length})` },
    { id: 'interventions' as const, label: `Interventions (${student.interventions.length})` },
    { id: 'reports' as const, label: `Reports (${student.reports.length})` },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Back + header */}
      <button
        onClick={() => navigate('students')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to Students
      </button>

      {/* Student header card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
              {student.full_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{student.full_name}</h1>
                <PriorityBadge priority={student.priority} />
              </div>
              <p className="text-sm text-gray-500">
                Class {student.class} · {student.school} · {student.student_id}
              </p>
              {student.interests && student.interests.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Interests: {student.interests.join(', ')}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Last report</p>
            <p className="text-sm font-medium text-gray-700">
              {student.reports[student.reports.length - 1]
                ? new Date(student.reports[student.reports.length - 1].report_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—'
              }
            </p>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      {student.ai_summary && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={16} className="text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-700">Acculum Analysis</span>
          </div>
          <p className="text-sm text-indigo-900 leading-relaxed">{student.ai_summary}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Learning Signals */}
          {activeSignals.length > 0 && (
            <Card padding={false}>
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Learning Signals</h2>
                <p className="text-xs text-gray-500 mt-0.5">{activeSignals.length} active signal{activeSignals.length !== 1 ? 's' : ''} detected</p>
              </div>
              <div className="divide-y divide-gray-50">
                {activeSignals.map(sig => {
                  const expanded = expandedSignals.has(sig.id);
                  const evidence = Array.isArray(sig.evidence) ? sig.evidence : JSON.parse(sig.evidence || '[]');
                  return (
                    <div key={sig.id} className={`p-5 border-l-4 ${SEVERITY_COLOR[sig.severity]}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <div className={`w-2 h-2 rounded-full ${SEVERITY_DOT[sig.severity]}`} />
                            <SignalBadge signalType={sig.signal_type} />
                            <span className="text-xs font-medium text-gray-700">{sig.subject} → {sig.topic}</span>
                          </div>
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Evidence</p>
                            <ul className="space-y-1">
                              {(expanded ? evidence : evidence.slice(0, 2)).map((ev: string, i: number) => (
                                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-gray-400 mt-0.5">•</span>
                                  {ev}
                                </li>
                              ))}
                            </ul>
                            {evidence.length > 2 && (
                              <button
                                onClick={() => toggleSignal(sig.id)}
                                className="text-xs text-indigo-600 mt-1 flex items-center gap-1"
                              >
                                {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Show {evidence.length - 2} more</>}
                              </button>
                            )}
                          </div>
                          {expanded && sig.recommended_action && (
                            <div className="mt-3 p-3 bg-white/80 rounded-lg border border-gray-200">
                              <p className="text-xs font-semibold text-gray-500 mb-1">Suggested Action</p>
                              <p className="text-sm text-gray-700">{sig.recommended_action}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <Button
                            size="sm"
                            onClick={() => setSelectedSignal(sig)}
                            icon={<Zap size={12} />}
                          >
                            Assign Intervention
                          </Button>
                          <button
                            onClick={() => toggleSignal(sig.id)}
                            className="text-xs text-gray-400 hover:text-gray-600"
                          >
                            {expanded ? 'Collapse' : 'Expand'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Subject & Topic Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Subject performance */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Subject Performance</h3>
              {Object.entries(subjectScores).length === 0 ? (
                <p className="text-sm text-gray-400">No quiz data available</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(subjectScores).map(([sub, data]) => {
                    const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                    return (
                      <div key={sub}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-700">{sub}</span>
                          <span className="text-sm font-medium text-gray-900">{pct}%</span>
                        </div>
                        <ProgressBar value={pct} showLabel={false} />
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Topic performance */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Topic Performance</h3>
              {Object.entries(topicScores).length === 0 ? (
                <p className="text-sm text-gray-400">No quiz data available</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(topicScores).map(([key, data]) => {
                    const [, topic] = key.split('::');
                    const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                    return (
                      <div key={key}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-600">{topic}</span>
                          <span className="text-xs font-semibold text-gray-900">{data.correct}/{data.total}</span>
                        </div>
                        <ProgressBar value={pct} showLabel={false} height="sm" />
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Confidence vs Performance */}
          {hasConfidence && confActivity && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Confidence vs Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <ConfidenceChart
                  confidence={confActivity.confidence_rating!}
                  score={confActivity.score_denominator ? Math.round((confActivity.score_numerator || 0) / confActivity.score_denominator * 100) : 50}
                />
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-0.5">Confidence Rating</p>
                    <p className="text-2xl font-bold text-indigo-600">{confActivity.confidence_rating}/5</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-0.5">Quiz Performance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {confActivity.score_denominator
                        ? `${Math.round((confActivity.score_numerator || 0) / confActivity.score_denominator * 100)}%`
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ACTIVITY TAB */}
      {activeTab === 'activity' && (
        <Card padding={false}>
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Activity Timeline</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {student.activities.slice(0, 30).map(act => {
              const Icon = ACTIVITY_ICON[act.activity_type] || BookOpen;
              const hasSCORe = act.score_denominator && act.score_denominator > 0;
              const pct = hasSCORe ? Math.round((act.score_numerator || 0) / act.score_denominator! * 100) : null;
              const extra = act.extra_data ? JSON.parse(act.extra_data) : {};

              return (
                <div key={act.id} className="px-5 py-3.5 flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={15} className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {act.activity_type === 'ai_question' ? 'AI Help Request' : act.activity_type}
                        {extra.title ? ` — ${extra.title}` : act.topic ? ` — ${act.topic}` : ''}
                      </span>
                      {pct !== null && (
                        <span className={`text-xs font-semibold ${pct >= 75 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                          {act.score_numerator}/{act.score_denominator} ({pct}%)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-400">{act.subject}</span>
                      {act.subtopic && <span className="text-xs text-gray-400">· {act.subtopic}</span>}
                      {act.hints_requested > 0 && (
                        <span className="text-xs text-amber-600">{act.hints_requested} hint{act.hints_requested !== 1 ? 's' : ''}</span>
                      )}
                      {act.repeated_mistakes > 0 && (
                        <span className="text-xs text-red-500">{act.repeated_mistakes} repeated errors</span>
                      )}
                      {act.confidence_rating && (
                        <span className="text-xs text-purple-600">Confidence: {act.confidence_rating}/5</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-300 flex-shrink-0">
                    {act.activity_date ? new Date(act.activity_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* INTERVENTIONS TAB */}
      {activeTab === 'interventions' && (
        <div className="space-y-4">
          {student.interventions.length === 0 ? (
            <Card>
              <p className="text-sm text-gray-400 text-center py-8">No interventions assigned yet.</p>
            </Card>
          ) : (
            student.interventions.map(iv => {
              const reassessment = student.reassessments.find(r => r.intervention_id === iv.id);
              const beforePct = reassessment?.before_score_denominator
                ? Math.round((reassessment.before_score_numerator / reassessment.before_score_denominator) * 100)
                : null;
              const afterPct = reassessment?.after_score_numerator && reassessment?.after_score_denominator
                ? Math.round((reassessment.after_score_numerator / reassessment.after_score_denominator) * 100)
                : null;

              return (
                <Card key={iv.id} padding={false}>
                  <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Activity size={16} className="text-indigo-600" />
                      <div>
                        <p className="font-medium text-sm text-gray-900 capitalize">
                          {iv.intervention_type} · {iv.topic || iv.subject}
                        </p>
                        <p className="text-xs text-gray-400">
                          Assigned {new Date(iv.assigned_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {iv.format ? ` · ${iv.format}` : ''}
                          {iv.language ? ` · ${iv.language}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      iv.status === 'completed' ? 'bg-emerald-100 text-emerald-700'
                        : iv.status === 'assigned' ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>{iv.status}</span>
                  </div>

                  {reassessment && (
                    <div className="p-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Reassessment Result</p>
                      <div className="flex items-center gap-6">
                        {beforePct !== null && (
                          <div className="text-center">
                            <p className="text-xs text-gray-400 mb-1">Before</p>
                            <p className="text-2xl font-bold text-gray-700">{beforePct}%</p>
                          </div>
                        )}
                        {afterPct !== null && (
                          <>
                            <div className="text-gray-300 text-2xl">→</div>
                            <div className="text-center">
                              <p className="text-xs text-gray-400 mb-1">After</p>
                              <p className={`text-2xl font-bold ${afterPct > (beforePct || 0) ? 'text-emerald-600' : 'text-red-600'}`}>
                                {afterPct}%
                              </p>
                            </div>
                            {reassessment.improvement_percentage !== null && reassessment.improvement_percentage !== undefined && (
                              <div className="text-center">
                                <p className="text-xs text-gray-400 mb-1">Change</p>
                                <p className={`text-xl font-bold ${reassessment.improvement_percentage >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {reassessment.improvement_percentage >= 0 ? '+' : ''}{reassessment.improvement_percentage}pp
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      {reassessment.improvement_percentage !== null && reassessment.improvement_percentage !== undefined && (
                        <p className={`text-sm mt-3 p-2 rounded-lg ${reassessment.improvement_percentage >= 15 ? 'bg-emerald-50 text-emerald-700' : reassessment.improvement_percentage >= 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                          {reassessment.improvement_percentage >= 15
                            ? '✓ Improvement observed following the intervention.'
                            : reassessment.improvement_percentage >= 0
                            ? 'Limited improvement was observed following the previous intervention.'
                            : 'No improvement observed. Consider an alternative intervention format.'}
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <Card padding={false}>
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Report History</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {student.reports.map((r, idx) => (
              <div key={r.id} className="px-5 py-4 flex items-center gap-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-sm font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Report {idx + 1}
                    {r.is_demo ? <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Demo</span> : ''}
                  </p>
                  <p className="text-xs text-gray-500">
                    Generated: {new Date(r.report_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    · {r.activities_count || 0} activities
                  </p>
                </div>
                <span className="text-xs text-gray-400 font-mono">v{r.report_version}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Intervention Modal */}
      {selectedSignal && (
        <InterventionModal
          signal={selectedSignal}
          studentId={student.id}
          studentName={student.full_name}
          onClose={() => setSelectedSignal(null)}
          onSuccess={() => fetchStudent()}
        />
      )}
    </div>
  );
}
