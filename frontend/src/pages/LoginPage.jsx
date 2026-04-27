import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Lock, Loader2, AlertCircle,
  Users, ArrowLeft, CheckCircle2
} from 'lucide-react';

const RocketIllustration = () => (
  <div style={{ textAlign: 'center' }}>
    <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: '380px', height: 'auto', marginBottom: '40px' }}>
      {/* Rocket Main Body */}
      <path d="M200 60C200 60 155 120 155 220C155 260 175 285 200 285C225 285 245 260 245 220C245 120 200 60 200 60Z" fill="white" />
      <path d="M200 60C200 60 155 120 155 220C155 260 175 285 200 285C225 285 245 260 245 220C245 120 200 60 200 60Z" stroke="#F1F5F9" strokeWidth="1" />

      {/* Blue Circular Window */}
      <circle cx="200" cy="180" r="28" stroke="#2563EB" strokeWidth="6" />

      {/* Blue Fins */}
      <path d="M155 245L100 320H155V245Z" fill="#3B82F6" />
      <path d="M245 245L300 320H245V245Z" fill="#3B82F6" />

      {/* Nozzle */}
      <rect x="188" y="285" width="24" height="25" fill="#1E293B" />

      {/* Flame */}
      <path d="M200 310C190 310 185 330 200 385C215 330 210 310 200 310Z" fill="url(#flameGrad)" />

      <defs>
        <linearGradient id="flameGrad" x1="200" y1="310" x2="200" y2="385" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316" />
          <stop offset="1" stopColor="#FBBF24" />
        </linearGradient>
      </defs>
    </svg>
    <h1 style={{
      fontSize: '2.6rem',
      fontWeight: '800',
      color: '#1E40AF',
      marginBottom: '1rem',
      letterSpacing: '-1px',
      fontFamily: "'Sora', sans-serif"
    }}>
      Start Your Evolution
    </h1>
    <p style={{
      fontSize: '1.1rem',
      color: '#64748B',
      maxWidth: '420px',
      lineHeight: 1.6,
      margin: '0 auto',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      Deploy the world's most intuitive workspace for your team today.
      Accelerate your productivity in seconds.
    </p>
  </div>
);

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = await login(email, password, role);
      const routes = {
        admin: '/admin',
        project_manager: '/pm',
        team_leader: '/tl',
        team_member: '/tm'
      };
      navigate(routes[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setForgotLoading(true);

    try {
      await axios.post('/api/auth/forgot-password', { email: forgotEmail });
      setSuccessMessage('Request sent! Admin will review your request.');
      setTimeout(() => {
        setForgotMode(false);
        setSuccessMessage('');
        setForgotEmail('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#fff',
      overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {/* Left Side: High-Fidelity Visual */}
      <div className="desktop-only" style={{
        flex: 1.2,
        background: 'linear-gradient(150deg, #F8FAFF 0%, #EFF6FF 50%, #DBEAFE 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background blobs */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-150px', left: '-150px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.05), transparent 70%)' }} />

        <div className="animate-float" style={{ zIndex: 1 }}>
          <RocketIllustration />
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: '#fff',
        zIndex: 2,
        position: 'relative'
      }}>
        {/* Back Link */}
        <div style={{ position: 'absolute', top: '2rem', left: '2rem' }}>
          <Link to="/" style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem' }}>
            <ArrowLeft size={18} /> Back to Home
          </Link>
        </div>

        <div className="slide-up" style={{
          maxWidth: '440px',
          width: '100%',
          padding: '20px'
        }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <Link to="/" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              color: '#2563EB',
              textDecoration: 'none',
              fontWeight: '950',
              fontSize: '1.75rem',
              marginBottom: '2.5rem',
              fontFamily: "'Sora', sans-serif",
              letterSpacing: '-1px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)'
              }}>
                <CheckCircle2 size={24} />
              </div>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                Task<span style={{ color: '#60A5FA' }}>Master</span>
              </span>
            </Link>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-1px', color: '#111827' }}>Welcome back</h2>
            <p style={{ color: '#64748B', fontSize: '1.05rem' }}>Enter your credentials to access your workspace.</p>
          </div>

          {error && (
            <div className="fade-in" style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              padding: '1rem',
              borderRadius: '12px',
              color: '#ef4444',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="fade-in" style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #dcfce7',
              padding: '1rem',
              borderRadius: '12px',
              color: '#16a34a',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <CheckCircle2 size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          {forgotMode ? (
            <form onSubmit={handleForgotSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem 0.875rem 3rem',
                      borderRadius: '12px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      background: '#F8FAFC'
                    }}
                    placeholder="Enter your account email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 10px 25px rgba(37, 99, 235, 0.25)',
                  transition: 'transform 0.2s'
                }}
              >
                {forgotLoading ? <Loader2 className="animate-spin" size={20} /> : 'Submit Reset Request'}
              </button>

              <button
                type="button"
                onClick={() => setForgotMode(false)}
                style={{
                  width: '100%',
                  marginTop: '1rem',
                  padding: '0.8rem',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  background: 'white',
                  color: '#64748B',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Back to Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem 0.875rem 3rem',
                      borderRadius: '12px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      background: '#F8FAFC'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Your Role</label>
                <div style={{ position: 'relative' }}>
                  <Users size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <select
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem 0.875rem 3rem',
                      borderRadius: '12px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      background: '#F8FAFC',
                      appearance: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  >
                    <option value="admin">System Administrator</option>
                    <option value="project_manager">Project Manager</option>
                    <option value="team_leader">Team Leader</option>
                    <option value="team_member">Team Member</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Password</label>
                  <button
                    type="button"
                    onClick={() => setForgotMode(true)}
                    style={{
                      fontSize: '0.85rem', color: '#2563EB', fontWeight: '600',
                      textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0
                    }}>Forgot?</button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem 0.875rem 3rem',
                      borderRadius: '12px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      background: '#F8FAFC'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>


              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 10px 25px rgba(37, 99, 235, 0.25)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(37, 99, 235, 0.3)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(37, 99, 235, 0.25)'; }}
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Sign In to Dashboard'}
              </button>
            </form>
          )}

          <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748B' }}>
            New here? <a href="mailto:support@taskmaster.com" style={{ color: '#2563EB', fontWeight: '700', textDecoration: 'none' }}>Request Workspace Access</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
