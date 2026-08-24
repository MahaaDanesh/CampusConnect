const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 5000 },
    category: {
      type: String,
      enum: ['workshop', 'seminar', 'cultural', 'sports', 'technical', 'other'],
      default: 'other',
    },
    venue: { type: String, required: true },
    date: { type: Date, required: true },
    endDate: { type: Date },
    capacity: { type: Number, default: 0 }, // 0 = unlimited
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club' },
    bannerUrl: { type: String, default: '' },
    status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  },
  { timestamps: true }
);

eventSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Event', eventSchema);
