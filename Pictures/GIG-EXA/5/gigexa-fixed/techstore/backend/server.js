require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// Fail fast in production if the JWT secret is missing — never run with the
// insecure development fallback in prod.
if (isProd && !process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not set. Refusing to start in production.');
  process.exit(1);
}

app.set('trust proxy', 1); // needed for correct client IPs behind Render/proxies
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
// CORS: in production, restrict to CLIENT_URL. In development, allow any
// localhost/127.0.0.1 port (CRA picks 3000, 3001, 3002... depending on what's free).
const corsOrigin = (origin, cb) => {
  if (!origin) return cb(null, true); // curl / same-origin / server-to-server
  if (isProd) {
    const allowed = (process.env.CLIENT_URL || '').split(',').map(s => s.trim()).filter(Boolean);
    return cb(null, allowed.includes(origin));
  }
  // dev: allow localhost and 127.0.0.1 on any port
  return cb(null, /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
};
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiters
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many attempts, please try again later.' } });
const messageLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 15, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many messages, please try again later.' } });
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false });

app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/messages', messageLimiter, require('./routes/messages'));

app.get('/', (req, res) => res.json({ message: 'GIGEXA API Running', version: '1.0.0' }));

// 404 for unknown API routes
app.use('/api', (req, res) => res.status(404).json({ message: 'Route not found' }));

// Central error handler (catches multer file-type/size errors, JSON parse errors, etc.)
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status || (err.name === 'MulterError' ? 400 : 500);
  res.status(status).json({ message: err.message || 'Server error' });
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gigexa';
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');
    const seed = require('./middleware/seed');
    await seed();
    if (seed.runMigrations) await seed.runMigrations();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
