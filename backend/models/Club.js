const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 3000 },
    category: {
      type: String,
      enum: ['technical', 'cultural', 'sports', 'literary', 'social', 'other'],
      default: 'other',
    },
    coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    logoUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

clubSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Club', clubSchema);
