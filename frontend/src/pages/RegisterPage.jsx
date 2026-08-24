import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    rollNumber: '',
    designation: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await register(form);
    setSubmitting(false);
    if (res.success) {
      toast.success('Account created — welcome to CampusConnect!');
      navigate('/dashboard', { replace: true });
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 py-10 dark:bg-ink-950">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="font-display text-xl font-bold text-ink-900 dark:text-white">CampusConnect</span>
        </div>

        <div className="card p-7">
          <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">Create your account</h2>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Join as a student or faculty member.</p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'student' })}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  form.role === 'student'
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                    : 'border-ink-200 text-ink-500 dark:border-ink-700'
                }`}
              >
                I'm a Student
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'faculty' })}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  form.role === 'faculty'
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                    : 'border-ink-200 text-ink-500 dark:border-ink-700'
                }`}
              >
                I'm Faculty
              </button>
            </div>

            <div>
              <label className="label">Full name</label>
              <input required className="input" placeholder="Ada Lovelace" value={form.name} onChange={handleChange('name')} />
            </div>

            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                required
                className="input"
                placeholder="you@college.edu"
                value={form.email}
                onChange={handleChange('email')}
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="input"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange('password')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Department</label>
                <input className="input" placeholder="Computer Science" value={form.department} onChange={handleChange('department')} />
              </div>
              {form.role === 'student' ? (
                <div>
                  <label className="label">Roll number</label>
                  <input className="input" placeholder="CSE21045" value={form.rollNumber} onChange={handleChange('rollNumber')} />
                </div>
              ) : (
                <div>
                  <label className="label">Designation</label>
                  <input className="input" placeholder="Assistant Professor" value={form.designation} onChange={handleChange('designation')} />
                </div>
              )}
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Creating account...' : 'Create account'}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
