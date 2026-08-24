import React, { useState } from 'react';
import { CalendarDays, MapPin, Users, Trash2, Pencil, Check, X as XIcon, ListChecks } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { eventApi } from '../api/endpoints.js';
import { getErrorMessage } from '../api/axios.js';
import usePaginatedList from '../hooks/usePaginatedList.js';
import useDebounce from '../hooks/useDebounce.js';
import { PageLoader, ErrorState, EmptyState, InlineSpinner } from '../components/StateViews.jsx';
import { SearchInput, SelectFilter, Toolbar, PrimaryActionButton } from '../components/Toolbar.jsx';
import Pagination from '../components/Pagination.jsx';
import Badge from '../components/Badge.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { formatDateTime } from '../utils/format.js';

const CATEGORIES = ['workshop', 'seminar', 'cultural', 'sports', 'technical', 'other'];
const emptyForm = { title: '', description: '', category: 'workshop', venue: '', date: '', capacity: 0 };

const EventsPage = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'faculty' || user?.role === 'admin';
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);

  const { items, setItems, filters, updateFilter, pagination, loading, error, refresh } = usePaginatedList(eventApi.list, {
    limit: 9,
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
  const [registeringId, setRegisteringId] = useState(null);
  const [attendeesModal, setAttendeesModal] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description,
      category: item.category,
      venue: item.venue,
      date: item.date ? item.date.slice(0, 16) : '',
      capacity: item.capacity || 0,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, capacity: Number(form.capacity) || 0 };
      if (editing) {
        await eventApi.update(editing._id, payload);
        toast.success('Event updated');
      } else {
        await eventApi.create(payload);
        toast.success('Event created');
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
      await eventApi.remove(deleteTarget._id);
      toast.success('Event deleted');
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const toggleRegistration = async (event) => {
    setRegisteringId(event._id);
    try {
      if (event.isRegistered) {
        await eventApi.cancelRegistration(event._id);
        toast.success('Registration cancelled');
      } else {
        await eventApi.register(event._id);
        toast.success("You're registered!");
      }
      setItems((prev) =>
        prev.map((e) =>
          e._id === event._id
            ? { ...e, isRegistered: !e.isRegistered, registeredCount: e.registeredCount + (e.isRegistered ? -1 : 1) }
            : e
        )
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRegisteringId(null);
    }
  };

  const openAttendees = async (event) => {
    setAttendeesModal(event);
    setAttendeesLoading(true);
    try {
      const res = await eventApi.attendees(event._id);
      setAttendees(res.data.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAttendeesLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Events</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Workshops, seminars, and campus happenings.</p>
      </div>

      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search events..." />
        <SelectFilter value={filters.category || ''} onChange={(v) => updateFilter('category', v)} options={CATEGORIES} placeholder="All categories" />
        <label className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300">
          <input
            type="checkbox"
            checked={filters.upcoming === 'true'}
            onChange={(e) => updateFilter('upcoming', e.target.checked ? 'true' : '')}
            className="rounded border-ink-300"
          />
          Upcoming only
        </label>
        {canManage && <PrimaryActionButton onClick={openCreate} label="New Event" />}
      </Toolbar>

      {loading && <PageLoader />}
      {!loading && error && <ErrorState message={error} onRetry={refresh} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState icon={CalendarDays} title="No events found" description="Try different filters or check back later." />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((ev) => {
            const isFull = ev.capacity > 0 && ev.registeredCount >= ev.capacity;
            const isOwner = ev.organizer?._id === user?._id;
            return (
              <div key={ev._id} className="card p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Badge tone={ev.category}>{ev.category}</Badge>
                  <Badge tone={ev.status}>{ev.status}</Badge>
                </div>
                <h3 className="mt-3 font-display font-semibold text-ink-900 dark:text-white">{ev.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400 line-clamp-3 flex-1">{ev.description}</p>

                <div className="mt-4 space-y-1.5 text-sm text-ink-500 dark:text-ink-400">
                  <p className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" /> {formatDateTime(ev.date)}
                  </p>
                  <p className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-3.5 w-3.5" /> {ev.venue}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> {ev.registeredCount} registered
                    {ev.capacity > 0 ? ` / ${ev.capacity} spots` : ''}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  {user?.role === 'student' && (
                    <button
                      onClick={() => toggleRegistration(ev)}
                      disabled={registeringId === ev._id || (isFull && !ev.isRegistered)}
                      className={ev.isRegistered ? 'btn-secondary flex-1' : 'btn-primary flex-1'}
                    >
                      {registeringId === ev._id ? (
                        '...'
                      ) : ev.isRegistered ? (
                        <>
                          <Check className="h-4 w-4" /> Registered
                        </>
                      ) : isFull ? (
                        'Full'
                      ) : (
                        'Register'
                      )}
                    </button>
                  )}

                  {(isOwner || user?.role === 'admin') && (
                    <>
                      <button onClick={() => openAttendees(ev)} className="btn-secondary !px-2.5" title="Attendees">
                        <ListChecks className="h-4 w-4" />
                      </button>
                      <button onClick={() => openEdit(ev)} className="btn-secondary !px-2.5" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(ev)} className="btn-secondary !px-2.5 hover:!text-red-500" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onChange={(p) => updateFilter('page', p)} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Event' : 'New Event'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea required rows={4} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
              <label className="label">Venue</label>
              <input required className="input" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date &amp; time</label>
              <input required type="datetime-local" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="label">Capacity (0 = unlimited)</label>
              <input type="number" min={0} className="input" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!attendeesModal} onClose={() => setAttendeesModal(null)} title={`Attendees — ${attendeesModal?.title || ''}`}>
        {attendeesLoading ? (
          <InlineSpinner />
        ) : attendees.length === 0 ? (
          <EmptyState icon={Users} title="No registrations yet" />
        ) : (
          <div className="divide-y divide-ink-100 dark:divide-ink-800">
            {attendees.map((a) => (
              <div key={a._id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium text-ink-800 dark:text-ink-100">{a.user?.name}</p>
                  <p className="text-xs text-ink-400">{a.user?.email}</p>
                </div>
                <Badge tone={a.user?.role}>{a.user?.role}</Badge>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        confirmLabel="Delete"
        description={`This will permanently delete "${deleteTarget?.title}" and all its registrations.`}
      />
    </div>
  );
};

export default EventsPage;
