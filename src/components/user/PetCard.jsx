import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../utils/toast';

const PetCard = ({ pet, onAdopt }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);

  // --- Logic ---
  const handleAdoptClick = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast("Please login to adopt", "error");
      navigate('/login');
      return;
    }
    const isAvailable = pet.status === true && pet.adopted !== true;
    if (isAvailable) {
      // If onAdopt callback is provided, use it (for popup modal)
      if (onAdopt) {
        onAdopt(pet);
      } else {
        // Fallback to navigation if no callback
        navigate(`/adopt/${pet.id}`);
      }
    } else {
      showToast("Pet unavailable.", "error");
    }
  };

  const isAvailable = pet.status === true && pet.adopted !== true;
  const imageSrc = pet.image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&q=80';

  // --- Styles for the Modal Overlay ---
  if (showModal) {
    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }

  return (
    <>
      {/* ====================
          1. THE MAIN CARD 
         ==================== */}
      <div className="pet-card">
        <div className="card-image-wrapper">
          <img src={imageSrc} alt={pet.name} className="card-image" />
          {/* Status Badge instead of heart icon */}
          {!isAvailable && (
            <span className="status-badge-overlay">Adopted</span>
          )}
        </div>

        <div className="card-content">
          <div className="pet-header-row">
            <h3 className="pet-name">{pet.name}</h3>
            <span className="pet-gender">{pet.gender}</span>
          </div>

          <div className="pet-sub-details">
            {pet.type} • {pet.age ? `${pet.age} yrs` : 'Age N/A'}
          </div>

          <p className="pet-description-short">
            {pet.description || 'A lovely friend waiting for a home.'}
          </p>

          <div className="card-actions">
            <button
              className="btn-adopt-main"
              onClick={handleAdoptClick}
              disabled={!isAvailable}
            >
              {isAvailable ? 'Adopt Now' : 'Adopted'}
            </button>
            <button
              className="btn-details"
              onClick={() => setShowModal(true)}
            >
              Details
            </button>
          </div>
        </div>
      </div>

      {/* ====================
          2. THE POPUP MODAL 
         ==================== */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>

            {/* Close Button */}
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>×</button>

            {/* Modal Image Header */}
            <div className="modal-image-header">
              <img src={imageSrc} alt={pet.name} />
            </div>

            <div className="modal-body">
              {/* Stats Row (Weight, Color) */}
              <div className="modal-stats-row">
                <div className="modal-stat">
                  <span className="stat-label">Weight</span>
                  <span className="stat-value">{pet.weight || 'N/A'}</span>
                </div>
                <div className="modal-stat">
                  <span className="stat-label">Color</span>
                  <span className="stat-value">{pet.color || 'Mixed'}</span>
                </div>
                <div className="modal-stat">
                  <span className="stat-label">Age</span>
                  <span className="stat-value">{pet.age ? `${pet.age} yrs` : 'Unknown'}</span>
                </div>
              </div>

              {/* Title Section */}
              <div className="modal-title-section">
                <h2>About {pet.name}</h2>
                <p className="modal-long-desc">
                  {pet.description || "This pet doesn't have a long description yet, but they are eager to meet you!"}
                </p>
              </div>

              {/* Personality Traits */}
              {pet.personality_traits && pet.personality_traits.length > 0 && (
                <div className="modal-traits-section">
                  <h3>Personality Traits</h3>
                  <div className="traits-grid">
                    {pet.personality_traits.map((trait, index) => (
                      <span key={index} className="trait-pill">{trait}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sticky Bottom Action */}
              <div className="modal-footer-action">
                <button
                  className="btn-adopt-large"
                  onClick={handleAdoptClick}
                  disabled={!isAvailable}
                >
                  {isAvailable ? `Start Adoption Process for ${pet.name}` : 'Pet Already Adopted'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PetCard;