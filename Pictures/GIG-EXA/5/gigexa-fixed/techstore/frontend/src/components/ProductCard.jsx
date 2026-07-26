import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';
import { mediaUrl } from '../services/api';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const fmt = p => '৳' + Number(p).toLocaleString('en-BD');
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card">
      {/* Image */}
      <Link to={`/products/${product.slug}`} className="product-img-link">
        <div className="product-img-wrap">
          <img
            src={mediaUrl(product.thumbnail) || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'}
            alt={product.name}
            className="product-img"
            loading="lazy"
            decoding="async"
          />
          {!product.inStock && <div className="oos-overlay">Out of Stock</div>}
        </div>
        {/* Badges */}
        <div className="product-badges">
          {product.isNewArrival && <span className="badge badge-new">New</span>}
          {discount > 0 && <span className="badge badge-sale">-{discount}%</span>}
          {product.isFeatured && !product.isNewArrival && <span className="badge badge-hot">Hot</span>}
        </div>
      </Link>

      {/* Info */}
      <div className="product-info">
        <div className="product-brand">{product.brand}</div>
        <Link to={`/products/${product.slug}`} className="product-name">{product.name}</Link>

        {product.rating > 0 && (
          <div className="product-rating">
            <span className="stars">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
            <span className="rating-count">({product.reviewCount})</span>
          </div>
        )}

        <div className="product-pricing">
          <span className="price price-sale">{fmt(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="price-original">{fmt(product.originalPrice)}</span>
          )}
        </div>

        {product.stock > 0 && product.stock <= 5 && (
          <div className="low-stock">Only {product.stock} left!</div>
        )}
        {product.stock === 0 && <div className="no-stock">Out of Stock</div>}

        {product.warranty && <div className="product-warranty">🛡️ {product.warranty} Warranty</div>}

        <button
          className="btn btn-primary btn-sm add-cart-btn"
          onClick={(e) => { e.preventDefault(); product.inStock && addItem(product); }}
          disabled={!product.inStock}
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}
