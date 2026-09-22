import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="top-navbar">
      <div className="navbar-breadcrumb">
        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Portal / {user?.role === 'donor' ? 'Donor Workspace' : 'Hospital Workspace'}
        </span>
      </div>

      <div className="navbar-user">
        <div style={{ textAlign: 'right' }}>
          <div className="user-name">{user?.name}</div>
          <div className="user-role-label">
            Role: <strong style={{ color: '#dc2626', textTransform: 'capitalize' }}>{user?.role}</strong>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-outline btn-sm">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
