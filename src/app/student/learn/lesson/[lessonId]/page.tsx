"use client";

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, FileText, Headphones, MonitorPlay, Book, Mic, ArrowRight, ArrowLeft, Lightbulb, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { PersonalizationEngine } from '@/lib/ai/personalization';
import type { LearningFormat } from '@/types';

const FORMATS: { id: LearningFormat, label: string, icon: any }[] = [
  { id: 'Video', label: 'Watch', icon: Video },
  { id: 'Text', label: 'Read', icon: FileText },
  { id: 'Audio', label: 'Listen', icon: Headphones },
  { id: 'Story', label: 'Story', icon: Book },
  { id: 'Simulation', label: 'Simulate', icon: MonitorPlay },
  { id: 'Voice', label: 'Voice', icon: Mic },
];

export default function LessonView() {
  const { student } = useAuthStore();
  const [format, setFormat] = useState<LearningFormat>('Video');
  
  if (!student) return null;

  const example = PersonalizationEngine.getPersonalizedExample('Electric Current', student.interests);

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-3 md:px-8 md:py-4 flex items-center justify-between shadow-sm">
        <Link href="/student/learn/1" className="text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-5 h-5 md:mr-2 inline" /> <span className="hidden md:inline font-medium">Course</span>
        </Link>
        <div className="text-center">
          <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-0.5">Lesson 1</p>
          <h1 className="text-base md:text-lg font-bold text-slate-900">Electric Current Basics</h1>
        </div>
        <Link href="/student/quiz">
          <Button size="sm" className="bg-[var(--theme-primary)]">Quiz <ArrowRight className="w-4 h-4 ml-1 hidden sm:block" /></Button>
        </Link>
      </div>

      <div className="p-4 md:p-8 space-y-8">
        
        {/* Format Picker */}
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Choose how you want to learn:</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {FORMATS.map(f => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all border-2 ${
                  format === f.id 
                    ? 'border-[var(--theme-primary)] bg-[var(--theme-light)] text-[var(--theme-primary)] shadow-sm' 
                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <f.icon className="w-6 h-6 mb-2" />
                <span className="text-xs font-bold">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <Card className="border-0 shadow-lg overflow-hidden bg-white min-h-[400px]">
          {format === 'Video' && (
            <div className="w-full aspect-video bg-slate-900 relative flex items-center justify-center group cursor-pointer">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform relative z-10">
                <PlayCircle className="w-10 h-10 text-white fill-white" />
              </div>
            </div>
          )}
          
          <CardContent className="p-6 md:p-10 prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed text-lg">
            {format === 'Video' && (
              <>
                <h2 className="text-2xl font-bold mb-4">Understanding Electric Current</h2>
                <p>Watch the video above to see how electrons flow through a wire to create electric current.</p>
              </>
            )}
            
            {format === 'Text' && (
              <>
                <h2 className="text-2xl font-bold mb-6">
                  {student.preferredLanguage === 'Kannada' ? 'ವಿದ್ಯುತ್ ಪ್ರವಾಹದ ಮೂಲಗಳು' : 'Electric Current Basics'}
                </h2>
                {student.preferredLanguage === 'Kannada' ? (
                  <>
                    <p className="mb-4">
                      <strong>ವಿದ್ಯುತ್ ಪ್ರವಾಹ</strong> ಎಂದರೆ ವಿದ್ಯುತ್ ಆವೇಶದ ಹರಿವು. ಇದು ಸಾಮಾನ್ಯವಾಗಿ ತಂತಿಯಲ್ಲಿ ಎಲೆಕ್ಟ್ರಾನ್‌ಗಳ ಚಲನೆಯ ಮೂಲಕ ನಡೆಯುತ್ತದೆ.
                    </p>
                    <p className="mb-4">
                      ವಿದ್ಯುತ್ ಪ್ರವಾಹ ಅಳೆಯಲು ಬಳಸುವ SI ಏಕಮಾನ <strong>ಆಂಪಿಯರ್ (A)</strong>. ಇದನ್ನು ಅಮ್ಮೀಟರ್ ಸಾಧನದಿಂದ ಅಳೆಯುತ್ತಾರೆ.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mb-4">
                      <strong>Electric current</strong> is the flow of electric charge. In electric circuits this charge is often carried by moving electrons in a wire.
                    </p>
                    <p className="mb-4">
                      The SI unit for measuring an electric current is the <strong>ampere (A)</strong>, which is the flow of electric charge across a surface at the rate of one coulomb per second.
                    </p>
                    <p className="mb-4">
                      Electric current is measured using a device called an ammeter.
                    </p>
                  </>
                )}
              </>
            )}

            {format === 'Story' && (
              <>
                <h2 className="text-2xl font-bold mb-6">The Journey of Eddie the Electron</h2>
                <p className="mb-4 font-serif text-slate-800 text-xl leading-loose">
                  Once upon a time, inside a very long, very dark copper tunnel, lived Eddie the Electron. Eddie was full of energy, buzzing and bouncing around.
                </p>
                <p className="mb-4 font-serif text-slate-800 text-xl leading-loose">
                  One day, a huge pressure came from behind him—it was the Battery! "Move forward!" it commanded. Suddenly, millions of electrons like Eddie started rushing in one direction. 
                </p>
                <p className="mb-4 font-serif text-slate-800 text-xl leading-loose">
                  This massive rush, this unified sprint of millions of tiny energetic particles, is what humans call <strong>Electric Current</strong>. 
                </p>
              </>
            )}
            
            {/* The Personalized Callout */}
            <div className="mt-8 p-6 rounded-2xl bg-[var(--theme-light)] border border-[var(--theme-primary)]/20 shadow-inner">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--theme-primary)] flex items-center justify-center text-white shrink-0 shadow-md">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--theme-primary)] mb-2 flex items-center gap-2">
                    Because you like {student.interests[0]}!
                  </h4>
                  <p className="text-slate-700 font-medium leading-relaxed">
                    {example}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Step */}
        <div className="flex justify-end pt-4">
          <Link href="/student/quiz">
            <Button className="h-14 px-10 text-lg bg-[var(--theme-primary)] hover:opacity-90 font-bold rounded-xl shadow-lg">
              Take the Quiz <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
