import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Register = () => {
  const [role, setRole] = useState('donor'); // 'donor' | 'hospital'

  // Common Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  // Donor Specific Fields
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [dob, setDob] = useState('2000-01-01');
  const [gender, setGender] = useState('Male');
  const [weight, setWeight] = useState(55);
  const [takingMedication, setTakingMedication] = useState('No');
  const [chronicDisease, setChronicDisease] = useState('None');
  const [otherDiseaseName, setOtherDiseaseName] = useState('');
  const [recentSurgery, setRecentSurgery] = useState('No');
  const [recentFever, setRecentFever] = useState('No');

  // Hospital Specific Fields
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [address, setAddress] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const payload = {
      role,
      name,
      email,
      password,
      phone,
      city,
    };

    if (role === 'donor') {
      payload.bloodGroup = bloodGroup;
      payload.dob = dob;
      payload.gender = gender;
      payload.weight = Number(weight);
      payload.takingMedication = takingMedication;
      payload.chronicDisease = chronicDisease;
      payload.otherDiseaseName = chronicDisease === 'Other' ? otherDiseaseName : '';
      payload.recentSurgery = recentSurgery;
      payload.recentFever = recentFever;
    } else {
      payload.registrationNumber = registrationNumber;
      payload.address = address;
    }

    try {
      setSubmitting(true);
      const user = await register(payload);
      if (user.role === 'donor') {
        navigate('/donor/dashboard');
      } else {
        navigate('/hospital/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please check your information.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ padding: '2rem 1rem' }}>
      <div className="auth-card" style={{ maxWidth: '580px' }}>
        <div className="auth-header">
          <span style={{ fontSize: '2rem' }}>🩸</span>
          <h1>Create Account</h1>
          <p>Register as a Donor or Hospital</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label required">Select Your Role</label>
            <div className="role-selector">
              <div
                className={`role-option ${role === 'donor' ? 'selected' : ''}`}
                onClick={() => setRole('donor')}
              >
                <span>👤</span>
                <span>Blood Donor</span>
              </div>
              <div
                className={`role-option ${role === 'hospital' ? 'selected' : ''}`}
                onClick={() => setRole('hospital')}
              >
                <span>🏥</span>
                <span>Hospital</span>
              </div>
            </div>
            <p className="form-help">Note: Roles cannot be changed after registration.</p>
          </div>

          {/* Common Fields */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">
                {role === 'donor' ? 'Full Name' : 'Hospital Name'}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={role === 'donor' ? 'e.g. Chandrika' : 'e.g. City General Hospital'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Confirm Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">City</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Hyderabad"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Role-Specific Fields */}
          {role === 'donor' ? (
            <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem', color: '#dc2626' }}>
                Donor Information
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Blood Group</label>
                  <select
                    className="form-select"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
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
                  <p className="form-help">Fixed and permanent upon registration.</p>
                </div>

                <div className="form-group">
                  <label className="form-label required">Date of Birth</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Gender</label>
                  <select
                    className="form-select"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label required">Weight (kg)</label>
                  <input
                    type="number"
                    min="30"
                    max="200"
                    className="form-input"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                  />
                  <p className="form-help">Minimum 50 kg for eligibility</p>
                </div>
              </div>

              <h4 style={{ fontSize: '0.875rem', fontWeight: '700', marginTop: '0.5rem', marginBottom: '0.75rem', color: '#475569' }}>
                Basic Health Questions
              </h4>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Taking Medication?</label>
                  <select
                    className="form-select"
                    value={takingMedication}
                    onChange={(e) => setTakingMedication(e.target.value)}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Chronic Disease?</label>
                  <select
                    className="form-select"
                    value={chronicDisease}
                    onChange={(e) => setChronicDisease(e.target.value)}
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

              {chronicDisease === 'Other' && (
                <div className="form-group">
                  <label className="form-label required">Disease Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Specify chronic condition"
                    value={otherDiseaseName}
                    onChange={(e) => setOtherDiseaseName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Recent Surgery?</label>
                  <select
                    className="form-select"
                    value={recentSurgery}
                    onChange={(e) => setRecentSurgery(e.target.value)}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Recent Fever?</label>
                  <select
                    className="form-select"
                    value={recentFever}
                    onChange={(e) => setRecentFever(e.target.value)}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem', color: '#dc2626' }}>
                Hospital Details
              </h3>

              <div className="form-group">
                <label className="form-label required">Hospital Registration / License No.</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. HOSP-HYD-2024-01"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Hospital Address</label>
                <textarea
                  className="form-textarea"
                  placeholder="Full street address and area"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={submitting}
          >
            {submitting ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: '600' }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
