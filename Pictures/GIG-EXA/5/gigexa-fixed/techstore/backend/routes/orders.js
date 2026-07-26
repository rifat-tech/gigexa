const router = require('express').Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

const SHIPPING_FLAT = 80;
const FREE_SHIPPING_THRESHOLD = 5000;

// Core order-building logic. Prices, subtotal, shipping and total are ALWAYS
// recomputed from the database — values sent by the client are never trusted.
async function buildOrder(body, user, session) {
  const clientItems = Array.isArray(body.items) ? body.items : [];
  const ids = clientItems.map(i => i.product).filter(Boolean);

  const q = Product.find({ _id: { $in: ids }, status: 'active' });
  if (session) q.session(session);
  const products = await q;
  const map = new Map(products.map(p => [String(p._id), p]));

  const items = [];
  let subtotal = 0;

  for (const ci of clientItems) {
    const p = map.get(String(ci.product));
    if (!p) throw { status: 400, message: 'One or more products are no longer available' };

    const qty = Math.max(1, parseInt(ci.quantity, 10) || 1);
    if (p.stock < qty) {
      throw { status: 409, message: `Insufficient stock for "${p.name}" (only ${p.stock} left)` };
    }

    subtotal += p.price * qty;
    items.push({ product: p._id, name: p.name, price: p.price, quantity: qty, thumbnail: p.thumbnail });

    p.stock -= qty;
    p.sold = (p.sold || 0) + qty;
    p.inStock = p.stock > 0;
    await p.save(session ? { session } : {});
  }

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const total = subtotal + shippingCost;

  const allowedPayments = ['cod', 'bkash', 'nagad', 'bank', 'card'];
  const paymentMethod = allowedPayments.includes(body.paymentMethod) ? body.paymentMethod : 'cod';

  const doc = {
    user: user?._id || undefined,
    guestInfo: body.guestInfo,
    items,
    shippingAddress: body.shippingAddress,
    subtotal, shippingCost, total,
    paymentMethod,
    notes: body.notes
  };

  if (session) {
    const [order] = await Order.create([doc], { session });
    return order;
  }
  return Order.create(doc);
}

// CREATE order — public (guest) or logged-in.
router.post('/', optionalAuth, async (req, res) => {
  const body = req.body || {};

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }
  const ship = body.shippingAddress || {};
  if (!ship.name || !ship.phone || !ship.street) {
    return res.status(400).json({ message: 'Name, phone and delivery address are required' });
  }

  // Prefer a transaction (atomic stock + order). Fall back to non-transactional
  // when the deployment is a standalone MongoDB that doesn't support them.
  let session;
  try {
    session = await mongoose.startSession();
    let order;
    await session.withTransaction(async () => { order = await buildOrder(body, req.user, session); });
    return res.status(201).json(order);
  } catch (err) {
    const noTxn = err?.code === 20 || /Transaction numbers|replica set|not supported/i.test(err?.message || '');
    if (noTxn) {
      try {
        const order = await buildOrder(body, req.user, null);
        return res.status(201).json(order);
      } catch (e2) {
        return res.status(e2.status || 500).json({ message: e2.message || 'Order failed' });
      }
    }
    return res.status(err.status || 500).json({ message: err.message || 'Order failed' });
  } finally {
    if (session) session.endSession();
  }
});

// Logged-in customer: their own orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.json({ orders });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: all orders
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    const orders = await Order.find(query).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    const total = await Order.countDocuments(query);
    res.json({ orders, total });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Single order: admin, or the owner
router.get('/:id', protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isOwner = order.user && String(order.user) === String(req.user._id);
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const allowed = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(req.body.status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update payment status (admin) — for manual bKash/Nagad/COD confirmation
router.put('/:id/payment', protect, adminOnly, async (req, res) => {
  try {
    const allowed = ['pending', 'paid', 'failed'];
    if (!allowed.includes(req.body.paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { paymentStatus: req.body.paymentStatus }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
