import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Phone validation regex matching backend: ^[6-9]\d{9}$
    const phoneRegex = /^[6-9]\d{9}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      toast.error('Please enter a valid 10-digit Indian mobile number (starting with 6-9)');
      return;
    }

    setLoading(true);
    try {
      // Matches UserRequestDto: { firstName, lastName, email, password, phoneNumber, role }
      await authApi.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        role: formData.role,
      });
      toast.success('Registration successful! Please log in to continue.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-0 shadow-lg glass-card p-4 p-md-5">
            <div className="text-center mb-4">
              <h3 className="fw-bold text-dark mb-1">Create Your Account</h3>
              <p className="text-muted small">Join TurfSpot to book grounds or list your sports arena</p>
            </div>

            {/* Role Selection */}
            <div className="d-flex justify-content-center gap-3 mb-4">
              <button
                type="button"
                className={`btn flex-fill py-2 rounded-3 fw-semibold ${formData.role === 'CUSTOMER' ? 'btn-emerald' : 'btn-outline-secondary'}`}
                onClick={() => setFormData((prev) => ({ ...prev, role: 'CUSTOMER' }))}
              >
                <i className="bi bi-person me-2"></i> Player / Customer
              </button>
              <button
                type="button"
                className={`btn flex-fill py-2 rounded-3 fw-semibold ${formData.role === 'OWNER' ? 'btn-emerald' : 'btn-outline-secondary'}`}
                onClick={() => setFormData((prev) => ({ ...prev, role: 'OWNER' }))}
              >
                <i className="bi bi-building me-2"></i> Turf Owner
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">First Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="John"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Last Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Doe"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="john.doe@example.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Phone Number *</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="9876543210"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>10-digit mobile number</small>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={6}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Confirm Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-emerald w-100 py-3 fw-bold rounded-3 mb-3" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating Account...
                  </>
                ) : (
                  `Register as ${formData.role === 'OWNER' ? 'Turf Owner' : 'Customer'}`
                )}
              </button>
            </form>

            <div className="text-center text-muted small mt-2">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald fw-bold text-decoration-none">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
