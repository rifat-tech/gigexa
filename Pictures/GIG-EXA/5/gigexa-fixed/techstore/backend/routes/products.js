const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');
const { inferSubcategory } = require('../utils/subcategory');

// Escape user input before using it in a RegExp (prevents 500s and ReDoS)
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Uploads dir is resolved absolutely so it works regardless of the cwd the
// server is started from.
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname))
});

const ALLOWED_IMAGE = /^image\/(jpe?g|png|webp|gif|avif)$/;
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only image files (jpg, png, webp, gif, avif) are allowed'));
  }
});

// Recompute slug + discount the same way the pre-save hook does, since
// findByIdAndUpdate bypasses that hook.
function derive(data, current = {}) {
  const slugify = require('slugify');
  if (data.name) data.slug = slugify(data.name, { lower: true, strict: true });
  const orig = data.originalPrice ?? current.originalPrice;
  const price = data.price ?? current.price;
  if (orig && price) data.discount = Math.round(((orig - price) / orig) * 100);
  return data;
}

// GET all products (list, filtered)
router.get('/', async (req, res) => {
  try {
    const { category, brand, search, featured, newIn, subcategory, page = 1, limit = 12, sort = '-createdAt' } = req.query;
    const query = { status: 'active' };
    if (category) query.category = category;
    if (brand) query.brand = new RegExp(escapeRegex(brand), 'i');
    if (subcategory) query.subcategory = subcategory;
    if (featured === 'true') query.isFeatured = true;
    if (newIn === 'true') query.isNewArrival = true;
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      query.$or = [{ name: rx }, { tags: rx }, { brand: rx }];
    }

    const pg = Math.max(1, Number(page) || 1);
    const lim = Math.min(100, Math.max(1, Number(limit) || 12));

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug icon')
      .sort(sort).skip((pg - 1) * lim).limit(lim);
    res.json({ products, total, page: pg, pages: Math.ceil(total / lim) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Facets: which subcategories exist under each category and each brand.
// Computed live from the catalog so filters always match real inventory.
router.get('/facets', async (req, res) => {
  try {
    const base = { status: 'active', subcategory: { $nin: [null, '', 'Other'] } };
    const [byCat, byBrand] = await Promise.all([
      Product.aggregate([
        { $match: base },
        { $group: { _id: { cat: '$category', sub: '$subcategory' }, count: { $sum: 1 } } },
        { $sort: { '_id.sub': 1 } }
      ]),
      Product.aggregate([
        { $match: base },
        { $group: { _id: { brand: '$brand', sub: '$subcategory' }, count: { $sum: 1 } } },
        { $sort: { '_id.sub': 1 } }
      ])
    ]);

    const categories = {};
    byCat.forEach(r => {
      const c = String(r._id.cat);
      (categories[c] = categories[c] || []).push({ name: r._id.sub, count: r.count });
    });
    const brands = {};
    byBrand.forEach(r => {
      const b = r._id.brand;
      (brands[b] = brands[b] || []).push({ name: r._id.sub, count: r.count });
    });

    res.json({ categories, brands });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single product by ID (admin edit form) — must be declared before :slug
router.get('/id/:id', protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid id' });
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single product by slug
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE product (admin)
router.post('/', protect, adminOnly, upload.array('images', 5), async (req, res) => {
  try {
    // Supports both multipart (data field + files) and plain JSON body.
    const data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : { ...req.body };
    if (req.files?.length) {
      data.images = req.files.map(f => `/uploads/${f.filename}`);
      data.thumbnail = data.images[0];
    }
    if (!data.subcategory) data.subcategory = inferSubcategory(data);
    const product = await Product.create(data);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE product (admin)
router.put('/:id', protect, adminOnly, upload.array('images', 5), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid id' });
    let data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : { ...req.body };
    if (req.files?.length) {
      data.images = req.files.map(f => `/uploads/${f.filename}`);
      data.thumbnail = data.images[0];
    }
    const current = await Product.findById(req.params.id);
    if (!current) return res.status(404).json({ message: 'Product not found' });

    data = derive(data, current);
    if (!data.subcategory && data.name) data.subcategory = inferSubcategory({ ...current.toObject(), ...data });
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE product (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
