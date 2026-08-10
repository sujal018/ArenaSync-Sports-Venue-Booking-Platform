import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function CustomerPortal({ user, showNotification }) {
  const [activeTab, setActiveTab] = useState('browse'); // browse, history
  const [turfs, setTurfs] = useState([]);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [selectedTurf, setSelectedTurf] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookings, setBookings] = useState([]);
  
  // Checkout Modal
  const [showCheckout, setShowCheckout] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Success Receipt Modal
  const [showReceipt, setShowReceipt] = useState(false);
  const [latestBooking, setLatestBooking] = useState(null);

  useEffect(() => {
    fetchTurfs();
    fetchBookings();
  }, [sportFilter]);

  const fetchTurfs = async () => {
    try {
      const data = await api.customer.getTurfs(sportFilter);
      setTurfs(data);
    } catch (err) {
      showNotification("Failed to fetch turfs", "error");
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await api.customer.getBookings();
      setBookings(data);
    } catch (err) {
      showNotification("Failed to fetch booking history", "error");
    }
  };

  const handleSelectTurf = async (turf) => {
    setSelectedTurf(turf);
    setSelectedSlot(null);
    fetchSlots(turf.id, selectedDate);
  };

  const fetchSlots = async (turfId, date) => {
    try {
      const data = await api.customer.getSlots(turfId, date);
      setSlots(data);
    } catch (err) {
      showNotification("Failed to fetch slots", "error");
    }
  };

  const handleDateChange = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    if (selectedTurf) {
      fetchSlots(selectedTurf.id, dateStr);
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setBookingLoading(true);
    try {
      // Create the booking record (this is transactional and prevents double booking)
      const newBooking = await api.customer.bookSlot(selectedSlot.id);
      
      setLatestBooking(newBooking);
      setShowCheckout(false);
      setShowReceipt(true);
      showNotification("Booking confirmed and payment processed!", "success");
      
      // Refresh listings and history
      fetchBookings();
      if (selectedTurf) {
        fetchSlots(selectedTurf.id, selectedDate);
      }
      setSelectedSlot(null);
      
      // Clear payment inputs
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
    } catch (err) {
      showNotification(err.message || "Booking failed", "error");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking? The slot will be released.")) return;

    try {
      await api.customer.cancelBooking(bookingId);
      showNotification("Booking cancelled successfully.", "success");
      fetchBookings();
      if (selectedTurf) {
        fetchSlots(selectedTurf.id, selectedDate);
      }
    } catch (err) {
      showNotification(err.message || "Cancellation failed", "error");
    }
  };

  // Generate date list (next 7 days)
  const getDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const filteredTurfs = turfs.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Sub navigation tabs */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <button 
          className={`btn ${activeTab === 'browse' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('browse'); setSelectedTurf(null); }}
        >
          <i className="fa-solid fa-search"></i> Browse Turfs
        </button>
        <button 
          className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('history'); fetchBookings(); }}
        >
          <i className="fa-solid fa-receipt"></i> My Bookings ({bookings.length})
        </button>
      </div>

      {activeTab === 'browse' ? (
        !selectedTurf ? (
          /* BROWSE TURFS SCREEN */
          <div>
            <div className="glass-panel" style={{ marginBottom: '30px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '250px' }}>
                <label className="form-label">Search Turfs</label>
                <div style={{ position: 'relative' }}>
                  <i className="fa-solid fa-search" style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }}></i>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search by name or location..." 
                    style={{ paddingLeft: '40px' }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ width: '200px' }}>
                <label className="form-label">Filter Sport</label>
                <select 
                  className="form-control"
                  value={sportFilter}
                  onChange={(e) => setSportFilter(e.target.value)}
                >
                  <option value="">All Sports</option>
                  <option value="Football">Football</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Tennis">Tennis</option>
                  <option value="Basketball">Basketball</option>
                </select>
              </div>
            </div>

            <div className="turf-grid">
              {filteredTurfs.length > 0 ? (
                filteredTurfs.map(turf => (
                  <div key={turf.id} className="glass-panel turf-card">
                    <div className="turf-image-wrapper">
                      <img src={turf.imageUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800'} alt={turf.name} className="turf-image" />
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
                        <button className="btn btn-primary" onClick={() => handleSelectTurf(turf)}>
                          Book Slot <i className="fa-solid fa-arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-circle-question" style={{ fontSize: '3rem', marginBottom: '16px' }}></i>
                  <p>No sports turfs matching your criteria were found.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* TURF DETAIL & SLOT SELECTOR SCREEN */
          <div className="detail-layout">
            <div className="glass-panel">
              <button className="btn btn-secondary" style={{ marginBottom: '20px' }} onClick={() => setSelectedTurf(null)}>
                <i className="fa-solid fa-arrow-left"></i> Back to listings
              </button>
              
              <img src={selectedTurf.imageUrl} alt={selectedTurf.name} className="detail-img" />
              
              <h1>{selectedTurf.name}</h1>
              <div className="turf-location" style={{ fontSize: '1rem', marginTop: '8px', marginBottom: '20px' }}>
                <i className="fa-solid fa-location-dot"></i> {selectedTurf.location}
                <span className="badge badge-customer" style={{ marginLeft: '12px' }}>{selectedTurf.sportCategory}</span>
              </div>
              
              <h3>About Turf</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '30px' }}>{selectedTurf.description}</p>

              <div className="slot-section">
                <h3>Select Date & Availability</h3>
                
                {/* 7-Day Date Picker */}
                <div className="date-picker-bar">
                  {getDateOptions().map(date => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isActive = dateStr === selectedDate;
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNum = date.getDate();
                    return (
                      <div 
                        key={dateStr} 
                        className={`date-pill ${isActive ? 'active' : ''}`}
                        onClick={() => handleDateChange(dateStr)}
                      >
                        <span className="day-name">{dayName}</span>
                        <span className="day-number">{dayNum}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Available Slots */}
                <h4>Available Hourly Slots</h4>
                <div className="slots-grid" style={{ marginTop: '15px' }}>
                  {slots.length > 0 ? (
                    slots.map(slot => {
                      const isSelected = selectedSlot && selectedSlot.id === slot.id;
                      return (
                        <div 
                          key={slot.id} 
                          className={`slot-item ${slot.booked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                          onClick={() => !slot.booked && setSelectedSlot(slot)}
                        >
                          <span className="slot-time">{slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}</span>
                          <span className="slot-price">${slot.price}</span>
                          {slot.peak && <span className="slot-badge">Peak Hours</span>}
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
                      <p>No schedules generated by owner for this date.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking side Summary Panel */}
            <div className="glass-panel" style={{ position: 'sticky', top: '100px' }}>
              <h2>Booking Summary</h2>
              
              {selectedSlot ? (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                    <i className="fa-solid fa-calendar-check" style={{ fontSize: '2rem', color: 'var(--accent-primary)' }}></i>
                    <div>
                      <h4 style={{ color: 'var(--text-main)' }}>{selectedTurf.name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedDate} @ {selectedSlot.startTime.substring(0, 5)}</p>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '10px', marginBottom: '25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Slot Duration:</span>
                      <span>1 Hour</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Subtotal:</span>
                      <span>${selectedSlot.price}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', fontWeight: 'bold' }}>
                      <span>Total Amount:</span>
                      <span style={{ color: 'var(--accent-primary)' }}>${selectedSlot.price}</span>
                    </div>
                  </div>

                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowCheckout(true)}>
                    Proceed to Payment <i className="fa-solid fa-credit-card"></i>
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: '2.5rem', marginBottom: '12px' }}></i>
                  <p>Select an available hour slot to begin checkout.</p>
                </div>
              )}
            </div>
          </div>
        )
      ) : (
        /* BOOKING HISTORY SCREEN */
        <div className="glass-panel">
          <h2>Your Booking History</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Track your active, past and cancelled sports sessions</p>

          <div className="table-responsive">
            {bookings.length > 0 ? (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Invoice / ID</th>
                    <th>Turf Details</th>
                    <th>Booked Slot</th>
                    <th>Amount Paid</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{b.transactionId || `TXN_${b.id}`}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.turf.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.turf.location}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.slot.date}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.slot.startTime.substring(0, 5)} - {b.slot.endTime.substring(0, 5)}</div>
                      </td>
                      <td style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>${b.totalAmount}</td>
                      <td>
                        <span className={`badge ${b.status === 'confirmed' ? 'badge-customer' : 'badge-admin'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        {b.status === 'confirmed' ? (
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleCancelBooking(b.id)}
                          >
                            Cancel Slot
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Released</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-folder-open" style={{ fontSize: '3rem', marginBottom: '16px' }}></i>
                <p>You haven't booked any slots yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {showCheckout && selectedSlot && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <h2 style={{ marginBottom: '10px' }}>Secure Payment checkout</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Complete your booking for slot at {selectedTurf.name}</p>
            
            <form onSubmit={handleCheckoutSubmit}>
              <div className="form-group">
                <label className="form-label">Total Amount Due</label>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '15px' }}>
                  ${selectedSlot.price}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Card Number</label>
                <div style={{ position: 'relative' }}>
                  <i className="fa-solid fa-credit-card" style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }}></i>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="4000 1234 5678 9010" 
                    style={{ paddingLeft: '40px' }}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength="19"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Expiry Date</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="MM/YY" 
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    maxLength="5"
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">CVC</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="•••" 
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    maxLength="3"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCheckout(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={bookingLoading}>
                  {bookingLoading ? (
                    <span><i className="fa-solid fa-spinner fa-spin"></i> Processing...</span>
                  ) : (
                    <span>Pay & Confirm</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS RECEIPT MODAL */}
      {showReceipt && latestBooking && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ textAlign: 'center' }}>
            <div className="success-checkmark">
              <i className="fa-solid fa-check"></i>
            </div>
            
            <h2>Booking Confirmed!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Your slot reservation is finalized</p>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', textAlign: 'left', marginBottom: '30px' }}>
              <div className="receipt-row">
                <span>Transaction ID:</span>
                <span style={{ fontFamily: 'monospace' }}>{latestBooking.transactionId}</span>
              </div>
              <div className="receipt-row">
                <span>Turf Arena:</span>
                <span>{latestBooking.turf.name}</span>
              </div>
              <div className="receipt-row">
                <span>Scheduled Date:</span>
                <span>{latestBooking.slot.date}</span>
              </div>
              <div className="receipt-row">
                <span>Time Frame:</span>
                <span>{latestBooking.slot.startTime.substring(0, 5)} - {latestBooking.slot.endTime.substring(0, 5)}</span>
              </div>
              <div className="receipt-row">
                <span>Sport Category:</span>
                <span>{latestBooking.turf.sportCategory}</span>
              </div>
              <div className="receipt-row">
                <span>Amount Paid:</span>
                <span>${latestBooking.totalAmount}</span>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setShowReceipt(false); setActiveTab('history'); }}>
              Go to My Bookings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
