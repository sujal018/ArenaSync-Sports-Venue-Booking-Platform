import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { authApi } from '../api/authApi';
import { toast } from 'react-toastify';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [blockedError, setBlockedError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (blockedError) setBlockedError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBlockedError('');
    if (!credentials.email || !credentials.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login(credentials);
      // Response: { token, userId, email, fullName, role, status }
      const token = response.token || response.jwtToken;
      const userStatus = response.status || 'ACTIVE';
      const user = {
        id: response.userId || response.id,
        email: response.email || credentials.email,
        name: response.fullName || response.name || credentials.email.split('@')[0],
        role: response.role,
        status: userStatus,
      };

      login(token, user);

      if (userStatus === 'BLOCKED' || userStatus === 'SUSPENDED') {
        toast.warning(`Account Warning: Your account is currently ${userStatus}. Contact Administrator: support@gmail.com / +91 98765 43210`);
      } else {
        toast.success(`Welcome back, ${user.name}!`);
      }

      // Redirect logic
      if (from) {
        navigate(from, { replace: true });
      } else {
        const role = String(user.role || '').toUpperCase();
        if (role.includes('ADMIN')) {
          navigate('/admin/dashboard');
        } else if (role.includes('OWNER')) {
          navigate('/owner/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : 'Invalid email or password. Please try again.');
      if (msg.toLowerCase().includes('block') || msg.toLowerCase().includes('suspend')) {
        setBlockedError(msg);
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow-lg glass-card p-4 p-md-5">
            <div className="text-center mb-4">
              <div className="bg-emerald text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-person-lock fs-2"></i>
              </div>
              <h3 className="fw-bold text-dark mb-1">Welcome Back</h3>
              <p className="text-muted small">Log in to manage your bookings and turf slots</p>
            </div>

            {blockedError && (
              <div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4 d-flex align-items-center gap-3">
                <i className="bi bi-shield-slash-fill fs-2"></i>
                <div>
                  <h6 className="fw-bold mb-1">Account Blocked by Administrator</h6>
                  <p className="small mb-1">{blockedError}</p>
                  <div className="fw-semibold small text-danger">
                    <i className="bi bi-headset me-1"></i> Contact Administrator: <strong>support@gmail.com</strong> &bull; <strong>+91 98765 43210</strong>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0"><i className="bi bi-envelope text-emerald"></i></span>
                  <input
                    type="email"
                    className="form-control border-start-0"
                    placeholder="name@example.com"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0"><i className="bi bi-key text-emerald"></i></span>
                  <input
                    type="password"
                    className="form-control border-start-0"
                    placeholder="••••••••"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-emerald w-100 py-3 fw-bold rounded-3 mb-3" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="text-center text-muted small mt-3">
              Don't have an account?{' '}
              <Link to="/register" className="text-emerald fw-bold text-decoration-none">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
