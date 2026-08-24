import React, { useState } from 'react';
import { Users2, Trash2, Pencil, LogOut, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { clubApi } from '../api/endpoints.js';
import { getErrorMessage } from '../api/axios.js';
import usePaginatedList from '../hooks/usePaginatedList.js';
import useDebounce from '../hooks/useDebounce.js';
import { PageLoader, ErrorState, EmptyState } from '../components/StateViews.jsx';
import { SearchInput, SelectFilter, Toolbar, PrimaryActionButton } from '../components/Toolbar.jsx';
import Pagination from '../components/Pagination.jsx';
import Badge from '../components/Badge.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Avatar from '../components/Avatar.jsx';

const CATEGORIES = ['technical', 'cultural', 'sports', 'literary', 'social', 'other'];
const emptyForm = { name: '', description: '', category: 'technical' };

const ClubsPage = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { items, filters, updateFilter, pagination, loading, error, refresh } = usePaginatedList(clubApi.list, {
    limit: 9,
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
  const [busyId, setBusyId] = useState(null);

  const canManage = user.role === 'faculty' || user.role === 'admin';

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (club) => {
    setForm({ name: club.name, description: club.description, category: club.category });
    setEditingId(club._id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await clubApi.update(editingId, form);
        toast.success('Club updated');
      } else {
        await clubApi.create(form);
        toast.success('Club created');
      }
      setModalOpen(false);
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await clubApi.remove(deleteTarget._id);
      toast.success('Club deleted');
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMembership = async (club) => {
    setBusyId(club._id);
    try {
      if (club.isMember) {
        await clubApi.leave(club._id);
        toast.success(`Left ${club.name}`);
      } else {
        await clubApi.join(club._id);
        toast.success(`Joined ${club.name}!`);
      }
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Clubs & Activities</h1>
          <p className="text-sm text-ink-500">Discover student communities and join what excites you.</p>
        </div>
      </div>

      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search clubs..." />
        <SelectFilter value={filters.category || ''} onChange={(v) => updateFilter('category', v)} options={CATEGORIES} placeholder="All categories" />
        {canManage && <PrimaryActionButton onClick={openCreate} label="New Club" />}
      </Toolbar>

      {loading && <PageLoader label="Loading clubs..." />}
      {!loading && error && <ErrorState message={error} onRetry={refresh} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState icon={Users2} title="No clubs found" description="Try a different search or check back later." />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((club) => (
            <div key={club._id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                    <Users2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-ink-900 dark:text-white leading-tight">{club.name}</h3>
                    <Badge tone="default" className="mt-1">{club.category}</Badge>
                  </div>
                </div>
                {(user.role === 'admin' || String(club.coordinator?._id) === String(user._id)) && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(club)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800">
                      <Pencil className="h-4 w-4" />
                    </button>
                    {user.role === 'admin' && (
                      <button onClick={() => setDeleteTarget(club)} className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <p className="mt-3 flex-1 text-sm text-ink-500 dark:text-ink-400 line-clamp-3">{club.description}</p>

              <div className="mt-4 flex items-center justify-between border-t border-ink-100 dark:border-ink-800 pt-3">
                <p className="text-xs text-ink-400">{club.memberCount} member{club.memberCount === 1 ? '' : 's'}</p>
                <button
                  onClick={() => toggleMembership(club)}
                  disabled={busyId === club._id}
                  className={club.isMember ? 'btn-secondary !py-1.5 !px-3 text-xs' : 'btn-primary !py-1.5 !px-3 text-xs'}
                >
                  {club.isMember ? (
                    <>
                      <LogOut className="h-3.5 w-3.5" /> Leave
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3.5 w-3.5" /> Join
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onChange={(p) => updateFilter('page', p)} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Club' : 'Create a Club'} size="md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Club name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input capitalize" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea required rows={4} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving...' : editingId ? 'Save changes' : 'Create club'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={submitting}
        title="Delete club"
        description={`Delete "${deleteTarget?.name}"? This removes all memberships and cannot be undone.`}
        confirmLabel="Delete club"
      />
    </div>
  );
};

export default ClubsPage;
