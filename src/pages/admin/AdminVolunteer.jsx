// src/pages/admin/AdminVolunteer.jsx - WITH REACT MODAL + MASS EMAIL
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { showToast } from '../../utils/toast';
import { volunteerService } from '../../services/volunteerService';
import { emailService } from '../../services/emailService';
import { useAuth } from '../../contexts/AuthContext';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './admin.css';

const AdminVolunteer = () => {
  const [applications, setApplications] = useState([]);
  const [acceptedVolunteers, setAcceptedVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [activeSection, setActiveSection] = useState('applications');
  const [roleFilter, setRoleFilter] = useState('all');

  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', time: '', location: '', address: '', max_volunteers: '', responsibilities: '' });

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({ selectedEvent: '', customMessage: '', sending: false });

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const roles = ['all', ...new Set(acceptedVolunteers.map(v => v.role_interest).filter(Boolean))];
  const filteredVolunteers = roleFilter === 'all' ? acceptedVolunteers : acceptedVolunteers.filter(v => v.role_interest === roleFilter);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [apps, accepted, evts] = await Promise.all([
        volunteerService.getPendingApplications(),
        volunteerService.getAcceptedVolunteers(),
        volunteerService.getEvents()
      ]);
      setApplications(apps || []);
      setAcceptedVolunteers(accepted || []);
      setEvents(evts || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openConfirmModal = (type, id, name, email = '') => {
    setModalData({ type, id, name, email });
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!modalData) return;
    const { type, id, name, email } = modalData;
    setShowModal(false);
    setProcessing(id);
    try {
      if (type === 'accept_volunteer') {
        await volunteerService.updateVolunteerStatus(id, 'approved', email, name);
        showToast(`${name} accepted!`, 'success');
      } else if (type === 'reject_volunteer') {
        await volunteerService.updateVolunteerStatus(id, 'rejected', email, name);
        showToast(`${name} rejected.`, 'success');
      } else if (type === 'delete_event') {
        await volunteerService.deleteEvent(id);
        showToast('Event deleted!', 'success');
      }
      loadData();
    } catch (e) {
      console.error(e);
      showToast('Action failed: ' + e.message, 'error');
    } finally {
      setProcessing(null);
      setModalData(null);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await volunteerService.createEvent({ ...eventForm, max_volunteers: parseInt(eventForm.max_volunteers) || 10, current_volunteers: 0, status: 'upcoming' });
      showToast('Event created!', 'success');
      setShowEventForm(false);
      setEventForm({ title: '', description: '', date: '', time: '', location: '', address: '', max_volunteers: '', responsibilities: '' });
      loadData();
    } catch (e) {
      console.error(e);
      showToast('Failed to create event: ' + e.message, 'error');
    }
  };

  // MASS EMAIL - FIXED
  const handleSendMassEmail = async () => {
    if (!emailForm.selectedEvent) {
      showToast('Please select an event', 'error');
      return;
    }
    const volunteersToEmail = filteredVolunteers.filter(v => v.email);
    if (volunteersToEmail.length === 0) {
      showToast('No volunteers with email found', 'error');
      return;
    }
    setEmailForm(prev => ({ ...prev, sending: true }));
    try {
      // Find event by ID - handle both string and number IDs
      const event = events.find(e => String(e.id) === String(emailForm.selectedEvent));
      if (!event) {
        showToast('Selected event not found', 'error');
        setEmailForm(prev => ({ ...prev, sending: false }));
        return;
      }
      const volunteerEmails = volunteersToEmail.map(v => v.email);
      console.log('Sending email to:', volunteerEmails, 'Event:', event);
      await emailService.sendVolunteerEventEmail(event, volunteerEmails, emailForm.customMessage);
      showToast(`Email sent to ${volunteerEmails.length} volunteer(s)!`, 'success');
      setShowEmailModal(false);
      setEmailForm({ selectedEvent: '', customMessage: '', sending: false });
    } catch (e) {
      console.error('Email error:', e);
      showToast('Failed to send: ' + (e.message || 'Unknown error'), 'error');
    } finally {
      setEmailForm(prev => ({ ...prev, sending: false }));
    }
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : 'N/A';

  return (
    <div style={{ padding: '20px', paddingTop: '100px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Volunteer Management</h1>
      <AdminNavbar />

      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #e5e7eb', paddingBottom: '15px', flexWrap: 'wrap' }}>
        {[{ key: 'applications', label: `📋 Applications (${applications.length})` }, { key: 'accepted', label: `✅ Accepted (${acceptedVolunteers.length})` }, { key: 'events', label: `📅 Events (${events.length})` }].map(tab => (
          <button key={tab.key} onClick={() => setActiveSection(tab.key)} style={{ padding: '12px 24px', background: activeSection === tab.key ? '#8B5FBF' : 'transparent', color: activeSection === tab.key ? 'white' : '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{tab.label}</button>
        ))}
        <button onClick={loadData} style={{ padding: '12px 24px', background: '#374151', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginLeft: 'auto' }}>🔄 Refresh</button>
      </div>

      {loading ? <p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p> : (
        <>
          {activeSection === 'applications' && (
            <div>
              {applications.length === 0 ? <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No pending applications.</p> : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {applications.map(app => (
                    <div key={app.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ margin: '0 0 8px 0' }}>{app.full_name}</h3>
                          <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>📧 {app.email} | 📱 {app.phone}</p>
                          <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>🎯 {app.role_interest || 'General'} | ⏰ {app.availability || 'Flexible'}</p>
                        </div>
                        <span style={{ padding: '6px 12px', background: '#FEF3C7', color: '#92400E', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}>PENDING</span>
                      </div>
                      <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                        <button onClick={() => openConfirmModal('accept_volunteer', app.id, app.full_name, app.email)} disabled={processing === app.id} style={{ padding: '10px 20px', background: '#10B981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{processing === app.id ? '...' : '✓ Accept'}</button>
                        <button onClick={() => openConfirmModal('reject_volunteer', app.id, app.full_name, app.email)} disabled={processing === app.id} style={{ padding: '10px 20px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{processing === app.id ? '...' : '✗ Reject'}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'accepted' && (
            <div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontWeight: '600' }}>Filter by Role:</span>
                {roles.map(role => (
                  <button key={role} onClick={() => setRoleFilter(role)} style={{ padding: '8px 16px', background: roleFilter === role ? '#8B5FBF' : '#f0f0f0', color: roleFilter === role ? 'white' : '#333', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{role === 'all' ? 'All Roles' : role}</button>
                ))}
                <button onClick={() => setShowEmailModal(true)} style={{ padding: '10px 20px', background: '#6366F1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginLeft: 'auto' }}>✉️ Send Mass Email ({filteredVolunteers.length})</button>
              </div>
              {filteredVolunteers.length === 0 ? <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No accepted volunteers{roleFilter !== 'all' ? ` for role "${roleFilter}"` : ''}.</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
                  <thead><tr style={{ background: '#f3f4f6' }}><th style={{ padding: '14px', textAlign: 'left' }}>Name</th><th style={{ padding: '14px', textAlign: 'left' }}>Email</th><th style={{ padding: '14px', textAlign: 'left' }}>Phone</th><th style={{ padding: '14px', textAlign: 'left' }}>Role</th><th style={{ padding: '14px', textAlign: 'left' }}>Availability</th></tr></thead>
                  <tbody>{filteredVolunteers.map(vol => (<tr key={vol.id} style={{ borderBottom: '1px solid #e5e7eb' }}><td style={{ padding: '14px' }}>{vol.full_name}</td><td style={{ padding: '14px' }}>{vol.email}</td><td style={{ padding: '14px' }}>{vol.phone}</td><td style={{ padding: '14px' }}><span style={{ padding: '4px 10px', background: '#E0E7FF', color: '#4338CA', borderRadius: '12px', fontSize: '12px' }}>{vol.role_interest || 'General'}</span></td><td style={{ padding: '14px' }}>{vol.availability || 'Flexible'}</td></tr>))}</tbody>
                </table>
              )}
            </div>
          )}

          {activeSection === 'events' && (
            <div>
              <button onClick={() => setShowEventForm(true)} style={{ marginBottom: '20px', padding: '12px 24px', background: '#8B5FBF', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add New Event</button>
              {events.length === 0 ? <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No events found.</p> : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {events.map(event => (
                    <div key={event.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ margin: '0 0 8px 0' }}>{event.title}</h3>
                          <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>📅 {formatDate(event.date)} at {event.time} | 📍 {event.location}</p>
                          <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>👥 {event.current_volunteers || 0}/{event.max_volunteers} volunteers</p>
                        </div>
                        <button onClick={() => openConfirmModal('delete_event', event.id, event.title)} disabled={processing === event.id} style={{ padding: '8px 16px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{processing === event.id ? '...' : '🗑️ Delete'}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* EVENT FORM MODAL */}
      {showEventForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 20px 0' }}>Create New Event</h2>
            <form onSubmit={handleCreateEvent}>
              <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Title *</label><input type="text" value={eventForm.title} onChange={(e) => setEventForm(p => ({ ...p, title: e.target.value }))} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div><label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Date *</label><input type="date" value={eventForm.date} onChange={(e) => setEventForm(p => ({ ...p, date: e.target.value }))} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
                <div><label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Time</label><input type="text" value={eventForm.time} onChange={(e) => setEventForm(p => ({ ...p, time: e.target.value }))} placeholder="10:00 AM" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
              </div>
              <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Location *</label><input type="text" value={eventForm.location} onChange={(e) => setEventForm(p => ({ ...p, location: e.target.value }))} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
              <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Max Volunteers</label><input type="number" value={eventForm.max_volunteers} onChange={(e) => setEventForm(p => ({ ...p, max_volunteers: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
              <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Description</label><textarea value={eventForm.description} onChange={(e) => setEventForm(p => ({ ...p, description: e.target.value }))} rows="3" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowEventForm(false)} style={{ padding: '12px 24px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '12px 24px', background: '#8B5FBF', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MASS EMAIL MODAL */}
      {showEmailModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '90%' }}>
            <h2 style={{ margin: '0 0 8px 0' }}>✉️ Send Mass Email</h2>
            <p style={{ margin: '0 0 20px 0', color: '#666' }}>Send event notification to <strong>{filteredVolunteers.length} volunteer(s)</strong>{roleFilter !== 'all' && <> (Role: {roleFilter})</>}</p>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Select Event *</label>
              <select value={emailForm.selectedEvent} onChange={(e) => setEmailForm(p => ({ ...p, selectedEvent: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                <option value="">-- Select an event --</option>
                {events.map(event => (<option key={event.id} value={event.id}>{event.title} - {formatDate(event.date)}</option>))}
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Custom Message (Optional)</label>
              <textarea value={emailForm.customMessage} onChange={(e) => setEmailForm(p => ({ ...p, customMessage: e.target.value }))} rows="4" placeholder="Add a personal message..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
            <div style={{ background: '#F3F4F6', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>📧 Recipients ({filteredVolunteers.length}):</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>{filteredVolunteers.slice(0, 3).map(v => v.email).join(', ')}{filteredVolunteers.length > 3 && ` ... and ${filteredVolunteers.length - 3} more`}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setShowEmailModal(false); setEmailForm({ selectedEvent: '', customMessage: '', sending: false }); }} style={{ padding: '12px 24px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSendMassEmail} disabled={emailForm.sending || !emailForm.selectedEvent} style={{ padding: '12px 24px', background: emailForm.sending ? '#9CA3AF' : '#6366F1', color: 'white', border: 'none', borderRadius: '8px', cursor: emailForm.sending ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>{emailForm.sending ? '⏳ Sending...' : '📨 Send Email'}</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showModal && modalData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 16px 0' }}>{modalData.type === 'accept_volunteer' ? '✅ Accept Volunteer?' : modalData.type === 'reject_volunteer' ? '❌ Reject Volunteer?' : '🗑️ Delete Event?'}</h2>
            <p style={{ margin: '0 0 24px 0', color: '#4b5563' }}>{modalData.type === 'accept_volunteer' ? `Accept ${modalData.name}?` : modalData.type === 'reject_volunteer' ? `Reject ${modalData.name}?` : `Delete "${modalData.name}"?`}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => { setShowModal(false); setModalData(null); }} style={{ padding: '12px 24px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmAction} style={{ padding: '12px 24px', background: modalData.type === 'accept_volunteer' ? '#10B981' : '#EF4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Yes, {modalData.type === 'accept_volunteer' ? 'Accept' : modalData.type === 'reject_volunteer' ? 'Reject' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVolunteer;