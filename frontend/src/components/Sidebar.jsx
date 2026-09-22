import React from 'react';
import { NavLink } from 'react-router-dom';

export const Sidebar = ({ role }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="brand-icon">🩸</span>
        <div>
          <div className="brand-title">Blood Donation</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Management System</div>
        </div>
        <span className="role-badge">{role}</span>
      </div>

      <nav className="sidebar-nav">
        {role === 'donor' && (
          <>
            <NavLink
              to="/donor/dashboard"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span>📊</span>
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/donor/profile"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span>👤</span>
              <span>Donor Profile</span>
            </NavLink>
            <NavLink
              to="/donor/requests"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span>📩</span>
              <span>Blood Requests</span>
            </NavLink>
            <NavLink
              to="/donor/history"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span>📜</span>
              <span>Donation History</span>
            </NavLink>
          </>
        )}

        {role === 'hospital' && (
          <>
            <NavLink
              to="/hospital/dashboard"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span>🏥</span>
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/hospital/inventory"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span>🩸</span>
              <span>Blood Inventory</span>
            </NavLink>
            <NavLink
              to="/hospital/requests/create"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span>➕</span>
              <span>Create Request</span>
            </NavLink>
            <NavLink
              to="/hospital/requests"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span>📋</span>
              <span>Blood Requests</span>
            </NavLink>
            <NavLink
              to="/hospital/responses"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span>🤝</span>
              <span>Donor Responses</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Student Project v1.0
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
