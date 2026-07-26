import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ordersAPI, mediaUrl } from '../services/api';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const statusColor = (s) => ({
  pending: '#B54708', confirmed: '#2563EB', processing: '#6C47FF',
  shipped: '#0E7490', delivered: '#027A48', cancelled: '#C01048'
}[s] || '#667085');

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    ordersAPI.getMine()
      .then(r => setOrders(r.data.orders || []))
      .catch(err => setError(err.response?.data?.message || 'Could not load your orders'))
      .finally(() => setLoading(false));
  }, []);

  const fmt = p => '৳' + Number(p || 0).toLocaleString('en-BD');
  const fmtDate = d => new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="page">
      <Navbar />
      <div style={{ background: 'var(--dark)', borderBottom: '3px solid var(--primary)', padding: '14px 0' }}>
        <div className="container"><h1 style={{ color: 'white', fontFamily: 'var(--font-condensed)', fontSize: 22, fontWeight: 800, textTransform: 'uppercase' }}>My Orders</h1></div>
      </div>

      <div style={{ background: 'var(--bg)', flex: 1 }}>
        <div className="container" style={{ padding: '24px 16px', maxWidth: 860 }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>Loading your orders…</div>
          ) : error ? (
            <div className="empty-state">
              <div style={{ fontSize: 48 }}>⚠️</div>
              <h3>{error}</h3>
              <Link to="/login" className="btn btn-primary" style={{ marginTop: 16 }}>Sign In</Link>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 56 }}>📦</div>
              <h3>No orders yet</h3>
              <p style={{ marginTop: 8, color: 'var(--muted)' }}>When you place an order it will show up here.</p>
              <Link to="/products" className="btn btn-primary btn-lg" style={{ marginTop: 20 }}>Start Shopping</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {orders.map(o => {
                const stepIndex = STATUS_STEPS.indexOf(o.status);
                const cancelled = o.status === 'cancelled';
                return (
                  <div key={o._id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--primary)' }}>{o.orderNumber}</span>
                        <span style={{ color: 'var(--muted)', fontSize: 13, marginLeft: 10 }}>{fmtDate(o.createdAt)}</span>
                      </div>
                      <span style={{ textTransform: 'capitalize', fontWeight: 700, fontSize: 13, color: statusColor(o.status), background: statusColor(o.status) + '18', padding: '4px 12px', borderRadius: 20 }}>
                        {o.status}
                      </span>
                    </div>

                    {/* Progress */}
                    {!cancelled && (
                      <div style={{ display: 'flex', padding: '14px 18px 4px', gap: 4 }}>
                        {STATUS_STEPS.map((s, i) => (
                          <div key={s} style={{ flex: 1 }}>
                            <div style={{ height: 4, borderRadius: 2, background: i <= stepIndex ? 'var(--green)' : 'var(--border)' }} />
                            <div style={{ fontSize: 10, color: i <= stepIndex ? 'var(--green)' : 'var(--muted)', marginTop: 4, textTransform: 'capitalize', textAlign: 'center' }}>{s}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Items */}
                    <div style={{ padding: '12px 18px' }}>
                      {o.items?.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '6px 0' }}>
                          {item.thumbnail && <img src={mediaUrl(item.thumbnail)} alt="" style={{ width: 44, height: 44, objectFit: 'contain', background: '#f8f8f8', borderRadius: 4, padding: 3, flexShrink: 0 }} />}
                          <div style={{ flex: 1, fontSize: 13 }}>
                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                            <div style={{ color: 'var(--muted)' }}>Qty: {item.quantity} × {fmt(item.price)}</div>
                          </div>
                          <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 13 }}>{fmt(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderTop: '1px solid var(--border-light)', background: 'var(--bg)' }}>
                      <span style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase' }}>{o.paymentMethod} · {o.shippingCost === 0 ? 'Free delivery' : fmt(o.shippingCost) + ' delivery'}</span>
                      <span style={{ fontWeight: 800, fontSize: 16 }}>Total: <span style={{ color: 'var(--primary)', fontFamily: 'var(--mono)' }}>{fmt(o.total)}</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
