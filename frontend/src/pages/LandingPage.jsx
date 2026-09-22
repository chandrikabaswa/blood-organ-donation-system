import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    if (role === 'donor') return <Navigate to="/donor/dashboard" replace />;
    if (role === 'hospital') return <Navigate to="/hospital/dashboard" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.75rem', color: '#dc2626' }}>🩸</span>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#dc2626' }}>
            Blood Donation Management System
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/login" className="btn btn-secondary">
            Login
          </Link>
          <Link to="/register" className="btn btn-primary">
            Register
          </Link>
        </div>
      </header>

      {/* Main Banner */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          maxWidth: '850px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            fontWeight: '600',
            fontSize: '0.85rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}
        >
          Simplified Academic Student Project
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '1rem', lineHeight: '1.2' }}>
          Connecting Blood Donors & Hospitals Seamlessly
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '2rem', maxWidth: '650px' }}>
          A dedicated, role-separated management platform designed to help hospitals request matching blood units and empower donors to save lives in their city.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
            Get Started as Donor or Hospital
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
            Sign In to Existing Account
          </Link>
        </div>

        {/* Feature Highlights */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginTop: '3.5rem',
            width: '100%',
            textAlign: 'left',
          }}
        >
          <div className="card" style={{ margin: 0 }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>👤 For Donors</div>
            <p style={{ color: '#64748b', fontSize: '0.925rem' }}>
              Maintain your donation profile, view automated eligibility calculations, toggle availability, and respond directly to local hospital blood requests.
            </p>
          </div>
          <div className="card" style={{ margin: 0 }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>🏥 For Hospitals</div>
            <p style={{ color: '#64748b', fontSize: '0.925rem' }}>
              Track real-time inventory for 8 blood groups, create urgent patient blood requests, and automatically connect with eligible city donors.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          textAlign: 'center',
          padding: '1.5rem',
          borderTop: '1px solid #e2e8f0',
          color: '#94a3b8',
          fontSize: '0.85rem',
          backgroundColor: '#ffffff',
        }}
      >
        Blood Donation Management System • Built with React, Vite, Node.js & Express
      </footer>
    </div>
  );
};

export default LandingPage;
