import React, { useState } from 'react';
import { Save, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { userApi } from '../api/endpoints.js';
import { getErrorMessage } from '../api/axios.js';
import Avatar from '../components/Avatar.jsx';
import Badge from '../components/Badge.jsx';
import { formatDate } from '../utils/format.js';

const COLORS = ['#4638d6', '#0EA5E9', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

const ProfilePage = () => {
  const { user, updateUserLocal } = useAuth();

  const [form, setForm] = useState({
    name: user.name || '',
    department: user.department || '',
    rollNumber: user.rollNumber || '',
    designation: user.designation || '',
    bio: user.bio || '',
    phone: user.phone || '',
    avatarColor: user.avatarColor || '#4638d6',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await userApi.updateMe(form);
      updateUserLocal(res.data.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await userApi.changePassword(pwForm);
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white mb-1">My Profile</h1>
      <p className="text-sm text-ink-500 mb-6">Manage your personal information and account security.</p>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4">
          <Avatar name={form.name} color={form.avatarColor} size="lg" />
          <div>
            <p className="font-display text-lg font-semibold text-ink-900 dark:text-white">{user.name}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge tone={user.role}>{user.role}</Badge>
              <span className="text-xs text-ink-400">Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="label">Avatar color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setForm({ ...form, avatarColor: c })}
                  className={`h-7 w-7 rounded-full ring-offset-2 ring-offset-white dark:ring-offset-ink-900 ${form.avatarColor === c ? 'ring-2 ring-ink-900 dark:ring-white' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full name</label>
              <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input disabled className="input opacity-60" value={user.email} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Department</label>
              <input className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </div>
            {user.role === 'student' ? (
              <div>
                <label className="label">Roll number</label>
                <input className="input" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} />
              </div>
            ) : (
              <div>
                <label className="label">Designation</label>
                <input className="input" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
              </div>
            )}
          </div>

          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>

          <div>
            <label className="label">Bio</label>
            <textarea rows={3} maxLength={300} className="input" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>

          <button type="submit" disabled={savingProfile} className="btn-primary self-start">
            <Save className="h-4 w-4" /> {savingProfile ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="font-display font-semibold text-ink-900 dark:text-white mb-1">Change password</h2>
        <p className="text-sm text-ink-500 mb-4">Choose a strong password you don't use elsewhere.</p>
        <form onSubmit={handlePasswordSave} className="flex flex-col gap-4 max-w-sm">
          <div>
            <label className="label">Current password</label>
            <input required type="password" className="input" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
          </div>
          <div>
            <label className="label">New password</label>
            <input required type="password" minLength={6} className="input" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
          </div>
          <button type="submit" disabled={savingPassword} className="btn-secondary self-start">
            <KeyRound className="h-4 w-4" /> {savingPassword ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
