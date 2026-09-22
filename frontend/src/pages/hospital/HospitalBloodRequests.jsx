import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export const HospitalBloodRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await api.get('/hospital/requests');
        setRequests(res.data);
      } catch (err) {
        console.error('Error fetching hospital requests:', err);
        setError('Failed to load blood requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', color: '#64748b' }}>Loading hospital requests...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Blood Requests</h1>
          <p className="page-subtitle">All patient blood requirements submitted by your hospital</p>
        </div>
        <Link to="/hospital/requests/create" className="btn btn-primary">
          ➕ New Blood Request
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {requests.length === 0 ? (
        <div className="card empty-state">
          <div style={{ fontSize: '2.5rem' }}>📋</div>
          <p style={{ fontWeight: '600' }}>No Requests Created Yet</p>
          <p>Create a blood request to match with available city donors.</p>
          <div style={{ marginTop: '1rem' }}>
            <Link to="/hospital/requests/create" className="btn btn-primary btn-sm">
              Create Blood Request
            </Link>
          </div>
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
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
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
                  <td style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '250px' }}>
                    {req.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HospitalBloodRequests;
