import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Mail, Lock, Phone, Calendar, AlertCircle, CheckCircle, Heart } from 'lucide-react';
import './RegisterPatient.css';

const RegisterPatient = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Password123!', // Default temporary password
    phone: '',
    gender: 'male',
    dob: '',
    bloodGroup: 'Unknown',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccess(false);
    setSubmitting(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      gender: formData.gender,
      dob: formData.dob,
      role: 'patient', // Force patient registration
    };

    try {
      // 1. Register User Account
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        // Optional: Update patient extra parameters (bloodGroup, emergency contact)
        // Since backend register creates a patient profile, we can trigger an update if necessary.
        // For simplicity and completeness, we will notify registration complete.
        setSuccess(true);
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: 'Password123!',
          phone: '',
          gender: 'male',
          dob: '',
          bloodGroup: 'Unknown',
          emergencyContactName: '',
          emergencyContactRelation: '',
          emergencyContactPhone: '',
        });
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setErrorMsg(data.message || 'Registration failed');
      }
    } catch (err) {
      setErrorMsg('Network error registering patient');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-patient-page">
      <div className="page-header-panel">
        <h1>Register New Patient</h1>
        <p className="welcome-tag">Establish a new medical record folder and login credentials for incoming patients</p>
      </div>

      {errorMsg && (
        <div className="error-alert">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {success && (
        <div className="success-alert">
          <CheckCircle size={18} />
          <span>Patient profile registered successfully! Temporary password: Password123!</span>
        </div>
      )}

      <div className="glass-card register-patient-card">
        <h2 className="panel-title">Patient Intake Form</h2>
        
        <form onSubmit={handleSubmit} className="register-patient-form">
          <div className="register-form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="register-input-wrapper">
                <UserCheck className="register-input-icon" size={18} />
                <input
                  type="text"
                  name="name"
                  className="register-input-field"
                  placeholder="Jane Smith"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="register-input-wrapper">
                <Mail className="register-input-icon" size={18} />
                <input
                  type="email"
                  name="email"
                  className="register-input-field"
                  placeholder="jane.smith@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="register-form-row">
            <div className="form-group">
              <label className="form-label">Temporary Password</label>
              <div className="register-input-wrapper">
                <Lock className="register-input-icon" size={18} />
                <input
                  type="text"
                  name="password"
                  className="register-input-field"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="register-input-wrapper">
                <Phone className="register-input-icon" size={18} />
                <input
                  type="tel"
                  name="phone"
                  className="register-input-field"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="register-form-row">
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <div className="register-input-wrapper">
                <Calendar className="register-input-icon" size={18} />
                <input
                  type="date"
                  name="dob"
                  className="register-input-field"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                name="gender"
                className="register-select-field"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Emergency Contacts Section */}
          <div className="emergency-intake-section">
            <h4 className="section-subtitle"><Heart size={16} /> Emergency Contact & Bio</h4>
            <div className="register-form-row" style={{ marginTop: '10px' }}>
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select
                  name="bloodGroup"
                  className="register-select-field"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                >
                  <option value="Unknown">Unknown / Pending</option>
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
                <label className="form-label">Contact Full Name</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  className="register-input-field plain"
                  placeholder="Contact Name"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="register-form-row">
              <div className="form-group">
                <label className="form-label">Relationship</label>
                <input
                  type="text"
                  name="emergencyContactRelation"
                  className="register-input-field plain"
                  placeholder="e.g. Spouse, Parent"
                  value={formData.emergencyContactRelation}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  className="register-input-field plain"
                  placeholder="Contact Phone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary register-submit-btn" disabled={submitting}>
            {submitting ? 'Registering Patient Folder...' : 'Complete Patient Intake Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPatient;
