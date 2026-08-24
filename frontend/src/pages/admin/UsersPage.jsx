import React, { useState } from 'react';
import { ShieldCheck, Trash2, Pencil, UserX, UserCheck, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { userApi } from '../../api/endpoints.js';
import { getErrorMessage } from '../../api/axios.js';
import usePaginatedList from '../../hooks/usePaginatedList.js';
import useDebounce from '../../hooks/useDebounce.js';
import { PageLoader, ErrorState, EmptyState } from '../../components/StateViews.jsx';
import { SearchInput, SelectFilter, Toolbar, PrimaryActionButton } from '../../components/Toolbar.jsx';
import Pagination from '../../components/Pagination.jsx';
import Badge from '../../components/Badge.jsx';
import Avatar from '../../components/Avatar.jsx';
import Modal from '../../components/Modal.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { formatDate } from '../../utils/format.js';

const ROLES = ['student', 'faculty', 'admin'];
const emptyForm = { name: '', email: '', password: '', role: 'student', department: '' };

const UsersPage = () => {
  const { user: me } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { items, filters, updateFilter, pagination, loading, error, refresh } = usePaginatedList(userApi.list, {
    limit: 12,
  });

  React.useEffect(() => {
    updateFilter('search', debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role, department: u.department || '' });
    setEditingId(u._id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await userApi.update(editingId, { name: form.name, role: form.role, department: form.department });
        toast.success('User updated');
      } else {
        await userApi.create(form);
        toast.success('User created');
      }
      setModalOpen(false);
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (u) => {
    try {
      await userApi.update(u._id, { isActive: !u.isActive });
      toast.success(u.isActive ? 'User deactivated' : 'User reactivated');
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await userApi.remove(deleteTarget._id);
      toast.success('User removed');
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Manage Users</h1>
          <p className="text-sm text-ink-500">Create accounts, assign roles, and manage access.</p>
        </div>
      </div>

      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email..." />
        <SelectFilter value={filters.role || ''} onChange={(v) => updateFilter('role', v)} options={ROLES} placeholder="All roles" />
        <PrimaryActionButton onClick={openCreate} label="Add User" icon={Plus} />
      </Toolbar>

      {loading && <PageLoader label="Loading users..." />}
      {!loading && error && <ErrorState message={error} onRetry={refresh} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState icon={ShieldCheck} title="No users found" description="Try a different search or filter." />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 dark:bg-ink-800/60 text-left text-xs uppercase tracking-wider text-ink-400">
                <tr>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                {items.map((u) => (
                  <tr key={u._id} className="hover:bg-ink-50/60 dark:hover:bg-ink-800/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} color={u.avatarColor} size="sm" />
                        <div>
                          <p className="font-medium text-ink-800 dark:text-ink-100">{u.name}</p>
                          <p className="text-xs text-ink-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={u.role}>{u.role}</Badge>
                    </td>
                    <td className="px-5 py-3 text-ink-500 dark:text-ink-400">{u.department || '—'}</td>
                    <td className="px-5 py-3 text-ink-500 dark:text-ink-400">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-3">
                      <Badge tone={u.isActive ? 'resolved' : 'rejected'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(u)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => toggleActive(u)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800" title={u.isActive ? 'Deactivate' : 'Reactivate'}>
                          {u.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                        {String(u._id) !== String(me._id) && (
                          <button onClick={() => setDeleteTarget(u)} className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onChange={(p) => updateFilter('page', p)} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit user' : 'Add a new user'} size="sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Full name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input required type="email" disabled={!!editingId} className={`input ${editingId ? 'opacity-60' : ''}`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          {!editingId && (
            <div>
              <label className="label">Temporary password</label>
              <input required type="password" minLength={6} className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
          )}
          <div>
            <label className="label">Role</label>
            <select className="input capitalize" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => (
                <option key={r} value={r} className="capitalize">
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Department</label>
            <input className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving...' : editingId ? 'Save changes' : 'Create user'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={submitting}
        title="Delete user"
        description={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete user"
      />
    </div>
  );
};

export default UsersPage;
