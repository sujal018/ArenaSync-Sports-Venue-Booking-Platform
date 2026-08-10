import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container py-5 text-center">
      <div className="card border-0 shadow-lg glass-card p-5 mx-auto" style={{ maxWidth: '540px' }}>
        <h1 className="display-1 fw-extrabold text-emerald mb-2">404</h1>
        <h3 className="fw-bold text-dark mb-2">Out of Bounds!</h3>
        <p className="text-muted mb-4">
          The page or turf arena you are searching for does not exist or has been moved.
        </p>
        <Link to="/" className="btn btn-emerald py-3 rounded-3 fw-bold">
          <i className="bi bi-house me-2"></i> Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
