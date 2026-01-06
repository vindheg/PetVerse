import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { showToast } from '../../utils/toast';
import DotsLoader from '../../components/common/DotsLoader';
import { isProfileComplete } from '../../utils/profileValidation';
import './Profile.css'; // Importing the themed CSS

const Profile = () => {
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    state: '',
    city: '',
    pincode: '',
    gender: '',
    contact_method: 'Email',
    language: 'en',
    pet_preferences: [],
    home_type: '',
    email_notifications: false
  });

  useEffect(() => {
    if (user && !authLoading) {
      loadProfile();
    }
  }, [user?.id, authLoading]); // Using user?.id for stability

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFormData({
          username: data.username || '',
          email: user.email || '',
          phone: data.phone || '',
          dob: data.date_of_birth || '',
          address: data.address || '',
          state: data.state || '',
          city: data.city || '',
          pincode: data.pincode || '',
          gender: data.gender || '',
          contact_method: data.contact_method || 'Email',
          language: data.language || 'en',
          pet_preferences: Array.isArray(data.pet_preferences) ? data.pet_preferences : [],
          home_type: data.home_type || '',
          email_notifications: data.email_notifications || false
        });
      } else {
        setFormData(prev => ({
          ...prev,
          email: user.email || '',
          username: user.email?.split('@')[0] || ''
        }));
      }

      const { count } = await supabase
        .from('adoptions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setProfile(prev => ({
        ...prev,
        adoptionCount: count || 0,
        memberDays: data?.created_at ? calculateMemberDays(data.created_at) : 0
      }));

    } catch (error) {
      console.error('Error loading profile:', error);
      showToast('Could not load profile data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateMemberDays = (createdAt) => {
    const memberSince = new Date(createdAt);
    return Math.floor((new Date() - memberSince) / (1000 * 60 * 60 * 24));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePetPreferenceChange = (petType) => {
    setFormData(prev => {
      const currentPrefs = [...prev.pet_preferences];
      return {
        ...prev,
        pet_preferences: currentPrefs.includes(petType)
          ? currentPrefs.filter(p => p !== petType)
          : [...currentPrefs, petType]
      };
    });
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('File size must be less than 2MB', 'error');
      return;
    }

    const uploadingToast = showToast('Uploading image...', 'info', false);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));

      let currentProfile = JSON.parse(localStorage.getItem('petverse_profile')) || {};
      currentProfile.avatar_url = publicUrl;
      localStorage.setItem('petverse_profile', JSON.stringify(currentProfile));

      if (uploadingToast) uploadingToast.remove();
      showToast('Profile picture updated!', 'success');
      setTimeout(() => window.location.reload(), 1000);

    } catch (error) {
      if (uploadingToast) uploadingToast.remove();
      showToast('Error uploading: ' + error.message, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const profileData = {
        id: user.id,
        email: user.email,
        username: formData.username || null,
        phone: formData.phone || null,
        date_of_birth: formData.dob || null,
        address: formData.address || null,
        state: formData.state || null,
        city: formData.city || null,
        pincode: formData.pincode || null,
        gender: formData.gender || null,
        contact_method: formData.contact_method,
        language: formData.language,
        email_notifications: formData.email_notifications,
        pet_preferences: formData.pet_preferences.length > 0 ? formData.pet_preferences : null,
        home_type: formData.home_type || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('profiles').upsert(profileData);
      if (error) throw error;

      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('username, avatar_url, phone, city, state')
        .eq('id', user.id)
        .single();

      if (updatedProfile) {
        localStorage.setItem('petverse_profile', JSON.stringify(updatedProfile));
      }

      showToast('Profile updated successfully!', 'success');
      setProfile(prev => ({ ...prev, ...profileData }));

      // Reload to clear redirect if it was active
      if (!isProfileComplete(profileData)) {
        showToast('Please complete all required fields to proceed.', 'warning');
      }

    } catch (error) {
      showToast('Failed to save: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="pro-page">
        <DotsLoader />
      </div>
    );
  }

  const displayName = profile?.username || user.email?.split('@')[0] || 'User';
  const isComplete = isProfileComplete(profile);

  return (
    <div className="pro-page">
      {!isComplete && (
        <div style={{
          background: '#FFF4E5',
          border: '1px solid #FFD4A8',
          color: '#663C00',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: '500'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>Please complete your profile (Username, Phone, City, State) to access all features.</span>
        </div>
      )}

      {/* Header with Stats */}
      <div className="pro-header">
        <div className="pro-header-content">
          <div className="pro-avatar-main">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" />
            ) : (
              <div className="pro-avatar-placeholder">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
          </div>
          <div className="pro-intro">
            <h1>Hello, {displayName}!</h1>
            <p className="pro-tagline">PetVerse Family Member</p>
            <div className="pro-stats-row">
              <div className="pro-stat">
                <span className="num">{profile?.adoptionCount || 0}</span>
                <span className="lab">Adoptions</span>
              </div>
              <div className="pro-stat">
                <span className="num">{profile?.memberDays || 0}</span>
                <span className="lab">Days Joined</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pro-container">
        <form className="pro-form" onSubmit={handleSubmit}>

          {/* Section: Basic Info */}
          <div className="pro-section">
            <h2 className="pro-sec-title">Basic Information</h2>
            <div className="pro-grid">
              <div className="pro-group">
                <label>Username *</label>
                <input type="text" name="username" value={formData.username} onChange={handleInputChange} required disabled={saving} />
              </div>
              <div className="pro-group">
                <label>Email Address</label>
                <input type="email" value={formData.email} readOnly className="pro-readonly" />
              </div>
              <div className="pro-group">
                <label>Phone Number *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required disabled={saving} />
              </div>
              <div className="pro-group">
                <label>Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} disabled={saving} />
              </div>
            </div>

            <div className="pro-pic-section">
              <label>Profile Image</label>
              <div className="pro-pic-flex">
                <div className="pro-pic-preview">
                  {profile?.avatar_url ? <img src={profile.avatar_url} alt="Preview" /> : <span>User</span>}
                </div>
                <div className="pro-pic-actions">
                  <input type="file" id="picInput" accept="image/*" onChange={handleProfilePictureUpload} hidden disabled={saving} />
                  <label htmlFor="picInput" className="pro-upload-btn">Change Photo</label>
                  <small>Max 2MB - JPG, PNG</small>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Location */}
          <div className="pro-section">
            <h2 className="pro-sec-title">Location & Contact</h2>
            <div className="pro-full">
              <div className="pro-group">
                <label>Address</label>
                <textarea name="address" rows="2" value={formData.address} onChange={handleInputChange} disabled={saving}></textarea>
              </div>
            </div>
            <div className="pro-grid">
              <div className="pro-group">
                <label>State *</label>
                <select name="state" value={formData.state} onChange={handleInputChange} required disabled={saving}>
                  <option value="">Select</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="pro-group">
                <label>City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} required disabled={saving} />
              </div>
              <div className="pro-group">
                <label>PIN Code</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} pattern="[0-9]{6}" disabled={saving} />
              </div>
            </div>
          </div>

          {/* Section: Preferences */}
          <div className="pro-section">
            <h2 className="pro-sec-title">Adoption Preferences</h2>
            <div className="pro-group">
              <label>Interested In</label>
              <div className="pro-check-grid">
                {['Dog', 'Cat', 'Bird', 'Rabbit'].map(pet => (
                  <label className="pro-check-item" key={pet}>
                    <input type="checkbox" checked={formData.pet_preferences.includes(pet)} onChange={() => handlePetPreferenceChange(pet)} disabled={saving} />
                    <span>{pet}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="pro-group" style={{ marginTop: '1rem' }}>
              <label>Living Situation</label>
              <div className="pro-radio-flex">
                <label className="pro-radio-item">
                  <input type="radio" name="home_type" value="Apartment" checked={formData.home_type === 'Apartment'} onChange={handleInputChange} />
                  Apartment
                </label>
                <label className="pro-radio-item">
                  <input type="radio" name="home_type" value="House" checked={formData.home_type === 'House'} onChange={handleInputChange} />
                  House
                </label>
              </div>
            </div>
          </div>

          {/* Section: Settings */}
          <div className="pro-section">
            <h2 className="pro-sec-title">General Settings</h2>
            <div className="pro-grid">
              <div className="pro-group">
                <label>Contact Via</label>
                <select name="contact_method" value={formData.contact_method} onChange={handleInputChange}>
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                </select>
              </div>
              <div className="pro-group">
                <label>Display Language</label>
                <select name="language" value={formData.language} onChange={handleInputChange}>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="kn">Kannada</option>
                </select>
              </div>
            </div>
            <label className="pro-notif-check">
              <input type="checkbox" name="email_notifications" checked={formData.email_notifications} onChange={handleInputChange} />
              Receive email updates about new pets and alerts
            </label>
          </div>

          <button type="submit" className="pro-save-btn" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;