// src/pages/admin/AdminAdoptions.jsx - WITH REACT MODAL (NO window.confirm)
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { showToast } from '../../utils/toast';
import { useAuth } from '../../contexts/AuthContext';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './admin.css';

const AdminAdoptions = () => {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processing, setProcessing] = useState(null);

  // Modal state instead of window.confirm
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  // Fetch only once on mount or when filter changes
  useEffect(() => {
    fetchAdoptions();
  }, [filter]);

  const fetchAdoptions = async () => {
    try {
      let query = supabase.from('adoptions').select('*, pets(*)').order('created_at', { ascending: false });
      if (filter !== 'all') query = query.eq('status', filter);
      const { data, error } = await query;
      if (!error) setAdoptions(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Open modal instead of window.confirm
  const openConfirmModal = (id, petId, petName, action) => {
    console.log('Opening modal for:', action, petName);
    setModalData({ id, petId, petName, action });
    setShowModal(true);
  };

  // Process the action when user confirms in modal
  const confirmAction = async () => {
    if (!modalData) return;

    const { id, petId, petName, action } = modalData;
    setShowModal(false);
    setProcessing(id);

    try {
      // Update adoption
      const { error } = await supabase
        .from('adoptions')
        .update({
          status: action,
          admin_verified_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        showToast('Error: ' + error.message, 'error');
        console.error('Update error:', error);
        return;
      }

      // Update pet status
      if (petId) {
        const petUpdate = action === 'accepted'
          ? { status: false, adopted: true }
          : { status: true, adopted: false };
        await supabase.from('pets').update(petUpdate).eq('id', petId);
      }

      showToast(`Adoption ${action} successfully!`, 'success');
      fetchAdoptions();

    } catch (e) {
      console.error('Error:', e);
      showToast('Failed to update', 'error');
    } finally {
      setProcessing(null);
      setModalData(null);
    }
  };

  const cancelAction = () => {
    setShowModal(false);
    setModalData(null);
  };

  // Stats
  const counts = { pending: 0, accepted: 0, rejected: 0 };
  adoptions.forEach(a => { if (a.status) counts[a.status]++; });

  return (
    <div style={{ padding: '20px', paddingTop: '100px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>Adoption Requests</h1>
      <AdminNavbar />

      {/* Stats */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ padding: '15px 25px', background: '#E0E7FF', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{adoptions.length}</div>
          <div>Total</div>
        </div>
        <div style={{ padding: '15px 25px', background: '#FEF3C7', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{counts.pending}</div>
          <div>Pending</div>
        </div>
        <div style={{ padding: '15px 25px', background: '#D1FAE5', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{counts.accepted}</div>
          <div>Accepted</div>
        </div>
        <div style={{ padding: '15px 25px', background: '#FEE2E2', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{counts.rejected}</div>
          <div>Rejected</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '25px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {['all', 'pending', 'accepted', 'rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '12px 24px',
              background: filter === f ? '#8B5FBF' : '#f0f0f0',
              color: filter === f ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: filter === f ? 'bold' : 'normal',
              fontSize: '14px'
            }}
          >
            {f.toUpperCase()}
          </button>
        ))}
        <button
          onClick={fetchAdoptions}
          style={{ padding: '12px 24px', background: '#374151', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginLeft: 'auto' }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && <p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p>}

      {/* Empty */}
      {!loading && adoptions.length === 0 && <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No adoptions found.</p>}

      {/* List */}
      {!loading && adoptions.map(adoption => (
        <div key={adoption.id} style={{
          background: 'white',
          padding: '24px',
          marginBottom: '16px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#1f2937' }}>{adoption.pet_name}</h3>
              <p style={{ margin: '4px 0', color: '#4b5563' }}>👤 {adoption.adopter_name}</p>
              <p style={{ margin: '4px 0', color: '#4b5563' }}>📧 {adoption.adopter_email}</p>
              <p style={{ margin: '4px 0', color: '#4b5563' }}>📱 {adoption.adopter_phone}</p>
            </div>
            <span style={{
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 'bold',
              background: adoption.status === 'pending' ? '#FEF3C7' : adoption.status === 'accepted' ? '#D1FAE5' : '#FEE2E2',
              color: adoption.status === 'pending' ? '#92400E' : adoption.status === 'accepted' ? '#065F46' : '#991B1B'
            }}>
              {adoption.status?.toUpperCase()}
            </span>
          </div>

          {/* ACTION BUTTONS - Only for pending */}
          {adoption.status === 'pending' && (
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '12px' }}>
              <button
                onClick={() => openConfirmModal(adoption.id, adoption.pet_id, adoption.pet_name, 'accepted')}
                disabled={processing === adoption.id}
                style={{
                  padding: '14px 28px',
                  background: processing === adoption.id ? '#9CA3AF' : '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: processing === adoption.id ? 'not-allowed' : 'pointer'
                }}
              >
                {processing === adoption.id ? '⏳ Processing...' : '✅ ACCEPT'}
              </button>
              <button
                onClick={() => openConfirmModal(adoption.id, adoption.pet_id, adoption.pet_name, 'rejected')}
                disabled={processing === adoption.id}
                style={{
                  padding: '14px 28px',
                  background: processing === adoption.id ? '#9CA3AF' : '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: processing === adoption.id ? 'not-allowed' : 'pointer'
                }}
              >
                {processing === adoption.id ? '⏳ Processing...' : '❌ REJECT'}
              </button>
            </div>
          )}
        </div>
      ))}

      {/* CONFIRMATION MODAL - React-based, won't be dismissed by re-render */}
      {showModal && modalData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
              {modalData.action === 'accepted' ? '✅ Accept Adoption?' : '❌ Reject Adoption?'}
            </h2>
            <p style={{ margin: '0 0 24px 0', color: '#4b5563' }}>
              Are you sure you want to <strong>{modalData.action}</strong> the adoption request for <strong>{modalData.petName}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={cancelAction}
                style={{
                  padding: '12px 24px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                style={{
                  padding: '12px 24px',
                  background: modalData.action === 'accepted' ? '#10B981' : '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Yes, {modalData.action === 'accepted' ? 'Accept' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdoptions;