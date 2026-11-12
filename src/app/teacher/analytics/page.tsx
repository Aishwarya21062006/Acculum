"use client";

import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const scoreData = [
  { topic: 'Electricity', avg: 62, class7: 58, class8: 72 },
  { topic: 'Fractions', avg: 52, class7: 48, class8: 62 },
  { topic: 'Photosynthesis', avg: 68, class7: 65, class8: 74 },
  { topic: 'History', avg: 74, class7: 71, class8: 80 },
  { topic: 'Grammar', avg: 78, class7: 76, class8: 83 },
];

const weeklyProgress = [
  { day: 'Mon', students: 45 }, { day: 'Tue', students: 62 }, { day: 'Wed', students: 58 },
  { day: 'Thu', students: 71 }, { day: 'Fri', students: 89 }, { day: 'Sat', students: 34 }, { day: 'Sun', students: 22 },
];

const signalPie = [
  { name: 'On Track', value: 68, color: '#10b981' },
  { name: 'Needs Help', value: 22, color: '#f59e0b' },
  { name: 'Critical', value: 10, color: '#ef4444' },
];

export default function AnalyticsPage() {
  const { teacher } = useAuthStore();
  if (!teacher) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Class Analytics</h1>
        <p className="text-slate-500 mt-1">Performance insights for Classes {teacher.classes.join(' & ')}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg Class Score', value: '68%', sub: '+4% vs last week', color: 'text-emerald-600' },
          { label: 'Active Today', value: '89', sub: 'out of 142 students', color: 'text-blue-600' },
          { label: 'Topics Covered', value: '12', sub: 'this month', color: 'text-purple-600' },
          { label: 'Interventions', value: '7', sub: '3 resolved today', color: 'text-amber-600' },
        ].map((k, i) => (
          <Card key={i} className="border-slate-200">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-slate-500 mb-1">{k.label}</p>
              <p className={`text-3xl font-extrabold ${k.color}`}>{k.value}</p>
              <p className="text-xs text-slate-400 mt-1">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score by Topic */}
        <Card className="lg:col-span-2 border-slate-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-900 mb-6 text-lg">Average Score by Topic</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={scoreData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="topic" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="class7" name="Class 7" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="class8" name="Class 8" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Signal Distribution Pie */}
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-900 mb-6 text-lg">Student Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={signalPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {signalPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {signalPie.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: s.color }}></div>
                    <span className="text-sm font-medium text-slate-700">{s.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{s.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity Line Chart */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <h3 className="font-bold text-slate-900 mb-6 text-lg">Weekly Student Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyProgress} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="students" name="Active Students" stroke="#7c3aed" strokeWidth={3} dot={{ fill: '#7c3aed', r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
