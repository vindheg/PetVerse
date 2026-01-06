// src/pages/admin/AdminUsers.jsx - WITH REACT MODAL
import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { showToast } from '../../utils/toast';
import './admin.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({});
  const [processing, setProcessing] = useState(null);

  // Confirmation Modal
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await userService.getUserStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const openConfirmModal = (userId, username) => {
    setModalData({ id: userId, name: username });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!modalData) return;

    const { id, name } = modalData;
    setShowModal(false);
    setProcessing(id);

    try {
      console.log('Attempting to delete user ID:', id);
      const result = await userService.deleteUser(id);

      if (result.success) {
        showToast(`User ${name} deleted successfully`, 'success');
        setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
        fetchStats();
      } else {
        throw new Error('Deletion failed');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast(`Failed to delete user: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setProcessing(null);
      setModalData(null);
    }
  };

  const filteredUsers = users.filter(user => {
    return (
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm) ||
      `${user.city || ''} ${user.state || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getDisplayName = (user) => user.username || user.email?.split('@')[0] || 'User';
  const getProfilePicture = (user) => user.profile_picture || user.avatar_url || null;

  return (
    <div style={{ padding: '20px', paddingTop: '100px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>User Management</h1>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Manage all registered users</p>
      </div>
      <AdminNavbar />

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666', textTransform: 'uppercase' }}>Total Users</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#8B5FBF' }}>{stats.totalUsers || 0}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666', textTransform: 'uppercase' }}>Admins</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#10B981' }}>{stats.adminCount || 0}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666', textTransform: 'uppercase' }}>Regular Users</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#3B82F6' }}>{stats.regularUsers || 0}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '25px' }}>
        <input
          type="text"
          placeholder="🔍 Search by username, email, phone, city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 20px',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            fontSize: '16px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
          }}
        />
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading users...</p>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
          {filteredUsers.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              {users.length === 0 ? 'No users found in the system.' : 'No users found matching your search.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Profile</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Username</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Email</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Phone</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Location</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Role</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Joined</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const profilePicture = getProfilePicture(user);
                    const displayName = getDisplayName(user);
                    const location = user.city && user.state ? `${user.city}, ${user.state}` : user.city || user.state || 'N/A';

                    return (
                      <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '16px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: '#6b7280' }}>
                            {profilePicture ? (
                              <img src={profilePicture} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                            ) : null}
                            <span style={{ display: profilePicture ? 'none' : 'flex' }}>{displayName?.[0]?.toUpperCase()}</span>
                          </div>
                        </td>
                        <td style={{ padding: '16px', fontWeight: '500' }}>{displayName}</td>
                        <td style={{ padding: '16px', color: '#4b5563' }}>{user.email || 'N/A'}</td>
                        <td style={{ padding: '16px', color: '#4b5563' }}>{user.phone || 'N/A'}</td>
                        <td style={{ padding: '16px', color: '#4b5563' }}>{location}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            background: user.is_admin ? '#D1FAE5' : '#E0E7FF',
                            color: user.is_admin ? '#065F46' : '#4338CA'
                          }}>
                            {user.is_admin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', color: '#6b7280', fontSize: '14px' }}>{formatDate(user.created_at)}</td>
                        <td style={{ padding: '16px' }}>
                          <button
                            onClick={() => openConfirmModal(user.id, displayName)}
                            disabled={user.is_admin || processing === user.id}
                            style={{
                              padding: '8px 16px',
                              background: user.is_admin ? '#9CA3AF' : '#EF4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: user.is_admin ? 'not-allowed' : 'pointer',
                              fontWeight: 'bold',
                              opacity: processing === user.id ? 0.7 : 1
                            }}
                            title={user.is_admin ? "Cannot delete admin users" : "Delete user"}
                          >
                            {processing === user.id ? '...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showModal && modalData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h2 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>🗑️ Delete User?</h2>
            <p style={{ margin: '0 0 24px 0', color: '#4b5563', lineHeight: '1.5' }}>
              Are you sure you want to delete <strong>{modalData.name}</strong>?<br />
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => { setShowModal(false); setModalData(null); }}
                style={{ padding: '12px 24px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{ padding: '12px 24px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;