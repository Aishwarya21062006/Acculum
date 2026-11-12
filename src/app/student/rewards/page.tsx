"use client";

import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { getAchievements, getTheme } from '@/lib/themes';

export default function RewardsPage() {
  const { student } = useAuthStore();
  if (!student) return null;

  const theme = getTheme(student.interests);
  const isCricket = theme.implemented;
  const achievements = getAchievements(student.interests);
  const isKan = student.preferredLanguage === 'Kannada';

  const pointsLabel = isCricket ? theme.terms.points : 'XP';
  const streakLabel = isCricket ? theme.terms.streak : 'Streak';

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {isCricket ? '🏆 My Scoreboard' : (isKan ? 'ನನ್ನ ಪ್ರಶಸ್ತಿಗಳು' : 'My Rewards')}
          </h1>
          <p className="text-slate-500">
            {isCricket ? 'Your runs, wickets, and match records.' : (isKan ? 'ನಿಮ್ಮ XP, ಬ್ಯಾಡ್ಜ್ ಮತ್ತು ಸಾಧನೆಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.' : 'Track your XP, badges, and achievements.')}
          </p>
        </div>
        {isCricket && <span className="text-4xl">🏏</span>}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-[var(--theme-primary)] to-emerald-600 border-0 text-white shadow-lg overflow-hidden relative">
          <div className="absolute right-0 top-0 opacity-10 scale-150 -translate-y-4 translate-x-4">
            <Star className="w-32 h-32" />
          </div>
          <CardContent className="p-6 relative z-10">
            <h3 className="text-sm font-semibold opacity-80 uppercase tracking-wider mb-1">
              Total {pointsLabel}
            </h3>
            <p className="text-4xl font-black">{student.xp.toLocaleString()}</p>
            {isCricket && <p className="text-sm opacity-70 mt-1">Your career runs</p>}
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {isCricket ? 'Batting Level' : (isKan ? 'ಸ್ತರ' : 'Level')}
            </h3>
            <p className="text-4xl font-black text-slate-900">{student.level}</p>
            {isCricket && <p className="text-xs text-slate-500 mt-1">Keep scoring to advance!</p>}
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {isCricket ? 'Milestones Hit' : (isKan ? 'ಬ್ಯಾಡ್ಜ್‌ಗಳು' : 'Badges')}
            </h3>
            <p className="text-4xl font-black text-slate-900">{student.badge_count}</p>
          </CardContent>
        </Card>
      </div>

      {/* Streak card */}
      {isCricket && (
        <Card className="bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-white shadow-lg">
          <CardContent className="p-5 flex items-center gap-5">
            <div className="text-5xl">🔥</div>
            <div>
              <h3 className="font-black text-2xl">{student.streak} Day {streakLabel}!</h3>
              <p className="opacity-90 text-sm">
                {student.streak >= 7 ? "🏏 You're on a century-level streak!" : student.streak >= 3 ? "🏏 Building momentum — don't stop now!" : "🏏 Start your winning streak today!"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cricket Milestone Legend */}
      {isCricket && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '4️⃣', label: 'Four!', desc: 'Correct answer', color: 'bg-blue-50 border-blue-200' },
            { icon: '6️⃣', label: 'Six!', desc: 'Perfect answer', color: 'bg-purple-50 border-purple-200' },
            { icon: '5️⃣0️⃣', label: 'Half-Century!', desc: '50% lesson done', color: 'bg-amber-50 border-amber-200' },
            { icon: '💯', label: 'Century!', desc: 'Course complete', color: 'bg-green-50 border-green-200' },
          ].map((m) => (
            <Card key={m.label} className={`border ${m.color}`}>
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-1">{m.icon}</div>
                <div className="font-bold text-slate-900 text-sm">{m.label}</div>
                <div className="text-xs text-slate-500">{m.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Achievements Grid */}
      <h2 className="text-2xl font-bold text-slate-900 mt-4 mb-4">
        {isCricket ? '🏏 Match Achievements' : (isKan ? 'ಸಾಧನೆಗಳು' : 'Achievements')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((ach, i) => {
          const isEarned = i < student.badge_count;
          return (
            <Card key={ach.id} className={`${isEarned ? 'border-[var(--theme-primary)] bg-[var(--theme-light)]/20 shadow-md' : 'opacity-60 border-slate-200 bg-slate-50'}`}>
              <CardContent className="p-5 text-center flex flex-col items-center">
                <div className={`text-4xl mb-3 ${isEarned ? 'drop-shadow-md' : 'grayscale opacity-50'}`}>{ach.icon}</div>
                <h4 className={`font-bold text-sm ${isEarned ? 'text-slate-900' : 'text-slate-500'}`}>{ach.name}</h4>
                <p className="text-xs text-slate-500 mt-1 mb-3">{ach.description}</p>
                <div className="mt-auto px-3 py-1 bg-white rounded-full text-xs font-bold text-amber-500 border border-amber-100 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-500" /> {ach.xp_reward} {pointsLabel}
                </div>
                {isEarned && <div className="mt-2 text-xs text-emerald-600 font-bold">✓ Earned!</div>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
