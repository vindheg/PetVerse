// src/services/emailService.js - Client-side email service wrapper

const EMAIL_SERVER_URL = ''; // Relative path for Vercel (same domain)

export const emailService = {
    // ============================================
    // VOLUNTEER EMAILS
    // ============================================

    // Send volunteer acceptance/rejection email
    async sendVolunteerStatusEmail(to, volunteerName, status) {
        try {
            const response = await fetch(`${EMAIL_SERVER_URL}/api/email/volunteer-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to,
                    volunteerName,
                    status,
                    contactEmail: 'team@petverse.com'
                })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data;
        } catch (error) {
            console.error('Email service error:', error);
            throw error;
        }
    },

    // Send event notification to volunteers (mass email)
    async sendVolunteerEventEmail(eventDetails, volunteerEmails, customMessage = '') {
        try {
            const response = await fetch(`${EMAIL_SERVER_URL}/api/email/volunteer-event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipients: volunteerEmails,
                    event: {
                        title: eventDetails.title,
                        description: eventDetails.description,
                        date: eventDetails.date,
                        time: eventDetails.time,
                        location: eventDetails.location,
                        address: eventDetails.address,
                        responsibilities: eventDetails.responsibilities || ''
                    },
                    customMessage,
                    contactEmail: 'team@petverse.com'
                })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data;
        } catch (error) {
            console.error('Email service error:', error);
            throw error;
        }
    },

    // ============================================
    // LOST & FOUND EMAILS
    // ============================================

    // Send lost/found report status email
    async sendLostFoundStatusEmail(to, petName, status, reportType) {
        try {
            const response = await fetch(`${EMAIL_SERVER_URL}/api/email/lost-found-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to,
                    petName,
                    status,
                    reportType,
                    contactEmail: 'team@petverse.com'
                })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data;
        } catch (error) {
            console.error('Email service error:', error);
            throw error;
        }
    },

    // Notify pet owner that their pet may have been found
    async sendPetFoundMatchEmail(to, petName, finderDetails) {
        try {
            const response = await fetch(`${EMAIL_SERVER_URL}/api/email/pet-found-match`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to,
                    petName,
                    finderPhone: finderDetails.contact_phone,
                    finderEmail: finderDetails.contact_email,
                    location: finderDetails.location,
                    contactEmail: 'team@petverse.com'
                })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data;
        } catch (error) {
            console.error('Email service error:', error);
            throw error;
        }
    },

    // Check if email server is running
    async checkHealth() {
        try {
            const response = await fetch(`${EMAIL_SERVER_URL}/api/health`);
            return response.ok;
        } catch {
            return false;
        }
    },

    // ============================================
    // OTP / AUTHENTICATION EMAILS
    // ============================================

    // Send OTP verification email
    async sendOtpEmail(to, otp, userName = '') {
        try {
            const response = await fetch(`${EMAIL_SERVER_URL}/api/email/otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to, otp, userName })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data;
        } catch (error) {
            console.error('OTP email error:', error);
            throw error;
        }
    },

    // Send welcome email
    async sendWelcomeEmail(to, userName = '') {
        try {
            const response = await fetch(`${EMAIL_SERVER_URL}/api/email/welcome`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to, userName })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data;
        } catch (error) {
            console.error('Welcome email error:', error);
            // Don't throw - welcome email is not critical
        }
    },

    // Send password reset email
    async sendPasswordResetEmail(to, resetLink) {
        try {
            const response = await fetch(`${EMAIL_SERVER_URL}/api/email/password-reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to, resetLink })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            return data;
        } catch (error) {
            console.error('Password reset email error:', error);
            throw error;
        }
    }
};
