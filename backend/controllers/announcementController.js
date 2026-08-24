const asyncHandler = require('express-async-handler');
const Announcement = require('../models/Announcement');
const User = require('../models/User');
const notify = require('../utils/notify');

// @desc Get announcements (filtered by audience + search/category)
// @route GET /api/announcements
// @access Private
const getAnnouncements = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 10 } = req.query;
  const query = {};

  if (req.user.role !== 'admin') {
    query.audience = { $in: ['all', req.user.role === 'faculty' ? 'faculty' : 'students'] };
  }
  if (category) query.category = category;
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Announcement.find(query)
      .populate('postedBy', 'name role avatarColor')
      .sort({ pinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Announcement.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});

const getAnnouncement = asyncHandler(async (req, res) => {
  const item = await Announcement.findById(req.params.id).populate('postedBy', 'name role avatarColor');
  if (!item) {
    res.status(404);
    throw new Error('Announcement not found');
  }
  res.json({ success: true, data: item });
});

// @desc Create announcement
// @route POST /api/announcements
// @access Private/Faculty,Admin
const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, content, category, audience, pinned, attachmentUrl } = req.body;

  const announcement = await Announcement.create({
    title,
    content,
    category,
    audience,
    pinned: pinned && req.user.role === 'admin' ? true : false,
    attachmentUrl,
    postedBy: req.user._id,
  });

  // Notify relevant users
  const roleFilter =
    audience === 'students' ? ['student'] : audience === 'faculty' ? ['faculty'] : ['student', 'faculty', 'admin'];
  const recipients = await User.find({ role: { $in: roleFilter } }).select('_id');
  await notify(
    recipients.map((u) => u._id),
    {
      title: 'New Announcement',
      message: title,
      type: 'announcement',
      link: `/announcements/${announcement._id}`,
    }
  );

  res.status(201).json({ success: true, data: announcement });
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) {
    res.status(404);
    throw new Error('Announcement not found');
  }
  if (String(announcement.postedBy) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to edit this announcement');
  }

  const allowed = ['title', 'content', 'category', 'audience', 'pinned', 'attachmentUrl'];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) {
      if (key === 'pinned' && req.user.role !== 'admin') return;
      announcement[key] = req.body[key];
    }
  });

  await announcement.save();
  res.json({ success: true, data: announcement });
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) {
    res.status(404);
    throw new Error('Announcement not found');
  }
  if (String(announcement.postedBy) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this announcement');
  }
  await announcement.deleteOne();
  res.json({ success: true, message: 'Announcement deleted' });
});

module.exports = {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
