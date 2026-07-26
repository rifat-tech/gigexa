import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { productsAPI, categoriesAPI } from '../services/api';
import './Products.css';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-rating', label: 'Top Rated' },
  { value: '-sold', label: 'Best Selling' },
];

const BRANDS = ['ASUS', 'Lenovo', 'Dell', 'HP', 'Acer', 'Apple', 'MikroTik', 'Cisco', 'Cudy', 'Starlink', 'Rapoo', 'Cooler Master', 'Lexar', 'Brother', 'Realview', 'Blisbond', 'Hohem'];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [facets, setFacets] = useState({ categories: {}, brands: {} });
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const featured = searchParams.get('featured') || '';

  useEffect(() => {
    categoriesAPI.getAll().then(r => setCategories(r.data));
    productsAPI.getFacets().then(r => setFacets(r.data)).catch(() => {});
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    productsAPI.getAll({ search, category, brand, subcategory, sort, featured, page, limit: 20 })
      .then(r => { setProducts(r.data.products); setTotal(r.data.total); setPages(r.data.pages); })
      .finally(() => setLoading(false));
  }, [search, category, brand, subcategory, sort, featured, page]);

  useEffect(() => { setPage(1); }, [search, category, brand, subcategory, sort, featured]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    // changing category or brand invalidates the current subcategory
    if (key === 'category' || key === 'brand') p.delete('subcategory');
    // Sidebar browse filters clear any leftover text search, so results and the
    // sidebar counts always stay in sync (no "count says 1 but shows 0" mismatch).
    if (key === 'category' || key === 'brand' || key === 'subcategory') p.delete('search');
    setSearchParams(p);
  };
  const clearFilters = () => setSearchParams({});
  const hasFilters = search || category || brand || featured || subcategory;

  const currentCat = categories.find(c => c._id === category);

  return (
    <div className="page">
      <Navbar />
      {/* Page Header */}
      <div className="products-page-header">
        <div className="container">
          <div className="breadcrumb">
            <a href="/">Home</a> <span>/</span>
            {currentCat ? <><a href="/products">Products</a><span>/</span><span>{currentCat.name}</span></> : <span>All Products</span>}
            {brand && <><span>/</span><span>{brand}</span></>}
            {search && <><span>/</span><span>"{search}"</span></>}
          </div>
          <h1>{search ? `Search: "${search}"` : brand ? `${brand} Products` : currentCat ? currentCat.name : featured ? 'Hot Deals' : 'All Products'}</h1>
          <p>{total} product{total !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      <div className="container products-layout">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>Filter By</h3>
            {hasFilters && <button className="btn btn-sm btn-outline" onClick={clearFilters}>Clear All</button>}
          </div>

          <div className="filter-section">
            <h4>Category</h4>
            <label className="filter-radio">
              <input type="radio" name="cat" checked={!category} onChange={() => setParam('category', '')} />
              <span>All Categories</span>
            </label>
            {categories.map(c => (
              <React.Fragment key={c._id}>
                <label className="filter-radio">
                  <input type="radio" name="cat" checked={category === c._id} onChange={() => setParam('category', c._id)} />
                  <span>{c.icon} {c.name}</span>
                </label>
                {category === c._id && (facets.categories?.[c._id]?.length > 0) && (
                  <div className="filter-sub">
                    {facets.categories[c._id].map(s => (
                      <label key={s.name} className="filter-radio filter-sub-item">
                        <input type="radio" name="subcat" checked={subcategory === s.name} onChange={() => setParam('subcategory', subcategory === s.name ? '' : s.name)} />
                        <span>{s.name} <em>({s.count})</em></span>
                      </label>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="filter-section">
            <h4>Brand</h4>
            <label className="filter-radio">
              <input type="radio" name="brand" checked={!brand} onChange={() => setParam('brand', '')} />
              <span>All Brands</span>
            </label>
            {BRANDS.map(b => (
              <React.Fragment key={b}>
                <label className="filter-radio">
                  <input type="radio" name="brand" checked={brand === b} onChange={() => setParam('brand', b === brand ? '' : b)} />
                  <span>{b}</span>
                </label>
                {brand === b && (facets.brands?.[b]?.length > 0) && (
                  <div className="filter-sub">
                    {facets.brands[b].map(s => (
                      <label key={s.name} className="filter-radio filter-sub-item">
                        <input type="radio" name="subcat" checked={subcategory === s.name} onChange={() => setParam('subcategory', subcategory === s.name ? '' : s.name)} />
                        <span>{s.name} <em>({s.count})</em></span>
                      </label>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="filter-section">
            <h4>Availability</h4>
            <label className="filter-radio">
              <input type="radio" name="avail" checked={!featured} onChange={() => setParam('featured', '')} />
              <span>All Products</span>
            </label>
            <label className="filter-radio">
              <input type="radio" name="avail" checked={featured === 'true'} onChange={() => setParam('featured', 'true')} />
              <span>🔥 Hot Deals</span>
            </label>
          </div>
        </aside>

        {/* Main */}
        <main className="products-main">
          {/* Toolbar */}
          <div className="products-toolbar">
            <button className="btn btn-outline btn-sm filter-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰ Filters
            </button>
            {hasFilters && (
              <div className="active-tags">
                {search && <span className="active-tag">"{search}" <button onClick={() => setParam('search', '')}>×</button></span>}
                {category && currentCat && <span className="active-tag">{currentCat.name} <button onClick={() => setParam('category', '')}>×</button></span>}
                {brand && <span className="active-tag">{brand} <button onClick={() => setParam('brand', '')}>×</button></span>}
                {subcategory && <span className="active-tag">{subcategory} <button onClick={() => setParam('subcategory', '')}>×</button></span>}
                {featured && <span className="active-tag">Hot Deals <button onClick={() => setParam('featured', '')}>×</button></span>}
              </div>
            )}
            <div className="toolbar-right">
              <span className="results-count">{total} items</span>
              <select className="form-input form-select sort-select" value={sort} onChange={e => setParam('sort', e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid-products">
              {Array(12).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 340 }} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 56 }}>🔍</div>
              <h3>No products found</h3>
              <p style={{ color: 'var(--muted)', marginTop: 6 }}>Try adjusting your filters or search terms</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <div className="grid-products">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          {pages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹ Prev</button>
              {Array.from({ length: Math.min(pages, 8) }, (_, i) => i + 1).map(p => (
                <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Next ›</button>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
