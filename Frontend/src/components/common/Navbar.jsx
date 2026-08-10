import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
  const { user, isAuthenticated, hasRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:8080${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const userAvatar = formatImageUrl(user?.profileImage);
  const isBlocked = user && (user.status === 'BLOCKED' || user.status === 'SUSPENDED');

  return (
    <nav className="navbar navbar-expand-lg sticky-top navbar-dark bg-dark shadow-sm">
      <div className="container">
        {/* Official Brand Logo: ArenaSync */}
        <Link className="navbar-brand d-flex align-items-center fw-bold fs-4 text-white" to="/">
          <img
            src="/assets/arenasync-logo.png"
            alt="ArenaSync Logo"
            className="me-2 rounded-circle border border-emerald p-1 bg-white shadow-sm"
            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
          />
          <span>Arena<span className="text-emerald">Sync</span></span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link px-3" to="/">
                <i className="bi bi-house me-1"></i> Home
              </NavLink>
            </li>

            {/* Customer specific links */}
            {isAuthenticated && hasRole('CUSTOMER') && (
              <li className="nav-item">
                <NavLink className="nav-link px-3" to="/my-bookings">
                  <i className="bi bi-calendar-check me-1"></i> My Bookings
                </NavLink>
              </li>
            )}

            {/* Owner specific links */}
            {isAuthenticated && hasRole('OWNER') && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link px-3" to="/owner/dashboard">
                    <i className="bi bi-speedometer2 me-1"></i> Owner Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link px-3" to="/owner/turfs">
                    <i className="bi bi-grid me-1"></i> My Turfs
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link px-3" to="/owner/add-turf">
                    <i className="bi bi-plus-circle me-1"></i> Add Turf
                  </NavLink>
                </li>
              </>
            )}

            {/* Admin specific links */}
            {isAuthenticated && hasRole('ADMIN') && (
              <li className="nav-item">
                <NavLink className="nav-link px-3 text-warning" to="/admin/dashboard">
                  <i className="bi bi-shield-lock me-1"></i> Admin Portal
                </NavLink>
              </li>
            )}
          </ul>

          {/* Right Action Buttons */}
          <div className="d-flex align-items-center gap-2">
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className={`btn dropdown-toggle d-flex align-items-center gap-2 rounded-pill px-3 ${isBlocked ? 'btn-outline-danger' : 'btn-outline-light'}`}
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="Avatar"
                      className="rounded-circle object-fit-cover border border-emerald"
                      style={{ width: '28px', height: '28px' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <i className={`bi bi-person-circle fs-5 ${isBlocked ? 'text-danger' : 'text-emerald'}`}></i>
                  )}
                  <span>{user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.name || user?.email)}</span>
                  {isBlocked ? (
                    <span className="badge bg-danger ms-1 text-uppercase" style={{ fontSize: '0.65rem' }}>
                      BLOCKED
                    </span>
                  ) : (
                    <span className="badge bg-emerald ms-1 text-uppercase" style={{ fontSize: '0.65rem' }}>
                      {user?.role?.replace('ROLE_', '')}
                    </span>
                  )}
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2" aria-labelledby="userDropdown">
                  <li>
                    <Link className="dropdown-item py-2" to="/profile">
                      <i className="bi bi-person me-2 text-primary"></i> Profile Settings
                    </Link>
                  </li>
                  {hasRole('CUSTOMER') && (
                    <li>
                      <Link className="dropdown-item py-2" to="/my-bookings">
                        <i className="bi bi-receipt me-2 text-success"></i> My Bookings
                      </Link>
                    </li>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger py-2" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-light rounded-pill px-4 me-1">
                  Login
                </Link>
                <Link to="/register" className="btn btn-emerald rounded-pill px-4">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
