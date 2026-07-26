import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-grid">
          <div className="footer-col footer-brand-col">
            <div className="footer-logo">
              <span style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-.5px' }}>
                <span style={{ color: '#FFFFFF' }}>GIG</span><span style={{ color: 'var(--accent)' }}>EXA</span>
              </span>
            </div>
            <p>Bangladesh's technology store for laptops, PCs, monitors, components, gaming gear and networking. Genuine products with official warranty.</p>
            <div className="footer-contact">
              <div>📍 Dhaka, Bangladesh</div>
              <div>📞 09610-000000</div>
              <div>✉️ info@gigexa.com.bd</div>
              <div>🕐 Mon–Sat: 10AM–7PM</div>
            </div>
          </div>
          <div className="footer-col">
            <h4>Computers</h4>
            <Link to="/products?search=laptop">Laptops</Link>
            <Link to="/products?search=monitor">Monitors</Link>
            <Link to="/products?brand=ASUS">ASUS</Link>
            <Link to="/products?brand=Lenovo">Lenovo</Link>
            <Link to="/products?brand=Dell">Dell</Link>
          </div>
          <div className="footer-col">
            <h4>Gaming & Components</h4>
            <Link to="/products?search=gaming">Gaming Gear</Link>
            <Link to="/products?search=graphics">Graphics Cards</Link>
            <Link to="/products?brand=Cooler Master">Cooling</Link>
            <Link to="/products?brand=Rapoo">Keyboards</Link>
          </div>
          <div className="footer-col">
            <h4>Networking & More</h4>
            <Link to="/products?brand=MikroTik">MikroTik</Link>
            <Link to="/products?brand=Cudy">Cudy Routers</Link>
            <Link to="/products?brand=Starlink">Starlink</Link>
            <Link to="/products?brand=Brother">Printers</Link>
            <Link to="/products?search=projector">Projectors</Link>
          </div>
          <div className="footer-col">
            <h4>Customer Service</h4>
            <Link to="/">About GIGEXA</Link>
            <Link to="#">Corporate Sales</Link>
            <Link to="#">Warranty Policy</Link>
            <Link to="#">Return Policy</Link>
            <Link to="#">Delivery Info</Link>
            <Link to="#">Contact Us</Link>
          </div>
        </div>
      </div>
      <div className="footer-payment">
        <div className="container footer-payment-inner">
          <span>We Accept:</span>
          <span className="pay-chip">bKash</span>
          <span className="pay-chip">Nagad</span>
          <span className="pay-chip">Rocket</span>
          <span className="pay-chip">Cash on Delivery</span>
          <span className="pay-chip">Bank Transfer</span>
          <span className="pay-chip">Credit Card</span>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© 2026 GIGEXA Bangladesh. All rights reserved. Genuine technology products with official warranty.</p>
          <p>ASUS • Lenovo • Dell • HP • Acer • MikroTik • Cisco • Cudy • Starlink • Rapoo • Cooler Master • Brother</p>
        </div>
      </div>
    </footer>
  );
}
