// src/components/user/AdoptionModal.jsx - Polished Adoption Popup Modal
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../utils/toast';
import './AdoptionModal.css';

// SVG Icons
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const AdoptionModal = ({ pet, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [adoptionFee, setAdoptionFee] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    reason: '',
    experience: 'first-time'
  });

  const RAZORPAY_KEY = 'rzp_test_RzjRfjcIxISEsu';

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    if (pet) {
      setAdoptionFee(calculateAdoptionFee(pet));
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [pet]);

  const calculateAdoptionFee = (petData) => {
    // If admin has set a price, use that
    if (petData.price && petData.price > 0) {
      return petData.price;
    }
    // Otherwise calculate based on type and age
    const baseFees = { 'Dog': 2000, 'Cat': 1500, 'Rabbit': 1000, 'Bird': 800, 'Other': 1000 };
    let fee = baseFees[petData.type] || 1000;
    if (petData.age > 5) fee = Math.round(fee * 0.7);
    else if (petData.age > 3) fee = Math.round(fee * 0.85);
    return fee;
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to adopt', 'error');
      onClose();
      navigate('/login');
      return;
    }
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.reason.trim()) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setFormSubmitted(true);
    showToast('Form submitted! Proceed to payment', 'success');
  };

  const handlePayNow = async () => {
    setSubmitting(true);

    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      showToast('Failed to load payment gateway', 'error');
      setSubmitting(false);
      return;
    }

    const options = {
      key: RAZORPAY_KEY,
      amount: adoptionFee * 100,
      currency: 'INR',
      name: 'PetVerse',
      description: `Adoption Fee for ${pet.name}`,
      image: pet.image || 'https://cdn-icons-png.flaticon.com/512/2138/2138440.png',
      handler: async function (response) {
        await handlePaymentSuccess(response);
      },
      prefill: {
        name: formData.name,
        email: user.email,
        contact: ''
      },
      notes: {
        pet_id: pet.id,
        pet_name: pet.name,
        adopter_name: formData.name
      },
      theme: { color: '#8b5fbf' },
      modal: {
        ondismiss: function () {
          setSubmitting(false);
          showToast('Payment cancelled', 'info');
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
    setSubmitting(false);
  };

  const handlePaymentSuccess = async (response) => {
    try {
      const { data: adoption, error: adoptionError } = await supabase
        .from('adoptions')
        .insert({
          user_id: user.id,
          pet_id: pet.id,
          pet_name: pet.name,
          adopter_name: formData.name,
          adopter_email: user.email,
          adopter_phone: formData.phone,
          adopter_address: formData.address,
          status: 'pending',
          payment_id: response.razorpay_payment_id,
          adoption_fee: adoptionFee,
          payment_status: 'paid',
          details: JSON.stringify({ reason: formData.reason, experience: formData.experience })
        })
        .select()
        .single();

      if (adoptionError) throw adoptionError;

      await supabase.from('pets').update({ status: false }).eq('id', pet.id);

      await supabase.from('admin_notifications').insert({
        type: 'adoption',
        title: 'New Paid Adoption Request',
        message: `${formData.name} paid ₹${adoptionFee} to adopt ${pet.name}. Payment ID: ${response.razorpay_payment_id}`,
        adoption_id: adoption.id
      });

      showToast('Adoption request submitted successfully!', 'success');
      onClose();
      setTimeout(() => navigate('/myadoptions'), 500);

    } catch (error) {
      console.error('Error saving adoption:', error);
      showToast('Payment successful but failed to save. Contact support with Payment ID: ' + response.razorpay_payment_id, 'error');
    }
  };

  if (!pet) return null;

  const imageSrc = pet.image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&q=80';

  return (
    <div className="adoption-modal-overlay" onClick={onClose}>
      <div className="adoption-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="adoption-modal-close" onClick={onClose}>
          <CloseIcon />
        </button>

        {/* Left Panel - Pet Image & Details */}
        <div className="adoption-modal-pet-panel">
          <div className="pet-image-container">
            <img src={imageSrc} alt={pet.name} />
            <div className="pet-image-overlay">
              <div className="pet-badge-adopting">
                <HeartIcon />
                <span>Adopting</span>
              </div>
            </div>
          </div>
          <div className="pet-info-section">
            <h2 className="pet-name-title">{pet.name}</h2>
            <div className="pet-meta-row">
              <span className="pet-meta-item">{pet.breed || pet.type}</span>
              <span className="pet-meta-divider">•</span>
              <span className="pet-meta-item">{pet.age} years</span>
              <span className="pet-meta-divider">•</span>
              <span className="pet-meta-item">{pet.gender || 'Unknown'}</span>
            </div>
            <div className="adoption-fee-card">
              <div className="fee-label">Adoption Fee</div>
              <div className="fee-amount">₹{adoptionFee.toLocaleString()}</div>
              <div className="fee-includes">Includes vaccination & health check</div>
            </div>
            <div className="pet-stats-grid">
              {pet.weight && (
                <div className="pet-stat">
                  <span className="stat-label">Weight</span>
                  <span className="stat-value">{pet.weight}</span>
                </div>
              )}
              {pet.color && (
                <div className="pet-stat">
                  <span className="stat-label">Color</span>
                  <span className="stat-value">{pet.color}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="adoption-modal-form-panel">
          {!formSubmitted ? (
            <>
              <div className="form-header">
                <h3>Adoption Application</h3>
                <p>Complete this form to give {pet.name} a forever home.</p>
              </div>

              <form onSubmit={handleFormSubmit} className="adoption-form">
                <div className="form-group">
                  <label>Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number <span className="required">*</span></label>
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group disabled">
                    <label>Email Address</label>
                    <input type="email" value={user?.email || ''} disabled />
                  </div>
                </div>

                <div className="form-group">
                  <label>Home Address <span className="required">*</span></label>
                  <textarea
                    placeholder="Where will the pet live?"
                    rows="2"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Why do you want to adopt {pet.name}? <span className="required">*</span></label>
                  <textarea
                    placeholder="Tell us about your home environment..."
                    rows="3"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Pet Experience</label>
                  <select
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  >
                    <option value="first-time">First-time Pet Owner</option>
                    <option value="experienced">I have owned pets before</option>
                    <option value="expert">I currently have pets</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                  <button type="submit" className="btn-submit">Proceed to Payment →</button>
                </div>
              </form>
            </>
          ) : (
            <div className="payment-section">
              <div className="form-header">
                <div className="success-icon">
                  <CheckCircleIcon />
                </div>
                <h3>Application Submitted!</h3>
                <p>Complete the payment to finalize your adoption of {pet.name}</p>
              </div>

              <div className="payment-summary">
                <h4>Payment Summary</h4>
                <div className="summary-row">
                  <span>Pet:</span>
                  <strong>{pet.name}</strong>
                </div>
                <div className="summary-row">
                  <span>Adopter:</span>
                  <strong>{formData.name}</strong>
                </div>
                <div className="summary-row total">
                  <span>Adoption Fee:</span>
                  <strong className="fee">₹{adoptionFee.toLocaleString()}</strong>
                </div>
              </div>

              <div className="test-payment-info">
                <strong>Test Payment Info:</strong>
                <p>UPI: success@razorpay</p>
                <p>Card: 5267 3181 8797 5449 | OTP: 123456</p>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setFormSubmitted(false)}>
                  ← Edit Details
                </button>
                <button
                  type="button"
                  className="btn-pay"
                  onClick={handlePayNow}
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : 'Pay Now with Razorpay'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdoptionModal;
