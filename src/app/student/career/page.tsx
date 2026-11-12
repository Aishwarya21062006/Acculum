"use client";

import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Compass, Sparkles, BookOpen } from 'lucide-react';
import { getCareersByInterest } from '@/lib/career';

export default function CareerPage() {
  const { student } = useAuthStore();
  
  if (!student) return null;

  const recommendedCareers = getCareersByInterest(student.interests);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Career Roadmaps</h1>
          <p className="text-slate-500">See how what you learn today builds your tomorrow.</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-sm">
          <Compass className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-light)] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-20 scale-150">
          <Target className="w-48 h-48" />
        </div>
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-2 text-[var(--theme-light)] font-bold text-sm uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" /> AI Recommended
          </div>
          <h2 className="text-2xl font-bold mb-2">Because you like {student.interests[0]}</h2>
          <p className="opacity-90">We've mapped out some exciting career paths that combine your interests with the subjects you are studying.</p>
        </div>
      </div>

      <div className="space-y-6">
        {recommendedCareers.map((career) => (
          <Card key={career.id} className="border-slate-200 overflow-hidden group">
            <CardContent className="p-0">
              <div className="p-6 md:p-8 bg-white border-b border-slate-100 flex flex-col md:flex-row gap-6 items-start">
                <div className="text-6xl p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm group-hover:scale-105 transition-transform">
                  {career.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{career.title}</h3>
                  <p className="text-slate-600 mb-4">{career.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {career.requiredSkills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                    <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-800 mb-1">AI Evolution</h4>
                      <p className="text-xs text-amber-700 leading-relaxed">{career.aiEvolution}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 md:p-8 bg-slate-50">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-slate-400" /> Your Roadmap
                </h4>
                <div className="space-y-4">
                  {career.roadmap.slice(0, 3).map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-[var(--theme-primary)] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-md">
                          {typeof step.class === 'number' ? `C${step.class}` : '🎓'}
                        </div>
                        {i < 2 && <div className="w-0.5 h-full bg-[var(--theme-primary)]/30 my-1"></div>}
                      </div>
                      <div className="pb-4">
                        <h5 className="font-bold text-slate-900">{step.focus}</h5>
                        <p className="text-sm text-slate-500 mt-1">{step.skills.join(' • ')}</p>
                      </div>
                    </div>
                  ))}
                  <div className="ml-12 text-sm font-bold text-[var(--theme-primary)] cursor-pointer hover:underline">
                    View Full Roadmap →
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
