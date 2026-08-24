const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const notify = require('../utils/notify');
const User = require('../models/User');

// @desc Get all events (filter/search)
// @route GET /api/events
const getEvents = asyncHandler(async (req, res) => {
  const { category, status, search, upcoming, page = 1, limit = 12 } = req.query;
  const query = {};
  if (category) query.category = category;
  if (status) query.status = status;
  if (upcoming === 'true') query.date = { $gte: new Date() };
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Event.find(query)
      .populate('organizer', 'name role')
      .populate('club', 'name')
      .sort({ date: 1 })
      .skip(skip)
      .limit(Number(limit)),
    Event.countDocuments(query),
  ]);

  // attach registration counts + whether current user is registered
  const eventIds = items.map((e) => e._id);
  const regs = await EventRegistration.find({ event: { $in: eventIds }, status: { $ne: 'cancelled' } });
  const countMap = {};
  const myRegSet = new Set();
  regs.forEach((r) => {
    countMap[r.event] = (countMap[r.event] || 0) + 1;
    if (String(r.user) === String(req.user._id)) myRegSet.add(String(r.event));
  });

  const data = items.map((e) => ({
    ...e.toObject(),
    registeredCount: countMap[e._id] || 0,
    isRegistered: myRegSet.has(String(e._id)),
  }));

  res.json({
    success: true,
    data,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});

const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('organizer', 'name role').populate('club', 'name');
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  const registeredCount = await EventRegistration.countDocuments({ event: event._id, status: { $ne: 'cancelled' } });
  const myReg = await EventRegistration.findOne({ event: event._id, user: req.user._id });
  res.json({
    success: true,
    data: { ...event.toObject(), registeredCount, isRegistered: !!myReg && myReg.status !== 'cancelled' },
  });
});

// @desc Create event
// @route POST /api/events
// @access Private/Faculty,Admin
const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({ ...req.body, organizer: req.user._id });

  const recipients = await User.find({ role: { $in: ['student', 'faculty'] } }).select('_id');
  await notify(
    recipients.map((u) => u._id),
    { title: 'New Event Posted', message: event.title, type: 'event', link: `/events/${event._id}` }
  );

  res.status(201).json({ success: true, data: event });
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  if (String(event.organizer) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to edit this event');
  }
  Object.assign(event, req.body);
  await event.save();
  res.json({ success: true, data: event });
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  if (String(event.organizer) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this event');
  }
  await EventRegistration.deleteMany({ event: event._id });
  await event.deleteOne();
  res.json({ success: true, message: 'Event deleted' });
});

// @desc Register for an event
// @route POST /api/events/:id/register
const registerForEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  if (event.capacity > 0) {
    const count = await EventRegistration.countDocuments({ event: event._id, status: { $ne: 'cancelled' } });
    if (count >= event.capacity) {
      res.status(400);
      throw new Error('Event has reached full capacity');
    }
  }

  let reg = await EventRegistration.findOne({ event: event._id, user: req.user._id });
  if (reg) {
    if (reg.status !== 'cancelled') {
      res.status(400);
      throw new Error('You are already registered for this event');
    }
    reg.status = 'registered';
    await reg.save();
  } else {
    reg = await EventRegistration.create({ event: event._id, user: req.user._id });
  }

  await notify(event.organizer, {
    title: 'New Event Registration',
    message: `${req.user.name} registered for ${event.title}`,
    type: 'event',
    link: `/events/${event._id}`,
  });

  res.status(201).json({ success: true, data: reg });
});

// @desc Cancel my registration
// @route DELETE /api/events/:id/register
const cancelRegistration = asyncHandler(async (req, res) => {
  const reg = await EventRegistration.findOne({ event: req.params.id, user: req.user._id });
  if (!reg) {
    res.status(404);
    throw new Error('Registration not found');
  }
  reg.status = 'cancelled';
  await reg.save();
  res.json({ success: true, message: 'Registration cancelled' });
});

// @desc Get attendee list for an event (organizer/admin)
// @route GET /api/events/:id/attendees
const getAttendees = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  if (String(event.organizer) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view attendees');
  }
  const attendees = await EventRegistration.find({ event: event._id, status: { $ne: 'cancelled' } }).populate(
    'user',
    'name email role department'
  );
  res.json({ success: true, data: attendees });
});

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getAttendees,
};
