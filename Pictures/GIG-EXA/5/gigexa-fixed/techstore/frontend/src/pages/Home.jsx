import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { productsAPI, categoriesAPI } from '../services/api';
import './Home.css';

const BANNERS = [
  {
    id: 1,
    eyebrow: 'COPILOT+ PCs & LATEST LAPTOPS',
    title: 'Big power. Bigger savings.',
    sub: 'ASUS · Lenovo · Dell · HP · Acer',
    desc: 'Shop the newest Copilot+ laptops, gaming machines and ultrabooks with official warranty.',
    cta: 'Shop Laptops',
    ctaLink: '/products?search=laptop',
    badge: 'New Arrivals',
    tone: 'blue',
    img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=760&q=90',
  },
  {
    id: 2,
    eyebrow: 'GAMING GEAR & PC COMPONENTS',
    title: 'Level up your setup.',
    sub: 'ROG · TUF · Cooler Master · Rapoo · NZXT',
    desc: 'Graphics cards, mechanical keyboards, monitors and cooling — everything to build and play.',
    cta: 'Shop Gaming',
    ctaLink: '/products?search=gaming',
    badge: 'Hot Deals',
    tone: 'dark',
    img: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=760&q=90',
  },
  {
    id: 3,
    eyebrow: 'NETWORKING & CONNECTIVITY',
    title: 'Connect everything.',
    sub: 'MikroTik · Cisco · Cudy · Starlink · Ruijie',
    desc: 'Routers, switches, firewalls and Starlink kits for homes, offices and ISPs.',
    cta: 'Shop Networking',
    ctaLink: '/products?search=router',
    badge: 'Business Ready',
    tone: 'yellow',
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=760&q=90',
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    Promise.all([
      productsAPI.getAll({ featured: true, limit: 10 }),
      productsAPI.getAll({ newIn: true, limit: 10 }),
      categoriesAPI.getAll()
    ]).then(([f, n, c]) => {
      setFeatured(f.data.products);
      setNewArrivals(n.data.products);
      setCategories(c.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % BANNERS.length), 5500);
    return () => clearInterval(t);
  }, []);

  const current = BANNERS[slide];

  const Row = ({ title, link, items }) => (
    <section className="section" style={{ background: 'white', borderTop: '1px solid var(--border-light)' }}>
      <div className="container">
        <div className="section-header-row">
          <h2 className="section-title">{title}</h2>
          <Link to={link} className="view-all">View all →</Link>
        </div>
        {loading ? (
          <div className="grid-products"><div className="skeleton" style={{ height: 340 }} /></div>
        ) : items.length === 0 ? (
          <div className="empty-state"><div style={{ fontSize: 44 }}>📦</div><h3>No products yet</h3><p style={{ marginTop: 6 }}>Restart the backend to seed the catalog.</p></div>
        ) : (
          <div className="grid-products">{items.map(p => <ProductCard key={p._id} product={p} />)}</div>
        )}
      </div>
    </section>
  );

  return (
    <div className="page">
      <Navbar />

      {/* HERO */}
      <section className={`hero hero-${current.tone}`}>
        <div className="container hero-inner">
          <div className="hero-content">
            <div className="hero-eyebrow">{current.eyebrow}</div>
            <h1 className="hero-title">{current.title}</h1>
            <p className="hero-sub">{current.sub}</p>
            <p className="hero-desc">{current.desc}</p>
            <div className="hero-actions">
              <Link to={current.ctaLink} className="btn btn-accent btn-lg">{current.cta}</Link>
              <span className="hero-badge">{current.badge}</span>
            </div>
          </div>
          <div className="hero-img-wrap">
            <img src={current.img} alt={current.title} className="hero-img" />
          </div>
        </div>
        <div className="slide-dots">
          {BANNERS.map((_, i) => (
            <button key={i} className={`slide-dot ${i === slide ? 'active' : ''}`} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="trust-bar">
        <div className="container trust-bar-inner">
          {[
            { icon: '🚚', t: 'Free Delivery', s: 'Orders over ৳5,000' },
            { icon: '✅', t: 'Genuine Products', s: '100% Authentic' },
            { icon: '🛡️', t: 'Official Warranty', s: 'Brand Authorized' },
            { icon: '💳', t: 'Easy Payment', s: 'bKash · Nagad · COD' },
            { icon: '📞', t: 'Expert Support', s: 'Mon–Sat, 10–7' },
          ].map((t, i) => (
            <div key={i} className="trust-item">
              <span className="trust-icon">{t.icon}</span>
              <div><div className="trust-title">{t.t}</div><div className="trust-sub">{t.s}</div></div>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORY TILES */}
      <section className="section">
        <div className="container">
          <div className="section-header-row">
            <h2 className="section-title">Shop by Category</h2>
            <Link to="/products" className="view-all">All products →</Link>
          </div>
          <div className="cat-grid">
            {categories.map(cat => (
              <Link key={cat._id} to={`/products?category=${cat._id}`} className="cat-card">
                <div className="cat-card-icon">{cat.icon}</div>
                <div className="cat-card-name">{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {newArrivals.length > 0 && <Row title="✨ New Arrivals" link="/products?newIn=true" items={newArrivals} />}
      <Row title="🔥 Featured Deals" link="/products?featured=true" items={featured} />

      {/* BRAND STRIP */}
      <section className="brand-strip">
        <div className="container">
          <div className="brand-strip-title">Authorized Brands We Carry</div>
          <div className="brands-row">
            {['ASUS', 'Lenovo', 'Dell', 'HP', 'Acer', 'MikroTik', 'Cisco', 'Cudy', 'Starlink', 'Rapoo', 'Cooler Master', 'Seagate', 'Brother', 'LG'].map(b => (
              <Link key={b} to={`/products?brand=${encodeURIComponent(b)}`} className="brand-chip">{b}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* CORPORATE CTA */}
      <section className="corp-cta">
        <div className="container corp-cta-inner">
          <div>
            <h2>Need corporate or bulk pricing?</h2>
            <p>Talk to our team for volume discounts, custom configurations and dedicated support.</p>
          </div>
          <div className="corp-cta-actions">
            <a href="tel:+8809610000000" className="btn btn-accent btn-lg">📞 Call Us</a>
            <a href="mailto:info@gigexa.com.bd" className="btn btn-lg" style={{ background: 'white', color: 'var(--dark)', border: '1px solid white' }}>✉️ Email Us</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
