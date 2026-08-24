const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 3000 },
    category: {
      type: String,
      enum: ['hostel', 'academic', 'infrastructure', 'ragging', 'harassment', 'canteen', 'other'],
      default: 'other',
    },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isAnonymous: { type: Boolean, default: false },
    status: { type: String, enum: ['open', 'in-progress', 'resolved', 'rejected'], default: 'open' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolutionNote: { type: String, default: '' },
    comments: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, maxlength: 1000 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
