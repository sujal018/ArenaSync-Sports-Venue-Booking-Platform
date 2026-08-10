import React, { useState, useEffect } from 'react';
import { bookingApi } from '../api/bookingApi';
import { reviewApi } from '../api/reviewApi';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingApi.getMyBookings();
      const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setBookings(list);
    } catch (error) {
      console.warn('Booking history note:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingApi.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully!');
      fetchMyBookings();
    } catch (error) {
      console.error('Cancel booking error:', error);
      toast.error(error.response?.data?.message || 'Could not cancel booking.');
    }
  };

  const handleOpenReviewModal = (booking) => {
    setSelectedBookingForReview(booking);
    setReviewForm({ rating: 5, comment: '' });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedBookingForReview) return;

    const bId = selectedBookingForReview.bookingId || selectedBookingForReview.id;
    setSubmittingReview(true);
    try {
      await reviewApi.addReview(bId, {
        rating: Number(reviewForm.rating),
        review: reviewForm.comment,
      });
      toast.success('Thank you for rating your playing experience!');
      setSelectedBookingForReview(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Review submission failed.');
      setSelectedBookingForReview(null);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loader message="Fetching your booking history..." />;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">My Booking History</h3>
          <p className="text-muted small mb-0">View upcoming ground reservations, status, and write reviews</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="card border-0 shadow-sm glass-card p-5 text-center">
          <i className="bi bi-calendar-x display-3 text-muted mb-3"></i>
          <h4 className="fw-bold text-dark">No Bookings Found</h4>
          <p className="text-muted">You haven't reserved any turf slots in the database yet.</p>
        </div>
      ) : (
        <div className="row g-3">
          {bookings.map((booking) => {
            const bId = booking.bookingId || booking.id;
            const turfName = booking.bookingDetails?.[0]?.turfName || booking.turfName || 'Sports Arena Turf';
            const status = booking.bookingStatus || booking.status || 'CONFIRMED';
            const dateStr = booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A';

            return (
              <div key={bId} className="col-12">
                <div className="card border-0 shadow-sm glass-card p-4">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    {/* Left Column info */}
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="fw-bold text-dark fs-5">{turfName}</span>
                        <span className="badge bg-light text-dark border">#{booking.bookingNumber}</span>
                      </div>

                      <div className="text-muted small d-flex flex-wrap gap-3 mt-2">
                        <span><i className="bi bi-calendar text-emerald me-1"></i> Booked On: <strong>{dateStr}</strong></span>
                        {booking.bookingDetails?.length > 0 && (
                          <span>
                            <i className="bi bi-clock text-emerald me-1"></i> Slots:{' '}
                            <strong>
                              {booking.bookingDetails.map((d) => `${d.startTime || ''}-${d.endTime || ''}`).join(', ')}
                            </strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badges & Price */}
                    <div className="d-flex flex-column flex-md-row align-items-md-center gap-3 text-md-end">
                      <div>
                        <div className="fw-bold text-emerald fs-5">₹{booking.totalAmount}</div>
                        <span className={`badge ${status === 'CONFIRMED' ? 'bg-success' : status === 'CANCELLED' ? 'bg-danger' : 'bg-warning'}`}>
                          {status}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="d-flex gap-2">
                        {status === 'CONFIRMED' && (
                          <button
                            className="btn btn-outline-danger btn-sm rounded-pill px-3"
                            onClick={() => handleCancelBooking(bId)}
                          >
                            Cancel
                          </button>
                        )}

                        {(status === 'COMPLETED' || status === 'CONFIRMED') && (
                          <button
                            className="btn btn-emerald btn-sm rounded-pill px-3"
                            onClick={() => handleOpenReviewModal(booking)}
                          >
                            Write Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedBookingForReview && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">Rate Your Game Experience</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedBookingForReview(null)}></button>
              </div>
              <form onSubmit={handleSubmitReview}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Rating (1 to 5 Stars)</label>
                    <select
                      className="form-select"
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: e.target.value }))}
                    >
                      <option value="5">⭐⭐⭐⭐⭐ 5 Stars (Excellent)</option>
                      <option value="4">⭐⭐⭐⭐ 4 Stars (Good)</option>
                      <option value="3">⭐⭐⭐ 3 Stars (Average)</option>
                      <option value="2">⭐⭐ 2 Stars (Poor)</option>
                      <option value="1">⭐ 1 Star (Terrible)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Your Review / Comments</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="How was the turf pitch quality, lighting, and staff hospitality?"
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-secondary rounded-pill px-3" onClick={() => setSelectedBookingForReview(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-emerald rounded-pill px-4" disabled={submittingReview}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
