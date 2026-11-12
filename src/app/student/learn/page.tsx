'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronRight, Clock, Star, Search, ChevronDown, Lock } from 'lucide-react';
import Link from 'next/link';
import { getTheme } from '@/lib/themes';
import { SUBJECTS, CHAPTERS, getSubjectsForClass, getChaptersForSubjectAndClass } from '@/lib/subjects';
import { DEMO_SUBJECT_PROGRESS } from '@/lib/subjects/subject-progress';
import type { SubjectId } from '@/lib/subjects';

export default function LearnPage() {
  const { student } = useAuthStore();
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expandedSubject, setExpandedSubject] = useState<SubjectId | null>(null);

  if (!student) return null;

  const theme = getTheme(student.interests);
  const isCricket = theme.implemented;

  const availableSubjects = getSubjectsForClass(student.class);
  const allSubjectsFlat = SUBJECTS.filter(s => s.classes.includes(student.class));

  const subjectsToShow = selectedSubject === 'all'
    ? availableSubjects
    : availableSubjects.filter(s => s.id === selectedSubject);

  const overallProgress = Math.round(
    DEMO_SUBJECT_PROGRESS.reduce((sum, p) => sum + p.progress, 0) / DEMO_SUBJECT_PROGRESS.length
  );

  return (
    <div className={`p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in ${isCricket ? 'text-white' : ''}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${isCricket ? 'text-white' : 'text-slate-900'}`}>
            {isCricket ? '📚 All Subjects' : 'All Subjects'}
          </h1>
          <p className={`mt-2 text-base ${isCricket ? 'text-slate-300' : 'text-slate-500'}`}>
            Class {student.class} Curriculum — {availableSubjects.length} subjects available
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search subjects or topics..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] w-full md:w-72 ${
              isCricket ? 'bg-[#0a2f1c]/80 border-green-800/50 text-white placeholder:text-green-300/60' : 'bg-white border-slate-200 text-slate-900'
            }`}
          />
        </div>
      </div>

      {/* Overall Progress */}
      <Card className={`border-0 shadow-lg ${isCricket ? 'bg-[#061d0f]/80 backdrop-blur-md border border-white/10' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'}`}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-white/70 mb-1">Overall Learning Progress</p>
              <h2 className="text-4xl font-extrabold text-white">{overallProgress}%</h2>
              <p className="text-white/70 text-sm mt-1">Across all subjects · Class {student.class}</p>
            </div>
            <div className="w-full md:w-64">
              <div className="flex justify-between text-white/80 text-xs font-bold mb-2">
                <span>Progress</span>
                <span>{overallProgress}%</span>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedSubject('all')}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all shrink-0 ${
            selectedSubject === 'all'
              ? 'bg-[var(--theme-primary)] text-white shadow-md'
              : isCricket ? 'bg-[#0a2f1c]/80 text-green-100 border border-green-800/50 hover:border-yellow-400' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
          }`}
        >
          All Subjects
        </button>
        {availableSubjects.map(subject => (
          <button
            key={subject.id}
            onClick={() => setSelectedSubject(subject.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedSubject === subject.id
                ? 'bg-[var(--theme-primary)] text-white shadow-md'
                : isCricket ? 'bg-[#0a2f1c]/80 text-green-100 border border-green-800/50 hover:border-yellow-400' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
            }`}
          >
            <span>{subject.icon}</span> {subject.shortName}
          </button>
        ))}
      </div>

      {/* Subject Cards Grid */}
      <div className="space-y-4">
        {subjectsToShow
          .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))
          .map(subject => {
            const subjectProgress = DEMO_SUBJECT_PROGRESS.find(p => p.subjectId === subject.id);
            const chapters = getChaptersForSubjectAndClass(subject.id, student.class);
            const isExpanded = expandedSubject === subject.id;

            // Also gather sub-subjects (e.g., Physics, Chemistry, Biology for Science)
            const subSubjects = SUBJECTS.filter(s => s.parentId === subject.id && s.classes.includes(student.class));

            return (
              <Card
                key={subject.id}
                className={`overflow-hidden transition-all ${
                  isCricket ? 'bg-[#061d0f]/80 backdrop-blur-md border border-white/10 hover:border-yellow-400/50' : 'bg-white border-slate-200 hover:border-[var(--theme-primary)] hover:shadow-md'
                }`}
              >
                {/* Subject Header */}
                <div
                  className={`flex items-center justify-between p-5 cursor-pointer`}
                  onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-2xl ${subject.lightBg} border ${subject.borderColor} flex items-center justify-center text-2xl shrink-0`}>
                      {subject.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-lg ${isCricket ? 'text-white' : 'text-slate-900'}`}>{subject.name}</h3>
                      <p className={`text-sm truncate ${isCricket ? 'text-green-100/60' : 'text-slate-500'}`}>{subject.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {subjectProgress && (
                      <div className="hidden md:block text-right">
                        <div className="flex items-center gap-2 justify-end mb-1">
                          <span className={`text-2xl font-extrabold ${isCricket ? 'text-yellow-400' : 'text-[var(--theme-primary)]'}`}>
                            {subjectProgress.progress}%
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                            subjectProgress.status === 'strong' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            subjectProgress.status === 'needs-attention' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {subjectProgress.status === 'strong' ? 'Strong' : subjectProgress.status === 'needs-attention' ? 'Needs Attention' : 'On Track'}
                          </span>
                        </div>
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${subjectProgress.status === 'strong' ? 'bg-emerald-500' : subjectProgress.status === 'needs-attention' ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${subjectProgress.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <ChevronDown className={`w-5 h-5 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''} ${isCricket ? 'text-green-300' : 'text-slate-400'}`} />
                  </div>
                </div>

                {/* Expanded: chapters + sub-subjects */}
                {isExpanded && (
                  <div className={`border-t ${isCricket ? 'border-white/10' : 'border-slate-100'} p-5`}>
                    {/* Mobile progress */}
                    {subjectProgress && (
                      <div className="md:hidden flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-xl">
                        <span className="text-xl font-bold text-[var(--theme-primary)]">{subjectProgress.progress}%</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[var(--theme-primary)]" style={{ width: `${subjectProgress.progress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-600">{subjectProgress.chaptersCompleted}/{subjectProgress.totalChapters} chapters</span>
                      </div>
                    )}

                    {/* Sub-subjects (Physics, Chemistry, Biology) */}
                    {subSubjects.length > 0 && (
                      <div className="mb-4">
                        <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isCricket ? 'text-green-300' : 'text-slate-500'}`}>Sub-subjects</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {subSubjects.map(sub => (
                            <Link key={sub.id} href={`/student/learn?subject=${sub.id}`}>
                              <div className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
                                isCricket ? 'bg-[#0a2a16]/80 border-white/5 hover:border-yellow-400' : `${sub.lightBg} ${sub.borderColor} hover:shadow-md`
                              }`}>
                                <span className="text-xl">{sub.icon}</span>
                                <div>
                                  <p className={`font-bold text-sm ${isCricket ? 'text-white' : 'text-slate-900'}`}>{sub.name}</p>
                                  <p className={`text-xs ${isCricket ? 'text-green-100/60' : 'text-slate-500'}`}>Classes 9-10</p>
                                </div>
                                <ChevronRight className="w-4 h-4 ml-auto text-slate-400" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Chapters */}
                    {chapters.length > 0 ? (
                      <div>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isCricket ? 'text-green-300' : 'text-slate-500'}`}>
                          Chapters — Class {student.class}
                        </p>
                        <div className="space-y-2">
                          {chapters.map((chapter, idx) => (
                            <Link key={chapter.id} href={`/student/learn/1`}>
                              <div className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm group ${
                                isCricket ? 'bg-[#0a2a16]/60 border-white/5 hover:border-yellow-400' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-[var(--theme-primary)]'
                              }`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${subject.lightBg} ${subject.color}`}>
                                  {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-bold text-sm ${isCricket ? 'text-white group-hover:text-yellow-300' : 'text-slate-900 group-hover:text-[var(--theme-primary)]'} transition-colors`}>{chapter.title}</p>
                                  <p className={`text-xs mt-0.5 ${isCricket ? 'text-green-100/50' : 'text-slate-400'}`}>
                                    {chapter.topics.slice(0, 3).join(' · ')}{chapter.topics.length > 3 ? ' ...' : ''}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs ${isCricket ? 'text-green-300' : 'text-slate-400'}`}>{chapter.estimatedWeeks}w</span>
                                  {idx === 0 && (
                                    <span className="text-xs font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">In Progress</span>
                                  )}
                                  <ChevronRight className={`w-4 h-4 ${isCricket ? 'text-green-300' : 'text-slate-400'} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className={`text-sm ${isCricket ? 'text-green-100/60' : 'text-slate-500'}`}>
                          Chapters for Class {student.class} {subject.name} coming soon!
                        </p>
                        <Link href="/student/learn/1">
                          <Button className="mt-3" variant="outline">Explore Available Lessons</Button>
                        </Link>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-4 flex-wrap">
                      <Link href="/student/quiz">
                        <Button size="sm" className={`font-bold ${isCricket ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-500' : 'bg-[var(--theme-primary)] text-white hover:opacity-90'}`}>
                          Take Quiz
                        </Button>
                      </Link>
                      <Link href="/student/assignments">
                        <Button size="sm" variant="outline" className={isCricket ? 'border-green-500/50 text-green-100 hover:bg-green-900/30' : ''}>
                          View Assignments
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
      </div>
    </div>
  );
}
