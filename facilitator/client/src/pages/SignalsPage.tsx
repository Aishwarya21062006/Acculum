import React, { useEffect, useState } from 'react';
import { studentsApi, interventionsApi } from '../api';
import { Student, LearningSignal } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SignalBadge } from '../components/ui/SignalBadge';
import { InterventionModal } from '../components/InterventionModal';
import { ChevronDown, ChevronUp, Zap, Filter } from 'lucide-react';

interface SignalsPageProps { navigate: (to: string) => void; }

interface SignalWithStudent extends LearningSignal {
  student_name: string;
  student_class: string;
  student_db_id: string;
}

export function SignalsPage({ navigate }: SignalsPageProps) {
  const [allSignals, setAllSignals] = useState<SignalWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');
  const [selectedSignal, setSelectedSignal] = useState<{ signal: LearningSignal; student: Student } | null>(null);

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const students = await studentsApi.list();
      const signalList: SignalWithStudent[] = [];
      for (const s of students) {
        const sigs = await studentsApi.getSignals(s.id);
        for (const sig of sigs) {
          signalList.push({ ...sig, student_name: s.full_name, student_class: s.class, student_db_id: s.id });
        }
      }
      setAllSignals(signalList);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSignals(); }, []);

  const toggle = (id: string) => setExpanded(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const filtered = allSignals.filter(s => {
    if (filterType && s.signal_type !== filterType) return false;
    if (filterSeverity && s.severity !== filterSeverity) return false;
    if (filterStatus && s.status !== filterStatus) return false;
    return true;
  });

  const SIGNAL_TYPES = ['PERFORMANCE_SIGNAL', 'REPEATED_ERROR_SIGNAL', 'CONFIDENCE_PERFORMANCE_SIGNAL', 'ENGAGEMENT_SIGNAL', 'HELP_SEEKING_SIGNAL', 'IMPROVEMENT_SIGNAL', 'PERSISTENCE_SIGNAL'];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <p className="text-sm text-gray-500">{filtered.length} signal{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <Filter size={14} className="text-gray-400" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-gray-600">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="monitoring">Monitoring</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-gray-600">
          <option value="">All Signal Types</option>
          {SIGNAL_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-gray-600">
          <option value="">All Severities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-gray-200 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Zap size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No signals found with current filters.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(sig => {
            const isExpanded = expanded.has(sig.id);
            const evidence = Array.isArray(sig.evidence) ? sig.evidence : JSON.parse(sig.evidence || '[]');
            const sevColor = sig.severity === 'high' ? 'border-l-red-500' : sig.severity === 'medium' ? 'border-l-amber-500' : 'border-l-blue-400';

            return (
              <div key={sig.id} className={`bg-white rounded-xl border border-gray-200 border-l-4 ${sevColor} shadow-sm overflow-hidden`}>
                <div className="p-4 flex items-start justify-between gap-4">
                  {/* WHO WHERE WHY */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <button
                        onClick={() => navigate(`students/${sig.student_db_id}`)}
                        className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                      >
                        {sig.student_name}
                      </button>
                      <span className="text-xs text-gray-400">Class {sig.student_class}</span>
                      <SignalBadge signalType={sig.signal_type} />
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${sig.status === 'active' ? 'bg-red-50 text-red-700' : sig.status === 'monitoring' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                        {sig.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      WHERE: {sig.subject} → {sig.topic}{sig.subtopic ? ` → ${sig.subtopic}` : ''}
                    </p>
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">WHY (Evidence)</p>
                      <ul className="space-y-0.5">
                        {(isExpanded ? evidence : evidence.slice(0, 2)).map((ev: string, i: number) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5">
                            <span className="text-gray-300 mt-0.5">•</span>{ev}
                          </li>
                        ))}
                        {!isExpanded && evidence.length > 2 && (
                          <li className="text-xs text-gray-400">+{evidence.length - 2} more...</li>
                        )}
                      </ul>
                    </div>
                    {isExpanded && (
                      <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                        <p className="text-xs font-semibold text-indigo-600 mb-1">WHAT (Suggested Action)</p>
                        <p className="text-sm text-indigo-900">{sig.recommended_action}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    {sig.status === 'active' && (
                      <Button
                        size="sm"
                        onClick={() => setSelectedSignal({ signal: sig, student: { id: sig.student_db_id, full_name: sig.student_name } as Student })}
                        icon={<Zap size={12} />}
                      >
                        Intervene
                      </Button>
                    )}
                    <button
                      onClick={() => toggle(sig.id)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? <><ChevronUp size={12} />Less</> : <><ChevronDown size={12} />More</>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedSignal && (
        <InterventionModal
          signal={selectedSignal.signal}
          studentId={selectedSignal.student.id}
          studentName={selectedSignal.student.full_name}
          onClose={() => setSelectedSignal(null)}
          onSuccess={() => { setSelectedSignal(null); fetchSignals(); }}
        />
      )}
    </div>
  );
}
