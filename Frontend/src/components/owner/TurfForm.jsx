import React, { useState, useEffect } from 'react';

const TurfForm = ({ initialValues = null, onSubmit, isSubmitting = false, buttonText = 'Save Turf Arena' }) => {
  const [formData, setFormData] = useState({
    turfName: '',
    description: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    googleMapUrl: '',
    openingTime: '06:00',
    closingTime: '23:00',
    slotDuration: 60,
    basePrice: '',
    sportType: 'FOOTBALL',
    amenities: 'Floodlights, Parking, Changing Room, Drinking Water',
  });

  useEffect(() => {
    if (initialValues) {
      setFormData({
        turfName: initialValues.turfName || initialValues.name || '',
        description: initialValues.description || '',
        address: initialValues.address || '',
        city: initialValues.city || '',
        state: initialValues.state || 'Maharashtra',
        googleMapUrl: initialValues.googleMapUrl || '',
        openingTime: initialValues.openingTime ? String(initialValues.openingTime).substring(0, 5) : '06:00',
        closingTime: initialValues.closingTime ? String(initialValues.closingTime).substring(0, 5) : '23:00',
        slotDuration: initialValues.slotDuration || 60,
        basePrice: initialValues.basePrice || initialValues.pricePerHour || '',
        sportType: initialValues.sportType || 'FOOTBALL',
        amenities: initialValues.amenities || 'Floodlights, Parking, Changing Room',
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Ensure LocalTime has HH:mm:ss format
    const formatTime = (t) => {
      if (!t) return '06:00:00';
      return t.length === 5 ? `${t}:00` : t;
    };

    onSubmit({
      ...formData,
      openingTime: formatTime(formData.openingTime),
      closingTime: formatTime(formData.closingTime),
      slotDuration: parseInt(formData.slotDuration, 10),
      basePrice: parseFloat(formData.basePrice),
    });
  };

  // Pre-generated hourly options for select dropdowns
  const timeOptions = [
    { value: '04:00', label: '04:00 AM' },
    { value: '05:00', label: '05:00 AM' },
    { value: '06:00', label: '06:00 AM' },
    { value: '07:00', label: '07:00 AM' },
    { value: '08:00', label: '08:00 AM' },
    { value: '09:00', label: '09:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '12:00', label: '12:00 PM (Noon)' },
    { value: '13:00', label: '01:00 PM' },
    { value: '14:00', label: '02:00 PM' },
    { value: '15:00', label: '03:00 PM' },
    { value: '16:00', label: '04:00 PM' },
    { value: '17:00', label: '05:00 PM' },
    { value: '18:00', label: '06:00 PM' },
    { value: '19:00', label: '07:00 PM' },
    { value: '20:00', label: '08:00 PM' },
    { value: '21:00', label: '09:00 PM' },
    { value: '22:00', label: '10:00 PM' },
    { value: '23:00', label: '11:00 PM' },
    { value: '00:00', label: '12:00 AM (Midnight)' },
  ];

  return (
    <form onSubmit={handleSubmit} className="card border-0 shadow-sm glass-card p-4">
      <h4 className="fw-bold text-dark mb-4 d-flex align-items-center">
        <i className="bi bi-geo-alt-fill text-emerald me-2"></i>
        {initialValues ? 'Update Turf Arena' : 'Register New Turf Arena'}
      </h4>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label fw-semibold">Turf Name *</label>
          <input
            type="text"
            className="form-control"
            name="turfName"
            placeholder="e.g. Apex Sports Arena"
            value={formData.turfName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-3">
          <label className="form-label fw-semibold">City *</label>
          <input
            type="text"
            className="form-control"
            name="city"
            placeholder="e.g. Mumbai"
            value={formData.city}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-3">
          <label className="form-label fw-semibold">State *</label>
          <input
            type="text"
            className="form-control"
            name="state"
            placeholder="e.g. Maharashtra"
            value={formData.state}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-12">
          <label className="form-label fw-semibold">Full Address *</label>
          <input
            type="text"
            className="form-control"
            name="address"
            placeholder="Physical venue address or landmark"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-4">
          <label className="form-label fw-semibold">Base Price per Hour (₹) *</label>
          <input
            type="number"
            className="form-control"
            name="basePrice"
            placeholder="1000"
            value={formData.basePrice}
            onChange={handleChange}
            min="100"
            required
          />
        </div>

        <div className="col-md-4">
          <label className="form-label fw-semibold">Slot Duration (Minutes) *</label>
          <select
            className="form-select"
            name="slotDuration"
            value={formData.slotDuration}
            onChange={handleChange}
            required
          >
            <option value={30}>⏱️ 30 Minutes (Half Hour)</option>
            <option value={60}>⏱️ 60 Minutes (1 Hour - Standard)</option>
            <option value={90}>⏱️ 90 Minutes (1.5 Hours)</option>
            <option value={120}>⏱️ 120 Minutes (2 Hours)</option>
          </select>
        </div>

        {/* Primary Sport Type Dropdown (Matches backend SportType enum) */}
        <div className="col-md-4">
          <label className="form-label fw-semibold">Primary Sport Type *</label>
          <select className="form-select" name="sportType" value={formData.sportType} onChange={handleChange} required>
            <option value="CRICKET">🏏 Cricket</option>
            <option value="FOOTBALL">⚽ Football</option>
            <option value="BADMINTON">🏸 Badminton</option>
            <option value="TENNIS">🎾 Tennis</option>
            <option value="BOX_CRICKET">🏟️ Box Cricket</option>
            <option value="VOLLEYBALL">🏐 Volleyball</option>
            <option value="MULTI_SPORT">🏆 Multi-Sport</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold">Opening Time *</label>
          <select
            className="form-select"
            name="openingTime"
            value={formData.openingTime.substring(0, 5)}
            onChange={handleChange}
            required
          >
            {timeOptions.map((opt) => (
              <option key={`open-${opt.value}`} value={opt.value}>
                🕐 {opt.label} ({opt.value})
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold">Closing Time *</label>
          <select
            className="form-select"
            name="closingTime"
            value={formData.closingTime.substring(0, 5)}
            onChange={handleChange}
            required
          >
            {timeOptions.map((opt) => (
              <option key={`close-${opt.value}`} value={opt.value}>
                🌙 {opt.label} ({opt.value})
              </option>
            ))}
          </select>
        </div>

        <div className="col-12">
          <label className="form-label fw-semibold">Amenities (comma separated)</label>
          <input
            type="text"
            className="form-control"
            name="amenities"
            placeholder="Floodlights, Locker Room, Shower, Parking"
            value={formData.amenities}
            onChange={handleChange}
          />
        </div>

        <div className="col-12">
          <label className="form-label fw-semibold">Google Maps Embed / Location Link</label>
          <input
            type="url"
            className="form-control"
            name="googleMapUrl"
            placeholder="https://maps.google.com/..."
            value={formData.googleMapUrl}
            onChange={handleChange}
          />
        </div>

        <div className="col-12">
          <label className="form-label fw-semibold">Arena Description *</label>
          <textarea
            className="form-control"
            rows="3"
            name="description"
            placeholder="Describe turf specifications, grass type (FIFA 50mm), footwear rules, spectator seating, etc."
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>
      </div>

      <div className="mt-4 pt-3 border-top d-flex justify-content-end gap-2">
        <button type="submit" className="btn btn-emerald px-4 py-2 rounded-3 fw-bold" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            buttonText
          )}
        </button>
      </div>
    </form>
  );
};

export default TurfForm;
