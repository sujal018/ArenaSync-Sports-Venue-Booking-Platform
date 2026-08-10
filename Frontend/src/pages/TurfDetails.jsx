import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { turfApi } from '../api/turfApi';
import { reviewApi } from '../api/reviewApi';
import ImageCarousel from '../components/turf/ImageCarousel';
import ReviewCard from '../components/review/ReviewCard';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';

const TurfDetails = () => {
  const { turfId } = useParams();
  const navigate = useNavigate();
  const [turf, setTurf] = useState(null);
  const [images, setImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);

  useEffect(() => {
    fetchTurfDetails();
  }, [turfId]);

  const fetchTurfDetails = async () => {
    setLoading(true);
    setErrorState(false);
    try {
      const turfData = await turfApi.getTurfById(turfId);
      if (turfData) {
        setTurf(turfData);
      } else {
        setErrorState(true);
      }

      try {
        const imageList = await turfApi.getImagesByTurf(turfId);
        setImages(Array.isArray(imageList) ? imageList : []);
      } catch (err) {
        console.warn('No gallery images found for turf:', err);
        setImages([]);
      }

      try {
        const reviewList = await reviewApi.getReviewsByTurf(turfId);
        setReviews(Array.isArray(reviewList) ? reviewList : []);
      } catch (err) {
        console.warn('No reviews found for turf:', err);
        setReviews([]);
      }
    } catch (error) {
      console.error('Failed to load turf details from DB:', error);
      toast.error('Could not fetch turf details from database.');
      setErrorState(true);
      setTurf(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Loading arena details from database..." />;

  if (errorState || !turf) {
    return (
      <div className="container py-5 text-center">
        <div className="card border-0 shadow-sm glass-card p-5 mx-auto" style={{ maxWidth: '540px' }}>
          <i className="bi bi-geo-alt-fill display-3 text-secondary mb-3"></i>
          <h4 className="fw-bold text-dark mb-2">Turf Not Found in Database</h4>
          <p className="text-muted mb-4">The requested turf ID (#{turfId}) does not exist in your database.</p>
          <button className="btn btn-emerald rounded-pill px-4" onClick={() => navigate('/')}>
            Browse All Available Turfs
          </button>
        </div>
      </div>
    );
  }

  // Normalize Entity / DTO properties strictly from backend database response
  const turfName = turf.turfName || turf.name || 'Sports Turf Arena';
  const price = turf.basePrice ?? turf.pricePerHour ?? 0;
  const city = turf.city || turf.location || 'India';
  const address = turf.address || 'Address registered in database';

  // Compute live dynamic average rating if database column hasn't updated existing past reviews
  const computedRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length) 
    : (turf.averageRating ?? turf.rating ?? 0.0);

  const description = turf.description || 'No description provided for this venue.';
  const sports = turf.sportType || turf.sportsType || turf.sportCategory || 'Multi-Sport';
  const amenities = turf.amenities || 'Lighting, Parking, Changing Room';
  const ownerName = turf.ownerName || (turf.owner?.firstName ? `${turf.owner?.firstName} ${turf.owner?.lastName || ''}` : 'Verified Host');
  const openTime = turf.openingTime ? String(turf.openingTime).substring(0, 5) : '06:00';
  const closeTime = turf.closingTime ? String(turf.closingTime).substring(0, 5) : '23:00';

  const amenitiesList = typeof amenities === 'string' ? amenities.split(',') : [String(amenities)];
  const sportsList = typeof sports === 'string' ? sports.split(',') : [String(sports)];

  return (
    <div className="container py-4">
      {/* Back Button */}
      <button className="btn btn-outline-secondary btn-sm rounded-pill mb-3" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left me-1"></i> Back to Turfs
      </button>

      <div className="row g-4">
        {/* Left Column: Gallery & Details */}
        <div className="col-lg-8">
          <ImageCarousel images={images} turfName={turfName} />

          {/* Details Card */}
          <div className="card border-0 shadow-sm glass-card p-4 mt-4">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <span className="badge bg-emerald text-white px-3 py-1 rounded-pill mb-2">
                  <i className="bi bi-geo-alt-fill me-1"></i> {city}
                </span>
                <h2 className="fw-bold text-dark mb-1">{turfName}</h2>
                <p className="text-muted small mb-0">
                  <i className="bi bi-pin-map me-1 text-danger"></i> {address}
                </p>
              </div>

              <div className="text-end">
                <div className="fs-3 fw-bold text-emerald">
                  ₹{price} <small className="text-muted fs-6">/ hr</small>
                </div>
                <div className="rating-stars small mt-1">
                  <i className="bi bi-star-fill text-warning me-1"></i>
                  <span className="fw-bold text-dark">{Number(computedRating).toFixed(1)}</span>
                  <span className="text-muted ms-1">({reviews.length} reviews)</span>
                </div>
              </div>
            </div>

            <hr />

            {/* Operating Hours & Specs */}
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-3">
                <div className="p-3 bg-light rounded-3 text-center">
                  <i className="bi bi-clock text-emerald fs-4 d-block mb-1"></i>
                  <span className="text-muted small d-block">Opening Time</span>
                  <strong className="text-dark">{openTime}</strong>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 bg-light rounded-3 text-center">
                  <i className="bi bi-moon-stars text-emerald fs-4 d-block mb-1"></i>
                  <span className="text-muted small d-block">Closing Time</span>
                  <strong className="text-dark">{closeTime}</strong>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 bg-light rounded-3 text-center">
                  <i className="bi bi-stopwatch text-emerald fs-4 d-block mb-1"></i>
                  <span className="text-muted small d-block">Slot Duration</span>
                  <strong className="text-dark">{turf.slotDuration || 60} mins</strong>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 bg-light rounded-3 text-center">
                  <i className="bi bi-person-badge text-emerald fs-4 d-block mb-1"></i>
                  <span className="text-muted small d-block">Host / Owner</span>
                  <strong className="text-dark text-truncate d-block">{ownerName}</strong>
                </div>
              </div>
            </div>

            {/* Description */}
            <h5 className="fw-bold text-dark mb-2">About the Turf</h5>
            <p className="text-secondary leading-relaxed mb-4">{description}</p>

            {/* Sports Supported */}
            <h5 className="fw-bold text-dark mb-2">Sports Category</h5>
            <div className="d-flex flex-wrap gap-2 mb-4">
              {sportsList.map((sport, idx) => (
                <span key={idx} className="badge bg-secondary bg-opacity-10 text-secondary border px-3 py-2 rounded-pill fs-6">
                  <i className="bi bi-check-circle-fill text-emerald me-2"></i>
                  {sport.trim()}
                </span>
              ))}
            </div>

            {/* Amenities */}
            <h5 className="fw-bold text-dark mb-2">Amenities</h5>
            <div className="d-flex flex-wrap gap-2 mb-4">
              {amenitiesList.map((amenity, idx) => (
                <span key={idx} className="badge badge-sport px-3 py-2 fs-6">
                  <i className="bi bi-shield-check me-1"></i>
                  {amenity.trim()}
                </span>
              ))}
            </div>

            {/* Map Link */}
            {turf.googleMapUrl && (
              <div className="mb-3">
                <a href={turf.googleMapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-emerald rounded-pill btn-sm">
                  <i className="bi bi-map me-1"></i> Open Location in Google Maps
                </a>
              </div>
            )}
          </div>

          {/* Customer Reviews Section */}
          <div className="mt-5">
            <h4 className="fw-bold text-dark mb-3">Player Reviews ({reviews.length})</h4>
            {reviews.length === 0 ? (
              <div className="card border-0 p-4 text-center glass-card text-muted">
                No reviews recorded in database for this turf yet.
              </div>
            ) : (
              reviews.map((rev) => <ReviewCard key={rev.reviewId || rev.id} review={rev} />)
            )}
          </div>
        </div>

        {/* Right Sticky Column: Instant Booking Card */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm glass-card p-4 sticky-top" style={{ top: '90px' }}>
            <h5 className="fw-bold text-dark mb-3">Reserve Slot Now</h5>
            <p className="text-muted small">Choose your preferred playing date and time slot.</p>

            <div className="p-3 bg-light rounded-3 mb-3">
              <div className="d-flex justify-content-between text-muted small mb-1">
                <span>Base Rate:</span>
                <span className="fw-bold text-dark">₹{price} / hr</span>
              </div>
              <div className="d-flex justify-content-between text-muted small">
                <span>Status:</span>
                <span className="text-success fw-semibold">{turf.status || 'ACTIVE'}</span>
              </div>
            </div>

            <button
              className="btn btn-emerald w-100 py-3 rounded-3 fw-bold fs-5 shadow-sm"
              onClick={() => navigate(`/booking?turfId=${turfId}`)}
            >
              <i className="bi bi-calendar-plus me-2"></i>
              Select Time Slots
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurfDetails;
