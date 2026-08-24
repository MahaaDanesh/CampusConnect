import React, { useState } from 'react';
import { BookOpen, Download, Trash2, Pencil, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { noteApi } from '../api/endpoints.js';
import { getErrorMessage } from '../api/axios.js';
import usePaginatedList from '../hooks/usePaginatedList.js';
import useDebounce from '../hooks/useDebounce.js';
import { PageLoader, ErrorState, EmptyState } from '../components/StateViews.jsx';
import { SearchInput, Toolbar, PrimaryActionButton } from '../components/Toolbar.jsx';
import Pagination from '../components/Pagination.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { formatDate } from '../utils/format.js';

const emptyForm = { title: '', description: '', subject: '', department: '', semester: 0, fileUrl: '', fileName: '', tags: '' };

const NotesPage = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { items, filters, updateFilter, pagination, loading, error, refresh } = usePaginatedList(noteApi.list, {
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

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (note) => {
    setForm({
      title: note.title,
      description: note.description || '',
      subject: note.subject,
      department: note.department || '',
      semester: note.semester || 0,
      fileUrl: note.fileUrl,
      fileName: note.fileName || '',
      tags: (note.tags || []).join(', '),
    });
    setEditingId(note._id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [] };
      if (editingId) {
        await noteApi.update(editingId, payload);
        toast.success('Note updated');
      } else {
        await noteApi.create(payload);
        toast.success('Note shared with the community');
      }
      setModalOpen(false);
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (note) => {
    try {
      await noteApi.trackDownload(note._id);
    } catch {
      /* non-critical */
    }
    window.open(note.fileUrl, '_blank', 'noopener');
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await noteApi.remove(deleteTarget._id);
      toast.success('Note removed');
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
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Notes & Resources</h1>
          <p className="text-sm text-ink-500">Share and discover study material contributed by your peers.</p>
        </div>
      </div>

      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by title, subject, or tag..." />
        <PrimaryActionButton onClick={openCreate} label="Share a Note" />
      </Toolbar>

      {loading && <PageLoader label="Loading notes..." />}
      {!loading && error && <ErrorState message={error} onRetry={refresh} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState icon={BookOpen} title="No notes yet" description="Be the first to share study material for this search." />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((note) => (
            <div key={note._id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                  <FileText className="h-5 w-5" />
                </div>
                {(String(note.uploadedBy?._id) === String(user._id) || user.role === 'admin') && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(note)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(note)} className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <h3 className="mt-3 font-display font-semibold text-ink-900 dark:text-white line-clamp-1">{note.title}</h3>
              <p className="text-xs text-ink-400 mt-0.5">
                {note.subject} {note.semester ? `· Sem ${note.semester}` : ''} {note.department ? `· ${note.department}` : ''}
              </p>
              {note.description && <p className="mt-2 flex-1 text-sm text-ink-500 dark:text-ink-400 line-clamp-2">{note.description}</p>}
              {note.tags?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {note.tags.map((t) => (
                    <span key={t} className="rounded-full bg-ink-100 dark:bg-ink-800 px-2 py-0.5 text-[11px] text-ink-500 dark:text-ink-300">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-ink-100 dark:border-ink-800 pt-3">
                <p className="text-xs text-ink-400">{note.downloads} download{note.downloads === 1 ? '' : 's'} · {formatDate(note.createdAt)}</p>
                <button onClick={() => handleDownload(note)} className="btn-primary !py-1.5 !px-3 text-xs">
                  <Download className="h-3.5 w-3.5" /> Get file
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onChange={(p) => updateFilter('page', p)} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit note' : 'Share a note'} size="md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Title</label>
            <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Subject</label>
              <input required className="input" placeholder="e.g. Data Structures" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div>
              <label className="label">Semester</label>
              <input type="number" min={0} max={12} className="input" value={form.semester} onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="label">Department</label>
            <input className="input" placeholder="Computer Science" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </div>
          <div>
            <label className="label">File URL</label>
            <input required type="url" className="input" placeholder="https://drive.google.com/... or any shareable link" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} />
            <p className="mt-1 text-xs text-ink-400">Upload your file to Google Drive, Dropbox, etc. and paste a shareable link here.</p>
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea rows={2} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Tags (comma separated)</label>
            <input className="input" placeholder="midterm, unit-1, important" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving...' : editingId ? 'Save changes' : 'Share note'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={submitting}
        title="Remove note"
        description={`Remove "${deleteTarget?.title}"?`}
        confirmLabel="Remove"
      />
    </div>
  );
};

export default NotesPage;
