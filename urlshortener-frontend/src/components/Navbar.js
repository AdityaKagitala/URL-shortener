import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaLink, FaSignInAlt, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <FaLink className="brand-icon" />
          <span className="brand-text">URL Shortener</span>
        </Link>

        <div className="navbar-menu">
          {token ? (
            <>
              <Link
                to="/"
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <button onClick={handleLogout} className="nav-button logout-btn">
                <FaSignOutAlt className="btn-icon" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-button login-btn">
                <FaSignInAlt className="btn-icon" />
                Login
              </Link>
              <Link to="/signup" className="nav-button signup-btn">
                <FaUserPlus className="btn-icon" />
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
