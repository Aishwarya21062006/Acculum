"use client";

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Users, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function TeacherDashboard() {
  const { teacher } = useAuthStore();
  const [showToast, setShowToast] = useState(false);

  if (!teacher) return null;

  const handleSendRevision = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Facilitator Dashboard</h1>
        <p className="text-slate-500 mt-1">Integrated learning overview for all subjects · Classes {teacher.classes?.join(', ') || '5-10'}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: '142', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Active Today', value: '89%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Need Attention', value: '7', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
          { label: 'Avg Class Score', value: '76%', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-100' },
        ].map((stat, i) => (
          <Card key={i} className="border-slate-200 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Multi-Subject Student Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Student Performance by Subject</h2>
          <Link href="/teacher/students" className="text-sm font-semibold text-purple-600 hover:underline">View All Students</Link>
        </div>
        <div className="space-y-4">
          {[
            {
              name: 'Anisha', class: '7A', avatar: '🦋', overall: 80,
              subjects: [
                { name: 'Mathematics', icon: '🔢', score: 68, status: 'needs-attention' },
                { name: 'Science', icon: '🔬', score: 88, status: 'strong' },
                { name: 'English', icon: '📝', score: 91, status: 'strong' },
                { name: 'Social Science', icon: '🌍', score: 74, status: 'on-track' },
              ],
            },
            {
              name: 'Rahul', class: '8B', avatar: '🐯', overall: 72,
              subjects: [
                { name: 'Mathematics', icon: '🔢', score: 58, status: 'needs-attention' },
                { name: 'Science', icon: '🔬', score: 72, status: 'on-track' },
                { name: 'English', icon: '📝', score: 80, status: 'strong' },
                { name: 'Kannada', icon: '🅺', score: 69, status: 'on-track' },
              ],
            },
            {
              name: 'Priya', class: '9A', avatar: '🦊', overall: 88,
              subjects: [
                { name: 'Physics', icon: '⚡', score: 92, status: 'strong' },
                { name: 'Chemistry', icon: '🧪', score: 86, status: 'strong' },
                { name: 'Biology', icon: '🌱', score: 90, status: 'strong' },
                { name: 'Mathematics', icon: '🔢', score: 84, status: 'strong' },
              ],
            },
          ].map((studentData, si) => (
            <Card key={si} className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-2xl border border-slate-200">{studentData.avatar}</div>
                    <div>
                      <h3 className="font-bold text-slate-900">{studentData.name}</h3>
                      <p className="text-xs text-slate-500">Class {studentData.class}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Overall</p>
                      <p className="text-xl font-bold text-slate-900">{studentData.overall}%</p>
                    </div>
                    <Link href="/teacher/students">
                      <Button size="sm" variant="outline" className="text-xs">View Detail <ChevronRight className="w-3 h-3 ml-1" /></Button>
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {studentData.subjects.map((subj, subji) => (
                    <div key={subji} className={`p-3 rounded-xl border ${
                      subj.status === 'strong' ? 'bg-emerald-50 border-emerald-200' :
                      subj.status === 'needs-attention' ? 'bg-red-50 border-red-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-sm">{subj.icon}</span>
                        <span className="text-xs font-bold text-slate-700 truncate">{subj.name}</span>
                      </div>
                      <p className={`text-xl font-extrabold ${
                        subj.status === 'strong' ? 'text-emerald-600' :
                        subj.status === 'needs-attention' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>{subj.score}%</p>
                      <p className={`text-[10px] font-bold ${
                        subj.status === 'strong' ? 'text-emerald-600' :
                        subj.status === 'needs-attention' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {subj.status === 'strong' ? '✓ Strong' : subj.status === 'needs-attention' ? '⚠ Needs Attention' : '→ On Track'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Intervention Alerts - Core Feature */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              Action Required
            </h2>
            <Link href="/teacher/interventions" className="text-sm font-semibold text-purple-600 hover:text-purple-700">View All</Link>
          </div>

          {/* Red Alert Card (Confidence Mismatch) */}
          <Card className="border-l-4 border-l-red-500 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-bl-lg">High Priority</div>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl border border-slate-200">🦁</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-lg">Anisha</h3>
                    <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 rounded text-slate-600">Class 7A</span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 mt-1">Topic: <span className="font-bold text-slate-900">Electricity</span></p>
                  
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100 flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Learning Signal</p>
                      <p className="text-sm font-bold text-red-600">Confidence-Performance Mismatch</p>
                      <p className="text-xs text-red-700 mt-1">Student rated confidence 5/5 but scored 42% on the quiz.</p>
                    </div>
                    <div className="md:border-l md:border-red-200 md:pl-4 flex flex-col justify-center">
                      <p className="text-xs font-bold text-slate-500 mb-1">Recommended Action</p>
                      <p className="text-sm font-semibold text-slate-900">Revision + Conceptual Practice</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleSendRevision}>
                      Send Revision Task
                    </Button>
                    <Button size="sm" variant="outline">View Profile</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Yellow Alert Card */}
          <Card className="border-l-4 border-l-amber-500 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl border border-slate-200">🦊</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">Meera</h3>
                    <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 rounded text-slate-600">Class 7A</span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 mt-1">Topic: <span className="font-bold text-slate-900">Fractions</span></p>
                  <p className="text-sm text-amber-700 mt-1 bg-amber-50 inline-block px-2 py-1 rounded font-medium border border-amber-100">
                    Repeated errors (3 attempts &lt; 50%)
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white h-8 text-xs" onClick={handleSendRevision}>Assign Practice</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Green Alert Card */}
          <Card className="border-l-4 border-l-emerald-500 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl border border-slate-200">🦅</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">Arjun</h3>
                    <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 rounded text-slate-600">Class 8C</span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 mt-1">Topic: <span className="font-bold text-slate-900">Robotics Basics</span></p>
                  <p className="text-sm text-emerald-700 mt-1 bg-emerald-50 inline-block px-2 py-1 rounded font-medium border border-emerald-100">
                    Mastered concept early (Score: 95%)
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs" onClick={handleSendRevision}>Unlock Advanced Module</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Quick Assignment */}
        <div className="space-y-6">
          <Card className="border-purple-100 bg-gradient-to-b from-white to-purple-50/30">
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-900 mb-4 text-lg">Quick Assign</h3>
              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); handleSendRevision(); }}>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Class</label>
                  <select className="w-full text-sm p-2 rounded-lg border border-slate-200 mt-1">
                    <option>Class 7 - All Sections</option>
                    <option>Class 7A</option>
                    <option>Class 8</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Topic</label>
                  <input type="text" className="w-full text-sm p-2 rounded-lg border border-slate-200 mt-1" defaultValue="Electricity Revision" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Due Date</label>
                  <input type="date" className="w-full text-sm p-2 rounded-lg border border-slate-200 mt-1" />
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-2">Send to Class</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wider">Top Struggling Topics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Fractions (Class 7)</span>
                  <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">52% Avg</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full"><div className="bg-red-400 h-1.5 rounded-full w-[52%]"></div></div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-medium text-slate-700">Photosynthesis (Class 8)</span>
                  <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded">64% Avg</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full"><div className="bg-amber-400 h-1.5 rounded-full w-[64%]"></div></div>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-4 text-purple-600 text-xs">View Full Report <ChevronRight className="w-3 h-3 ml-1"/></Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mock Toast */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-slide-up z-50">
          <CheckCircle2 className="text-emerald-400 w-5 h-5" />
          <p className="text-sm font-medium">Action sent successfully!</p>
        </div>
      )}
    </div>
  );
}
