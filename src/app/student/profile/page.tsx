"use client";

import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { Interest } from '@/types';
import { getTranslation } from '@/lib/i18n';
import { ReportGenerator } from '@/components/profile/ReportGenerator';

const ALL_INTERESTS: { id: Interest, icon: string, label: string }[] = [
  { id: 'Cricket', icon: '🏏', label: 'Cricket' },
  { id: 'Football', icon: '⚽', label: 'Football' },
  { id: 'Music', icon: '🎵', label: 'Music' },
  { id: 'Gaming', icon: '🎮', label: 'Gaming' },
  { id: 'Robotics', icon: '🤖', label: 'Robotics' },
  { id: 'Art', icon: '🎨', label: 'Art' },
  { id: 'Science', icon: '🔬', label: 'Science' },
  { id: 'Reading', icon: '📚', label: 'Reading' },
  { id: 'Technology', icon: '💻', label: 'Technology' },
  { id: 'Space', icon: '🚀', label: 'Space' },
  { id: 'Puzzles', icon: '🧩', label: 'Puzzles' },
  { id: 'Nature', icon: '🌱', label: 'Nature' },
  { id: 'Movies', icon: '🎬', label: 'Movies' },
  { id: 'Cars', icon: '🏎️', label: 'Cars' },
  { id: 'Aviation', icon: '✈️', label: 'Aviation' },
];

export default function ProfilePage() {
  const { student, updateStudent } = useAuthStore();
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>(student?.interests || []);
  const [saving, setSaving] = useState(false);

  if (!student) return null;

  const handleInterestToggle = (interest: Interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([interest]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await updateStudent({ interests: selectedInterests });
    setTimeout(() => setSaving(false), 500);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-[var(--theme-light)] flex items-center justify-center text-4xl border-2 border-[var(--theme-primary)] overflow-hidden">
          {(student?.avatar?.includes('http') ? '🦁' : student?.avatar)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{student.name}</h1>
          <p className="text-slate-500 font-medium">Class {student.class} • {student.school}</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-slate-900">Your Interests & Themes</h2>
             <Button onClick={handleSave} disabled={saving} className="bg-[var(--theme-primary)]">
               {saving ? 'Saving...' : 'Save Changes'}
             </Button>
          </div>
          <p className="text-slate-500 mb-6">
            Select your main interest to personalize your learning experience. 
            <br />
            <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded mt-2 inline-block">
              Note: For this prototype, ONLY the "Cricket" theme is fully implemented.
            </span>
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {ALL_INTERESTS.map(int => {
              const isSelected = selectedInterests.includes(int.id);
              return (
                <button
                  key={int.id}
                  onClick={() => handleInterestToggle(int.id)}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    isSelected 
                      ? 'border-[var(--theme-primary)] bg-[var(--theme-light)] scale-105 shadow-md' 
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-3xl">{int.icon}</span>
                  <span className={`font-semibold text-sm ${isSelected ? 'text-[var(--theme-primary)]' : 'text-slate-700'}`}>
                    {int.label}
                  </span>
                  {int.id !== 'Cricket' && isSelected && (
                    <span className="text-[10px] text-slate-500 text-center leading-tight">Theme coming soon</span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-slate-200 mt-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Language Preferences</h2>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="lang" 
                checked={student.preferredLanguage === 'English'} 
                onChange={() => updateStudent({ preferredLanguage: 'English' })}
                className="w-5 h-5 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)]"
              />
              <span className="font-medium text-slate-700">English</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="lang" 
                checked={student.preferredLanguage === 'Kannada'} 
                onChange={() => updateStudent({ preferredLanguage: 'Kannada' })}
                className="w-5 h-5 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)]"
              />
              <span className="font-medium text-slate-700">ಕನ್ನಡ (Kannada)</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <ReportGenerator />
    </div>
  );
}
