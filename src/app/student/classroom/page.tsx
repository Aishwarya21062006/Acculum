'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2, Clock, BookOpen, CalendarDays,
  ChevronDown, AlertTriangle, Zap, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { getTheme } from '@/lib/themes';
import {
  CLASSROOM_PORTIONS, WEEKLY_TIMETABLE, DAILY_SUMMARIES,
  getStatusLabel, getStatusStyles, getTodayDayName, type ClassroomChapter,
} from '@/lib/classroom';
import { DEMO_SUBJECT_PROGRESS } from '@/lib/subjects/subject-progress';

type Tab = 'portions' | 'timetable' | 'summary';

export default function ClassroomPage() {
  const { student } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('portions');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(['math-algebra', 'sci-force']));
  const [activeDay, setActiveDay] = useState<string>(getTodayDayName() === 'Saturday' || getTodayDayName() === 'Sunday' ? 'Monday' : getTodayDayName());

  if (!student) return null;

  const theme = getTheme(student.interests);
  const isCricket = theme.implemented;

  const toggleChapter = (id: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Group classroom portions by subject
  const subjectGroups = CLASSROOM_PORTIONS.reduce<Record<string, ClassroomChapter[]>>((acc, chapter) => {
    if (!acc[chapter.subjectName]) acc[chapter.subjectName] = [];
    acc[chapter.subjectName].push(chapter);
    return acc;
  }, {});

  const todayTimetable = WEEKLY_TIMETABLE.find(d => d.day === activeDay);
  const today = getTodayDayName();

  // Acculum vs Classroom comparison for smart nudge
  const mathAcculumProgress = DEMO_SUBJECT_PROGRESS.find(p => p.subjectId === 'mathematics')?.progress ?? 68;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'portions', label: 'Classroom Portions', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'timetable', label: 'My Timetable', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'summary', label: 'Class Summary', icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <div className={`p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in`}>
      {/* Header */}
      <div>
        <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${isCricket ? 'text-white' : 'text-slate-900'}`}>
          🏫 My Classroom
        </h1>
        <p className={`mt-2 ${isCricket ? 'text-slate-300' : 'text-slate-500'}`}>
          Track what your teacher has taught, your timetable, and daily class summaries.
        </p>
      </div>

      {/* Smart Nudge — Acculum vs Classroom */}
      <div className={`rounded-2xl p-4 border-l-4 border-l-amber-400 ${
        isCricket ? 'bg-[#0a2f1c]/80 backdrop-blur-md border border-white/10 border-l-yellow-400' : 'bg-amber-50 border border-amber-100'
      }`}>
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className={`font-bold text-sm ${isCricket ? 'text-yellow-300' : 'text-amber-800'}`}>
              Personalised Recommendation
            </p>
            <p className={`text-sm mt-1 ${isCricket ? 'text-green-100/80' : 'text-amber-700'}`}>
              Your school has completed <strong>Fractions</strong> and <strong>Linear Equations</strong> in Maths. Your Acculum progress in Mathematics is <strong>{mathAcculumProgress}%</strong>. Would you like to practise before your next class?
            </p>
            <Link href="/student/quiz">
              <Button size="sm" className={`mt-3 font-bold ${
                isCricket ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-500' : 'bg-amber-500 text-white hover:bg-amber-600'
              }`}>
                Practise Fractions Now <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`flex gap-1 p-1 rounded-2xl ${
        isCricket ? 'bg-[#061d0f]/80 backdrop-blur-md border border-white/10' : 'bg-slate-100'
      }`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id
                ? isCricket
                  ? 'bg-yellow-400 text-slate-900 shadow-md'
                  : 'bg-white text-slate-900 shadow-md'
                : isCricket
                  ? 'text-green-100/60 hover:text-white'
                  : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: CLASSROOM PORTIONS ─────────────────────────── */}
      {activeTab === 'portions' && (
        <div className="space-y-6">
          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {[
              { status: 'completed', label: 'Completed' },
              { status: 'currently-teaching', label: 'Currently Teaching' },
              { status: 'upcoming', label: 'Upcoming' },
            ].map(item => {
              const styles = getStatusStyles(item.status as any);
              return (
                <div key={item.status} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${styles.dot}`} />
                  <span className={`text-xs font-semibold ${isCricket ? 'text-green-100/70' : 'text-slate-500'}`}>{item.label}</span>
                </div>
              );
            })}
          </div>

          {/* Subject Groups */}
          {Object.entries(subjectGroups).map(([subjectName, chapters]) => (
            <div key={subjectName}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{chapters[0].subjectIcon}</span>
                <h2 className={`text-lg font-extrabold ${isCricket ? 'text-white' : 'text-slate-900'}`}>{subjectName}</h2>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-auto ${
                  isCricket ? 'bg-green-900/60 text-green-300 border border-green-700/50' : 'bg-slate-100 text-slate-500'
                }`}>
                  {chapters.filter(c => c.overallStatus === 'completed').length}/{chapters.length} chapters done
                </span>
              </div>

              <div className="space-y-2">
                {chapters.map(chapter => {
                  const isExpanded = expandedChapters.has(chapter.id);
                  const overallStyles = getStatusStyles(chapter.overallStatus);

                  return (
                    <Card key={chapter.id} className={`overflow-hidden transition-all ${
                      isCricket
                        ? `bg-[#061d0f]/80 backdrop-blur-md border ${
                            chapter.overallStatus === 'currently-teaching' ? 'border-blue-500/40' :
                            chapter.overallStatus === 'completed' ? 'border-emerald-500/30' :
                            'border-white/10'
                          }`
                        : `bg-white border ${
                            chapter.overallStatus === 'currently-teaching' ? 'border-blue-200 shadow-blue-50 shadow-md' :
                            chapter.overallStatus === 'completed' ? 'border-emerald-100' :
                            'border-slate-200'
                          }`
                    }`}>
                      {/* Chapter header */}
                      <button
                        className="w-full flex items-center gap-4 p-4 text-left"
                        onClick={() => toggleChapter(chapter.id)}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${overallStyles.dot}`} />
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold ${isCricket ? 'text-white' : 'text-slate-900'}`}>{chapter.chapterTitle}</h3>
                          <p className={`text-xs mt-0.5 ${isCricket ? 'text-green-100/50' : 'text-slate-400'}`}>
                            {chapter.topics.filter(t => t.status === 'completed').length}/{chapter.topics.length} topics completed
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${overallStyles.badge} shrink-0`}>
                          {getStatusLabel(chapter.overallStatus)}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''} ${isCricket ? 'text-green-300' : 'text-slate-400'}`} />
                      </button>

                      {/* Topics list */}
                      {isExpanded && (
                        <div className={`border-t px-4 py-3 space-y-2 ${
                          isCricket ? 'border-white/10' : 'border-slate-100'
                        }`}>
                          {chapter.topics.map(topic => {
                            const topicStyles = getStatusStyles(topic.status);
                            return (
                              <div key={topic.id} className={`flex items-center gap-3 py-2 px-3 rounded-xl ${
                                topic.status === 'currently-teaching'
                                  ? isCricket ? 'bg-blue-900/40 border border-blue-500/30' : 'bg-blue-50 border border-blue-100'
                                  : topic.status === 'completed'
                                    ? isCricket ? 'bg-emerald-900/20' : 'bg-emerald-50/50'
                                    : isCricket ? 'bg-white/5' : 'bg-slate-50'
                              }`}>
                                <div className={`w-2 h-2 rounded-full shrink-0 ${topicStyles.dot}`} />
                                <span className={`flex-1 text-sm font-medium ${isCricket ? 'text-green-100' : 'text-slate-700'}`}>
                                  {topic.topic}
                                </span>
                                {topic.status === 'completed' && topic.completedDate && (
                                  <span className={`text-[11px] font-semibold shrink-0 ${isCricket ? 'text-green-400/60' : 'text-slate-400'}`}>
                                    {topic.completedDate}
                                  </span>
                                )}
                                {topic.status === 'currently-teaching' && (
                                  <span className="text-[11px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full shrink-0">
                                    In Class Now
                                  </span>
                                )}
                                {topic.status === 'upcoming' && (
                                  <span className={`text-[11px] font-semibold shrink-0 ${isCricket ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Upcoming
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 2: TIMETABLE ─────────────────────────────────── */}
      {activeTab === 'timetable' && (
        <div className="space-y-4">
          {/* Day selector */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {WEEKLY_TIMETABLE.map(day => (
              <button
                key={day.day}
                onClick={() => setActiveDay(day.day)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-bold transition-all shrink-0 ${
                  activeDay === day.day
                    ? isCricket
                      ? 'bg-yellow-400 text-slate-900 shadow-md'
                      : 'bg-[var(--theme-primary)] text-white shadow-md'
                    : isCricket
                      ? 'bg-[#061d0f]/80 text-green-100 border border-green-800/50 hover:border-yellow-400'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                }`}
              >
                {day.day === today ? `${day.day} (Today)` : day.day}
              </button>
            ))}
          </div>

          {/* Timetable grid */}
          {todayTimetable && (
            <div className="space-y-2">
              {todayTimetable.periods.map((period, i) => {
                const isBreak = period.startTime === '10:30' || period.startTime === '12:30';
                const now = new Date();
                const [h, m] = period.startTime.split(':').map(Number);
                const [eh, em] = period.endTime.split(':').map(Number);
                const startMins = h * 60 + m;
                const endMins = eh * 60 + em;
                const nowMins = now.getHours() * 60 + now.getMinutes();
                const isCurrentPeriod = activeDay === today && nowMins >= startMins && nowMins < endMins;
                const isNextPeriod = activeDay === today && nowMins < startMins && i > 0;

                return (
                  <div key={i}>
                    {/* Implicit break indicators */}
                    {period.period === 3 && (
                      <div className={`flex items-center gap-3 py-2 px-4 rounded-xl text-xs font-bold ${
                        isCricket ? 'text-green-300/60' : 'text-slate-400'
                      }`}>
                        <div className={`flex-1 h-px ${isCricket ? 'bg-white/10' : 'bg-slate-100'}`} />
                        ☕ Short Break (10:30 – 11:00)
                        <div className={`flex-1 h-px ${isCricket ? 'bg-white/10' : 'bg-slate-100'}`} />
                      </div>
                    )}
                    {period.period === 5 && (
                      <div className={`flex items-center gap-3 py-2 px-4 rounded-xl text-xs font-bold ${
                        isCricket ? 'text-green-300/60' : 'text-slate-400'
                      }`}>
                        <div className={`flex-1 h-px ${isCricket ? 'bg-white/10' : 'bg-slate-100'}`} />
                        🍱 Lunch Break (12:30 – 1:15)
                        <div className={`flex-1 h-px ${isCricket ? 'bg-white/10' : 'bg-slate-100'}`} />
                      </div>
                    )}

                    <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      isCurrentPeriod
                        ? isCricket
                          ? 'bg-yellow-400/20 border-yellow-400/50 shadow-lg'
                          : 'bg-[var(--theme-light)] border-[var(--theme-primary)] shadow-md'
                        : isCricket
                          ? 'bg-[#061d0f]/80 backdrop-blur-md border-white/10'
                          : 'bg-white border-slate-200'
                    }`}>
                      {/* Time */}
                      <div className="text-center shrink-0 w-16">
                        <p className={`text-xs font-bold ${isCricket ? 'text-green-300' : 'text-slate-400'}`}>{period.startTime}</p>
                        <p className={`text-[10px] ${isCricket ? 'text-green-300/50' : 'text-slate-300'}`}>{period.endTime}</p>
                      </div>

                      {/* Subject */}
                      <div className={`w-10 h-10 rounded-xl ${period.subjectBg} flex items-center justify-center text-lg shrink-0`}>
                        {period.subjectIcon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`font-bold ${isCricket ? 'text-white' : 'text-slate-900'}`}>{period.subjectName}</p>
                        <p className={`text-xs ${isCricket ? 'text-green-100/50' : 'text-slate-400'}`}>{period.teacher}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isCricket ? 'bg-white/10 text-green-200' : 'bg-slate-100 text-slate-500'}`}>
                          P{period.period}
                        </span>
                        {isCurrentPeriod && (
                          <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                            isCricket ? 'bg-yellow-400 text-slate-900' : 'bg-[var(--theme-primary)] text-white'
                          }`}>
                            <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                            Now
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: CLASS SUMMARY ─────────────────────────────── */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {DAILY_SUMMARIES.map((summary, si) => (
            <div key={si}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
                  isCricket ? 'bg-yellow-400/20 border border-yellow-400/40' : 'bg-[var(--theme-light)] border border-[var(--theme-primary)]/20'
                }`}>
                  📅
                </div>
                <div>
                  <h2 className={`font-extrabold text-lg ${isCricket ? 'text-white' : 'text-slate-900'}`}>{summary.date}</h2>
                  <p className={`text-xs font-semibold ${isCricket ? 'text-green-300/70' : 'text-slate-400'}`}>{summary.day}</p>
                </div>
              </div>

              <div className="space-y-3">
                {summary.entries.map((entry, ei) => (
                  <Card key={ei} className={`overflow-hidden ${
                    isCricket ? 'bg-[#061d0f]/80 backdrop-blur-md border border-white/10' : 'bg-white border-slate-200'
                  }`}>
                    <CardContent className="p-0">
                      {/* Subject header bar */}
                      <div className={`px-5 py-3 border-b flex items-center gap-3 ${
                        isCricket ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'
                      }`}>
                        <span className="text-xl">{entry.subjectIcon}</span>
                        <h3 className={`font-bold text-base ${isCricket ? 'text-white' : 'text-slate-900'}`}>{entry.subjectName}</h3>
                      </div>

                      <div className="px-5 py-4 space-y-4">
                        {/* Topics Covered */}
                        <div>
                          <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isCricket ? 'text-green-400' : 'text-[var(--theme-primary)]'}`}>
                            Topics Covered
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {entry.topicsCovered.map((t, ti) => (
                              <span key={ti} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                                isCricket ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/40' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                ✓ {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Key Concepts */}
                        <div>
                          <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isCricket ? 'text-blue-400' : 'text-blue-600'}`}>
                            Key Concepts
                          </p>
                          <ul className="space-y-1">
                            {entry.keyConcepts.map((c, ci) => (
                              <li key={ci} className={`flex items-start gap-2 text-sm ${
                                isCricket ? 'text-green-100/80' : 'text-slate-700'
                              }`}>
                                <span className={`mt-0.5 shrink-0 ${isCricket ? 'text-blue-400' : 'text-blue-500'}`}>•</span>
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Homework */}
                        {entry.homework && (
                          <div className={`p-3 rounded-xl border ${
                            isCricket ? 'bg-amber-900/30 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
                          }`}>
                            <p className="text-xs font-bold uppercase tracking-wider mb-1">📚 Homework</p>
                            <p className="text-sm font-medium">{entry.homework}</p>
                          </div>
                        )}

                        {/* Upcoming */}
                        {entry.upcomingTopic && (
                          <p className={`text-xs font-semibold flex items-center gap-1 ${
                            isCricket ? 'text-green-300/60' : 'text-slate-400'
                          }`}>
                            <ArrowRight className="w-3 h-3" />
                            Next: {entry.upcomingTopic}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
