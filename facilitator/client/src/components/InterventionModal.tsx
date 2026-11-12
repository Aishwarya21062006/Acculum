import React, { useState } from 'react';
import { interventionsApi } from '../api';
import { LearningSignal, CreateInterventionData } from '../types';
import { Button } from './ui/Button';
import { X, CheckCircle2 } from 'lucide-react';

interface InterventionModalProps {
  signal: LearningSignal;
  studentId: string;
  studentName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const INTERVENTION_TYPES = [
  { value: 'revision', label: 'Assign Revision', desc: 'Targeted topic revision' },
  { value: 'practice', label: 'Assign Practice', desc: 'Additional practice questions' },
  { value: 'explanation', label: 'Send Explanation', desc: 'Personalized explanation' },
  { value: 'peer_help', label: 'Recommend Peer Help', desc: 'Peer support recommendation' },
  { value: 'support', label: 'Schedule Support', desc: 'One-to-one or group session' },
  { value: 'reassessment', label: 'Create Reassessment', desc: 'Follow-up assessment' },
];

const FORMATS = ['Video', 'Story', 'Text', 'Audio', 'Interactive', 'Quiz', 'Visual Explanation', 'Guided Practice'];
const DIFFICULTIES = ['Easy', 'Current Level', 'Medium', 'Hard'];
const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati'];

export function InterventionModal({ signal, studentId, studentName, onClose, onSuccess }: InterventionModalProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<Partial<CreateInterventionData>>({
    student_id: studentId,
    signal_id: signal.id,
    intervention_type: 'revision',
    subject: signal.subject,
    topic: signal.topic,
    language: 'English',
    format: 'Visual Explanation',
    difficulty: 'Current Level',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await interventionsApi.create(data as CreateInterventionData);
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h2 className="font-semibold text-gray-900">Assign Intervention</h2>
            <p className="text-xs text-gray-500 mt-0.5">For {studentName} · {signal.subject} → {signal.topic}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
            <p className="font-semibold text-gray-900">Intervention Assigned</p>
            <p className="text-sm text-gray-500 mt-1">The intervention has been recorded and the student will be monitored.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Acculum Recommendation */}
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <p className="text-xs font-semibold text-indigo-600 mb-1">Acculum Recommendation</p>
              <p className="text-sm text-indigo-900">{signal.recommended_action}</p>
            </div>

            {/* Intervention Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Intervention Type</label>
              <div className="grid grid-cols-2 gap-2">
                {INTERVENTION_TYPES.map((t) => (
                  <button
                    key={t.value} type="button"
                    onClick={() => setData(d => ({ ...d, intervention_type: t.value }))}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                      data.intervention_type === t.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-indigo-300 text-gray-600'
                    }`}
                  >
                    <div className="font-medium">{t.label}</div>
                    <div className="text-gray-400 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Subject', key: 'subject', type: 'text' },
                { label: 'Topic', key: 'topic', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input
                    type={type} value={(data as any)[key] || ''}
                    onChange={(e) => setData(d => ({ ...d, [key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Language</label>
                <select
                  value={data.language || 'English'}
                  onChange={(e) => setData(d => ({ ...d, language: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Format</label>
                <select
                  value={data.format || 'Visual Explanation'}
                  onChange={(e) => setData(d => ({ ...d, format: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {FORMATS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Difficulty</label>
                <select
                  value={data.difficulty || 'Current Level'}
                  onChange={(e) => setData(d => ({ ...d, difficulty: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Facilitator Notes (optional)</label>
              <textarea
                value={data.notes || ''}
                onChange={(e) => setData(d => ({ ...d, notes: e.target.value }))}
                rows={3} placeholder="Any specific notes for this intervention..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1 justify-center">Cancel</Button>
              <Button type="submit" loading={loading} className="flex-1 justify-center">Assign Intervention</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
