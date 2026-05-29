const mongoose = require('mongoose');

const notableSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  content: { type: String, default: '' },
  link: { type: String, default: '' },
  linkLabel: { type: String, default: 'Learn More' },
  image: { type: String, default: '' },
  category: {
    type: String,
    enum: ['announcement', 'achievement', 'news', 'event', 'featured', 'success-story', 'other'],
    default: 'other',
  },
  tags: [{ type: String }],
  source: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: true },
  clickCount: { type: Number, default: 0 },
}, { timestamps: true });

notableSchema.index({ isActive: 1, featured: -1, order: 1 });
notableSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Notable', notableSchema);
