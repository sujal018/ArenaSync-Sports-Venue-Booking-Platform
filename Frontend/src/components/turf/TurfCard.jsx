import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { turfApi } from '../../api/turfApi';
import { reviewApi } from '../../api/reviewApi';

const TurfCard = ({ turf }) => {
  const [dbImage, setDbImage] = useState(null);
  const [computedRating, setComputedRating] = useState(turf?.averageRating ?? turf?.rating ?? 0.0);
  const [isDefault, setIsDefault] = useState(false);

  // Normalize Entity/DTO fields
  const turfId = turf?.id;
  const turfName = turf?.turfName || turf?.name || 'Sports Turf';
  const price = turf?.basePrice ?? turf?.pricePerHour ?? 0;
  const city = turf?.city || turf?.state || turf?.location || 'India';
  const address = turf?.address || 'Location available upon booking';
  const sportTag = turf?.sportType || turf?.sportsType || turf?.sportCategory || 'Multi-Sport';

  useEffect(() => {
    // If turf object already has images, pick thumbnail/first
    if (turf?.images && turf.images.length > 0) {
      const thumb = turf.images.find(img => img.thumbnail || img.isThumbnail) || turf.images[0];
      setDbImage(thumb?.imageUrl);
      setIsDefault(false);
    } else if (turf?.imageUrl) {
      setDbImage(turf.imageUrl);
      setIsDefault(false);
    } else if (turfId) {
      turfApi.getImagesByTurf(turfId)
        .then((imageList) => {
          if (Array.isArray(imageList) && imageList.length > 0) {
            const thumb = imageList.find(img => img.thumbnail) || imageList[0];
            setDbImage(thumb?.imageUrl);
            setIsDefault(false);
          } else {
            setDbImage(null);
            setIsDefault(true);
          }
        })
        .catch(() => {
          setDbImage(null);
          setIsDefault(true);
        });
    }

    // Fetch reviews to calculate dynamic rating if DB column is 0.0
    if (turfId) {
      reviewApi.getReviewsByTurf(turfId)
        .then((reviews) => {
          if (Array.isArray(reviews) && reviews.length > 0) {
            const avg = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length;
            setComputedRating(avg);
          }
        })
        .catch(() => {});
    }
  }, [turfId, turf]);

  // Format image URL (prepend backend origin if relative path like /uploads/turfs/...)
  const formatImageUrl = (url) => {
    if (!url) return '/assets/default-turf.png';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:8080${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const finalImageUrl = isDefault || !dbImage ? '/assets/default-turf.png' : formatImageUrl(dbImage);

  return (
    <div className="card h-100 border-0 shadow-sm glass-card overflow-hidden">
      <div className="position-relative bg-light d-flex align-items-center justify-content-center" style={{ height: '200px', backgroundColor: isDefault ? '#fdfbf7' : '#f8f9fa' }}>
        <img
          src={finalImageUrl}
          className="card-img-top w-100 h-100"
          alt={turfName}
          style={{
            objectFit: isDefault ? 'contain' : 'cover',
            padding: isDefault ? '6px' : '0px',
            backgroundColor: isDefault ? '#fdfbf7' : 'transparent',
          }}
          onError={(e) => {
            setIsDefault(true);
            e.target.src = '/assets/default-turf.png';
            e.target.style.objectFit = 'contain';
            e.target.style.padding = '6px';
            e.target.style.backgroundColor = '#fdfbf7';
          }}
        />

        <span className="position-absolute top-0 end-0 m-3 badge bg-dark bg-opacity-75 backdrop-blur px-2 py-1 rounded-pill">
          <i className="bi bi-geo-alt-fill text-emerald me-1"></i>
          {city}
        </span>

        <span className="position-absolute bottom-0 start-0 m-3 badge bg-white text-dark shadow-sm px-2 py-1 rounded-pill d-flex align-items-center">
          <i className="bi bi-star-fill text-warning me-1"></i>
          {Number(computedRating).toFixed(1)}
        </span>
      </div>

      <div className="card-body d-flex flex-column p-4">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="card-title fw-bold text-dark mb-0 text-truncate" style={{ maxWidth: '85%' }}>
            {turfName}
          </h5>
        </div>

        <p className="text-muted small mb-3 text-truncate-2">
          <i className="bi bi-pin-map me-1 text-secondary"></i>
          {address}
        </p>

        {/* Sports Supported Badges */}
        <div className="d-flex flex-wrap gap-1 mb-3">
          {typeof sportTag === 'string' ? (
            sportTag.split(',').map((sport, idx) => (
              <span key={idx} className="badge badge-sport">
                {sport.trim()}
              </span>
            ))
          ) : (
            <span className="badge badge-sport">{String(sportTag)}</span>
          )}
        </div>

        <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
          <div>
            <span className="text-muted small">Starting from</span>
            <div className="fw-bold text-emerald fs-5">
              ₹{price} <small className="text-muted fs-6">/ hr</small>
            </div>
          </div>

          <Link to={`/turfs/${turfId}`} className="btn btn-emerald btn-sm rounded-pill px-3">
            View & Book <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TurfCard;
