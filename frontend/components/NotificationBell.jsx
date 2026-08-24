import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { notificationApi } from '../api/endpoints.js';
import { timeAgo } from '../utils/format.js';
import { Link } from 'react-router-dom';
import { InlineSpinner, EmptyState } from './StateViews.jsx';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.list({ limit: 8 });
      setItems(res.data.data);
      setUnreadCount(res.data.unreadCount);
    } catch {
      // silent - non-critical widget
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id) => {
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await notificationApi.markRead(id);
    } catch {
      /* revert not critical for demo */
    }
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await notificationApi.markAllRead();
    } catch {
      /* noop */
    }
  };

  const removeNotification = async (id) => {
    setItems((prev) => prev.filter((n) => n._id !== id));
    try {
      await notificationApi.remove(id);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-ink-500 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-xl2 border border-ink-100 bg-white shadow-2xl animate-fadeIn dark:border-ink-800 dark:bg-ink-900">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3 dark:border-ink-800">
            <h4 className="font-display text-sm font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading && <InlineSpinner label="Loading notifications" />}
            {!loading && items.length === 0 && (
              <div className="py-8">
                <EmptyState title="You're all caught up" description="New updates will show up here." />
              </div>
            )}
            {!loading &&
              items.map((n) => (
                <div
                  key={n._id}
                  className={`group flex gap-2 border-b border-ink-50 px-4 py-3 text-sm last:border-0 dark:border-ink-800/60 ${
                    !n.isRead ? 'bg-brand-50/60 dark:bg-brand-500/10' : ''
                  }`}
                >
                  <Link
                    to={n.link || '#'}
                    onClick={() => {
                      if (!n.isRead) markRead(n._id);
                      setOpen(false);
                    }}
                    className="flex-1"
                  >
                    <p className="font-medium text-ink-800 dark:text-ink-100">{n.title}</p>
                    <p className="text-ink-500 dark:text-ink-400 line-clamp-2">{n.message}</p>
                    <p className="mt-1 text-xs text-ink-400">{timeAgo(n.createdAt)}</p>
                  </Link>
                  <div className="flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!n.isRead && (
                      <button onClick={() => markRead(n._id)} className="rounded p-1 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700" title="Mark read">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button onClick={() => removeNotification(n._id)} className="rounded p-1 text-ink-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
