import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { showToast, showLoginSuccess } from '../../utils/toast';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Removed unused signup

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // View states
  const [view, setView] = useState('login'); // 'login', 'signup'
  const [signupStep, setSignupStep] = useState(1); // 1: Email/OTP, 2: Password, 3: Success

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });

  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // LOGIN HANDLER with Success Popup
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Get display name from email
        const userName = formData.email.split('@')[0];

        // Show beautiful success popup and wait for it to complete
        await showLoginSuccess(userName, result.isAdmin);

        // Redirect based on user role (auto-detected)
        if (result.isAdmin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      showToast(error.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // SEND OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      showToast('Please enter your email', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          shouldCreateUser: true,
        }
      });

      if (error) throw error;

      setOtpSent(true);
      showToast('OTP sent to your email! Check your inbox', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to send OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  // VERIFY OTP & CREATE ACCOUNT
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!formData.otp || formData.otp.length !== 6) {
      showToast('Please enter the 6-digit OTP', 'error');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: formData.otp,
        type: 'email'
      });

      if (error) throw error;

      if (data?.user) {
        // OTP verified, move to password step
        setSignupStep(2);
        showToast('Email verified! Now set your password', 'success');
      }
    } catch (error) {
      showToast(error.message || 'Invalid OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  // CREATE ACCOUNT WITH PASSWORD
  const handleCreateAccount = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) throw error;

      setSignupStep(3);

      // Show beautiful success popup like login
      const userName = formData.email.split('@')[0];
      await showLoginSuccess(userName, false);

      // Reset and go to login
      setView('login');
      setSignupStep(1);
      setOtpSent(false);
      setFormData({ email: '', password: '', confirmPassword: '', otp: '' });
    } catch (error) {
      showToast(error.message || 'Failed to create account', 'error');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="login-page">
      <div className="login-container-new">

        {/* LEFT PANEL - Branding */}
        <div className="login-brand-panel">
          <div className="brand-content">
            <h1 className="brand-logo">PetVerse</h1>
            <p className="brand-tagline">Where every paw print tells a story</p>
            <div className="brand-features">
              <div className="feature-item">
                <span>Adopt loving companions</span>
              </div>
              <div className="feature-item">
                <span>Find forever homes</span>
              </div>
              <div className="feature-item">
                <span>Join our community</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Forms */}
        <div className="login-form-panel">

          {/* LOGIN VIEW */}
          {view === 'login' && (
            <div className="form-container">
              <h2 className="form-title">Welcome Back</h2>
              <p className="form-subtitle">Sign in to continue your journey</p>


              <form onSubmit={handleLogin}>
                <div className="form-group-new">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon"></span>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group-new">
                  <label>Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon"></span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-primary-new" disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <div className="form-footer">
                <button
                  className="link-btn"
                  onClick={() => {
                    setView('signup');
                    setFormData({ email: '', password: '', confirmPassword: '', otp: '' });
                  }}
                >
                  Create Account
                </button>

              </div>
            </div>
          )}

          {/* SIGNUP VIEW */}
          {view === 'signup' && (
            <div className="form-container">
              <h2 className="form-title">Create Account</h2>
              <p className="form-subtitle">Join the PetVerse community</p>

              {/* PROGRESS INDICATOR */}
              <div className="progress-steps">
                <div className={`step ${signupStep >= 1 ? 'active' : ''}`}>
                  <div className="step-circle">1</div>
                  <span>Verify Email</span>
                </div>
                <div className={`step ${signupStep >= 2 ? 'active' : ''}`}>
                  <div className="step-circle">2</div>
                  <span>Set Password</span>
                </div>
                <div className={`step ${signupStep >= 3 ? 'active' : ''}`}>
                  <div className="step-circle">3</div>
                  <span>Done</span>
                </div>
              </div>

              {/* STEP 1: Email & OTP */}
              {signupStep === 1 && (
                <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP}>
                  <div className="form-group-new">
                    <label>Email Address</label>
                    <div className="input-wrapper">
                      <span className="input-icon"></span>
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={otpSent}
                      />
                    </div>
                  </div>

                  {!otpSent && (
                    <button type="submit" className="btn-primary-new" disabled={loading}>
                      {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                  )}

                  {otpSent && (
                    <>
                      <div className="form-group-new">
                        <label>Enter OTP</label>
                        <div className="input-wrapper">
                          <span className="input-icon"></span>
                          <input
                            type="text"
                            name="otp"
                            placeholder="Enter 6-digit code"
                            value={formData.otp}
                            onChange={handleChange}
                            maxLength={6}
                            className="otp-input"
                            required
                          />
                        </div>
                        <p className="helper-text">We've sent a verification code to {formData.email}</p>
                      </div>

                      <button type="submit" className="btn-primary-new" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify & Continue'}
                      </button>

                      <button
                        type="button"
                        className="link-btn secondary"
                        onClick={handleSendOTP}
                        disabled={loading}
                      >
                        Resend OTP
                      </button>
                    </>
                  )}
                </form>
              )}

              {/* STEP 2: Password */}
              {signupStep === 2 && (
                <form onSubmit={handleCreateAccount}>
                  <div className="form-group-new">
                    <label>Password</label>
                    <div className="input-wrapper">
                      <span className="input-icon"></span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <p className="helper-text">Minimum 6 characters</p>
                  </div>

                  <div className="form-group-new">
                    <label>Confirm Password</label>
                    <div className="input-wrapper">
                      <span className="input-icon"></span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary-new" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>
              )}

              {/* STEP 3: Success */}
              {signupStep === 3 && (
                <div className="success-view">
                  <div className="success-icon">Done</div>
                  <h3>Account Created!</h3>
                  <p>Welcome to PetVerse! Redirecting to login...</p>
                </div>
              )}

              {/* Back to Login */}
              {signupStep < 3 && (
                <div className="form-footer">
                  <button
                    className="link-btn"
                    onClick={() => {
                      setView('login');
                      setSignupStep(1);
                      setOtpSent(false);
                      setFormData({ email: '', password: '', confirmPassword: '', otp: '' });
                    }}
                  >
                    Already have an account? Login
                  </button>
                </div>
              )}
            </div>
          )}


        </div>
      </div>
    </div>
  );
};

export default Login;
