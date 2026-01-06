// src/components/admin/AdminNavbar.jsx - Modern Admin Navigation with SVG Icons
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// SVG Icons for Admin Navigation
const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PetsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="4" r="2" />
    <circle cx="18" cy="8" r="2" />
    <circle cx="4" cy="8" r="2" />
    <path d="M12 12c-2-2-5.5-2.5-6 2-0.5 4.5 4 6 6 8 2-2 6.5-3.5 6-8-0.5-4.5-4-4-6-2z" />
  </svg>
);

const AdoptionsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const PostsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const DonationsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const LostFoundIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const VolunteerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const AdminNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, signOut } = useAuth();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      const logoutFunc = signOut || logout;
      if (logoutFunc) await logoutFunc();
      localStorage.removeItem('adminToken');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { path: '/admin/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
    { path: '/admin/users', icon: <UsersIcon />, label: 'Users' },
    { path: '/admin/pets', icon: <PetsIcon />, label: 'Pets' },
    { path: '/admin/adoptions', icon: <AdoptionsIcon />, label: 'Adoptions' },
    { path: '/admin/posts', icon: <PostsIcon />, label: 'Posts' },
    { path: '/admin/donations', icon: <DonationsIcon />, label: 'Donations' },
    { path: '/admin/lost-found', icon: <LostFoundIcon />, label: 'Lost & Found' },
    { path: '/admin/volunteer', icon: <VolunteerIcon />, label: 'Volunteer' },
  ];

  return (
    <nav className="admin-nav">
      <div className="admin-nav-brand">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="4" r="2" />
          <circle cx="18" cy="8" r="2" />
          <circle cx="4" cy="8" r="2" />
          <path d="M12 12c-2-2-5.5-2.5-6 2-0.5 4.5 4 6 6 8 2-2 6.5-3.5 6-8-0.5-4.5-4-4-6-2z" />
        </svg>
        <span>PetVerse Admin</span>
      </div>

      <div className="admin-nav-links">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`admin-nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <button onClick={handleLogout} className="admin-logout-btn">
        <LogoutIcon />
        <span>Logout</span>
      </button>
    </nav>
  );
};

export default AdminNavbar;