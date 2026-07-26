const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestInfo: { name: String, email: String, phone: String },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number,
    thumbnail: String
  }],
  shippingAddress: {
    name: String, phone: String, street: String, city: String, district: String, zip: String
  },
  subtotal: Number,
  shippingCost: { type: Number, default: 80 },
  total: Number,
  paymentMethod: { type: String, enum: ['cod', 'bkash', 'nagad', 'bank', 'card'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  status: { type: String, enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  notes: String
}, { timestamps: true });

orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    // Timestamp + 3 random digits keeps it short and readable while making
    // same-millisecond collisions (which would fail the unique index) negligible.
    const rand = Math.floor(100 + Math.random() * 900);
    this.orderNumber = 'GX' + Date.now().toString().slice(-8) + rand;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
