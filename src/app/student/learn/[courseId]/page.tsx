"use client";

import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, CheckCircle2, Lock, Clock, Trophy, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CourseDetail() {
  const { student } = useAuthStore();
  
  if (!student) return null;

  return (
    <div className="animate-fade-in">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900 to-slate-900 opacity-80"></div>
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500 rounded-full filter blur-[100px] opacity-20"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/student/learn" className="inline-flex items-center text-slate-400 hover:text-white text-sm font-medium mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Courses
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-bold uppercase tracking-wider border border-teal-500/30">Science</span>
            <span className="text-sm text-slate-300 font-medium">Class 7</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">Electricity & Circuits</h1>
          <p className="text-slate-300 text-lg max-w-2xl mb-8 leading-relaxed">
            Discover the magic of electricity! Learn how current flows, what makes a good conductor, and build your very own virtual circuits.
          </p>
          
          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-300">
            <span className="flex items-center gap-2"><Clock className="w-5 h-5 text-slate-400" /> ~2 Hours</span>
            <span className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-slate-400" /> 4 Lessons</span>
            <span className="flex items-center gap-2 text-amber-400"><Star className="w-5 h-5 fill-amber-400" /> 500 XP Total</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 -mt-6 relative z-20">
        
        {/* Main Content: Lessons */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 px-2">Course Modules</h2>
          
          <Card className="border-2 border-teal-500 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <Link href="/student/learn/lesson/1" className="flex items-center p-5 md:p-6 group">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mr-5 shrink-0 group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-6 h-6 fill-teal-100" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">Lesson 1</p>
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-teal-700 transition-colors">Electric Current Basics</h3>
                  <p className="text-sm text-slate-500 mt-1">Understand the flow of electrons</p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1">
                  <span className="text-xs font-bold text-amber-500">+100 XP</span>
                  <span className="text-xs text-slate-400">20 mins</span>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-slate-200 opacity-75">
            <CardContent className="p-0">
              <div className="flex items-center p-5 md:p-6">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mr-5 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Lesson 2</p>
                  <h3 className="font-bold text-slate-600 text-lg">Conductors & Insulators</h3>
                  <p className="text-sm text-slate-500 mt-1">Complete Lesson 1 to unlock</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-slate-200 opacity-75">
            <CardContent className="p-0">
              <div className="flex items-center p-5 md:p-6">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mr-5 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Lesson 3</p>
                  <h3 className="font-bold text-slate-600 text-lg">Simple Circuits</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-900 mb-4">Your Progress</h3>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-slate-500">0 of 4 Completed</span>
                <span className="text-teal-600">0%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full mb-6">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: '0%' }}></div>
              </div>
              
              <Link href="/student/learn/lesson/1">
                <Button className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base">
                  Start Course
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Course Reward</h4>
                <p className="text-xs text-amber-700 mt-1">Complete all lessons to earn the <strong>Circuit Master</strong> badge and 500 XP!</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}

// Dummy icon import to fix type error if BookOpen is unused
function BookOpen(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
}
