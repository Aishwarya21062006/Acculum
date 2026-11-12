import React, { useEffect, useState } from 'react';
import { interventionsApi } from '../api';
import { Intervention } from '../types';
import { Card } from '../components/ui/Card';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface InterventionsPageProps { navigate: (to: string) => void; }

export function InterventionsPage({ navigate }: InterventionsPageProps) {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interventionsApi.list().then(setInterventions).catch(console.error).finally(() => setLoading(false));
  }, []);

  const withReassessment = interventions.filter(iv => iv.before_score_numerator !== undefined);
  const pending = interventions.filter(iv => iv.status === 'assigned' || iv.status === 'in_progress');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Interventions', value: interventions.length, color: 'bg-indigo-50 text-indigo-700' },
          { label: 'In Progress', value: pending.length, color: 'bg-amber-50 text-amber-700' },
          { label: 'With Results', value: withReassessment.length, color: 'bg-emerald-50 text-emerald-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color} rounded-lg px-2 py-0.5 inline-block`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-center text-gray-400 py-12">Loading...</p>
        ) : interventions.length === 0 ? (
          <div className="text-center py-12">
            <Activity size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No interventions yet.</p>
            <p className="text-sm text-gray-400 mt-1">Assign interventions from the Learning Signals or Student pages.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                {['Student', 'Type', 'Topic', 'Format', 'Status', 'Assigned', 'Before', 'After', 'Change'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {interventions.map(iv => {
                const beforePct = iv.before_score_denominator
                  ? Math.round(((iv.before_score_numerator || 0) / iv.before_score_denominator) * 100) : null;
                const afterPct = iv.after_score_denominator
                  ? Math.round(((iv.after_score_numerator || 0) / iv.after_score_denominator) * 100) : null;
                const change = afterPct !== null && beforePct !== null ? afterPct - beforePct : null;

                return (
                  <tr
                    key={iv.id}
                    onClick={() => iv.student_id && navigate(`students/${iv.student_id}`)}
                    className="hover:bg-indigo-50/20 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3.5 font-medium text-gray-900">
                      {iv.student_name || '—'}
                      <p className="text-xs text-gray-400 font-normal">Class {iv.student_class}</p>
                    </td>
                    <td className="px-4 py-3.5 capitalize text-gray-700">{iv.intervention_type}</td>
                    <td className="px-4 py-3.5 text-gray-600 max-w-28">
                      <p className="truncate">{iv.topic || iv.subject || '—'}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">{iv.format || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        iv.status === 'completed' ? 'bg-emerald-100 text-emerald-700'
                          : iv.status === 'assigned' ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>{iv.status}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">
                      {new Date(iv.assigned_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 font-medium">
                      {beforePct !== null ? `${beforePct}%` : '—'}
                    </td>
                    <td className="px-4 py-3.5 font-medium">
                      {afterPct !== null ? <span className={afterPct >= (beforePct || 0) ? 'text-emerald-600' : 'text-red-600'}>{afterPct}%</span> : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      {change !== null ? (
                        <div className="flex items-center gap-1">
                          {change > 0 ? <TrendingUp size={14} className="text-emerald-500" /> : change < 0 ? <TrendingDown size={14} className="text-red-500" /> : <Minus size={14} className="text-gray-400" />}
                          <span className={`text-xs font-semibold ${change > 0 ? 'text-emerald-600' : change < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                            {change > 0 ? '+' : ''}{change}pp
                          </span>
                        </div>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
