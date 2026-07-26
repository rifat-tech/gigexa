import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { productsAPI, mediaUrl } from '../services/api';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState('specs');

  useEffect(() => {
    setLoading(true);
    productsAPI.getOne(slug).then(r => {
      setProduct(r.data);
      if (r.data.category) {
        productsAPI.getAll({ category: r.data.category._id, limit: 5 })
          .then(res => setRelated(res.data.products.filter(p => p._id !== r.data._id)));
      }
    }).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="loader-full"><div className="spinner" /></div>;
  if (!product) return <div className="page"><Navbar /><div className="empty-state"><h3>Product not found</h3></div><Footer /></div>;

  const imgs = product.images?.length ? product.images : [product.thumbnail].filter(Boolean);
  const fmt = p => '৳' + Number(p).toLocaleString('en-BD');
  const discount = product.originalPrice > product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="page">
      <Navbar />
      <div className="pd-breadcrumb-bar">
        <div className="container breadcrumb">
          <Link to="/">Home</Link><span>/</span>
          <Link to="/products">Products</Link><span>/</span>
          {product.category && <><Link to={`/products?category=${product.category._id}`}>{product.category.name}</Link><span>/</span></>}
          <span>{product.name}</span>
        </div>
      </div>

      <div className="container pd-layout">
        {/* Gallery */}
        <div className="pd-gallery">
          <div className="pd-main-img">
            <img src={mediaUrl(imgs[activeImg] || imgs[0]) || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600'} alt={product.name} />
            {discount > 0 && <span className="badge badge-sale pd-discount-badge">-{discount}%</span>}
          </div>
          {imgs.length > 1 && (
            <div className="pd-thumbs">
              {imgs.map((img, i) => (
                <button key={i} className={`pd-thumb ${i === activeImg ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                  <img src={mediaUrl(img)} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pd-info">
          <div className="pd-brand-badge">{product.brand}</div>
          <h1 className="pd-name">{product.name}</h1>
          {product.sku && <div className="pd-sku">SKU: <span>{product.sku}</span></div>}

          {product.rating > 0 && (
            <div className="pd-rating">
              <span className="stars">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
              <span>{product.rating}/5</span>
              <span className="muted">({product.reviewCount} reviews)</span>
              {product.sold > 0 && <span className="muted">· {product.sold} sold</span>}
            </div>
          )}

          <div className="pd-price-box">
            <div className="pd-price">{fmt(product.price)}</div>
            {product.originalPrice > product.price && (
              <div className="pd-price-row">
                <span className="price-original">{fmt(product.originalPrice)}</span>
                <span className="price-save">You save: {fmt(product.originalPrice - product.price)}</span>
              </div>
            )}
          </div>

          <div className="pd-meta-list">
            {product.warranty && <div className="pd-meta-item"><span>🛡️ Warranty</span><strong>{product.warranty}</strong></div>}
            <div className="pd-meta-item">
              <span>📦 Availability</span>
              <strong style={{ color: product.inStock ? 'var(--green)' : 'var(--primary)' }}>
                {product.inStock ? `In Stock (${product.stock} units)` : 'Out of Stock'}
              </strong>
            </div>
            {product.category && <div className="pd-meta-item"><span>📁 Category</span><Link to={`/products?category=${product.category._id}`}><strong>{product.category.name}</strong></Link></div>}
          </div>

          {product.shortDescription && <p className="pd-short-desc">{product.shortDescription}</p>}

          <div className="pd-actions">
            <div className="pd-qty">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
            </div>
            <button className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={!product.inStock} onClick={() => addItem(product, qty)}>
              🛒 Add to Cart
            </button>
          </div>

          <div className="pd-trust">
            <div>✅ 100% Genuine Product</div>
            <div>🚚 Free Delivery on ৳5,000+</div>
            <div>📞 Corporate Pricing Available</div>
            <div>🔄 7-Day Return Policy</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pd-tabs-section">
        <div className="container">
          <div className="pd-tabs">
            {['specs', 'description'].map(tab => (
              <button key={tab} className={`pd-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab === 'specs' ? 'Specifications' : 'Description'}
              </button>
            ))}
          </div>
          <div className="pd-tab-body">
            {activeTab === 'specs' && (
              product.specifications?.length > 0 ? (
                <table className="spec-table">
                  <tbody>
                    {product.specifications.map((s, i) => (
                      <tr key={i}><td className="spec-key">{s.key}</td><td>{s.value}</td></tr>
                    ))}
                  </tbody>
                </table>
              ) : <p style={{ color: 'var(--muted)' }}>No specifications available.</p>
            )}
            {activeTab === 'description' && <p style={{ lineHeight: 1.8, color: 'var(--mid)' }}>{product.description}</p>}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section" style={{ background: 'white' }}>
          <div className="container">
            <div className="section-header-row">
              <h2 className="section-title">Related Products</h2>
            </div>
            <div className="grid-products">
              {related.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
