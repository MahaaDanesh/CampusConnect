import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone,
  CalendarDays,
  FileWarning,
  Users2,
  ArrowRight,
  Pin,
  MapPin,
  Search as SearchIcon,
  BookOpen,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { announcementApi, eventApi, complaintApi, analyticsApi, clubApi } from '../api/endpoints.js';
import { getErrorMessage } from '../api/axios.js';
import StatCard from '../components/StatCard.jsx';
import Badge from '../components/Badge.jsx';
import { PageLoader, ErrorState, EmptyState } from '../components/StateViews.jsx';
import { formatDate, timeAgo } from '../utils/format.js';

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({ announcements: [], events: [], complaints: [], clubs: [], overview: null });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const calls = [
          announcementApi.list({ limit: 4 }),
          eventApi.list({ upcoming: 'true', limit: 4 }),
          complaintApi.list({ limit: 5 }),
          clubApi.list({ limit: 4 }),
        ];
        if (user?.role === 'admin') calls.push(analyticsApi.overview());

        const results = await Promise.all(calls);
        setData({
          announcements: results[0].data.data,
          events: results[1].data.data,
          complaints: results[2].data.data,
          clubs: results[3].data.data,
          overview: user?.role === 'admin' ? results[4].data.data : null,
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.role]);

  if (loading) return <PageLoader label="Loading your dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const openComplaints = data.complaints.filter((c) => c.status === 'open').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">
          {greeting()}, {user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Here's what's happening across campus today.
        </p>
      </div>

      {/* Stat row */}
      {user?.role === 'admin' && data.overview ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label="Total Users" value={data.overview.totals.totalUsers} tone="brand" />
          <StatCard icon={CalendarDays} label="Upcoming Events" value={data.overview.totals.upcomingEvents} tone="sky" />
          <StatCard icon={FileWarning} label="Open Complaints" value={data.overview.totals.openComplaints} tone="red" />
          <StatCard icon={Users2} label="Active Clubs" value={data.overview.totals.totalClubs} tone="emerald" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Megaphone} label="New Announcements" value={data.announcements.length} tone="brand" />
          <StatCard icon={CalendarDays} label="Upcoming Events" value={data.events.length} tone="sky" />
          <StatCard icon={FileWarning} label={user?.role === 'student' ? 'My Open Complaints' : 'Open Complaints'} value={openComplaints} tone="red" />
          <StatCard icon={Users2} label="Clubs to Explore" value={data.clubs.length} tone="emerald" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Announcements */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-ink-900 dark:text-white flex items-center gap-2">
              <Megaphone className="h-4.5 w-4.5 h-[18px] w-[18px] text-brand-500" /> Latest Announcements
            </h2>
            <Link to="/announcements" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400 flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {data.announcements.length === 0 ? (
            <EmptyState icon={Megaphone} title="No announcements yet" description="Check back soon for campus updates." />
          ) : (
            <div className="divide-y divide-ink-100 dark:divide-ink-800">
              {data.announcements.map((a) => (
                <Link to="/announcements" key={a._id} className="block py-3.5 first:pt-0 last:pb-0 group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-ink-800 dark:text-ink-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 flex items-center gap-1.5">
                        {a.pinned && <Pin className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                        <span className="truncate">{a.title}</span>
                      </p>
                      <p className="text-sm text-ink-500 dark:text-ink-400 line-clamp-1 mt-0.5">{a.content}</p>
                    </div>
                    <Badge tone={a.category}>{a.category}</Badge>
                  </div>
                  <p className="text-xs text-ink-400 mt-1.5">
                    {a.postedBy?.name} · {timeAgo(a.createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming events */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-ink-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="h-[18px] w-[18px] text-sky-500" /> Upcoming Events
            </h2>
            <Link to="/events" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
              All
            </Link>
          </div>
          {data.events.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No upcoming events" />
          ) : (
            <div className="space-y-3">
              {data.events.map((e) => (
                <Link to="/events" key={e._id} className="block rounded-lg border border-ink-100 dark:border-ink-800 p-3 hover:border-brand-300 dark:hover:border-brand-600 transition-colors">
                  <p className="font-medium text-sm text-ink-800 dark:text-ink-100 truncate">{e.title}</p>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-ink-400">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" /> {formatDate(e.date)}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3" /> {e.venue}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent complaints */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-ink-900 dark:text-white flex items-center gap-2">
              <FileWarning className="h-[18px] w-[18px] text-red-500" />
              {user?.role === 'student' ? 'My Complaints' : 'Recent Complaints'}
            </h2>
            <Link to="/complaints" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
              View all
            </Link>
          </div>
          {data.complaints.length === 0 ? (
            <EmptyState icon={FileWarning} title="No complaints" description={user?.role === 'student' ? "You haven't submitted any complaints." : 'Nothing to review yet.'} />
          ) : (
            <div className="divide-y divide-ink-100 dark:divide-ink-800">
              {data.complaints.slice(0, 5).map((c) => (
                <Link to="/complaints" key={c._id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-medium text-ink-800 dark:text-ink-100 truncate">{c.title}</p>
                  <Badge tone={c.status}>{c.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-ink-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/lost-found" className="flex flex-col gap-2 rounded-lg border border-ink-100 dark:border-ink-800 p-3.5 hover:border-brand-300 dark:hover:border-brand-600 transition-colors">
              <SearchIcon className="h-5 w-5 text-brand-500" />
              <span className="text-sm font-medium text-ink-800 dark:text-ink-100">Lost &amp; Found</span>
            </Link>
            <Link to="/notes" className="flex flex-col gap-2 rounded-lg border border-ink-100 dark:border-ink-800 p-3.5 hover:border-brand-300 dark:hover:border-brand-600 transition-colors">
              <BookOpen className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium text-ink-800 dark:text-ink-100">Notes &amp; Resources</span>
            </Link>
            <Link to="/clubs" className="flex flex-col gap-2 rounded-lg border border-ink-100 dark:border-ink-800 p-3.5 hover:border-brand-300 dark:hover:border-brand-600 transition-colors">
              <Users2 className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-medium text-ink-800 dark:text-ink-100">Browse Clubs</span>
            </Link>
            <Link to="/complaints" className="flex flex-col gap-2 rounded-lg border border-ink-100 dark:border-ink-800 p-3.5 hover:border-brand-300 dark:hover:border-brand-600 transition-colors">
              <FileWarning className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-ink-800 dark:text-ink-100">File a Complaint</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
