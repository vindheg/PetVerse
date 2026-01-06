// src/pages/admin/AdminPets.jsx - WITH REACT MODAL
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { showToast } from '../../utils/toast';
import { useAuth } from '../../contexts/AuthContext';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './admin.css';

const AdminPets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', type: '', age: '', description: '', price: '',
    breed: '', gender: 'Male', color: '', weight: '', imageFile: null
  });
  const [submitting, setSubmitting] = useState(false);

  // Confirmation modal
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setPets(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (action, petId, petName, imageUrl = null) => {
    setModalData({ action, petId, petName, imageUrl });
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!modalData) return;

    const { action, petId, petName, imageUrl } = modalData;
    setShowModal(false);
    setProcessing(petId);

    try {
      if (action === 'adopt') {
        const { error } = await supabase.from('pets').update({ adopted: true, status: false }).eq('id', petId);
        if (error) throw error;
        showToast(`${petName} marked as adopted!`, 'success');
      } else if (action === 'delete') {
        // Delete image if exists
        if (imageUrl) {
          try {
            const url = new URL(imageUrl);
            const pathParts = url.pathname.split('/');
            const filePath = pathParts.slice(4).join('/');
            await supabase.storage.from('pet-images').remove([filePath]);
          } catch (e) { console.warn('Image delete failed:', e); }
        }
        const { error } = await supabase.from('pets').delete().eq('id', petId);
        if (error) throw error;
        showToast(`${petName} deleted!`, 'success');
      }
      loadPets();
    } catch (e) {
      console.error(e);
      showToast('Action failed: ' + e.message, 'error');
    } finally {
      setProcessing(null);
      setModalData(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    if (!formData.imageFile) {
      showToast('Please select an image', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // Upload image
      const filePath = `pet-images/${Date.now()}_${formData.imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pet-images')
        .upload(filePath, formData.imageFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('pet-images').getPublicUrl(uploadData.path);

      // Insert pet
      const { error } = await supabase.from('pets').insert({
        name: formData.name,
        type: formData.type,
        age: parseInt(formData.age),
        description: formData.description,
        image: urlData.publicUrl,
        adopted: false,
        status: true,
        price: formData.price ? parseFloat(formData.price) : null,
        breed: formData.breed || null,
        gender: formData.gender,
        color: formData.color || null,
        weight: formData.weight || null
      });
      if (error) throw error;

      showToast('Pet added successfully!', 'success');
      setFormData({ name: '', type: '', age: '', description: '', price: '', breed: '', gender: 'Male', color: '', weight: '', imageFile: null });
      setShowAddModal(false);
      loadPets();
    } catch (e) {
      console.error(e);
      showToast('Failed to add pet: ' + e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '20px', paddingTop: '100px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Pet Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ padding: '12px 24px', background: '#8B5FBF', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Add New Pet
        </button>
      </div>
      <AdminNavbar />

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p>
      ) : pets.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No pets found.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {pets.map(pet => (
            <div key={pet.id} style={{
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb'
            }}>
              <img
                src={pet.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={pet.name}
                style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; }}
              />
              <div style={{ padding: '16px' }}>
                <h3 style={{ margin: '0 0 8px 0' }}>{pet.name}</h3>
                <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>Type: {pet.type} | Age: {pet.age}</p>
                <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>Breed: {pet.breed || 'N/A'} | Gender: {pet.gender || 'N/A'}</p>
                <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>Price: ₹{pet.price || 'Free'}</p>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginTop: '8px',
                  background: pet.adopted ? '#FEE2E2' : '#D1FAE5',
                  color: pet.adopted ? '#991B1B' : '#065F46'
                }}>
                  {pet.adopted ? 'ADOPTED' : 'AVAILABLE'}
                </span>

                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  {!pet.adopted && (
                    <button
                      onClick={() => openConfirmModal('adopt', pet.id, pet.name)}
                      disabled={processing === pet.id}
                      style={{ flex: 1, padding: '10px', background: '#10B981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      {processing === pet.id ? '...' : '✓ Adopted'}
                    </button>
                  )}
                  <button
                    onClick={() => openConfirmModal('delete', pet.id, pet.name, pet.image)}
                    disabled={processing === pet.id}
                    style={{ flex: 1, padding: '10px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {processing === pet.id ? '...' : '✗ Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD PET MODAL */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 20px 0' }}>Add New Pet</h2>
            <form onSubmit={handleAddPet}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Type *</label>
                <select name="type" value={formData.type} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                  <option value="">Select</option>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Age *</label>
                  <input type="number" name="age" value={formData.age} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Breed</label>
                  <input type="text" name="breed" value={formData.breed} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Price (₹)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Image *</label>
                <input type="file" accept="image/*" onChange={(e) => setFormData(prev => ({ ...prev, imageFile: e.target.files[0] }))} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '12px 24px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: '12px 24px', background: '#8B5FBF', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {submitting ? 'Adding...' : 'Add Pet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showModal && modalData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 16px 0' }}>
              {modalData.action === 'adopt' ? '✅ Mark as Adopted?' : '❌ Delete Pet?'}
            </h2>
            <p style={{ margin: '0 0 24px 0', color: '#4b5563' }}>
              {modalData.action === 'adopt'
                ? `Mark ${modalData.petName} as adopted?`
                : `Permanently delete ${modalData.petName}? This cannot be undone.`}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => { setShowModal(false); setModalData(null); }} style={{ padding: '12px 24px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmAction} style={{ padding: '12px 24px', background: modalData.action === 'adopt' ? '#10B981' : '#EF4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Yes, {modalData.action === 'adopt' ? 'Mark Adopted' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPets;