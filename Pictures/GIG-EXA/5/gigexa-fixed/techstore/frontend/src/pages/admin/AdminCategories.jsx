import React, { useState, useEffect } from 'react';
import { categoriesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY = { name: '', icon: '📦', description: '' };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetch = () => categoriesAPI.getAll().then(r => setCategories(r.data));
  useEffect(() => { fetch(); }, []);

  const openNew = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (cat) => { setForm({ name: cat.name, icon: cat.icon, description: cat.description || '' }); setEditing(cat._id); setShowForm(true); };
  const close = () => { setShowForm(false); setEditing(null); setForm(EMPTY); };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) await categoriesAPI.update(editing, form);
      else await categoriesAPI.create(form);
      toast.success(editing ? 'Category updated' : 'Category created');
      close();
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try { await categoriesAPI.delete(id); toast.success('Deleted'); fetch(); }
    catch { toast.error('Delete failed'); }
  };

  const ICONS = ['🌐', '🖥️', '🛡️', '⌚', '📷', '💻', '🖨️', '📱', '🎧', '🖱️', '📦', '⚡'];

  return (
    <div className="fade-in">
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Categories</div>
          <div className="admin-page-sub">{categories.length} categories</div>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Add Category</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {categories.map(cat => (
          <div key={cat._id} className="admin-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, background: '#EFF6FF', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                  {cat.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{cat.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{cat.description}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button className="btn btn-outline btn-sm" onClick={() => openEdit(cat)}>Edit</button>
                <button className="btn btn-sm" style={{ background: '#FFEBE6', color: '#BF2600' }} onClick={() => handleDelete(cat._id, cat.name)}>Del</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Category' : 'New Category'}</h3>
              <button className="modal-close" onClick={close}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Icon</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    {ICONS.map(ic => (
                      <button type="button" key={ic} onClick={() => setForm(p => ({ ...p, icon: ic }))}
                        style={{ width: 40, height: 40, borderRadius: 8, border: `2px solid ${form.icon === ic ? '#2563EB' : '#E5E7EB'}`, background: form.icon === ic ? 'var(--primary-light)' : 'white', fontSize: 20, cursor: 'pointer', transition: 'all .15s' }}>
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input required className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Networking" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={close}>Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
