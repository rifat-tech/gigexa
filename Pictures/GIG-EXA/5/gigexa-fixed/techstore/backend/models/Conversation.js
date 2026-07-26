const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, index: true },
  email: { type: String },
  page: { type: String },
  messages: [{
    sender: { type: String, enum: ['customer', 'admin'], required: true },
    text: { type: String, required: true },
    at: { type: Date, default: Date.now }
  }],
  lastMessageAt: { type: Date, default: Date.now },
  adminUnread: { type: Number, default: 0 },     // customer msgs the admin hasn't opened
  customerUnread: { type: Number, default: 0 },  // admin replies the customer hasn't seen
  status: { type: String, enum: ['open', 'closed'], default: 'open' }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
