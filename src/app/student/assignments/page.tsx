"use client";

import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';
import { getAssignments, getTheme } from '@/lib/themes';

export default function AssignmentsPage() {
  const router = useRouter();
  const { student } = useAuthStore();
  if (!student) return null;

  const theme = getTheme(student.interests);
  const isCricket = theme.implemented;
  const assignments = getAssignments(student.interests);
  const isKan = student.preferredLanguage === 'Kannada';

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {isCricket ? '🏏 My Match Assignments' : (isKan ? 'ನನ್ನ ಕಾರ್ಯಗಳು' : 'My Assignments')}
        </h1>
        <p className="text-slate-500">
          {isCricket
            ? "Complete your learning matches assigned by your coach (facilitator)."
            : (isKan ? 'ನಿಮ್ಮ ಶಿಕ್ಷಕರು ನೀಡಿರುವ ಕಾರ್ಯಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.' : 'Complete these tasks assigned by your facilitators.')}
        </p>
        {isCricket && (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border border-green-200">
            <span className="text-green-700 text-sm font-bold">🏏 Cricket context active — same academic content, cricket framing!</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {assignments.map((assignment) => (
          <Card key={assignment.id} className={`border-l-4 ${assignment.status === 'completed' ? 'border-l-emerald-500 opacity-70' : 'border-l-[var(--theme-primary)] hover:shadow-md'} transition-all`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${assignment.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-[var(--theme-light)] text-[var(--theme-primary)]'}`}>
                    {assignment.status === 'completed' ? <CheckCircle className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900">{assignment.title}</h3>
                    {isCricket && assignment.themeNote && (
                      <p className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded mt-1 mb-2 inline-block font-medium">
                        🏏 {assignment.themeNote}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded uppercase tracking-wider">{assignment.subject}</span>
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {assignment.dueDate}
                      </span>
                    </div>
                  </div>
                </div>
                {assignment.status !== 'completed' && (
                  <button onClick={() => router.push('/student/quiz')} className="ml-4 px-5 py-2 rounded-lg bg-[var(--theme-primary)] text-white font-bold hover:opacity-80 transition-opacity shrink-0">
                    {isCricket ? '🏏 Play' : (isKan ? 'ಪ್ರಾರಂಭಿಸಿ' : 'Start')}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isCricket && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-sm text-amber-800">
          <strong>🏏 Note:</strong> All assignments test the same academic skills — only the context is cricket-themed. Your scores are tracked normally.
        </div>
      )}
    </div>
  );
}
