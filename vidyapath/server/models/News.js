const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  summary: { type: String, required: true, trim: true },
  sourceUrl: { type: String, required: true },
  board: { type: String, enum: ['CBSE', 'ICSE', 'State', 'IB', 'IGCSE', 'Other'], default: 'Other' },
  state: { type: String },
  tags: [String],
  publishedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

newsSchema.index({ status: 1, publishedAt: -1 });
newsSchema.index({ board: 1, state: 1 });

module.exports = mongoose.model('News', newsSchema);
