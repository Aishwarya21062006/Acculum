"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import { Home, BookOpen, ClipboardList, Gamepad2, Users, Gift, Globe, Target, User, School } from 'lucide-react';
import { AiAssistant } from '@/components/shared/AiAssistant';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { role, isAuthenticated, student } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (mounted && (!isAuthenticated || role !== 'student' || !student)) {
      router.replace('/login');
    }
  }, [isAuthenticated, role, router, student, mounted]);

  if (!mounted || !isAuthenticated || role !== 'student' || !student) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const primaryInterest = student.interests[0] || 'Science';
  const isCricket = primaryInterest === 'Cricket';

  return (
    <div 
      className={`min-h-screen flex flex-col md:flex-row ${isCricket ? 'text-white' : 'bg-slate-50 text-slate-900'}`} 
      data-theme={primaryInterest}
      style={isCricket ? {
        backgroundImage: `linear-gradient(to bottom, rgba(4, 21, 10, 0.4), rgba(4, 21, 10, 0.9)), url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2500&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      } : {}}
    >
      {/* Sidebar for Desktop */}
      <aside className={`hidden md:flex w-64 flex-col border-r h-screen sticky top-0 z-20 ${isCricket ? 'bg-[#061d0f]/95 border-white/10 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className={`p-6 border-b flex items-center gap-3 ${isCricket ? 'border-white/10' : 'border-slate-100'}`}>
          <div className="text-3xl">{student.avatar?.includes('http') ? '??' : student.avatar}</div>
          <div>
            <h2 className={`font-bold truncate ${isCricket ? 'text-white' : 'text-slate-900'}`}>{student.name}</h2>
            <p className={`text-xs font-medium ${isCricket ? 'text-green-300' : 'text-slate-500'}`}>Lvl {student.level} • 🔥 {student.streak}</p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <NavItem href="/student/dashboard" icon={<Home size={20} />} label="Home" isCricket={isCricket} />
          <NavItem href="/student/learn" icon={<BookOpen size={20} />} label="Learn" isCricket={isCricket} />
          <NavItem href="/student/subjects" icon={<BookOpen size={20} />} label="Subjects" isCricket={isCricket} />
          <NavItem href="/student/classroom" icon={<School size={20} />} label="Classroom" isCricket={isCricket} />
          <NavItem href="/student/assignments" icon={<ClipboardList size={20} />} label="Assignments" isCricket={isCricket} />
          <NavItem href="/student/quiz" icon={<Gamepad2 size={20} />} label="Quizzes" isCricket={isCricket} />
          <NavItem href="/student/ai-help" icon={<Globe size={20} />} label="AI Assistant" isCricket={isCricket} />
          <NavItem href="/student/friends" icon={<Users size={20} />} label="Peers" isCricket={isCricket} />
          <NavItem href="/student/rewards" icon={<Gift size={20} />} label="Rewards" isCricket={isCricket} />
          <NavItem href="/student/career" icon={<Target size={20} />} label="Career" isCricket={isCricket} />
          <NavItem href="/student/profile" icon={<User size={20} />} label="Profile" isCricket={isCricket} />
        </nav>
        
        <div className={`p-4 border-t ${isCricket ? 'border-white/10' : 'border-slate-100'}`}>
          <div className={`rounded-xl p-4 ${isCricket ? 'bg-gradient-to-r from-green-900 to-[#0a2a16] border border-green-700/50' : 'bg-[var(--theme-light)]'}`}>
            <div className={`text-sm font-bold flex items-center gap-2 mb-2 ${isCricket ? 'text-yellow-400' : 'text-[var(--theme-primary)]'}`}>
              <span className="text-lg">👑</span> {student.xp} XP
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${isCricket ? 'bg-black/50' : 'bg-white/60'}`}>
              <div className={`h-full rounded-full ${isCricket ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'bg-[var(--theme-primary)]'}`} style={{ width: `${(student.xp % 1000) / 10}%` }}></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-0 w-full overflow-x-hidden flex flex-col relative min-h-screen">
        <header className={`h-14 flex items-center justify-end px-4 sticky top-0 z-10 shrink-0 ${isCricket ? 'bg-transparent backdrop-blur-sm border-b border-white/5' : 'bg-white border-b border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium hidden sm:inline ${isCricket ? 'text-white/70' : 'text-slate-500'}`}>Language:</span>
            <select 
              value={student.preferredLanguage}
              onChange={(e) => useAuthStore.getState().updateStudent({ preferredLanguage: e.target.value as any })}
              className={`text-sm rounded-lg px-2 py-1 font-medium focus:ring-2 focus:ring-[var(--theme-primary)] focus:outline-none ${isCricket ? 'bg-[#0a2a16] text-white border-green-800' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
            >
              <option value="English">English</option>
              <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
            </select>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
        
        <AiAssistant />
      </main>

      {/* Bottom Nav for Mobile */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 flex justify-around p-2 z-50 safe-area-pb ${isCricket ? 'bg-[#061d0f] border-t border-white/10' : 'bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]'}`}>
        <MobileNavItem href="/student/dashboard" icon={<Home size={24} />} label="Home" isCricket={isCricket} />
        <MobileNavItem href="/student/learn" icon={<BookOpen size={24} />} label="Learn" isCricket={isCricket} />
        <MobileNavItem href="/student/ai-help" icon={<Globe size={24} />} label="AI Help" isCricket={isCricket} />
        <MobileNavItem href="/student/rewards" icon={<Gift size={24} />} label="Rewards" isCricket={isCricket} />
        <MobileNavItem href="/student/profile" icon={<User size={24} />} label="Profile" isCricket={isCricket} />
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, isCricket }: { href: string; icon: React.ReactNode; label: string, isCricket?: boolean }) {
  const isActive = typeof window !== 'undefined' && window.location.pathname.startsWith(href) && href !== '/dashboard' || (href === '/dashboard' && typeof window !== 'undefined' && window.location.pathname === '/student/dashboard');
  
  if (isCricket) {
    return (
      <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-green-700/50 text-yellow-400 font-semibold border border-green-500/30' : 'text-green-100/70 hover:bg-green-800/30 hover:text-white'}`}>
        <div className={isActive ? 'text-yellow-400' : 'text-green-100/50'}>{icon}</div>
        {label}
      </Link>
    );
  }

  return (
    <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-[var(--theme-light)] text-[var(--theme-primary)] font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
      <div className={isActive ? 'text-[var(--theme-primary)]' : 'text-slate-400'}>{icon}</div>
      {label}
    </Link>
  );
}

function MobileNavItem({ href, icon, label, isCricket }: { href: string; icon: React.ReactNode; label: string, isCricket?: boolean }) {
  const isActive = typeof window !== 'undefined' && window.location.pathname.startsWith(href) && href !== '/dashboard' || (href === '/dashboard' && typeof window !== 'undefined' && window.location.pathname === '/student/dashboard');
  
  if (isCricket) {
    return (
      <Link href={href} className={`flex flex-col items-center justify-center p-2 rounded-lg min-w-[4rem] transition-colors ${isActive ? 'text-yellow-400' : 'text-green-100/50'}`}>
        <div className={`mb-1 transition-transform ${isActive ? 'scale-110' : ''}`}>{icon}</div>
        <span className="text-[10px] font-medium">{label}</span>
      </Link>
    );
  }

  return (
    <Link href={href} className={`flex flex-col items-center justify-center p-2 rounded-lg min-w-[4rem] transition-colors ${isActive ? 'text-[var(--theme-primary)]' : 'text-slate-400'}`}>
      <div className={`mb-1 transition-transform ${isActive ? 'scale-110' : ''}`}>{icon}</div>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
