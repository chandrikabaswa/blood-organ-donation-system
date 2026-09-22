import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export const CreateBloodRequest = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'O+',
    units: 1,
    urgency: 'Normal',
    requiredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessData(null);

    if (!formData.patientName || !formData.units || !formData.requiredDate) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/hospital/requests', {
        ...formData,
        units: Number(formData.units),
      });

      setSuccessData(res.data);
    } catch (err) {
      console.error('Error creating request:', err);
      setError(err.response?.data?.message || 'Failed to create blood request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Create Blood Request</h1>
        <p className="page-subtitle">Submit a patient requirement and automatically match city donors</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {successData ? (
        <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.75rem' }}>✅</span>
            <div>
              <h2 style={{ fontSize: '1.2rem', color: '#16a34a', fontWeight: '700' }}>
                Blood Request Created Successfully!
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                {successData.message}
              </p>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#f8fafc',
              padding: '1rem',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
              marginBottom: '1.5rem',
            }}
          >
            <p style={{ fontSize: '0.9rem', marginBottom: '0.35rem' }}>
              <strong>Patient:</strong> {successData.request?.patientName}
            </p>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.35rem' }}>
              <strong>Blood Group:</strong> {successData.request?.bloodGroup} | <strong>Units:</strong> {successData.request?.units}
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              <strong>Matching Eligible Donors in City:</strong> {successData.matchedDonorsCount} donor(s)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/hospital/requests" className="btn btn-primary">
              View Hospital Requests
            </Link>
            <Link to="/hospital/responses" className="btn btn-secondary">
              View Donor Responses
            </Link>
            <button
              onClick={() => {
                setSuccessData(null);
                setFormData({
                  patientName: '',
                  bloodGroup: 'O+',
                  units: 1,
                  urgency: 'Normal',
                  requiredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                  notes: '',
                });
              }}
              className="btn btn-outline"
            >
              Create Another Request
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ maxWidth: '680px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label required">Patient Full Name</label>
              <input
                type="text"
                name="patientName"
                className="form-input"
                placeholder="e.g. Ramesh Kumar"
                value={formData.patientName}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Blood Group Required</label>
                <select
                  name="bloodGroup"
                  className="form-select"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Units Required</label>
                <input
                  type="number"
                  name="units"
                  min="1"
                  max="50"
                  className="form-input"
                  value={formData.units}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Urgency Level</label>
                <select
                  name="urgency"
                  className="form-select"
                  value={formData.urgency}
                  onChange={handleChange}
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Date Needed By</label>
                <input
                  type="date"
                  name="requiredDate"
                  className="form-input"
                  value={formData.requiredDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Notes / Reason</label>
              <textarea
                name="notes"
                className="form-textarea"
                placeholder="e.g. Scheduled cardiac bypass surgery on Thursday"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => navigate('/hospital/dashboard')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? 'Matching Donors...' : 'Create Request'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CreateBloodRequest;
