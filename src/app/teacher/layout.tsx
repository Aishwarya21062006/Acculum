"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import { LayoutDashboard, Users, BookOpen, ClipboardCheck, AlertTriangle, BarChart3, Settings, Bell, LogOut } from 'lucide-react';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { role, isAuthenticated, teacher, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (mounted && (!isAuthenticated || role !== 'teacher' || !teacher)) {
      router.replace('/login');
    }
  }, [isAuthenticated, role, router, teacher, mounted]);

  if (!mounted || !isAuthenticated || role !== 'teacher' || !teacher) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 h-screen sticky top-0 text-slate-300 z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded bg-purple-600 flex items-center justify-center font-bold text-white">A</div>
            <span className="font-bold text-white text-lg tracking-wide">Acculum <span className="text-purple-400">Pro</span></span>
          </div>
          <div>
            <h2 className="font-semibold text-white truncate">{teacher.name}</h2>
            <p className="text-xs text-slate-400">{teacher.school}</p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">Dashboard</p>
          <NavItem href="/teacher/dashboard" icon={<LayoutDashboard size={18} />} label="Overview" />
          <NavItem href="/teacher/interventions" icon={<AlertTriangle size={18} />} label="Interventions" badge={3} />
          <NavItem href="/teacher/analytics" icon={<BarChart3 size={18} />} label="Analytics" />
          
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">Manage</p>
          <NavItem href="/teacher/students" icon={<Users size={18} />} label="Students" />
          <NavItem href="/teacher/classes" icon={<BookOpen size={18} />} label="Classes" />
          <NavItem href="/teacher/assignments" icon={<ClipboardCheck size={18} />} label="Assignments" />
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 w-full text-left rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <LogOut size={18} />
            <span className="text-sm font-medium">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
          <div className="md:hidden font-bold text-slate-900">Acculum Pro</div>
          <div className="hidden md:block text-sm font-medium text-slate-500">
            Classes {teacher.classes.join(', ')} • {teacher.subjects.join(' & ')}
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold border border-purple-200">
              {teacher.name.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>

      {/* Bottom Nav for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around p-2 z-50">
        <MobileNavItem href="/teacher/dashboard" icon={<LayoutDashboard size={20} />} label="Home" />
        <MobileNavItem href="/teacher/interventions" icon={<AlertTriangle size={20} />} label="Alerts" badge={3} />
        <MobileNavItem href="/teacher/students" icon={<Users size={20} />} label="Students" />
        <MobileNavItem href="/teacher/analytics" icon={<BarChart3 size={20} />} label="Stats" />
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, badge }: { href: string; icon: React.ReactNode; label: string; badge?: number }) {
  const isActive = typeof window !== 'undefined' && window.location.pathname.startsWith(href) && href !== '/teacher/dashboard' || (href === '/teacher/dashboard' && typeof window !== 'undefined' && window.location.pathname === '/student/dashboard');
  
  return (
    <Link href={href} className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${isActive ? 'bg-purple-600/10 text-purple-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
      <div className="flex items-center gap-3">
        <div className={isActive ? 'text-purple-400' : 'text-slate-500'}>{icon}</div>
        {label}
      </div>
      {badge && (
        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}

function MobileNavItem({ href, icon, label, badge }: { href: string; icon: React.ReactNode; label: string; badge?: number }) {
  const isActive = typeof window !== 'undefined' && window.location.pathname.startsWith(href) && href !== '/teacher/dashboard' || (href === '/teacher/dashboard' && typeof window !== 'undefined' && window.location.pathname === '/student/dashboard');
  
  return (
    <Link href={href} className={`relative flex flex-col items-center justify-center p-2 rounded-lg min-w-[4rem] transition-colors ${isActive ? 'text-purple-400' : 'text-slate-500'}`}>
      <div className={`mb-1 transition-transform ${isActive ? 'scale-110' : ''}`}>{icon}</div>
      <span className="text-[10px] font-medium">{label}</span>
      {badge && (
        <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
      )}
    </Link>
  );
}
