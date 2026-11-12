import React, { useEffect, useState } from 'react';
import { notificationsApi } from '../api';
import { Notification } from '../types';
import { Card } from '../components/ui/Card';
import { Bell, CheckCircle2 } from 'lucide-react';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try { setNotifications(await notificationsApi.list()); } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id: string) => {
    await notificationsApi.markRead(id).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: 1 } : n));
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const n of unread) await notificationsApi.markRead(n.id).catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, read: 1 })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-indigo-600 hover:text-indigo-700">
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-xl border border-gray-200 animate-pulse" />)}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Bell size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No notifications yet.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => { if (!n.read) markRead(n.id); }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                n.read ? 'bg-white border-gray-100 opacity-70' : 'bg-indigo-50 border-indigo-200 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.read ? 'bg-gray-200' : 'bg-indigo-500'}`} />
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">{n.title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {new Date(n.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {n.read && <CheckCircle2 size={16} className="text-gray-300 flex-shrink-0 mt-0.5" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
