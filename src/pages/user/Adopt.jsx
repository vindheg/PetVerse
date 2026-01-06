import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import PetCard from '../../components/user/PetCard';
import AdoptionModal from '../../components/user/AdoptionModal';
import { showToast } from '../../utils/toast';
import { useAuth } from '../../contexts/AuthContext';
import { SkeletonGrid } from '../../components/common/SkeletonCard';
import { PawIcon, DogIcon, CatIcon, SearchIcon } from '../../components/common/Icons';
import './Adopt.css';

const Adopt = () => {
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPet, setSelectedPet] = useState(null);
  const [showAdoptionModal, setShowAdoptionModal] = useState(false);
  const { loading: authLoading } = useAuth();

  const categories = [
    { id: 'all', label: 'All Friends', icon: <PawIcon size={16} /> },
    { id: 'dog', label: 'Dogs', icon: <DogIcon size={16} /> },
    { id: 'cat', label: 'Cats', icon: <CatIcon size={16} /> },
    { id: 'bird', label: 'Birds', icon: null },
    { id: 'rabbit', label: 'Rabbits', icon: null }
  ];

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const availablePets = (data || []).filter(pet => pet.status === true && pet.adopted !== true);

      setPets(availablePets);
      setFilteredPets(availablePets);
    } catch (error) {
      console.error('Error loading pets:', error);
      showToast('Failed to load pets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterPets = (category) => {
    setActiveCategory(category);
    if (category === 'all') {
      setFilteredPets(pets);
    } else {
      const filtered = pets.filter(pet =>
        pet.type && pet.type.toLowerCase() === category.toLowerCase()
      );
      setFilteredPets(filtered);
    }
  };

  const handleAdoptPet = (pet) => {
    setSelectedPet(pet);
    setShowAdoptionModal(true);
  };

  const closeAdoptionModal = () => {
    setShowAdoptionModal(false);
    setSelectedPet(null);
    // Reload pets to reflect any changes
    loadPets();
  };

  if (authLoading) {
    return (
      <div className="adopt-page">
        <div className="adopt-container" style={{ paddingTop: '2rem' }}>
          <SkeletonGrid count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="adopt-page">

      {/* 1. Header */}
      <div className="adopt-header">
        <div className="header-bg-pattern"></div>
        <div className="header-content fade-in-up">
          <h1>Find Your Perfect Match</h1>
          <p>
            They aren't just pets; they are family waiting to happen.
            Browse our verified rescues below.
          </p>
        </div>
      </div>

      <div className="adopt-container">

        {/* 2. Floating Filter Bar */}
        <div className="filter-wrapper fade-in-up delay-1">
          <div className="filter-bar">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`filter-pill ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => filterPets(category.id)}
                disabled={loading}
              >
                {category.icon && <span className="filter-icon">{category.icon}</span>}
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. The Grid */}
        <div className="pets-section">
          {loading ? (
            <SkeletonGrid count={6} />
          ) : filteredPets.length === 0 ? (
            <div className="empty-state fade-in-up">
              <div className="empty-illustration">
                <SearchIcon size={64} color="var(--text-light)" />
              </div>
              <h3>No pets found here</h3>
              <p>We couldn't find any {activeCategory !== 'all' ? activeCategory : ''}s right now.</p>
              <button onClick={() => filterPets('all')} className="btn-primary">
                View All Pets
              </button>
            </div>
          ) : (
            <div className="pets-grid">
              {filteredPets.map((pet, index) => (
                <div key={pet.id} className="grid-item fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <PetCard pet={pet} onAdopt={handleAdoptPet} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Adoption Modal */}
      {showAdoptionModal && selectedPet && (
        <AdoptionModal pet={selectedPet} onClose={closeAdoptionModal} />
      )}
    </div>
  );
};

export default Adopt;