import React, { useState, ReactNode } from 'react';
import {
  LayoutGrid, Users, FileText, Zap, Activity,
  BarChart3, Bell, Settings, GraduationCap, ChevronLeft, ChevronRight,
  LogOut, Menu, X, BookOpen, Sparkles
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  navigate: (to: string) => void;
  unreadNotifications?: number;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'textbooks', label: 'Textbook Management', icon: BookOpen },
  { id: 'student-textbooks', label: 'My Learning Materials', icon: GraduationCap },
  { id: 'quiz-generator', label: 'AI Quiz Generator', icon: Sparkles },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'signals', label: 'Learning Signals', icon: Zap },
  { id: 'interventions', label: 'Interventions', icon: Activity },
  { id: 'analytics', label: 'Class Analytics', icon: BarChart3 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  textbooks: 'Textbook Management',
  'student-textbooks': 'My Learning Materials',
  'quiz-generator': 'AI Quiz Generator',
  'quiz-attempt': 'Adaptive Quiz Attempt',
  students: 'Students',
  reports: 'Reports',
  signals: 'Learning Signals',
  interventions: 'Interventions',
  analytics: 'Class Analytics',
  notifications: 'Notifications',
  settings: 'Settings',
};

export function Layout({ children, currentPage, navigate, unreadNotifications = 0 }: LayoutProps) {
  const { facilitator, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activePage = currentPage.split('/')[0];

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full bg-[#0d121f] text-white ${mobile ? 'w-72' : collapsed ? 'w-20' : 'w-64'} transition-all duration-200 border-r border-slate-800/60`}>
      {/* Logo Header */}
      <div className={`flex items-center gap-3.5 px-5 py-6 border-b border-slate-800/40 ${collapsed && !mobile ? 'justify-center px-2' : ''}`}>
        <div className="w-10 h-10 bg-[#4e5cf4] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/30">
          <GraduationCap size={22} className="text-white" />
        </div>
        {(!collapsed || mobile) && (
          <div>
            <div className="font-bold text-white text-base tracking-wide">Acculum</div>
            <div className="text-slate-400 text-xs font-normal">Facilitator</div>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;
          const notifBadge = id === 'notifications' && unreadNotifications > 0;

          return (
            <button
              key={id}
              onClick={() => { navigate(id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-[14px] font-medium transition-all ${
                isActive
                  ? 'bg-[#4853ed] text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              } ${collapsed && !mobile ? 'justify-center px-2' : ''}`}
              title={collapsed && !mobile ? label : undefined}
            >
              <div className="relative flex-shrink-0">
                <Icon size={19} className={isActive ? 'text-white' : 'text-slate-300'} />
                {notifBadge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </div>
              {(!collapsed || mobile) && <span className="truncate">{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User info */}
      <div className={`border-t border-slate-700/50 p-3 ${collapsed && !mobile ? 'items-center' : ''}`}>
        {(!collapsed || mobile) && facilitator && (
          <div className="mb-2 px-2">
            <p className="text-white text-xs font-medium truncate">{facilitator.full_name}</p>
            <p className="text-slate-500 text-xs truncate">{facilitator.email}</p>
          </div>
        )}
        <button
          onClick={() => logout()}
          className={`w-full flex items-center gap-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg px-2 py-2 text-xs transition-colors ${collapsed && !mobile ? 'justify-center' : ''}`}
        >
          <LogOut size={15} />
          {(!collapsed || mobile) && 'Sign Out'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex relative">
        <Sidebar />
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-20 z-10 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-indigo-600 shadow-sm"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="flex-shrink-0">
            <Sidebar mobile />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-gray-500 hover:text-gray-700">
              <Menu size={20} />
            </button>
            <h1 className="font-semibold text-gray-900">
              {PAGE_TITLES[activePage] || 'Acculum'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('notifications')}
              className="relative text-gray-500 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <Bell size={18} />
              {unreadNotifications > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>
            {facilitator && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {facilitator.full_name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-700 hidden sm:block">{facilitator.full_name.split(' ')[0]}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
