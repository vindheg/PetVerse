// src/services/authService.js
import { supabase } from './supabase';

export const authService = {
  // Verify OTP for signup
  async verifyOTP(email, token) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  },

  // Resend OTP
  async resendOTP(email) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/pets`
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error;
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // Update password
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  },

  // Check if user is admin
  isAdmin() {
    return localStorage.getItem('adminToken') === 'petverse-admin-token-2024';
  },

  // Get admin data
  getAdminData() {
    const data = localStorage.getItem('adminData');
    return data ? JSON.parse(data) : null;
  }
};