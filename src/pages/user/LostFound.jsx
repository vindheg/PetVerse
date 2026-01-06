import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { lostFoundService } from '../../services/lostFoundService';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../utils/toast';
import './LostFound.css';

const LostFound = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [acceptedLostPets, setAcceptedLostPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Get pre-selected pet ID from URL (from "I Found This Pet" button)
  const preSelectedPetId = searchParams.get('foundPetId');

  // Form State
  const [formData, setFormData] = useState({
    report_type: preSelectedPetId ? 'found' : 'lost', // Auto-switch to Found if coming from Community
    pet_name: '',
    pet_type: '',
    breed: '',
    color: '',
    location: '',
    date_lost_found: new Date().toISOString().split('T')[0],
    contact_phone: user?.phone || '',
    contact_email: user?.email || '',
    description: '',
    latitude: null,
    longitude: null,
    // For found form - matching to lost pet (pre-selected if from URL)
    matched_lost_pet_id: preSelectedPetId || ''
  });

  const [imageFile, setImageFile] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    loadReports();
    loadAcceptedLostPets();
    loadLeaflet();

    // If pre-selected from URL, show a toast
    if (preSelectedPetId) {
      showToast('Fill in your details to report finding this pet', 'info');
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const loadLeaflet = () => {
    if (window.L) {
      initMap();
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.js';
    script.onload = () => {
      initMap();
    };
    document.body.appendChild(script);
  };

  const initMap = () => {
    if (!mapRef.current || mapInitialized || !window.L) return;
    const map = window.L.map(mapRef.current).setView([15.3647, 75.1240], 12);
    mapInstanceRef.current = map;
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
    map.on('click', function (e) { setMarker(e.latlng.lat, e.latlng.lng); });
    setMapInitialized(true);
    setTimeout(() => { map.invalidateSize(); }, 200);
  };

  const setMarker = (lat, lng) => {
    if (!mapInstanceRef.current) return;
    if (markerRef.current) mapInstanceRef.current.removeLayer(markerRef.current);
    markerRef.current = window.L.marker([lat, lng]).addTo(mapInstanceRef.current);
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      location: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
    }));
  };

  const useGPS = (e) => {
    e.preventDefault();
    if (!navigator.geolocation) {
      showToast('GPS not supported', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15);
          setMarker(latitude, longitude);
        }
      },
      () => showToast('Unable to fetch GPS location', 'error')
    );
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await lostFoundService.getReports();
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAcceptedLostPets = async () => {
    try {
      const data = await lostFoundService.getAcceptedLostPets();
      setAcceptedLostPets(data || []);
    } catch (error) {
      console.error('Error loading accepted lost pets:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
    if (formErrors.image) {
      setFormErrors(prev => ({ ...prev, image: null }));
    }
  };

  // Validate form based on report type
  const validateForm = () => {
    const errors = {};

    if (formData.report_type === 'lost') {
      // Lost form validation - more strict
      if (!formData.pet_name?.trim()) errors.pet_name = 'Pet name is required';
      if (!formData.pet_type) errors.pet_type = 'Pet type is required';
      if (!formData.color?.trim()) errors.color = 'Color is required';
      if (!formData.location?.trim()) errors.location = 'Location is required';
      if (!formData.date_lost_found) errors.date_lost_found = 'Date is required';
      if (!formData.contact_phone?.trim()) errors.contact_phone = 'Phone number is required';
      if (!formData.contact_email?.trim()) errors.contact_email = 'Email is required';
      if (!imageFile) errors.image = 'Image is required for lost pet reports';
    } else {
      // Found form validation - simplified, focus on matching lost pets
      if (!formData.matched_lost_pet_id) errors.matched_lost_pet_id = 'Please select a lost pet you found';
      if (!formData.location?.trim()) errors.location = 'Location where you found the pet is required';
      if (!formData.contact_phone?.trim()) errors.contact_phone = 'Your phone number is required';
      if (!formData.contact_email?.trim()) errors.contact_email = 'Your email is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      setSubmitting(true);

      if (formData.report_type === 'found') {
        // Use the new submitFoundReport function for found pets
        await lostFoundService.submitFoundReport(
          formData,
          imageFile,
          formData.matched_lost_pet_id || null
        );

        if (formData.matched_lost_pet_id) {
          showToast('Found pet report submitted! The original owner has been notified.', 'success');
        } else {
          showToast('Found pet report submitted successfully!', 'success');
        }
      } else {
        // Use regular submitReport for lost pets
        await lostFoundService.submitReport(formData, imageFile);
        showToast('Lost pet report submitted! It will be reviewed by admin.', 'success');
      }

      // Reset form
      setFormData({
        report_type: formData.report_type,
        pet_name: '',
        pet_type: '',
        breed: '',
        color: '',
        location: '',
        date_lost_found: new Date().toISOString().split('T')[0],
        contact_phone: user?.phone || '',
        contact_email: user?.email || '',
        description: '',
        latitude: null,
        longitude: null,
        matched_lost_pet_id: ''
      });
      setImageFile(null);
      setFormErrors({});
      if (markerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      loadReports();
    } catch (error) {
      console.error('Error submitting report:', error);
      showToast('Failed to submit report. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const isLostForm = formData.report_type === 'lost';

  return (
    <div className="lf-page">
      <header className="lf-hero">
        <div className="lf-hero-content">
          <h1>Lost & Found Center</h1>
          <p>Help reunite pets with their families.</p>
        </div>
      </header>

      <main className="lf-container">

        {/* SECTION 1: REPORT FORM (Top) */}
        <section className="lf-form-section">
          <div className="lf-card form-card">
            <div className="card-header centered-header">
              <h2>Submit a Report</h2>
              <p>Fill in the details below to alert the community.</p>
            </div>

            <form onSubmit={handleSubmit} className="lf-form">

              {/* Report Type Toggle */}
              <div className="form-group toggle-group">
                <label className={`toggle-btn ${isLostForm ? 'active lost' : ''}`}>
                  <input
                    type="radio"
                    name="report_type"
                    value="lost"
                    checked={isLostForm}
                    onChange={handleInputChange}
                  />
                  Lost Pet
                </label>
                <label className={`toggle-btn ${!isLostForm ? 'active found' : ''}`}>
                  <input
                    type="radio"
                    name="report_type"
                    value="found"
                    checked={!isLostForm}
                    onChange={handleInputChange}
                  />
                  Found Pet
                </label>
              </div>



              {/* LOST FORM - Pet Name (required only for lost) */}
              {isLostForm && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Pet Name *</label>
                    <input
                      type="text"
                      name="pet_name"
                      value={formData.pet_name}
                      onChange={handleInputChange}
                      className={`lf-input ${formErrors.pet_name ? 'error' : ''}`}
                      placeholder="Enter pet name"
                    />
                    {formErrors.pet_name && <span className="error-text">{formErrors.pet_name}</span>}
                  </div>
                  <div className="form-group">
                    <label>Type *</label>
                    <select
                      name="pet_type"
                      value={formData.pet_type}
                      onChange={handleInputChange}
                      className={`lf-input ${formErrors.pet_type ? 'error' : ''}`}
                    >
                      <option value="">Select...</option>
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                      <option value="bird">Bird</option>
                      <option value="rabbit">Rabbit</option>
                      <option value="other">Other</option>
                    </select>
                    {formErrors.pet_type && <span className="error-text">{formErrors.pet_type}</span>}
                  </div>
                </div>
              )}

              {/* FOUND FORM - Lost Pet Matching Dropdown (MANDATORY) */}
              {!isLostForm && (
                <div className="form-group" style={{ background: '#f0f9ff', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem', border: '2px solid #0369a1' }}>
                  <label style={{ fontWeight: '700', color: '#0369a1', fontSize: '1.1rem' }}>
                    Which lost pet did you find? *
                  </label>
                  <select
                    name="matched_lost_pet_id"
                    value={formData.matched_lost_pet_id}
                    onChange={handleInputChange}
                    className={`lf-input ${formErrors.matched_lost_pet_id ? 'error' : ''}`}
                    style={{ marginTop: '0.5rem', borderColor: formErrors.matched_lost_pet_id ? '#ef4444' : '#0369a1' }}
                  >
                    <option value="">-- Select the lost pet you found --</option>
                    {acceptedLostPets.length === 0 ? (
                      <option disabled>No active lost pet reports available</option>
                    ) : (
                      acceptedLostPets.map(pet => (
                        <option key={pet.id} value={pet.id}>
                          {pet.pet_name || 'Unknown'} - {pet.pet_type} - {pet.color || 'N/A'} - Lost: {formatDate(pet.date_lost_found)} - {pet.location?.substring(0, 30)}
                        </option>
                      ))
                    )}
                  </select>
                  {formErrors.matched_lost_pet_id && <span className="error-text">{formErrors.matched_lost_pet_id}</span>}
                  <small style={{ color: '#64748b', marginTop: '0.75rem', display: 'block' }}>
                    The original owner will be automatically notified with your contact details.
                  </small>
                </div>
              )}

              {/* Common Fields - Date and Breed/Color */}
              <div className="form-row">
                <div className="form-group">
                  <label>Date {isLostForm ? 'Lost' : 'Found'} *</label>
                  <input
                    type="date"
                    name="date_lost_found"
                    value={formData.date_lost_found}
                    onChange={handleInputChange}
                    className={`lf-input ${formErrors.date_lost_found ? 'error' : ''}`}
                  />
                  {formErrors.date_lost_found && <span className="error-text">{formErrors.date_lost_found}</span>}
                </div>
                {isLostForm && (
                  <div className="form-group">
                    <label>Breed</label>
                    <input
                      type="text"
                      name="breed"
                      value={formData.breed}
                      onChange={handleInputChange}
                      className="lf-input"
                      placeholder="Enter breed"
                    />
                  </div>
                )}
              </div>

              {/* MAP SECTION */}
              <div className="form-group map-wrapper">
                <div className="map-header">
                  <label>Location *</label>
                  <button onClick={useGPS} className="gps-btn-themed">Use GPS</button>
                </div>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`lf-input location-input ${formErrors.location ? 'error' : ''}`}
                  placeholder="Click on map or type area"
                />
                {formErrors.location && <span className="error-text">{formErrors.location}</span>}
                <div id="leaflet-map" ref={mapRef}></div>
                <small className="map-help">Click on the map to pin the exact location.</small>
              </div>

              {/* Description */}
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="lf-input"
                  placeholder="Distinguishing marks, collar details..."
                ></textarea>
              </div>

              {/* Image and Color */}
              <div className="form-row">
                <div className="form-group">
                  <label>Upload Photo {isLostForm ? '*' : ''}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={`lf-file-input ${formErrors.image ? 'error' : ''}`}
                  />
                  {formErrors.image && <span className="error-text">{formErrors.image}</span>}
                </div>
                <div className="form-group">
                  <label>Color {isLostForm ? '*' : ''}</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className={`lf-input ${formErrors.color ? 'error' : ''}`}
                    placeholder="Enter color"
                  />
                  {formErrors.color && <span className="error-text">{formErrors.color}</span>}
                </div>
              </div>

              {/* Contact Details */}
              <div className="form-group contact-info">
                <h4>Contact Details</h4>
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="tel"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      className={`lf-input ${formErrors.contact_phone ? 'error' : ''}`}
                    />
                    {formErrors.contact_phone && <span className="error-text">{formErrors.contact_phone}</span>}
                  </div>
                  <div className="form-group">
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      className={`lf-input ${formErrors.contact_email ? 'error' : ''}`}
                    />
                    {formErrors.contact_email && <span className="error-text">{formErrors.contact_email}</span>}
                  </div>
                </div>
              </div>

              <button type="submit" className="lf-submit-btn" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Post Report'}
              </button>
            </form>
          </div>
        </section>

        {/* SECTION 2: RECENT REPORTS (Bottom) */}
        <section className="lf-list-section">
          <div className="section-header centered-header">
            <h2>Recent Alerts</h2>
            <div className="header-divider"></div>
          </div>

          {loading ? (
            <div className="lf-loading">Loading alerts...</div>
          ) : reports.length === 0 ? (
            <div className="lf-empty">No active reports.</div>
          ) : (
            <div className="lf-grid">
              {reports.filter(r => r.status === 'approved').map((report) => (
                <div key={report.id} className="lf-report-card">
                  <div className={`lf-badge ${report.report_type}`}>
                    {report.report_type === 'lost' ? 'LOST' : 'FOUND'}
                  </div>

                  <div className="lf-img-container">
                    {report.image_url ? (
                      <img src={report.image_url} alt={report.pet_name} onError={(e) => e.target.style.display = 'none'} />
                    ) : (
                      <div className="lf-no-img">No Image</div>
                    )}
                  </div>

                  <div className="lf-content">
                    <h3>{report.pet_name || 'Unknown Pet'}</h3>
                    <p className="lf-meta">
                      <span>{formatDate(report.date_lost_found)}</span>
                      <span>{report.location?.substring(0, 25)}...</span>
                    </p>

                    <div className="lf-details">
                      <span className="pill">{report.pet_type}</span>
                      {report.breed && <span className="pill">{report.breed}</span>}
                    </div>

                    <p className="lf-desc">"{report.description || 'No description provided.'}"</p>

                    <div className="lf-contact-box">
                      <strong>Contact:</strong>
                      <a href={`tel:${report.contact_phone}`}>{report.contact_phone}</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default LostFound;