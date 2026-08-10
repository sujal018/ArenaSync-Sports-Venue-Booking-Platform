import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AdminPortal({ user, showNotification }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, users, bookings, commission
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOwners: 0,
    totalTurfs: 0,
    totalBookings: 0,
    paidBookings: 0,
    totalRevenue: 0,
    platformCommission: 0,
    ownerShare: 0,
    commissionRate: '10.0'
  });

  const [newCommission, setNewCommission] = useState('');
  const [updatingComm, setUpdatingComm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const systemStats = await api.admin.getStats();
      setStats(systemStats);
      setNewCommission(systemStats.commissionRate);

      const userList = await api.admin.getUsers();
      setUsers(userList);

      const bookingList = await api.admin.getBookings();
      setBookings(bookingList);
    } catch (err) {
      showNotification("Failed to fetch administrative data", "error");
    }
  };

  const handleUpdateCommission = async (e) => {
    e.preventDefault();
    if (!newCommission || isNaN(newCommission)) {
      showNotification("Please enter a valid rate percentage", "error");
      return;
    }

    setUpdatingComm(true);
    try {
      await api.admin.updateCommission(parseFloat(newCommission).toFixed(1));
      showNotification("Platform commission rate updated successfully", "success");
      fetchData();
    } catch (err) {
      showNotification(err.message || "Failed to update commission", "error");
    } finally {
      setUpdatingComm(false);
    }
  };

  const handleToggleUserStatus = async (targetUser) => {
    const nextStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`Are you sure you want to change status of ${targetUser.name} to "${nextStatus}"?`)) return;

    try {
      await api.admin.setUserStatus(targetUser.id, nextStatus);
      showNotification(`User account is now ${nextStatus}`, "success");
      fetchData();
    } catch (err) {
      showNotification(err.message || "Operation failed", "error");
    }
  };

  return (
    <div>
      {/* Sub navigation tabs */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('dashboard'); fetchData(); }}
        >
          <i className="fa-solid fa-chart-pie"></i> Executive Overview
        </button>
        <button 
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('users'); fetchData(); }}
        >
          <i className="fa-solid fa-users-gear"></i> Users Control ({users.length})
        </button>
        <button 
          className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('bookings'); fetchData(); }}
        >
          <i className="fa-solid fa-money-bill-transfer"></i> Transaction Ledger ({bookings.length})
        </button>
        <button 
          className={`btn ${activeTab === 'commission' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('commission'); fetchData(); }}
        >
          <i className="fa-solid fa-sliders"></i> Platform Commission Setup
        </button>
      </div>

      {activeTab === 'dashboard' && (
        /* ADMIN METRIC CARDS */
        <div>
          <div className="dashboard-grid">
            <div className="glass-panel stat-card">
              <div className="stat-icon indigo">
                <i className="fa-solid fa-user-group"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Platform Customers</span>
                <span className="stat-value">{stats.totalCustomers}</span>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon amber">
                <i className="fa-solid fa-house-laptop"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Registered Owners</span>
                <span className="stat-value">{stats.totalOwners}</span>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon green">
                <i className="fa-solid fa-file-invoice-dollar"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Gross Platform Volume</span>
                <span className="stat-value">${Number(stats.totalRevenue).toFixed(2)}</span>
              </div>
            </div>

            <div className="glass-panel stat-card" style={{ border: '1px solid rgba(16, 185, 129, 0.4)' }}>
              <div className="stat-icon green" style={{ background: 'rgba(16, 185, 129, 0.25)' }}>
                <i className="fa-solid fa-gem"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Platform Fees Collected ({stats.commissionRate}%)</span>
                <span className="stat-value" style={{ color: 'var(--accent-primary)' }}>${Number(stats.platformCommission).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', flexWrap: 'wrap' }} className="detail-layout">
            <div className="glass-panel">
              <h3>Turf Arena Breakdown</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>Total properties listing services: {stats.totalTurfs}</p>
              
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-chart-simple" style={{ fontSize: '2.5rem', marginBottom: '12px', color: 'var(--accent-secondary)' }}></i>
                <p>Database reports active operations across all venues. System status is normal.</p>
              </div>
            </div>

            <div className="glass-panel">
              <h3>Owner Payout Distributions</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>Funds allocated to turf properties</p>
              <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Customer Bookings Paid:</span>
                  <span>{stats.paidBookings}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Gross Platform Volume:</span>
                  <span>${Number(stats.totalRevenue).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--accent-rose)' }}>
                  <span>Platform Fees Retained:</span>
                  <span>-${Number(stats.platformCommission).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', fontWeight: 'bold' }}>
                  <span>Funds Sent to Owners:</span>
                  <span style={{ color: 'var(--accent-amber)' }}>${Number(stats.ownerShare).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        /* USER CONTROL CENTER */
        <div className="glass-panel">
          <h2>User Accounts Registry</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Toggle status controls to suspend or activate accounts of Customers and Turf Owners</p>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Profile Name</th>
                  <th>Registered Email</th>
                  <th>System Role</th>
                  <th>Registry Date</th>
                  <th>Account Status</th>
                  <th>Operations</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-admin' : u.role === 'owner' ? 'badge-owner' : 'badge-customer'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.createdAt ? u.createdAt.substring(0, 10) : 'N/A'}</td>
                    <td>
                      <span className={`badge ${u.status === 'active' ? 'badge-customer' : 'badge-admin'}`} style={{ textTransform: 'none' }}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      {u.role !== 'admin' ? (
                        <button 
                          className={`btn ${u.status === 'active' ? 'btn-danger' : 'btn-primary'}`}
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => handleToggleUserStatus(u)}
                        >
                          {u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>System Level</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        /* TRANSACTION LEDGER */
        <div className="glass-panel">
          <h2>System Transaction Ledger</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>System-wide financial reporting on fee splits, base prices and booking details</p>

          <div className="table-responsive">
            {bookings.length > 0 ? (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Invoice / ID</th>
                    <th>Customer</th>
                    <th>Sports Arena</th>
                    <th>Date & Time</th>
                    <th>Gross Paid</th>
                    <th>Platform Fee</th>
                    <th>Owner Share</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{b.transactionId || `TXN_${b.id}`}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.customer ? b.customer.name : 'Deleted'}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.customer ? b.customer.email : ''}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{b.turf.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Owner: {b.turf.owner ? b.turf.owner.name : 'N/A'}</div>
                      </td>
                      <td>
                        <div>{b.slot.date}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.slot.startTime.substring(0, 5)} - {b.slot.endTime.substring(0, 5)}</div>
                      </td>
                      <td style={{ fontWeight: '600' }}>${b.totalAmount}</td>
                      <td style={{ color: 'var(--accent-primary)', fontWeight: '500' }}>+${b.platformCommission}</td>
                      <td style={{ color: 'var(--accent-amber)' }}>${b.ownerShare}</td>
                      <td>
                        <span className={`badge ${b.status === 'confirmed' ? 'badge-customer' : 'badge-admin'}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <p>No bookings completed on the platform yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'commission' && (
        /* COMMISSION CONTROL PANEL */
        <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2>Platform commission control</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Configure the fee percentage retained by the platform for all booking sales. This is applied instantly during the checkout phase.</p>

          <form onSubmit={handleUpdateCommission}>
            <div className="form-group" style={{ marginBottom: '30px' }}>
              <label className="form-label">Active Commission Rate (%)</label>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="10.0"
                  step="0.1"
                  min="0.0"
                  max="100.0"
                  value={newCommission}
                  onChange={(e) => setNewCommission(e.target.value)}
                  required
                />
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>%</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={updatingComm}>
              {updatingComm ? (
                <span><i className="fa-solid fa-spinner fa-spin"></i> Saving changes...</span>
              ) : (
                <span>Update Commission Rate <i className="fa-solid fa-save"></i></span>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
