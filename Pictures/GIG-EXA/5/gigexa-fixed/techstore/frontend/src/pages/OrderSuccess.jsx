import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function OrderSuccess() {
  const { id } = useParams();
  return (
    <div className="page">
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '60px 20px' }}>
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 6, padding: 48, maxWidth: 540, width: '100%', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
          <div style={{ width: 72, height: 72, background: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36 }}>✓</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--dark)', fontFamily: 'var(--font-condensed)', textTransform: 'uppercase', marginBottom: 8 }}>Order Confirmed!</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 6 }}>Thank you for your order. We'll process it shortly.</p>
          <div style={{ background: 'var(--bg)', borderRadius: 4, padding: '10px 16px', marginBottom: 24, display: 'inline-block' }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Order ID: </span>
            <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>{id}</span>
          </div>
          <div style={{ background: 'var(--bg)', borderRadius: 4, padding: 20, marginBottom: 28, textAlign: 'left' }}>
            {[['📦', 'Order Received', 'We have received your order'], ['🔄', 'Processing', 'Your items are being prepared'], ['🚚', 'Delivery', 'Delivered within 2-5 business days']].map(([icon, title, sub], i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < 2 ? 14 : 0, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
                <div><div style={{ fontWeight: 700, fontSize: 13 }}>{title}</div><div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{sub}</div></div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-primary btn-lg">Continue Shopping</Link>
            <Link to="/my-orders" className="btn btn-outline btn-lg">📦 My Orders</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
