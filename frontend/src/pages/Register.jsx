import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, User as UserIcon, Phone, Calendar, AlertCircle } from 'lucide-react';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    gender: 'male',
    dob: '',
    role: 'patient',
    specialty: '',
    qualification: '',
    experienceYears: '',
    fees: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Field Validations
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    // Prepare payload
    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      gender: formData.gender,
      dob: formData.dob,
      role: formData.role,
    };

    // If role is doctor, add doctor specific fields
    if (formData.role === 'doctor') {
      payload.specialty = formData.specialty;
      payload.qualification = formData.qualification;
      payload.experienceYears = Number(formData.experienceYears);
      payload.fees = Number(formData.fees);
    }

    try {
      const result = await register(payload);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrorMsg(result.message || 'Registration failed');
      }
    } catch (err) {
      setErrorMsg('Something went wrong. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-glass-box">
        <div className="register-logo-header">
          <Activity className="register-brand-icon" size={32} />
          <h1 className="register-brand-title">ApexCare</h1>
        </div>

        <h2 className="register-form-title">Create Account</h2>
        <p className="register-form-subtitle">Register to manage appointments, billing and records</p>

        {errorMsg && (
          <div className="register-error-alert">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          {/* General Fields */}
          <div className="register-form-row">
            <div className="register-input-group">
              <label className="register-input-label">Full Name</label>
              <div className="register-input-wrapper">
                <UserIcon className="register-input-icon" size={18} />
                <input
                  type="text"
                  name="name"
                  className="register-input-field"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="register-input-group">
              <label className="register-input-label">Email Address</label>
              <div className="register-input-wrapper">
                <Mail className="register-input-icon" size={18} />
                <input
                  type="email"
                  name="email"
                  className="register-input-field"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="register-form-row">
            <div className="register-input-group">
              <label className="register-input-label">Password</label>
              <div className="register-input-wrapper">
                <Lock className="register-input-icon" size={18} />
                <input
                  type="password"
                  name="password"
                  className="register-input-field"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="register-input-group">
              <label className="register-input-label">Confirm Password</label>
              <div className="register-input-wrapper">
                <Lock className="register-input-icon" size={18} />
                <input
                  type="password"
                  name="confirmPassword"
                  className="register-input-field"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="register-form-row">
            <div className="register-input-group">
              <label className="register-input-label">Phone Number</label>
              <div className="register-input-wrapper">
                <Phone className="register-input-icon" size={18} />
                <input
                  type="tel"
                  name="phone"
                  className="register-input-field"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="register-input-group">
              <label className="register-input-label">Date of Birth</label>
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
          </div>

          <div className="register-form-row">
            <div className="register-input-group">
              <label className="register-input-label">Gender</label>
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

            <div className="register-input-group">
              <label className="register-input-label">Account Role</label>
              <select
                name="role"
                className="register-select-field"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="patient">Patient (Default)</option>
                <option value="doctor">Doctor</option>
                <option value="staff">Staff/Receptionist</option>
              </select>
            </div>
          </div>

          {/* Conditional Doctor Fields */}
          {formData.role === 'doctor' && (
            <div className="doctor-extra-section animate-slideUp">
              <h3 className="doctor-section-title">Doctor Credentials</h3>
              <div className="register-form-row">
                <div className="register-input-group">
                  <label className="register-input-label">Specialty</label>
                  <input
                    type="text"
                    name="specialty"
                    className="register-input-field plain"
                    placeholder="e.g. Cardiology, Pediatrics"
                    value={formData.specialty}
                    onChange={handleChange}
                    required={formData.role === 'doctor'}
                  />
                </div>

                <div className="register-input-group">
                  <label className="register-input-label">Qualifications</label>
                  <input
                    type="text"
                    name="qualification"
                    className="register-input-field plain"
                    placeholder="e.g. MD, MBBS"
                    value={formData.qualification}
                    onChange={handleChange}
                    required={formData.role === 'doctor'}
                  />
                </div>
              </div>

              <div className="register-form-row">
                <div className="register-input-group">
                  <label className="register-input-label">Experience (Years)</label>
                  <input
                    type="number"
                    name="experienceYears"
                    className="register-input-field plain"
                    placeholder="5"
                    min="0"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    required={formData.role === 'doctor'}
                  />
                </div>

                <div className="register-input-group">
                  <label className="register-input-label">Consultation Fee ($)</label>
                  <input
                    type="number"
                    name="fees"
                    className="register-input-field plain"
                    placeholder="50"
                    min="0"
                    value={formData.fees}
                    onChange={handleChange}
                    required={formData.role === 'doctor'}
                  />
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary register-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="register-footer-links">
          <span>Already have an account? </span>
          <Link to="/login" className="register-redirect-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
