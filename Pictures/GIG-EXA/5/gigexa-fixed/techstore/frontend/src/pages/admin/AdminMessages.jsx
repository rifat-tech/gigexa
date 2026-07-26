import React, { useState, useEffect, useCallback, useRef } from 'react';
import { messagesAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminMessages() {
  const [conversations, setConversations] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [thread, setThread] = useState(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const bodyRef = useRef(null);

  const scrollToBottom = () => requestAnimationFrame(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; });

  const loadList = useCallback(async () => {
    try {
      const r = await messagesAPI.getAll();
      setConversations(r.data.conversations || []);
      setUnread(r.data.unread || 0);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  const loadThread = useCallback(async (id, scroll = true) => {
    try {
      const r = await messagesAPI.getConversation(id);
      setThread(r.data);
      if (scroll) scrollToBottom();
    } catch { toast.error('Could not load conversation'); }
  }, []);

  useEffect(() => { loadList(); const t = setInterval(loadList, 8000); return () => clearInterval(t); }, [loadList]);

  // Poll the open thread for new customer messages
  useEffect(() => {
    if (!activeId) return;
    loadThread(activeId);
    const t = setInterval(() => loadThread(activeId, false), 5000);
    return () => clearInterval(t);
  }, [activeId, loadThread]);

  const openConvo = (id) => { setActiveId(id); setThread(null); };

  const handleReply = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !activeId) return;
    setDraft('');
    setThread(t => ({ ...t, messages: [...(t?.messages || []), { sender: 'admin', text, at: new Date().toISOString() }] }));
    scrollToBottom();
    setSending(true);
    try {
      await messagesAPI.reply(activeId, text);
      loadThread(activeId, true);
      loadList();
    } catch { toast.error('Reply failed'); }
    finally { setSending(false); }
  };

  const handleDelete = async () => {
    if (!activeId || !window.confirm('Delete this conversation?')) return;
    try {
      await messagesAPI.delete(activeId);
      setActiveId(null); setThread(null);
      loadList();
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' });
  const fmtDay = (d) => new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short' });
  const filtered = conversations.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search));

  return (
    <div className="fade-in">
      <div className="admin-page-header" style={{ marginBottom: 16 }}>
        <div>
          <div className="admin-page-title">💬 Messages</div>
          <div className="admin-page-sub">{conversations.length} conversations · {unread} unread</div>
        </div>
      </div>

      <div className="wa-shell">
        {/* Conversation list */}
        <div className="wa-list">
          <div className="wa-search">
            <input placeholder="Search name or phone…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="wa-list-scroll">
            {loading ? (
              <div className="wa-empty">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="wa-empty">No conversations yet</div>
            ) : filtered.map(c => (
              <button key={c._id} className={`wa-item ${activeId === c._id ? 'active' : ''}`} onClick={() => openConvo(c._id)}>
                <div className="wa-avatar">{c.name?.[0]?.toUpperCase() || '?'}</div>
                <div className="wa-item-main">
                  <div className="wa-item-top">
                    <span className="wa-item-name">{c.name}</span>
                    <span className="wa-item-time">{fmtDay(c.lastMessageAt)}</span>
                  </div>
                  <div className="wa-item-bottom">
                    <span className="wa-item-preview">{c.lastSender === 'admin' ? 'You: ' : ''}{c.lastText}</span>
                    {c.adminUnread > 0 && <span className="wa-badge">{c.adminUnread}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <div className="wa-chat">
          {!thread ? (
            <div className="wa-chat-empty">
              <div style={{ fontSize: 56, marginBottom: 10 }}>💬</div>
              <div style={{ fontWeight: 700, color: '#475467' }}>Select a conversation</div>
              <div style={{ fontSize: 13, color: '#98A2B3', marginTop: 4 }}>Pick a chat on the left to view and reply</div>
            </div>
          ) : (
            <>
              <div className="wa-chat-header">
                <div className="wa-avatar">{thread.name?.[0]?.toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="wa-chat-name">{thread.name}</div>
                  <div className="wa-chat-sub">
                    📞 {thread.phone}{thread.email ? ` · ✉️ ${thread.email}` : ''}{thread.page ? ` · 📍 ${thread.page}` : ''}
                  </div>
                </div>
                <a href={`tel:${thread.phone}`} className="wa-icon-btn" title="Call">📞</a>
                <button className="wa-icon-btn" title="Delete" onClick={handleDelete}>🗑️</button>
              </div>

              <div className="wa-chat-body" ref={bodyRef}>
                {thread.messages.map((m, i) => (
                  <div key={i} className={`wa-msg ${m.sender === 'admin' ? 'out' : 'in'}`}>
                    <div className="wa-bubble">
                      {m.text}
                      <span className="wa-time">{fmtTime(m.at)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <form className="wa-composer" onSubmit={handleReply}>
                <input placeholder="Type your reply…" value={draft} onChange={e => setDraft(e.target.value)} />
                <button type="submit" disabled={sending || !draft.trim()} className="wa-send">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
