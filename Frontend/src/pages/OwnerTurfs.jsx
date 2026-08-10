import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { turfApi } from '../api/turfApi';
import { slotApi } from '../api/slotApi';
import { bookingApi } from '../api/bookingApi';
import { authApi } from '../api/authApi';
import { pricingApi } from '../api/pricingApi';
import useAuth from '../hooks/useAuth';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';

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

const OwnerTurfs = () => {
  const { user } = useAuth();
  const [turfs, setTurfs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownerProfileStatus, setOwnerProfileStatus] = useState(user?.status || 'ACTIVE');

  // Slot generation & inspection modal state
  const [selectedTurfForSlots, setSelectedTurfForSlots] = useState(null);
  const [slotDate, setSlotDate] = useState(new Date().toISOString().split('T')[0]);
  const [existingSlots, setExistingSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [generatingSlots, setGeneratingSlots] = useState(false);

  // Image Upload / Photo Manager Modal state
  const [selectedTurfForImage, setSelectedTurfForImage] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Edit Turf Modal state
  const [selectedTurfForEdit, setSelectedTurfForEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    turfName: '',
    description: '',
    address: '',
    city: '',
    state: '',
    basePrice: '',
    sportType: 'FOOTBALL',
    openingTime: '06:00',
    closingTime: '23:00',
    slotDuration: 60,
    googleMapUrl: '',
    amenities: '',
  });
  const [updatingTurf, setUpdatingTurf] = useState(false);

  // Dynamic Pricing Modal state
  const [selectedTurfForPricing, setSelectedTurfForPricing] = useState(null);
  const [pricingRules, setPricingRules] = useState([]);
  const [selectedRuleIds, setSelectedRuleIds] = useState([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [newRule, setNewRule] = useState({
    ruleType: 'PEAK_HOUR',
    dayOfWeek: 'SATURDAY',
    startTime: '18:00',
    endTime: '22:00',
    startDate: '',
    endDate: '',
    fixedPrice: '',
    multiplier: '1.2',
  });
  const [submittingRule, setSubmittingRule] = useState(false);

  useEffect(() => {
    fetchOwnerTurfs();
  }, [user]);

  const fetchOwnerTurfs = async () => {
    setLoading(true);
    try {
      let ownerId = user?.id || user?.userId;

      if (user?.email) {
        try {
          const ownerProfile = await authApi.getUserByEmail(user.email);
          if (ownerProfile?.status) {
            setOwnerProfileStatus(ownerProfile.status);
          }
          if (!ownerId) {
            ownerId = ownerProfile?.id || ownerProfile?.userId;
          }
        } catch (e) {
          console.warn('Could not resolve unique email profile:', e);
        }
      }

      if (ownerId) {
        const data = await turfApi.getTurfsByOwner(ownerId);
        const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
        setTurfs(list);

        try {
          const bData = await bookingApi.getBookingsByOwner(ownerId);
          setBookings(Array.isArray(bData) ? bData : (bData?.content || []));
        } catch (bErr) {
          setBookings([]);
        }
      } else {
        setTurfs([]);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching owner turfs:', error);
      setTurfs([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getTurfRevenueStats = (turf) => {
    const turfId = turf.id;
    const turfNameStr = (turf.turfName || turf.name || '').toLowerCase();
    const feeRate = turf.customCommissionPercentage ?? 10;

    const turfBookings = bookings.filter((b) => {
      const firstDetail = b.bookingDetails?.[0];
      const bTurfName = (firstDetail?.turfName || '').toLowerCase();
      const bTurfId = firstDetail?.slot?.turf?.id;
      return (bTurfId && bTurfId === turfId) || (bTurfName && bTurfName === turfNameStr);
    });

    const confirmed = turfBookings.filter((b) => {
      const status = String(b.bookingStatus || '').toUpperCase();
      return status === 'CONFIRMED' || status === 'SUCCESS' || status === 'COMPLETED';
    });

    const gross = confirmed.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    const commPaid = confirmed.reduce((sum, b) => {
      const c = Number(b.platformCommission);
      return sum + (isNaN(c) || c === 0 ? (Number(b.totalAmount) || 0) * (feeRate / 100) : c);
    }, 0);

    const netPayout = gross - commPaid;

    return {
      count: turfBookings.length,
      grossRevenue: gross,
      commissionPaid: commPaid,
      netPayout: netPayout,
      feeRate: feeRate,
    };
  };

  // Calculate actual duration of slots in minutes based on start/end times
  const getActualSlotDurationMins = () => {
    if (existingSlots && existingSlots.length > 0) {
      const firstSlot = existingSlots[0];
      if (firstSlot?.startTime && firstSlot?.endTime) {
        const [startH, startM] = String(firstSlot.startTime).split(':').map(Number);
        const [endH, endM] = String(firstSlot.endTime).split(':').map(Number);
        const diffMins = (endH * 60 + (endM || 0)) - (startH * 60 + (startM || 0));
        if (diffMins > 0) {
          return diffMins;
        }
      }
    }
    return selectedTurfForSlots?.slotDuration || 60;
  };

  // Slot modal handlers
  const handleOpenSlotModal = async (turf) => {
    setSelectedTurfForSlots(turf);
    fetchSlotsForTurfAndDate(turf.id, slotDate);
  };

  const fetchSlotsForTurfAndDate = async (turfId, dateStr) => {
    setLoadingSlots(true);
    try {
      const data = await slotApi.getSlotsByTurf(turfId, dateStr);
      const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setExistingSlots(list);
    } catch (err) {
      console.warn('Fetch slots error:', err);
      setExistingSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSlotDateChange = (newDate) => {
    setSlotDate(newDate);
    if (selectedTurfForSlots) {
      fetchSlotsForTurfAndDate(selectedTurfForSlots.id, newDate);
    }
  };

  const handleGenerateSlots = async (e) => {
    if (e) e.preventDefault();
    if (!selectedTurfForSlots || !slotDate) return;

    setGeneratingSlots(true);
    try {
      const response = await slotApi.generateSlots(selectedTurfForSlots.id, slotDate);
      toast.success(typeof response === 'string' ? response : `Slots generated successfully for ${slotDate}!`);
      await fetchSlotsForTurfAndDate(selectedTurfForSlots.id, slotDate);
    } catch (error) {
      console.error('Generate slots error:', error);
      const errMsg = error.response?.data?.message || error.response?.data || '';
      if (typeof errMsg === 'string' && errMsg.includes('already generated')) {
        toast.info(`Slots for ${slotDate} already exist in the database!`);
        await fetchSlotsForTurfAndDate(selectedTurfForSlots.id, slotDate);
      } else {
        toast.error(errMsg || `Could not generate slots for ${slotDate}`);
      }
    } finally {
      setGeneratingSlots(false);
    }
  };

  const handleToggleSlotStatus = async (slotId, currentStatus) => {
    const newStatus = currentStatus === 'BLOCKED' ? 'AVAILABLE' : 'BLOCKED';
    try {
      await slotApi.updateSlotStatus(slotId, newStatus);
      toast.success(`Slot status updated to ${newStatus}`);
      setExistingSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, status: newStatus } : s)));
    } catch (error) {
      toast.error('Failed to update slot status');
    }
  };

  const handleDeleteSlotsForDate = async () => {
    if (!selectedTurfForSlots || !slotDate) return;
    if (!window.confirm(`Are you sure you want to delete all slots for ${slotDate}? Re-generate after deleting to apply any new slot duration setting.`)) return;

    try {
      await slotApi.deleteSlots(selectedTurfForSlots.id, slotDate);
      toast.success(`Slots deleted for ${slotDate}`);
      setExistingSlots([]);
    } catch (error) {
      toast.error('Failed to delete slots for date');
    }
  };

  const handleOpenEditModal = (turf) => {
    setSelectedTurfForEdit(turf);
    setEditFormData({
      turfName: turf.turfName || turf.name || '',
      description: turf.description || '',
      address: turf.address || '',
      city: turf.city || '',
      state: turf.state || 'Maharashtra',
      basePrice: turf.basePrice ?? turf.pricePerHour ?? '',
      sportType: turf.sportType || turf.sportsType || 'FOOTBALL',
      openingTime: turf.openingTime ? String(turf.openingTime).substring(0, 5) : '06:00',
      closingTime: turf.closingTime ? String(turf.closingTime).substring(0, 5) : '23:00',
      slotDuration: turf.slotDuration || 60,
      googleMapUrl: turf.googleMapUrl || '',
      amenities: turf.amenities || '',
    });
  };

  const handleUpdateTurf = async (e) => {
    e.preventDefault();
    if (!selectedTurfForEdit) return;

    setUpdatingTurf(true);
    try {
      const payload = {
        ...editFormData,
        basePrice: parseFloat(editFormData.basePrice),
        slotDuration: parseInt(editFormData.slotDuration, 10),
        openingTime: editFormData.openingTime.length === 5 ? `${editFormData.openingTime}:00` : editFormData.openingTime,
        closingTime: editFormData.closingTime.length === 5 ? `${editFormData.closingTime}:00` : editFormData.closingTime,
      };

      await turfApi.updateTurf(selectedTurfForEdit.id, payload);
      toast.success('Turf details & slot duration updated successfully!');
      setSelectedTurfForEdit(null);
      fetchOwnerTurfs();
    } catch (error) {
      console.error('Update turf error:', error);
      toast.error(error.response?.data?.message || 'Failed to update turf details');
    } finally {
      setUpdatingTurf(false);
    }
  };

  const handleOpenPhotoModal = async (turf) => {
    setSelectedTurfForImage(turf);
    setImageFiles([]);
    setLoadingImages(true);
    try {
      const imageList = await turfApi.getImagesByTurf(turf.id);
      setExistingImages(Array.isArray(imageList) ? imageList : []);
    } catch (err) {
      console.warn('Error fetching turf photos:', err);
      setExistingImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleDeletePhoto = async (imageId) => {
    try {
      await turfApi.deleteImage(imageId);
      toast.success('Photo deleted successfully!');
      setExistingImages((prev) => prev.filter((img) => (img.id || img.imageId) !== imageId));
    } catch (error) {
      console.error('Delete photo error:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleOpenPricingModal = async (turf) => {
    setSelectedTurfForPricing(turf);
    setSelectedRuleIds([]);
    setLoadingRules(true);
    try {
      const rules = await pricingApi.getPricingRulesByTurf(turf.id);
      setPricingRules(Array.isArray(rules) ? rules : []);
    } catch (err) {
      setPricingRules([]);
    } finally {
      setLoadingRules(false);
    }
  };

  const handleTogglePricingRuleStatus = async (ruleId, currentActiveStatus) => {
    const newActive = !currentActiveStatus;
    try {
      await pricingApi.togglePricingRuleStatus(ruleId, newActive);
      toast.success(newActive ? '⚡ Dynamic pricing rule ENABLED!' : `⚪ Rule DISABLED — slots reverted to Normal Base Price (₹${selectedTurfForPricing?.basePrice})`);
      setPricingRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, active: newActive } : r)));
    } catch (error) {
      toast.error('Failed to update pricing rule status');
    }
  };

  const handleToggleSelectRule = (ruleId) => {
    setSelectedRuleIds((prev) =>
      prev.includes(ruleId) ? prev.filter((id) => id !== ruleId) : [...prev, ruleId]
    );
  };

  const handleDeleteSelectedRules = async () => {
    if (selectedRuleIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedRuleIds.length} selected pricing rule(s)? Only selected rules will be removed.`)) return;

    try {
      for (const ruleId of selectedRuleIds) {
        await pricingApi.deletePricingRule(ruleId);
      }
      toast.success(`${selectedRuleIds.length} selected pricing rule(s) deleted successfully!`);
      setPricingRules((prev) => prev.filter((r) => !selectedRuleIds.includes(r.id)));
      setSelectedRuleIds([]);
    } catch (error) {
      toast.error('Failed to delete selected pricing rule(s)');
    }
  };

  const handleAddPricingRule = async (e) => {
    e.preventDefault();
    if (!selectedTurfForPricing) return;

    setSubmittingRule(true);
    try {
      const payload = {
        ruleType: newRule.ruleType,
        multiplier: newRule.multiplier ? parseFloat(newRule.multiplier) : null,
        fixedPrice: newRule.fixedPrice ? parseFloat(newRule.fixedPrice) : null,
        active: true,
      };

      if (newRule.ruleType === 'WEEKEND') {
        payload.dayOfWeek = newRule.dayOfWeek;
      } else if (newRule.ruleType === 'PEAK_HOUR') {
        payload.startTime = newRule.startTime ? `${newRule.startTime}:00` : null;
        payload.endTime = newRule.endTime ? `${newRule.endTime}:00` : null;
      } else if (newRule.ruleType === 'HOLIDAY' || newRule.ruleType === 'EVENT') {
        payload.startDate = newRule.startDate || null;
        payload.endDate = newRule.endDate || null;
      }

      const created = await pricingApi.addPricingRule(selectedTurfForPricing.id, payload);
      toast.success('Dynamic pricing rule added successfully!');
      setPricingRules((prev) => [...prev, created]);
    } catch (error) {
      console.error('Add pricing rule error:', error);
      toast.error(error.response?.data?.message || 'Failed to add pricing rule');
    } finally {
      setSubmittingRule(false);
    }
  };

  const handleDeletePricingRule = async (ruleId) => {
    try {
      await pricingApi.deletePricingRule(ruleId);
      setPricingRules((prev) => prev.filter((r) => r.id !== ruleId));
      setSelectedRuleIds((prev) => prev.filter((id) => id !== ruleId));
      toast.success('Pricing rule deleted — slots revert to Normal Base Price');
    } catch (error) {
      toast.error('Failed to delete pricing rule');
    }
  };

  const handleUploadImages = async (e) => {
    e.preventDefault();
    if (!selectedTurfForImage || !imageFiles || imageFiles.length === 0) {
      toast.warning('Please choose image file(s) first before clicking Upload.');
      return;
    }

    setUploadingImages(true);
    try {
      await turfApi.uploadImages(selectedTurfForImage.id, Array.from(imageFiles));
      toast.success('Gallery images uploaded successfully!');
      
      const updatedList = await turfApi.getImagesByTurf(selectedTurfForImage.id);
      setExistingImages(Array.isArray(updatedList) ? updatedList : []);
      setImageFiles([]);
    } catch (error) {
      console.error('Upload images error details:', error.response);
      const backendErr = error.response?.data?.message || 
                         (typeof error.response?.data === 'string' ? error.response.data : null) || 
                         error.message || 
                         'Failed to upload images. Check Spring Boot endpoint.';
      toast.error(backendErr);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleToggleStatus = async (turf) => {
    const currentStatus = String(turf.status || 'APPROVED').toUpperCase();
    const newStatus = currentStatus === 'APPROVED' ? 'SUSPENDED' : 'APPROVED';
    try {
      await turfApi.updateTurfStatus(turf.id, newStatus);
      setTurfs((prev) => prev.map((t) => (t.id === turf.id ? { ...t, status: newStatus } : t)));
      toast.success(`Turf status changed to ${newStatus}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const formatImageUrl = (url) => {
    if (!url) return '/assets/default-turf.png';
    if (url.startsWith('/assets/')) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:8080${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const isOwnerBlocked = ownerProfileStatus === 'BLOCKED' || ownerProfileStatus === 'SUSPENDED' || (user && (user.status === 'BLOCKED' || user.status === 'SUSPENDED'));

  return (
    <div className="container py-4">
      {isOwnerBlocked && (
        <div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4 d-flex align-items-center gap-3">
          <i className="bi bi-shield-slash-fill fs-2 text-danger"></i>
          <div>
            <h5 className="fw-bold mb-1">Your Owner Account Has Been Blocked by Administrator</h5>
            <p className="small mb-1">
              Your account has been blocked by Administrator. You are permitted to view your venues, but all modification operations (Add, Edit, Price Rules, Status Toggle) are disabled. Your venues are hidden from customer search.
            </p>
            <div className="fw-semibold small text-danger">
              <i className="bi bi-headset me-1"></i> Please contact Administrator to unblock your account: <strong>support@gmail.com</strong> &bull; <strong>+91 98765 43210</strong>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Manage My Turfs</h3>
          <p className="text-muted small mb-0">Registered under unique owner email: <strong>{user?.email}</strong></p>
        </div>
        <Link
          to="/owner/add-turf"
          className={`btn btn-emerald rounded-pill px-4 ${isOwnerBlocked ? 'disabled' : ''}`}
          onClick={(e) => { if (isOwnerBlocked) e.preventDefault(); }}
        >
          <i className="bi bi-plus-lg me-1"></i> Add New Turf
        </Link>
      </div>

      {turfs.length === 0 ? (
        <div className="card border-0 shadow-sm glass-card p-5 text-center">
          <i className="bi bi-building-x display-3 text-muted mb-3"></i>
          <h4 className="fw-bold text-dark">No Turfs Found for {user?.email}</h4>
          <p className="text-muted">No sports arenas registered in the database under this unique owner email.</p>
          <Link to="/owner/add-turf" className="btn btn-emerald rounded-pill px-4 mx-auto" style={{ maxWidth: '220px' }}>
            Register New Turf
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {turfs.map((turf) => {
            const isApproved = (turf.status || 'APPROVED').toUpperCase() === 'APPROVED';
            const stats = getTurfRevenueStats(turf);
            return (
              <div key={turf.id} className="col-md-6">
                <div className="card border-0 shadow-sm glass-card p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span className="badge bg-emerald text-white mb-2">{turf.city || 'Venue'}</span>
                      <h4 className="fw-bold text-dark mb-1">{turf.turfName || turf.name}</h4>
                      <p className="text-muted small mb-0">{turf.sportType || turf.sportsType || 'Multi-Sport'}</p>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold text-emerald fs-5">₹{turf.basePrice ?? turf.pricePerHour}/hr</div>
                      <div className="badge bg-light text-dark border small mt-1">
                        <i className="bi bi-stopwatch me-1 text-emerald"></i> {turf.slotDuration || 60} mins/slot
                      </div>
                      <div className="mt-1">
                        <span className={`badge ${isApproved ? 'bg-success' : 'bg-warning'}`}>
                          {turf.status || 'APPROVED'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Turf Revenue & Admin Fee Breakdown Card */}
                  <div className="p-3 bg-light rounded-3 mb-3">
                    <div className="row g-2 text-center">
                      <div className="col-4 border-end">
                        <span className="small text-muted d-block" style={{ fontSize: '0.75rem' }}>Gross Sales</span>
                        <strong className="text-dark">₹{stats.grossRevenue.toLocaleString()}</strong>
                      </div>
                      <div className="col-4 border-end">
                        <span className="small text-muted d-block" style={{ fontSize: '0.75rem' }}>Admin Fee ({stats.feeRate}%)</span>
                        <strong className="text-danger">-₹{stats.commissionPaid.toLocaleString()}</strong>
                      </div>
                      <div className="col-4">
                        <span className="small text-muted d-block" style={{ fontSize: '0.75rem' }}>Net Payout</span>
                        <strong className="text-emerald">₹{stats.netPayout.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    <button
                      className="btn btn-outline-emerald btn-sm rounded-pill"
                      disabled={isOwnerBlocked}
                      onClick={() => handleOpenEditModal(turf)}
                    >
                      <i className="bi bi-pencil-square me-1"></i> Edit Details
                    </button>

                    <button
                      className="btn btn-outline-emerald btn-sm rounded-pill"
                      disabled={isOwnerBlocked}
                      onClick={() => handleOpenSlotModal(turf)}
                    >
                      <i className="bi bi-calendar-check me-1"></i> View Slots
                    </button>

                    <button
                      className="btn btn-outline-primary btn-sm rounded-pill"
                      disabled={isOwnerBlocked}
                      onClick={() => handleOpenPricingModal(turf)}
                    >
                      <i className="bi bi-tag-fill me-1"></i> Dynamic Pricing
                    </button>

                    <button
                      className="btn btn-outline-secondary btn-sm rounded-pill"
                      disabled={isOwnerBlocked}
                      onClick={() => handleOpenPhotoModal(turf)}
                    >
                      <i className="bi bi-image me-1"></i> Photos
                    </button>

                    <button
                      className={`btn btn-sm rounded-pill ${isApproved ? 'btn-outline-warning' : 'btn-outline-success'}`}
                      disabled={isOwnerBlocked}
                      onClick={() => handleToggleStatus(turf)}
                    >
                      {isApproved ? 'Suspend' : 'Approve'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Turf Details Modal */}
      {selectedTurfForEdit && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-pencil-square text-emerald me-2"></i> Edit Turf - {selectedTurfForEdit.turfName || selectedTurfForEdit.name}
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedTurfForEdit(null)}></button>
              </div>
              <form onSubmit={handleUpdateTurf}>
                <div className="modal-body">
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Turf Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.turfName}
                        onChange={(e) => setEditFormData({ ...editFormData, turfName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Sport Category</label>
                      <select
                        className="form-select"
                        value={editFormData.sportType}
                        onChange={(e) => setEditFormData({ ...editFormData, sportType: e.target.value })}
                      >
                        <option value="FOOTBALL">⚽ Football</option>
                        <option value="CRICKET">🏏 Cricket</option>
                        <option value="BADMINTON">🏸 Badminton</option>
                        <option value="TENNIS">🎾 Tennis</option>
                        <option value="BOX_CRICKET">🏟️ Box Cricket</option>
                        <option value="VOLLEYBALL">🏐 Volleyball</option>
                        <option value="MULTI_SPORT">🏆 Multi-Sport</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Base Price (₹ / hr)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editFormData.basePrice}
                        onChange={(e) => setEditFormData({ ...editFormData, basePrice: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.city}
                        onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">State</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.state}
                        onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Opening Time</label>
                      <select
                        className="form-select"
                        value={editFormData.openingTime.substring(0, 5)}
                        onChange={(e) => setEditFormData({ ...editFormData, openingTime: e.target.value })}
                        required
                      >
                        {timeOptions.map((opt) => (
                          <option key={`edit-open-${opt.value}`} value={opt.value}>
                            🕐 {opt.label} ({opt.value})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Closing Time</label>
                      <select
                        className="form-select"
                        value={editFormData.closingTime.substring(0, 5)}
                        onChange={(e) => setEditFormData({ ...editFormData, closingTime: e.target.value })}
                        required
                      >
                        {timeOptions.map((opt) => (
                          <option key={`edit-close-${opt.value}`} value={opt.value}>
                            🌙 {opt.label} ({opt.value})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Slot Duration (Minutes)</label>
                      <select
                        className="form-select"
                        value={editFormData.slotDuration}
                        onChange={(e) => setEditFormData({ ...editFormData, slotDuration: Number(e.target.value) })}
                        required
                      >
                        <option value={30}>⏱️ 30 Minutes (Half Hour)</option>
                        <option value={60}>⏱️ 60 Minutes (1 Hour - Standard)</option>
                        <option value={90}>⏱️ 90 Minutes (1.5 Hours)</option>
                        <option value={120}>⏱️ 120 Minutes (2 Hours)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.address}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-secondary rounded-pill px-3" onClick={() => setSelectedTurfForEdit(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-emerald rounded-pill px-4" disabled={updatingTurf}>
                    {updatingTurf ? 'Saving Changes...' : 'Update Turf'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Pricing Rules Modal */}
      {selectedTurfForPricing && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-tags-fill text-emerald me-2"></i> Dynamic Pricing Rules - {selectedTurfForPricing.turfName || selectedTurfForPricing.name}
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedTurfForPricing(null)}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded-3">
                  <div>
                    <span className="small text-muted d-block">Base Standard Rate:</span>
                    <strong className="text-dark fs-5">₹{selectedTurfForPricing.basePrice}/hr</strong>
                  </div>
                </div>

                <p className="text-muted small mb-3">
                  Set custom price multipliers or fixed rates for Peak Hours, Weekends, Holidays, or Special Events. Select specific rules below to remove only the ones you want.
                </p>

                {/* Applied Rules Summary */}
                {pricingRules.length > 0 && (
                  <div className="p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 mb-3">
                    <div className="fw-bold text-dark mb-1 small d-flex align-items-center">
                      <i className="bi bi-lightning-charge-fill text-success me-2 fs-6"></i>
                      Currently Configured Rules ({pricingRules.filter((r) => r.active !== false).length} Active):
                    </div>
                    <ul className="mb-0 small ps-3 text-muted">
                      {pricingRules.map((r) => {
                        let targetText = 'All Days';
                        if (r.ruleType === 'PEAK_HOUR') {
                          targetText = `${r.startTime} to ${r.endTime}`;
                        } else if (r.ruleType === 'WEEKEND') {
                          targetText = r.dayOfWeek || 'Weekend Days';
                        } else if (r.ruleType === 'HOLIDAY' || r.ruleType === 'EVENT') {
                          targetText = `${r.startDate || ''} to ${r.endDate || ''}`;
                        }
                        return (
                          <li key={`summary-${r.id}`}>
                            <strong className="text-dark">{r.ruleType}</strong>: ({targetText}) &rarr;{' '}
                            <span className="fw-bold text-success">{r.fixedPrice ? `Fixed ₹${r.fixedPrice}` : `${r.multiplier}x Rate`}</span>{' '}
                            {r.active === false ? <span className="badge bg-secondary ms-1">Disabled (Normal Price)</span> : <span className="badge bg-success ms-1">Active</span>}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Header with Selective Removal */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold text-dark mb-0">Configured Pricing Rules ({pricingRules.length})</h6>
                  {selectedRuleIds.length > 0 && (
                    <button
                      className="btn btn-danger btn-sm rounded-pill px-3 fw-bold"
                      onClick={handleDeleteSelectedRules}
                    >
                      <i className="bi bi-trash me-1"></i> Remove Selected ({selectedRuleIds.length}) Rule(s) Only
                    </button>
                  )}
                </div>

                {loadingRules ? (
                  <p className="text-muted small">Loading rules...</p>
                ) : pricingRules.length === 0 ? (
                  <p className="text-muted small bg-light p-3 rounded-3">No dynamic rules set. Base price (₹{selectedTurfForPricing.basePrice}) applies to all slots.</p>
                ) : (
                  <div className="table-responsive mb-4">
                    <table className="table align-middle table-sm">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '40px' }} className="text-center">Select</th>
                          <th>Rule Type</th>
                          <th>Target Details</th>
                          <th>Price / Multiplier</th>
                          <th>Status / Mode</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pricingRules.map((r) => {
                          const isActive = r.active !== false;
                          const isChecked = selectedRuleIds.includes(r.id);
                          return (
                            <tr key={r.id} className={isChecked ? 'table-warning' : isActive ? '' : 'table-light text-muted'}>
                              <td className="text-center">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={isChecked}
                                  onChange={() => handleToggleSelectRule(r.id)}
                                />
                              </td>
                              <td>
                                <span className={`badge ${isActive ? 'bg-dark' : 'bg-secondary'}`}>
                                  {r.ruleType}
                                </span>
                              </td>
                              <td className="small">
                                {r.ruleType === 'WEEKEND' && (r.dayOfWeek || 'Weekend Days')}
                                {r.ruleType === 'PEAK_HOUR' && `${r.startTime} - ${r.endTime}`}
                                {(r.ruleType === 'HOLIDAY' || r.ruleType === 'EVENT') && `${r.startDate || ''} to ${r.endDate || ''}`}
                              </td>
                              <td className="fw-bold text-emerald small">
                                {r.fixedPrice ? `Fixed: ₹${r.fixedPrice}` : `Multiplier: ${r.multiplier}x`}
                              </td>
                              <td>
                                <button
                                  className={`btn btn-xs rounded-pill px-2 py-1 small fw-semibold ${
                                    isActive ? 'btn-success' : 'btn-outline-secondary'
                                  }`}
                                  style={{ fontSize: '0.7rem' }}
                                  onClick={() => handleTogglePricingRuleStatus(r.id, isActive)}
                                  title={isActive ? 'Click to disable and return slots to Normal Price' : 'Click to enable dynamic rate'}
                                >
                                  {isActive ? '⚡ Dynamic Rate ON' : '⚪ Normal Price (Off)'}
                                </button>
                              </td>
                              <td>
                                <button
                                  className="btn btn-outline-danger btn-sm rounded-pill px-2 py-0 small"
                                  title="Remove Only This Specific Rule"
                                  onClick={() => handleDeletePricingRule(r.id)}
                                >
                                  <i className="bi bi-trash me-1"></i> Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <hr />

                {/* Add New Rule Form */}
                <h6 className="fw-bold text-dark mb-3">Add Dynamic Pricing Rule</h6>
                <form onSubmit={handleAddPricingRule}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Rule Type</label>
                      <select
                        className="form-select form-select-sm"
                        value={newRule.ruleType}
                        onChange={(e) => setNewRule((prev) => ({ ...prev, ruleType: e.target.value }))}
                      >
                        <option value="PEAK_HOUR">🔥 PEAK_HOUR (Time Range)</option>
                        <option value="WEEKEND">⭐ WEEKEND (Day of Week)</option>
                        <option value="HOLIDAY">🎉 HOLIDAY (Date Range)</option>
                        <option value="EVENT">🏆 EVENT (Tournament / Special Event)</option>
                      </select>
                    </div>

                    {newRule.ruleType === 'WEEKEND' && (
                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Day of Week</label>
                        <select
                          className="form-select form-select-sm"
                          value={newRule.dayOfWeek}
                          onChange={(e) => setNewRule((prev) => ({ ...prev, dayOfWeek: e.target.value }))}
                        >
                          <option value="SATURDAY">SATURDAY</option>
                          <option value="SUNDAY">SUNDAY</option>
                          <option value="FRIDAY">FRIDAY</option>
                        </select>
                      </div>
                    )}

                    {newRule.ruleType === 'PEAK_HOUR' && (
                      <>
                        <div className="col-md-3">
                          <label className="form-label fw-semibold small">Start Time</label>
                          <select
                            className="form-select form-select-sm"
                            value={newRule.startTime}
                            onChange={(e) => setNewRule((prev) => ({ ...prev, startTime: e.target.value }))}
                            required
                          >
                            {timeOptions.map((opt) => (
                              <option key={`rule-start-${opt.value}`} value={opt.value}>
                                {opt.label} ({opt.value})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label fw-semibold small">End Time</label>
                          <select
                            className="form-select form-select-sm"
                            value={newRule.endTime}
                            onChange={(e) => setNewRule((prev) => ({ ...prev, endTime: e.target.value }))}
                            required
                          >
                            {timeOptions.map((opt) => (
                              <option key={`rule-end-${opt.value}`} value={opt.value}>
                                {opt.label} ({opt.value})
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {(newRule.ruleType === 'HOLIDAY' || newRule.ruleType === 'EVENT') && (
                      <>
                        <div className="col-md-3">
                          <label className="form-label fw-semibold small">Start Date</label>
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={newRule.startDate}
                            onChange={(e) => setNewRule((prev) => ({ ...prev, startDate: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label fw-semibold small">End Date</label>
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={newRule.endDate}
                            onChange={(e) => setNewRule((prev) => ({ ...prev, endDate: e.target.value }))}
                            required
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Price Multiplier (e.g. 1.25 = 25% extra)</label>
                      <input
                        type="number"
                        step="0.05"
                        min="0.5"
                        className="form-control form-control-sm"
                        placeholder="1.2"
                        value={newRule.multiplier}
                        onChange={(e) => setNewRule((prev) => ({ ...prev, multiplier: e.target.value, fixedPrice: '' }))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">OR Fixed Price (₹ per hour)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="e.g. 1200"
                        value={newRule.fixedPrice}
                        onChange={(e) => setNewRule((prev) => ({ ...prev, fixedPrice: e.target.value, multiplier: '' }))}
                      />
                    </div>
                  </div>

                  <div className="text-end">
                    <button type="button" className="btn btn-secondary rounded-pill btn-sm px-3 me-2" onClick={() => setSelectedTurfForPricing(null)}>
                      Close
                    </button>
                    <button type="submit" className="btn btn-emerald rounded-pill btn-sm px-4" disabled={submittingRule}>
                      {submittingRule ? 'Saving Rule...' : 'Add Pricing Rule'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* See & Manage Slots Inspector Modal */}
      {selectedTurfForSlots && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0">
              <div className="modal-header border-0 pb-0">
                <div className="d-flex align-items-center gap-2">
                  <h5 className="modal-title fw-bold mb-0">
                    <i className="bi bi-calendar-check text-emerald me-2"></i> Slot Inspector - {selectedTurfForSlots.turfName || selectedTurfForSlots.name}
                  </h5>
                  <span className="badge bg-emerald text-white px-2 py-1 small rounded-pill">
                    <i className="bi bi-stopwatch me-1"></i> {getActualSlotDurationMins()} mins / slot
                  </span>
                </div>
                <button type="button" className="btn-close" onClick={() => setSelectedTurfForSlots(null)}></button>
              </div>
              <div className="modal-body">
                {/* Date Selector & Action Buttons */}
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3 bg-light p-3 rounded-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2">
                      <label className="fw-semibold small text-muted text-nowrap">Target Date:</label>
                      <input
                        type="date"
                        className="form-control form-control-sm fw-bold text-emerald"
                        value={slotDate}
                        onChange={(e) => handleSlotDateChange(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-emerald btn-sm rounded-pill px-3 fw-bold"
                      onClick={handleGenerateSlots}
                      disabled={isOwnerBlocked || generatingSlots}
                    >
                      {generatingSlots ? 'Generating...' : '⚡ Generate Slots for Date'}
                    </button>

                    {existingSlots.length > 0 && (
                      <button
                        className="btn btn-outline-danger btn-sm rounded-pill px-3"
                        onClick={handleDeleteSlotsForDate}
                        disabled={isOwnerBlocked}
                      >
                        <i className="bi bi-trash me-1"></i> Clear Slots
                      </button>
                    )}
                  </div>
                </div>

                {/* Slots Inspector List */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold text-dark mb-0">
                    Hourly Slots for {slotDate} ({existingSlots.length})
                  </h6>
                  <span className="badge bg-secondary bg-opacity-10 text-dark small fw-normal">
                    <i className="bi bi-clock me-1 text-emerald"></i> {getActualSlotDurationMins()}-minute intervals
                  </span>
                </div>

                {loadingSlots ? (
                  <p className="text-muted small">Loading slot schedule from database...</p>
                ) : existingSlots.length === 0 ? (
                  <div className="text-center py-4 bg-light rounded-3">
                    <i className="bi bi-calendar-x fs-2 text-muted d-block mb-2"></i>
                    <h6 className="fw-bold text-dark mb-1">No Slots Generated Yet for {slotDate}</h6>
                    <p className="text-muted small mb-3">Click the button above to auto-generate {selectedTurfForSlots.slotDuration || 60}-minute slots for this date.</p>
                  </div>
                ) : (
                  <div className="row g-2">
                    {existingSlots.map((s) => {
                      const startTimeStr = s.startTime ? String(s.startTime).substring(0, 5) : '00:00';
                      const endTimeStr = s.endTime ? String(s.endTime).substring(0, 5) : '00:00';
                      const status = String(s.status || 'AVAILABLE').toUpperCase();
                      const isBlocked = status === 'BLOCKED';
                      const isBooked = status === 'BOOKED';

                      return (
                        <div key={s.id} className="col-6 col-sm-4 col-md-3">
                          <div className={`p-2 border rounded-3 text-center ${
                            isBooked ? 'bg-danger bg-opacity-10 border-danger' : isBlocked ? 'bg-secondary bg-opacity-10 border-secondary' : 'bg-white border-emerald'
                          }`}>
                            <div className="fw-bold text-dark small">{startTimeStr} - {endTimeStr}</div>
                            <div className="small text-emerald fw-semibold mb-1">₹{Math.round(Number(s.price || selectedTurfForSlots.basePrice || 1000))}</div>
                            
                            <div className="d-flex justify-content-center align-items-center gap-1">
                              <span className={`badge ${
                                isBooked ? 'bg-danger' : isBlocked ? 'bg-secondary' : 'bg-success'
                              }`} style={{ fontSize: '0.65rem' }}>
                                {status}
                              </span>

                              {!isBooked && (
                                <button
                                  className={`btn btn-xs rounded-pill py-0 px-2 small ${
                                    isBlocked ? 'btn-success' : 'btn-outline-secondary'
                                  }`}
                                  style={{ fontSize: '0.65rem' }}
                                  title={isBlocked ? 'Unblock Slot' : 'Block Slot'}
                                  disabled={isOwnerBlocked}
                                  onClick={() => handleToggleSlotStatus(s.id, status)}
                                >
                                  {isBlocked ? 'Unblock' : 'Block'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setSelectedTurfForSlots(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Manager & Image Upload Modal */}
      {selectedTurfForImage && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-images text-emerald me-2"></i> Photo Gallery - {selectedTurfForImage.turfName || selectedTurfForImage.name}
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedTurfForImage(null)}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted small mb-3">
                  View, delete, or upload high-resolution pitch photos for your sports venue.
                </p>

                {/* Existing Photos Grid */}
                <h6 className="fw-bold text-dark mb-2">Uploaded Venue Photos</h6>
                {loadingImages ? (
                  <p className="text-muted small">Loading gallery...</p>
                ) : existingImages.length === 0 ? (
                  <div className="p-3 bg-light rounded-3 text-center mb-4 border border-dashed">
                    <img
                      src="/assets/default-turf.png"
                      alt="Default Turf"
                      className="rounded-3 mb-2 shadow-sm"
                      style={{ width: '120px', height: '100px', objectFit: 'contain', backgroundColor: '#fdfbf7', padding: '4px' }}
                    />
                    <p className="text-muted small mb-0">
                      No custom photos uploaded yet. The <strong>default slot image</strong> above is currently displayed on your arena listing.
                    </p>
                  </div>
                ) : (
                  <div className="row g-3 mb-4">
                    {existingImages.map((img) => {
                      const imgId = img.id || img.imageId;
                      const imgUrl = formatImageUrl(img.imageUrl || img);
                      return (
                        <div key={imgId} className="col-4 col-sm-3">
                          <div className="card border-0 shadow-sm overflow-hidden h-100 position-relative">
                            <img
                              src={imgUrl}
                              alt="Turf preview"
                              className="w-100 rounded-3"
                              style={{ height: '100px', objectFit: 'cover' }}
                              onError={(e) => { e.target.src = '/assets/default-turf.png'; }}
                            />
                            <button
                              type="button"
                              className="btn btn-danger btn-sm rounded-circle position-absolute top-0 end-0 m-1 shadow-sm p-0 d-flex align-items-center justify-content-center"
                              style={{ width: '26px', height: '26px' }}
                              title="Delete Photo"
                              onClick={() => handleDeletePhoto(imgId)}
                            >
                              <i className="bi bi-trash small"></i>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <hr />

                {/* Upload New Photos Form */}
                <h6 className="fw-bold text-dark mb-2">Upload New Photos</h6>
                <form onSubmit={handleUploadImages}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Choose Photo Files</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      multiple
                      onChange={(e) => setImageFiles(e.target.files)}
                    />
                    <div className="form-text small text-muted">
                      {imageFiles && imageFiles.length > 0
                        ? `✅ ${imageFiles.length} file(s) selected and ready for upload.`
                        : 'Select 1 or more image files above to enable the upload button.'}
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-secondary rounded-pill px-3" onClick={() => setSelectedTurfForImage(null)}>
                      Close
                    </button>
                    <button
                      type="submit"
                      className="btn btn-emerald rounded-pill px-4"
                      disabled={uploadingImages || !imageFiles || imageFiles.length === 0}
                    >
                      {uploadingImages ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Uploading...
                        </>
                      ) : (
                        `Upload ${imageFiles && imageFiles.length > 0 ? `${imageFiles.length} Selected Image(s)` : 'Images'}`
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerTurfs;
