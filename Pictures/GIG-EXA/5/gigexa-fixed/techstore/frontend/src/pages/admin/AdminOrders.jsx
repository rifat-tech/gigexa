import React, { useState, useEffect, useCallback } from 'react';
import { ordersAPI, mediaUrl } from '../../services/api';
import toast from 'react-hot-toast';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    ordersAPI.getAll({ status: statusFilter, page, limit: 15 })
      .then(r => { setOrders(r.data.orders); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [statusFilter, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleStatus = async (id, status) => {
    try {
      await ordersAPI.updateStatus(id, status);
      toast.success('Status updated');
      fetch();
      if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
    } catch { toast.error('Update failed'); }
  };

  const handlePayment = async (id, paymentStatus) => {
    try {
      await ordersAPI.updatePayment(id, paymentStatus);
      toast.success('Payment marked ' + paymentStatus);
      fetch();
      if (selected?._id === id) setSelected(prev => ({ ...prev, paymentStatus }));
    } catch { toast.error('Update failed'); }
  };

  const fmt = p => '৳' + (p || 0).toLocaleString('en-BD');
  const fmtDate = d => new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="fade-in">
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Orders</div>
          <div className="admin-page-sub">{total} total orders</div>
        </div>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', ...STATUSES].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`}
            style={{ textTransform: 'capitalize' }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 20, alignItems: 'start' }}>
        <div className="admin-card">
          <div className="table-wrap">
            {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Loading...</div> : (
              <table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>No orders found</td></tr>
                  ) : orders.map(o => (
                    <tr key={o._id} style={{ cursor: 'pointer' }} onClick={() => setSelected(o)}>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 13, color: '#2563EB', fontWeight: 700 }}>{o.orderNumber}</span></td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{o.guestInfo?.name || '—'}</div>
                        <div style={{ fontSize: 12, color: '#6B7280' }}>{o.guestInfo?.phone}</div>
                      </td>
                      <td style={{ fontSize: 13 }}>{fmtDate(o.createdAt)}</td>
                      <td><span className="price" style={{ fontSize: 14 }}>{fmt(o.total)}</span></td>
                      <td><span style={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 700, background: '#F9FAFB', padding: '2px 8px', borderRadius: 4 }}>{o.paymentMethod}</span></td>
                      <td><span className={`status-pill status-${o.status}`}>{o.status}</span></td>
                      <td onClick={e => e.stopPropagation()}>
                        <select
                          className="form-input form-select"
                          style={{ width: 140, fontSize: 12, padding: '5px 28px 5px 8px' }}
                          value={o.status}
                          onChange={e => handleStatus(o._id, e.target.value)}
                        >
                          {STATUSES.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Order Detail Panel */}
        {selected && (
          <div className="admin-card" style={{ position: 'sticky', top: 20 }}>
            <div className="admin-card-header">
              <div>
                <span className="admin-card-title">Order {selected.orderNumber}</span>
                <span className={`status-pill status-${selected.status}`} style={{ marginLeft: 10 }}>{selected.status}</span>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="admin-card-body" style={{ maxHeight: 600, overflowY: 'auto' }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase' }}>Customer</div>
                <div style={{ fontSize: 14 }}><strong>{selected.guestInfo?.name}</strong></div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>{selected.guestInfo?.phone}</div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>{selected.guestInfo?.email}</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase' }}>Delivery Address</div>
                <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                  {selected.shippingAddress?.street}, {selected.shippingAddress?.city},<br />
                  {selected.shippingAddress?.district} {selected.shippingAddress?.zip}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase' }}>Items</div>
                {selected.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                    {item.thumbnail && <img src={mediaUrl(item.thumbnail)} style={{ width: 40, height: 40, objectFit: 'contain', background: '#f8f9fc', borderRadius: 6, padding: 3 }} alt="" />}
                    <div style={{ flex: 1, fontSize: 13 }}>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ color: '#6B7280' }}>Qty: {item.quantity}</div>
                    </div>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13 }}>{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}><span>Subtotal</span><span>{fmt(selected.subtotal)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}><span>Shipping</span><span>{selected.shippingCost === 0 ? 'Free' : fmt(selected.shippingCost)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, borderTop: '1px solid #E5E7EB', paddingTop: 8 }}>
                  <span>Total</span><span style={{ color: '#2563EB', fontFamily: 'monospace' }}>{fmt(selected.total)}</span>
                </div>
              </div>
              {selected.notes && <div style={{ marginTop: 12, padding: 10, background: '#F9FAFB', borderRadius: 8, fontSize: 13, color: 'var(--mid)' }}>📝 {selected.notes}</div>}

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Update Status</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {STATUSES.map(s => (
                    <button key={s} className={`btn btn-sm ${selected.status === s ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ textTransform: 'capitalize', fontSize: 12 }}
                      onClick={() => handleStatus(selected._id, s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                  Payment
                  <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase',
                    color: selected.paymentStatus === 'paid' ? '#027A48' : selected.paymentStatus === 'failed' ? '#C01048' : '#B54708',
                    background: selected.paymentStatus === 'paid' ? '#ECFDF3' : selected.paymentStatus === 'failed' ? '#FFF1F3' : '#FFFAEB' }}>
                    {selected.paymentStatus || 'pending'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['pending', 'paid', 'failed'].map(s => (
                    <button key={s} className={`btn btn-sm ${selected.paymentStatus === s ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ textTransform: 'capitalize', fontSize: 12 }}
                      onClick={() => handlePayment(selected._id, s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
