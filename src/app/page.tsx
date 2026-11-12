"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BrainCircuit, Target, Lightbulb, Users, Globe, WifiOff, Map, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float-reverse"></div>
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Acculum
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login?role=student">
            <Button variant="outline" className="hidden sm:inline-flex bg-white/50 backdrop-blur-sm">Student Login</Button>
          </Link>
          <Link href="/login?role=teacher">
            <Button variant="gradient">Facilitator Login</Button>
          </Link>
        </div>
      </nav>

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="pt-20 pb-32 px-6 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-8 animate-slide-up border border-indigo-100">
            <Sparkles className="w-4 h-4" />
            Trusted by 500+ Schools across India
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Learning That Adapts to <span className="gradient-text">YOU.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            An AI-powered learning companion covering all school subjects. It understands how you learn, what you love, and exactly when you need help.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link href="/login?role=student">
              <Button variant="gradient" size="lg" className="w-full sm:w-auto text-lg px-10 h-14 rounded-full">
                Start Learning Now
              </Button>
            </Link>
          </div>

          {/* Floating Interest Cards */}
          <div className="mt-20 relative h-32 md:h-48 max-w-4xl mx-auto hidden sm:block">
            <div className="absolute left-10 top-0 animate-float" style={{ animationDelay: '0s' }}>
              <div className="glass-card px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-green-500/10 border-green-100">
                <span className="text-2xl">🏏</span>
                <span className="font-semibold text-green-700">Cricket</span>
              </div>
            </div>
            <div className="absolute right-20 top-10 animate-float-reverse" style={{ animationDelay: '1s' }}>
              <div className="glass-card px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-blue-500/10 border-blue-100">
                <span className="text-2xl">🤖</span>
                <span className="font-semibold text-blue-700">Robotics</span>
              </div>
            </div>
            <div className="absolute left-1/4 bottom-0 animate-float" style={{ animationDelay: '2s' }}>
              <div className="glass-card px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-purple-500/10 border-purple-100">
                <span className="text-2xl">🎵</span>
                <span className="font-semibold text-purple-700">Music</span>
              </div>
            </div>
            <div className="absolute right-1/4 bottom-5 animate-float-reverse" style={{ animationDelay: '0.5s' }}>
              <div className="glass-card px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-cyan-500/10 border-cyan-100">
                <span className="text-2xl">🎮</span>
                <span className="font-semibold text-cyan-700">Gaming</span>
              </div>
            </div>
          </div>
        </section>

        {/* JOURNEY SECTION */}
        <section id="how-it-works" className="py-24 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-16 text-slate-900">How Acculum Works</h2>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              {['Learn', 'Analyze', 'Adapt', 'Intervene', 'Improve'].map((step, i) => (
                <div key={step} className="flex flex-col items-center group">
                  <div className="w-20 h-20 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center mb-4 transition-all group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white text-indigo-600 shadow-sm">
                    <span className="text-xl font-bold">{i + 1}</span>
                  </div>
                  <span className="font-semibold text-slate-700">{step}</span>
                  {i < 4 && <div className="hidden md:block h-0.5 w-16 bg-slate-200 mt-4 absolute translate-x-[4.5rem] -translate-y-16"></div>}
                </div>
              ))}
            </div>
          </div>
        </section>



      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-white text-lg">Acculum</span>
          </div>
          <p>Built for India's students. Powered by AI. 🇮🇳</p>
        </div>
      </footer>
    </div>
  );
}
