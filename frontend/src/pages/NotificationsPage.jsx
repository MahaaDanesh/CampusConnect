import React from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../api/endpoints.js';
import usePaginatedList from '../hooks/usePaginatedList.js';
import { PageLoader, ErrorState, EmptyState } from '../components/StateViews.jsx';
import Pagination from '../components/Pagination.jsx';
import { timeAgo } from '../utils/format.js';
import toast from 'react-hot-toast';

const typeTone = {
  announcement: 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300',
  event: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  complaint: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  lostfound: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  club: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  system: 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300',
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { items, setItems, filters, updateFilter, pagination, loading, error, refresh, extra } = usePaginatedList(
    notificationApi.list,
    { limit: 15 }
  );

  const markRead = async (id) => {
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    try {
      await notificationApi.markRead(id);
    } catch {
      /* noop */
    }
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await notificationApi.markAllRead();
      toast.success('All notifications marked as read');
    } catch {
      /* noop */
    }
  };

  const remove = async (id) => {
    setItems((prev) => prev.filter((n) => n._id !== id));
    try {
      await notificationApi.remove(id);
    } catch {
      /* noop */
    }
  };

  const handleClick = (n) => {
    if (!n.isRead) markRead(n._id);
    if (n.link) navigate(n.link.startsWith('/') ? n.link.split('/').slice(0, 2).join('/') : '/dashboard');
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-ink-500">{extra?.unreadCount > 0 ? `${extra.unreadCount} unread` : 'All caught up'}</p>
        </div>
        {extra?.unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary">
            <Check className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      {loading && <PageLoader label="Loading notifications..." />}
      {!loading && error && <ErrorState message={error} onRetry={refresh} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState icon={Bell} title="No notifications" description="You'll see updates about announcements, events, and more here." />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="card divide-y divide-ink-100 dark:divide-ink-800 overflow-hidden">
          {items.map((n) => (
            <div
              key={n._id}
              className={`group flex items-start gap-3 px-5 py-4 ${!n.isRead ? 'bg-brand-50/50 dark:bg-brand-500/10' : ''}`}
            >
              <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${typeTone[n.type] || typeTone.system}`}>
                {n.type}
              </span>
              <button onClick={() => handleClick(n)} className="min-w-0 flex-1 text-left">
                <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{n.title}</p>
                <p className="text-sm text-ink-500 dark:text-ink-400">{n.message}</p>
                <p className="mt-1 text-xs text-ink-400">{timeAgo(n.createdAt)}</p>
              </button>
              <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!n.isRead && (
                  <button onClick={() => markRead(n._id)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800" title="Mark read">
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => remove(n._id)} className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onChange={(p) => updateFilter('page', p)} />
    </div>
  );
};

export default NotificationsPage;
