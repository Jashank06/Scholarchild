const mongoose = require('mongoose');

const schoolCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

schoolCategorySchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('SchoolCategory', schoolCategorySchema);
