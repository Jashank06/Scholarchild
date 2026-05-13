const mongoose = require('mongoose');

const schoolFieldSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SchoolCategory', required: true },
  key: { type: String, required: true, trim: true },
  label: { type: String, required: true, trim: true },
  type: { type: String, enum: ['text', 'number', 'textarea', 'select', 'date', 'boolean'], default: 'text' },
  options: [{ type: String }],
  placeholder: { type: String },
  required: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

schoolFieldSchema.index({ categoryId: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('SchoolField', schoolFieldSchema);
