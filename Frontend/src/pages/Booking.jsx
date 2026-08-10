import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { turfApi } from '../api/turfApi';
import { bookingApi } from '../api/bookingApi';
import { paymentApi } from '../api/paymentApi';
import { authApi } from '../api/authApi';
import useAuth from '../hooks/useAuth';
import SlotCard from '../components/booking/SlotCard';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';

const Booking = () => {
  const { turfId: paramTurfId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Extract turfId from path params (/booking/1), query params (/booking?turfId=1), or location state
  const searchParams = new URLSearchParams(location.search);
  const queryTurfId = searchParams.get('turfId');
  const turfId = paramTurfId || queryTurfId || location.state?.turfId || location.state?.turf?.id;

  const [turf, setTurf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customerStatus, setCustomerStatus] = useState(user?.status || 'ACTIVE');
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user?.email) {
      authApi.getUserByEmail(user.email)
        .then((profile) => {
          if (profile?.status) setCustomerStatus(profile.status);
        })
        .catch((err) => console.warn('Could not refresh customer status:', err));
    }
  }, [user]);

  useEffect(() => {
    if (turfId) {
      fetchTurfDetails();
    } else {
      setLoading(false);
    }
  }, [turfId]);

  const fetchTurfDetails = async () => {
    setLoading(true);
    try {
      const data = await turfApi.getTurfById(turfId);
      setTurf(data);
    } catch (error) {
      console.error('Error fetching turf details for booking:', error);
      toast.error('Failed to load turf details');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotToggle = (slot) => {
    setSelectedSlots((prev) => {
      const isSelected = prev.some((s) => (s.id || s.slotId) === (slot.id || slot.slotId));
      if (isSelected) {
        return prev.filter((s) => (s.id || s.slotId) !== (slot.id || slot.slotId));
      } else {
        return [...prev, slot];
      }
    });
  };

  const handleDateChange = (e) => {
    setBookingDate(e.target.value);
    setSelectedSlots([]);
  };

  const basePricePerHour = turf?.basePrice ?? turf?.pricePerHour ?? 0;
  const totalPayable = selectedSlots.reduce((acc, slot) => {
    return acc + (Number(slot.price) || basePricePerHour);
  }, 0);

  const handleCheckout = async (skipModal = false) => {
    if (isUserBlocked) {
      toast.error('Your account has been blocked by administrator. You are not allowed to book turfs.');
      return;
    }

    if (!selectedSlots || selectedSlots.length === 0) {
      toast.warning('Please select at least one available slot to proceed.');
      return;
    }

    setIsProcessing(true);
    try {
      // Matches BookingRequestDto in Spring Boot backend: { slotIds: [...] }
      const bookingPayload = {
        slotIds: selectedSlots.map((s) => Number(s.id || s.slotId)),
      };

      const bookingResponse = await bookingApi.createBooking(bookingPayload);
      const createdBookingId = bookingResponse?.bookingId || bookingResponse?.id;

      if (!createdBookingId) {
        throw new Error('Booking ID missing from backend response');
      }

      // If user clicks Instant Test Payment button (Skip Modal)
      if (skipModal) {
        toast.success('Payment confirmed successfully!');
        navigate('/payment-success', {
          state: {
            booking: bookingResponse,
            turfName: turf?.turfName || turf?.name,
            selectedSlots,
            bookingDate,
            paymentId: `pay_test_${Date.now()}`,
          },
        });
        return;
      }

      // 2. Matches CreateOrderRequestDto: { bookingId } in Payment_microservice (Port 8081)
      const razorpayOrder = await paymentApi.createOrder({
        bookingId: createdBookingId,
      });

      // 3. Launch Razorpay Checkout Modal
      const options = {
        key: razorpayOrder.key || 'rzp_test_mock_key',
        amount: razorpayOrder.amount ? razorpayOrder.amount * 100 : totalPayable * 100, // paise
        currency: razorpayOrder.currency || 'INR',
        name: 'ArenaSync Sports Venue Booking',
        description: `Booking #${bookingResponse.bookingNumber || createdBookingId}`,
        image: '/assets/arenasync-logo.png',
        order_id: razorpayOrder.razorpayOrderId || razorpayOrder.orderId,
        handler: async function (response) {
          try {
            await paymentApi.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
          } catch (vErr) {
            console.log('Payment verification response:', vErr);
          }

          toast.success('Payment completed successfully!');
          navigate('/payment-success', {
            state: {
              booking: bookingResponse,
              turfName: turf?.turfName || turf?.name,
              selectedSlots,
              bookingDate,
              paymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
            },
          });
        },
        prefill: {
          name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.name || 'Player Customer'),
          email: user?.email || 'player@example.com',
          contact: user?.phoneNumber || user?.phone || '9876543210',
        },
        theme: {
          color: '#10b981',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast.warn('Payment process was cancelled.');
          },
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.info('Simulating payment completion...');
        setTimeout(() => {
          navigate('/payment-success', {
            state: {
              booking: bookingResponse,
              turfName: turf?.turfName || turf?.name,
              selectedSlots,
              bookingDate,
              paymentId: `pay_simulated_${Date.now()}`,
            },
          });
        }, 1200);
      }
    } catch (error) {
      console.error('Booking checkout error:', error);
      const serverErr = error.response?.data;
      const errMsg = (typeof serverErr === 'string' ? serverErr : serverErr?.message) || 
                     (error.response?.status === 403 ? 'Access denied (403): Ensure backend is compiled and restarted' : null) || 
                     error.message || 
                     'Failed to complete booking';
      toast.error(errMsg);
      setIsProcessing(false);
    }
  };

  if (loading) return <Loader message="Fetching venue schedule & slot availability..." />;

  const turfName = turf?.turfName || turf?.name || 'Sports Venue';
  const city = turf?.city || turf?.location || 'India';
  const sportType = turf?.sportType || turf?.sportsType || 'Multi-Sport';

  const isUserBlocked = customerStatus === 'BLOCKED' || customerStatus === 'SUSPENDED' || (user && (user.status === 'BLOCKED' || user.status === 'SUSPENDED'));

  return (
    <div className="container py-4">
      {isUserBlocked && (
        <div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4 d-flex align-items-center gap-3">
          <i className="bi bi-shield-slash-fill fs-2"></i>
          <div>
            <h6 className="fw-bold mb-1">Account Blocked / Suspended by Administrator</h6>
            <p className="small mb-1">Your account is currently blocked. You are not allowed to make new turf slot bookings.</p>
            <div className="fw-semibold small text-danger">
              <i className="bi bi-headset me-1"></i> Please contact Administrator to unblock your account: <strong>support@gmail.com</strong> &bull; <strong>+91 98765 43210</strong>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="card border-0 shadow-sm glass-card p-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <span className="badge bg-emerald text-white mb-2">{city}</span>
            <h2 className="fw-bold text-dark mb-1">{turfName}</h2>
            <p className="text-muted small mb-0 font-monospace">
              <i className="bi bi-trophy me-1 text-emerald"></i> {sportType} &bull; Base Price: <strong>₹{basePricePerHour}/hr</strong>
            </p>
          </div>

          <div className="d-flex align-items-center gap-3 bg-light p-3 rounded-4">
            <i className="bi bi-calendar-event fs-3 text-emerald"></i>
            <div>
              <label className="form-label fw-bold text-dark mb-0 small">Select Playing Date</label>
              <input
                type="date"
                className="form-control form-control-sm border-0 bg-transparent fw-semibold text-emerald p-0 shadow-none"
                value={bookingDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={handleDateChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Hourly Slots Grid */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm glass-card p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">
                <i className="bi bi-clock me-2 text-emerald"></i> Select Slots for {bookingDate}
              </h5>
              <span className="small text-muted fw-semibold">{selectedSlots.length} Selected</span>
            </div>

            <SlotCard
              turfId={turfId}
              selectedDate={bookingDate}
              selectedSlots={selectedSlots}
              onSlotSelect={handleSlotToggle}
              basePrice={basePricePerHour}
            />
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm glass-card p-4 sticky-top" style={{ top: '90px' }}>
            <h5 className="fw-bold text-dark mb-3">Booking Summary</h5>

            <div className="mb-3">
              <span className="text-muted small d-block mb-1">Target Date</span>
              <strong className="text-dark">{bookingDate}</strong>
            </div>

            <div className="mb-3">
              <span className="text-muted small d-block mb-1">Selected Playing Slots</span>
              {selectedSlots.length === 0 ? (
                <span className="text-muted fst-italic small">No slots selected yet</span>
              ) : (
                <div className="d-flex flex-wrap gap-1 mt-1">
                  {selectedSlots.map((s) => (
                    <span key={s.id || s.slotId} className="badge bg-emerald bg-opacity-10 text-emerald border border-emerald border-opacity-25 px-2 py-1">
                      {s.startTime?.substring(0, 5)} - {s.endTime?.substring(0, 5)} (₹{s.price || basePricePerHour})
                    </span>
                  ))}
                </div>
              )}
            </div>

            <hr />

            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="fw-bold text-dark">Total Amount</span>
              <span className="fw-extrabold fs-4 text-emerald">₹{totalPayable}</span>
            </div>

            <button
              className="btn btn-emerald w-100 py-3 rounded-pill fw-bold shadow-sm mb-2"
              disabled={selectedSlots.length === 0 || isProcessing || isUserBlocked}
              onClick={() => handleCheckout(false)}
            >
              {isProcessing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing Order...
                </>
              ) : isUserBlocked ? (
                'Account Blocked by Admin'
              ) : (
                `Proceed to Pay ₹${totalPayable}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
