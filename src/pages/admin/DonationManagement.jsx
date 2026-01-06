// src/pages/admin/DonationManagement.jsx - WITH REACT MODAL
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { showToast } from '../../utils/toast';
import { useAuth } from '../../contexts/AuthContext';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './admin.css';

const DonationManagement = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filter, setFilter] = useState('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDonations();
  }, [filter]);

  const loadDonations = async () => {
    setLoading(true);
    try {
      let query = supabase.from('donations').select('*').order('created_at', { ascending: false });
      if (filter !== 'all') query = query.eq('status', filter);
      const { data, error } = await query;
      if (!error) setDonations(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (donationId, action, userName, amount) => {
    setModalData({ donationId, action, userName, amount });
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!modalData) return;

    const { donationId, action } = modalData;
    setShowModal(false);
    setProcessing(donationId);

    try {
      const status = action === 'verify' ? 'verified' : 'rejected';
      const { error } = await supabase
        .from('donations')
        .update({ status, verified_at: new Date().toISOString() })
        .eq('id', donationId);

      if (error) throw error;
      showToast(`Donation ${status} successfully!`, 'success');
      loadDonations();
    } catch (e) {
      console.error(e);
      showToast('Action failed: ' + e.message, 'error');
    } finally {
      setProcessing(null);
      setModalData(null);
    }
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : 'N/A';
  const getPaymentIcon = (method) => method?.toLowerCase().includes('upi') ? '📱' : '💳';

  // Stats
  const counts = { pending: 0, verified: 0, rejected: 0 };
  let totalVerified = 0;
  donations.forEach(d => {
    if (d.status) counts[d.status]++;
    if (d.status === 'verified') totalVerified += d.amount || 0;
  });

  return (
    <div style={{ padding: '20px', paddingTop: '100px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Donation Management</h1>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Verify and track donations</p>
      </div>
      <AdminNavbar />

      {/* Stats */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ padding: '15px 25px', background: '#E0E7FF', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{totalVerified.toLocaleString()}</div>
          <div>Total Verified</div>
        </div>
        <div style={{ padding: '15px 25px', background: '#FEF3C7', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{counts.pending}</div>
          <div>Pending</div>
        </div>
        <div style={{ padding: '15px 25px', background: '#D1FAE5', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{counts.verified}</div>
          <div>Verified</div>
        </div>
        <div style={{ padding: '15px 25px', background: '#FEE2E2', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{counts.rejected}</div>
          <div>Rejected</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
        {['all', 'pending', 'verified', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '10px 20px', background: filter === f ? '#8B5FBF' : '#f0f0f0',
            color: filter === f ? 'white' : '#333', border: 'none', borderRadius: '8px', cursor: 'pointer'
          }}>{f.toUpperCase()}</button>
        ))}
        <button onClick={loadDonations} style={{ padding: '10px 20px', background: '#374151', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginLeft: 'auto' }}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p>
      ) : donations.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No donations found.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {donations.map(donation => (
            <div key={donation.id} style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10B981' }}>₹{donation.amount?.toLocaleString()}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', color: '#666' }}>
                    {getPaymentIcon(donation.payment_method)} {donation.payment_method || 'Razorpay'}
                  </div>
                </div>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  background: donation.status === 'pending' ? '#FEF3C7' : donation.status === 'verified' ? '#D1FAE5' : '#FEE2E2',
                  color: donation.status === 'pending' ? '#92400E' : donation.status === 'verified' ? '#065F46' : '#991B1B'
                }}>
                  {donation.status?.toUpperCase()}
                </span>
              </div>

              {/* Donor Info */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 4px 0' }}>{donation.user_name || 'Anonymous'}</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{donation.user_email}</p>
              </div>

              {/* Details */}
              <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '16px' }}>
                <p style={{ margin: '4px 0' }}><strong>Transaction ID:</strong> {donation.transaction_id || donation.id?.substring(0, 8)}...</p>
                {donation.payment_id && <p style={{ margin: '4px 0' }}><strong>Payment ID:</strong> {donation.payment_id}</p>}
                <p style={{ margin: '4px 0' }}><strong>Date:</strong> {formatDate(donation.created_at)}</p>
                {donation.verified_at && <p style={{ margin: '4px 0' }}><strong>Verified:</strong> {formatDate(donation.verified_at)}</p>}
              </div>

              {/* Action buttons - Only for pending */}
              {donation.status === 'pending' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => openConfirmModal(donation.id, 'verify', donation.user_name, donation.amount)}
                    disabled={processing === donation.id}
                    style={{ flex: 1, padding: '10px', background: '#10B981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {processing === donation.id ? '...' : '✓ Verify'}
                  </button>
                  <button
                    onClick={() => openConfirmModal(donation.id, 'reject', donation.user_name, donation.amount)}
                    disabled={processing === donation.id}
                    style={{ flex: 1, padding: '10px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {processing === donation.id ? '...' : '✗ Reject'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showModal && modalData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 16px 0' }}>
              {modalData.action === 'verify' ? '✅ Verify Donation?' : '❌ Reject Donation?'}
            </h2>
            <p style={{ margin: '0 0 24px 0', color: '#4b5563' }}>
              {modalData.action === 'verify'
                ? `Verify ₹${modalData.amount?.toLocaleString()} donation from ${modalData.userName}?`
                : `Reject this donation from ${modalData.userName}?`}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => { setShowModal(false); setModalData(null); }} style={{ padding: '12px 24px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmAction} style={{ padding: '12px 24px', background: modalData.action === 'verify' ? '#10B981' : '#EF4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Yes, {modalData.action === 'verify' ? 'Verify' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationManagement;