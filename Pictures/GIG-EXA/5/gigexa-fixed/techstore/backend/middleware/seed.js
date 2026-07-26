const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');

// Bump this when the seeded catalog changes — existing databases will be
// re-seeded automatically on next boot (orders keep their own copies of
// name/price/thumbnail, so historical orders are unaffected).
const CATALOG_VERSION = 'gb-catalog-2026-1';

// Representative product imagery by type (Unsplash). We intentionally do NOT
// hotlink Global Brand's own product photos.
const IMG = {
  laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700',
  laptop2: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700',
  ultrabook: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=700',
  monitor: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=700',
  tv: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=700',
  gpu: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=700',
  cooler: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=700',
  ssd: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=700',
  keyboard: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700',
  controller: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=700',
  speaker: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=700',
  projector: 'https://images.unsplash.com/photo-1626379953822-baec19c3accd?w=700',
  gimbal: 'https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=700',
  router: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=700',
  starlink: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=700',
  printer: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=700',
};

const seed = async () => {
  try {
    const meta = mongoose.connection.collection('meta');
    const cur = await meta.findOne({ _id: 'catalog' });
    const hasCats = await Category.countDocuments();
    if (cur?.version === CATALOG_VERSION && hasCats > 0) {
      await ensureAdmin();
      return;
    }

    console.log('🌱 Seeding Global Brand catalog…');
    await Category.deleteMany({});
    await Product.deleteMany({});

    const cats = await Category.insertMany([
      { name: 'Laptop', slug: 'laptop', icon: '💻', description: 'Notebooks, Ultrabooks & Copilot+ PCs', order: 1 },
      { name: 'Desktop & PC', slug: 'desktop-pc', icon: '🖥️', description: 'Brand PCs, All-in-One & Mini PCs', order: 2 },
      { name: 'Monitor', slug: 'monitor', icon: '🖵', description: 'Gaming, 4K, Curved & Business Monitors', order: 3 },
      { name: 'Components', slug: 'components', icon: '🧩', description: 'GPU, CPU, RAM, SSD, Cooling & PSU', order: 4 },
      { name: 'Accessories', slug: 'accessories', icon: '⌨️', description: 'Keyboards, Mice, Headphones & Cables', order: 5 },
      { name: 'Gaming', slug: 'gaming', icon: '🎮', description: 'Gaming Gear, Chairs & Controllers', order: 6 },
      { name: 'Networking', slug: 'networking', icon: '🌐', description: 'Routers, Switches, Firewalls & Starlink', order: 7 },
      { name: 'Printer', slug: 'printer', icon: '🖨️', description: 'Ink Tank, Laser & Label Printers', order: 8 },
      { name: 'TV & Display', slug: 'tv-display', icon: '📺', description: 'Android TVs & Interactive Panels', order: 9 },
      { name: 'Gadgets', slug: 'gadgets', icon: '⌚', description: 'Speakers, Projectors, Gimbals & Wearables', order: 10 },
    ]);
    const C = Object.fromEntries(cats.map(c => [c.slug, c._id]));

    const slugify = require('slugify');
    const mk = (name, brand, price, originalPrice, category, image, opts = {}) => ({
      name,
      slug: slugify(name, { lower: true, strict: true }).slice(0, 90),
      sku: (brand.slice(0, 3) + '-' + Math.random().toString(36).slice(2, 8)).toUpperCase(),
      description: opts.desc || `${name}. Genuine ${brand} product with official warranty, sourced through authorized distribution in Bangladesh.`,
      shortDescription: opts.short || name,
      price, originalPrice: originalPrice || price,
      category, brand,
      thumbnail: image, images: [image],
      stock: opts.stock ?? 15,
      warranty: opts.warranty || '1 Year Official',
      isFeatured: !!opts.featured,
      isNewArrival: !!opts.newIn,
      rating: opts.rating || 4.6,
      reviewCount: opts.reviews || Math.floor(20 + Math.random() * 180),
      sold: Math.floor(Math.random() * 300),
      tags: opts.tags || [],
    });

    await Product.insertMany([
      // LAPTOPS
      mk('ASUS Vivobook S14 M3407HA Ryzen 7 260 16GB 1TB SSD 14" WUXGA Copilot+ PC', 'ASUS', 134000, 142000, C['laptop'], IMG.laptop, { featured: true, newIn: true, tags: ['laptop', 'asus', 'ryzen', 'copilot'], short: 'Ryzen 7 260 · 16GB · 1TB SSD · 14" WUXGA' }),
      mk('Lenovo IdeaPad Slim 3i 14IRH10 Core i5-13420H 16GB 1TB SSD 14" Laptop', 'Lenovo', 92500, 98000, C['laptop'], IMG.laptop2, { featured: true, tags: ['laptop', 'lenovo', 'ideapad', 'core i5'], short: 'Core i5-13420H · 16GB · 1TB SSD · 14"' }),
      mk('Lenovo IdeaPad Slim 3i 15IRH10 Core i7-13620H 16GB 512GB SSD 15.3" Laptop', 'Lenovo', 99500, 105000, C['laptop'], IMG.laptop, { newIn: true, tags: ['laptop', 'lenovo', 'core i7'], short: 'Core i7-13620H · 16GB · 512GB SSD · 15.3"' }),
      mk('Lenovo Yoga Slim 7i Ultra 14IPH11 Core Ultra 7 355 32GB 1TB 2.8K POLED Copilot+ PC', 'Lenovo', 315000, 0, C['laptop'], IMG.ultrabook, { featured: true, newIn: true, warranty: '2 Year Official', tags: ['laptop', 'lenovo', 'yoga', 'oled'], short: 'Core Ultra 7 · 32GB · 1TB · 2.8K POLED' }),
      mk('ASUS Zenbook Duo UX8407AA Core Ultra X7 358H 32GB 1TB 3K OLED Copilot+ PC', 'ASUS', 476000, 0, C['laptop'], IMG.ultrabook, { newIn: true, warranty: '2 Year Official', tags: ['laptop', 'asus', 'zenbook', 'oled', 'dual screen'], short: 'Dual 3K OLED · Core Ultra X7 · 32GB · 1TB' }),

      // MONITORS
      mk('Lenovo Legion 24-10 24" 240Hz FHD IPS Gaming Monitor', 'Lenovo', 21200, 23500, C['monitor'], IMG.monitor, { newIn: true, tags: ['monitor', 'lenovo', 'gaming', '240hz'], short: '24" · 240Hz · FHD IPS' }),

      // TV & DISPLAY
      mk('Realview L32D01 32-inch LED Android TV', 'Realview', 25500, 28000, C['tv-display'], IMG.tv, { newIn: true, tags: ['tv', 'realview', 'android tv'], short: '32" LED Android TV' }),
      mk('Realview L43D01 43-inch QLED 4K Google TV', 'Realview', 53500, 58000, C['tv-display'], IMG.tv, { newIn: true, featured: true, tags: ['tv', 'realview', 'qled', '4k'], short: '43" QLED 4K Google TV' }),

      // COMPONENTS
      mk('ASUS Dual Radeon RX 9060 XT 16GB GDDR6 White Edition Graphics Card', 'ASUS', 68500, 72000, C['components'], IMG.gpu, { newIn: true, featured: true, tags: ['graphics card', 'gpu', 'asus', 'radeon'], short: 'RX 9060 XT · 16GB GDDR6' }),
      mk('Cooler Master MasterLiquid Core Nex ARGB 360mm CPU Liquid Cooler', 'Cooler Master', 11000, 12500, C['components'], IMG.cooler, { tags: ['cpu cooler', 'cooler master', 'aio', 'argb'], short: '360mm ARGB AIO Liquid Cooler' }),
      mk('Lexar Elite Legend D500 128GB USB 3.2 Type-C Portable SSD', 'Lexar', 6500, 7200, C['components'], IMG.ssd, { newIn: true, tags: ['ssd', 'lexar', 'portable ssd', 'usb-c'], short: '128GB · USB 3.2 Type-C Portable SSD' }),

      // ACCESSORIES / GAMING KEYBOARDS
      mk('Rapoo ESK750-98 Backlit Mechanical Gaming Keyboard', 'Rapoo', 6200, 6800, C['gaming'], IMG.keyboard, { newIn: true, tags: ['keyboard', 'rapoo', 'mechanical', 'gaming'], short: 'Backlit Mechanical · 98-key' }),
      mk('Rapoo V500PRO-87 Backlit Mechanical Gaming Keyboard', 'Rapoo', 2700, 3100, C['gaming'], IMG.keyboard, { tags: ['keyboard', 'rapoo', 'mechanical'], short: 'Backlit Mechanical · 87-key' }),
      mk('Rapoo V700DIY-75 Multi-Mode Backlit Mechanical Gaming Keyboard', 'Rapoo', 6200, 6800, C['gaming'], IMG.keyboard, { newIn: true, tags: ['keyboard', 'rapoo', 'mechanical', 'hot-swap'], short: 'Multi-Mode · Hot-Swap · 75%' }),
      mk('Rapoo V700DIY-98 Multi-Mode Backlit Mechanical Gaming Keyboard', 'Rapoo', 6500, 7000, C['gaming'], IMG.keyboard, { newIn: true, tags: ['keyboard', 'rapoo', 'mechanical'], short: 'Multi-Mode · 98-key' }),
      mk('Rapoo V610M Multi-Mode Vibration Gaming Controller', 'Rapoo', 4550, 5000, C['gaming'], IMG.controller, { newIn: true, tags: ['controller', 'gamepad', 'rapoo'], short: 'Multi-Mode Vibration Gamepad' }),

      // GADGETS
      mk('Blisbond K319 40W RGB Bluetooth Speaker', 'Blisbond', 5500, 6200, C['gadgets'], IMG.speaker, { tags: ['speaker', 'bluetooth', 'blisbond'], short: '40W RGB Bluetooth Speaker' }),
      mk('Blisbond TS-6 Pro Wi-Fi & Bluetooth Gimbal Projector', 'Blisbond', 20500, 22500, C['gadgets'], IMG.projector, { featured: true, tags: ['projector', 'blisbond', 'wifi'], short: 'Wi-Fi & BT Gimbal Projector' }),
      mk('Hohem iSteady M6 Kit AI Gimbal Stabilizer', 'Hohem', 21000, 23000, C['gadgets'], IMG.gimbal, { newIn: true, tags: ['gimbal', 'hohem', 'stabilizer'], short: 'AI Gimbal Stabilizer Kit' }),

      // NETWORKING
      mk('Cudy WR1200 AC1200 Dual Band Wi-Fi Router', 'Cudy', 2650, 2950, C['networking'], IMG.router, { tags: ['router', 'cudy', 'wifi', 'ac1200'], short: 'AC1200 Dual Band Wi-Fi Router', stock: 40 }),
      mk('Starlink Standard Kit (Gen 4)', 'Starlink', 49500, 52000, C['networking'], IMG.starlink, { featured: true, tags: ['starlink', 'satellite', 'internet'], short: 'Standard Satellite Internet Kit', warranty: '1 Year', stock: 8 }),

      // PRINTER
      mk('Brother DCP-T220 All-in-One Ink Tank Printer', 'Brother', 16500, 18000, C['printer'], IMG.printer, { featured: true, tags: ['printer', 'brother', 'ink tank'], short: 'Print · Scan · Copy Ink Tank' }),
    ]);

    await meta.updateOne({ _id: 'catalog' }, { $set: { version: CATALOG_VERSION, at: new Date() } }, { upsert: true });
    await ensureAdmin();
    console.log('✅ Global Brand catalog seeded.');
    if (!process.env.ADMIN_PASSWORD) {
      console.warn('⚠️  Using default admin password. Set ADMIN_EMAIL and ADMIN_PASSWORD before going live.');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

async function ensureAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@gigexa.com.bd').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234';
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) await User.create({ name: 'Admin', email: adminEmail, password: adminPassword, role: 'admin' });
}

// Non-destructive migrations that run once.
const runMigrations = async () => {
  const Conversation = require('../models/Conversation');
  const Prod = require('../models/Product');

  try {
    const convoCount = await Conversation.countDocuments();
    if (convoCount === 0 && mongoose.connection.collections['messages']) {
      const legacy = await mongoose.connection.collection('messages').find({}).sort({ createdAt: 1 }).toArray();
      if (legacy.length) {
        const byPhone = {};
        for (const m of legacy) {
          const key = (m.phone || 'unknown').trim();
          if (!byPhone[key]) byPhone[key] = { name: m.name, phone: key, email: m.email, page: m.page, messages: [], lastMessageAt: m.createdAt, adminUnread: 0 };
          byPhone[key].messages.push({ sender: 'customer', text: m.message, at: m.createdAt || new Date() });
          byPhone[key].lastMessageAt = m.createdAt || new Date();
          if (!m.isRead) byPhone[key].adminUnread += 1;
          if (m.name) byPhone[key].name = m.name;
          if (m.email) byPhone[key].email = m.email;
        }
        await Conversation.insertMany(Object.values(byPhone));
        console.log(`💬 Migrated ${legacy.length} legacy messages into ${Object.keys(byPhone).length} conversations`);
      }
    }
  } catch (e) { console.warn('Message migration skipped:', e.message); }

  try {
    const { inferSubcategory } = require('../utils/subcategory');
    const missing = await Prod.find({ $or: [{ subcategory: { $exists: false } }, { subcategory: null }, { subcategory: '' }] });
    for (const p of missing) { p.subcategory = inferSubcategory(p); await p.save(); }
    if (missing.length) console.log(`🏷️  Backfilled subcategory on ${missing.length} products`);
  } catch (e) { console.warn('Subcategory backfill skipped:', e.message); }
};

module.exports = seed;
module.exports.runMigrations = runMigrations;
