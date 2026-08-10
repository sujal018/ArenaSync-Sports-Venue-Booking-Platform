import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function OwnerPortal({ user, showNotification }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, turfs, bookings, scheduler
  const [turfs, setTurfs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    grossRevenue: 0,
    commissionPaid: 0,
    netEarnings: 0
  });

  // Turf Creation/Edit Modal
  const [showTurfModal, setShowTurfModal] = useState(false);
  const [editingTurf, setEditingTurf] = useState(null);
  const [turfName, setTurfName] = useState('');
  const [turfLocation, setTurfLocation] = useState('');
  const [turfSport, setTurfSport] = useState('Football');
  const [turfPrice, setTurfPrice] = useState('');
  const [turfDesc, setTurfDesc] = useState('');
  const [turfImage, setTurfImage] = useState('');

  // Slot Scheduler state
  const [selectedTurfId, setSelectedTurfId] = useState('');
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(21);
  const [slotPrice, setSlotPrice] = useState('');
  const [generatingSlots, setGeneratingSlots] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const turfList = await api.owner.getTurfs();
      setTurfs(turfList);
      if (turfList.length > 0 && !selectedTurfId) {
        setSelectedTurfId(turfList[0].id);
      }

      const bookingList = await api.owner.getBookings();
      setBookings(bookingList);

      const ownerStats = await api.owner.getStats();
      setStats(ownerStats);
    } catch (err) {
      showNotification("Failed to fetch dashboard data", "error");
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTurf(null);
    setTurfName('');
    setTurfLocation('');
    setTurfSport('Football');
    setTurfPrice('');
    setTurfDesc('');
    setTurfImage('');
    setShowTurfModal(true);
  };

  const handleOpenEditModal = (turf) => {
    setEditingTurf(turf);
    setTurfName(turf.name);
    setTurfLocation(turf.location);
    setTurfSport(turf.sportCategory);
    setTurfPrice(turf.basePrice.toString());
    setTurfDesc(turf.description);
    setTurfImage(turf.imageUrl || '');
    setShowTurfModal(true);
  };

  const handleTurfSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: turfName,
      location: turfLocation,
      sportCategory: turfSport,
      basePrice: parseFloat(turfPrice),
      description: turfDesc,
      imageUrl: turfImage || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800'
    };

    try {
      if (editingTurf) {
        await api.owner.updateTurf(editingTurf.id, payload);
        showNotification("Turf details updated successfully", "success");
      } else {
        await api.owner.createTurf(payload);
        showNotification("New turf registered successfully", "success");
      }
      setShowTurfModal(false);
      fetchData();
    } catch (err) {
      showNotification(err.message || "Operation failed", "error");
    }
  };

  const handleGenerateSlots = async (e) => {
    e.preventDefault();
    if (!selectedTurfId) {
      showNotification("Please select a turf first", "error");
      return;
    }

    setGeneratingSlots(true);
    const payload = {
      turfId: parseInt(selectedTurfId),
      date: scheduleDate,
      startHour: parseInt(startHour),
      endHour: parseInt(endHour),
      price: parseFloat(slotPrice)
    };

    try {
      const generated = await api.owner.generateSlots(payload);
      showNotification(`Successfully generated ${generated.length} time slots!`, "success");
      fetchData();
    } catch (err) {
      showNotification(err.message || "Slot generation failed", "error");
    } finally {
      setGeneratingSlots(false);
    }
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('dashboard'); fetchData(); }}
        >
          <i className="fa-solid fa-chart-line"></i> Dashboard
        </button>
        <button 
          className={`btn ${activeTab === 'turfs' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('turfs'); fetchData(); }}
        >
          <i className="fa-solid fa-square-poll-horizontal"></i> My Turfs ({turfs.length})
        </button>
        <button 
          className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('bookings'); fetchData(); }}
        >
          <i className="fa-solid fa-list-check"></i> Bookings List ({bookings.length})
        </button>
        <button 
          className={`btn ${activeTab === 'scheduler' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('scheduler'); fetchData(); }}
        >
          <i className="fa-solid fa-calendar-plus"></i> Slot Scheduler
        </button>
      </div>

      {activeTab === 'dashboard' && (
        /* OWNER DASHBOARD SCREEN */
        <div>
          <div className="dashboard-grid">
            <div className="glass-panel stat-card">
              <div className="stat-icon green">
                <i className="fa-solid fa-calendar-check"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Bookings</span>
                <span className="stat-value">{stats.totalBookings}</span>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon indigo">
                <i className="fa-solid fa-sack-dollar"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Gross Sales</span>
                <span className="stat-value">${stats.grossRevenue.toFixed(2)}</span>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon rose">
                <i className="fa-solid fa-percentage"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Commissions Paid</span>
                <span className="stat-value">${stats.commissionPaid.toFixed(2)}</span>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon amber">
                <i className="fa-solid fa-wallet"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Net Earnings</span>
                <span className="stat-value" style={{ color: 'var(--accent-primary)' }}>${stats.netEarnings.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel">
            <h2>Recent Reservations</h2>
            <div className="table-responsive">
              {bookings.slice(0, 5).length > 0 ? (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Turf Venue</th>
                      <th>Slot Date & Time</th>
                      <th>Gross Price</th>
                      <th>Platform Cut</th>
                      <th>Your Net Payout</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 5).map(b => (
                      <tr key={b.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{b.customer ? b.customer.name : 'Deleted Customer'}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.customer ? b.customer.email : ''}</div>
                        </td>
                        <td>{b.turf.name}</td>
                        <td>
                          <div>{b.slot.date}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.slot.startTime.substring(0, 5)} - {b.slot.endTime.substring(0, 5)}</div>
                        </td>
                        <td style={{ fontWeight: '500' }}>${b.totalAmount}</td>
                        <td style={{ color: 'var(--accent-rose)' }}>-${b.platformCommission}</td>
                        <td style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>+${b.ownerShare}</td>
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
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  <p>No recent bookings recorded.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'turfs' && (
        /* TURFS LIST & REGISTRATION */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Registered Turf Spaces</h2>
            <button className="btn btn-primary" onClick={handleOpenCreateModal}>
              <i className="fa-solid fa-plus"></i> Add New Turf
            </button>
          </div>

          <div className="turf-grid">
            {turfs.map(turf => (
              <div key={turf.id} className="glass-panel turf-card">
                <div className="turf-image-wrapper">
                  <img src={turf.imageUrl} alt={turf.name} className="turf-image" />
                  <span className="sport-tag">{turf.sportCategory}</span>
                </div>
                <div className="turf-content">
                  <h3 className="turf-title">{turf.name}</h3>
                  <div className="turf-location">
                    <i className="fa-solid fa-location-dot"></i>
                    <span>{turf.location}</span>
                  </div>
                  <p className="turf-desc">{turf.description}</p>
                  <div className="turf-footer">
                    <div className="price-tag">
                      ${turf.basePrice} <span className="price-unit">/ hr</span>
                    </div>
                    <button className="btn btn-secondary" onClick={() => handleOpenEditModal(turf)}>
                      Edit Details <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        /* FULL BOOKINGS HISTORY */
        <div className="glass-panel">
          <h2>All Booking Ledger</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Monitor commission splits and billing details for all reservations</p>

          <div className="table-responsive">
            {bookings.length > 0 ? (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Sport Arena</th>
                    <th>Date & Time</th>
                    <th>Gross Paid</th>
                    <th>Platform Commission</th>
                    <th>Net Owner Payout</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.customer ? b.customer.name : 'Deleted Customer'}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.customer ? b.customer.email : ''}</div>
                      </td>
                      <td>{b.turf.name}</td>
                      <td>
                        <div>{b.slot.date}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.slot.startTime.substring(0, 5)} - {b.slot.endTime.substring(0, 5)}</div>
                      </td>
                      <td>${b.totalAmount}</td>
                      <td style={{ color: 'var(--accent-rose)' }}>-${b.platformCommission}</td>
                      <td style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>+${b.ownerShare}</td>
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
                <p>No bookings received yet. Share your turf space and list slots!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'scheduler' && (
        /* SLOT SCHEDULER */
        <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2>Schedules slot generator</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Bulk generate operating hours for your turfs. Note: Peak hours (5 PM - 10 PM) are automatically marked and premium-priced by 20%.</p>

          <form onSubmit={handleGenerateSlots}>
            <div className="form-group">
              <label className="form-label">Select Turf Space</label>
              <select 
                className="form-control"
                value={selectedTurfId}
                onChange={(e) => setSelectedTurfId(e.target.value)}
                required
              >
                <option value="">-- Select Turf --</option>
                {turfs.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.sportCategory})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Schedule Date</label>
              <input 
                type="date" 
                className="form-control"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Start Hour (24h format)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  min="0" 
                  max="23"
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">End Hour (24h format)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  min="1" 
                  max="24"
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '30px' }}>
              <label className="form-label">Base Slot Hourly Price ($)</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="80.00"
                step="0.01"
                min="1"
                value={slotPrice}
                onChange={(e) => setSlotPrice(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={generatingSlots}>
              {generatingSlots ? (
                <span><i className="fa-solid fa-spinner fa-spin"></i> Generating slots...</span>
              ) : (
                <span>Generate Schedules <i className="fa-solid fa-calendar-check"></i></span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* CREATE / EDIT TURF MODAL */}
      {showTurfModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '580px' }}>
            <h2>{editingTurf ? "Edit Turf Space Details" : "Register New Turf Space"}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>Provide descriptive information and pricing for players</p>

            <form onSubmit={handleTurfSubmit}>
              <div className="form-group">
                <label className="form-label">Turf Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g., Apex Football Arena"
                  value={turfName}
                  onChange={(e) => setTurfName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Sport Category</label>
                  <select 
                    className="form-control"
                    value={turfSport}
                    onChange={(e) => setTurfSport(e.target.value)}
                  >
                    <option value="Football">Football</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Badminton">Badminton</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Base Price per Hour ($)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="80.00"
                    step="0.01"
                    min="1"
                    value={turfPrice}
                    onChange={(e) => setTurfPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location Address</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Street, District, Area Code"
                  value={turfLocation}
                  onChange={(e) => setTurfLocation(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Turf Showcase Image URL</label>
                <input 
                  type="url" 
                  className="form-control" 
                  placeholder="https://images.unsplash.com/..."
                  value={turfImage}
                  onChange={(e) => setTurfImage(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '25px' }}>
                <label className="form-label">Turf Description & Ground Rules</label>
                <textarea 
                  className="form-control" 
                  placeholder="Ground type, amenities (changing rooms, water), rules (shoes)..."
                  rows="3"
                  value={turfDesc}
                  onChange={(e) => setTurfDesc(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowTurfModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Space
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
