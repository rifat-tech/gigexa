import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { categoriesAPI } from '../services/api';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  useEffect(() => { categoriesAPI.getAll().then(r => setCategories(r.data)).catch(() => {}); }, []);
  useEffect(() => { setMenuOpen(false); setUserMenu(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/products?search=${encodeURIComponent(search)}`); setSearch(''); }
  };

  return (
    <>
      {/* Top Info Bar */}
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-left">
            <span>📍 Dhaka, Bangladesh</span>
            <span>|</span>
            <a href="tel:+8809610000000">📞 09610-000000</a>
            <span>|</span>
            <a href="mailto:info@gigexa.com.bd">✉️ info@gigexa.com.bd</a>
          </div>
          <div className="topbar-right">
            <span>Sat–Thu: 9AM–7PM</span>
            <span>|</span>
            <Link to="/register">Register</Link>
            <span>|</span>
            <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <nav className="navbar">
        <div className="container navbar-inner">
          {/* Logo */}
          <Link to="/" className="logo">
            <span className="logo-mark">GIGEXA</span>
          </Link>

          {/* Search */}
          <form className="search-bar" onSubmit={handleSearch}>
            <input type="text" placeholder="Search products, brands, models..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
            <button type="submit" className="search-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
          </form>

          {/* Actions */}
          <div className="nav-actions">
            {user ? (
              <div className="user-menu-wrap">
                <button className="nav-action-btn" onClick={() => setUserMenu(!userMenu)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span>{user.name.split(' ')[0]}</span>
                </button>
                {userMenu && (
                  <div className="user-dropdown">
                    <Link to="/my-orders">📦 My Orders</Link>
                    {user.role === 'admin' && <Link to="/admin">⚙️ Admin Dashboard</Link>}
                    <hr />
                    <button onClick={() => { logout(); navigate('/'); }}>🚪 Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="nav-action-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>Sign In</span>
              </Link>
            )}
            <Link to="/cart" className="nav-action-btn cart-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span>Cart</span>
              {count > 0 && <span className="cart-count">{count}</span>}
            </Link>
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Category Nav */}
      <div className="cat-nav">
        <div className="container cat-nav-inner">
          <Link to="/products" className="cat-link cat-link-all">☰ All Products</Link>
          {categories.map(cat => (
            <Link key={cat._id} to={`/products?category=${cat._id}`} className="cat-link">
              {cat.icon} {cat.name}
            </Link>
          ))}
          <Link to="/products?featured=true" className="cat-link" style={{color:'#FFD700'}}>🔥 Hot Deals</Link>
        </div>
      </div>

      {/* Promo Bar */}
      <div className="promo-bar">
        <div className="container">
          🚚 <span>Free Delivery</span> on orders over ৳5,000 &nbsp;|&nbsp; ✅ <span>100% Genuine</span> Products with Official Warranty &nbsp;|&nbsp; 📞 Corporate Deals: <span>09610-000000</span>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <form onSubmit={handleSearch} className="mobile-search">
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{flex:1}} />
            <button type="submit" className="btn btn-primary btn-sm">Search</button>
          </form>
          <div className="mobile-links">
            <Link to="/products">All Products</Link>
            {categories.map(c => <Link key={c._id} to={`/products?category=${c._id}`}>{c.icon} {c.name}</Link>)}
            <hr />
            {user ? (
              <>
                <Link to="/my-orders">📦 My Orders</Link>
                {user.role === 'admin' && <Link to="/admin">Admin Dashboard</Link>}
                <button onClick={() => { logout(); navigate('/'); }}>Logout</button>
              </>
            ) : (
              <><Link to="/login">Sign In</Link><Link to="/register">Register</Link></>
            )}
          </div>
        </div>
      )}
    </>
  );
}
