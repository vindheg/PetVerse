import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../utils/toast';
import './AdoptionForm.css';

const AdoptionForm = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
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
    fetchPetDetails();
  }, [petId]);

  const fetchPetDetails = async () => {
    if (!petId) return;
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single();

      if (error) throw error;
      setPet(data);
      setAdoptionFee(calculateAdoptionFee(data));
    } catch (error) {
      showToast('Could not load pet details', 'error');
      navigate('/adopt');
    } finally {
      setLoading(false);
    }
  };

  const calculateAdoptionFee = (petData) => {
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

      showToast('Adoption request submitted successfully! 🎉', 'success');
      setTimeout(() => navigate('/myadoptions'), 2000);

    } catch (error) {
      console.error('Error saving adoption:', error);
      showToast('Payment successful but failed to save. Contact support with Payment ID: ' + response.razorpay_payment_id, 'error');
    }
  };

  if (loading) return <div className="loading-state"><div className="spinner"></div></div>;
  if (!pet) return null;

  return (
    <div className="adoption-page-wrapper">
      <div className="adoption-card">
        <div className="pet-summary-panel" style={{ backgroundImage: `url(${pet.image})` }}>
          <div className="overlay">
            <div className="pet-badge">You are applying for</div>
            <h2>{pet.name}</h2>
            <div className="pet-mini-stats">
              <span>{pet.breed || pet.type}</span> • <span>{pet.age} years</span>
            </div>
            {!formSubmitted && (
              <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.95)', padding: '1.5rem', borderRadius: '12px', color: '#2d3748' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Adoption Fee</h3>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#8b5fbf' }}>₹{adoptionFee.toLocaleString()}</div>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.8 }}>Includes vaccination & health check</p>
              </div>
            )}
          </div>
        </div>

        <div className="form-panel">
          {!formSubmitted ? (
            <>
              <div className="form-header">
                <h3>Adoption Application</h3>
                <p>Please fill out your details to give {pet.name} a forever home.</p>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="form-section">
                  <label>Full Name *</label>
                  <input type="text" placeholder="Enter full name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>

                <div className="form-row">
                  <div className="form-section">
                    <label>Phone Number *</label>
                    <input type="tel" placeholder="Enter phone number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                  </div>
                  <div className="form-section disabled">
                    <label>Email Address</label>
                    <input type="email" value={user?.email} disabled />
                  </div>
                </div>

                <div className="form-section">
                  <label>Home Address *</label>
                  <textarea placeholder="Where will the pet live?" rows="2" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required></textarea>
                </div>

                <div className="form-section">
                  <label>Why do you want to adopt {pet.name}? *</label>
                  <textarea placeholder="Tell us a bit about your home environment..." rows="3" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} required></textarea>
                </div>

                <div className="form-section">
                  <label>Pet Experience</label>
                  <select value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })}>
                    <option value="first-time">First-time Pet Owner</option>
                    <option value="experienced">I have owned pets before</option>
                    <option value="expert">I currently have pets</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={() => navigate('/adopt')}>Cancel</button>
                  <button type="submit" className="btn-submit">Proceed to Payment →</button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="form-header">
                <h3>✅ Application Details Submitted</h3>
                <p>Complete the payment to finalize adoption of {pet.name}</p>
              </div>

              <div style={{ background: '#f7fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#2d3748' }}>Payment Summary</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Pet:</span>
                  <strong>{pet.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Adopter:</span>
                  <strong>{formData.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '2px solid #e2e8f0' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>Adoption Fee:</span>
                  <strong style={{ fontSize: '1.5rem', color: '#8b5fbf' }}>₹{adoptionFee.toLocaleString()}</strong>
                </div>
              </div>

              <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <strong>💳 Test Payment:</strong> UPI: success@razorpay (easiest!) | Card: 5267 3181 8797 5449 | OTP: 123456
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setFormSubmitted(false)}>← Edit Details</button>
                <button
                  type="button"
                  className="btn-submit"
                  onClick={handlePayNow}
                  disabled={submitting}
                  style={{ background: submitting ? '#ccc' : 'linear-gradient(135deg, #8b5fbf 0%, #2a9d8f 100%)' }}
                >
                  {submitting ? 'Processing...' : '💳 Pay Now with Razorpay'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdoptionForm;