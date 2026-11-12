"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { AnimatePresence } from 'framer-motion';

import { StepIndicator }      from '@/components/ui/StepIndicator';
import { RoleStep }           from '@/components/onboarding/RoleStep';
import { InterestsStep }      from '@/components/onboarding/InterestsStep';
import { CricketTransition }  from '@/components/onboarding/CricketTransition';
import { DetailsStep }        from '@/components/onboarding/DetailsStep';
import { VerificationStep }   from '@/components/onboarding/VerificationStep';
import { ThemeProvider }      from '@/context/ThemeContext';
import type { Role, Interest, Theme } from '@/data/onboardingTypes';

type Step = 'role' | 'interests' | 'transition' | 'details' | 'verification';

export default function LoginPage() {
  const router = useRouter();
  const { loginStudent } = useAuthStore();
  
  const [step, setStep]   = useState<Step>('role');
  const [role, setRole]   = useState<Role>('student');
  const [interests, setInterests] = useState<Interest[]>([]);
  const [theme, setTheme] = useState<Theme>('normal');
  const [name, setName]   = useState('');
  const [cls,  setCls]    = useState('');
  const [school,  setSchool]  = useState('');
  const [section, setSection] = useState('');

  const stepNum = { role: 1, interests: 2, transition: 2, details: 3, verification: 4 }[step];

  const handleRole = (r: Role) => {
    if (r === 'facilitator') {
      router.push('/login?role=teacher');
      return;
    }
    setRole('student');
    setStep('interests');
  };

  const handleInterests = (selected: Interest[]) => {
    setInterests(selected);
    const t: Theme =
      selected.includes('cricket')  ? 'cricket'  :
      selected.includes('gaming')   ? 'gaming'   :
      selected.includes('music')    ? 'music'    :
      selected.includes('robotics') ? 'robotics' :
      selected.includes('art')      ? 'art'      :
      selected.includes('football') ? 'football' :
      selected.includes('reading')  ? 'reading'  :
      selected.includes('science')  ? 'science'  :
      selected.includes('dance')    ? 'dance'    : 'normal';
    setTheme(t);
    if (t === 'cricket') setStep('transition');
    else setStep('details');
  };

  const handleDetails = (n: string, c: string, s: string, sec: string) => {
    setName(n); setCls(c); setSchool(s); setSection(sec);
    setStep('verification');
  };

  const handleVerified = async () => {
    // Attempt to log in, but if user doesn't exist, we will create a mock student object and store it locally
    // For this prototype, if it's a new name, we'll just mock the user object and go.
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'student', name, classNum: cls.replace(/\D/g, '') || '8' }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update interests to whatever they selected
        const updatedStudent = { ...data.user, interests: interests.map(i => i.charAt(0).toUpperCase() + i.slice(1)) };
        loginStudent(updatedStudent);
      } else {
        // Mock new student login
        loginStudent({
          id: Math.floor(Math.random() * 10000) + 1000,
          name,
          class: parseInt(cls.replace(/\D/g, '') || '8', 10),
          section: section || 'A',
          school: school || 'Acculum High',
          preferredLanguage: 'English',
          interests: interests.map(i => i.charAt(0).toUpperCase() + i.slice(1)) as any,
          avatar: '🦁',
          xp: 1200,
          level: 3,
          streak: 5,
          badge_count: 2,
          created_at: new Date().toISOString()
        });
      }
      router.push('/student/dashboard');
    } catch (err) {
      console.error(err);
      // Mock new student login
      loginStudent({
        id: Math.floor(Math.random() * 10000) + 1000,
        name,
        class: parseInt(cls.replace(/\D/g, '') || '8', 10),
        section: section || 'A',
        school: school || 'Acculum High',
        preferredLanguage: 'English',
        interests: interests.map(i => i.charAt(0).toUpperCase() + i.slice(1)) as any,
        avatar: '🦁',
        xp: 1200,
        level: 3,
        streak: 5,
        badge_count: 2,
        created_at: new Date().toISOString()
      });
      router.push('/student/dashboard');
    }
  };

  /* Background style for each step */
  const bgStyle: React.CSSProperties =
    (step === 'role' || step === 'interests')
      ? { background: 'linear-gradient(160deg, #f9fafb 0%, #f0fdf4 50%, #eff6ff 100%)' }
      : theme === 'cricket'
        ? { background: 'linear-gradient(160deg, #012910 0%, #022c1a 40%, #021509 100%)' }
        : { background: '#111827' };

  return (
    <ThemeProvider themeName={step === 'role' || step === 'interests' ? 'normal' : theme}>
      {/* Cricket transition overlay */}
      <AnimatePresence>
        {step === 'transition' && (
          <CricketTransition onComplete={() => setStep('details')} />
        )}
      </AnimatePresence>

      {/* Main container */}
      <div className="min-h-screen flex flex-col" style={bgStyle}>
        {step !== 'transition' && (
          <>
            {/* Step indicator */}
            <div className={`py-5 px-4 ${
              theme === 'cricket' && step !== 'role' && step !== 'interests'
                ? 'bg-black/20'
                : ''
            }`}>
              <StepIndicator current={stepNum} />
            </div>

            {/* Content area */}
            <div className="flex-1 flex items-center justify-center px-4 py-8">
              <AnimatePresence mode="wait">
                {step === 'role'         && <RoleStep key="role" onSelect={handleRole} />}
                {step === 'interests'    && <InterestsStep key="interests" onSelect={handleInterests} />}
                {step === 'details'      && <DetailsStep key="details" defaultName={name} onSubmit={handleDetails} />}
                {step === 'verification' && <VerificationStep key="verification" studentName={name} onComplete={handleVerified} />}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </ThemeProvider>
  );
}
