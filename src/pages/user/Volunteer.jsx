import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../utils/toast';
import './Volunteer.css';

const Volunteer = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: user?.email || '',
    phone: '',
    role: 'general',
    experience: '',
    availability: 'weekends'
  });

  const roles = [
    {
      id: 1,
      title: "Dog Walker",
      icon: "🦮",
      desc: "Help our dogs get the exercise and socialization they need. Perfect for active individuals."
    },
    {
      id: 2,
      title: "Shelter Assistant",
      icon: "🧹",
      desc: "Assist with daily feeding, cleaning, and organizing the shelter to keep our pets happy."
    },
    {
      id: 3,
      title: "Event Helper",
      icon: "🎉",
      desc: "Represent PetVerse at adoption drives and community events. Great for social butterflies!"
    },
    {
      id: 4,
      title: "Foster Parent",
      icon: "🏡",
      desc: "Provide a temporary loving home for pets recovering or waiting for their forever family."
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('volunteers') // Ensure this table exists in your Supabase
        .insert([{
          user_id: user?.id, // Optional link if user is logged in
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role_interest: formData.role,
          experience: formData.experience,
          availability: formData.availability,
          status: 'pending'
        }]);

      if (error) throw error;

      showToast("Application Sent! We'll be in touch soon.", "success");
      setFormData({ ...formData, name: '', phone: '', experience: '' });
    } catch (error) {
      console.error("Volunteer error:", error);
      showToast("Failed to submit application. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="volunteer-page">

      {/* 1. Header */}
      <div className="volunteer-header">
        <div className="header-bg-pattern"></div>
        <div className="header-content">
          <h1>Join Our Mission</h1>
          <p>
            You don't need a cape to be a hero. Just a little time and a lot of heart.
            Explore how you can make a difference today.
          </p>
        </div>
      </div>

      <div className="volunteer-container">

        {/* 2. Roles Grid */}
        <section className="roles-section">
          <h2 className="section-title">Ways to Help</h2>
          <div className="roles-grid">
            {roles.map((role) => (
              <div key={role.id} className="role-card">
                <div className="role-icon">{role.icon}</div>
                <h3>{role.title}</h3>
                <div className="card-divider-small"></div>
                <p>{role.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Application Form */}
        <section className="form-section-wrapper">
          <div className="form-card">
            <div className="form-intro">
              <h3>Become a Volunteer</h3>
              <p>Ready to jump in? Fill out the details below.</p>
            </div>

            <form onSubmit={handleSubmit} className="volunteer-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    disabled={!!user} // Disable if auto-filled from login
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Interested Role</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="general">General Help</option>
                    <option value="dog_walker">Dog Walker</option>
                    <option value="shelter_assist">Shelter Assistant</option>
                    <option value="events">Event Helper</option>
                    <option value="foster">Foster Parent</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Availability</label>
                <select
                  value={formData.availability}
                  onChange={e => setFormData({ ...formData, availability: e.target.value })}
                >
                  <option value="weekends">Weekends Only</option>
                  <option value="weekdays">Weekdays (Morning)</option>
                  <option value="weekdays_eve">Weekdays (Evening)</option>
                  <option value="flexible">Flexible / Any Time</option>
                </select>
              </div>

              <div className="form-group">
                <label>Previous Experience (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Have you worked with animals before? Tell us briefly."
                  value={formData.experience}
                  onChange={e => setFormData({ ...formData, experience: e.target.value })}
                ></textarea>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Volunteer;