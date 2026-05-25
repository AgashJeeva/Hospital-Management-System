import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, AlertCircle } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrorMsg(result.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Something went wrong. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-glass-box">
        <div className="login-logo-header">
          <Activity className="login-brand-icon" size={36} />
          <h1 className="login-brand-title">ApexCare</h1>
          <p className="login-brand-tagline">Hometown Medical Hub</p>
        </div>

        <h2 className="login-form-title">Welcome Back</h2>
        <p className="login-form-subtitle">Please sign in to access your dashboard</p>

        {errorMsg && (
          <div className="login-error-alert animate-shake">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-input-group">
            <label className="login-input-label">Email Address</label>
            <div className="login-input-wrapper">
              <Mail className="login-input-icon" size={18} />
              <input
                type="email"
                className="login-input-field"
                placeholder="you@hometown.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="login-input-group">
            <label className="login-input-label">Password</label>
            <div className="login-input-wrapper">
              <Lock className="login-input-icon" size={18} />
              <input
                type="password"
                className="login-input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary login-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer-links">
          <span>New to ApexCare? </span>
          <Link to="/register" className="login-redirect-link">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
