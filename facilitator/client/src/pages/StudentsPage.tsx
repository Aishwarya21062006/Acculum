import React, { useEffect, useState } from 'react';
import { studentsApi } from '../api';
import { Student } from '../types';
import { PriorityBadge } from '../components/ui/Badge';
import { SignalBadge } from '../components/ui/SignalBadge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ImportModal } from '../components/ImportModal';
import { Button } from '../components/ui/Button';
import { Search, Upload, SlidersHorizontal, ChevronRight } from 'lucide-react';

interface StudentsPageProps { navigate: (to: string) => void; }

export function StudentsPage({ navigate }: StudentsPageProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [showImport, setShowImport] = useState(false);

  const fetchStudents = async () => {
    try {
      const data = await studentsApi.list();
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const classes = [...new Set(students.map(s => s.class).filter(Boolean))].sort();

  const filtered = students.filter(s => {
    if (search && !s.full_name.toLowerCase().includes(search.toLowerCase()) && !s.student_id.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterPriority && s.priority !== filterPriority) return false;
    if (filterClass && s.class !== filterClass) return false;
    return true;
  });

  const priorityOrder: Record<string, number> = {
    intervention_required: 0, needs_attention: 1, on_track: 2, improving: 3
  };
  filtered.sort((a, b) => (priorityOrder[a.priority || ''] ?? 9) - (priorityOrder[b.priority || ''] ?? 9));

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{students.length} student{students.length !== 1 ? 's' : ''} in your cohort</p>
        <Button onClick={() => setShowImport(true)} icon={<Upload size={15} />} size="sm">
          + Import Report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search by name or ID..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <select
          value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-600"
        >
          <option value="">All Priorities</option>
          <option value="intervention_required">Requires Intervention</option>
          <option value="needs_attention">Needs Attention</option>
          <option value="on_track">On Track</option>
          <option value="improving">Improving</option>
        </select>
        <select
          value={filterClass} onChange={e => setFilterClass(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-600"
        >
          <option value="">All Classes</option>
          {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              {['Student', 'Class', 'Latest Score', 'Current Topic', 'Signal', 'Priority', 'Last Report', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-gray-400">
                  {students.length === 0 ? 'No student reports imported yet.' : 'No students match your search.'}
                </td>
              </tr>
            ) : (
              filtered.map(student => (
                <tr
                  key={student.id}
                  onClick={() => navigate(`students/${student.id}`)}
                  className="hover:bg-indigo-50/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="font-medium text-gray-900">{student.full_name}</p>
                      <p className="text-xs text-gray-400">{student.student_id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">Class {student.class}</td>
                  <td className="px-4 py-3.5">
                    {student.latest_score !== undefined ? (
                      <div className="flex items-center gap-2 w-28">
                        <ProgressBar value={student.latest_score} showLabel />
                      </div>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    {student.current_topic ? (
                      <div>
                        <p className="text-gray-700">{student.current_topic}</p>
                        <p className="text-xs text-gray-400">{student.current_subject}</p>
                      </div>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    {student.top_signal_type ? (
                      <SignalBadge signalType={student.top_signal_type} />
                    ) : (
                      <span className="text-xs text-gray-300">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <PriorityBadge priority={student.priority} />
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">
                    {student.last_report_date
                      ? new Date(student.last_report_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                      : '—'
                    }
                  </td>
                  <td className="px-4 py-3.5">
                    <ChevronRight size={16} className="text-gray-300" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onSuccess={(id) => { navigate(`students/${id}`); fetchStudents(); }}
        />
      )}
    </div>
  );
}
