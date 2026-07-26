const router = require('express').Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Category = require('../models/Category');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [totalProducts, totalOrders, totalUsers, categories] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Category.countDocuments()
    ]);

    const revenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const recentOrders = await Order.find().sort('-createdAt').limit(5);
    const lowStock = await Product.find({ stock: { $lte: 5 } }).limit(5).select('name stock thumbnail');

    res.json({
      totalProducts, totalOrders, totalUsers, categories,
      revenue: revenue[0]?.total || 0,
      recentOrders, lowStock
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
