import { useState, useEffect } from 'react';
import './Dashboard.css';

const API = 'https://azani-server.onrender.com/api/dashboard';
const BW_PRICES = { '4': 1200, '10': 2000, '20': 3500, '25': 4000, '50': 7000 };

const navItems = [
  { icon: '🏠', label: 'Overview', id: 'overview' },
  { icon: '🏫', label: 'Institutions', id: 'institutions' },
  { icon: '💳', label: 'Payments', id: 'payments' },
  { icon: '📡', label: 'Services', id: 'services' },
  { icon: '⚠️', label: 'Defaulters', id: 'defaulters' },
  { icon: '🔌', label: 'Disconnections', id: 'disconnections' },
  { icon: '🖥️', label: 'Infrastructure', id: 'infrastructure' },
  { icon: '📊', label: 'Reports', id: 'reports' },
];

const BW_COLORS = { '4': '#3fc6aa', '10': '#27ae60', '20': '#2ecc71', '25': '#1abc9c', '50': '#16a085' };
const TYPE_COLORS = { primary: '#3fc6aa', junior: '#27ae60', senior: '#2ecc71', college: '#1abc9c' };

function AnimatedCounter({ target, prefix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{prefix}{count.toLocaleString()}</span>;
}

function getStatus(inst) {
  if (!inst.registrationFeePaid) return 'Pending';
  if (inst.serviceActive) return 'Active';
  return 'Disconnected';
}

export default function Dashboard({ institution, onLogout }) {
  const [active, setActive] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [stats, setStats] = useState(null);
  const [bandwidth, setBandwidth] = useState([]);
  const [types, setTypes] = useState([]);
  const [recent, setRecent] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [infrastructure, setInfrastructure] = useState([]);
  const [payments, setPayments] = useState([]);
  const [services, setServices] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [disconnections, setDisconnections] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [ledger, setLedger] = useState(null); // { name, payments[] }

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  // Poll unread count every 15s
  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchCount = () =>
      fetch('https://azani-server.onrender.com/api/orders/unread-count', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json()).then(d => setUnreadCount(d.count || 0)).catch(() => {});
    fetchCount();
    const interval = setInterval(fetchCount, 15000);
    return () => clearInterval(interval);
  }, []);

  const openNotifications = () => {
    const token = localStorage.getItem('token');
    setShowNotif(true);
    fetch('https://azani-server.onrender.com/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(data => setOrders(Array.isArray(data) ? data : [])).catch(() => setOrders([]));
  };

  const markRead = (id) => {
    const token = localStorage.getItem('token');
    fetch(`https://azani-server.onrender.com/api/orders/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    setOrders(orders.map(o => o._id === id ? { ...o, read: true } : o));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  const updateStatus = (id, status) => {
    const token = localStorage.getItem('token');
    fetch(`https://azani-server.onrender.com/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    setOrders(orders.map(o => o._id === id ? { ...o, status, read: true } : o));
  };

  useEffect(() => {
    if (active !== 'overview') return;
    setLoading(true);
    Promise.all([
      fetch(`${API}/stats`).then(r => r.json()),
      fetch(`${API}/bandwidth`).then(r => r.json()),
      fetch(`${API}/types`).then(r => r.json()),
      fetch(`${API}/recent`).then(r => r.json()),
    ]).then(([s, bw, t, rec]) => {
      setStats(s); setBandwidth(bw); setTypes(t); setRecent(rec); setLoading(false);
    }).catch(() => setLoading(false));
  }, [active]);

  useEffect(() => {
    if (active !== 'institutions') return;
    setTabLoading(true);
    fetch(`${API}/institutions`).then(r => r.json()).then(data => { setInstitutions(data); setTabLoading(false); });
  }, [active]);

  useEffect(() => {
    if (active !== 'infrastructure') return;
    setTabLoading(true);
    fetch(`${API}/infrastructure`).then(r => r.json()).then(data => { setInfrastructure(data); setTabLoading(false); });
  }, [active]);

  useEffect(() => {
    if (active !== 'payments') return;
    setTabLoading(true);
    fetch(`${API}/payments`).then(r => r.json()).then(data => { setPayments(data); setTabLoading(false); });
  }, [active]);

  useEffect(() => {
    if (active !== 'services') return;
    setTabLoading(true);
    fetch(`${API}/services`).then(r => r.json()).then(data => { setServices(data); setTabLoading(false); });
  }, [active]);

  useEffect(() => {
    if (active !== 'defaulters') return;
    setTabLoading(true);
    fetch(`${API}/defaulters`).then(r => r.json()).then(data => { setDefaulters(data); setTabLoading(false); });
  }, [active]);

  useEffect(() => {
    if (active !== 'disconnections') return;
    setTabLoading(true);
    fetch(`${API}/disconnections`).then(r => r.json()).then(data => { setDisconnections(data); setTabLoading(false); });
  }, [active]);

  useEffect(() => {
    if (active !== 'reports') return;
    setTabLoading(true);
    fetch(`${API}/reports`).then(r => r.json()).then(data => { setReports(data); setTabLoading(false); });
  }, [active]);

  const activateInstitution = async (id) => {
    const res = await fetch(`${API}/institutions/${id}/activate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationFeePaid: true, serviceActive: true })
    });
    if (res.ok) {
      setRecent(recent.map(r => r._id === id ? { ...r, registrationFeePaid: true, serviceActive: true } : r));
    }
  };

  const toggleActivation = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    const res = await fetch(`${API}/institutions/${id}/activate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationFeePaid: newStatus, serviceActive: newStatus })
    });
    if (res.ok) {
      setRecent(recent.map(r => r._id === id ? { ...r, registrationFeePaid: newStatus, serviceActive: newStatus } : r));
    }
  };

  const statCards = stats ? [
    { label: 'Registered Institutions', value: stats.total, icon: '🏫', color: '#3fc6aa' },
    { label: 'Active Services', value: stats.active, icon: '📡', color: '#27ae60' },
    { label: 'Defaulters', value: stats.defaulters, icon: '⚠️', color: '#e67e22' },
    { label: 'Monthly Revenue', value: stats.monthlyRevenue, icon: '💰', color: '#2ecc71', prefix: 'KSh ' },
  ] : [];

  const totalBw = bandwidth.reduce((s, b) => s + b.count, 0);

  return (
    <div className={`dash-wrapper ${visible ? 'dash-visible' : ''}`}>

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">🌐</span>
          {!collapsed && <span className="logo-text">Azani ISP</span>}
        </div>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '›' : '‹'}
        </button>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button key={item.id} className={`nav-item ${active === item.id ? 'nav-active' : ''}`} onClick={() => setActive(item.id)}>
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
              {active === item.id && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>
        <button className="logout-btn" onClick={onLogout}>
          <span>🚪</span>{!collapsed && <span>Logout</span>}
        </button>
      </aside>

      <main className="dash-main">
        <header className="dash-topbar">
          <div className="topbar-left">
            <h2 className="page-title">{navItems.find(n => n.id === active)?.icon} {navItems.find(n => n.id === active)?.label}</h2>
            <p className="page-subtitle">Welcome back, <strong>{institution?.institutionName || 'Admin'}</strong></p>
          </div>
          <div className="topbar-right">
            <div className="topbar-date">{new Date().toDateString()}</div>
            <div className="bell-wrap" onClick={openNotifications}>
              <span className={`bell-icon ${unreadCount > 0 ? 'bell-shake' : ''}`}>🔔</span>
              {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
            </div>
            <div className="topbar-avatar">{institution?.institutionName?.[0] || 'A'}</div>
          </div>
        </header>

        <div className="dash-content">
          {loading || tabLoading ? (
            <div className="dash-loading"><div className="spinner" /><p>Loading...</p></div>
          ) : (
            <>
              {/* OVERVIEW */}
              {active === 'overview' && (
                <>
                  <div className="stats-grid">
                    {statCards.map((s, i) => (
                      <div className="stat-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="stat-icon" style={{ background: s.color + '22', color: s.color }}>{s.icon}</div>
                        <div className="stat-info">
                          <h3><AnimatedCounter target={s.value} prefix={s.prefix} /></h3>
                          <p>{s.label}</p>
                        </div>
                        <div className="stat-bar">
                          <div className="stat-bar-fill" style={{ background: s.color, width: s.value ? '70%' : '0%' }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="dash-row">
                    <div className="dash-card">
                      <h3 className="card-title">📡 Bandwidth Distribution</h3>
                      {bandwidth.length === 0 ? <p className="no-data">No data</p> : (
                        <div className="bw-list">
                          {bandwidth.map(({ _id, count }) => (
                            <div className="bw-row" key={_id}>
                              <span className="bw-label">{_id} MBPS</span>
                              <div className="bw-bar-bg">
                                <div className="bw-bar-fill" style={{ width: `${totalBw ? (count / totalBw) * 100 : 0}%`, background: BW_COLORS[_id] }} />
                              </div>
                              <span className="bw-pct">{count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="dash-card">
                      <h3 className="card-title">🏫 Institution Types</h3>
                      {types.length === 0 ? <p className="no-data">No data</p> : (
                        <div className="type-list">
                          {types.map(({ _id, count }) => (
                            <div className="type-row" key={_id}>
                              <div className="type-dot" style={{ background: TYPE_COLORS[_id] }} />
                              <span className="type-name" style={{ textTransform: 'capitalize' }}>{_id}</span>
                              <span className="type-count">{count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="dash-card">
                      <h3 className="card-title">📋 Quick Stats</h3>
                      <div className="fee-list">
                        {[
                          ['Total', stats?.total ?? 0, '#3fc6aa'],
                          ['Active', stats?.active ?? 0, '#27ae60'],
                          ['Disconnected', stats?.disconnected ?? 0, '#e74c3c'],
                          ['Defaulters', stats?.defaulters ?? 0, '#e67e22'],
                          ['Revenue', `KSh ${(stats?.monthlyRevenue ?? 0).toLocaleString()}`, '#2ecc71'],
                        ].map(([label, val, color]) => (
                          <div className="fee-row" key={label}>
                            <span className="fee-dot" style={{ background: color }} />
                            <span className="fee-label">{label}</span>
                            <span className="fee-val" style={{ color }}>{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="dash-card table-card">
                    <h3 className="card-title">🕐 Recent Registrations</h3>
                    {recent.length === 0 ? <p className="no-data">No data</p> : (
                      <table className="dash-table">
                        <thead>
                          <tr><th>Institution</th><th>Type</th><th>Bandwidth</th><th>Date</th><th>Payment Submitted</th><th>Registration Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                          {recent.map((inst, i) => (
                            <tr key={inst._id} style={{ animationDelay: `${i * 0.08}s` }}>
                              <td><strong>{inst.institutionName}</strong></td>
                              <td><span className="badge badge-type">{inst.institutionType}</span></td>
                              <td>{inst.currentBandwidth ? `${inst.currentBandwidth} MBPS` : '—'}</td>
                              <td>{new Date(inst.createdAt).toLocaleDateString()}</td>
                              <td>
                                {inst.registrationFeePaid ? (
                                  <span className="badge badge-active">✅ Paid & Submitted</span>
                                ) : inst.registrationPaymentSubmitted ? (
                                  <span className="badge" style={{background:'#fff8e1',color:'#b7610a',border:'1px solid #f0c040'}}>⏳ Pending Review</span>
                                ) : (
                                  <span className="badge badge-defaulter">❌ Not Submitted</span>
                                )}
                              </td>
                              <td>
                                <button 
                                  className={`status-toggle-btn ${inst.registrationFeePaid ? 'active' : 'inactive'}`}
                                  onClick={() => toggleActivation(inst._id, inst.registrationFeePaid)}
                                >
                                  {inst.registrationFeePaid ? '✅ Active' : '❌ Inactive'}
                                </button>
                              </td>
                              <td>
                                {inst.registrationFeePaid ? (
                                  <span style={{color:'#27ae60',fontSize:'0.85rem',fontWeight:600}}>✓ Account Activated</span>
                                ) : inst.registrationPaymentSubmitted ? (
                                  <span style={{color:'#f0c040',fontSize:'0.85rem',fontWeight:600}}>👆 Pending Activation</span>
                                ) : (
                                  <span style={{color:'#aaa',fontSize:'0.8rem'}}>Awaiting Payment</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}

              {/* INSTITUTIONS */}
              {active === 'institutions' && (
                <div className="dash-card table-card">
                  <h3 className="card-title">🏫 All Institutions ({institutions.length})</h3>
                  {institutions.length === 0 ? <p className="no-data">No data</p> : (
                    <table className="dash-table">
                      <thead>
                        <tr><th>#</th><th>Name</th><th>Type</th><th>Contact</th><th>Email</th><th>Phone</th><th>Bandwidth</th><th>Reg Fee</th><th>Service</th><th>Date</th></tr>
                      </thead>
                      <tbody>
                        {institutions.map((inst, i) => (
                          <tr key={inst._id}>
                            <td>{i + 1}</td>
                            <td><strong>{inst.institutionName}</strong></td>
                            <td><span className="badge badge-type">{inst.institutionType}</span></td>
                            <td>{inst.contactPersonName || '—'}</td>
                            <td>{inst.email}</td>
                            <td>{inst.phoneNumber || '—'}</td>
                            <td>{inst.currentBandwidth ? `${inst.currentBandwidth} MBPS` : '—'}</td>
                            <td><span className={`badge ${inst.registrationFeePaid ? 'badge-active' : 'badge-defaulter'}`}>{inst.registrationFeePaid ? 'Paid' : 'Unpaid'}</span></td>
                            <td><span className={`badge ${inst.serviceActive ? 'badge-active' : 'badge-disconnected'}`}>{inst.serviceActive ? 'Active' : 'Inactive'}</span></td>
                            <td>{new Date(inst.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* PAYMENTS */}
              {active === 'payments' && (
                <div className="dash-card table-card">
                  <h3 className="card-title">💳 Payment Records ({payments.length})</h3>
                  {payments.length === 0 ? <p className="no-data">No data</p> : (
                    <table className="dash-table">
                      <thead>
                        <tr><th>#</th><th>Institution</th><th>Type</th><th>Reg Fee</th><th>Install Fee</th><th>Monthly Fee</th><th>Overdue Fine</th><th>Reconnection</th><th>Total Install</th><th>Status</th><th>Ledger</th></tr>
                      </thead>
                      <tbody>
                        {payments.map((p, i) => (
                          <tr key={p._id}>
                            <td>{i + 1}</td>
                            <td><strong>{p.institutionName}</strong></td>
                            <td><span className="badge badge-type">{p.institutionType}</span></td>
                            <td><span className={`badge ${p.registrationFeePaid ? 'badge-active' : 'badge-defaulter'}`}>KSh {p.registrationFee.toLocaleString()}</span></td>
                            <td><span className={`badge ${p.installationFeePaid ? 'badge-active' : 'badge-defaulter'}`}>KSh {p.installationFee.toLocaleString()}</span></td>
                            <td>KSh {p.monthlyFee.toLocaleString()}</td>
                            <td>{p.overdueFine > 0 ? `KSh ${p.overdueFine.toLocaleString()}` : '—'}</td>
                            <td>{p.reconnectionFee > 0 ? <span className="badge badge-defaulter">KSh 1,000</span> : '—'}</td>
                            <td>KSh {p.totalInstallation.toLocaleString()}</td>
                            <td><span className={`badge ${p.serviceActive ? 'badge-active' : 'badge-disconnected'}`}>{p.serviceActive ? 'Active' : 'Inactive'}</span></td>
                            <td>
                              <button className="notif-status-btn" onClick={() => {
                                fetch(`${API}/payment-history/${p._id}`)
                                  .then(r => r.json())
                                  .then(data => setLedger({ name: p.institutionName, payments: Array.isArray(data) ? data : [] }));
                              }}>View 📊</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* SERVICES */}
              {active === 'services' && (
                <div className="dash-card table-card">
                  <h3 className="card-title">📡 Service Status ({services.length})</h3>
                  {services.length === 0 ? <p className="no-data">No data</p> : (
                    <table className="dash-table">
                      <thead>
                        <tr><th>#</th><th>Institution</th><th>Type</th><th>Bandwidth</th><th>Monthly Fee</th><th>Reg Fee</th><th>Install Fee</th><th>Monthly Paid</th><th>Service</th></tr>
                      </thead>
                      <tbody>
                        {services.map((s, i) => (
                          <tr key={s._id}>
                            <td>{i + 1}</td>
                            <td><strong>{s.institutionName}</strong></td>
                            <td><span className="badge badge-type">{s.institutionType}</span></td>
                            <td>{s.currentBandwidth ? `${s.currentBandwidth} MBPS` : '—'}</td>
                            <td>KSh {(BW_PRICES[s.currentBandwidth] || 0).toLocaleString()}</td>
                            <td><span className={`badge ${s.registrationFeePaid ? 'badge-active' : 'badge-defaulter'}`}>{s.registrationFeePaid ? '✅' : '❌'}</span></td>
                            <td><span className={`badge ${s.installationFeePaid ? 'badge-active' : 'badge-defaulter'}`}>{s.installationFeePaid ? '✅' : '❌'}</span></td>
                            <td><span className={`badge ${s.monthlyFeePaid ? 'badge-active' : 'badge-defaulter'}`}>{s.monthlyFeePaid ? '✅' : '❌'}</span></td>
                            <td><span className={`badge ${s.serviceActive ? 'badge-active' : 'badge-disconnected'}`}>{s.serviceActive ? 'Active' : 'Inactive'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* DEFAULTERS */}
              {active === 'defaulters' && (
                <div className="dash-card table-card">
                  <h3 className="card-title">⚠️ Defaulters ({defaulters.length})</h3>
                  {defaulters.length === 0 ? <p className="no-data">No defaulters</p> : (
                    <table className="dash-table">
                      <thead>
                        <tr><th>#</th><th>Institution</th><th>Type</th><th>Email</th><th>Phone</th><th>Bandwidth</th><th>Monthly Fee</th><th>Overdue Fine (15%)</th><th>Total Due</th></tr>
                      </thead>
                      <tbody>
                        {defaulters.map((d, i) => (
                          <tr key={d._id}>
                            <td>{i + 1}</td>
                            <td><strong>{d.institutionName}</strong></td>
                            <td><span className="badge badge-type">{d.institutionType}</span></td>
                            <td>{d.email}</td>
                            <td>{d.phoneNumber}</td>
                            <td>{d.currentBandwidth} MBPS</td>
                            <td>KSh {d.monthlyFee.toLocaleString()}</td>
                            <td className="text-danger">KSh {d.overdueFine.toLocaleString()}</td>
                            <td><strong>KSh {(d.monthlyFee + d.overdueFine).toLocaleString()}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* DISCONNECTIONS */}
              {active === 'disconnections' && (
                <div className="dash-card table-card">
                  <h3 className="card-title">🔌 Disconnected Services ({disconnections.length})</h3>
                  {disconnections.length === 0 ? <p className="no-data">No disconnections</p> : (
                    <table className="dash-table">
                      <thead>
                        <tr><th>#</th><th>Institution</th><th>Type</th><th>Email</th><th>Phone</th><th>Bandwidth</th><th>Reconnection Fee</th><th>Needs Reconnection</th><th>Disconnected On</th></tr>
                      </thead>
                      <tbody>
                        {disconnections.map((d, i) => (
                          <tr key={d._id}>
                            <td>{i + 1}</td>
                            <td><strong>{d.institutionName}</strong></td>
                            <td><span className="badge badge-type">{d.institutionType}</span></td>
                            <td>{d.email}</td>
                            <td>{d.phoneNumber}</td>
                            <td>{d.currentBandwidth ? `${d.currentBandwidth} MBPS` : '—'}</td>
                            <td>KSh 1,000</td>
                            <td><span className={`badge ${d.needsReconnection ? 'badge-defaulter' : 'badge-active'}`}>{d.needsReconnection ? '⚠️ Pending' : '✅ Paid'}</span></td>
                            <td>{d.disconnectedAt ? new Date(d.disconnectedAt).toLocaleDateString() : new Date(d.updatedAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* INFRASTRUCTURE */}
              {active === 'infrastructure' && (
                <div className="dash-card table-card">
                  <h3 className="card-title">🖥️ Infrastructure ({infrastructure.length})</h3>
                  {infrastructure.length === 0 ? <p className="no-data">No data</p> : (
                    <table className="dash-table">
                      <thead>
                        <tr><th>#</th><th>Institution</th><th>Type</th><th>Users</th><th>Computers</th><th>Comp Cost</th><th>LAN Nodes</th><th>LAN Cost</th><th>Has LAN</th><th>Ready</th></tr>
                      </thead>
                      <tbody>
                        {infrastructure.map((inst, i) => {
                          const compCost = (inst.computersPurchased || 0) * 40000;
                          const nodes = inst.lanNodesPurchased || 0;
                          const lanCost = nodes === 0 ? 0 : nodes <= 10 ? 10000 : nodes <= 20 ? 20000 : nodes <= 40 ? 30000 : 40000;
                          return (
                            <tr key={inst._id}>
                              <td>{i + 1}</td>
                              <td><strong>{inst.institutionName}</strong></td>
                              <td><span className="badge badge-type">{inst.institutionType || '—'}</span></td>
                              <td>{inst.numberOfUsers || <span className="no-data-cell">—</span>}</td>
                              <td>{inst.computersPurchased || <span className="no-data-cell">—</span>}</td>
                              <td>{compCost > 0 ? `KSh ${compCost.toLocaleString()}` : '—'}</td>
                              <td>{nodes || <span className="no-data-cell">—</span>}</td>
                              <td>{lanCost > 0 ? `KSh ${lanCost.toLocaleString()}` : '—'}</td>
                              <td><span className={`badge ${inst.hasLAN ? 'badge-active' : 'badge-disconnected'}`}>{inst.hasLAN ? 'Yes' : 'No'}</span></td>
                              <td><span className={`badge ${inst.isReadyForConnectivity ? 'badge-active' : 'badge-defaulter'}`}>{inst.isReadyForConnectivity ? '✅' : '❌'}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* REPORTS */}
              {active === 'reports' && reports && (
                <>
                  <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    <div className="stat-card">
                      <div className="stat-icon" style={{ background: '#3fc6aa22', color: '#3fc6aa' }}>📊</div>
                      <div className="stat-info">
                        <h3>{reports.allCount}</h3>
                        <p>Total Institutions</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon" style={{ background: '#27ae6022', color: '#27ae60' }}>💰</div>
                      <div className="stat-info">
                        <h3>KSh {reports.totalInstallation.toLocaleString()}</h3>
                        <p>Total Installation Revenue</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon" style={{ background: '#1abc9c22', color: '#1abc9c' }}>⚡</div>
                      <div className="stat-info">
                        <h3>KSh {reports.totalUpgradeRevenue.toFixed(0).toLocaleString()}</h3>
                        <p>Potential Upgrade Revenue</p>
                      </div>
                    </div>
                  </div>

                  <div className="dash-card table-card">
                    <h3 className="card-title">📊 Report by Institution Type</h3>
                    <table className="dash-table">
                      <thead>
                        <tr><th>Type</th><th>Count</th><th>Monthly Total</th><th>Fines Total</th><th>Reconnection Total</th><th>Grand Total</th></tr>
                      </thead>
                      <tbody>
                        {Object.entries(reports.byType).map(([type, data]) => (
                          <tr key={type}>
                            <td><span className="badge badge-type" style={{ textTransform: 'capitalize' }}>{type}</span></td>
                            <td>{data.count}</td>
                            <td>KSh {data.monthlyTotal.toLocaleString()}</td>
                            <td>KSh {data.finesTotal.toFixed(0).toLocaleString()}</td>
                            <td>KSh {data.reconnectionTotal.toLocaleString()}</td>
                            <td><strong>KSh {(data.monthlyTotal + data.finesTotal + data.reconnectionTotal).toFixed(0).toLocaleString()}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* NOTIFICATIONS PANEL */}
      {showNotif && (
        <div className="notif-overlay" onClick={e => e.target.classList.contains('notif-overlay') && setShowNotif(false)}>
          <div className="notif-panel">
            <div className="notif-header">
              <div className="notif-title">
                <span>🔔</span>
                <h3>Notifications</h3>
                {unreadCount > 0 && <span className="notif-count">{unreadCount} new</span>}
              </div>
              <button className="notif-close" onClick={() => setShowNotif(false)}>✕</button>
            </div>

            <div className="notif-list">
              {orders.length === 0 ? (
                <div className="notif-empty">
                  <span>📢</span>
                  <p>No notifications yet</p>
                </div>
              ) : orders.map((order, i) => (
                <div
                  key={order._id}
                  className={`notif-item ${!order.read ? 'notif-unread' : ''}`}
                  style={{ animationDelay: `${i * 0.06}s` }}
                  onClick={() => !order.read && markRead(order._id)}
                >
                  <div className="notif-item-icon">📡</div>
                  <div className="notif-item-body">
                    <div className="notif-item-title">
                      <strong>{order.institutionName}</strong>
                      {!order.read && <span className="notif-dot" />}
                    </div>
                    <p>Ordered <strong>{order.bandwidth} MBPS</strong> — KSh {order.discountedFee?.toLocaleString()}/mo</p>
                    <div className="notif-item-meta">
                      <span>📞 {order.phoneNumber || '—'}</span>
                      <span>✉️ {order.email || '—'}</span>
                      <span>🏫 {order.institutionType}</span>
                    </div>
                    <div className="notif-status-row">
                      <span className="notif-time">{new Date(order.createdAt).toLocaleString()}</span>
                      <div className="notif-status-btns">
                        {['pending','contacted','visited','installed'].map(s => (
                          <button
                            key={s}
                            className={`notif-status-btn ${order.status === s ? 'notif-status-active' : ''}`}
                            onClick={e => { e.stopPropagation(); updateStatus(order._id, s); }}
                          >
                            {s === 'pending' ? '🕒' : s === 'contacted' ? '📞' : s === 'visited' ? '🏫' : '✅'} {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* LEDGER MODAL */}
      {ledger && (
        <div className="notif-overlay" onClick={e => e.target.classList.contains('notif-overlay') && setLedger(null)}>
          <div className="notif-panel" style={{ maxWidth: 640 }}>
            <div className="notif-header">
              <div className="notif-title">
                <span>📋</span>
                <h3>Payment Ledger — {ledger.name}</h3>
              </div>
              <button className="notif-close" onClick={() => setLedger(null)}>✕</button>
            </div>
            <div className="notif-list" style={{ padding: '0 16px 16px' }}>
              {ledger.payments.length === 0 ? (
                <p style={{ color: '#888', textAlign: 'center', padding: 24 }}>No payment records found.</p>
              ) : (
                <table className="dash-table">
                  <thead><tr><th>#</th><th>Type</th><th>Amount</th><th>Method</th><th>Month</th><th>Date</th></tr></thead>
                  <tbody>
                    {ledger.payments.map((p, i) => (
                      <tr key={p._id}>
                        <td>{i + 1}</td>
                        <td><span className="badge badge-type" style={{ textTransform: 'capitalize' }}>{p.reference === 'overdue-fine' ? 'Overdue Fine' : p.type}</span></td>
                        <td><strong>KSh {p.amount.toLocaleString()}</strong></td>
                        <td style={{ textTransform: 'capitalize' }}>{p.method}</td>
                        <td>{p.month || '—'}</td>
                        <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
