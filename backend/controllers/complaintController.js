const asyncHandler = require('express-async-handler');
const Complaint = require('../models/Complaint');
const notify = require('../utils/notify');
const User = require('../models/User');

// @desc Get complaints - students see own, admin/faculty see all (with filters)
const getComplaints = asyncHandler(async (req, res) => {
  const { status, category, priority, search, page = 1, limit = 10 } = req.query;
  const query = {};

  if (req.user.role === 'student') {
    query.submittedBy = req.user._id;
  }
  if (status) query.status = status;
  if (category) query.category = category;
  if (priority) query.priority = priority;
  if (search) query.title = { $regex: search, $options: 'i' };

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Complaint.find(query)
      .populate('submittedBy', 'name role')
      .populate('assignedTo', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Complaint.countDocuments(query),
  ]);

  // Hide submitter identity for anonymous complaints from non-admins
  const data = items.map((c) => {
    const obj = c.toObject();
    if (obj.isAnonymous && req.user.role !== 'admin' && String(obj.submittedBy?._id) !== String(req.user._id)) {
      obj.submittedBy = { name: 'Anonymous', role: 'student' };
    }
    return obj;
  });

  res.json({ success: true, data, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
});

const getComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('submittedBy', 'name role email')
    .populate('assignedTo', 'name role')
    .populate('comments.author', 'name role');

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }
  if (req.user.role === 'student' && String(complaint.submittedBy._id) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to view this complaint');
  }
  res.json({ success: true, data: complaint });
});

const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, isAnonymous, priority } = req.body;
  const complaint = await Complaint.create({
    title,
    description,
    category,
    isAnonymous: !!isAnonymous,
    priority,
    submittedBy: req.user._id,
  });

  const admins = await User.find({ role: 'admin' }).select('_id');
  await notify(
    admins.map((a) => a._id),
    { title: 'New Complaint Submitted', message: title, type: 'complaint', link: `/complaints/${complaint._id}` }
  );

  res.status(201).json({ success: true, data: complaint });
});

// @desc Update complaint status/assignment (admin/faculty)
const updateComplaintStatus = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  const { status, assignedTo, resolutionNote, priority } = req.body;
  if (status) complaint.status = status;
  if (assignedTo) complaint.assignedTo = assignedTo;
  if (resolutionNote !== undefined) complaint.resolutionNote = resolutionNote;
  if (priority) complaint.priority = priority;

  await complaint.save();

  await notify(complaint.submittedBy, {
    title: 'Complaint Status Updated',
    message: `Your complaint "${complaint.title}" is now ${complaint.status}`,
    type: 'complaint',
    link: `/complaints/${complaint._id}`,
  });

  res.json({ success: true, data: complaint });
});

// @desc Add a comment to a complaint
const addComment = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }
  if (req.user.role === 'student' && String(complaint.submittedBy) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to comment on this complaint');
  }

  complaint.comments.push({ author: req.user._id, text: req.body.text });
  await complaint.save();
  res.status(201).json({ success: true, data: complaint });
});

const deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }
  if (req.user.role === 'student' && String(complaint.submittedBy) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to delete this complaint');
  }
  await complaint.deleteOne();
  res.json({ success: true, message: 'Complaint deleted' });
});

module.exports = {
  getComplaints,
  getComplaint,
  createComplaint,
  updateComplaintStatus,
  addComment,
  deleteComplaint,
};
