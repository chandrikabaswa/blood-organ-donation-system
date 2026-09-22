import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export const DonorResponses = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        setLoading(true);
        const res = await api.get('/hospital/responses');
        setResponses(res.data);
      } catch (err) {
        console.error('Error fetching donor responses:', err);
        setError('Failed to load donor responses.');
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', color: '#64748b' }}>Loading donor responses...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Donor Responses</h1>
        <p className="page-subtitle">Track matched donors and their responses to your patient blood requests</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {responses.length === 0 ? (
        <div className="card empty-state">
          <div style={{ fontSize: '2.5rem' }}>🤝</div>
          <p style={{ fontWeight: '600' }}>No Responses Found</p>
          <p>When you create blood requests that match available donors in your city, their response status will appear here.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Donor Name</th>
                <th>Blood Group</th>
                <th>City</th>
                <th>Contact Phone</th>
                <th>Request Details</th>
                <th>Response Status</th>
                <th>Response Date</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((item) => (
                <tr key={item._id}>
                  <td style={{ fontWeight: '600' }}>{item.donorName}</td>
                  <td>
                    <span style={{ fontWeight: '700', color: '#dc2626' }}>{item.donorBloodGroup}</span>
                  </td>
                  <td>{item.donorCity}</td>
                  <td>
                    {item.status === 'Accepted' ? (
                      <strong style={{ color: '#16a34a' }}>{item.donorPhone}</strong>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>Available on accept</span>
                    )}
                  </td>
                  <td>
                    {item.request ? (
                      <div>
                        <strong>{item.request.patientName}</strong> ({item.request.units} unit)
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Urgency: {item.request.urgency}
                        </div>
                      </div>
                    ) : (
                      'Blood Request'
                    )}
                  </td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td>
                    {item.responseDate
                      ? new Date(item.responseDate).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Pending response'}
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

export default DonorResponses;
