import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export const DonorBloodRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/donor/requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching donor requests:', err);
      setError('Failed to load blood requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRespond = async (responseId, status) => {
    try {
      setProcessingId(responseId);
      setMessage('');
      setError('');

      await api.put(`/donor/requests/${responseId}/respond`, { status });

      setMessage(`Blood request successfully ${status.toLowerCase()}!`);
      // Update locally
      setRequests((prev) =>
        prev.map((r) => (r.responseId === responseId ? { ...r, status } : r))
      );
    } catch (err) {
      console.error('Error responding to request:', err);
      setError(err.response?.data?.message || 'Failed to update response.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: '#64748b' }}>Loading blood requests...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Blood Requests</h1>
        <p className="page-subtitle">Hospital requests matched to your blood group and city</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {requests.length === 0 ? (
        <div className="card empty-state">
          <div style={{ fontSize: '2.5rem' }}>📬</div>
          <p style={{ fontWeight: '600' }}>No Blood Requests at this time</p>
          <p>When hospitals in your city request matching blood units, they will appear here.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Hospital Name</th>
                <th>Blood Group</th>
                <th>Units Required</th>
                <th>City</th>
                <th>Urgency</th>
                <th>Required Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.responseId}>
                  <td style={{ fontWeight: '600' }}>{req.hospitalName}</td>
                  <td>
                    <span style={{ fontWeight: '700', color: '#dc2626' }}>{req.bloodGroup}</span>
                  </td>
                  <td>{req.units} unit(s)</td>
                  <td>{req.city}</td>
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
                  <td>
                    {req.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleRespond(req.responseId, 'Accepted')}
                          disabled={processingId === req.responseId}
                          className="btn btn-success btn-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespond(req.responseId, 'Rejected')}
                          disabled={processingId === req.responseId}
                          className="btn btn-danger btn-sm"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.825rem', color: '#64748b' }}>
                        Responded ({req.status})
                      </span>
                    )}
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

export default DonorBloodRequests;
