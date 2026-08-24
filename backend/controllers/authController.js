const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, rollNumber, designation } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  // Public self-registration is only allowed for student/faculty; admin accounts
  // must be created by an existing admin via the /users endpoint.
  const safeRole = role === 'faculty' ? 'faculty' : 'student';

  const colors = ['#4F46E5', '#0EA5E9', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  const user = await User.create({
    name,
    email,
    password,
    role: safeRole,
    department,
    rollNumber,
    designation,
    avatarColor,
  });

  res.status(201).json({
    success: true,
    data: user.toSafeObject(),
    token: generateToken(user._id, user.role),
  });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been deactivated. Contact the administrator.');
  }

  user.lastLogin = new Date();
  await user.save();

  res.json({
    success: true,
    data: user.toSafeObject(),
    token: generateToken(user._id, user.role),
  });
});

// @desc    Get logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user.toSafeObject() });
});

module.exports = { register, login, getMe };
