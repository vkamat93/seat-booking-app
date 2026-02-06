/**
 * Navbar Component
 * Navigation bar with auth status and logout
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { APP_VERSION } from '../utils/constants';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't show full navbar if user must change password
  const showFullNav = isAuthenticated && !user?.mustChangePassword;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Desk Booking App
          <span className="app-version">v{APP_VERSION}</span>
        </Link>
        
        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              {showFullNav && (
                <span className="navbar-user">
                  Welcome, <strong>{user.username}</strong>
                </span>
              )}
              <button onClick={handleLogout} className="btn btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
