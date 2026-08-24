const asyncHandler = require('express-async-handler');
const Note = require('../models/Note');

const getNotes = asyncHandler(async (req, res) => {
  const { subject, department, semester, search, page = 1, limit = 12 } = req.query;
  const query = {};
  if (subject) query.subject = { $regex: subject, $options: 'i' };
  if (department) query.department = department;
  if (semester) query.semester = Number(semester);
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Note.find(query).populate('uploadedBy', 'name role').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Note.countDocuments(query),
  ]);

  res.json({ success: true, data: items, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
});

const getNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id).populate('uploadedBy', 'name role');
  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }
  res.json({ success: true, data: note });
});

const createNote = asyncHandler(async (req, res) => {
  const note = await Note.create({ ...req.body, uploadedBy: req.user._id });
  res.status(201).json({ success: true, data: note });
});

const updateNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }
  if (String(note.uploadedBy) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to edit this note');
  }
  Object.assign(note, req.body);
  await note.save();
  res.json({ success: true, data: note });
});

const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }
  if (String(note.uploadedBy) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this note');
  }
  await note.deleteOne();
  res.json({ success: true, message: 'Note deleted' });
});

// @desc increment download counter
const trackDownload = asyncHandler(async (req, res) => {
  const note = await Note.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } }, { new: true });
  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }
  res.json({ success: true, data: note });
});

module.exports = { getNotes, getNote, createNote, updateNote, deleteNote, trackDownload };
