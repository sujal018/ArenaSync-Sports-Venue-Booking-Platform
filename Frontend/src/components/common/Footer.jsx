import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-auto pt-5 pb-4 border-top border-secondary">
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Column 1: Brand & Features */}
          <div className="col-lg-3 col-md-6">
            <h5 className="fw-bold text-white d-flex align-items-center mb-3">
              <img
                src="/assets/arenasync-logo.png"
                alt="ArenaSync Logo"
                className="me-2 rounded-circle border border-emerald p-1 bg-white"
                style={{ width: '38px', height: '38px', objectFit: 'cover' }}
              />
              Arena<span className="text-emerald">Sync</span>
            </h5>
            <ul className="list-unstyled mb-0">
              <li className="mb-2 text-light">About Us</li>
              <li className="mb-2 text-light">Book Anytime</li>
              <li className="mb-2 text-light">Secure Payments</li>
              <li className="mb-2 text-light">24x7 Booking</li>
            </ul>
          </div>

          {/* Column 2: Quick Links */}
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-white mb-3">Quick Links</h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <Link to="/" className="text-light text-decoration-none hover-emerald">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/my-bookings" className="text-light text-decoration-none hover-emerald">My Bookings</Link>
              </li>
              <li className="mb-2">
                <Link to="/" className="text-light text-decoration-none hover-emerald">Search</Link>
              </li>
              <li className="mb-2">
                <a href="#privacy" className="text-light text-decoration-none hover-emerald">Privacy</a>
              </li>
              <li className="mb-2">
                <a href="#refund" className="text-light text-decoration-none hover-emerald">Refund</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Popular Sports */}
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-white mb-3">Popular Sports</h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-2 text-light">Football</li>
              <li className="mb-2 text-light">Cricket</li>
              <li className="mb-2 text-light">Badminton</li>
              <li className="mb-2 text-light">Volleyball</li>
              <li className="mb-2 text-light">Tennis</li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-white mb-3">Contact</h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-2 text-light">
                <i className="bi bi-envelope me-2 text-emerald"></i> support@gmail.com
              </li>
              <li className="mb-2 text-light">
                <i className="bi bi-telephone me-2 text-emerald"></i> +91 98765 43210
              </li>
              <li className="mb-2 text-light">
                <i className="bi bi-geo-alt me-2 text-emerald"></i> Pune, Maharashtra
              </li>
              <li className="mb-2 text-light">
                <i className="bi bi-clock me-2 text-emerald"></i> 9AM - 8PM
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary opacity-50 my-4" />

        {/* Footer Bottom Line */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center small">
          <span className="text-light">&copy; 2026 ArenaSync. All Rights Reserved.</span>
          <span className="mt-2 mt-sm-0 text-light fw-semibold">
            Reserved by <strong className="text-emerald">Sujal Sahu</strong> | Made with ❤️ in India
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
