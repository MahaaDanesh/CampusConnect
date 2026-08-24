// Seeds the database with a default admin account and a couple of sample
// records so the app is usable immediately after deployment.
// Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const Club = require('../models/Club');

const run = async () => {
  await connectDB();

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@campusconnect.edu';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'System Administrator',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      department: 'Administration',
    });
    console.log(`Created admin account: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log('Admin account already exists, skipping.');
  }

  const announcementCount = await Announcement.countDocuments();
  if (announcementCount === 0) {
    await Announcement.create({
      title: 'Welcome to CampusConnect',
      content:
        'This is your new college management and community platform. Explore announcements, events, clubs, complaints, lost & found, and shared notes all in one place.',
      category: 'general',
      audience: 'all',
      pinned: true,
      postedBy: admin._id,
    });
    console.log('Created a welcome announcement.');
  }

  const clubCount = await Club.countDocuments();
  if (clubCount === 0) {
    await Club.create({
      name: 'Coding Club',
      description: 'A community for students who love building software, competitive programming, and hackathons.',
      category: 'technical',
      coordinator: admin._id,
    });
    console.log('Created a sample club.');
  }

  console.log('Seeding complete.');
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
