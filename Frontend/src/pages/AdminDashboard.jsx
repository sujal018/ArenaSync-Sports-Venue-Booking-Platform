import React, { useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { turfApi } from '../api/turfApi';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [turfs, setTurfs] = useState([]);
  const [defaultCommission, setDefaultCommission] = useState(10);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [turfStatusFilter, setTurfStatusFilter] = useState('ALL');

  // Turf Custom Commission Edit Modal State
  const [selectedTurfForCommission, setSelectedTurfForCommission] = useState(null);
  const [commissionInput, setCommissionInput] = useState('10');
  const [submittingCommission, setSubmittingCommission] = useState(false);

  // Global Default Commission Modal State
  const [showGlobalFeeModal, setShowGlobalFeeModal] = useState(false);
  const [globalFeeInput, setGlobalFeeInput] = useState('10');
  const [submittingGlobalFee, setSubmittingGlobalFee] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      try {
        const stats = await authApi.getAdminDashboard();
        setDashboardData(stats);
      } catch (err) {
        console.error('Admin dashboard stats API error:', err);
        setDashboardData(null);
      }

      try {
        const defFee = await authApi.getDefaultCommission();
        setDefaultCommission(defFee ?? 10);
        setGlobalFeeInput(String(defFee ?? 10));
      } catch (err) {
        console.warn('Default commission API note:', err);
      }

      try {
        const userList = await authApi.getAllUsers();
        setUsers(Array.isArray(userList) ? userList : []);
      } catch (err) {
        console.error('Admin user list API error:', err);
        setUsers([]);
      }

      try {
        const turfList = await turfApi.getAllTurfs();
        const list = Array.isArray(turfList)
          ? turfList
          : (turfList?.content || turfList?.data || turfList?.turfs || []);
        setTurfs(list);
      } catch (err) {
        console.error('Admin turf list API error:', err);
        setTurfs([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userObj) => {
    const currentStatus = String(userObj.status || 'ACTIVE').toUpperCase();
    const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await authApi.updateUserStatus(userObj.email, newStatus);
      setUsers((prev) => prev.map((u) => (u.id === userObj.id ? { ...u, status: newStatus } : u)));
      toast.success(`User ${userObj.firstName || userObj.name || userObj.email} status set to ${newStatus}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleToggleTurfStatus = async (turfObj) => {
    const currentStatus = String(turfObj.status || 'APPROVED').toUpperCase();
    const newStatus = currentStatus === 'APPROVED' ? 'SUSPENDED' : 'APPROVED';
    try {
      await turfApi.updateTurfStatus(turfObj.id, newStatus);
      setTurfs((prev) => prev.map((t) => (t.id === turfObj.id ? { ...t, status: newStatus } : t)));
      toast.success(`Turf status set to ${newStatus}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update turf status');
    }
  };

  const handleOpenCommissionModal = (turfObj) => {
    setSelectedTurfForCommission(turfObj);
    setCommissionInput(turfObj.customCommissionPercentage ?? defaultCommission);
  };

  const handleSaveCommission = async (e) => {
    e.preventDefault();
    if (!selectedTurfForCommission) return;

    setSubmittingCommission(true);
    try {
      const perc = parseFloat(commissionInput);
      await turfApi.updateTurfCommission(selectedTurfForCommission.id, perc);
      toast.success(`Platform commission for ${selectedTurfForCommission.turfName || selectedTurfForCommission.name} set to ${perc}%!`);
      setTurfs((prev) =>
        prev.map((t) => (t.id === selectedTurfForCommission.id ? { ...t, customCommissionPercentage: perc } : t))
      );
      setSelectedTurfForCommission(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update commission percentage');
    } finally {
      setSubmittingCommission(false);
    }
  };

  const handleSaveGlobalFee = async (e) => {
    e.preventDefault();
    setSubmittingGlobalFee(true);
    try {
      const perc = parseFloat(globalFeeInput);
      await authApi.updateDefaultCommission(perc);
      toast.success(`Global default platform commission set to ${perc}%!`);
      setDefaultCommission(perc);
      setShowGlobalFeeModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update global default fee');
    } finally {
      setSubmittingGlobalFee(false);
    }
  };

  if (loading) return <Loader message="Loading platform executive metrics..." />;

  const stats = dashboardData || {};
  const totalUsers = stats.totalUsers ?? users.length;
  const totalCustomers = stats.totalCustomers ?? users.filter(u => u.role === 'CUSTOMER').length;
  const totalOwners = stats.totalOwners ?? users.filter(u => u.role === 'OWNER').length;
  const totalTurfs = stats.totalTurfs ?? turfs.length;
  const activeTurfs = stats.activeTurfs ?? turfs.filter(t => (t.status || '').toUpperCase() === 'APPROVED').length;
  const totalRevenue = stats.totalRevenue ?? 0;
  
  // Read totalPlatformCommission from backend DashboardResponseDto
  const platformCommission = stats.totalPlatformCommission ?? stats.platformCommission ?? (totalRevenue * (defaultCommission / 100));

  return (
    <div className="container py-4">
      {/* Title */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="badge bg-warning text-dark px-3 py-1 rounded-pill mb-1">
            <i className="bi bi-shield-lock-fill me-1"></i> Executive Portal
          </span>
          <h3 className="fw-bold text-dark mb-0">Platform Admin Dashboard</h3>
        </div>

        {/* Global Default Fee Configuration Button */}
        <button
          className="btn btn-outline-emerald rounded-pill px-4"
          onClick={() => setShowGlobalFeeModal(true)}
        >
          <i className="bi bi-percent me-1"></i> Default Platform Fee: <strong>{defaultCommission}%</strong>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-5">
        <div className="col-md-3 col-sm-6">
          <div className="card border-0 shadow-sm glass-card p-4">
            <span className="text-muted small fw-semibold">Total Users</span>
            <h3 className="fw-bold text-dark mb-0 mt-1">{totalUsers}</h3>
            <span className="small text-muted mt-1">{totalCustomers} Customers | {totalOwners} Owners</span>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card border-0 shadow-sm glass-card p-4">
            <span className="text-muted small fw-semibold">Total Listed Turfs</span>
            <h3 className="fw-bold text-dark mb-0 mt-1">{totalTurfs}</h3>
            <span className="small text-emerald fw-semibold mt-1">{activeTurfs} Approved Venues</span>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card border-0 shadow-sm glass-card p-4">
            <span className="text-muted small fw-semibold">Platform Gross Sales</span>
            <h3 className="fw-bold text-emerald mb-0 mt-1">₹{Number(totalRevenue).toLocaleString()}</h3>
            <span className="small text-muted mt-1">Overall Bookings Volume</span>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card border-0 shadow-sm glass-card p-4">
            <span className="text-muted small fw-semibold">Platform Commission</span>
            <h3 className="fw-bold text-primary mb-0 mt-1">₹{Number(platformCommission).toLocaleString()}</h3>
            <span className="small text-muted mt-1">Net Platform Earnings ({defaultCommission}% Cut)</span>
          </div>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="d-flex gap-2 mb-3">
        <button
          className={`btn rounded-pill px-4 ${activeTab === 'users' ? 'btn-emerald' : 'btn-outline-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          <i className="bi bi-people me-1"></i> User Management ({users.length})
        </button>
        <button
          className={`btn rounded-pill px-4 ${activeTab === 'turfs' ? 'btn-emerald' : 'btn-outline-secondary'}`}
          onClick={() => setActiveTab('turfs')}
        >
          <i className="bi bi-grid me-1"></i> Turf Arenas ({turfs.length})
        </button>
      </div>

      {/* Users Table Tab */}
      {activeTab === 'users' && (
        <div className="card border-0 shadow-sm glass-card p-4">
          <h5 className="fw-bold text-dark mb-3">Registered Users & Owners</h5>
          {users.length === 0 ? (
            <p className="text-muted text-center py-4">No users found in database.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light">
                  <tr>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="fw-bold text-dark">
                        {u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (u.name || u.email)}
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phoneNumber || u.phone || 'N/A'}</td>
                      <td>
                        <span className={`badge ${u.role === 'OWNER' ? 'bg-primary' : 'bg-dark'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.status === 'ACTIVE' ? 'bg-success' : 'bg-danger'}`}>
                          {u.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm rounded-pill px-3 ${u.status === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          onClick={() => handleToggleUserStatus(u)}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend / Block' : 'Activate Account'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Turfs Table Tab */}
      {activeTab === 'turfs' && (
        <div className="card border-0 shadow-sm glass-card p-4">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-3 gap-2">
            <h5 className="fw-bold text-dark mb-0">All Platform Turf Venues & Fee Structure</h5>
            <div className="d-flex gap-2">
              <select
                className="form-select form-select-sm fw-bold rounded-pill text-dark border-emerald"
                style={{ width: '180px' }}
                value={turfStatusFilter}
                onChange={(e) => setTurfStatusFilter(e.target.value)}
              >
                <option value="ALL">📋 All Statuses ({turfs.length})</option>
                <option value="APPROVED">✅ Approved ({turfs.filter((t) => (t.status || 'APPROVED').toUpperCase() === 'APPROVED').length})</option>
                <option value="SUSPENDED">⚠️ Suspended ({turfs.filter((t) => (t.status || '').toUpperCase() === 'SUSPENDED').length})</option>
                <option value="PENDING">⏳ Pending ({turfs.filter((t) => (t.status || '').toUpperCase() === 'PENDING').length})</option>
              </select>
              <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={fetchAdminData}>
                <i className="bi bi-arrow-clockwise me-1"></i> Refresh
              </button>
            </div>
          </div>

          {turfs.length === 0 ? (
            <p className="text-muted text-center py-4">No turf arenas found in database.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Arena Name</th>
                    <th>City</th>
                    <th>Owner</th>
                    <th>Price / hr</th>
                    <th>Platform Fee %</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {turfs
                    .filter((t) => {
                      const st = (t.status || 'APPROVED').toUpperCase();
                      if (turfStatusFilter === 'APPROVED') return st === 'APPROVED';
                      if (turfStatusFilter === 'SUSPENDED') return st === 'SUSPENDED';
                      if (turfStatusFilter === 'PENDING') return st === 'PENDING';
                      return true;
                    })
                    .map((t) => {
                      const statusUpper = (t.status || 'APPROVED').toUpperCase();
                      const isApproved = statusUpper === 'APPROVED';
                      const isSuspended = statusUpper === 'SUSPENDED';
                      const feePercentage = t.customCommissionPercentage ?? defaultCommission;
                      const isCustom = t.customCommissionPercentage !== null && t.customCommissionPercentage !== undefined;

                      return (
                        <tr key={t.id} className={isSuspended ? 'table-warning' : ''}>
                          <td className="fw-bold text-dark">{t.turfName || t.name}</td>
                          <td>{t.city || t.location || 'N/A'}</td>
                          <td>{t.ownerName || 'Arena Owner'}</td>
                          <td className="fw-semibold text-emerald">₹{t.basePrice ?? t.pricePerHour}/hr</td>
                          <td>
                            <span className={`badge px-3 py-2 border ${isCustom ? 'bg-primary bg-opacity-10 text-primary' : 'bg-secondary bg-opacity-10 text-secondary'}`}>
                              {feePercentage}% {isCustom ? '(Custom)' : '(Default)'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              isApproved ? 'bg-success' : isSuspended ? 'bg-warning text-dark' : 'bg-secondary'
                            }`}>
                              {statusUpper}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-outline-primary btn-sm rounded-pill px-3"
                                onClick={() => handleOpenCommissionModal(t)}
                              >
                                <i className="bi bi-percent me-1"></i> Edit Fee %
                              </button>

                              <button
                                className={`btn btn-sm rounded-pill px-3 ${isApproved ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                onClick={() => handleToggleTurfStatus(t)}
                              >
                                {isApproved ? 'Suspend' : 'Approve'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Specific Turf Fee Modal */}
      {selectedTurfForCommission && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Set Custom Platform Fee Percentage</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedTurfForCommission(null)}></button>
              </div>
              <form onSubmit={handleSaveCommission}>
                <div className="modal-body">
                  <p className="text-muted small">
                    Configure custom platform commission percentage deducted from bookings for <strong>{selectedTurfForCommission.turfName || selectedTurfForCommission.name}</strong>.
                  </p>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Custom Platform Fee (%)</label>
                    <div className="input-group">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        className="form-control form-control-lg"
                        placeholder="10"
                        value={commissionInput}
                        onChange={(e) => setCommissionInput(e.target.value)}
                        required
                      />
                      <span className="input-group-text fw-bold bg-light">%</span>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-secondary rounded-pill px-3" onClick={() => setSelectedTurfForCommission(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-emerald rounded-pill px-4" disabled={submittingCommission}>
                    {submittingCommission ? 'Updating...' : 'Save Custom Fee %'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Global Default Fee Modal */}
      {showGlobalFeeModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Edit Global Default Platform Fee</h5>
                <button type="button" className="btn-close" onClick={() => setShowGlobalFeeModal(false)}></button>
              </div>
              <form onSubmit={handleSaveGlobalFee}>
                <div className="modal-body">
                  <p className="text-muted small">
                    This global default fee applies to all turfs that do not have a custom commission percentage set.
                  </p>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Global Default Fee (%)</label>
                    <div className="input-group">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        className="form-control form-control-lg"
                        placeholder="10"
                        value={globalFeeInput}
                        onChange={(e) => setGlobalFeeInput(e.target.value)}
                        required
                      />
                      <span className="input-group-text fw-bold bg-light">%</span>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-secondary rounded-pill px-3" onClick={() => setShowGlobalFeeModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-emerald rounded-pill px-4" disabled={submittingGlobalFee}>
                    {submittingGlobalFee ? 'Updating...' : 'Save Default Fee %'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
