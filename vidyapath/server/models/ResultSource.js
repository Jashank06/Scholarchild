const mongoose = require('mongoose');

const resultSourceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  board: { type: String, enum: ['CBSE', 'ICSE', 'State', 'IB', 'IGCSE', 'Other'], required: true },
  state: { type: String },
  level: { type: String, enum: ['10', '12', 'other'], required: true },
  examName: { type: String, required: true },
  url: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  lastUpdatedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

resultSourceSchema.index({ board: 1, state: 1, level: 1 });
resultSourceSchema.index({ status: 1, lastUpdatedAt: -1 });

module.exports = mongoose.model('ResultSource', resultSourceSchema);
