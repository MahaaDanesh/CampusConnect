const mongoose = require('mongoose');

const clubMembershipSchema = new mongoose.Schema(
  {
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['member', 'lead', 'coordinator'], default: 'member' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  },
  { timestamps: true }
);

clubMembershipSchema.index({ club: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('ClubMembership', clubMembershipSchema);
