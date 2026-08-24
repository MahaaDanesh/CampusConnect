import React, { useState } from 'react';
import { MessageSquareWarning, EyeOff, Trash2, MessageCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { complaintApi } from '../api/endpoints.js';
import { getErrorMessage } from '../api/axios.js';
import usePaginatedList from '../hooks/usePaginatedList.js';
import { PageLoader, ErrorState, EmptyState, InlineSpinner } from '../components/StateViews.jsx';
import { SelectFilter, Toolbar, PrimaryActionButton } from '../components/Toolbar.jsx';
import Pagination from '../components/Pagination.jsx';
import Badge from '../components/Badge.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { formatDateTime, timeAgo } from '../utils/format.js';

const CATEGORIES = ['hostel', 'academic', 'infrastructure', 'ragging', 'harassment', 'canteen', 'other'];
const STATUSES = ['open', 'in-progress', 'resolved', 'rejected'];
const emptyForm = { title: '', description: '', category: 'other', priority: 'medium', isAnonymous: false };

const ComplaintsPage = () => {
  const { user } = useAuth();
  const isStaff = user.role === 'faculty' || user.role === 'admin';
  const { items, filters, updateFilter, pagination, loading, error, refresh } = usePaginatedList(complaintApi.list, {
    limit: 10,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [statusDraft, setStatusDraft] = useState({ status: '', priority: '', resolutionNote: '' });

  const openCreate = () => {
    setForm(emptyForm);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await complaintApi.create(form);
      toast.success('Complaint submitted. You can track its status here.');
      setModalOpen(false);
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = async (row) => {
    setDetailLoading(true);
    setDetail({ _id: row._id });
    try {
      const res = await complaintApi.get(row._id);
      setDetail(res.data.data);
      setStatusDraft({
        status: res.data.data.status,
        priority: res.data.data.priority,
        resolutionNote: res.data.data.resolutionNote || '',
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusSave = async () => {
    setSubmitting(true);
    try {
      const res = await complaintApi.updateStatus(detail._id, statusDraft);
      setDetail((d) => ({ ...d, ...res.data.data }));
      toast.success('Complaint updated');
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await complaintApi.addComment(detail._id, comment);
      setDetail(res.data.data);
      setComment('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await complaintApi.remove(deleteTarget._id);
      toast.success('Complaint deleted');
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
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Complaints</h1>
          <p className="text-sm text-ink-500">
            {isStaff ? 'Review and resolve complaints submitted by the community.' : 'Submit and track your complaints.'}
          </p>
        </div>
      </div>

      <Toolbar>
        <SelectFilter value={filters.status || ''} onChange={(v) => updateFilter('status', v)} options={STATUSES} placeholder="All statuses" />
        <SelectFilter value={filters.category || ''} onChange={(v) => updateFilter('category', v)} options={CATEGORIES} placeholder="All categories" />
        <PrimaryActionButton onClick={openCreate} label="File a Complaint" />
      </Toolbar>

      {loading && <PageLoader label="Loading complaints..." />}
      {!loading && error && <ErrorState message={error} onRetry={refresh} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState icon={MessageSquareWarning} title="No complaints found" description="Nothing matches your filters right now." />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="card divide-y divide-ink-100 dark:divide-ink-800 overflow-hidden">
          {items.map((c) => (
            <button key={c._id} onClick={() => openDetail(c)} className="flex w-full flex-col gap-2 px-5 py-4 text-left hover:bg-ink-50 dark:hover:bg-ink-800/60 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink-900 dark:text-white truncate">{c.title}</p>
                  {c.isAnonymous && <EyeOff className="h-3.5 w-3.5 text-ink-400" title="Anonymous" />}
                </div>
                <p className="mt-0.5 text-xs text-ink-500">
                  {c.submittedBy?.name || 'Anonymous'} · {timeAgo(c.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge tone="default" className="capitalize">{c.category}</Badge>
                <Badge tone={c.priority}>{c.priority}</Badge>
                <Badge tone={c.status}>{c.status}</Badge>
              </div>
            </button>
          ))}
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onChange={(p) => updateFilter('page', p)} />

      {/* Create modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="File a Complaint" size="md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Title</label>
            <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
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
              <label className="label">Priority</label>
              <select className="input capitalize" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {['low', 'medium', 'high'].map((p) => (
                  <option key={p} value={p} className="capitalize">
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea required rows={4} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300">
            <input type="checkbox" className="h-4 w-4 rounded border-ink-300" checked={form.isAnonymous} onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })} />
            Submit anonymously (your identity is hidden from other students/faculty)
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Submitting...' : 'Submit complaint'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail modal */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Complaint details" size="lg">
        {detailLoading && <InlineSpinner label="Loading details..." />}
        {!detailLoading && detail?.title && (
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-white">{detail.title}</h3>
                <Badge tone={detail.status}>{detail.status}</Badge>
                <Badge tone={detail.priority}>{detail.priority}</Badge>
              </div>
              <p className="mt-1 text-xs text-ink-500">
                Filed by {detail.isAnonymous ? 'Anonymous' : detail.submittedBy?.name} · {formatDateTime(detail.createdAt)}
              </p>
              <p className="mt-3 text-sm text-ink-600 dark:text-ink-300 whitespace-pre-wrap">{detail.description}</p>
            </div>

            {isStaff && (
              <div className="rounded-xl2 border border-ink-100 dark:border-ink-800 p-4">
                <p className="mb-3 text-sm font-semibold text-ink-800 dark:text-ink-100">Manage status</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Status</label>
                    <select className="input capitalize" value={statusDraft.status} onChange={(e) => setStatusDraft({ ...statusDraft, status: e.target.value })}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="capitalize">
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Priority</label>
                    <select className="input capitalize" value={statusDraft.priority} onChange={(e) => setStatusDraft({ ...statusDraft, priority: e.target.value })}>
                      {['low', 'medium', 'high'].map((p) => (
                        <option key={p} value={p} className="capitalize">
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="label">Resolution note</label>
                  <textarea rows={2} className="input" value={statusDraft.resolutionNote} onChange={(e) => setStatusDraft({ ...statusDraft, resolutionNote: e.target.value })} />
                </div>
                <button onClick={handleStatusSave} disabled={submitting} className="btn-primary mt-3">
                  Update complaint
                </button>
              </div>
            )}

            {!isStaff && detail.resolutionNote && (
              <div className="rounded-xl2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900/50 p-4 text-sm text-emerald-800 dark:text-emerald-300">
                <strong>Resolution note:</strong> {detail.resolutionNote}
              </div>
            )}

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-800 dark:text-ink-100">
                <MessageCircle className="h-4 w-4" /> Comments
              </p>
              <div className="flex flex-col gap-3 max-h-56 overflow-y-auto pr-1">
                {(detail.comments || []).length === 0 && <p className="text-xs text-ink-400">No comments yet.</p>}
                {(detail.comments || []).map((c, i) => (
                  <div key={i} className="rounded-lg bg-ink-50 dark:bg-ink-800 px-3.5 py-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-ink-700 dark:text-ink-200">{c.author?.name || 'User'}</p>
                      <p className="text-[11px] text-ink-400">{timeAgo(c.createdAt)}</p>
                    </div>
                    <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">{c.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  className="input"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button onClick={handleAddComment} disabled={submitting} className="btn-primary !px-3.5">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            {(user.role === 'admin' || (String(detail.submittedBy?._id) === String(user._id))) && (
              <button
                onClick={() => {
                  setDeleteTarget(detail);
                  setDetail(null);
                }}
                className="btn-danger self-start !py-1.5 !px-3 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete complaint
              </button>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={submitting}
        title="Delete complaint"
        description="This will permanently remove the complaint and its comments."
        confirmLabel="Delete"
      />
    </div>
  );
};

export default ComplaintsPage;
