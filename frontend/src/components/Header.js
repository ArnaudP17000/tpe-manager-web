import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaSignOutAlt, FaHome, FaList, FaUsers } from 'react-icons/fa';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          TPE Manager
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <FaHome className="me-1" />
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/tpe">
                <FaList className="me-1" />
                TPE List
              </Link>
            </li>
            {isAdmin() && (
              <li className="nav-item">
                <Link className="nav-link" to="/users">
                  <FaUsers className="me-1" />
                  Users
                </Link>
              </li>
            )}
          </ul>
          <div className="d-flex align-items-center text-white">
            <FaUser className="me-2" />
            <span className="me-3">
              {user?.username} {isAdmin() && <span className="badge bg-warning text-dark">Admin</span>}
            </span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              <FaSignOutAlt className="me-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
