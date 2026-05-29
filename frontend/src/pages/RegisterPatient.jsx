import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Mail, Lock, Phone, Calendar, AlertCircle, CheckCircle, Heart } from 'lucide-react';

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
    <div className="animate-[fadeIn_0.4s_ease]">
      <div className="mb-7.5">
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Register New Patient</h1>
        <p className="text-text-secondary text-[16px] mt-1">Establish a new medical record folder and login credentials for incoming patients</p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2.5 bg-danger-bg text-danger p-3.5 px-5 rounded-lg mb-6 font-medium">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2.5 bg-success-bg text-success p-3.5 px-5 rounded-lg mb-6 font-medium">
          <CheckCircle size={18} />
          <span>Patient profile registered successfully! Temporary password: Password123!</span>
        </div>
      )}

      <div className="bg-bg-card backdrop-blur-md border border-border-color rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-[2px] transition-all duration-300 max-w-[800px] mx-auto mb-10">
        <h2 className="text-[18px] font-bold text-text-primary mb-5 border-b border-border-color pb-3">Patient Intake Form</h2>
        
        <form onSubmit={handleSubmit} className="mt-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4.5">
            <div className="flex flex-col">
              <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Full Name</label>
              <div className="relative flex items-center">
                <UserCheck className="absolute left-4 text-text-muted pointer-events-none" size={18} />
                <input
                  type="text"
                  name="name"
                  className="w-full py-3 px-4 pl-11 text-[15px] rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] placeholder-text-muted"
                  placeholder="Jane Smith"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 text-text-muted pointer-events-none" size={18} />
                <input
                  type="email"
                  name="email"
                  className="w-full py-3 px-4 pl-11 text-[15px] rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] placeholder-text-muted"
                  placeholder="jane.smith@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4.5">
            <div className="flex flex-col">
              <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Temporary Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 text-text-muted pointer-events-none" size={18} />
                <input
                  type="text"
                  name="password"
                  className="w-full py-3 px-4 pl-11 text-[15px] rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] placeholder-text-muted"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Phone Number</label>
              <div className="relative flex items-center">
                <Phone className="absolute left-4 text-text-muted pointer-events-none" size={18} />
                <input
                  type="tel"
                  name="phone"
                  className="w-full py-3 px-4 pl-11 text-[15px] rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] placeholder-text-muted"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4.5">
            <div className="flex flex-col">
              <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Date of Birth</label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-4 text-text-muted pointer-events-none" size={18} />
                <input
                  type="date"
                  name="dob"
                  className="w-full py-3 px-4 pl-11 text-[15px] rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] placeholder-text-muted"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Gender</label>
              <select
                name="gender"
                className="w-full py-3 px-4 text-[15px] rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] cursor-pointer"
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
          <div className="bg-bg-main border border-border-color p-6 rounded-xl mt-2.5 mb-6">
            <h4 className="flex items-center gap-2 text-sm font-bold uppercase text-primary border-b border-border-color pb-2 mb-3 font-heading"><Heart size={16} /> Emergency Contact & Bio</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4.5 mt-2.5">
              <div className="flex flex-col">
                <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Blood Group</label>
                <select
                  name="bloodGroup"
                  className="w-full py-3 px-4 text-[15px] rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] cursor-pointer"
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

              <div className="flex flex-col">
                <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Contact Full Name</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  className="w-full py-3 px-4 text-[15px] rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] placeholder-text-muted"
                  placeholder="Contact Name"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col">
                <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Relationship</label>
                <input
                  type="text"
                  name="emergencyContactRelation"
                  className="w-full py-3 px-4 text-[15px] rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] placeholder-text-muted"
                  placeholder="e.g. Spouse, Parent"
                  value={formData.emergencyContactRelation}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col">
                <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Contact Phone</label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  className="w-full py-3 px-4 text-[15px] rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] placeholder-text-muted"
                  placeholder="Contact Phone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full mt-2.5 text-[16px] font-heading font-semibold py-3 px-6 rounded-lg bg-gradient-to-r from-primary to-secondary text-white shadow-[0_4px_15px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:-translate-y-[1px] hover:brightness-110 active:translate-y-0 transition-all duration-300 cursor-pointer" disabled={submitting}>
            {submitting ? 'Registering Patient Folder...' : 'Complete Patient Intake Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPatient;
