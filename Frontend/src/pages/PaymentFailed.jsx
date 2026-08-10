import React from 'react';
import { Link } from 'react-router-dom';

const PaymentFailed = () => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow-lg glass-card p-4 p-md-5 text-center">
            <div className="bg-danger text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow" style={{ width: '80px', height: '80px' }}>
              <i className="bi bi-x-lg display-4"></i>
            </div>

            <h2 className="fw-extrabold text-dark mb-1">Payment Unsuccessful</h2>
            <p className="text-muted small mb-4">
              We couldn't process your payment. Any deducted funds will be refunded to your source account automatically.
            </p>

            <div className="d-flex flex-column gap-2">
              <Link to="/" className="btn btn-emerald py-3 rounded-3 fw-bold">
                Try Booking Again
              </Link>
              <Link to="/my-bookings" className="btn btn-outline-secondary py-3 rounded-3">
                Go to My Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
