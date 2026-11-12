"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Target, Clock, BrainCircuit, ArrowRight, BookOpen, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getTranslation } from '@/lib/i18n';
import { getTheme, getMotivation, themeTerm } from '@/lib/themes';
import { QuickSummarize } from '@/components/shared/QuickSummarize';

export default function StudentDashboard() {
  const { student } = useAuthStore();
  const [greeting, setGreeting] = useState('');
  const [motivation, setMotivation] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    if (student) setMotivation(getMotivation(student.interests));
  }, [student?.interests]);

  if (!student) return null;

  const t = (key: any) => getTranslation(student.preferredLanguage, key);
  const theme = getTheme(student.interests);
  const isCricket = theme.implemented;
  const isKan = student.preferredLanguage === 'Kannada';

  // Cricket-aware labels
  const pointsLabel = isCricket ? theme.terms.points : 'XP';
  const quizLabel = isCricket ? theme.terms.quiz : (isKan ? 'ಕ್ವಿಜ್' : 'Quiz');
  const progressLabel = isCricket ? theme.terms.progress : (isKan ? 'ಪ್ರಗತಿ' : 'Progress');
  const streakLabel = isCricket ? theme.terms.streak : (isKan ? t('streak') : 'Streak');

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${isCricket ? 'text-white' : 'text-slate-900'}`}>
            {isKan ? 'ನಮಸ್ಕಾರ' : greeting}, <span className="text-[var(--theme-primary)]">{student.name.split(' ')[0]}</span>! {theme.icon}
          </h1>
          <p className={`mt-2 text-base ${isCricket ? 'text-slate-300' : 'text-slate-500'}`}>{motivation || t('welcome_message')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl shadow-sm border flex items-center gap-2 ${isCricket ? 'bg-[#0a2f1c]/80 backdrop-blur-md border-green-500/30' : 'bg-white border-slate-100'}`}>
            <span className="text-xl">🔥</span>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider leading-none">{streakLabel}</span>
              <span className={`text-sm font-bold leading-tight ${isCricket ? 'text-white' : 'text-slate-700'}`}>{student.streak} {t('days')}</span>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-xl shadow-sm border flex items-center gap-2 ${isCricket ? 'bg-[#0a2f1c]/80 backdrop-blur-md border-green-500/30' : 'bg-white border-slate-100'}`}>
            <span className="text-xl">👑</span>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider leading-none">{pointsLabel}</span>
              <span className="text-sm font-bold text-[var(--theme-primary)] leading-tight">{student.xp.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Quick Summarize — 3 input widget */}
          <QuickSummarize />

          {/* Continue Learning - Big Card */}
          <Card className={`border-0 shadow-lg overflow-hidden relative ${isCricket ? 'bg-[#061d0f]/80 backdrop-blur-md border border-white/10' : 'bg-white'}`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--theme-primary)] opacity-5 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <CardContent className="p-0">
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">Science</span>
                  <span className="text-sm text-slate-400 font-medium">Class {student.class}</span>
                  {isCricket && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">🏏 Cricket Context</span>}
                </div>
                <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${isCricket ? 'text-white' : 'text-slate-900'}`}>
                  {isCricket ? '⚡ Electricity & Cricket Stadiums' : 'Electricity & Circuits'}
                </h2>
                <p className={`mb-6 max-w-lg ${isCricket ? 'text-green-100/70' : 'text-slate-600'}`}>
                  {isCricket
                    ? "How does a cricket stadium light up? Learn about electric current, conductors, and circuits through the lens of stadium power systems!"
                    : "Learn about electric current, conductors, and how to build simple circuits."}
                </p>

                <div className="mb-6">
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className={isCricket ? 'text-green-100' : 'text-slate-700'}>{progressLabel}</span>
                    <span className="text-[var(--theme-primary)]">{isCricket ? '68 runs scored' : '68%'}</span>
                  </div>
                  <div className={`w-full h-3 rounded-full overflow-hidden ${isCricket ? 'bg-black/50' : 'bg-slate-100'}`}>
                    <div className="h-full bg-[var(--theme-gradient)] rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link href="/student/learn/1" className="w-full sm:w-auto">
                    <Button className={`w-full sm:w-auto h-12 px-8 text-base font-bold ${isCricket ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-500' : 'bg-[var(--theme-primary)] hover:opacity-90 text-white'}`}>
                      <PlayCircle className="w-5 h-5 mr-2" />
                      {isCricket ? 'Continue Innings' : t('continue_lesson')}
                    </Button>
                  </Link>
                  <span className={`text-sm font-medium flex items-center gap-1 ${isCricket ? 'text-green-300' : 'text-slate-500'}`}>
                    <Clock className="w-4 h-4" /> ~15 {t('mins_remaining')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommended For You */}
          <div>
            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isCricket ? 'text-white' : 'text-slate-900'}`}>
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              {t('recommended_for_you')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className={`cursor-pointer group transition-all ${isCricket ? 'bg-[#0a2a16]/80 backdrop-blur-sm border-white/5 hover:border-yellow-400' : 'bg-white hover:border-[var(--theme-primary)]'}`}>
                <CardContent className="p-5">
                  <p className="text-xs font-semibold text-[var(--theme-primary)] mb-2">
                    {t('because_you_like')} {student.interests[0]}...
                  </p>
                  <h4 className={`font-bold mb-1 transition-colors ${isCricket ? 'text-white group-hover:text-yellow-400' : 'text-slate-900 group-hover:text-[var(--theme-primary)]'}`}>
                    {isCricket ? '🏏 Probability Through Cricket Matches' : `Probability & ${student.interests[0]}`}
                  </h4>
                  <p className={`text-sm mb-4 ${isCricket ? 'text-green-100/60' : 'text-slate-500'}`}>
                    {isCricket
                      ? "Calculate the probability of a batter scoring a boundary using real match stats!"
                      : "Learn math concepts through your favorite interest!"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${isCricket ? 'bg-black/50 text-green-300' : 'bg-slate-100 text-slate-600'}`}>Mathematics</span>
                    <span className="text-xs font-bold text-amber-500 flex items-center"><Star className="w-3 h-3 mr-1" /> 200 {pointsLabel}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer group transition-all ${isCricket ? 'bg-[#0a2a16]/80 backdrop-blur-sm border-white/5 hover:border-yellow-400' : 'bg-white hover:border-[var(--theme-primary)]'}`}>
                <CardContent className="p-5">
                  <p className="text-xs font-semibold text-indigo-600 mb-2">
                    {isCricket ? '🏏 Practice Match Recommended' : t('review_recommended')}
                  </p>
                  <h4 className={`font-bold mb-1 transition-colors ${isCricket ? 'text-white group-hover:text-yellow-400' : 'text-slate-900 group-hover:text-[var(--theme-primary)]'}`}>
                    {isCricket ? 'Fractions — Batting Averages' : 'Fractions Basics'}
                  </h4>
                  <p className={`text-sm mb-4 ${isCricket ? 'text-green-100/60' : 'text-slate-500'}`}>
                    {isCricket
                      ? "Calculate batting averages using fractions. Real match data, real learning!"
                      : "A quick 5-minute review to strengthen your foundation."}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${isCricket ? 'bg-black/50 text-green-300' : 'bg-slate-100 text-slate-600'}`}>Mathematics</span>
                    <span className="text-xs font-bold text-amber-500 flex items-center"><Star className="w-3 h-3 mr-1" /> 50 {pointsLabel}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Subject-wise Progress */}
          <div>
            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isCricket ? 'text-white' : 'text-slate-900'}`}>
              📊 Subject-wise Progress
            </h3>
            <Card className={`border-0 shadow-lg ${isCricket ? 'bg-[#061d0f]/80 backdrop-blur-md border border-white/10' : 'bg-white'}`}>
              <CardContent className="p-5 space-y-4">
                {[
                  { name: 'Mathematics', icon: '🔢', progress: 68, color: 'bg-purple-500', status: 'on-track' },
                  { name: 'Science', icon: '🔬', progress: 84, color: 'bg-teal-500', status: 'strong' },
                  { name: 'Social Science', icon: '🌍', progress: 72, color: 'bg-orange-500', status: 'on-track' },
                  { name: 'English', icon: '📝', progress: 91, color: 'bg-blue-500', status: 'strong' },
                  { name: 'Kannada', icon: '🅺', progress: 76, color: 'bg-red-500', status: 'on-track' },
                  { name: 'Hindi', icon: '🇮🇳', progress: 59, color: 'bg-amber-500', status: 'needs-attention' },
                  { name: 'Computer Science', icon: '💻', progress: 88, color: 'bg-slate-500', status: 'strong' },
                ].map((subj, i) => (
                  <Link href="/student/learn" key={i}>
                    <div className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer group transition-colors ${
                      isCricket ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                    }`}>
                      <span className="text-lg w-6 text-center shrink-0">{subj.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className={`text-sm font-bold ${isCricket ? 'text-green-100 group-hover:text-yellow-300' : 'text-slate-700 group-hover:text-[var(--theme-primary)]'} transition-colors`}>
                            {subj.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${
                              subj.status === 'strong' ? 'text-emerald-500' :
                              subj.status === 'needs-attention' ? 'text-red-500' :
                              isCricket ? 'text-yellow-400' : 'text-slate-500'
                            }`}>{subj.progress}%</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              subj.status === 'strong' ? 'bg-emerald-100 text-emerald-700' :
                              subj.status === 'needs-attention' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {subj.status === 'strong' ? '⬆ Strong' : subj.status === 'needs-attention' ? '⚠ Revise' : '✓ OK'}
                            </span>
                          </div>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden ${isCricket ? 'bg-black/40' : 'bg-slate-100'}`}>
                          <div
                            className={`h-full rounded-full ${subj.color} transition-all duration-700`}
                            style={{ width: `${subj.progress}%` }}
                          />
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${isCricket ? 'text-yellow-400' : 'text-slate-400'}`} />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Classroom Today */}
          <div>
            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isCricket ? 'text-white' : 'text-slate-900'}`}>
              🏫 Today in Classroom
            </h3>
            <Card className={`border-0 shadow-lg ${isCricket ? 'bg-[#061d0f]/80 backdrop-blur-md border border-white/10' : 'bg-white'}`}>
              <CardContent className="p-5 space-y-3">
                {[
                  { subject: 'Mathematics', icon: '🔢', topic: 'Addition of Algebraic Expressions', status: 'currently-teaching' as const, hw: 'Exercise 12.2 — Q1 to Q8' },
                  { subject: 'Science', icon: '🔬', topic: 'Pressure and its Applications', status: 'currently-teaching' as const, hw: 'Read pages 112–115' },
                  { subject: 'English', icon: '📝', topic: 'Formal Letter Writing', status: 'currently-teaching' as const, hw: 'Write a letter to the editor' },
                ].map((item, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${
                    isCricket ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'
                  } transition-colors`}>
                    <span className="text-lg">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-bold text-sm ${isCricket ? 'text-white' : 'text-slate-900'}`}>{item.subject}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">In Class</span>
                      </div>
                      <p className={`text-xs mt-0.5 ${isCricket ? 'text-green-100/60' : 'text-slate-500'}`}>{item.topic}</p>
                      {item.hw && <p className={`text-[11px] mt-1 font-medium ${isCricket ? 'text-amber-400/70' : 'text-amber-600'}`}>📚 HW: {item.hw}</p>}
                    </div>
                  </div>
                ))}
                <Link href="/student/classroom">
                  <Button variant="ghost" className={`w-full mt-2 text-sm font-bold ${
                    isCricket ? 'text-green-300 hover:text-white hover:bg-white/10' : 'text-[var(--theme-primary)]'
                  }`}>
                    View Full Class Summary →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">

          {/* Daily Challenge */}
          <Card className="border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl">
            <CardContent className="p-6 relative overflow-hidden">
              <div className="absolute -right-6 -top-6 text-6xl opacity-10">{isCricket ? '🏏' : '🎯'}</div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider mb-2">
                <Target className="w-4 h-4" />
                {isCricket ? "Today's Target" : t('daily_challenge')}
              </div>
              <h3 className="text-xl font-bold mb-2">
                {isCricket ? '🏏 GK Match Challenge' : 'General Knowledge'}
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                {isCricket
                  ? "5 questions to boost your knowledge innings! Keep the streak alive!"
                  : "Complete today's 5 questions to keep your streak alive!"}
              </p>
              <div className="flex items-center justify-between bg-white/10 rounded-xl p-3 mb-6">
                <span className="text-sm font-medium">Reward</span>
                <span className="font-bold text-amber-400">+50 {pointsLabel}</span>
              </div>
              <Link href="/student/quiz">
                <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold">
                  {isCricket ? '🏏 Start Learning Match' : t('start_challenge')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Assignments */}
          <Card className={`border shadow-sm ${isCricket ? 'bg-[#061d0f]/80 backdrop-blur-md border-white/10' : 'border-slate-200 bg-white'}`}>
            <CardContent className="p-6">
              <h3 className={`font-bold mb-4 ${isCricket ? 'text-white' : 'text-slate-900'}`}>
                {isCricket ? '🏏 Match Assignments' : t('upcoming_assignments')}
              </h3>
              <div className="space-y-4">
                <div className={`flex items-start gap-3 p-3 rounded-xl border ${isCricket ? 'bg-red-500/20 border-red-500/30' : 'bg-red-50 border-red-100'}`}>
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${isCricket ? 'text-white' : 'text-slate-900'}`}>
                      {isCricket ? '🏏 Fraction Practice Match' : 'Photosynthesis Quiz'}
                    </h4>
                    <p className={`text-xs font-semibold mt-0.5 ${isCricket ? 'text-red-400' : 'text-red-600'}`}>
                      {isCricket ? '⏰ Due Today — Play your innings!' : 'Due Today!'}
                    </p>
                  </div>
                </div>
                <div className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${isCricket ? 'bg-[#061d0f]/50 hover:bg-[#0a2f1c]' : 'hover:bg-slate-50'}`}>
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${isCricket ? 'text-white' : 'text-slate-900'}`}>
                      {isCricket ? '🏏 Percentage — Player Stats' : 'Creative Writing'}
                    </h4>
                    <p className={`text-xs mt-0.5 ${isCricket ? 'text-slate-400' : 'text-slate-500'}`}>Due in 2 days</p>
                  </div>
                </div>
              </div>
              <Link href="/student/assignments">
                <Button variant="ghost" className={`w-full mt-4 text-center text-sm font-bold hover:underline block pt-2 ${isCricket ? 'text-green-300 hover:text-green-200' : 'text-[var(--theme-primary)] hover:text-indigo-700'}`}>
                  {t('view_all_assignments')} <ArrowRight className="w-4 h-4 ml-1 inline" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* AI Helper Teaser */}
          <Card className={`border-2 ${isCricket ? 'border-green-500/50 bg-[#0a2a16]/80 backdrop-blur-md' : 'border-[var(--theme-primary)] bg-[var(--theme-light)]/50'}`}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--theme-primary)] flex items-center justify-center shrink-0 text-white shadow-md">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h4 className={`font-bold text-sm ${isCricket ? 'text-white' : 'text-slate-900'}`}>{t('ai_helper_teaser')}</h4>
                <p className={`text-xs mt-1 ${isCricket ? 'text-green-100/70' : 'text-slate-600'}`}>
                  {isCricket
                    ? `Ask AI to explain any topic using cricket! 🏏`
                    : t('ai_helper_desc')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
