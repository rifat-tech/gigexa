const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  sku: { type: String, unique: true, sparse: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discount: { type: Number, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String, required: true },
  images: [{ type: String }],
  thumbnail: { type: String },
  stock: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
  specifications: [{ key: String, value: String }],
  tags: [String],
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  subcategory: { type: String, default: '', index: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },
  warranty: { type: String },
  status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'active' }
}, { timestamps: true });

productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  if (this.originalPrice && this.price) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  next();
});

// Indexes for the queries the storefront runs most (category/brand/subcategory
// filtering, featured/new rows, and newest-first sorting).
productSchema.index({ status: 1, category: 1 });
productSchema.index({ status: 1, brand: 1 });
productSchema.index({ status: 1, subcategory: 1 });
productSchema.index({ status: 1, isFeatured: 1 });
productSchema.index({ status: 1, isNewArrival: 1 });
productSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
