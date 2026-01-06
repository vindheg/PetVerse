import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { showToast } from '../../utils/toast';
import './Donate.css';

const Donate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [amount, setAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [donationReceipt, setDonationReceipt] = useState(null);

  const fixedAmounts = [100, 500, 1000, 2000];
  const RAZORPAY_KEY = 'rzp_test_RzjRfjcIxISEsu';

  const handleCustomChange = (e) => {
    setCustomAmount(e.target.value);
    setAmount('custom');
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async (e) => {
    e.preventDefault();

    if (!user) {
      showToast('Please login to make a donation', 'error');
      navigate('/login');
      return;
    }

    const finalAmount = amount === 'custom' ? customAmount : amount;
    if (!finalAmount || finalAmount < 10) {
      showToast("Please enter a valid amount (minimum ₹10)", "error");
      return;
    }

    setLoading(true);

    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      showToast('Failed to load payment gateway', 'error');
      setLoading(false);
      return;
    }

    const options = {
      key: RAZORPAY_KEY,
      amount: finalAmount * 100,
      currency: 'INR',
      name: 'PetVerse',
      description: 'Donation for Pet Care',
      image: 'https://cdn-icons-png.flaticon.com/512/2138/2138440.png',
      handler: async function (response) {
        await handlePaymentSuccess(response, finalAmount);
      },
      prefill: {
        name: user.user_metadata?.username || user.email?.split('@')[0] || '',
        email: user.email,
        contact: ''
      },
      notes: {
        purpose: 'Pet Care Donation'
      },
      theme: {
        color: '#8b5fbf'
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
          showToast('Payment cancelled', 'info');
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
    setLoading(false);
  };

  const handlePaymentSuccess = async (response, finalAmount) => {
    try {
      let userName = user.email?.split('@')[0] || 'Anonymous';

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        if (profile?.username) {
          userName = profile.username;
        }
      } catch (err) {
        console.log('Profile fetch failed, using email');
      }

      const donationData = {
        user_id: user.id,
        user_name: userName,
        user_email: user.email,
        amount: parseFloat(finalAmount),
        transaction_id: response.razorpay_payment_id,
        status: 'verified',
        payment_id: response.razorpay_payment_id,
        payment_method: 'Razorpay',
        payment_status: 'paid'
      };

      const { data: donation, error } = await supabase
        .from('donations')
        .insert(donationData)
        .select()
        .single();

      if (error) throw error;

      try {
        await supabase
          .from('admin_notifications')
          .insert({
            type: 'donation',
            title: 'New Donation Received',
            message: `${userName} donated ₹${finalAmount} via Razorpay. Payment ID: ${response.razorpay_payment_id}`,
            donation_id: donation.id
          });
      } catch (notifError) {
        console.log('Notification failed but donation saved:', notifError);
      }

      setDonationReceipt({
        amount: finalAmount,
        transactionId: response.razorpay_payment_id,
        donorName: userName
      });
      setShowSuccess(true);
      showToast('Donation successful! Thank you! 🎉', 'success');

    } catch (error) {
      console.error('Error saving donation:', error);
      showToast(`Payment successful! Payment ID: ${response.razorpay_payment_id}. Please save this ID.`, 'error');
    }
  };

  if (showSuccess) {
    return (
      <div className="donate-page">
        <div className="donate-header">
          <div className="header-content">
            <h1>Thank You! 🎉</h1>
            <p>Your generous donation makes a real difference.</p>
          </div>
        </div>

        <div className="donate-container">
          <div className="donation-wrapper-centered">
            <div className="step-content fade-in success-view">
              <div className="success-icon-large">🎉</div>
              <h2>Thank You, {donationReceipt?.donorName}!</h2>
              <p>Your donation has been successfully received.</p>

              <div className="receipt-card">
                <div className="receipt-row">
                  <span>Amount:</span>
                  <strong>₹{donationReceipt?.amount}</strong>
                </div>
                <div className="receipt-row">
                  <span>Payment ID:</span>
                  <strong>{donationReceipt?.transactionId}</strong>
                </div>
                <div className="receipt-row">
                  <span>Status:</span>
                  <span className="status-badge-success">✅ Verified</span>
                </div>
              </div>

              <div className="payment-actions">
                <button className="btn-back" onClick={() => navigate('/')}>Return Home</button>
                <button className="continue-btn" onClick={() => window.location.reload()}>Donate Again</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="donate-page">
      <div className="donate-header">
        <div className="header-content">
          <h1>Make a Difference Today</h1>
          <p>100% of your donation goes directly to pet care and shelter maintenance.</p>
        </div>
      </div>

      <div className="donate-container">
        <div className="impact-section">
          <div className="impact-card">
            <div className="impact-icon">🍲</div>
            <h3>Nutritious Food</h3>
            <p>Ensuring every rescue goes to bed with a full belly.</p>
          </div>
          <div className="impact-card">
            <div className="impact-icon">💉</div>
            <h3>Medical Care</h3>
            <p>Treating injuries, vaccinations, and emergency surgeries.</p>
          </div>
          <div className="impact-card">
            <div className="impact-icon">🏠</div>
            <h3>Safe Shelter</h3>
            <p>Providing warm beds, toys, and a safe roof over their heads.</p>
          </div>
        </div>

        <div className="donation-wrapper-centered">
          <div className="step-content fade-in">
            <div className="form-header-center">
              <h2>Select Donation Amount</h2>
              <p>Choose an amount or enter a custom value</p>
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#e3f2fd', borderRadius: '10px', fontSize: '0.9rem' }}>
                <strong>💳 Secure Payment via Razorpay</strong> - Pay instantly with UPI, Cards, or Net Banking
              </div>
            </div>

            <form onSubmit={handlePayNow}>
              <div className="amounts-grid-ref">
                {fixedAmounts.map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`amount-box-btn ${amount === val ? 'selected' : ''}`}
                    onClick={() => { setAmount(val); setCustomAmount(''); }}
                  >
                    ₹{val.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="custom-input-ref-wrapper">
                <input
                  type="number"
                  placeholder="Or enter custom amount (₹)"
                  value={customAmount}
                  onChange={handleCustomChange}
                  className={`custom-input-ref ${amount === 'custom' ? 'active-border' : ''}`}
                  min="10"
                />
              </div>

              <button
                type="submit"
                className="continue-btn"
                disabled={loading}
                style={{
                  background: loading ? '#ccc' : 'linear-gradient(135deg, #8b5fbf, #2a9d8f)',
                  fontSize: '1.1rem',
                  padding: '1rem 2rem'
                }}
              >
                {loading ? 'Opening Payment Gateway...' : '💳 Pay Now with Razorpay'}
              </button>
            </form>

            <div style={{ marginTop: '2rem', textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>
              <p>🔒 Powered by Razorpay - 100% Secure Payments</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                <strong>Test Mode:</strong> UPI: success@razorpay | Card: 5267 3181 8797 5449 | OTP: 123456
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;