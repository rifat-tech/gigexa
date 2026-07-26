const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  status: { type: String, enum: ['new', 'read', 'replied'], default: 'new' },
  page: { type: String }, // which page they were on
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
