import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const NAV_GROUPS = [
  {
    label: 'Main Menu',
    items: [
      { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
      { to: '/admin/products', label: 'Products', icon: '📦' },
      { to: '/admin/orders', label: 'Orders', icon: '🛒' },
      { to: '/admin/categories', label: 'Categories', icon: '🏷️' },
      { to: '/admin/messages', label: 'Messages', icon: '💬' },
    ]
  },
  {
    label: 'Store',
    items: [
      { to: '/', label: 'View Store', icon: '🏪', external: true },
    ]
  }
];

const PAGE_TITLES = {
  '/admin': { title: 'Dashboard', sub: "Welcome back! Here's your store overview." },
  '/admin/products': { title: 'Products', sub: 'Manage your product catalog' },
  '/admin/orders': { title: 'Orders', sub: 'View and manage customer orders' },
  '/admin/categories': { title: 'Categories', sub: 'Manage product categories' },
  '/admin/products/new': { title: 'Add New Product', sub: 'Create a new product listing' },
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'Admin Panel', sub: 'GIGEXA' };

  return (
    <div className={`admin-shell ${collapsed ? 'collapsed' : ''}`}>
      {/* ===== SIDEBAR ===== */}
      <aside className="admin-sidebar">

        {/* Logo */}
        <div className="admin-logo">
          <div className="admin-logo-icon">
            <svg width="20" height="20" viewBox="0 0 680 320" fill="none">
              <text x="340" y="220" textAnchor="middle"
                style={{fill:'white',fontFamily:'Arial Black',fontSize:'240px',fontWeight:900}}>GX</text>
            </svg>
          </div>
          {!collapsed && (
            <div className="admin-logo-text">
              <span className="admin-logo-name">GIGEXA</span>
              <span className="admin-logo-sub">Admin Panel</span>
            </div>
          )}
        </div>

        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '›' : '‹'}
        </button>

        {/* Nav Groups */}
        <nav className="admin-nav">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi}>
              {!collapsed && <div className="admin-nav-section">{group.label}</div>}
              {group.items.map(item => (
                item.external ? (
                  <button key={item.to} className="admin-nav-link"
                    onClick={() => navigate(item.to)}
                    title={collapsed ? item.label : ''}>
                    <span className="nav-icon">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                ) : (
                  <NavLink key={item.to} to={item.to} end={item.end}
                    className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    title={collapsed ? item.label : ''}>
                    <span className="nav-icon">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                )
              ))}
            </div>
          ))}
        </nav>

        {/* User + Actions */}
        <div className="admin-sidebar-bottom">
          {!collapsed && (
            <div className="admin-user">
              <div className="admin-user-avatar">{user?.name[0]?.toUpperCase()}</div>
              <div style={{flex:1, minWidth:0}}>
                <div className="admin-user-name" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.name}</div>
                <div className="admin-user-role">Administrator</div>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{display:'flex',justifyContent:'center',marginBottom:8}}>
              <div className="admin-user-avatar">{user?.name[0]?.toUpperCase()}</div>
            </div>
          )}
          <div className="sidebar-action-btns">
            <button onClick={() => { logout(); navigate('/login'); }}>
              🚪 {!collapsed && 'Logout'}
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="admin-main">
        {/* Top Bar */}
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <div className="admin-topbar-title">{pageInfo.title}</div>
            <div className="admin-topbar-sub">{pageInfo.sub}</div>
          </div>
          <div className="admin-topbar-right">
            <div className="topbar-search">
              🔍 <span>Search anything...</span>
            </div>
            <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#6C47FF,#8B5CF6)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:14,cursor:'pointer'}}>
              {user?.name[0]?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
