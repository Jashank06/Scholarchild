const mongoose = require('mongoose');

const fileNodeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'FileNode', default: null },
  type: { type: String, enum: ['folder', 'file'], required: true },
  name: { type: String, required: true, trim: true },
  url: String,
  mimeType: String,
  size: Number,
  extension: String,
  isDeleted: { type: Boolean, default: false },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

fileNodeSchema.index({ userId: 1, parentId: 1, type: 1 });
fileNodeSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model('FileNode', fileNodeSchema);
