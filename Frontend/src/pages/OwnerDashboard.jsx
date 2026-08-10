import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { turfApi } from '../api/turfApi';
import { bookingApi } from '../api/bookingApi';
import { authApi } from '../api/authApi';
import useAuth from '../hooks/useAuth';
import Loader from '../components/common/Loader';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [turfs, setTurfs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownerProfileStatus, setOwnerProfileStatus] = useState(user?.status || 'ACTIVE');
  const [sortBy, setSortBy] = useState('revenue'); // 'revenue' | 'commission' | 'bookings' | 'name'

  useEffect(() => {
    fetchOwnerDashboardData();
  }, [user]);

  const fetchOwnerDashboardData = async () => {
    setLoading(true);
    try {
      let ownerId = user?.id || user?.userId;

      if (user?.email) {
        try {
          const ownerProfile = await authApi.getUserByEmail(user.email);
          if (ownerProfile?.status) {
            setOwnerProfileStatus(ownerProfile.status);
          }
          if (!ownerId) {
            ownerId = ownerProfile?.id || ownerProfile?.userId;
          }
        } catch (e) {
          console.warn('Could not fetch owner profile by unique email:', e);
        }
      }

      if (ownerId) {
        // 1. Fetch Owner's Turfs
        try {
          const turfData = await turfApi.getTurfsByOwner(ownerId);
          const list = Array.isArray(turfData) ? turfData : (turfData?.content || turfData?.data || []);
          setTurfs(list);
        } catch (tErr) {
          console.warn('Owner turfs error:', tErr);
          setTurfs([]);
        }

        // 2. Fetch Owner's Turf Bookings
        try {
          const bookingData = await bookingApi.getBookingsByOwner(ownerId);
          const bList = Array.isArray(bookingData) ? bookingData : (bookingData?.content || []);
          setBookings(bList);
        } catch (bErr) {
          console.warn('Owner bookings error:', bErr);
          setBookings([]);
        }
      } else {
        setTurfs([]);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching owner dashboard data:', error);
      setTurfs([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const totalTurfs = turfs.length;
  const totalBookingsCount = bookings.length;

  // Calculate overall gross revenue & platform commission paid to admin for confirmed bookings
  const { grossRevenue, totalPlatformCommissionPaid, netOwnerEarnings } = bookings.reduce(
    (acc, b) => {
      const status = String(b.bookingStatus || '').toUpperCase();
      if (status === 'CONFIRMED' || status === 'SUCCESS' || status === 'COMPLETED') {
        const total = Number(b.totalAmount) || 0;
        // Calculate platform commission (if not directly provided, assume default 10%)
        const comm = Number(b.platformCommission) || (total * 0.1);
        acc.grossRevenue += total;
        acc.totalPlatformCommissionPaid += comm;
        acc.netOwnerEarnings += (total - comm);
      }
      return acc;
    },
    { grossRevenue: 0, totalPlatformCommissionPaid: 0, netOwnerEarnings: 0 }
  );

  // Calculate revenue & commission statistics per turf
  const getTurfStats = (turf) => {
    const turfId = turf.id;
    const turfNameStr = (turf.turfName || turf.name || '').toLowerCase();

    const turfBookings = bookings.filter((b) => {
      const firstDetail = b.bookingDetails?.[0];
      const bTurfName = (firstDetail?.turfName || '').toLowerCase();
      const bTurfId = firstDetail?.slot?.turf?.id;
      return (bTurfId && bTurfId === turfId) || (bTurfName && bTurfName === turfNameStr);
    });

    const confirmed = turfBookings.filter((b) => {
      const status = String(b.bookingStatus || '').toUpperCase();
      return status === 'CONFIRMED' || status === 'SUCCESS' || status === 'COMPLETED';
    });

    const feeRate = turf.customCommissionPercentage ?? 10;
    const gross = confirmed.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    const commPaid = confirmed.reduce((sum, b) => {
      const c = Number(b.platformCommission);
      return sum + (isNaN(c) || c === 0 ? (Number(b.totalAmount) || 0) * (feeRate / 100) : c);
    }, 0);

    const netPayout = gross - commPaid;

    return {
      totalBookings: turfBookings.length,
      confirmedCount: confirmed.length,
      grossRevenue: gross,
      commissionPaid: commPaid,
      netPayout: netPayout,
      feeRate: feeRate,
    };
  };

  // Sort turfs dynamically
  const sortedTurfs = [...turfs].map((t) => ({
    ...t,
    stats: getTurfStats(t),
  })).sort((a, b) => {
    if (sortBy === 'revenue') {
      return b.stats.grossRevenue - a.stats.grossRevenue;
    } else if (sortBy === 'commission') {
      return b.stats.commissionPaid - a.stats.commissionPaid;
    } else if (sortBy === 'bookings') {
      return b.stats.totalBookings - a.stats.totalBookings;
    } else {
      return (a.turfName || a.name || '').localeCompare(b.turfName || b.name || '');
    }
  });

  if (loading) return <Loader message="Fetching your arena statistics & booking records from database..." />;

  const isBlocked = ownerProfileStatus === 'BLOCKED' || ownerProfileStatus === 'SUSPENDED' || (user && (user.status === 'BLOCKED' || user.status === 'SUSPENDED'));

  return (
    <div className="container py-4">
      {isBlocked && (
        <div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4 d-flex align-items-center gap-3">
          <i className="bi bi-shield-slash-fill fs-2 text-danger"></i>
          <div>
            <h5 className="fw-bold mb-1">Your Account Has Been Blocked by Administrator</h5>
            <p className="small mb-1">
              Your account has been blocked by Administrator. You are allowed to sign in and view your dashboard, but you cannot perform any actions or list new turfs. Your venues are hidden from public booking search.
            </p>
            <div className="fw-semibold small text-danger">
              <i className="bi bi-headset me-1"></i> Please contact Administrator to unblock your account: <strong>support@gmail.com</strong> &bull; <strong>+91 98765 43210</strong>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Owner Dashboard</h3>
          <p className="text-muted small mb-0">
            Venues & Commission Breakdown registered for owner: <strong>{user?.email}</strong>
          </p>
        </div>
        <Link to="/owner/add-turf" className="btn btn-emerald rounded-pill px-4">
          <i className="bi bi-plus-lg me-1"></i> Add New Turf
        </Link>
      </div>

      {/* Metrics Cards (4 Columns: Turfs, Bookings, Gross Sales, Platform Fee Paid) */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <div className="card border-0 shadow-sm glass-card p-4">
            <span className="text-muted small fw-semibold">Total Listed Turfs</span>
            <h3 className="fw-bold text-dark mb-0 mt-1">{totalTurfs}</h3>
            <span className="small text-emerald fw-semibold mt-1">Registered Venues</span>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card border-0 shadow-sm glass-card p-4">
            <span className="text-muted small fw-semibold">Total Bookings</span>
            <h3 className="fw-bold text-dark mb-0 mt-1">{totalBookingsCount}</h3>
            <span className="small text-muted mt-1">Recorded Slots</span>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card border-0 shadow-sm glass-card p-4">
            <span className="text-muted small fw-semibold">Gross Sales</span>
            <h3 className="fw-bold text-emerald mb-0 mt-1">₹{grossRevenue.toLocaleString()}</h3>
            <span className="small text-muted mt-1">Total Customer Payments</span>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card border-0 shadow-sm glass-card p-4">
            <span className="text-muted small fw-semibold">Platform Fee Paid (Admin)</span>
            <h3 className="fw-bold text-danger mb-0 mt-1">₹{totalPlatformCommissionPaid.toLocaleString()}</h3>
            <span className="small text-muted mt-1">Net Payout: ₹{netOwnerEarnings.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Turf Revenue & Platform Fee Breakdown Table */}
      <div className="card border-0 shadow-sm glass-card p-4 mb-4">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-3 gap-2">
          <div>
            <h5 className="fw-bold text-dark mb-1">
              <i className="bi bi-graph-up-arrow text-emerald me-2"></i> Arena Sales & Platform Commission Paid ({turfs.length})
            </h5>
            <p className="text-muted small mb-0">Detailed breakdown of gross earnings, platform commission cuts paid to Admin, and net owner payout</p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted fw-semibold">Sort By:</span>
            <select
              className="form-select form-select-sm rounded-pill"
              style={{ width: '180px' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="revenue">💰 Highest Gross Sales</option>
              <option value="commission">📉 Highest Platform Fee Paid</option>
              <option value="bookings">📅 Most Bookings</option>
              <option value="name">🔤 Arena Name</option>
            </select>
          </div>
        </div>

        {sortedTurfs.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-building-x display-4 d-block mb-2 text-secondary"></i>
            <h5 className="fw-bold text-dark">No Turfs Found for {user?.email}</h5>
            <p className="small mb-3">No sports arenas registered under this unique owner email address in your database.</p>
            <Link to="/owner/add-turf" className="btn btn-emerald btn-sm rounded-pill px-4">
              Add Your First Turf
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr>
                  <th>Turf Arena</th>
                  <th>City</th>
                  <th>Rate / hr</th>
                  <th>Platform Fee %</th>
                  <th>Gross Sales</th>
                  <th>Fee Paid to Admin</th>
                  <th>Net Owner Payout</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedTurfs.map((t) => {
                  const isApproved = (t.status || 'APPROVED').toUpperCase() === 'APPROVED';
                  return (
                    <tr key={t.id}>
                      <td className="fw-bold text-dark">{t.turfName || t.name}</td>
                      <td>{t.city || t.location || 'N/A'}</td>
                      <td className="fw-semibold text-dark">₹{t.basePrice ?? t.pricePerHour}/hr</td>
                      <td>
                        <span className="badge bg-primary bg-opacity-10 text-primary border">
                          {t.stats.feeRate}% Fee Cut
                        </span>
                      </td>
                      <td className="fw-bold text-emerald">₹{t.stats.grossRevenue.toLocaleString()}</td>
                      <td className="fw-bold text-danger">
                        -₹{t.stats.commissionPaid.toLocaleString()}
                      </td>
                      <td>
                        <span className="fw-bold text-dark bg-success bg-opacity-10 text-success px-3 py-1 rounded-pill border border-success border-opacity-25">
                          ₹{t.stats.netPayout.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isApproved ? 'bg-success' : 'bg-warning'}`}>
                          {t.status || 'APPROVED'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Details Table */}
      <div className="card border-0 shadow-sm glass-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0">
            <i className="bi bi-receipt text-emerald me-2"></i> Booking Transactions & Admin Fee Cut ({bookings.length})
          </h5>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <i className="bi bi-calendar-x fs-1 d-block mb-2 text-secondary"></i>
            <p className="small mb-0">No bookings recorded yet for your sports venues in the database.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr>
                  <th>Booking #</th>
                  <th>Customer Name</th>
                  <th>Turf / Venue</th>
                  <th>Slot Time & Date</th>
                  <th>Customer Paid</th>
                  <th>Admin Fee Cut</th>
                  <th>Owner Net Payout</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const status = String(b.bookingStatus || 'CONFIRMED').toUpperCase();
                  const firstDetail = b.bookingDetails?.[0];
                  const turfName = firstDetail?.turfName || 'Turf Pitch';
                  const slotDateStr = firstDetail?.slotDate || (b.bookingDate ? String(b.bookingDate).substring(0, 10) : 'N/A');
                  const timeRange = firstDetail?.startTime ? `${firstDetail.startTime.substring(0, 5)} - ${firstDetail.endTime?.substring(0, 5)}` : 'Scheduled Slot';
                  
                  const totalPaid = Number(b.totalAmount) || 0;
                  const adminFee = Number(b.platformCommission) || (totalPaid * 0.1);
                  const netPayout = totalPaid - adminFee;

                  return (
                    <tr key={b.bookingId || b.id}>
                      <td className="fw-bold text-dark">#{b.bookingNumber || b.bookingId}</td>
                      <td>{b.customerName || 'Player Customer'}</td>
                      <td>{turfName}</td>
                      <td>
                        <span className="d-block fw-semibold">{slotDateStr}</span>
                        <small className="text-muted">{timeRange}</small>
                      </td>
                      <td className="fw-bold text-emerald">₹{totalPaid}</td>
                      <td className="fw-bold text-danger">-₹{adminFee.toFixed(0)}</td>
                      <td className="fw-bold text-success">₹{netPayout.toFixed(0)}</td>
                      <td>
                        <span className={`badge ${
                          status === 'CONFIRMED' ? 'bg-success' : status === 'PENDING_PAYMENT' ? 'bg-warning text-dark' : 'bg-danger'
                        }`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
