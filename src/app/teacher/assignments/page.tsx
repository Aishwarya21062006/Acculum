"use client";

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle2, BookOpen, Clock, Users } from 'lucide-react';

const EXISTING = [
  { id: 1, subject: 'Science', topic: 'Electricity Revision', class: '7A', due: '2026-09-27', type: 'Practice Quiz' },
  { id: 2, subject: 'Mathematics', topic: 'Fractions Worksheet', class: '7 - All', due: '2026-09-28', type: 'Worksheet' },
  { id: 3, subject: 'English', topic: 'Creative Writing', class: '8C', due: '2026-09-30', type: 'Essay' },
];

export default function AssignmentsPage() {
  const { teacher } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [sent, setSent] = useState(false);

  if (!teacher) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setShowForm(false);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Assignments</h1>
          <p className="text-slate-500 mt-1">Manage and send assignments to your classes</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
          <Plus className="w-5 h-5" /> New Assignment
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="border-purple-200 bg-purple-50/30 shadow-md animate-slide-up">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-900 mb-6 text-xl">Create New Assignment</h3>
            <form onSubmit={handleSend} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subject</label>
                <select className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm">
                  <option>Science</option><option>Mathematics</option><option>English</option><option>Social Science</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Topic / Title</label>
                <input type="text" placeholder="e.g. Electricity Revision" className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Assign To</label>
                <select className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm">
                  <option>Class 7 — All Sections</option><option>Class 7A</option><option>Class 8C</option><option>Class 8 — All Sections</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Assignment Type</label>
                <select className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm">
                  <option>Practice Quiz</option><option>Worksheet</option><option>Essay</option><option>Reading</option><option>Project</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Due Date</label>
                <input type="date" className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Message (Optional)</label>
                <input type="text" placeholder="Add a note for students..." className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm" />
              </div>
              <div className="md:col-span-2 flex gap-3 pt-2">
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-8">Send Assignment</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Active Assignments */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Active Assignments</h2>
        <div className="space-y-3">
          {EXISTING.map(a => (
            <Card key={a.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-slate-900">{a.topic}</h3>
                    <span className="text-xs font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">{a.type}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {a.class}</span>
                    <span className="flex items-center gap-1 text-purple-600"><Clock className="w-4 h-4" /> Due {a.due}</span>
                    <span>{a.subject}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">Active</span>
                  <Button size="sm" variant="outline" className="text-xs">Edit</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Toast */}
      {sent && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-slide-up z-50">
          <CheckCircle2 className="text-emerald-400 w-5 h-5" />
          <p className="text-sm font-medium">Assignment sent to class!</p>
        </div>
      )}
    </div>
  );
}
