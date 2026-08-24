const asyncHandler = require('express-async-handler');
const Club = require('../models/Club');
const ClubMembership = require('../models/ClubMembership');
const notify = require('../utils/notify');

const getClubs = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 12 } = req.query;
  const query = { isActive: true };
  if (category) query.category = category;
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [clubs, total] = await Promise.all([
    Club.find(query).populate('coordinator', 'name role').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Club.countDocuments(query),
  ]);

  const clubIds = clubs.map((c) => c._id);
  const memberships = await ClubMembership.find({ club: { $in: clubIds }, status: 'approved' });
  const countMap = {};
  const myClubs = new Set();
  memberships.forEach((m) => {
    countMap[m.club] = (countMap[m.club] || 0) + 1;
    if (String(m.user) === String(req.user._id)) myClubs.add(String(m.club));
  });

  const data = clubs.map((c) => ({
    ...c.toObject(),
    memberCount: countMap[c._id] || 0,
    isMember: myClubs.has(String(c._id)),
  }));

  res.json({ success: true, data, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
});

const getClub = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id).populate('coordinator', 'name role email');
  if (!club) {
    res.status(404);
    throw new Error('Club not found');
  }
  const members = await ClubMembership.find({ club: club._id, status: 'approved' }).populate('user', 'name role avatarColor');
  const myMembership = await ClubMembership.findOne({ club: club._id, user: req.user._id });
  res.json({ success: true, data: { ...club.toObject(), members, myMembership } });
});

const createClub = asyncHandler(async (req, res) => {
  const club = await Club.create({
    ...req.body,
    coordinator: req.body.coordinator || req.user._id,
  });
  res.status(201).json({ success: true, data: club });
});

const updateClub = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) {
    res.status(404);
    throw new Error('Club not found');
  }
  if (String(club.coordinator) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to edit this club');
  }
  Object.assign(club, req.body);
  await club.save();
  res.json({ success: true, data: club });
});

const deleteClub = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) {
    res.status(404);
    throw new Error('Club not found');
  }
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only an admin can delete a club');
  }
  await ClubMembership.deleteMany({ club: club._id });
  await club.deleteOne();
  res.json({ success: true, message: 'Club deleted' });
});

// @desc Join a club
const joinClub = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) {
    res.status(404);
    throw new Error('Club not found');
  }
  let membership = await ClubMembership.findOne({ club: club._id, user: req.user._id });
  if (membership && membership.status === 'approved') {
    res.status(400);
    throw new Error('You are already a member of this club');
  }
  if (!membership) {
    membership = await ClubMembership.create({ club: club._id, user: req.user._id, status: 'approved' });
  } else {
    membership.status = 'approved';
    await membership.save();
  }
  await notify(club.coordinator, {
    title: 'New Club Member',
    message: `${req.user.name} joined ${club.name}`,
    type: 'club',
    link: `/clubs/${club._id}`,
  });
  res.status(201).json({ success: true, data: membership });
});

// @desc Leave a club
const leaveClub = asyncHandler(async (req, res) => {
  const membership = await ClubMembership.findOne({ club: req.params.id, user: req.user._id });
  if (!membership) {
    res.status(404);
    throw new Error('Membership not found');
  }
  await membership.deleteOne();
  res.json({ success: true, message: 'Left the club' });
});

module.exports = { getClubs, getClub, createClub, updateClub, deleteClub, joinClub, leaveClub };
