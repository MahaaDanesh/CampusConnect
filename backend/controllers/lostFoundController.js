const asyncHandler = require('express-async-handler');
const LostFound = require('../models/LostFound');

const getLostFoundItems = asyncHandler(async (req, res) => {
  const { type, category, status, search, page = 1, limit = 12 } = req.query;
  const query = {};
  if (type) query.type = type;
  if (category) query.category = category;
  if (status) query.status = status;
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    LostFound.find(query).populate('postedBy', 'name role').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    LostFound.countDocuments(query),
  ]);

  res.json({ success: true, data: items, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
});

const getLostFoundItem = asyncHandler(async (req, res) => {
  const item = await LostFound.findById(req.params.id).populate('postedBy', 'name role email phone');
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }
  res.json({ success: true, data: item });
});

const createLostFoundItem = asyncHandler(async (req, res) => {
  const item = await LostFound.create({ ...req.body, postedBy: req.user._id });
  res.status(201).json({ success: true, data: item });
});

const updateLostFoundItem = asyncHandler(async (req, res) => {
  const item = await LostFound.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }
  if (String(item.postedBy) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to edit this item');
  }
  Object.assign(item, req.body);
  await item.save();
  res.json({ success: true, data: item });
});

const deleteLostFoundItem = asyncHandler(async (req, res) => {
  const item = await LostFound.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }
  if (String(item.postedBy) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this item');
  }
  await item.deleteOne();
  res.json({ success: true, message: 'Item deleted' });
});

module.exports = {
  getLostFoundItems,
  getLostFoundItem,
  createLostFoundItem,
  updateLostFoundItem,
  deleteLostFoundItem,
};
