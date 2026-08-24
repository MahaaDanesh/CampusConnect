const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    content: { type: String, required: true, maxlength: 5000 },
    category: {
      type: String,
      enum: ['general', 'academic', 'exam', 'placement', 'event', 'urgent'],
      default: 'general',
    },
    audience: { type: String, enum: ['all', 'students', 'faculty'], default: 'all' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pinned: { type: Boolean, default: false },
    attachmentUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

announcementSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Announcement', announcementSchema);
