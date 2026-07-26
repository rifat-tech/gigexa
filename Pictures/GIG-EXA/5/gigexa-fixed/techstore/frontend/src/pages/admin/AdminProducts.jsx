import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, categoriesAPI, mediaUrl } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  useEffect(() => { categoriesAPI.getAll().then(r => setCategories(r.data)); }, []);

  const fetch = useCallback(() => {
    setLoading(true);
    productsAPI.getAll({ search, category: catFilter, page, limit: 15 })
      .then(r => { setProducts(r.data.products); setTotal(r.data.total); setPages(r.data.pages); })
      .finally(() => setLoading(false));
  }, [search, catFilter, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await productsAPI.delete(id);
      toast.success('Product deleted');
      fetch();
    } catch { toast.error('Delete failed'); }
  };

  const fmt = p => '৳' + p?.toLocaleString('en-BD');
  const stockClass = s => s === 0 ? 'stock-empty' : s <= 5 ? 'stock-low' : 'stock-ok';

  return (
    <div className="fade-in">
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Products</div>
          <div className="admin-page-sub">{total} total products</div>
        </div>
        <Link to="/admin/products/new" className="btn btn-primary">+ Add Product</Link>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-toolbar">
            <input
              type="text" placeholder="Search products..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="form-input admin-search"
            />
            <select className="form-input form-select" style={{ width: 180 }} value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Loading...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>No products found</td></tr>
                ) : products.map(p => (
                  <tr key={p._id}>
                    <td style={{padding:'18px 16px 18px 20px'}}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <img src={mediaUrl(p.thumbnail) || 'https://via.placeholder.com/56'} alt=""
                          style={{width:56,height:56,objectFit:'contain',borderRadius:12,background:'#F9FAFB',padding:6,border:'1px solid #EAECF0',flexShrink:0}} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color:'#101828', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom:4 }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: '#6B7280', fontWeight:500, marginBottom:2 }}>{p.brand}</div>
                          {p.sku && <div style={{ fontSize: 11, color: '#98A2B3', fontFamily:'monospace' }}>SKU: {p.sku}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{padding:'18px 14px'}}>
                      <span style={{ fontSize: 12, background:'#F9FAFB', padding:'5px 12px', borderRadius:20, border:'1px solid #EAECF0', color:'#344054', fontWeight:500 }}>
                        {p.category?.icon} {p.category?.name}
                      </span>
                    </td>
                    <td style={{padding:'18px 14px'}}>
                      <div style={{ fontWeight: 700, fontSize: 15, color:'#101828' }}>{fmt(p.price)}</div>
                      {p.discount > 0 && <div style={{ fontSize: 11, color: '#059669', marginTop:3, fontWeight:600 }}>-{p.discount}% off</div>}
                    </td>
                    <td style={{padding:'18px 14px'}}>
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: p.stock === 0 ? '#C01048' : p.stock <= 5 ? '#B54708' : '#027A48',
                        background: p.stock === 0 ? '#FFF1F3' : p.stock <= 5 ? '#FFFAEB' : '#ECFDF3',
                        padding:'5px 12px', borderRadius:20, display:'inline-block'
                      }}>{p.stock} units</span>
                    </td>
                    <td style={{padding:'18px 14px'}}>
                      <div style={{display:'flex', flexDirection:'column', gap:6, alignItems:'flex-start'}}>
                        <span className={`status-pill ${p.status === 'active' ? 'status-delivered' : 'status-cancelled'}`}>{p.status}</span>
                        {p.isFeatured && <span style={{background:'#FFF6ED',color:'#B54708',padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:700}}>⭐ Featured</span>}
                      </div>
                    </td>
                    <td style={{padding:'18px 14px'}}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/admin/products/edit/${p._id}`} className="btn btn-outline btn-sm" style={{padding:'7px 14px'}}>✏️ Edit</Link>
                        <button className="btn btn-sm" style={{ background: '#FFF1F3', color: '#C01048', border:'1px solid #FECDD6', padding:'7px 14px', borderRadius:8 }} onClick={() => handleDelete(p._id, p.name)}>🗑️ Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pages > 1 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-light)' }}>
            <div className="pagination">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
              {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
