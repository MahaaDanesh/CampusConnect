import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, Megaphone, CalendarDays, FileWarning } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await login(form.email, form.password);
    setSubmitting(false);
    if (res.success) {
      toast.success('Welcome back!');
      const dest = location.state?.from?.pathname || '/dashboard';
      navigate(dest, { replace: true });
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left - branding panel */}
      <div className="relative hidden overflow-hidden bg-brand-950 lg:flex lg:flex-col lg:justify-between p-12 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-900 to-ink-950" />
        <div
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl"
          aria-hidden
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="font-display text-xl font-bold">CampusConnect</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-4xl font-bold leading-tight">
            Your entire campus,
            <br />
            one connected portal.
          </h1>
          <p className="mt-4 text-brand-100/80">
            Announcements, events, clubs, complaints, lost &amp; found and shared notes — for students, faculty and
            administrators alike.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: Megaphone, text: 'Never miss a department announcement' },
              { icon: CalendarDays, text: 'Register for events in one tap' },
              { icon: FileWarning, text: 'Track complaints from open to resolved' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-brand-50/90">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-brand-100/50">© {new Date().getFullYear()} CampusConnect</p>
      </div>

      {/* Right - form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold">CampusConnect</span>
          </div>

          <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Welcome back</h2>
          <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">Sign in to your CampusConnect account.</p>

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="email"
                  required
                  className="input pl-9"
                  placeholder="you@college.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input pl-9 pr-9"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Signing in...' : 'Sign in'}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
              Create one
            </Link>
          </p>

          <div className="mt-6 rounded-lg border border-ink-100 bg-ink-50 px-3.5 py-3 text-xs text-ink-500 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-400">
            Admin accounts are created by an existing administrator. Register above as a Student or Faculty member.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
