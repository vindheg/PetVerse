// src/pages/admin/AdminLostFound.jsx - WITH REACT MODAL
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { showToast } from '../../utils/toast';
import { lostFoundService } from '../../services/lostFoundService';
import { useAuth } from '../../contexts/AuthContext';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './admin.css';

const AdminLostFound = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadReports();
  }, [typeFilter, statusFilter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      let query = supabase.from('lost_found_pets').select('*').order('created_at', { ascending: false });

      if (typeFilter !== 'all') query = query.eq('report_type', typeFilter);
      if (statusFilter !== 'all') query = query.eq('status', statusFilter);

      const { data, error } = await query;
      if (!error) setReports(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (reportId, action, petName, contactEmail, reportType) => {
    setModalData({ reportId, action, petName, contactEmail, reportType });
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!modalData) return;

    const { reportId, action, petName, contactEmail, reportType } = modalData;
    setShowModal(false);
    setProcessing(reportId);

    try {
      await lostFoundService.updateStatus(reportId, action, contactEmail, petName, reportType);
      showToast(`Report ${action} successfully!`, 'success');
      loadReports();
    } catch (e) {
      console.error(e);
      showToast('Action failed: ' + e.message, 'error');
    } finally {
      setProcessing(null);
      setModalData(null);
    }
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : 'N/A';

  return (
    <div style={{ padding: '20px', paddingTop: '100px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Lost & Found Management</h1>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Review and manage pet reports</p>
      </div>
      <AdminNavbar />

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div>
          <span style={{ marginRight: '8px', fontWeight: '600' }}>Type:</span>
          {['all', 'lost', 'found'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{
              padding: '8px 16px', marginRight: '5px', background: typeFilter === t ? '#8B5FBF' : '#f0f0f0',
              color: typeFilter === t ? 'white' : '#333', border: 'none', borderRadius: '6px', cursor: 'pointer'
            }}>{t.toUpperCase()}</button>
          ))}
        </div>
        <div>
          <span style={{ marginRight: '8px', fontWeight: '600' }}>Status:</span>
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '8px 16px', marginRight: '5px', background: statusFilter === s ? '#8B5FBF' : '#f0f0f0',
              color: statusFilter === s ? 'white' : '#333', border: 'none', borderRadius: '6px', cursor: 'pointer'
            }}>{s.toUpperCase()}</button>
          ))}
        </div>
        <button onClick={loadReports} style={{ padding: '8px 16px', background: '#374151', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginLeft: 'auto' }}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p>
      ) : reports.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No reports found.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {reports.map(report => (
            <div key={report.id} style={{
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb'
            }}>
              {/* Image */}
              {report.image_url && (
                <img src={report.image_url} alt={report.pet_name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
              )}

              <div style={{ padding: '16px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      marginBottom: '8px',
                      background: report.report_type === 'lost' ? '#FEE2E2' : '#D1FAE5',
                      color: report.report_type === 'lost' ? '#991B1B' : '#065F46'
                    }}>
                      {report.report_type?.toUpperCase()}
                    </span>
                    <h3 style={{ margin: '0 0 4px 0' }}>{report.pet_name}</h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{report.pet_type} • {report.breed || 'Unknown breed'}</p>
                  </div>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    background: report.status === 'pending' ? '#FEF3C7' : report.status === 'approved' ? '#D1FAE5' : '#FEE2E2',
                    color: report.status === 'pending' ? '#92400E' : report.status === 'approved' ? '#065F46' : '#991B1B'
                  }}>
                    {report.status?.toUpperCase()}
                  </span>
                </div>

                {/* Details */}
                <div style={{ fontSize: '14px', color: '#4b5563' }}>
                  <p style={{ margin: '4px 0' }}>📍 {report.location}</p>
                  <p style={{ margin: '4px 0' }}>📅 {formatDate(report.date_lost_found)}</p>
                  <p style={{ margin: '4px 0' }}>📱 {report.contact_phone}</p>
                  {report.contact_email && <p style={{ margin: '4px 0' }}>✉️ {report.contact_email}</p>}
                </div>

                {/* Action buttons - ONLY for LOST reports that are pending */}
                {report.status === 'pending' && report.report_type === 'lost' && (
                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openConfirmModal(report.id, 'approved', report.pet_name, report.contact_email, report.report_type)}
                      disabled={processing === report.id}
                      style={{ flex: 1, padding: '10px', background: '#10B981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      {processing === report.id ? '...' : '✓ Approve'}
                    </button>
                    <button
                      onClick={() => openConfirmModal(report.id, 'rejected', report.pet_name, report.contact_email, report.report_type)}
                      disabled={processing === report.id}
                      style={{ flex: 1, padding: '10px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      {processing === report.id ? '...' : '✗ Reject'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showModal && modalData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 16px 0' }}>
              {modalData.action === 'approved' ? '✅ Approve Report?' : '❌ Reject Report?'}
            </h2>
            <p style={{ margin: '0 0 24px 0', color: '#4b5563' }}>
              {modalData.action === 'approved'
                ? `Approve this lost pet report for ${modalData.petName}? It will be posted to Community.`
                : `Reject this report for ${modalData.petName}?`}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => { setShowModal(false); setModalData(null); }} style={{ padding: '12px 24px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmAction} style={{ padding: '12px 24px', background: modalData.action === 'approved' ? '#10B981' : '#EF4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Yes, {modalData.action === 'approved' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLostFound;
