const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc  Update own profile
// @route PUT /api/users/me
// @access Private
const updateMe = asyncHandler(async (req, res) => {
  const allowed = ['name', 'department', 'rollNumber', 'designation', 'bio', 'phone', 'avatarColor'];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: user.toSafeObject() });
});

// @desc  Change own password
// @route PUT /api/users/me/password
// @access Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});

// @desc  List all users (with filters/search/pagination)
// @route GET /api/users
// @access Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const { role, department, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (department) query.department = department;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});

// @desc  Get single user
// @route GET /api/users/:id
// @access Private/Admin
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, data: user });
});

// @desc  Admin: create user (any role, incl. admin/faculty)
// @route POST /api/users
// @access Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, designation, rollNumber } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('A user with this email already exists');
  }

  const user = await User.create({ name, email, password, role, department, designation, rollNumber });
  res.status(201).json({ success: true, data: user.toSafeObject() });
});

// @desc  Admin: update any user (role, active status, etc.)
// @route PUT /api/users/:id
// @access Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const allowed = ['name', 'role', 'department', 'designation', 'rollNumber', 'isActive'];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({ success: true, data: user });
});

// @desc  Admin: delete user
// @route DELETE /api/users/:id
// @access Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (String(user._id) === String(req.user._id)) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }
  await user.deleteOne();
  res.json({ success: true, message: 'User removed' });
});

module.exports = { updateMe, changePassword, getUsers, getUser, createUser, updateUser, deleteUser };
