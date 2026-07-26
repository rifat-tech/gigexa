import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, mediaUrl } from '../services/api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', street: '', city: '', district: '', zip: '', paymentMethod: 'cod', notes: '' });

  useEffect(() => {
    if (user) setForm(p => ({ ...p, name: p.name || user.name || '', email: p.email || user.email || '' }));
  }, [user]);

  const fmt = p => '৳' + Number(p).toLocaleString('en-BD');
  const shipping = total >= 5000 ? 0 : 80;
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!items.length) { toast.error('Cart is empty'); return; }
    setLoading(true);
    try {
      const res = await ordersAPI.create({
        guestInfo: { name: form.name, email: form.email, phone: form.phone },
        items: items.map(i => ({ product: i._id, name: i.name, price: i.price, quantity: i.qty, thumbnail: i.thumbnail })),
        shippingAddress: { name: form.name, phone: form.phone, street: form.street, city: form.city, district: form.district, zip: form.zip },
        subtotal: total, shippingCost: shipping, total: total + shipping,
        paymentMethod: form.paymentMethod, notes: form.notes
      });
      clearCart();
      navigate(`/order-success/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <Navbar />
      <div style={{ background: 'var(--dark)', borderBottom: '3px solid var(--primary)', padding: '14px 0' }}>
        <div className="container"><h1 style={{ color: 'white', fontFamily: 'var(--font-condensed)', fontSize: 22, fontWeight: 800, textTransform: 'uppercase' }}>Checkout</h1></div>
      </div>
      <div style={{ background: 'var(--bg)', flex: 1 }}>
        <div className="container" style={{ padding: '24px 16px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
          <form onSubmit={handleSubmit}>
            {/* Contact */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, marginBottom: 14, overflow: 'hidden' }}>
              <div style={{ background: 'var(--dark)', padding: '10px 16px', color: 'white', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-condensed)', textTransform: 'uppercase' }}>1. Contact Information</div>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Mohammad Rahman" /></div>
                  <div className="form-group"><label className="form-label">Phone Number *</label><input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} required placeholder="+880 1XXX-XXXXXX" /></div>
                </div>
                <div className="form-group"><label className="form-label">Email Address</label><input type="email" className="form-input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" /></div>
              </div>
            </div>
            {/* Delivery */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, marginBottom: 14, overflow: 'hidden' }}>
              <div style={{ background: 'var(--dark)', padding: '10px 16px', color: 'white', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-condensed)', textTransform: 'uppercase' }}>2. Delivery Address</div>
              <div style={{ padding: 20 }}>
                <div className="form-group"><label className="form-label">Street Address *</label><input className="form-input" value={form.street} onChange={e => set('street', e.target.value)} required placeholder="House/Road/Area" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                  <div className="form-group"><label className="form-label">City *</label><input className="form-input" value={form.city} onChange={e => set('city', e.target.value)} required placeholder="Dhaka" /></div>
                  <div className="form-group"><label className="form-label">District *</label><input className="form-input" value={form.district} onChange={e => set('district', e.target.value)} required placeholder="Dhaka" /></div>
                  <div className="form-group"><label className="form-label">ZIP Code</label><input className="form-input" value={form.zip} onChange={e => set('zip', e.target.value)} placeholder="1200" /></div>
                </div>
              </div>
            </div>
            {/* Payment */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, marginBottom: 14, overflow: 'hidden' }}>
              <div style={{ background: 'var(--dark)', padding: '10px 16px', color: 'white', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-condensed)', textTransform: 'uppercase' }}>3. Payment Method</div>
              <div style={{ padding: 20 }}>
                {[{ v: 'cod', l: '💵 Cash on Delivery', s: 'Pay when you receive your order' }, { v: 'bkash', l: '📱 bKash', s: 'Mobile banking payment' }, { v: 'nagad', l: '📲 Nagad', s: 'Mobile banking payment' }, { v: 'bank', l: '🏦 Bank Transfer', s: 'Direct bank transfer' }].map(pm => (
                  <label key={pm.v} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: `1.5px solid ${form.paymentMethod === pm.v ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 4, marginBottom: 8, cursor: 'pointer', background: form.paymentMethod === pm.v ? 'var(--primary-light)' : 'white', transition: 'all .15s' }}>
                    <input type="radio" name="pay" value={pm.v} checked={form.paymentMethod === pm.v} onChange={() => set('paymentMethod', pm.v)} style={{ accentColor: 'var(--primary)' }} />
                    <div><div style={{ fontWeight: 600, fontSize: 14 }}>{pm.l}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{pm.s}</div></div>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group"><label className="form-label">Order Notes (Optional)</label><textarea className="form-input" value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Any special instructions..." /></div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block">{loading ? 'Placing Order...' : `Place Order — ${fmt(total + shipping)}`}</button>
          </form>

          {/* Summary */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden', position: 'sticky', top: 80 }}>
            <div style={{ background: 'var(--dark)', padding: '12px 16px', color: 'white', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-condensed)', textTransform: 'uppercase' }}>Order Summary ({items.length} items)</div>
            <div style={{ padding: 16 }}>
              {items.map(item => (
                <div key={item._id} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
                  <img src={mediaUrl(item.thumbnail)} style={{ width: 44, height: 44, objectFit: 'contain', background: '#f8f8f8', borderRadius: 4, padding: 3, flexShrink: 0 }} alt="" />
                  <div style={{ flex: 1, fontSize: 12 }}>
                    <div style={{ fontWeight: 600, lineHeight: 1.3 }}>{item.name.length > 35 ? item.name.slice(0, 35) + '…' : item.name}</div>
                    <div style={{ color: 'var(--muted)' }}>Qty: {item.qty}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 13 }}>{fmt(item.price * item.qty)}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 7 }}><span>Subtotal</span><span style={{ fontFamily: 'var(--mono)' }}>{fmt(total)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 7 }}><span>Shipping</span><span style={{ color: 'var(--green)', fontWeight: 600 }}>{shipping === 0 ? 'FREE' : fmt(shipping)}</span></div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
                  <span>Total</span><span style={{ color: 'var(--primary)', fontFamily: 'var(--mono)' }}>{fmt(total + shipping)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
