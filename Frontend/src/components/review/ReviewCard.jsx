import React from 'react';

const ReviewCard = ({ review, onEdit, onDelete, canModify = false }) => {
  const ratingStars = Array.from({ length: 5 }, (_, i) => i + 1 <= (review?.rating || 5));
  
  // Normalize Review DTO property names
  const authorName = review?.customerName || review?.userName || review?.customer?.firstName || 'Verified Player';
  const commentText = review?.review || review?.comment || review?.message || 'Great experience at this turf venue!';
  const dateDisplay = review?.createdOn 
    ? String(review.createdOn).substring(0, 10) 
    : (review?.createdAt || review?.date || 'Recent');

  return (
    <div className="card border-0 shadow-sm glass-card p-4 mb-3">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-emerald text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-5 shadow-sm" style={{ width: '45px', height: '45px' }}>
            {authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h6 className="fw-bold mb-1 text-dark">{authorName}</h6>
            <div className="rating-stars small">
              {ratingStars.map((isFilled, idx) => (
                <i key={idx} className={`bi ${isFilled ? 'bi-star-fill text-warning' : 'bi-star text-muted'} me-1`}></i>
              ))}
              <span className="ms-1 fw-bold text-dark">{review?.rating || 5}</span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small">{dateDisplay}</span>
          {canModify && (
            <div className="dropdown">
              <button className="btn btn-light btn-sm rounded-circle" type="button" data-bs-toggle="dropdown">
                <i className="bi bi-three-dots-vertical"></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                {onEdit && (
                  <li>
                    <button className="dropdown-item small" onClick={() => onEdit(review)}>
                      <i className="bi bi-pencil me-2 text-primary"></i> Edit Review
                    </button>
                  </li>
                )}
                {onDelete && (
                  <li>
                    <button className="dropdown-item small text-danger" onClick={() => onDelete(review.reviewId || review.id)}>
                      <i className="bi bi-trash me-2"></i> Delete
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      <p className="card-text text-secondary mt-2 mb-0 leading-relaxed fs-6">
        "{commentText}"
      </p>
    </div>
  );
};

export default ReviewCard;
