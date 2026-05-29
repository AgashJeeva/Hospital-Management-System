import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, User as UserIcon, Phone, Calendar, AlertCircle } from 'lucide-react';

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
    <div className="flex items-center justify-center min-h-screen p-5 bg-bg-main bg-[radial-gradient(circle_at_10%_20%,rgba(37,99,235,0.08)_0%,transparent_40%),radial-gradient(circle_at_90%_80%,rgba(13,148,136,0.08)_0%,transparent_40%)] transition-all duration-300 py-10">
      <div className="w-full max-w-[720px] p-10 bg-bg-card backdrop-blur-md border border-border-color rounded-[20px] shadow-lg text-center">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <Activity className="text-primary" size={32} />
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">ApexCare</h1>
        </div>

        <h2 className="text-[22px] font-bold text-text-primary mb-1">Create Account</h2>
        <p className="text-[14px] text-text-secondary mb-8">Register to manage appointments, billing and records</p>

        {errorMsg && (
          <div className="flex items-center gap-2.5 bg-danger-bg text-danger p-3 px-4 rounded-lg text-sm font-medium text-left mb-6 animate-[shake_0.35s_ease]">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="text-left" onSubmit={handleSubmit}>
          {/* General Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4.5">
            <div className="flex flex-col">
              <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Full Name</label>
              <div className="relative flex items-center">
                <UserIcon className="absolute left-4 text-text-muted pointer-events-none" size={18} />
                <input
                  type="text"
                  name="name"
                  className="w-full py-3 px-4 pl-11 text-[15px] rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] placeholder-text-muted"
                  placeholder="John Doe"
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
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4.5">
            <div className="flex flex-col">
              <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 text-text-muted pointer-events-none" size={18} />
                <input
                  type="password"
                  name="password"
                  className="w-full py-3 px-4 pl-11 text-[15px] rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] placeholder-text-muted"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Confirm Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 text-text-muted pointer-events-none" size={18} />
                <input
                  type="password"
                  name="confirmPassword"
                  className="w-full py-3 px-4 pl-11 text-[15px] rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] placeholder-text-muted"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4.5">
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
                />
              </div>
            </div>

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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4.5">
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

            <div className="flex flex-col">
              <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Account Role</label>
              <select
                name="role"
                className="w-full py-3 px-4 text-[15px] rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] cursor-pointer"
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
            <div className="bg-bg-main border-1.5 border-dashed border-border-color p-6 rounded-xl mt-2.5 mb-6 animate-[slideUp_0.3s_ease]">
              <h3 className="text-sm uppercase tracking-wider font-extrabold text-primary mb-4.5 font-heading">Doctor Credentials</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4.5">
                <div className="flex flex-col">
                  <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Specialty</label>
                  <input
                    type="text"
                    name="specialty"
                    className="w-full py-3 px-4 text-[15px] rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] placeholder-text-muted"
                    placeholder="e.g. Cardiology, Pediatrics"
                    value={formData.specialty}
                    onChange={handleChange}
                    required={formData.role === 'doctor'}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Qualifications</label>
                  <input
                    type="text"
                    name="qualification"
                    className="w-full py-3 px-4 text-[15px] rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] placeholder-text-muted"
                    placeholder="e.g. MD, MBBS"
                    value={formData.qualification}
                    onChange={handleChange}
                    required={formData.role === 'doctor'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col">
                  <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Experience (Years)</label>
                  <input
                    type="number"
                    name="experienceYears"
                    className="w-full py-3 px-4 text-[15px] rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] placeholder-text-muted"
                    placeholder="5"
                    min="0"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    required={formData.role === 'doctor'}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Consultation Fee ($)</label>
                  <input
                    type="number"
                    name="fees"
                    className="w-full py-3 px-4 text-[15px] rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] placeholder-text-muted"
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

          <button type="submit" className="w-full mt-2.5 text-[16px] font-heading font-semibold py-3 px-6 rounded-lg bg-gradient-to-r from-primary to-secondary text-white shadow-[0_4px_15px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:-translate-y-[1px] hover:brightness-110 active:translate-y-0 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-[14px] text-text-secondary">
          <span>Already have an account? </span>
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
