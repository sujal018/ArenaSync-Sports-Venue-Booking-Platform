import React from 'react';

const BookingSummary = ({ turf, selectedSlots = [], bookingDate, onProceedToPayment, isProcessing }) => {
  const subtotal = selectedSlots.reduce((acc, slot) => acc + (slot.price || slot.slotPrice || turf?.basePrice || 500), 0);
  const platformFee = selectedSlots.length > 0 ? 30 : 0;
  const totalAmount = subtotal + platformFee;

  return (
    <div className="card border-0 shadow-sm glass-card p-4">
      <h5 className="fw-bold text-dark mb-3 d-flex align-items-center">
        <i className="bi bi-receipt text-emerald me-2"></i> Booking Summary
      </h5>

      <div className="mb-3 pb-3 border-bottom">
        <div className="fw-semibold text-dark">{turf?.turfName || turf?.name || 'Selected Turf'}</div>
        <div className="text-muted small">
          <i className="bi bi-geo-alt me-1"></i> {turf?.city || 'Location'}
        </div>
        <div className="text-muted small mt-1">
          <i className="bi bi-calendar-event me-1 text-emerald"></i> {bookingDate || 'Select Date'}
        </div>
      </div>

      {/* Selected Slots List */}
      <div className="mb-3">
        <label className="fw-semibold small text-muted mb-2">
          Selected Slots ({selectedSlots.length})
        </label>
        {selectedSlots.length === 0 ? (
          <p className="text-muted small fst-italic">No slots selected yet. Click on available time slots on the left.</p>
        ) : (
          <ul className="list-group list-group-flush mb-2">
            {selectedSlots.map((slot, index) => (
              <li key={index} className="list-group-item bg-transparent px-0 py-2 d-flex justify-content-between align-items-center small">
                <span>
                  <i className="bi bi-clock-history text-emerald me-2"></i>
                  {slot.startTime} - {slot.endTime}
                </span>
                <span className="fw-semibold text-dark">₹{slot.price || slot.slotPrice || 500}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <hr className="my-2" />

      {/* Cost Calculations */}
      <div className="d-flex justify-content-between mb-2 small text-muted">
        <span>Slots Subtotal</span>
        <span>₹{subtotal}</span>
      </div>

      {platformFee > 0 && (
        <div className="d-flex justify-content-between mb-2 small text-muted">
          <span>Platform Convenience Fee</span>
          <span>₹{platformFee}</span>
        </div>
      )}

      <div className="d-flex justify-content-between my-3 pt-2 border-top fw-bold fs-5 text-dark">
        <span>Total Payable</span>
        <span className="text-emerald">₹{totalAmount}</span>
      </div>

      {/* Razorpay Button */}
      <button
        className="btn btn-emerald w-100 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 mb-2"
        disabled={selectedSlots.length === 0 || isProcessing}
        onClick={() => onProceedToPayment(totalAmount, false)}
      >
        {isProcessing ? (
          <>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Initializing Payment...
          </>
        ) : (
          <>
            <i className="bi bi-shield-check fs-5"></i>
            Pay via Razorpay (₹{totalAmount})
          </>
        )}
      </button>

      {/* Instant Test Mode Simulation Button */}
      <button
        className="btn btn-outline-secondary w-100 py-2 rounded-3 small fw-semibold d-flex align-items-center justify-content-center gap-2"
        disabled={selectedSlots.length === 0 || isProcessing}
        onClick={() => onProceedToPayment(totalAmount, true)}
      >
        <i className="bi bi-lightning-charge-fill text-warning"></i>
        Instant Test Payment (Skip Modal)
      </button>

      <div className="text-center mt-3 text-muted small">
        <i className="bi bi-lock-fill me-1 text-emerald"></i>
        Encrypted & Secured Transaction
      </div>
    </div>
  );
};

export default BookingSummary;
