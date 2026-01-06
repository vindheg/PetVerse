import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { showToast } from '../../utils/toast';
import DotsLoader from '../../components/common/DotsLoader';
import './Notifications.css'; // Updated CSS file

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // --- 1. FETCH LOGIC (Fixed Dependency) ---
  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    } else {
      setLoading(false);
    }
  }, [user?.id]); // Using user?.id prevents loops

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Fetching from 'user_notifications' table
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', id);

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, is_read: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);

      if (unreadIds.length === 0) {
        showToast('No unread notifications', 'info');
        return;
      }

      await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .in('id', unreadIds);

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      showToast('All notifications marked as read', 'success');
    } catch (error) {
      console.error('Error marking all as read:', error);
      showToast('Failed to update notifications', 'error');
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm('Delete this notification?')) return;

    try {
      await supabase
        .from('user_notifications')
        .delete()
        .eq('id', id);

      setNotifications(prev => prev.filter(n => n.id !== id));
      showToast('Notification deleted', 'success');
    } catch (error) {
      console.error('Error deleting notification:', error);
      showToast('Failed to delete notification', 'error');
    }
  };

  const getBadge = (type) => {
    const badgeStyles = {
      lost_found: { label: 'Lost & Found', className: 'badge-lost' },
      adoption: { label: 'Adoption', className: 'badge-adoption' },
      community: { label: 'Community', className: 'badge-community' },
      donation: { label: 'Donation', className: 'badge-donation' },
      volunteer: { label: 'Volunteer', className: 'badge-volunteer' }
    };
    const badge = badgeStyles[type] || { label: 'General', className: 'badge-info' };

    return <span className={`notif-badge ${badge.className}`}>{badge.label}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="notif-page">
        <div className="notif-empty-state">
          <h2>Please Login</h2>
          <p>You need to be logged in to view your notifications.</p>
          <Link to="/login" className="notif-btn-primary">Login Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="notif-page">
      <header className="notif-hero">
        <div className="notif-hero-content">
          <h1>My Notifications</h1>
          <p>Stay updated on your adoption status and community alerts.</p>
        </div>
      </header>

      <main className="notif-container">
        {/* Header Stats & Actions */}
        <div className="notif-header-bar">
          <div className="notif-stats">
            <span className="stat-pill total">Total: {notifications.length}</span>
            <span className="stat-pill unread">
              Unread: {notifications.filter(n => !n.is_read).length}
            </span>
          </div>

          <div className="notif-actions">
            <button
              onClick={markAllAsRead}
              className="action-link"
              disabled={notifications.filter(n => !n.is_read).length === 0}
            >
              Mark All Read
            </button>
            <button onClick={loadNotifications} className="action-link refresh">
              Refresh
            </button>
          </div>
        </div>

        {/* List Section */}
        {loading ? (
          <DotsLoader />
        ) : notifications.length === 0 ? (
          <div className="notif-empty-state">
            <div className="empty-icon">📭</div>
            <h3>All caught up!</h3>
            <p>You have no new notifications at the moment.</p>
            <Link to="/" className="notif-btn-secondary">Go Home</Link>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notif-card ${notification.is_read ? 'read' : 'unread'}`}
                onClick={() => markAsRead(notification.id)}
              >
                {/* Status Indicator Bar */}
                <div className="status-bar"></div>

                <div className="notif-content">
                  <div className="notif-top-row">
                    <div className="notif-title-group">
                      {getBadge(notification.type)}
                      <h3 className="notif-subject">{notification.subject}</h3>
                    </div>

                    <button
                      className="delete-icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>

                  <p className="notif-message">{notification.message}</p>

                  <div className="notif-meta">
                    <span className="notif-time">
                      {formatDate(notification.created_at)}
                    </span>
                    {!notification.is_read && <span className="new-tag">NEW</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Notifications;