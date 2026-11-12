"use client";

import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Filter, Search, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const MOCK_INTERVENTIONS = [
  { id: 1, student: 'Anisha', class: '7A', avatar: '🦁', topic: 'Electricity', type: 'Confidence-Performance Mismatch', score: 42, conf: 5, action: 'Revision + Conceptual Practice', level: 'red', date: 'Today' },
  { id: 2, student: 'Meera', class: '7A', avatar: '🦊', topic: 'Fractions', type: 'Low Score (Repeated)', score: 35, conf: 2, action: 'Additional Practice', level: 'yellow', date: 'Today' },
  { id: 3, student: 'Kavya', class: '7A', avatar: '🐼', topic: 'Light Reflection', type: 'Low Engagement', score: 0, conf: 0, action: 'Check-in / Motivation', level: 'yellow', date: 'Yesterday' },
  { id: 4, student: 'Arjun', class: '8C', avatar: '🦅', topic: 'Robotics Basics', type: 'Ready to Advance', score: 95, conf: 5, action: 'Advanced Challenge', level: 'green', date: 'Yesterday' },
];

export default function InterventionsPage() {
  const { teacher } = useAuthStore();
  const [resolved, setResolved] = useState<number[]>([]);

  if (!teacher) return null;

  const handleResolve = (id: number) => {
    setResolved(prev => [...prev, id]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <AlertTriangle className="text-red-500 w-8 h-8" />
            Intervention Center
          </h1>
          <p className="text-slate-500 mt-1">Students who need your support based on AI signals.</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search students..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
            />
          </div>
          <Button variant="outline" className="bg-white"><Filter className="w-5 h-5" /></Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['All Alerts', 'High Priority (Red)', 'Needs Practice (Yellow)', 'Advanced (Green)', 'Resolved'].map((filter, i) => (
          <button key={i} className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-semibold transition-colors ${i === 0 ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}>
            {filter}
          </button>
        ))}
      </div>

      <div className="space-y-4 mt-6">
        {MOCK_INTERVENTIONS.filter(inv => !resolved.includes(inv.id)).map(inv => (
          <Card key={inv.id} className={`border-l-4 ${inv.level === 'red' ? 'border-l-red-500' : inv.level === 'yellow' ? 'border-l-amber-500' : 'border-l-emerald-500'} shadow-sm hover:shadow-md transition-shadow`}>
            <CardContent className="p-5 md:p-6">
              <div className="flex flex-col md:flex-row gap-6 md:items-center">
                
                {/* Student Info */}
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl border border-slate-200">
                    {inv.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{inv.student}</h3>
                    <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 rounded text-slate-600">Class {inv.class}</span>
                  </div>
                </div>

                {/* Issue Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${
                      inv.level === 'red' ? 'bg-red-50 text-red-700' : 
                      inv.level === 'yellow' ? 'bg-amber-50 text-amber-700' : 
                      'bg-emerald-50 text-emerald-700'
                    }`}>
                      {inv.type}
                    </span>
                    <span className="text-sm text-slate-500">{inv.date}</span>
                  </div>
                  <p className="text-sm text-slate-700">Topic: <span className="font-bold text-slate-900">{inv.topic}</span></p>
                  
                  {inv.score > 0 && (
                    <div className="flex gap-4 text-sm mt-2 bg-slate-50 p-2 rounded-lg inline-flex border border-slate-100">
                      <span className="font-medium">Score: <span className={inv.score < 50 ? 'text-red-600 font-bold' : inv.score > 80 ? 'text-emerald-600 font-bold' : ''}>{inv.score}%</span></span>
                      {inv.conf > 0 && <span className="font-medium">Confidence: <span className="font-bold">{inv.conf}/5</span></span>}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">AI Recommendation</p>
                  <p className="text-sm font-semibold text-slate-900 mb-2">{inv.action}</p>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className={`flex-1 ${inv.level === 'red' ? 'bg-red-600 hover:bg-red-700' : inv.level === 'yellow' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'} text-white`}>
                      Take Action
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleResolve(inv.id)} className="px-2" title="Mark Resolved">
                      <CheckCircle2 className="w-4 h-4 text-slate-400 hover:text-emerald-500 transition-colors" />
                    </Button>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        ))}

        {MOCK_INTERVENTIONS.filter(inv => !resolved.includes(inv.id)).length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">All caught up!</h3>
            <p className="text-slate-500">No active interventions needed right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
