import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { showToast } from '../../utils/toast';
import './Login.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Supabase automatically handles the hash params and creates a session
    // We just need to check if a session exists
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session error:', error);
          showToast('Invalid or expired reset link', 'error');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        if (session) {
          setSessionValid(true);
        } else {
          showToast('Please click the reset link from your email', 'error');
          setTimeout(() => navigate('/login'), 2000);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        showToast('Error loading reset page', 'error');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    // Small delay to let Supabase process the hash
    setTimeout(checkSession, 500);
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;

      showToast('Password updated successfully!', 'success');

      // Sign out to clear the recovery session
      await supabase.auth.signOut();

      // Redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      console.error('Password reset error:', error);
      showToast(error.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!sessionValid) {
    return (
      <div className="login-page">
        <div className="login-container-new">
          <div className="login-brand-panel">
            <div className="brand-content">
              <h1 className="brand-logo">🐾 PetVerse</h1>
              <p className="brand-tagline">Verifying reset link...</p>
            </div>
          </div>
          <div className="login-form-panel">
            <div className="form-container">
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                <p>Validating your reset link...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container-new">

        {/* LEFT PANEL - Branding */}
        <div className="login-brand-panel">
          <div className="brand-content">
            <h1 className="brand-logo">🐾 PetVerse</h1>
            <p className="brand-tagline">Secure Password Reset</p>
            <div className="brand-features">
              <div className="feature-item">
                <span className="feature-icon">🔐</span>
                <span>Create a strong password</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✅</span>
                <span>Minimum 6 characters</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🛡️</span>
                <span>Your account, secured</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Reset Form */}
        <div className="login-form-panel">
          <div className="form-container">
            <h2 className="form-title">Reset Your Password</h2>
            <p className="form-subtitle">Enter your new password below</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group-new">
                <label>New Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔐</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <p className="helper-text">Minimum 6 characters</p>
              </div>

              <div className="form-group-new">
                <label>Confirm New Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔐</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary-new"
                disabled={loading}
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>

            <div className="form-footer">
              <button
                className="link-btn"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;