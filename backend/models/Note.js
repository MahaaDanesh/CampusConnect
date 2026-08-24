const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, default: '', maxlength: 2000 },
    subject: { type: String, required: true, trim: true },
    department: { type: String, default: '' },
    semester: { type: Number, default: 0 },
    fileUrl: { type: String, required: true },
    fileName: { type: String, default: '' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    downloads: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

noteSchema.index({ title: 'text', subject: 'text', tags: 'text' });

module.exports = mongoose.model('Note', noteSchema);
