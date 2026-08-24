const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Complaint = require('../models/Complaint');
const Club = require('../models/Club');
const Announcement = require('../models/Announcement');
const LostFound = require('../models/LostFound');
const Note = require('../models/Note');

// @desc Admin dashboard analytics summary
// @route GET /api/analytics/overview
const getOverview = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    studentCount,
    facultyCount,
    adminCount,
    totalEvents,
    upcomingEvents,
    totalRegistrations,
    totalComplaints,
    openComplaints,
    resolvedComplaints,
    totalClubs,
    totalAnnouncements,
    totalLostFound,
    openLostFound,
    totalNotes,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'faculty' }),
    User.countDocuments({ role: 'admin' }),
    Event.countDocuments(),
    Event.countDocuments({ date: { $gte: new Date() } }),
    EventRegistration.countDocuments({ status: { $ne: 'cancelled' } }),
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: 'open' }),
    Complaint.countDocuments({ status: 'resolved' }),
    Club.countDocuments({ isActive: true }),
    Announcement.countDocuments(),
    LostFound.countDocuments(),
    LostFound.countDocuments({ status: 'open' }),
    Note.countDocuments(),
  ]);

  const complaintsByCategory = await Complaint.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const complaintsByStatus = await Complaint.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const eventsByCategory = await Event.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  const usersByDepartment = await User.aggregate([
    { $match: { department: { $ne: '' } } },
    { $group: { _id: '$department', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);

  // Signups over the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  const signupTrend = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    success: true,
    data: {
      totals: {
        totalUsers,
        studentCount,
        facultyCount,
        adminCount,
        totalEvents,
        upcomingEvents,
        totalRegistrations,
        totalComplaints,
        openComplaints,
        resolvedComplaints,
        totalClubs,
        totalAnnouncements,
        totalLostFound,
        openLostFound,
        totalNotes,
      },
      complaintsByCategory,
      complaintsByStatus,
      eventsByCategory,
      usersByDepartment,
      signupTrend,
    },
  });
});

module.exports = { getOverview };
