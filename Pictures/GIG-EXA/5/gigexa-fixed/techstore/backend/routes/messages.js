const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const { protect, adminOnly } = require('../middleware/auth');

const preview = (c) => {
  const last = c.messages[c.messages.length - 1];
  return {
    _id: c._id, name: c.name, phone: c.phone, email: c.email, page: c.page,
    lastText: last?.text || '', lastSender: last?.sender || 'customer',
    lastMessageAt: c.lastMessageAt, adminUnread: c.adminUnread,
    status: c.status, count: c.messages.length, createdAt: c.createdAt
  };
};

// ---------- CUSTOMER (public) ----------

// Start or continue a conversation. Threads are keyed by phone number, so the
// same customer always lands in one thread (WhatsApp-style).
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, message, page } = req.body;
    if (!name || !phone || !message) {
      return res.status(400).json({ message: 'Name, phone and message are required' });
    }
    let convo = await Conversation.findOne({ phone: phone.trim() });
    if (!convo) {
      convo = new Conversation({ name, phone: phone.trim(), email, page, messages: [] });
    }
    convo.name = name;
    if (email) convo.email = email;
    if (page) convo.page = page;
    convo.messages.push({ sender: 'customer', text: message });
    convo.lastMessageAt = new Date();
    convo.adminUnread += 1;
    convo.status = 'open';
    await convo.save();
    res.status(201).json({ conversationId: convo._id, messages: convo.messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Customer polls their own thread (also clears their unread counter)
router.get('/thread/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid id' });
    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ message: 'Conversation not found' });
    if (convo.customerUnread > 0) { convo.customerUnread = 0; await convo.save(); }
    res.json({ _id: convo._id, name: convo.name, messages: convo.messages, status: convo.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- ADMIN ----------

// List all conversations (previews), newest activity first
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const convos = await Conversation.find().sort('-lastMessageAt');
    const unread = convos.reduce((n, c) => n + (c.adminUnread > 0 ? 1 : 0), 0);
    res.json({ conversations: convos.map(preview), unread });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Full thread for a conversation (clears the admin unread counter)
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid id' });
    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ message: 'Conversation not found' });
    if (convo.adminUnread > 0) { convo.adminUnread = 0; await convo.save(); }
    res.json(convo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin replies to a customer
router.post('/:id/reply', protect, adminOnly, async (req, res) => {
  try {
    const text = (req.body.text || '').trim();
    if (!text) return res.status(400).json({ message: 'Reply text is required' });
    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ message: 'Conversation not found' });
    convo.messages.push({ sender: 'admin', text });
    convo.lastMessageAt = new Date();
    convo.customerUnread += 1;
    convo.status = 'open';
    await convo.save();
    res.json(convo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a conversation
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Conversation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
