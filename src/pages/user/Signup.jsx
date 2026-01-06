import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { supabase } from '../../services/supabase';
import { showToast } from '../../utils/toast';
import './Login.css'; // Ensure we use the shared modern styles

const Signup = () => {
  // Form States
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Modal States
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpEmail, setOtpEmail] = useState('');

  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  // --- HANDLERS ---

  // 1. Restrict OTP to Numbers Only
  const handleOTPChange = (e) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, ''); // Remove non-digits
    setOtp(numericValue);
  };

  // 2. Check Username Availability
  const checkUsernameAvailability = async (username) => {
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (existingUser) {
      throw new Error("Username is already taken. Please choose another.");
    }
    return true;
  };

  // 3. Handle Signup Form Submit
  const handleSignup = async (e) => {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match!', 'error');
      return;
    }

    if (email === "admin@petverse.com") {
      showToast('This email cannot be used for registration', 'error');
      return;
    }

    setLoading(true);

    try {
      await checkUsernameAvailability(username);

      const result = await signup(email, password, username);

      if (result.success) {
        showToast('Signup successful! Check your email.', 'success');
        setOtpEmail(email);
        setShowOTPModal(true); // Open the Pop-up
      }
    } catch (error) {
      console.error('Signup error:', error);

      if (error.message.includes('User already registered')) {
        showToast('Email already registered. Please login.', 'error');
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.message.includes('Username is already taken')) {
        showToast('Username already taken.', 'error');
      } else {
        showToast(error.message || 'Signup failed.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle OTP Verification
  const handleOTPVerification = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      showToast('Please enter the full 6-digit code', 'error');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.verifyOTP(otpEmail, otp);

      if (result.success) {
        showToast('Account verified! Logging in...', 'success');

        // Optional: Update local storage for immediate UI feedback
        const user = result.data.user;
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();

          if (profile) {
            localStorage.setItem('petverse_profile', JSON.stringify(profile));
          }
        }

        setTimeout(() => {
          navigate('/adopt');
        }, 1500);
      }
    } catch (error) {
      console.error('OTP error:', error);
      showToast('Invalid or expired code. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 5. Resend OTP
  const handleResendOTP = async () => {
    if (!otpEmail) return;
    try {
      await authService.resendOTP(otpEmail);
      showToast('New code sent!', 'success');
    } catch (error) {
      showToast('Failed to resend.', 'error');
    }
  };

  // --- RENDER ---
  return (
    <div className="login-page">
      <div className="login-container-new">

        {/* Left Side (Branding) - Matches Login.jsx */}
        <div className="login-brand-panel">
          <div className="brand-content">
            <div className="brand-logo">PetVerse</div>
            <p className="brand-tagline">Where every pet finds a home.</p>
            <div className="brand-features">
              <div className="feature-item">
                <span className="feature-icon">🏠</span>
                <span>Find your perfect companion</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">❤️</span>
                <span>Save a life today</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🤝</span>
                <span>Join a loving community</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side (Signup Form) */}
        <div className="login-form-panel">
          <div className="form-container">
            <h1 className="form-title">Create Account</h1>
            <p className="form-subtitle">Join our community of pet lovers</p>

            <form onSubmit={handleSignup}>
              <div className="form-group-new">
                <label htmlFor="username">Username</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    id="username"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group-new">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group-new">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    id="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>
                <p className="helper-text">Minimum 6 characters</p>
              </div>

              <div className="form-group-new">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary-new" disabled={loading}>
                {loading ? 'Processing...' : 'Create Account'}
              </button>
            </form>

            <div className="form-footer">
              <button
                className="link-btn"
                onClick={() => navigate('/login')}
              >
                Already have an account? Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- OTP POP-UP MODAL --- */}
      {showOTPModal && (
        <div className="otp-modal-overlay">
          <div className="otp-modal-content">

            {/* Close Button */}
            <button
              className="otp-close-btn"
              onClick={() => setShowOTPModal(false)}
              title="Close"
            >
              ×
            </button>

            <div className="otp-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8B5FBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h2>Verify Email</h2>
            <p>
              We've sent a 6-digit code to <br />
              <strong>{otpEmail}</strong>
            </p>

            <form onSubmit={handleOTPVerification}>
              <div className="otp-input-wrapper">
                <input
                  type="text"
                  className="otp-input-field"
                  placeholder="000000"
                  value={otp}
                  onChange={handleOTPChange} // Number only logic
                  maxLength={6}
                  autoFocus
                  required
                />
              </div>

              <button type="submit" className="btn-primary-new" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Account'}
              </button>
            </form>

            <div className="otp-resend-area">
              <span>Didn't receive code? </span>
              <button
                type="button"
                onClick={handleResendOTP}
                className="resend-btn"
                disabled={loading}
              >
                Resend Code
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Signup;