// src/pages/admin/AdminDashboard.jsx - Card-Based Command Center
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../utils/toast';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import AdminNavbar from '../../components/admin/AdminNavbar';
import DotsLoader from '../../components/common/DotsLoader';
import './admin.css';

// SVG Icons for Dashboard
const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PetsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="4" r="2" />
    <circle cx="18" cy="8" r="2" />
    <circle cx="4" cy="8" r="2" />
    <path d="M12 12c-2-2-5.5-2.5-6 2-0.5 4.5 4 6 6 8 2-2 6.5-3.5 6-8-0.5-4.5-4-4-6-2z" />
  </svg>
);

const AdoptionsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const PostsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const DonationsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const EventsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const VolunteersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

const LostFoundIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const ActivityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const QuickActionsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    pets: 0,
    adoptions: 0,
    posts: 0,
    donations: 0,
    events: 0,
    volunteers: 0,
    lostFound: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      showToast('Access denied. Admin only.', 'error');
      navigate('/');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadStats(), loadRecentActivity()]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [users, pets, adoptions, posts, donations, events, volunteers, lostFound] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('pets').select('*', { count: 'exact', head: true }).eq('status', true),
        supabase.from('adoptions').select('*', { count: 'exact', head: true }),
        supabase.from('community_posts').select('*', { count: 'exact', head: true }),
        supabase.from('donations').select('*', { count: 'exact', head: true }).eq('status', 'verified'),
        supabase.from('volunteer_events').select('*', { count: 'exact', head: true }),
        supabase.from('volunteer_registrations').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('lost_found_pets').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        users: users.count || 0,
        pets: pets.count || 0,
        adoptions: adoptions.count || 0,
        posts: posts.count || 0,
        donations: donations.count || 0,
        events: events.count || 0,
        volunteers: volunteers.count || 0,
        lostFound: lostFound.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Load recent adoptions
      const { data: recentAdoptions } = await supabase
        .from('adoptions')
        .select('id, created_at, status')
        .order('created_at', { ascending: false })
        .limit(3);

      // Load recent users
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('id, created_at, username')
        .order('created_at', { ascending: false })
        .limit(2);

      const activities = [];

      if (recentAdoptions) {
        recentAdoptions.forEach(a => {
          activities.push({
            id: `adoption-${a.id}`,
            type: 'adoption',
            text: `New adoption request (${a.status})`,
            time: new Date(a.created_at).toLocaleDateString(),
          });
        });
      }

      if (recentUsers) {
        recentUsers.forEach(u => {
          activities.push({
            id: `user-${u.id}`,
            type: 'user',
            text: `New user: ${u.username || 'Anonymous'}`,
            time: new Date(u.created_at).toLocaleDateString(),
          });
        });
      }

      // Sort by most recent
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error('Error loading activity:', error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="admin-access-denied">
        <h2>Admin Access Required</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <AdminNavbar />
        <div className="loading-container">
          <DotsLoader />
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: <UsersIcon />, color: 'purple' },
    { label: 'Available Pets', value: stats.pets, icon: <PetsIcon />, color: 'orange' },
    { label: 'Adoptions', value: stats.adoptions, icon: <AdoptionsIcon />, color: 'green' },
    { label: 'Community Posts', value: stats.posts, icon: <PostsIcon />, color: 'blue' },
    { label: 'Donations', value: stats.donations, icon: <DonationsIcon />, color: 'red' },
    { label: 'Events', value: stats.events, icon: <EventsIcon />, color: 'teal' },
    { label: 'Volunteers', value: stats.volunteers, icon: <VolunteersIcon />, color: 'yellow' },
  ];

  const moduleCards = [
    { title: 'Manage Users', desc: 'View and manage user accounts', path: '/admin/users', icon: <UsersIcon /> },
    { title: 'Manage Pets', desc: 'Add, edit, or remove pets', path: '/admin/pets', icon: <PetsIcon /> },
    { title: 'Adoption Requests', desc: 'Review adoption applications', path: '/admin/adoptions', icon: <AdoptionsIcon /> },
    { title: 'Community Posts', desc: 'Moderate user content', path: '/admin/posts', icon: <PostsIcon /> },
    { title: 'Lost & Found', desc: 'Manage lost & found reports', path: '/admin/lost-found', icon: <LostFoundIcon /> },
    { title: 'Donations', desc: 'Verify and track donations', path: '/admin/donations', icon: <DonationsIcon /> },
    { title: 'Volunteer Events', desc: 'Manage events & registrations', path: '/admin/volunteer', icon: <VolunteersIcon /> },
  ];

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <h1>PetVerse Admin Dashboard</h1>
        <p>Welcome back, {user?.email || 'Administrator'}!</p>
      </div>

      {/* Navigation */}
      <AdminNavbar />

      <div className="admin-container">
        {/* Stats Grid */}
        <div className="admin-stats">
          {statCards.map((stat, index) => (
            <div key={index} className="stat-card fade-in">
              <div className={`stat-card-icon ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="stat-number">{stat.value}</div>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions & Activity Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Quick Actions */}
          <div className="quick-actions-card">
            <h3><QuickActionsIcon /> Quick Actions</h3>
            <div className="quick-actions-grid">
              <Link to="/admin/pets" className="quick-action-btn">
                <PlusIcon /> Add New Pet
              </Link>
              <Link to="/admin/users" className="quick-action-btn">
                <UsersIcon /> View Users
              </Link>
              <Link to="/admin/adoptions" className="quick-action-btn">
                <AdoptionsIcon /> Pending Adoptions
              </Link>
              <Link to="/admin/donations" className="quick-action-btn">
                <DonationsIcon /> Check Donations
              </Link>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="activity-feed-card">
            <h3><ActivityIcon /> Recent Activity</h3>
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className={`activity-icon ${activity.type}`}>
                    {activity.type === 'adoption' && <AdoptionsIcon />}
                    {activity.type === 'user' && <UsersIcon />}
                    {activity.type === 'pet' && <PetsIcon />}
                    {activity.type === 'donation' && <DonationsIcon />}
                  </div>
                  <div className="activity-content">
                    <div className="activity-text">{activity.text}</div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>No recent activity</p>
            )}
          </div>
        </div>

        {/* Module Cards */}
        <div className="page-title">
          <h1>Management Modules</h1>
          <p>Access all admin features</p>
        </div>

        <div className="admin-grid">
          {moduleCards.map((card, index) => (
            <div
              key={index}
              className="admin-card fade-in"
              onClick={() => navigate(card.path)}
            >
              <div className="admin-card-header">
                <div className="admin-card-icon">{card.icon}</div>
                <h3>{card.title}</h3>
              </div>
              <p>{card.desc}</p>
              <button className="admin-btn">Open</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminDashboardWithProtection = () => (
  <ProtectedRoute requireAdmin={true}>
    <AdminDashboard />
  </ProtectedRoute>
);

export default AdminDashboardWithProtection;
