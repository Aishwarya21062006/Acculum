"use client";

import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Filter, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';

const MOCK_STUDENTS = [
  { id: 1, name: 'Anisha', avatar: '🦁', class: 7, section: 'A', xp: 1200, streak: 5, score: 42, trend: 'down', signal: 'Confidence Mismatch', signalColor: 'red' },
  { id: 4, name: 'Arjun', avatar: '🦅', class: 8, section: 'C', xp: 5200, streak: 20, score: 95, trend: 'up', signal: 'Ready to Advance', signalColor: 'green' },
  { id: 5, name: 'Kavya', avatar: '🐼', class: 7, section: 'A', xp: 450, streak: 1, score: 62, trend: 'flat', signal: 'On Track', signalColor: 'none' },
  { id: 7, name: 'Meera', avatar: '🦊', class: 7, section: 'A', xp: 150, streak: 0, score: 35, trend: 'down', signal: 'Needs Support', signalColor: 'red' },
  { id: 2, name: 'Rahul', avatar: '🐯', class: 9, section: 'B', xp: 3400, streak: 12, score: 88, trend: 'up', signal: 'Excellent', signalColor: 'green' },
];

export default function StudentsPage() {
  const { teacher } = useAuthStore();
  if (!teacher) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Students</h1>
          <p className="text-slate-500 mt-1">Classes {teacher.classes.join(', ')} — {MOCK_STUDENTS.length} students shown</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search students..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 w-full" />
          </div>
          <Button variant="outline" className="bg-white"><Filter className="w-5 h-5" /></Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['All Classes', 'Class 7A', 'Class 8C', 'Class 9B'].map((f, i) => (
          <button key={i} className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-semibold transition-colors ${i === 0 ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}>{f}</button>
        ))}
      </div>

      {/* Student Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Score</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">XP</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Streak</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">AI Signal</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_STUDENTS.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl border border-slate-200">{s.avatar}</div>
                      <span className="font-semibold text-slate-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">Class {s.class}{s.section}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${s.score >= 75 ? 'text-emerald-600' : s.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{s.score}%</span>
                      {s.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                      {s.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                      {s.trend === 'flat' && <Minus className="w-4 h-4 text-slate-400" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">⭐ {s.xp.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">🔥 {s.streak} days</td>
                  <td className="px-6 py-4">
                    {s.signalColor !== 'none' ? (
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        s.signalColor === 'red' ? 'bg-red-50 text-red-700 border border-red-100' :
                        s.signalColor === 'green' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>{s.signal}</span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">{s.signal}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-50">
                      View <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
