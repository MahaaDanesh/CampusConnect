const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['lost', 'found'], required: true },
    itemName: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 2000 },
    category: {
      type: String,
      enum: ['electronics', 'documents', 'accessories', 'books', 'clothing', 'other'],
      default: 'other',
    },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    imageUrl: { type: String, default: '' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contactInfo: { type: String, default: '' },
    status: { type: String, enum: ['open', 'claimed', 'closed'], default: 'open' },
  },
  { timestamps: true }
);

lostFoundSchema.index({ itemName: 'text', description: 'text' });

module.exports = mongoose.model('LostFound', lostFoundSchema);
