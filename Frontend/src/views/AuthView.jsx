import React, { useState } from 'react';
import { api } from '../services/api';

export default function AuthView({ onLoginSuccess, showNotification }) {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('customer'); // customer, owner, admin
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error("Name is required");
        const userPayload = { name, email, passwordHash: password, role };
        await api.auth.register(userPayload);
        showNotification("Registration successful! Please login.", "success");
        setIsRegister(false);
        setPassword('');
      } else {
        const response = await api.auth.login(email, password);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        showNotification(`Welcome back, ${response.user.name}!`, "success");
        onLoginSuccess(response.user);
      }
    } catch (err) {
      showNotification(err.message || "Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-box glass-panel">
      <div className="auth-header">
        <div className="logo" style={{ justifyContent: 'center', marginBottom: '16px' }}>
          <i className="fa-solid fa-circle-nodes"></i>
          <span>TurfReserve</span>
        </div>
        <h2>{isRegister ? "Create Account" : "Welcome Back"}</h2>
        <p>{isRegister ? "Join as a Player or Turf Owner" : "Sign in to manage your turf bookings"}</p>
      </div>

      <form onSubmit={handleSubmit}>
        {isRegister && (
          <div className="role-switch-container">
            <div 
              className={`role-switch-btn ${role === 'customer' ? 'active' : ''}`}
              onClick={() => setRole('customer')}
            >
              Customer
            </div>
            <div 
              className={`role-switch-btn ${role === 'owner' ? 'active' : ''}`}
              onClick={() => setRole('owner')}
            >
              Turf Owner
            </div>
          </div>
        )}

        {isRegister && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="John Doe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input 
            type="email" 
            className="form-control" 
            placeholder="you@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: '30px' }}>
          <label className="form-label">Password</label>
          <input 
            type="password" 
            className="form-control" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
          {loading ? (
            <span><i className="fa-solid fa-spinner fa-spin"></i> Processing...</span>
          ) : (
            <span>{isRegister ? "Create Account" : "Sign In"}</span>
          )}
        </button>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {isRegister ? "Already have an account?" : "Don't have an account yet?"}
          </span>{" "}
          <span 
            style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => {
              setIsRegister(!isRegister);
              setName('');
              setRole('customer');
            }}
          >
            {isRegister ? "Sign In" : "Register Now"}
          </span>
        </div>
      </form>
    </div>
  );
}
