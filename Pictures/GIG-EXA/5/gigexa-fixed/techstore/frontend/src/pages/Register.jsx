import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <Navbar />
      <div style={{ background: 'var(--bg)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 6, padding: 36, width: '100%', maxWidth: 440, boxShadow: 'var(--shadow)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontFamily: 'var(--font-condensed)', fontSize: 28, fontWeight: 800, color: 'var(--primary)', marginBottom: 6, textTransform: 'uppercase' }}>GIGEXA</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--dark)' }}>Create an Account</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required placeholder="Your full name" /></div>
            <div className="form-group"><label className="form-label">Email Address</label><input type="email" className="form-input" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required placeholder="you@example.com" /></div>
            <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder="+880 1XXX-XXXXXX" /></div>
            <div className="form-group"><label className="form-label">Password</label><input type="password" className="form-input" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} required minLength={6} placeholder="Minimum 6 characters" /></div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block">{loading ? 'Creating...' : 'Create Account'}</button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--muted)' }}>Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</Link></p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
