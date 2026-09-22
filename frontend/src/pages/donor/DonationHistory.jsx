import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export const DonationHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/donor/history');
        setHistory(res.data);
      } catch (err) {
        console.error('Error fetching donation history:', err);
        setError('Failed to load donation history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', color: '#64748b' }}>Loading donation history...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Donation History</h1>
        <p className="page-subtitle">Record of your past blood donation contributions</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {history.length === 0 ? (
        <div className="card empty-state">
          <div style={{ fontSize: '2.5rem' }}>📜</div>
          <p style={{ fontWeight: '600' }}>No Donation Records Yet</p>
          <p>Your completed blood donations will be recorded in this table.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Hospital</th>
                <th>Date</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item._id}>
                  <td style={{ fontWeight: '600' }}>{item.hospitalName}</td>
                  <td>
                    {new Date(item.date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td>
                    <span style={{ fontWeight: '700', color: '#dc2626' }}>{item.bloodGroup}</span>
                  </td>
                  <td>{item.units} unit(s)</td>
                  <td>
                    <StatusBadge status={item.status || 'Completed'} />
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

export default DonationHistory;
