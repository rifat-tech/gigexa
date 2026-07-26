import React, { useState, useEffect, useRef, useCallback } from 'react';
import { messagesAPI } from '../services/api';
import toast from 'react-hot-toast';
import './ChatBubble.css';

const LS_KEY = 'gigexa_chat';

export default function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [convo, setConvo] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || null; } catch { return null; }
  });
  const [messages, setMessages] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [draft, setDraft] = useState('');
  const bodyRef = useRef(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const scrollToBottom = () => {
    requestAnimationFrame(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; });
  };

  // Load + poll the thread when we have a conversation and the window is open
  const loadThread = useCallback(async () => {
    if (!convo?.id) return;
    try {
      const r = await messagesAPI.getThread(convo.id);
      setMessages(prev => {
        if (prev.length !== r.data.messages.length) scrollToBottom();
        return r.data.messages;
      });
    } catch { /* ignore transient poll errors */ }
  }, [convo]);

  useEffect(() => {
    if (open && convo?.id) {
      loadThread();
      const t = setInterval(loadThread, 5000);
      return () => clearInterval(t);
    }
  }, [open, convo, loadThread]);

  useEffect(() => { if (open) scrollToBottom(); }, [open]);

  // First message: creates the conversation
  const handleStart = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) {
      toast.error('Please fill name, phone and message');
      return;
    }
    setLoading(true);
    try {
      const r = await messagesAPI.send({ ...form, page: window.location.pathname });
      const c = { id: r.data.conversationId, name: form.name, phone: form.phone, email: form.email };
      localStorage.setItem(LS_KEY, JSON.stringify(c));
      setConvo(c);
      setMessages(r.data.messages || []);
      scrollToBottom();
    } catch {
      toast.error('Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Follow-up messages in an existing thread
  const handleSend = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !convo) return;
    setDraft('');
    // optimistic
    setMessages(prev => [...prev, { sender: 'customer', text, at: new Date().toISOString(), _optimistic: true }]);
    scrollToBottom();
    try {
      await messagesAPI.send({ name: convo.name, phone: convo.phone, email: convo.email, message: text, page: window.location.pathname });
      loadThread();
    } catch {
      toast.error('Failed to send');
    }
  };

  const startNew = () => {
    localStorage.removeItem(LS_KEY);
    setConvo(null);
    setMessages([]);
    setForm({ name: '', phone: '', email: '', message: '' });
  };

  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* Click-anywhere-outside backdrop */}
      {open && <div className="chat-backdrop" onClick={() => setOpen(false)} />}

      {open && (
        <div className="chat-window" role="dialog" aria-label="Chat">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-avatar">G</div>
              <div>
                <div className="chat-title">GIGEXA Support</div>
                <div className="chat-status"><span className="chat-dot" /> Typically replies within an hour</div>
              </div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
          </div>

          {/* Body */}
          <div className="chat-body chat-thread" ref={bodyRef}>
            {!convo ? (
              <>
                <div className="chat-bubble-msg">
                  <div className="chat-bubble-avatar">G</div>
                  <div className="chat-bubble-text">
                    👋 Hi! Welcome to <strong>GIGEXA</strong>.<br /><br />
                    Send us a message and our team will reply right here.
                  </div>
                </div>
                <form onSubmit={handleStart} className="chat-form">
                  <div className="chat-input-group">
                    <label>Your Name *</label>
                    <input type="text" placeholder="Mohammad Rahman" value={form.name} onChange={e => set('name', e.target.value)} required />
                  </div>
                  <div className="chat-input-group">
                    <label>Phone Number *</label>
                    <input type="tel" placeholder="+880 1XXX-XXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} required />
                  </div>
                  <div className="chat-input-group">
                    <label>Email (optional)</label>
                    <input type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div className="chat-input-group">
                    <label>Message *</label>
                    <textarea placeholder="How can we help you?" value={form.message} onChange={e => set('message', e.target.value)} rows={3} required />
                  </div>
                  <button type="submit" disabled={loading} className="chat-send-btn">
                    {loading ? 'Sending…' : 'Start Chat'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="chat-day-sep"><span>Chatting as {convo.name}</span></div>
                {messages.map((m, i) => (
                  <div key={i} className={`chat-msg ${m.sender === 'admin' ? 'from-admin' : 'from-customer'}`}>
                    <div className="chat-msg-bubble">
                      {m.text}
                      <span className="chat-msg-time">{fmtTime(m.at)}</span>
                    </div>
                  </div>
                ))}
                {messages.length > 0 && messages[messages.length - 1].sender === 'customer' && (
                  <div className="chat-hint">Waiting for GIGEXA to reply…</div>
                )}
              </>
            )}
          </div>

          {/* Composer (only in an active thread) */}
          {convo && (
            <form className="chat-composer" onSubmit={handleSend}>
              <input
                type="text"
                placeholder="Type a message…"
                value={draft}
                onChange={e => setDraft(e.target.value)}
              />
              <button type="submit" className="chat-composer-send" disabled={!draft.trim()} aria-label="Send">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
              </button>
            </form>
          )}

          <div className="chat-footer">
            {convo ? <button className="chat-newchat" onClick={startNew}>Start a new chat</button> : <>Powered by <strong>GIGEXA</strong></>}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button className={`chat-fab ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
        )}
        {!open && <span className="chat-fab-label">Chat with us</span>}
      </button>
    </>
  );
}
