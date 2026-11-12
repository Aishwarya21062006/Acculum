'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { getTheme } from '@/lib/themes';
import { getSubjectsForClass } from '@/lib/subjects';
import { DEMO_SUBJECT_PROGRESS, getStatusColor, getStatusLabel } from '@/lib/subjects/subject-progress';

export default function SubjectsPage() {
  const { student } = useAuthStore();
  if (!student) return null;

  const theme = getTheme(student.interests);
  const isCricket = theme.implemented;
  const subjects = getSubjectsForClass(student.class);
  const overall = Math.round(DEMO_SUBJECT_PROGRESS.reduce((s, p) => s + p.progress, 0) / DEMO_SUBJECT_PROGRESS.length);

  return (
    <div className={`p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in`}>
      <div>
        <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${isCricket ? 'text-white' : 'text-slate-900'}`}>
          My Subjects
        </h1>
        <p className={`mt-2 ${isCricket ? 'text-slate-300' : 'text-slate-500'}`}>
          Class {student.class} · Overall Progress: <span className="font-bold text-[var(--theme-primary)]">{overall}%</span>
        </p>
      </div>

      {/* Subject Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEMO_SUBJECT_PROGRESS.map(subjectProgress => {
          const subject = subjects.find(s => s.id === subjectProgress.subjectId);
          if (!subject) return null;

          const StatusIcon = subjectProgress.status === 'strong' ? CheckCircle2 :
            subjectProgress.status === 'needs-attention' ? AlertTriangle : TrendingUp;

          return (
            <Link href="/student/learn" key={subject.id}>
              <Card className={`h-full cursor-pointer group transition-all hover:-translate-y-1 ${
                isCricket
                  ? 'bg-[#061d0f]/80 backdrop-blur-md border border-white/10 hover:border-yellow-400/70 hover:shadow-yellow-900/30 hover:shadow-lg'
                  : 'bg-white border-slate-200 hover:shadow-lg hover:border-[var(--theme-primary)]'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl ${subject.lightBg} border ${subject.borderColor} flex items-center justify-center text-3xl`}>
                      {subject.icon}
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                      subjectProgress.status === 'strong' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      subjectProgress.status === 'needs-attention' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      <StatusIcon className="w-3 h-3 inline mr-1" />
                      {getStatusLabel(subjectProgress.status)}
                    </span>
                  </div>

                  <h3 className={`text-xl font-bold mb-1 transition-colors ${
                    isCricket ? 'text-white group-hover:text-yellow-300' : 'text-slate-900 group-hover:text-[var(--theme-primary)]'
                  }`}>{subject.name}</h3>
                  <p className={`text-sm mb-4 ${isCricket ? 'text-green-100/60' : 'text-slate-500'}`}>
                    {subjectProgress.chaptersCompleted}/{subjectProgress.totalChapters} chapters completed
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={isCricket ? 'text-green-100/70' : 'text-slate-600'}>Progress</span>
                      <span className={`font-bold ${isCricket ? 'text-yellow-400' : 'text-[var(--theme-primary)]'}`}>{subjectProgress.progress}%</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isCricket ? 'bg-black/40' : 'bg-slate-100'}`}>
                      <div
                        className={`h-full rounded-full transition-all ${
                          subjectProgress.status === 'strong' ? 'bg-emerald-500' :
                          subjectProgress.status === 'needs-attention' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${subjectProgress.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className={`flex items-center justify-between mt-4 pt-4 border-t ${
                    isCricket ? 'border-white/10' : 'border-slate-100'
                  }`}>
                    <span className={`text-xs ${isCricket ? 'text-green-300' : 'text-slate-400'}`}>
                      Last: {subjectProgress.lastActivity}
                    </span>
                    <span className={`text-sm font-bold flex items-center gap-1 transition-colors ${
                      isCricket ? 'text-yellow-400' : 'text-[var(--theme-primary)]'
                    }`}>
                      Continue <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
