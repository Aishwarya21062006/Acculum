import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { notificationsApi } from './api';
import { Layout } from './components/Layout';
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { StudentDetailPage } from './pages/StudentDetailPage';
import { ReportsPage } from './pages/ReportsPage';
import { SignalsPage } from './pages/SignalsPage';
import { InterventionsPage } from './pages/InterventionsPage';
import { ClassAnalyticsPage } from './pages/ClassAnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { TextbookManagementPage } from './pages/TextbookManagementPage';
import { StudentTextbooksPage } from './pages/StudentTextbooksPage';
import { QuizGeneratorPage } from './pages/QuizGeneratorPage';
import { QuizAttemptPage } from './pages/QuizAttemptPage';

function Router() {
  const { facilitator, loading } = useAuth();
  const [page, setPage] = useState(() => window.location.hash.slice(1) || 'dashboard');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handler = () => setPage(window.location.hash.slice(1) || 'dashboard');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to;
    setPage(to);
  };

  // Fetch unread notifications periodically
  useEffect(() => {
    if (!facilitator) return;
    const fetchUnread = () => {
      notificationsApi.list()
        .then(ns => setUnreadCount(ns.filter(n => !n.read).length))
        .catch(() => { });
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30_000);
    return () => clearInterval(interval);
  }, [facilitator]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">Loading Acculum...</p>
        </div>
      </div>
    );
  }

  if (!facilitator) {
    return <LoginPage />;
  }

  // Parse page and potential id
  const cleanPage = page.split('?')[0];
  const [basePage, ...parts] = cleanPage.split('/');
  const entityId = parts[0];

  const renderPage = () => {
    switch (basePage) {
      case 'dashboard':
        return <DashboardPage navigate={navigate} />;
      case 'textbooks':
        return <TextbookManagementPage navigate={navigate} />;
      case 'student-textbooks':
        return <StudentTextbooksPage navigate={navigate} />;
      case 'quiz-generator':
        return <QuizGeneratorPage navigate={navigate} />;
      case 'quiz-attempt':
        return <QuizAttemptPage quizId={entityId} navigate={navigate} />;
      case 'students':
        if (entityId) return <StudentDetailPage studentId={entityId} navigate={navigate} />;
        return <StudentsPage navigate={navigate} />;
      case 'reports':
        return <ReportsPage navigate={navigate} />;
      case 'signals':
        return <SignalsPage navigate={navigate} />;
      case 'interventions':
        return <InterventionsPage navigate={navigate} />;
      case 'analytics':
        return <ClassAnalyticsPage navigate={navigate} />;
      case 'notifications':
        return <NotificationsPage />;
      case 'settings':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Settings</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-sm font-medium text-gray-700">Profile</p>
                  <p className="text-sm text-gray-500 mt-1">{facilitator.full_name}</p>
                  <p className="text-sm text-gray-400">{facilitator.email}</p>
                  {facilitator.school && <p className="text-sm text-gray-400">{facilitator.school}</p>}
                </div>
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-sm font-medium text-amber-800">Demo Data Management</p>
                  <p className="text-sm text-amber-600 mt-1">
                    Use the Dashboard to load or clear demo data. Demo records are clearly marked and separate from real student reports.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <p className="text-sm font-medium text-blue-800">Report Schema Version</p>
                  <p className="text-sm text-blue-600 mt-1">Supported: v1.0, v1.1</p>
                  <p className="text-xs text-blue-400 mt-1">
                    Sample student reports can be downloaded from: GET /api/demo/rahul-report-1
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <DashboardPage navigate={navigate} />;
    }
  };

  return (
    <Layout currentPage={page} navigate={navigate} unreadNotifications={unreadCount}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
