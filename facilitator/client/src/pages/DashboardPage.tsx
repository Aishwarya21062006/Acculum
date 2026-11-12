import React, { useEffect, useState } from 'react';
import { analyticsApi, demoApi } from '../api';
import { DashboardStats } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SignalBadge } from '../components/ui/SignalBadge';
import { ImportModal } from '../components/ImportModal';
import {
  Users, Zap, Activity, TrendingUp, Upload, Database,
  AlertTriangle, CheckCircle2, ArrowRight, Download, FileText
} from 'lucide-react';

interface DashboardPageProps {
  navigate: (to: string) => void;
}

export function DashboardPage({ navigate }: DashboardPageProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [demoMessage, setDemoMessage] = useState('');

  const fetchStats = async () => {
    try {
      const data = await analyticsApi.dashboard();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const loadDemo = async () => {
    setLoadingDemo(true);
    setDemoMessage('');
    try {
      const res = await demoApi.load();
      setDemoMessage(`✓ Demo cohort loaded: ${res.students_loaded.join(', ')}`);
      fetchStats();
    } catch (err: any) {
      setDemoMessage(`Failed: ${err.message}`);
    } finally {
      setLoadingDemo(false);
    }
  };

  const statCards = [
    { label: 'Total Students', value: stats?.total_students ?? '—', icon: Users, color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' },
    { label: 'On Track', value: stats?.on_track ?? '—', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
    { label: 'Needs Attention', value: stats?.needs_attention ?? '—', icon: AlertTriangle, color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
    { label: 'Requires Intervention', value: stats?.requires_intervention ?? '—', icon: Zap, color: 'bg-red-50 text-red-600', border: 'border-red-100' },
  ];

  const isEmpty = !loading && (stats?.total_students ?? 0) === 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Acculum Facilitator Dashboard</h1>
          <p className="text-sm text-gray-500">Evidence-based learning intervention system</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative group">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all">
              <Download size={13} />
              Sample Reports
            </button>
            <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl py-2 hidden group-hover:block z-20">
              <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Downloadable Test Reports
              </div>
              <a
                href="/api/demo/rahul-report-1"
                download="rahul-report-1.json"
                className="flex items-start gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <FileText size={15} className="text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Rahul — Report 1 (Initial)</div>
                  <div className="text-[11px] text-gray-400">Score 50% · Signals detected</div>
                </div>
              </a>
              <a
                href="/api/demo/rahul-report-2"
                download="rahul-report-2.json"
                className="flex items-start gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
              >
                <FileText size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Rahul — Report 2 (Reassessment)</div>
                  <div className="text-[11px] text-gray-400">Score 80% · +30pp improvement</div>
                </div>
              </a>
            </div>
          </div>

          <Button variant="secondary" onClick={loadDemo} loading={loadingDemo} icon={<Database size={14} />} size="sm">
            Load Demo Data
          </Button>
          <Button onClick={() => setShowImport(true)} icon={<Upload size={14} />} size="sm">
            + Import Student Report
          </Button>
        </div>
      </div>

      {demoMessage && (
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-sm text-indigo-700 flex items-center justify-between">
          <span>{demoMessage}</span>
          <button onClick={() => setDemoMessage('')} className="text-indigo-400 hover:text-indigo-600 text-xs">Dismiss</button>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, border }) => (
          <div key={label} className={`bg-white rounded-xl border ${border} p-5 shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500 font-medium">{label}</p>
              <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
                <Icon size={18} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? <span className="animate-pulse text-gray-300">—</span> : value}
            </p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <Card>
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload size={28} className="text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Acculum Facilitator Dashboard</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-2">
              No student reports have been imported yet. Start by uploading a Student Learning Report to begin analysis.
            </p>
            <p className="text-sm text-gray-400 max-w-md mx-auto mb-8">
              Student reports contain learning activity, quiz performance, and learning signals that Acculum analyzes to help you decide where intervention is needed.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button onClick={() => setShowImport(true)} icon={<Upload size={15} />} size="lg">
                Import Student Report
              </Button>
              <Button variant="secondary" onClick={loadDemo} loading={loadingDemo} icon={<Database size={15} />} size="lg">
                Load Demo Data
              </Button>
              <a
                href="/api/demo/rahul-report-1"
                download="rahul-report-1.json"
                className="inline-flex items-center gap-2 font-medium rounded-lg px-6 py-2.5 text-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm"
              >
                <Download size={15} />
                Download Rahul Report (JSON)
              </a>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Section 13: STUDENTS REQUIRING ATTENTION (WHO, WHERE, WHY, WHAT) */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-base font-bold text-gray-900">Students Requiring Attention</h2>
                <p className="text-xs text-gray-500 mt-0.5">Every row answers: WHO needs help, WHERE, WHY (Evidence), and WHAT TO DO</p>
              </div>
              <button onClick={() => navigate('signals')} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View all signals <ArrowRight size={12} />
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {stats?.recent_signals.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  ✓ All students are currently on track! No urgent signals detected.
                </div>
              ) : (
                stats?.recent_signals.map((sig) => {
                  const evidenceList = Array.isArray(sig.evidence)
                    ? sig.evidence
                    : (typeof sig.evidence === 'string' ? JSON.parse(sig.evidence || '[]') : []);
                  const sevBorder = sig.severity === 'high' ? 'border-l-red-500' : sig.severity === 'medium' ? 'border-l-amber-500' : 'border-l-blue-400';

                  return (
                    <div key={sig.id} className={`p-5 border-l-4 ${sevBorder} hover:bg-slate-50/60 transition-colors`}>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        {/* 1. WHO */}
                        <div>
                          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">1. WHO?</div>
                          <button
                            onClick={() => navigate(`students/${sig.student_id}`)}
                            className="font-bold text-gray-900 hover:text-indigo-600 transition-colors text-base text-left block"
                          >
                            {sig.student_name}
                          </button>
                          <div className="text-xs text-gray-500 mt-0.5">Class {sig.student_class}</div>
                          <div className="mt-2">
                            <SignalBadge signalType={sig.signal_type} />
                          </div>
                        </div>

                        {/* 2. WHERE */}
                        <div>
                          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">2. WHERE?</div>
                          <div className="font-semibold text-gray-800 text-sm">{sig.topic}</div>
                          <div className="text-xs text-gray-500">{sig.subject}{sig.subtopic ? ` → ${sig.subtopic}` : ''}</div>
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${sig.severity === 'high' ? 'bg-red-100 text-red-800' : sig.severity === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                              {sig.severity.toUpperCase()} Priority
                            </span>
                          </div>
                        </div>

                        {/* 3. WHY (Evidence) */}
                        <div className="md:col-span-1">
                          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">3. WHY? (Evidence)</div>
                          <ul className="space-y-1">
                            {evidenceList.slice(0, 3).map((ev: string, idx: number) => (
                              <li key={idx} className="text-xs text-gray-600 flex items-start gap-1.5">
                                <span className="text-indigo-400 font-bold">•</span>
                                <span>{ev}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 4. WHAT TO DO */}
                        <div>
                          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">4. WHAT TO DO?</div>
                          <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                            {sig.recommended_action}
                          </div>
                          <div className="mt-2.5 flex justify-end">
                            <Button
                              size="sm"
                              onClick={() => navigate(`students/${sig.student_id}`)}
                              icon={<Zap size={12} />}
                            >
                              Open & Intervene
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Interventions */}
            <Card padding={false}>
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Recent Interventions</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Assigned learning interventions</p>
                </div>
                <button onClick={() => navigate('interventions')} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium">
                  View all <ArrowRight size={12} />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {stats?.recent_interventions.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">No interventions assigned yet</p>
                )}
                {stats?.recent_interventions.map((iv) => (
                  <div key={iv.id} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{iv.student_name}</p>
                        <p className="text-xs text-gray-500 capitalize">{iv.intervention_type} · {iv.topic}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${iv.status === 'completed' ? 'bg-emerald-500' : iv.status === 'assigned' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                        <span className="text-xs text-gray-500 capitalize">{iv.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions & Demonstration Guide */}
            <Card>
              <h2 className="font-semibold text-gray-900 mb-2">Acculum Learning Loop</h2>
              <p className="text-xs text-gray-500 mb-4">
                Convert student learning activity into actionable facilitator intervention:
              </p>
              <div className="space-y-2 text-xs text-gray-600 mb-5">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">1</span>
                  <span><strong>Import Report 1:</strong> Rahul shows 50% on Fractions with high confidence (4/5)</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">2</span>
                  <span><strong>Review Evidence:</strong> Repeated errors with unlike denominators + 3 AI questions</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">3</span>
                  <span><strong>Assign Intervention:</strong> Visual Explanation on Comparing Fractions</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">4</span>
                  <span><strong>Reassess:</strong> Import Report 2 → Score jumps from 50% to 80% (+30pp)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Button variant="secondary" size="sm" onClick={() => navigate('students')} icon={<Users size={14} />} className="justify-center">
                  Students List
                </Button>
                <Button variant="secondary" size="sm" onClick={() => navigate('analytics')} icon={<TrendingUp size={14} />} className="justify-center">
                  Class Heatmap
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onSuccess={(studentId) => { navigate(`students/${studentId}`); fetchStats(); }}
        />
      )}
    </div>
  );
}
