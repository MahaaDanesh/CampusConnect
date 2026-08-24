import React, { useState } from 'react';
import { Megaphone, Pin, Trash2, Pencil, Paperclip } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { announcementApi } from '../api/endpoints.js';
import { getErrorMessage } from '../api/axios.js';
import usePaginatedList from '../hooks/usePaginatedList.js';
import useDebounce from '../hooks/useDebounce.js';
import { PageLoader, ErrorState, EmptyState } from '../components/StateViews.jsx';
import { SearchInput, SelectFilter, Toolbar, PrimaryActionButton } from '../components/Toolbar.jsx';
import Pagination from '../components/Pagination.jsx';
import Badge from '../components/Badge.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { formatDateTime } from '../utils/format.js';

const CATEGORIES = ['general', 'academic', 'exam', 'placement', 'event', 'urgent'];
const emptyForm = { title: '', content: '', category: 'general', audience: 'all', pinned: false, attachmentUrl: '' };

const AnnouncementsPage = () => {
  const { user } = useAuth();
  const canPost = user?.role === 'faculty' || user?.role === 'admin';
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);

  const { items, filters, updateFilter, pagination, loading, error, refresh } = usePaginatedList(announcementApi.list, {
    limit: 8,
  });

  React.useEffect(() => {
    updateFilter('search', debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title,
      content: item.content,
      category: item.category,
      audience: item.audience,
      pinned: item.pinned,
      attachmentUrl: item.attachmentUrl || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await announcementApi.update(editing._id, form);
        toast.success('Announcement updated');
      } else {
        await announcementApi.create(form);
        toast.success('Announcement posted');
      }
      setModalOpen(false);
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await announcementApi.remove(deleteTarget._id);
      toast.success('Announcement deleted');
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Announcements</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Campus-wide and department updates.</p>
        </div>
      </div>

      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search announcements..." />
        <SelectFilter value={filters.category || ''} onChange={(v) => updateFilter('category', v)} options={CATEGORIES} placeholder="All categories" />
        {canPost && <PrimaryActionButton onClick={openCreate} label="New Announcement" />}
      </Toolbar>

      {loading && <PageLoader />}
      {!loading && error && <ErrorState message={error} onRetry={refresh} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState icon={Megaphone} title="No announcements found" description="Try adjusting your filters, or check back later." />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a._id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {a.pinned && (
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                        <Pin className="h-3 w-3" /> Pinned
                      </span>
                    )}
                    <Badge tone={a.category}>{a.category}</Badge>
                    <Badge tone="default" className="capitalize">
                      {a.audience}
                    </Badge>
                  </div>
                  <h3 className="mt-2 font-display font-semibold text-lg text-ink-900 dark:text-white">{a.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-600 dark:text-ink-300 whitespace-pre-wrap">{a.content}</p>
                  {a.attachmentUrl && (
                    <a
                      href={a.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
                    >
                      <Paperclip className="h-3.5 w-3.5" /> Attachment
                    </a>
                  )}
                  <p className="mt-3 text-xs text-ink-400">
                    Posted by {a.postedBy?.name} ({a.postedBy?.role}) · {formatDateTime(a.createdAt)}
                  </p>
                </div>

                {(user?._id === a.postedBy?._id || user?.role === 'admin') && (
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => openEdit(a)} className="btn-ghost !p-2" aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(a)} className="btn-ghost !p-2 hover:!text-red-500" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onChange={(p) => updateFilter('page', p)} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Announcement' : 'New Announcement'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Content</label>
            <textarea required rows={5} className="input" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Audience</label>
              <select className="input" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                <option value="all">Everyone</option>
                <option value="students">Students only</option>
                <option value="faculty">Faculty only</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Attachment URL (optional)</label>
            <input className="input" placeholder="https://..." value={form.attachmentUrl} onChange={(e) => setForm({ ...form, attachmentUrl: e.target.value })} />
          </div>
          {user?.role === 'admin' && (
            <label className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300">
              <input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} className="rounded border-ink-300" />
              Pin to top
            </label>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Post Announcement'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        confirmLabel="Delete"
        description={`This will permanently delete "${deleteTarget?.title}". This cannot be undone.`}
      />
    </div>
  );
};

export default AnnouncementsPage;
