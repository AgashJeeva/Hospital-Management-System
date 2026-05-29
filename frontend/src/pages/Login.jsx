import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, AlertCircle } from 'lucide-react';

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
    <div className="flex items-center justify-center min-h-screen p-5 bg-bg-main bg-[radial-gradient(circle_at_10%_20%,rgba(37,99,235,0.08)_0%,transparent_40%),radial-gradient(circle_at_90%_80%,rgba(13,148,136,0.08)_0%,transparent_40%)] transition-all duration-300">
      <div className="w-full max-w-[440px] p-10 bg-bg-card backdrop-blur-md border border-border-color rounded-[20px] shadow-lg text-center">
        <div className="flex flex-col items-center mb-7.5">
          <Activity className="text-primary mb-2" size={36} />
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">ApexCare</h1>
          <p className="text-[13px] text-text-muted font-semibold uppercase tracking-[1px] mt-0.5">Hometown Medical Hub</p>
        </div>

        <h2 className="text-[22px] font-bold text-text-primary mb-1">Welcome Back</h2>
        <p className="text-[14px] text-text-secondary mb-6">Please sign in to access your dashboard</p>

        {errorMsg && (
          <div className="flex items-center gap-2.5 bg-danger-bg text-danger p-3 px-4 rounded-lg text-sm font-medium text-left mb-5 animate-[shake_0.35s_ease]">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="text-left" onSubmit={handleSubmit}>
          <div className="mb-4.5">
            <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 text-text-muted pointer-events-none" size={18} />
              <input
                type="email"
                className="w-full py-3 px-4 pl-11 text-[15px] rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] placeholder-text-muted"
                placeholder="you@hometown.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="mb-4.5">
            <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-heading">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-text-muted pointer-events-none" size={18} />
              <input
                type="password"
                className="w-full py-3 px-4 pl-11 text-[15px] rounded-lg border-1.5 border-border-color bg-bg-surface text-text-primary transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] placeholder-text-muted"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full mt-2.5 text-[16px] font-heading font-semibold py-3 px-6 rounded-lg bg-gradient-to-r from-primary to-secondary text-white shadow-[0_4px_15px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:-translate-y-[1px] hover:brightness-110 active:translate-y-0 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-[14px] text-text-secondary">
          <span>New to ApexCare? </span>
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
