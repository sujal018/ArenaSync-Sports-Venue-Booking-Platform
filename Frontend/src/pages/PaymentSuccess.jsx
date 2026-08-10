import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const PaymentSuccess = () => {
  const location = useLocation();
  const state = location.state || {};

  const booking = state.booking || {
    bookingNumber: `TB-${Math.floor(Math.random() * 899999) + 100000}`,
    totalAmount: 1230,
  };
  const turfName = state.turfName || 'Apex Sports Arena';
  const bookingDate = state.bookingDate || new Date().toISOString().split('T')[0];
  const paymentId = state.paymentId || `pay_${Date.now()}`;
  const slots = state.selectedSlots || [{ startTime: '18:00', endTime: '19:00' }];

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="card border-0 shadow-lg glass-card p-4 p-md-5 text-center">
            <div className="bg-emerald text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow" style={{ width: '80px', height: '80px' }}>
              <i className="bi bi-check-lg display-4"></i>
            </div>

            <h2 className="fw-extrabold text-dark mb-1">Booking Confirmed!</h2>
            <p className="text-muted small mb-4">Your turf slot has been reserved successfully.</p>

            <div className="p-4 bg-light rounded-4 text-start mb-4 border">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Booking Ref Number</span>
                <span className="fw-bold text-dark">{booking.bookingNumber || booking.id}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Turf Arena</span>
                <span className="fw-bold text-dark">{turfName}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Playing Date</span>
                <span className="fw-bold text-dark">{bookingDate}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Reserved Slots</span>
                <span className="fw-bold text-emerald">
                  {slots.map((s) => `${s.startTime}-${s.endTime}`).join(', ')}
                </span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Razorpay Transaction ID</span>
                <span className="small text-secondary font-monospace">{paymentId}</span>
              </div>
              <div className="d-flex justify-content-between pt-2 fw-bold text-dark fs-5">
                <span>Amount Paid</span>
                <span className="text-emerald">₹{booking.totalAmount || 1230}</span>
              </div>
            </div>

            <div className="d-flex flex-column flex-sm-row gap-2">
              <Link to="/my-bookings" className="btn btn-emerald flex-fill py-3 rounded-3 fw-bold">
                View My Bookings
              </Link>
              <button className="btn btn-outline-secondary flex-fill py-3 rounded-3" onClick={() => window.print()}>
                <i className="bi bi-printer me-2"></i> Print Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
