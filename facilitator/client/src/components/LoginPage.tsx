import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { RegisterData } from '../types';
import { Button } from './ui/Button';
import { GraduationCap, Mail, Lock, User, Building2, Phone, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form
  const [regData, setRegData] = useState<RegisterData>({
    email: '', password: '', full_name: '', phone: '', school: '',
    facilitator_id: '', subjects: [], classes: [], preferred_language: 'English',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(regData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap size={26} className="text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white tracking-tight">Acculum</h1>
              <p className="text-indigo-300 text-sm">Facilitator Dashboard</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">
            Evidence-based learning intervention for educators
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                  tab === t
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Professional Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      required autoFocus
                      placeholder="you@school.edu"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                      required placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <Button type="submit" loading={loading} className="w-full justify-center py-2.5 mt-2">
                  Sign In to Dashboard
                </Button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('facilitator@acculum.edu');
                      setPassword('Acculum2026!');
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 underline transition-colors"
                  >
                    Quick-fill Demo Credentials (facilitator@acculum.edu)
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { label: 'Full Name', key: 'full_name', icon: User, placeholder: 'Dr. Priya Sharma', type: 'text', required: true },
                    { label: 'Professional Email', key: 'email', icon: Mail, placeholder: 'you@school.edu', type: 'email', required: true },
                    { label: 'School / Institution', key: 'school', icon: Building2, placeholder: 'Delhi Public School', type: 'text', required: false },
                    { label: 'Phone', key: 'phone', icon: Phone, placeholder: '+91 98765 43210', type: 'tel', required: false },
                  ].map(({ label, key, icon: Icon, placeholder, type, required }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                      <div className="relative">
                        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type={type} required={required} placeholder={placeholder}
                          value={(regData as any)[key] || ''}
                          onChange={(e) => setRegData(d => ({ ...d, [key]: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPw ? 'text' : 'password'} required placeholder="Create a strong password"
                        value={regData.password}
                        onChange={(e) => setRegData(d => ({ ...d, password: e.target.value }))}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
                <Button type="submit" loading={loading} className="w-full justify-center py-2.5 mt-2">
                  Create Facilitator Account
                </Button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Acculum Facilitator Dashboard · Student data is for authorized facilitators only
        </p>
      </div>
    </div>
  );
}
