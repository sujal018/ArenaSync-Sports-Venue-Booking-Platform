import React, { useState, useEffect } from 'react';
import { slotApi } from '../../api/slotApi';

const getLocalDateStr = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Single Slot Chip Component
export const SlotChip = ({ slot, isSelected, onToggleSelect, bookingDate, basePrice = 1000 }) => {
  const todayStr = getLocalDateStr();
  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}:00`;

  // Check if slot date is today or in the past using local timezone
  const targetDate = slot?.slotDate ? String(slot.slotDate) : (bookingDate || todayStr);
  const isToday = targetDate === todayStr;

  let isPast = false;
  if (isToday && slot?.startTime) {
    const slotTimeStr = String(slot.startTime).length === 5 ? `${slot.startTime}:00` : String(slot.startTime);
    isPast = slotTimeStr < currentTimeStr;
  } else if (targetDate < todayStr) {
    isPast = true;
  }

  const isAvailable = (slot?.status === 'AVAILABLE' || slot?.available === true) && !isPast;
  const isBooked = slot?.status === 'BOOKED';
  const isBlocked = slot?.status === 'BLOCKED';

  const slotPriceNum = Math.round(Number(slot?.price || slot?.slotPrice || basePrice));
  const isPeakHour = basePrice > 0 && slotPriceNum > basePrice;
  const isDiscounted = basePrice > 0 && slotPriceNum < basePrice;

  let chipClass = 'slot-chip';
  if (isSelected) {
    chipClass += ' slot-selected';
  } else if (!isAvailable) {
    chipClass += ' slot-disabled';
  }

  const handleClick = () => {
    if (isAvailable && onToggleSelect) {
      onToggleSelect(slot);
    }
  };

  const startTimeDisplay = slot?.startTime ? String(slot.startTime).substring(0, 5) : '00:00';
  const endTimeDisplay = slot?.endTime ? String(slot.endTime).substring(0, 5) : '00:00';

  return (
    <div className={chipClass} onClick={handleClick}>
      <div className="d-flex flex-column align-items-center">
        <span className="small fw-semibold mb-1">
          <i className="bi bi-clock me-1"></i>
          {startTimeDisplay} - {endTimeDisplay}
        </span>
        <div className="d-flex align-items-center gap-1 flex-wrap justify-content-center">
          <span className="small fw-bold text-emerald">
            ₹{slotPriceNum}
          </span>
          {isDiscounted && (
            <span className="badge bg-success text-white ms-1" style={{ fontSize: '0.6rem' }}>
              🏷️ OFF
            </span>
          )}
          {isPast && <span className="badge bg-secondary ms-1" style={{ fontSize: '0.65rem' }}>EXPIRED</span>}
          {isBooked && !isPast && <span className="badge badge-booked ms-1" style={{ fontSize: '0.65rem' }}>BOOKED</span>}
          {isBlocked && !isPast && <span className="badge badge-blocked ms-1" style={{ fontSize: '0.65rem' }}>BLOCKED</span>}
        </div>
      </div>
    </div>
  );
};

// Slot Grid Container Component
const SlotCard = (props) => {
  // If passed a single slot object, act as SlotChip
  if (props.slot) {
    return <SlotChip {...props} />;
  }

  const { turfId, selectedDate, selectedSlots = [], onSlotSelect, basePrice = 1000 } = props;

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (turfId && selectedDate) {
      fetchSlots();
    }
  }, [turfId, selectedDate]);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const data = await slotApi.getSlotsByTurf(turfId, selectedDate);
      const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setSlots(list);
    } catch (error) {
      console.warn('Get slots error:', error);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoGenerate = async () => {
    setGenerating(true);
    try {
      await slotApi.generateSlots(turfId, selectedDate);
      await fetchSlots();
    } catch (err) {
      console.error('Auto generate slots error:', err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-muted">
        <span className="spinner-border spinner-border-sm me-2 text-emerald" role="status"></span>
        Loading available hourly slots for {selectedDate}...
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-4 p-3 bg-light rounded-4">
        <i className="bi bi-calendar-x fs-2 text-muted mb-2 d-block"></i>
        <h6 className="fw-bold text-dark mb-1">No Hourly Slots Generated Yet for {selectedDate}</h6>
        <p className="text-muted small mb-3">The arena owner has not published daily playing slots for this date yet.</p>
        <button
          className="btn btn-emerald btn-sm rounded-pill px-4 fw-bold"
          onClick={handleAutoGenerate}
          disabled={generating}
        >
          {generating ? 'Generating Daily Slots...' : '⚡ Generate Slots for This Date'}
        </button>
      </div>
    );
  }

  return (
    <div className="row g-2">
      {slots.map((slot) => {
        const isSelected = selectedSlots.some((s) => (s.id || s.slotId) === (slot.id || slot.slotId));
        return (
          <div key={slot.id || `${slot.startTime}-${slot.endTime}`} className="col-6 col-sm-4 col-md-3">
            <SlotChip
              slot={{ ...slot, price: slot.price || basePrice }}
              isSelected={isSelected}
              onToggleSelect={onSlotSelect}
              bookingDate={selectedDate}
              basePrice={basePrice}
            />
          </div>
        );
      })}
    </div>
  );
};

export default SlotCard;
