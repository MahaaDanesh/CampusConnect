import React, { useState } from 'react';
import { Search, MapPin, Trash2, Pencil, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { lostFoundApi } from '../api/endpoints.js';
import { getErrorMessage } from '../api/axios.js';
import usePaginatedList from '../hooks/usePaginatedList.js';
import useDebounce from '../hooks/useDebounce.js';
import { PageLoader, ErrorState, EmptyState } from '../components/StateViews.jsx';
import { SearchInput, SelectFilter, Toolbar, PrimaryActionButton } from '../components/Toolbar.jsx';
import Pagination from '../components/Pagination.jsx';
import Badge from '../components/Badge.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { formatDate } from '../utils/format.js';

const CATEGORIES = ['electronics', 'documents', 'accessories', 'books', 'clothing', 'other'];
const emptyForm = {
  type: 'lost',
  itemName: '',
  description: '',
  category: 'other',
  location: '',
  date: new Date().toISOString().slice(0, 10),
  contactInfo: '',
};

const LostFoundPage = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { items, filters, updateFilter, pagination, loading, error, refresh } = usePaginatedList(lostFoundApi.list, {
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

  const openCreate = (type) => {
    setForm({ ...emptyForm, type });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setForm({
      type: item.type,
      itemName: item.itemName,
      description: item.description,
      category: item.category,
      location: item.location,
      date: item.date?.slice(0, 10),
      contactInfo: item.contactInfo || '',
    });
    setEditingId(item._id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await lostFoundApi.update(editingId, form);
        toast.success('Listing updated');
      } else {
        await lostFoundApi.create(form);
        toast.success('Listing posted');
      }
      setModalOpen(false);
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const markResolved = async (item) => {
    try {
      await lostFoundApi.update(item._id, { status: item.status === 'open' ? 'closed' : 'open' });
      toast.success(item.status === 'open' ? 'Marked as resolved' : 'Reopened');
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await lostFoundApi.remove(deleteTarget._id);
      toast.success('Listing removed');
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Lost & Found</h1>
          <p className="text-sm text-ink-500">Report a lost item or something you've found around campus.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openCreate('lost')} className="btn-secondary">
            I lost something
          </button>
          <button onClick={() => openCreate('found')} className="btn-primary">
            I found something
          </button>
        </div>
      </div>

      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search items..." />
        <SelectFilter value={filters.type || ''} onChange={(v) => updateFilter('type', v)} options={['lost', 'found']} placeholder="All types" />
        <SelectFilter value={filters.category || ''} onChange={(v) => updateFilter('category', v)} options={CATEGORIES} placeholder="All categories" />
        <SelectFilter value={filters.status || ''} onChange={(v) => updateFilter('status', v)} options={['open', 'claimed', 'closed']} placeholder="All statuses" />
      </Toolbar>

      {loading && <PageLoader label="Loading listings..." />}
      {!loading && error && <ErrorState message={error} onRetry={refresh} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState icon={Search} title="No items found" description="Try different filters, or check back later." />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item._id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <Badge tone={item.type}>{item.type}</Badge>
                {(String(item.postedBy?._id) === String(user._id) || user.role === 'admin') && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(item)} className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <h3 className="mt-3 font-display font-semibold text-ink-900 dark:text-white">{item.itemName}</h3>
              <p className="mt-1 flex-1 text-sm text-ink-500 dark:text-ink-400 line-clamp-2">{item.description}</p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-400">
                <MapPin className="h-3.5 w-3.5" /> {item.location} · {formatDate(item.date)}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-ink-100 dark:border-ink-800 pt-3">
                <Badge tone={item.status}>{item.status}</Badge>
                {String(item.postedBy?._id) === String(user._id) && item.status !== 'claimed' && (
                  <button onClick={() => markResolved(item)} className="btn-ghost !py-1 !px-2 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {item.status === 'open' ? 'Mark resolved' : 'Reopen'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onChange={(p) => updateFilter('page', p)} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit listing' : form.type === 'lost' ? 'Report a lost item' : 'Report a found item'} size="md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Item name</label>
            <input required className="input" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
              <label className="label">Date</label>
              <input required type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Location</label>
            <input required className="input" placeholder="e.g. Library, 2nd floor" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea required rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Contact info (optional)</label>
            <input className="input" placeholder="Phone or email" value={form.contactInfo} onChange={(e) => setForm({ ...form, contactInfo: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving...' : editingId ? 'Save changes' : 'Post listing'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={submitting}
        title="Remove listing"
        description={`Remove "${deleteTarget?.itemName}" from Lost & Found?`}
        confirmLabel="Remove"
      />
    </div>
  );
};

export default LostFoundPage;
