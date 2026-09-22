import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export const DonorProfile = () => {
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile data from backend
  const [originalData, setOriginalData] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dob: '',
    gender: 'Male',
    bloodGroup: '',
    phone: '',
    city: '',
    weight: 55,
    lastDonationDate: '',
    takingMedication: 'No',
    chronicDisease: 'None',
    otherDiseaseName: '',
    recentSurgery: 'No',
    recentFever: 'No',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/donor/profile');
      const donor = res.data.donor;
      const initial = {
        fullName: donor.fullName || '',
        email: res.data.email || '',
        dob: donor.dob ? donor.dob.split('T')[0] : '',
        gender: donor.gender || 'Male',
        bloodGroup: donor.bloodGroup || '',
        phone: donor.phone || '',
        city: donor.city || '',
        weight: donor.weight || 55,
        lastDonationDate: donor.lastDonationDate ? donor.lastDonationDate.split('T')[0] : '',
        takingMedication: donor.takingMedication || 'No',
        chronicDisease: donor.chronicDisease || 'None',
        otherDiseaseName: donor.otherDiseaseName || '',
        recentSurgery: donor.recentSurgery || 'No',
        recentFever: donor.recentFever || 'No',
      };
      setOriginalData(donor);
      setFormData(initial);
    } catch (err) {
      console.error('Error fetching donor profile:', err);
      setErrorMsg('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleCancel = () => {
    if (originalData) {
      setFormData({
        fullName: originalData.fullName || '',
        email: formData.email,
        dob: originalData.dob ? originalData.dob.split('T')[0] : '',
        gender: originalData.gender || 'Male',
        bloodGroup: originalData.bloodGroup || '',
        phone: originalData.phone || '',
        city: originalData.city || '',
        weight: originalData.weight || 55,
        lastDonationDate: originalData.lastDonationDate ? originalData.lastDonationDate.split('T')[0] : '',
        takingMedication: originalData.takingMedication || 'No',
        chronicDisease: originalData.chronicDisease || 'None',
        otherDiseaseName: originalData.otherDiseaseName || '',
        recentSurgery: originalData.recentSurgery || 'No',
        recentFever: originalData.recentFever || 'No',
      });
    }
    setIsEditing(false);
    setErrorMsg('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.put('/donor/profile', {
        fullName: formData.fullName,
        dob: formData.dob,
        gender: formData.gender,
        phone: formData.phone,
        city: formData.city,
        weight: formData.weight,
        lastDonationDate: formData.lastDonationDate || null,
        takingMedication: formData.takingMedication,
        chronicDisease: formData.chronicDisease,
        otherDiseaseName: formData.chronicDisease === 'Other' ? formData.otherDiseaseName : '',
        recentSurgery: formData.recentSurgery,
        recentFever: formData.recentFever,
      });

      setOriginalData(res.data.donor);
      updateUser({ name: res.data.donor.fullName });
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully! Eligibility has been recalculated.');
    } catch (err) {
      console.error('Error saving profile:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: '#64748b' }}>Loading donor profile...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Donor Profile</h1>
          <p className="page-subtitle">View and maintain your personal and health information</p>
        </div>

        <div>
          {!isEditing ? (
            <button onClick={handleEditClick} className="btn btn-primary">
              ✏️ Edit Profile
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
              <button onClick={handleCancel} disabled={saving} className="btn btn-secondary">
                ✕ Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

      {/* Eligibility Summary Banner */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
            Current Calculated Eligibility
          </div>
          <div style={{ fontSize: '0.9rem', color: '#1e293b', marginTop: '0.2rem' }}>
            {originalData?.eligibility?.reason}
          </div>
        </div>
        <div>
          <StatusBadge status={originalData?.eligibility?.status} />
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* Section 1: Personal Information */}
        <div className="card">
          <h2 className="card-title">1. Personal Information</h2>
          <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '1rem' }}>
            {isEditing
              ? 'Edit your personal details below. Note that Blood Group is permanent and cannot be modified.'
              : 'Personal details are read-only. Click "Edit Profile" above to make changes.'}
          </p>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Full Name</label>
              <input
                type="text"
                name="fullName"
                className="form-input"
                value={formData.fullName}
                onChange={handleChange}
                readOnly={!isEditing}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                readOnly
                title="Email cannot be edited"
              />
              <p className="form-help">Primary account identifier</p>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Blood Group</label>
              {/* Blood Group MUST ALWAYS BE READ-ONLY AS REQUESTED */}
              <input
                type="text"
                className="form-input"
                value={formData.bloodGroup}
                readOnly
                title="Blood Group is fixed and cannot be changed"
                style={{ fontWeight: '700', color: '#dc2626' }}
              />
              <p className="form-help">Fixed parameter (Read-only)</p>
            </div>

            <div className="form-group">
              <label className="form-label required">Date of Birth</label>
              <input
                type="date"
                name="dob"
                className="form-input"
                value={formData.dob}
                onChange={handleChange}
                readOnly={!isEditing}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Gender</label>
              <select
                name="gender"
                className="form-select"
                value={formData.gender}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
                readOnly={!isEditing}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">City</label>
              <input
                type="text"
                name="city"
                className="form-input"
                value={formData.city}
                onChange={handleChange}
                readOnly={!isEditing}
                required
              />
              <p className="form-help">Used for hospital request matching</p>
            </div>
          </div>
        </div>

        {/* Section 2: Health Information */}
        <div className="card">
          <h2 className="card-title">2. Health Information</h2>
          <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '1rem' }}>
            Health factors are used by the system to compute whether you are eligible to donate.
          </p>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                min="30"
                max="200"
                className="form-input"
                value={formData.weight}
                onChange={handleChange}
                readOnly={!isEditing}
                required
              />
              <p className="form-help">Minimum required: 50 kg</p>
            </div>

            <div className="form-group">
              <label className="form-label">Last Donation Date</label>
              <input
                type="date"
                name="lastDonationDate"
                className="form-input"
                value={formData.lastDonationDate}
                onChange={handleChange}
                readOnly={!isEditing}
              />
              <p className="form-help">Minimum interval: 90 days</p>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Currently taking medication?</label>
              <select
                name="takingMedication"
                className="form-select"
                value={formData.takingMedication}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Chronic disease?</label>
              <select
                name="chronicDisease"
                className="form-select"
                value={formData.chronicDisease}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="None">None</option>
                <option value="Diabetes">Diabetes</option>
                <option value="Hypertension">Hypertension</option>
                <option value="Heart Disease">Heart Disease</option>
                <option value="Kidney Disease">Kidney Disease</option>
                <option value="Asthma">Asthma</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Conditional Input if Chronic Disease = Other */}
          {formData.chronicDisease === 'Other' && (
            <div className="form-group">
              <label className="form-label required">Disease Name</label>
              <input
                type="text"
                name="otherDiseaseName"
                className="form-input"
                placeholder="Specify chronic condition name"
                value={formData.otherDiseaseName}
                onChange={handleChange}
                readOnly={!isEditing}
                required
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Recent Surgery?</label>
              <select
                name="recentSurgery"
                className="form-select"
                value={formData.recentSurgery}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Recent Fever?</label>
              <select
                name="recentFever"
                className="form-select"
                value={formData.recentFever}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>
        </div>

        {isEditing && (
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginBottom: '2rem' }}>
            <button type="button" onClick={handleCancel} disabled={saving} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default DonorProfile;
