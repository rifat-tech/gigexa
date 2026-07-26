import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, ordersAPI, mediaUrl } from '../../services/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#6C47FF', '#8B5CF6', '#06B6D4', '#10B981'];

// ===== MONTHLY CALENDAR COMPONENT =====
function MonthlyCalendar({ allOrders, fmt }) {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // First day of month and total days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  // Build daily data map
  const dailyData = useMemo(() => {
    const map = {};
    allOrders.forEach(o => {
      const d = new Date(o.createdAt);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        if (!map[day]) map[day] = { orders: [], revenue: 0, count: 0 };
        map[day].orders.push(o);
        if (o.status !== 'cancelled') map[day].revenue += o.total || 0;
        map[day].count += 1;
      }
    });
    return map;
  }, [allOrders, month, year]);

  const maxRevenue = Math.max(...Object.values(dailyData).map(d => d.revenue), 1);

  const handleDateClick = (day) => {
    const dateStr = new Date(year, month, day).toDateString();
    setSelectedDate(day);
    const orders = allOrders.filter(o => new Date(o.createdAt).toDateString() === dateStr);
    setSelectedOrders(orders);
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div style={{marginBottom:24}}>
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <div className="admin-card-title">📅 Monthly Order Calendar</div>
            <div style={{fontSize:12,color:'#98A2B3',marginTop:2}}>Click any date to see order details</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <button onClick={prevMonth} style={{width:32,height:32,borderRadius:8,border:'1px solid #EAECF0',background:'white',cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>
            <span style={{fontSize:14,fontWeight:700,color:'#101828',minWidth:160,textAlign:'center'}}>{monthName}</span>
            <button onClick={nextMonth} style={{width:32,height:32,borderRadius:8,border:'1px solid #EAECF0',background:'white',cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>
          </div>
        </div>

        <div style={{padding:20}}>
          {/* Day headers */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:8}}>
            {DAYS.map(d => (
              <div key={d} style={{textAlign:'center',fontSize:11,fontWeight:700,color:'#98A2B3',padding:'6px 0',textTransform:'uppercase',letterSpacing:'.5px'}}>{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4}}>
            {/* Empty cells for first day offset */}
            {Array(firstDay).fill(null).map((_, i) => <div key={`e-${i}`} />)}

            {/* Day cells */}
            {Array.from({length: daysInMonth}, (_, i) => i + 1).map(day => {
              const data = dailyData[day];
              const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
              const isSelected = selectedDate === day;
              const hasOrders = data && data.count > 0;
              const intensity = hasOrders ? Math.max(0.1, data.revenue / maxRevenue) : 0;

              return (
                <div key={day}
                  onClick={() => handleDateClick(day)}
                  style={{
                    borderRadius:10,
                    padding:'8px 6px',
                    textAlign:'center',
                    cursor:'pointer',
                    position:'relative',
                    border: isSelected ? '2px solid #6C47FF' : isToday ? '2px solid #06B6D4' : '1px solid #EAECF0',
                    background: isSelected ? '#F4F3FF' : hasOrders ? `rgba(108,71,255,${intensity * 0.15})` : 'white',
                    transition:'all .15s',
                    minHeight:70,
                    display:'flex',
                    flexDirection:'column',
                    alignItems:'center',
                    gap:4,
                  }}
                >
                  {/* Day number */}
                  <div style={{
                    width:26,height:26,borderRadius:'50%',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:13,fontWeight: isToday || isSelected ? 800 : 500,
                    background: isToday ? '#06B6D4' : isSelected ? '#6C47FF' : 'transparent',
                    color: isToday || isSelected ? 'white' : '#344054',
                    flexShrink:0,
                  }}>{day}</div>

                  {/* Order indicator */}
                  {hasOrders && (
                    <>
                      <div style={{fontSize:10,fontWeight:700,color:'#6C47FF'}}>{data.count} order{data.count > 1 ? 's' : ''}</div>
                      <div style={{fontSize:9,color:'#667085',fontWeight:500}}>{fmt(data.revenue)}</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{display:'flex',alignItems:'center',gap:20,marginTop:16,paddingTop:12,borderTop:'1px solid #F2F4F7',flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#667085'}}>
              <div style={{width:16,height:16,borderRadius:4,border:'2px solid #06B6D4'}}/> Today
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#667085'}}>
              <div style={{width:16,height:16,borderRadius:4,border:'2px solid #6C47FF',background:'#F4F3FF'}}/> Selected
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#667085'}}>
              <div style={{width:16,height:16,borderRadius:4,background:'rgba(108,71,255,0.15)',border:'1px solid #EAECF0'}}/> Has Orders
            </div>
          </div>
        </div>
      </div>

      {/* Selected Date Detail Panel */}
      {selectedDate && (
        <div className="admin-card" style={{marginTop:16}}>
          <div className="admin-card-header">
            <div>
              <div className="admin-card-title">
                📋 Orders on {new Date(year, month, selectedDate).toLocaleDateString('en-BD', {weekday:'long', day:'numeric', month:'long', year:'numeric'})}
              </div>
              <div style={{fontSize:12,color:'#98A2B3',marginTop:2}}>
                {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} &nbsp;·&nbsp;
                Total: {fmt(selectedOrders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+(o.total||0),0))}
              </div>
            </div>
            <button onClick={() => {setSelectedDate(null);setSelectedOrders([]);}}
              style={{width:32,height:32,borderRadius:8,border:'1px solid #EAECF0',background:'white',cursor:'pointer',fontSize:18,color:'#98A2B3'}}>×</button>
          </div>

          {selectedOrders.length === 0 ? (
            <div style={{textAlign:'center',padding:'40px',color:'#98A2B3',fontSize:13}}>No orders on this date</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrders.map(o => (
                    <tr key={o._id}>
                      <td><span style={{fontFamily:'monospace',fontSize:12,fontWeight:700,color:'#6C47FF'}}>{o.orderNumber}</span></td>
                      <td>
                        <div style={{fontWeight:600,fontSize:13,color:'#101828'}}>{o.guestInfo?.name || '—'}</div>
                        <div style={{fontSize:11,color:'#98A2B3'}}>{o.guestInfo?.phone}</div>
                      </td>
                      <td>
                        <div style={{fontSize:12,color:'#667085'}}>
                          {o.items?.map(i => i.name).join(', ').slice(0,40)}
                          {o.items?.reduce((s,i)=>s+i.quantity,0)} item{o.items?.reduce((s,i)=>s+i.quantity,0) !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td><span style={{fontWeight:700,color:'#101828'}}>{fmt(o.total)}</span></td>
                      <td><span style={{background:'#F4F3FF',color:'#6C47FF',padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,textTransform:'uppercase'}}>{o.paymentMethod}</span></td>
                      <td><span className={`status-pill status-${o.status}`}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary row */}
              <div style={{padding:'14px 20px',background:'#F9FAFB',borderTop:'1px solid #EAECF0',display:'flex',gap:24,flexWrap:'wrap'}}>
                <div style={{fontSize:13,color:'#667085'}}>Total Orders: <strong style={{color:'#101828'}}>{selectedOrders.length}</strong></div>
                <div style={{fontSize:13,color:'#667085'}}>Gross Revenue: <strong style={{color:'#027A48'}}>{fmt(selectedOrders.reduce((s,o)=>s+(o.total||0),0))}</strong></div>
                <div style={{fontSize:13,color:'#667085'}}>Cancelled: <strong style={{color:'#C01048'}}>{selectedOrders.filter(o=>o.status==='cancelled').length}</strong></div>
                <div style={{fontSize:13,color:'#667085'}}>Net Revenue: <strong style={{color:'#6C47FF'}}>{fmt(selectedOrders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+(o.total||0),0))}</strong></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
// ===== END MONTHLY CALENDAR =====


const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{background:'white',border:'1px solid #EAECF0',borderRadius:10,padding:'10px 14px',boxShadow:'0 4px 12px rgba(0,0,0,.1)'}}>
        <p style={{fontWeight:700,color:'#101828',marginBottom:4,fontSize:13}}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{fontSize:12,color:p.color,fontWeight:600}}>
            {p.name}: {p.name === 'Revenue' ? '৳' + p.value.toLocaleString() : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function buildChartData(orders, mode) {
  if (!orders || orders.length === 0) {
    if (mode === 'Daily') return Array(7).fill(0).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return { label: d.toLocaleDateString('en-US', {weekday:'short', day:'numeric'}), revenue: 0, orders: 0 };
    });
    if (mode === 'Monthly') return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => ({ label: m, revenue: 0, orders: 0 }));
    return [{ label: new Date().getFullYear().toString(), revenue: 0, orders: 0 }];
  }

  if (mode === 'Daily') {
    return Array(7).fill(0).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const label = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      const dateStr = d.toDateString();
      const dayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === dateStr);
      return { label, revenue: dayOrders.reduce((s, o) => s + (o.total || 0), 0), orders: dayOrders.length };
    });
  }
  if (mode === 'Monthly') {
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((month, i) => {
      const monthOrders = orders.filter(o => new Date(o.createdAt).getMonth() === i);
      return { label: month, revenue: monthOrders.reduce((s, o) => s + (o.total || 0), 0), orders: monthOrders.length };
    });
  }
  if (mode === 'Yearly') {
    const years = {};
    orders.forEach(o => {
      const y = new Date(o.createdAt).getFullYear();
      if (!years[y]) years[y] = { revenue: 0, orders: 0 };
      years[y].revenue += o.total || 0;
      years[y].orders += 1;
    });
    return Object.entries(years).sort().map(([y, v]) => ({ label: y, ...v }));
  }
  return [];
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState('Monthly');
  const [profitMode, setProfitMode] = useState('Month');

  useEffect(() => {
    Promise.all([
      dashboardAPI.stats(),
      ordersAPI.getAll({ limit: 1000 })
    ]).then(([s, o]) => {
      setStats(s.data);
      setAllOrders(o.data.orders || []);
    }).finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => buildChartData(allOrders, chartMode), [allOrders, chartMode]);
  const fmt = p => '৳' + (p || 0).toLocaleString('en-BD');

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300,flexDirection:'column',gap:16}}>
      <div style={{width:40,height:40,border:'3px solid #EDE9FE',borderTopColor:'#7C3AED',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
      <span style={{color:'#98A2B3',fontSize:13}}>Loading dashboard...</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const orderStatusData = [
    { name: 'Delivered', value: stats?.recentOrders?.filter(o=>o.status==='delivered').length || 0 },
    { name: 'Pending', value: stats?.recentOrders?.filter(o=>o.status==='pending').length || 0 },
    { name: 'Processing', value: stats?.recentOrders?.filter(o=>o.status==='processing').length || 0 },
    { name: 'Cancelled', value: stats?.recentOrders?.filter(o=>o.status==='cancelled').length || 0 },
  ].filter(d => d.value > 0);

  const pieData = orderStatusData.length > 0 ? orderStatusData : [{ name: 'No Orders', value: 1 }];

  // Profit calculation from orders
  const calcProfit = (mode) => {
    if (!allOrders.length) return { purchase: 0, sales: 0, profit: 0 };
    const todayStrP = new Date().toLocaleDateString('en-BD', { timeZone: 'Asia/Dhaka' });
    const nowP = new Date();
    const filtered = allOrders.filter(o => {
      if (o.status === 'cancelled') return false;
      const d = new Date(o.createdAt);
      const dStr = d.toLocaleDateString('en-BD', { timeZone: 'Asia/Dhaka' });
      if (mode === 'Day') return dStr === todayStrP;
      if (mode === 'Month') return d.getMonth() === nowP.getMonth() && d.getFullYear() === nowP.getFullYear();
      return true;
    });
    const sales = filtered.reduce((s, o) => s + (o.total || 0), 0);
    const purchase = Math.round(sales * 0.72);
    return { purchase, sales, profit: sales - purchase };
  };

  const STAT_CARDS = [
    { label: 'Total Revenue', value: fmt(stats?.revenue), icon: '💰', iconBg: '#ECFDF3', sub: 'All time revenue' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '🛒', iconBg: '#EFF8FF', sub: 'Customer orders' },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: '📦', iconBg: '#F4F3FF', sub: 'Active listings' },
    { label: 'Customers', value: stats?.totalUsers || 0, icon: '👥', iconBg: '#FFF6ED', sub: 'Registered users' },
  ];

  // Per day count - using proper date comparison
  const toLocalDate = (d) => new Date(d).toLocaleDateString('en-BD', { timeZone: 'Asia/Dhaka' });
  const todayStr = new Date().toLocaleDateString('en-BD', { timeZone: 'Asia/Dhaka' });
  const yesterdayDate = new Date(); yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toLocaleDateString('en-BD', { timeZone: 'Asia/Dhaka' });
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const nowMonth = new Date().getMonth();
  const nowYear = new Date().getFullYear();

  const todayOrders = allOrders.filter(o => toLocalDate(o.createdAt) === todayStr);
  const yesterdayOrders = allOrders.filter(o => toLocalDate(o.createdAt) === yesterdayStr);
  const thisWeekOrders = allOrders.filter(o => new Date(o.createdAt) >= weekAgo);
  const thisMonthOrders = allOrders.filter(o => {
    const d = new Date(o.createdAt);
    return d.getMonth() === nowMonth && d.getFullYear() === nowYear;
  });

  const tabStyle = (active) => ({
    padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
    background: active ? '#6C47FF' : 'transparent',
    color: active ? 'white' : '#667085',
    transition: 'all .15s',
  });

  return (
    <div className="fade-in">

      {/* Stat Cards */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:16, marginBottom:16}}>
        {STAT_CARDS.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">{s.label}</span>
              <div className="stat-card-icon" style={{background: s.iconBg}}>{s.icon}</div>
            </div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-footer"><span>{s.sub}</span></div>
          </div>
        ))}

        {/* PROFIT CARD */}
        <div className="stat-card" style={{borderTop:'3px solid #6C47FF'}}>
          <div className="stat-card-header">
            <span className="stat-card-label">NET PROFIT</span>
            <div className="stat-card-icon" style={{background:'#F4F3FF'}}>📈</div>
          </div>
          <div style={{display:'flex',gap:3,background:'#F9FAFB',padding:3,borderRadius:8,marginBottom:12,border:'1px solid #EAECF0'}}>
            {['Day','Month','Year'].map(m => (
              <button key={m} onClick={() => setProfitMode(m)} style={{
                flex:1, padding:'4px 0', borderRadius:6, fontSize:11, fontWeight:600,
                cursor:'pointer', border:'none',
                background: profitMode === m ? '#6C47FF' : 'transparent',
                color: profitMode === m ? 'white' : '#667085',
                transition:'all .15s'
              }}>{m}</button>
            ))}
          </div>
          {(() => {
            const { purchase, sales, profit } = calcProfit(profitMode);
            return (
              <>
                <div style={{fontSize:22,fontWeight:800,color: profit >= 0 ? '#027A48' : '#C01048',letterSpacing:'-0.5px',marginBottom:8}}>
                  {fmt(profit)}
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#667085'}}>
                    <span>🛒 Purchase</span>
                    <span style={{fontWeight:600,color:'#C01048'}}>{fmt(purchase)}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#667085'}}>
                    <span>💵 Sales</span>
                    <span style={{fontWeight:600,color:'#027A48'}}>{fmt(sales)}</span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Per Day Count Row */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24}}>
        {[
          { label: 'Today', count: todayOrders.length, revenue: fmt(todayOrders.reduce((s,o)=>s+(o.total||0),0)), color: '#6C47FF', bg: '#F4F3FF', icon: '📅' },
          { label: 'Yesterday', count: yesterdayOrders.length, revenue: fmt(yesterdayOrders.reduce((s,o)=>s+(o.total||0),0)), color: '#06B6D4', bg: '#ECFEFF', icon: '📆' },
          { label: 'This Week', count: thisWeekOrders.length, revenue: fmt(thisWeekOrders.reduce((s,o)=>s+(o.total||0),0)), color: '#8B5CF6', bg: '#F5F3FF', icon: '🗓️' },
          { label: 'This Month', count: thisMonthOrders.length, revenue: fmt(thisMonthOrders.reduce((s,o)=>s+(o.total||0),0)), color: '#10B981', bg: '#ECFDF5', icon: '📊' },
        ].map((item, i) => (
          <div key={i} style={{background:'white',borderRadius:12,padding:'16px 20px',border:'1px solid #EAECF0',display:'flex',alignItems:'center',gap:16,boxShadow:'0 1px 4px rgba(16,24,40,.04)'}}>
            <div style={{width:48,height:48,borderRadius:12,background:item.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>
              {item.icon}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,fontWeight:700,color:'#98A2B3',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:4}}>{item.label}</div>
              <div style={{display:'flex',alignItems:'baseline',gap:8,flexWrap:'wrap'}}>
                <span style={{fontSize:24,fontWeight:800,color:item.color,letterSpacing:'-0.5px'}}>{item.count}</span>
                <span style={{fontSize:11,color:'#667085',fontWeight:500}}>orders</span>
              </div>
              <div style={{fontSize:12,color:'#667085',marginTop:3,fontWeight:500}}>{item.revenue} revenue</div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Calendar Chart */}
      <MonthlyCalendar allOrders={allOrders} fmt={fmt} />

      {/* Charts Row */}
      <div className="charts-grid">

        {/* Line Chart with tabs */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <div className="admin-card-title">Revenue & Orders Overview</div>
              <div style={{fontSize:12,color:'#98A2B3',marginTop:2}}>
                {chartMode === 'Daily' ? 'Last 7 days' : chartMode === 'Monthly' ? 'This year by month' : 'All years'}
              </div>
            </div>
            <div style={{display:'flex',gap:4,background:'#F9FAFB',padding:4,borderRadius:10,border:'1px solid #EAECF0'}}>
              {['Daily','Monthly','Yearly'].map(m => (
                <button key={m} style={tabStyle(chartMode === m)} onClick={() => setChartMode(m)}>{m}</button>
              ))}
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{top:5,right:20,left:0,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7"/>
                <XAxis dataKey="label" tick={{fontSize:11,fill:'#98A2B3'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:'#98A2B3'}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip />}/>
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#6C47FF" strokeWidth={2.5} dot={{fill:'#6C47FF',r:3}} activeDot={{r:5}}/>
                <Line type="monotone" dataKey="orders" name="Orders" stroke="#06B6D4" strokeWidth={2.5} dot={{fill:'#06B6D4',r:3}} activeDot={{r:5}}/>
              </LineChart>
            </ResponsiveContainer>
            <div style={{display:'flex',gap:16,justifyContent:'center',marginTop:8}}>
              <span style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:'#667085'}}>
                <span style={{width:10,height:10,borderRadius:'50%',background:'#6C47FF',display:'inline-block'}}/>Revenue
              </span>
              <span style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:'#667085'}}>
                <span style={{width:10,height:10,borderRadius:'50%',background:'#06B6D4',display:'inline-block'}}/>Orders
              </span>
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <div className="admin-card-title">Order Status</div>
              <div style={{fontSize:12,color:'#98A2B3',marginTop:2}}>Distribution overview</div>
            </div>
          </div>
          <div className="chart-wrapper" style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{position:'relative',display:'inline-block'}}>
              <PieChart width={200} height={200}>
                <Pie data={pieData} cx={95} cy={95} innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Pie>
              </PieChart>
              <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',textAlign:'center'}}>
                <div style={{fontSize:22,fontWeight:800,color:'#101828'}}>{stats?.totalOrders || 0}</div>
                <div style={{fontSize:11,color:'#98A2B3',fontWeight:500}}>Total</div>
              </div>
            </div>
            <div style={{width:'100%',marginTop:16,display:'flex',flexDirection:'column',gap:8}}>
              {orderStatusData.length > 0 ? orderStatusData.map((item, i) => (
                <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:13}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{width:10,height:10,borderRadius:'50%',background:COLORS[i],display:'inline-block',flexShrink:0}}/>
                    <span style={{color:'#667085'}}>{item.name}</span>
                  </div>
                  <span style={{fontWeight:700,color:'#101828'}}>{item.value}</span>
                </div>
              )) : (
                <p style={{textAlign:'center',color:'#98A2B3',fontSize:12}}>No orders yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:20,alignItems:'start'}}>

        {/* Recent Orders */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <div className="admin-card-title">Recent Orders</div>
              <div style={{fontSize:12,color:'#98A2B3',marginTop:2}}>Latest customer transactions</div>
            </div>
            <Link to="/admin/orders" className="btn btn-outline btn-sm">View All →</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.length > 0 ? stats.recentOrders.map(o => (
                  <tr key={o._id}>
                    <td style={{padding:'16px 14px 16px 20px'}}>
                      <span style={{fontFamily:'monospace',fontSize:12,fontWeight:700,color:'#6C47FF',background:'#F4F3FF',padding:'4px 10px',borderRadius:6,display:'inline-block'}}>{o.orderNumber}</span>
                      <div style={{fontSize:11,color:'#98A2B3',marginTop:4}}>{new Date(o.createdAt).toLocaleDateString('en-BD',{day:'2-digit',month:'short',year:'numeric'})}</div>
                    </td>
                    <td style={{padding:'16px 14px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#6C47FF,#8B5CF6)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:14,flexShrink:0}}>
                          {(o.guestInfo?.name || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{fontWeight:600,fontSize:13,color:'#101828',marginBottom:3}}>{o.guestInfo?.name || '—'}</div>
                          <div style={{fontSize:12,color:'#98A2B3'}}>{o.guestInfo?.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:'16px 14px'}}>
                      <div style={{fontWeight:700,fontSize:15,color:'#101828'}}>{fmt(o.total)}</div>
                      <div style={{fontSize:11,color:'#98A2B3',marginTop:3}}>{o.items?.length || 0} item(s)</div>
                    </td>
                    <td style={{padding:'16px 14px'}}>
                      <span style={{background:'#F4F3FF',color:'#6C47FF',padding:'5px 12px',borderRadius:20,fontSize:12,fontWeight:700,textTransform:'uppercase'}}>{o.paymentMethod}</span>
                    </td>
                    <td style={{padding:'16px 14px'}}>
                      <span className={`status-pill status-${o.status}`} style={{fontSize:12,padding:'5px 12px'}}>{o.status}</span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} style={{textAlign:'center',color:'#98A2B3',padding:'48px',fontSize:13}}>No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="admin-card-title">⚠️ Low Stock</div>
              <Link to="/admin/products" className="btn btn-outline btn-sm">Manage</Link>
            </div>
            <div className="admin-card-body" style={{padding:'12px 16px'}}>
              {stats?.lowStock?.length > 0 ? stats.lowStock.map(p => (
                <div key={p._id} className="low-stock-item">
                  <img src={mediaUrl(p.thumbnail)} alt="" className="low-stock-img" onError={e => e.target.src='https://via.placeholder.com/40'}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div className="low-stock-name">{p.name}</div>
                    <div style={{fontSize:11,marginTop:2}}>
                      <span className={p.stock === 0 ? 'stock-empty' : 'stock-low'}>{p.stock === 0 ? '❌ Out of Stock' : `⚠️ ${p.stock} left`}</span>
                    </div>
                  </div>
                </div>
              )) : <div style={{textAlign:'center',color:'#98A2B3',padding:'20px 0',fontSize:13}}>✅ All products well stocked</div>}
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header"><div className="admin-card-title">Quick Summary</div></div>
            <div className="admin-card-body" style={{padding:'12px 16px'}}>
              {[
                { label: 'Categories', value: stats?.categories || 0, icon: '🏷️', bg: '#F4F3FF' },
                { label: 'Active Products', value: stats?.totalProducts || 0, icon: '📦', bg: '#ECFDF3' },
                { label: 'Pending Orders', value: allOrders.filter(o=>o.status==='pending').length || 0, icon: '⏳', bg: '#FFF6ED' },
              ].map((item, i) => (
                <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:i<2?'1px solid #F2F4F7':'none'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:34,height:34,background:item.bg,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>{item.icon}</div>
                    <span style={{fontSize:13,color:'#344054',fontWeight:500}}>{item.label}</span>
                  </div>
                  <span style={{fontSize:18,fontWeight:800,color:'#101828'}}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-links-grid">
        {[
          { to:'/admin/products/new', icon:'➕', label:'Add Product', sub:'Create new listing', bg:'#EFF8FF' },
          { to:'/admin/orders', icon:'📋', label:'Manage Orders', sub:'Update order status', bg:'#ECFDF3' },
          { to:'/admin/categories', icon:'🏷️', label:'Categories', sub:'Manage categories', bg:'#F4F3FF' },
          { to:'/', icon:'🏪', label:'View Store', sub:'Open storefront', bg:'#FFF6ED' },
        ].map((q,i) => (
          <Link key={i} to={q.to} className="quick-link-card">
            <div className="quick-link-icon" style={{background:q.bg}}>{q.icon}</div>
            <div><div className="quick-link-title">{q.label}</div><div className="quick-link-sub">{q.sub}</div></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
