const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tagline: { type: String, default: '' },
  description: { type: String, default: '' },
  link: { type: String, default: '' },
  linkLabel: { type: String, default: 'Visit Site' },
  image: { type: String, default: '' },
  category: {
    type: String,
    enum: ['school', 'coaching', 'tuition', 'test-prep', 'library', 'training', 'consultancy', 'other'],
    default: 'other',
  },
  servicesOffered: [{ type: String }],
  contactPhone: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  website: { type: String, default: '' },
  establishedYear: Number,
  discountInfo: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  startDate: Date,
  endDate: Date,
  rating: { type: Number, min: 0, max: 5, default: 0 },
  isActive: { type: Boolean, default: true },
  clickCount: { type: Number, default: 0 },
}, { timestamps: true });

serviceProviderSchema.index({ isActive: 1, featured: -1, order: 1 });
serviceProviderSchema.index({ category: 1, city: 1, isActive: 1 });

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);
