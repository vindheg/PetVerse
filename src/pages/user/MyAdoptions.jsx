import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../utils/toast';
import DotsLoader from '../../components/common/DotsLoader';
import './MyAdoptions.css';

const MyAdoptions = () => {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadAdoptions();
    }
  }, [user?.id]);

  const loadAdoptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('adoptions')
        .select('*, pets(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdoptions(data || []);
    } catch (error) {
      console.error(error);
      showToast('Failed to load your adoptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'accepted':
        return {
          label: 'Approved',
          className: 'status-accepted',
          message: 'Congratulations! Your application has been approved. Please visit our shelter to complete the process.'
        };
      case 'rejected':
        return {
          label: 'Declined',
          className: 'status-rejected',
          message: 'We are sorry, but this application was not approved at this time.'
        };
      default:
        return {
          label: 'Under Review',
          className: 'status-pending',
          message: 'Your application is currently being reviewed by our team. We will update you soon.'
        };
    }
  };

  // --- HELPER TO SAFELY GET IMAGE ---
  const getPetImage = (adoption) => {
    if (!adoption.pets) return 'https://placehold.co/400x300?text=Pet+Removed';

    // Check 'image' (your schema) AND 'image_url' (standard schema)
    return adoption.pets.image || adoption.pets.image_url || 'https://placehold.co/400x300?text=No+Image';
  };

  if (!user) {
    return (
      <div className="ma-page">
        <div className="ma-empty-state">
          <h2>Please Login</h2>
          <p>You need to be logged in to track your adoption requests.</p>
          <Link to="/login" className="ma-btn-primary">Login Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ma-page">
      <header className="ma-hero">
        <div className="ma-hero-content">
          <h1>My Adoption Journey</h1>
          <p>Track the status of your applications.</p>
        </div>
      </header>

      <main className="ma-container">
        {loading ? (
          <DotsLoader />
        ) : adoptions.length === 0 ? (
          <div className="ma-empty-state">
            <div className="empty-icon">Pets</div>
            <h3>No applications yet</h3>
            <p>You haven't applied to adopt any pets yet. Find your new best friend today!</p>
            <Link to="/adopt" className="ma-btn-primary">Browse Pets</Link>
          </div>
        ) : (
          <div className="ma-list">
            {adoptions.map((adoption) => {
              const statusConfig = getStatusConfig(adoption.status);
              const petImage = getPetImage(adoption);

              return (
                <div key={adoption.id} className="ma-card">

                  {/* Left: Pet Image */}
                  <div className="ma-card-image">
                    <img
                      src={petImage}
                      alt={adoption.pet_name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x300?text=Image+Error';
                      }}
                    />
                  </div>

                  {/* Middle: Details */}
                  <div className="ma-card-content">
                    <div className="ma-header">
                      <h3>{adoption.pet_name}</h3>
                      <span className="ma-date">Applied on {new Date(adoption.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="ma-details-grid">
                      <div className="ma-detail-item">
                        <span className="label">Applicant:</span>
                        <span className="value">{adoption.adopter_name}</span>
                      </div>
                      <div className="ma-detail-item">
                        <span className="label">Contact:</span>
                        <span className="value">{adoption.adopter_phone}</span>
                      </div>
                      <div className="ma-detail-item full-width">
                        <span className="label">Address:</span>
                        <span className="value">{adoption.adopter_address || 'N/A'}</span>
                      </div>
                    </div>

                    <div className={`ma-message-box ${statusConfig.className}`}>
                      <strong>Status Update:</strong> {statusConfig.message}
                    </div>
                  </div>

                  {/* Right: Status Badge */}
                  <div className="ma-card-status">
                    <span className={`ma-badge ${statusConfig.className}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyAdoptions;