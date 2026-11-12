import React, { useEffect, useState } from 'react';
import { reportsApi } from '../api';
import { StudentReport } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ImportModal } from '../components/ImportModal';
import { Upload, FileJson, Clock } from 'lucide-react';

interface ReportsPageProps { navigate: (to: string) => void; }

export function ReportsPage({ navigate }: ReportsPageProps) {
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);

  const fetchReports = async () => {
    try { setReports(await reportsApi.list()); } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{reports.length} report{reports.length !== 1 ? 's' : ''} imported</p>
        <Button onClick={() => setShowImport(true)} icon={<Upload size={15} />}>
          + Import Student Report
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <FileJson size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-1">No reports imported yet</p>
            <p className="text-sm text-gray-400 mb-4">Import a JSON report generated from the Acculum student app.</p>
            <Button onClick={() => setShowImport(true)} icon={<Upload size={15} />}>Import Report</Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                {['Student', 'Class', 'Report Date', 'Imported', 'Version', 'Activities', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reports.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold">
                        {(r.full_name || '?').charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{r.full_name || '—'}</span>
                      {r.is_demo ? <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Demo</span> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">Class {r.class || '—'}</td>
                  <td className="px-4 py-3.5 text-gray-600">
                    {new Date(r.report_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(r.imported_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><span className="font-mono text-xs text-gray-500">v{r.report_version}</span></td>
                  <td className="px-4 py-3.5 text-gray-600">{r.activities_count || 0}</td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => navigate(`students/${(r as any).student_db_id || r.student_id}`)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                    >
                      View Student →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onSuccess={(id) => { navigate(`students/${id}`); fetchReports(); }}
        />
      )}
    </div>
  );
}
