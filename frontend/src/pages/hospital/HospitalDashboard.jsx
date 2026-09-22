import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export const HospitalDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/hospital/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching hospital dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', color: '#64748b' }}>Loading hospital dashboard...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">{data?.hospitalName}</h1>
        <p className="page-subtitle">Hospital Blood Operations • City: {data?.city || 'Hyderabad'}</p>
      </div>

      {/* 3 Metric Summary Boxes */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Blood Units</div>
          <div className="stat-value">{data?.totalUnits ?? 0}</div>
          <div className="stat-meta">Across all 8 blood groups</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Active Blood Requests</div>
          <div className="stat-value" style={{ color: '#ea580c' }}>
            {data?.activeRequests ?? 0}
          </div>
          <div className="stat-meta">Open patient requests</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Pending Donor Responses</div>
          <div className="stat-value" style={{ color: '#d97706' }}>
            {data?.pendingResponses ?? 0}
          </div>
          <div className="stat-meta">Matched donors awaiting response</div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontWeight: '600', fontSize: '1rem', color: '#1e293b' }}>Quick Operations</div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Quickly create blood requests or manage inventory stock</div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/hospital/requests/create" className="btn btn-primary">
            ➕ Create Blood Request
          </Link>
          <Link to="/hospital/inventory" className="btn btn-secondary">
            🩸 View Inventory
          </Link>
        </div>
      </div>

      {/* Recent Requests Section */}
      <div className="card">
        <div className="card-title">
          <span>Recent Blood Requests</span>
          <Link to="/hospital/requests" style={{ fontSize: '0.875rem' }}>
            View All Requests →
          </Link>
        </div>

        {(!data?.recentRequests || data.recentRequests.length === 0) ? (
          <div className="empty-state" style={{ padding: '1.5rem' }}>
            <p>No blood requests created yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Urgency</th>
                  <th>Required Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentRequests.map((req) => (
                  <tr key={req._id}>
                    <td style={{ fontWeight: '600' }}>{req.patientName}</td>
                    <td>
                      <span style={{ fontWeight: '700', color: '#dc2626' }}>{req.bloodGroup}</span>
                    </td>
                    <td>{req.units} unit(s)</td>
                    <td>
                      <StatusBadge status={req.urgency} />
                    </td>
                    <td>
                      {req.requiredDate
                        ? new Date(req.requiredDate).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Immediate'}
                    </td>
                    <td>
                      <StatusBadge status={req.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard;
