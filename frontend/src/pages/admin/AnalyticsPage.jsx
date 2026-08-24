import React, { useEffect, useState } from 'react';
import {
  Users,
  CalendarDays,
  MessageSquareWarning,
  Users2,
  Megaphone,
  Search,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { analyticsApi } from '../../api/endpoints.js';
import { getErrorMessage } from '../../api/axios.js';
import StatCard from '../../components/StatCard.jsx';
import { PageLoader, ErrorState } from '../../components/StateViews.jsx';

const PIE_COLORS = ['#4638d6', '#faa722', '#10B981', '#EF4444', '#0EA5E9', '#8B5CF6'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await analyticsApi.overview();
      setData(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <PageLoader label="Crunching the numbers..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const { totals } = data;

  const signupTrend = data.signupTrend.map((d) => ({
    label: `${MONTHS[d._id.month - 1]}`,
    signups: d.count,
  }));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white mb-1">Analytics Overview</h1>
      <p className="text-sm text-ink-500 mb-6">Platform-wide activity across CampusConnect.</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 mb-6">
        <StatCard icon={Users} label="Total Users" value={totals.totalUsers} tone="brand" hint={`${totals.studentCount} students · ${totals.facultyCount} faculty`} />
        <StatCard icon={CalendarDays} label="Events" value={totals.totalEvents} tone="amber" hint={`${totals.upcomingEvents} upcoming`} />
        <StatCard icon={MessageSquareWarning} label="Complaints" value={totals.totalComplaints} tone="red" hint={`${totals.openComplaints} open`} />
        <StatCard icon={Users2} label="Active Clubs" value={totals.totalClubs} tone="emerald" />
        <StatCard icon={Megaphone} label="Announcements" value={totals.totalAnnouncements} tone="sky" />
        <StatCard icon={Search} label="Lost & Found" value={totals.totalLostFound} tone="brand" hint={`${totals.openLostFound} open`} />
        <StatCard icon={BookOpen} label="Shared Notes" value={totals.totalNotes} tone="amber" />
        <StatCard icon={CheckCircle2} label="Event RSVPs" value={totals.totalRegistrations} tone="emerald" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-display font-semibold text-ink-900 dark:text-white mb-4">Complaints by category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.complaintsByCategory}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-ink-100 dark:stroke-ink-800" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} className="capitalize" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#4638d6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-display font-semibold text-ink-900 dark:text-white mb-4">Complaint status breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.complaintsByStatus} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={90} label>
                {data.complaintsByStatus.map((entry, i) => (
                  <Cell key={entry._id} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-display font-semibold text-ink-900 dark:text-white mb-4">User signups (last 6 months)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={signupTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-ink-100 dark:stroke-ink-800" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="signups" stroke="#faa722" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-display font-semibold text-ink-900 dark:text-white mb-4">Users by department</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.usersByDepartment} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-ink-100 dark:stroke-ink-800" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="_id" width={110} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
