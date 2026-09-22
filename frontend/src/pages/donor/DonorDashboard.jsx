import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export const DonorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [message, setMessage] = useState('');

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/donor/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Error loading donor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleAvailability = async () => {
    if (!data) return;
    try {
      setToggling(true);
      const newStatus = !data.isAvailable;
      const res = await api.put('/donor/availability', { isAvailable: newStatus });
      setData((prev) => ({ ...prev, isAvailable: res.data.isAvailable }));
      setMessage(`Availability switched to ${res.data.isAvailable ? 'ON' : 'OFF'}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error toggling availability:', err);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: '#64748b' }}>Loading donor dashboard...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Welcome back, {data?.donorName}</h1>
        <p className="page-subtitle">Your personal blood donation overview and availability status</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      {/* Primary Status Card */}
      <div className="card" style={{ borderLeft: '4px solid #dc2626' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>
              Your Blood Group
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#dc2626' }}>
              {data?.bloodGroup}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600', marginBottom: '0.35rem' }}>
              Current Eligibility
            </div>
            <StatusBadge status={data?.eligibility?.status} />
            {data?.eligibility?.reason && (
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                {data.eligibility.reason}
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600', marginBottom: '0.35rem' }}>
              Available for Requests
            </div>
            <button
              onClick={handleToggleAvailability}
              disabled={toggling}
              className={`toggle-btn ${data?.isAvailable ? 'active' : 'inactive'}`}
              title="Click to toggle availability"
            >
              <span>{data?.isAvailable ? '🟢' : '⚪'}</span>
              <span>{data?.isAvailable ? 'Available (ON)' : 'Not Available (OFF)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simple Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Pending Blood Requests</div>
          <div className="stat-value">{data?.pendingRequestsCount ?? 0}</div>
          <div className="stat-meta">Requests awaiting your response</div>
          <div style={{ marginTop: '0.75rem' }}>
            <Link to="/donor/requests" className="btn btn-secondary btn-sm">
              View Requests
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Last Donation</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
            {data?.lastDonationDate
              ? new Date(data.lastDonationDate).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'None recorded'}
          </div>
          <div className="stat-meta">Based on your donation history</div>
          <div style={{ marginTop: '0.75rem' }}>
            <Link to="/donor/history" className="btn btn-outline btn-sm">
              View History
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Registered City</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
            {data?.city || 'Hyderabad'}
          </div>
          <div className="stat-meta">Matching hospitals in your area</div>
          <div style={{ marginTop: '0.75rem' }}>
            <Link to="/donor/profile" className="btn btn-outline btn-sm">
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Note Banner */}
      <div className="card" style={{ backgroundColor: '#f8fafc', borderStyle: 'dashed' }}>
        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
          <strong>ℹ️ Project Note:</strong> Eligibility calculations are based on simplified academic rules (Weight ≥ 50kg, 90+ days since last donation, no active fever, surgery, or chronic health condition).
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
