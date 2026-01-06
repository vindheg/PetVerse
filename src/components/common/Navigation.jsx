import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserIcon, LogoutIcon, MenuIcon, CloseIcon } from './Icons';
import ThemeToggle from './ThemeToggle';

const Navigation = () => {
  const { user, signOut, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // State to track if logo image fails
  const [logoError, setLogoError] = useState(false);

  const dropdownRef = useRef(null);

  // Check for saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const logoutFunc = signOut || logout;
      if (logoutFunc) await logoutFunc();
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setShowDropdown(false);
      navigate('/login');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';

  return (
    <nav className="navbar">
      <div className="nav-container">

        {/* LOGO SECTION */}
        <Link to="/" className="nav-logo">
          {!logoError ? (
            <img
              src="/images/Logo.jpg"
              alt="PetVerse"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="logo-text">PetVerse</span>
          )}
        </Link>

        {/* NAV LINKS */}
        <ul className={`nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <li><Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link></li>
          <li><Link to="/Adopt" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Adopt</Link></li>
          <li><Link to="/volunteer" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Volunteer</Link></li>
          <li><Link to="/donate" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Donate</Link></li>
          <li><Link to="/community" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Community</Link></li>
          <li><Link to="/lost-found" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Lost & Found</Link></li>
          {user && (
            <li><Link to="/myadoptions" className="nav-link" onClick={() => setMobileMenuOpen(false)}>My Adoptions</Link></li>
          )}
        </ul>

        {/* RIGHT SIDE ACTIONS - Order: Login/Logout → Profile → Dark Mode Toggle */}
        <div className="nav-actions">

          {user ? (
            <>
              {/* 1. Logout Button */}
              <button onClick={handleLogout} className="nav-action-btn nav-logout-btn" title="Logout">
                <LogoutIcon size={18} />
                <span className="btn-label">Logout</span>
              </button>

              {/* 2. Profile Icon */}
              <div className="user-dropdown-container" ref={dropdownRef}>
                <button
                  className="nav-action-btn nav-profile-btn"
                  onClick={() => setShowDropdown(!showDropdown)}
                  title="Profile"
                >
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      className="profile-avatar"
                    />
                  ) : (
                    <UserIcon size={20} />
                  )}
                </button>

                {showDropdown && (
                  <div className="profile-card-dropdown">
                    <div className="dropdown-header">
                      <strong className="dd-username">{displayName}</strong>
                      <span className="dd-email">{userEmail}</span>
                    </div>
                    <div className="dropdown-body">
                      <Link to="/profile" className="dd-item" onClick={() => setShowDropdown(false)}>
                        <UserIcon size={18} />
                        <span>Profile</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* 1. Login Button */
            <Link to="/login" className="nav-login-btn">
              Login
            </Link>
          )}

          {/* 3. Dark Mode Toggle - ThemeToggle Component */}
          <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navigation;