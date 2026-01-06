// server/emailServer.js - Simple Express server for SMTP email sending
// Run with: node server/emailServer.js

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'petverse29@gmail.com',
    pass: 'ktfk wywr rksi dpnm' // App password
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Error:', error);
  } else {
    console.log('✅ SMTP Server ready to send emails');
  }
});

// ============================================
// VOLUNTEER EMAILS
// ============================================

// Volunteer status email (acceptance/rejection)
app.post('/api/email/volunteer-status', async (req, res) => {
  const { to, volunteerName, status, contactEmail } = req.body;

  try {
    const subject = status === 'approved'
      ? '🎉 Welcome to the PetVerse Volunteer Team!'
      : 'Thank you for your interest in PetVerse';

    const html = status === 'approved'
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8b5fbf;">Congratulations, ${volunteerName}! 🎉</h2>
          <p>We're thrilled to welcome you to the <strong>PetVerse Volunteer Team</strong>!</p>
          <p>Your application has been <strong style="color: #28a745;">approved</strong>. We're excited to have you join our mission to help pets find loving homes.</p>
          <h3>What's Next?</h3>
          <ul>
            <li>You'll receive event invitations via email</li>
            <li>Check your dashboard for upcoming volunteer opportunities</li>
            <li>Connect with our community of animal lovers</li>
          </ul>
          <p>If you have any questions, reach out to us at <a href="mailto:${contactEmail}">${contactEmail}</a></p>
          <br>
          <p>With gratitude,<br><strong>The PetVerse Team</strong></p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8b5fbf;">Thank You, ${volunteerName}</h2>
          <p>We appreciate your interest in volunteering with PetVerse.</p>
          <p>Unfortunately, we're unable to accept your application at this time. This could be due to limited positions or timing.</p>
          <p>We encourage you to apply again in the future or explore other ways to support our mission.</p>
          <p>Questions? Contact us at <a href="mailto:${contactEmail}">${contactEmail}</a></p>
          <br>
          <p>Best regards,<br><strong>The PetVerse Team</strong></p>
        </div>
      `;

    await transporter.sendMail({
      from: '"PetVerse Team" <petverse29@gmail.com>',
      to: to,
      subject: subject,
      html: html
    });

    console.log(`✅ Volunteer ${status} email sent to: ${to}`);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('❌ Email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Volunteer event notification email (mass email)
app.post('/api/email/volunteer-event', async (req, res) => {
  const { recipients, event, customMessage, contactEmail } = req.body;

  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8b5fbf;">🐾 Volunteer Opportunity: ${event.title}</h2>
        
        ${customMessage ? `<p style="background: #f8f4ff; padding: 15px; border-radius: 8px;">${customMessage}</p>` : ''}
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Event Details</h3>
          <p><strong>📅 Date:</strong> ${event.date}</p>
          <p><strong>🕐 Time:</strong> ${event.time || 'TBD'}</p>
          <p><strong>📍 Location:</strong> ${event.location}</p>
          ${event.address ? `<p><strong>🏠 Address:</strong> ${event.address}</p>` : ''}
          ${event.description ? `<p><strong>📝 Description:</strong> ${event.description}</p>` : ''}
          ${event.responsibilities ? `<p><strong>✅ Responsibilities:</strong> ${event.responsibilities}</p>` : ''}
        </div>
        
        <p>We hope to see you there! Your contribution makes a real difference in the lives of animals.</p>
        
        <p>Questions? Contact us at <a href="mailto:${contactEmail}">${contactEmail}</a></p>
        
        <br>
        <p>Best regards,<br><strong>The PetVerse Team</strong></p>
      </div>
    `;

    // Send to all recipients
    const emailPromises = recipients.map(email =>
      transporter.sendMail({
        from: '"PetVerse Team" <petverse29@gmail.com>',
        to: email,
        subject: `🐾 Volunteer Event: ${event.title}`,
        html: html
      })
    );

    await Promise.all(emailPromises);
    console.log(`✅ Event emails sent to ${recipients.length} volunteers`);
    res.json({ success: true, message: `Emails sent to ${recipients.length} recipients` });
  } catch (error) {
    console.error('❌ Email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// LOST & FOUND EMAILS
// ============================================

// Lost/Found report status email
app.post('/api/email/lost-found-status', async (req, res) => {
  const { to, petName, status, reportType, contactEmail } = req.body;

  try {
    const isApproved = status === 'approved';
    const isLost = reportType === 'lost';

    const subject = isApproved
      ? `✅ Your ${isLost ? 'Lost' : 'Found'} Pet Report Has Been Approved`
      : `Update on Your ${isLost ? 'Lost' : 'Found'} Pet Report`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #C07E60;">Pet Report Update</h2>
        
        <p>Your <strong>${isLost ? 'lost' : 'found'}</strong> pet report ${petName ? `for <strong>${petName}</strong>` : ''} has been <strong style="color: ${isApproved ? '#28a745' : '#dc3545'};">${status}</strong>.</p>
        
        ${isApproved && isLost ? `
          <div style="background: #f0fff4; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Good news!</strong> Your report is now visible to the community. We've also posted it to help spread the word.</p>
          </div>
        ` : ''}
        
        ${!isApproved ? `
          <p>If you believe this was a mistake or need more information, please contact us.</p>
        ` : ''}
        
        <p>Questions? Contact us at <a href="mailto:${contactEmail}">${contactEmail}</a></p>
        
        <br>
        <p>Best regards,<br><strong>The PetVerse Team</strong></p>
      </div>
    `;

    await transporter.sendMail({
      from: '"PetVerse Team" <petverse29@gmail.com>',
      to: to,
      subject: subject,
      html: html
    });

    console.log(`✅ Lost/Found status email sent to: ${to}`);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('❌ Email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Pet found match notification (notify original owner)
app.post('/api/email/pet-found-match', async (req, res) => {
  const { to, petName, finderPhone, finderEmail, location, contactEmail } = req.body;

  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">🎉 Great News! Someone May Have Found ${petName || 'Your Pet'}!</h2>
        
        <p>A community member has reported finding a pet that matches your lost pet report.</p>
        
        <div style="background: #f0fff4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="margin-top: 0; color: #28a745;">Finder's Contact Information</h3>
          <p><strong>📞 Phone:</strong> ${finderPhone}</p>
          <p><strong>📧 Email:</strong> <a href="mailto:${finderEmail}">${finderEmail}</a></p>
          <p><strong>📍 Found Location:</strong> ${location}</p>
        </div>
        
        <p><strong>What to do next:</strong></p>
        <ol>
          <li>Contact the finder immediately using the details above</li>
          <li>Arrange a safe meeting to identify your pet</li>
          <li>Bring any proof of ownership (photos, vet records, etc.)</li>
        </ol>
        
        <p>We hope you'll be reunited with your beloved pet soon! 🐾</p>
        
        <p>Questions? Contact us at <a href="mailto:${contactEmail}">${contactEmail}</a></p>
        
        <br>
        <p>With hope,<br><strong>The PetVerse Team</strong></p>
      </div>
    `;

    await transporter.sendMail({
      from: '"PetVerse Team" <petverse29@gmail.com>',
      to: to,
      subject: `🎉 Someone May Have Found ${petName || 'Your Pet'}!`,
      html: html
    });

    console.log(`✅ Pet found match email sent to: ${to}`);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('❌ Email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// OTP / AUTHENTICATION EMAILS
// ============================================

// OTP verification email
app.post('/api/email/otp', async (req, res) => {
  const { to, otp, userName } = req.body;

  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8b5fbf;">🔐 Verify Your PetVerse Account</h2>
        
        <p>Hello ${userName || 'there'}!</p>
        
        <p>Thank you for signing up with PetVerse. Use the verification code below to complete your registration:</p>
        
        <div style="background: linear-gradient(135deg, #8b5fbf, #6d4c9f); padding: 30px; border-radius: 12px; margin: 20px 0; text-align: center;">
          <span style="font-size: 36px; letter-spacing: 8px; color: white; font-weight: bold;">${otp}</span>
        </div>
        
        <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
        
        <p>If you didn't create an account, you can safely ignore this email.</p>
        
        <br>
        <p>Welcome to PetVerse!<br><strong>The PetVerse Team</strong></p>
      </div>
    `;

    await transporter.sendMail({
      from: '"PetVerse" <petverse29@gmail.com>',
      to: to,
      subject: '🔐 Your PetVerse Verification Code',
      html: html
    });

    console.log(`✅ OTP email sent to: ${to}`);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('❌ OTP email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Password reset email
app.post('/api/email/password-reset', async (req, res) => {
  const { to, resetLink } = req.body;

  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8b5fbf;">Reset Your Password</h2>
        
        <p>We received a request to reset your PetVerse account password.</p>
        
        <p>Click the button below to set a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background: linear-gradient(135deg, #8b5fbf, #6d4c9f); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        
        <br>
        <p>Best regards,<br><strong>The PetVerse Team</strong></p>
      </div>
    `;

    await transporter.sendMail({
      from: '"PetVerse" <petverse29@gmail.com>',
      to: to,
      subject: 'Reset Your PetVerse Password',
      html: html
    });

    console.log(`✅ Password reset email sent to: ${to}`);
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    console.error('❌ Password reset email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Welcome email
app.post('/api/email/welcome', async (req, res) => {
  const { to, userName } = req.body;

  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8b5fbf;">🎉 Welcome to PetVerse, ${userName || 'Friend'}!</h2>
        
        <p>We're thrilled to have you join our community of pet lovers!</p>
        
        <div style="background: #f8f4ff; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="margin-top: 0;">What you can do on PetVerse:</h3>
          <ul>
            <li>🐾 Adopt loving pets looking for homes</li>
            <li>🔍 Report and find lost pets</li>
            <li>🤝 Volunteer for pet events</li>
            <li>💬 Connect with our community</li>
            <li>💖 Donate to support our mission</li>
          </ul>
        </div>
        
        <p>Start exploring and make a difference in a pet's life today!</p>
        
        <br>
        <p>With love,<br><strong>The PetVerse Team</strong></p>
      </div>
    `;

    await transporter.sendMail({
      from: '"PetVerse Team" <petverse29@gmail.com>',
      to: to,
      subject: '🎉 Welcome to PetVerse!',
      html: html
    });

    console.log(`✅ Welcome email sent to: ${to}`);
    res.json({ success: true, message: 'Welcome email sent' });
  } catch (error) {
    console.error('❌ Welcome email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'PetVerse Email Server' });
});

// Start server
const PORT = process.env.EMAIL_PORT || 3001;
app.listen(PORT, () => {
  console.log(`📧 PetVerse Email Server running on http://localhost:${PORT}`);
});
