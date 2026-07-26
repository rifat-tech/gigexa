import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { mediaUrl } from '../services/api';

export default function Cart() {
  const { items, removeItem, updateQty, total, clearCart } = useCart();
  const navigate = useNavigate();
  const fmt = p => '৳' + Number(p).toLocaleString('en-BD');
  const shipping = total >= 5000 ? 0 : 80;

  return (
    <div className="page">
      <Navbar />
      <div style={{ background: 'var(--bg)', flex: 1 }}>
        <div style={{ background: 'var(--dark)', borderBottom: '3px solid var(--primary)', padding: '14px 0' }}>
          <div className="container"><h1 style={{ color: 'white', fontFamily: 'var(--font-condensed)', fontSize: 22, fontWeight: 800, textTransform: 'uppercase' }}>Shopping Cart ({items.length} item{items.length !== 1 ? 's' : ''})</h1></div>
        </div>
        <div className="container" style={{ padding: '24px 16px', display: 'grid', gridTemplateColumns: items.length ? '1fr 320px' : '1fr', gap: 20, alignItems: 'start' }}>
          {items.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 56 }}>🛒</div>
              <h3>Your cart is empty</h3>
              <p style={{ marginTop: 8, color: 'var(--muted)' }}>Browse products and add them to your cart</p>
              <Link to="/products" className="btn btn-primary btn-lg" style={{ marginTop: 20 }}>Start Shopping</Link>
            </div>
          ) : (
            <>
              <div>
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                  {items.map((item, idx) => (
                    <div key={item._id} style={{ display: 'flex', gap: 14, padding: '16px', borderBottom: idx < items.length - 1 ? '1px solid var(--border-light)' : 'none', alignItems: 'center' }}>
                      <img src={mediaUrl(item.thumbnail)} alt={item.name} style={{ width: 80, height: 80, objectFit: 'contain', background: '#f8f8f8', borderRadius: 4, padding: 6, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>{item.brand}</div>
                        <Link to={`/products/${item.slug}`} style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)', display: 'block', marginBottom: 6 }}>{item.name}</Link>
                        {item.warranty && <div style={{ fontSize: 11, color: 'var(--green)' }}>🛡️ {item.warranty} Warranty</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                          <button style={{ width: 30, height: 32, background: 'var(--bg)', border: 'none', cursor: 'pointer', fontSize: 16 }} onClick={() => updateQty(item._id, item.qty - 1)}>−</button>
                          <span style={{ width: 34, textAlign: 'center', fontWeight: 700, fontSize: 14 }}>{item.qty}</span>
                          <button style={{ width: 30, height: 32, background: 'var(--bg)', border: 'none', cursor: 'pointer', fontSize: 16 }} onClick={() => updateQty(item._id, item.qty + 1)}>+</button>
                        </div>
                        <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 15, color: 'var(--primary)', minWidth: 90, textAlign: 'right' }}>{fmt(item.price * item.qty)}</span>
                        <button onClick={() => removeItem(item._id)} style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px' }}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                  <Link to="/products" className="btn btn-outline btn-sm">← Continue Shopping</Link>
                  <button className="btn btn-outline btn-sm" style={{ color: 'var(--muted)' }} onClick={clearCart}>Clear Cart</button>
                </div>
              </div>

              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden', position: 'sticky', top: 80 }}>
                <div style={{ background: 'var(--dark)', padding: '12px 16px', color: 'white', fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-condensed)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Order Summary</div>
                <div style={{ padding: 16 }}>
                  {items.map(item => (
                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                      <span style={{ color: 'var(--mid)' }}>{item.name.length > 28 ? item.name.slice(0, 28) + '…' : item.name} ×{item.qty}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{fmt(item.price * item.qty)}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 7 }}><span>Subtotal</span><span style={{ fontFamily: 'var(--mono)' }}>{fmt(total)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 7 }}><span>Shipping</span><span style={{ color: 'var(--green)', fontWeight: 600 }}>{shipping === 0 ? 'FREE' : fmt(shipping)}</span></div>
                    {shipping > 0 && <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 7 }}>Add {fmt(5000 - total)} more for free shipping</div>}
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 17 }}>
                      <span>Total</span><span style={{ color: 'var(--primary)', fontFamily: 'var(--mono)' }}>{fmt(total + shipping)}</span>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 14 }} onClick={() => navigate('/checkout')}>Proceed to Checkout →</button>
                  <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>✅ Secure Checkout &nbsp;|&nbsp; 🛡️ Official Warranty</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
