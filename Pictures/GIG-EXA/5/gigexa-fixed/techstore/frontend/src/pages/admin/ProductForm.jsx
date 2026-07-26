import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsAPI, categoriesAPI, mediaUrl } from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY = {
  name: '', brand: '', shortDescription: '', description: '', price: '', originalPrice: '',
  category: '', subcategory: '', stock: '', warranty: '', status: 'active', isFeatured: false, isNewArrival: false,
  thumbnail: '', tags: '', specifications: [{ key: '', value: '' }]
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState([]);
  const [subOptions, setSubOptions] = useState([]);   // all existing subcategories
  const [subByCat, setSubByCat] = useState({});        // subcategories grouped by category id

  useEffect(() => { categoriesAPI.getAll().then(r => setCategories(r.data)); }, []);

  // Load existing subcategories so the admin can pick one instead of typing
  useEffect(() => {
    productsAPI.getFacets().then(r => {
      const byCat = r.data.categories || {};
      setSubByCat(byCat);
      const all = new Set();
      Object.values(byCat).forEach(list => list.forEach(s => all.add(s.name)));
      Object.values(r.data.brands || {}).forEach(list => list.forEach(s => all.add(s.name)));
      setSubOptions([...all].sort());
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    productsAPI.getById(id)
      .then(r => {
        const p = r.data;
        setForm({
          ...EMPTY,
          ...p,
          category: p.category?._id || p.category || '',
          tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
          specifications: p.specifications?.length ? p.specifications : [{ key: '', value: '' }]
        });
      })
      .catch(err => {
        toast.error(err.response?.data?.message || 'Could not load product');
        navigate('/admin/products');
      });
  }, [id, isEdit, navigate]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const addSpec = () => setForm(prev => ({ ...prev, specifications: [...prev.specifications, { key: '', value: '' }] }));
  const removeSpec = i => setForm(prev => ({ ...prev, specifications: prev.specifications.filter((_, idx) => idx !== i) }));
  const setSpec = (i, field, val) => setForm(prev => ({
    ...prev,
    specifications: prev.specifications.map((s, idx) => idx === i ? { ...s, [field]: val } : s)
  }));

  const handleFiles = e => {
    const fs = Array.from(e.target.files);
    setFiles(fs);
    setPreview(fs.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        stock: Number(form.stock),
        tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags,
        specifications: form.specifications.filter(s => s.key && s.value),
      };

      if (files.length) {
        const fd = new FormData();
        fd.append('data', JSON.stringify(payload));
        files.forEach(f => fd.append('images', f));
        if (isEdit) await productsAPI.update(id, fd);
        else await productsAPI.create(fd);
      } else {
        if (isEdit) await productsAPI.update(id, payload);
        else await productsAPI.create(payload);
      }

      toast.success(isEdit ? 'Product updated!' : 'Product created!');
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in">
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">{isEdit ? 'Edit Product' : 'Add New Product'}</div>
          <div className="admin-page-sub">{isEdit ? 'Update product details' : 'Create a new product listing'}</div>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/admin/products')}>← Back</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
          {/* Main Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="admin-card">
              <div className="admin-card-header"><span className="admin-card-title">Basic Information</span></div>
              <div className="admin-card-body">
                <div className="form-group"><label className="form-label">Product Name *</label><input required className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. MikroTik hEX Router RB750Gr3" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group"><label className="form-label">Brand *</label><input required className="form-input" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="e.g. MikroTik" /></div>
                  <div className="form-group"><label className="form-label">SKU</label><input className="form-input" value={form.sku || ''} onChange={e => set('sku', e.target.value)} placeholder="e.g. MT-RB750GR3" /></div>
                </div>
                <div className="form-group"><label className="form-label">Short Description</label><input className="form-input" value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} placeholder="Brief one-line description" /></div>
                <div className="form-group"><label className="form-label">Full Description *</label><textarea required className="form-input" rows={5} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Detailed product description..." /></div>
                <div className="form-group"><label className="form-label">Tags (comma separated)</label><input className="form-input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="router, mikrotik, gigabit" /></div>
              </div>
            </div>

            {/* Pricing */}
            <div className="admin-card">
              <div className="admin-card-header"><span className="admin-card-title">Pricing & Inventory</span></div>
              <div className="admin-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div className="form-group"><label className="form-label">Sale Price (৳) *</label><input required type="number" min="0" className="form-input" value={form.price} onChange={e => set('price', e.target.value)} placeholder="8500" /></div>
                  <div className="form-group"><label className="form-label">Original Price (৳)</label><input type="number" min="0" className="form-input" value={form.originalPrice} onChange={e => set('originalPrice', e.target.value)} placeholder="9500" /></div>
                  <div className="form-group"><label className="form-label">Stock Qty *</label><input required type="number" min="0" className="form-input" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="25" /></div>
                </div>
                <div className="form-group"><label className="form-label">Warranty</label><input className="form-input" value={form.warranty || ''} onChange={e => set('warranty', e.target.value)} placeholder="e.g. 1 Year" /></div>
              </div>
            </div>

            {/* Specifications */}
            <div className="admin-card">
              <div className="admin-card-header">
                <span className="admin-card-title">Specifications</span>
                <button type="button" className="btn btn-outline btn-sm" onClick={addSpec}>+ Add Row</button>
              </div>
              <div className="admin-card-body">
                {form.specifications.map((s, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, marginBottom: 10 }}>
                    <input className="form-input" value={s.key} onChange={e => setSpec(i, 'key', e.target.value)} placeholder="e.g. RAM" />
                    <input className="form-input" value={s.value} onChange={e => setSpec(i, 'value', e.target.value)} placeholder="e.g. 256MB" />
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeSpec(i)} style={{ color: 'var(--accent)' }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Category & Status */}
            <div className="admin-card">
              <div className="admin-card-header"><span className="admin-card-title">Organization</span></div>
              <div className="admin-card-body">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select required className="form-input form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Subcategory</label>
                  <input
                    className="form-input"
                    list="subcategory-options"
                    value={form.subcategory}
                    onChange={e => set('subcategory', e.target.value)}
                    placeholder="Choose existing or type a new one"
                  />
                  <datalist id="subcategory-options">
                    {subOptions.map(s => <option key={s} value={s} />)}
                  </datalist>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 5 }}>
                    Pick from the list or type your own (e.g. Mount / Bracket). Leave blank to auto-detect from the name.
                  </div>
                  {form.category && subByCat[form.category]?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {subByCat[form.category].map(s => (
                        <button
                          type="button"
                          key={s.name}
                          onClick={() => set('subcategory', s.name)}
                          className={form.subcategory === s.name ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                          style={{ fontSize: 11.5, padding: '4px 10px' }}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                  {[['isFeatured', '⭐ Featured Product'], ['isNewArrival', '🆕 Mark as New']].map(([k, label]) => (
                    <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                      <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="admin-card">
              <div className="admin-card-header"><span className="admin-card-title">Product Images</span></div>
              <div className="admin-card-body">
                <div className="form-group">
                  <label className="form-label">Thumbnail URL</label>
                  <input className="form-input" value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)} placeholder="https://..." />
                </div>
                {form.thumbnail && <img src={mediaUrl(form.thumbnail)} alt="" style={{ width: '100%', height: 140, objectFit: 'contain', background: '#f8f9fc', borderRadius: 8, marginBottom: 12, padding: 8 }} />}
                <div className="form-group">
                  <label className="form-label">Upload Images</label>
                  <input type="file" multiple accept="image/*" onChange={handleFiles} className="form-input" style={{ padding: '8px' }} />
                </div>
                {preview.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    {preview.map((p, i) => <img key={i} src={p} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} alt="" />)}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block">
              {loading ? 'Saving...' : isEdit ? '💾 Update Product' : '🚀 Create Product'}
            </button>
            <button type="button" className="btn btn-ghost btn-block" onClick={() => navigate('/admin/products')}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}
