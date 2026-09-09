import { useState, useEffect } from 'react';
import { Clock, Route, ArrowRight, CheckCircle2, Sparkles, MapPin, Timer } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import './BookingPortal.css';

export default function BookingPortal() {
  const [routes, setRoutes] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [visitorName, setVisitorName] = useState('');
  const [bookingStatus, setBookingStatus] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetch('/api/tours/slots')
      .then(res => res.json())
      .then(data => {
        setRoutes(data.routes);
        setTimeSlots(data.timeSlots);
      })
      .catch(err => console.error("Failed to fetch slots:", err));
    
    if (user) setVisitorName(user.username);
  }, [user]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedRoute || !selectedTime || !visitorName) return;

    setBookingStatus('loading');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorName,
          routeId: selectedRoute.id,
          timeSlot: selectedTime,
          userId: user?.id || null
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookingStatus('success');
        setBookingResult(data);
      } else {
        setBookingStatus('error');
      }
    } catch (err) {
      setBookingStatus('error');
    }
  };

  if (bookingStatus === 'success') {
    return (
      <div className="page-container flex-center">
        <div className="glass-panel success-card animate-slide-in">
          <div className="success-icon">
            <CheckCircle2 size={56} color="var(--success)" />
          </div>
          <h2>Booking Confirmed!</h2>
          <p className="subtitle">Your SmartBus AMR tour is ready.</p>

          <div className="booking-details">
            <div className="detail-item">
              <span>Visitor</span>
              <strong>{visitorName}</strong>
            </div>
            <div className="detail-item">
              <span>Route</span>
              <strong>{bookingResult?.booking?.route?.name || selectedRoute?.name}</strong>
            </div>
            <div className="detail-item">
              <span>Time</span>
              <strong>{selectedTime}</strong>
            </div>
            <div className="detail-item">
              <span>Status</span>
              <strong style={{ color: 'var(--success)' }}>{bookingResult?.booking?.status}</strong>
            </div>
            {bookingResult?.assignedAmr && (
              <div className="detail-item highlight">
                <span>Assigned Robot</span>
                <strong>{bookingResult.assignedAmr}</strong>
              </div>
            )}
          </div>

          <button className="btn btn-primary mt-4 w-full" onClick={() => {
            setBookingStatus(null);
            setSelectedRoute(null);
            setSelectedTime(null);
            setBookingResult(null);
          }}>
            Book Another Tour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container booking-portal">
      <div className="header-section">
        <Sparkles className="header-sparkle" size={32} />
        <h1 className="gradient-text">Discover with SmartBus</h1>
        <p>Choose your autonomous robotic tour guide experience</p>
      </div>

      <div className="booking-grid">
        <div className="selection-panel">
          <h3 className="section-title"><Route size={18} /> Select Route</h3>
          <div className="routes-list">
            {routes.map(r => (
              <div
                key={r.id}
                className={`glass-card route-card ${selectedRoute?.id === r.id ? 'selected' : ''}`}
                onClick={() => setSelectedRoute(r)}
              >
                <div className="route-info">
                  <h4>{r.name}</h4>
                  <div className="route-meta">
                    <span><MapPin size={14} /> {r.length}m</span>
                    <span><Timer size={14} /> ~{r.estTime} min</span>
                  </div>
                </div>
                <div className="route-check">
                  {selectedRoute?.id === r.id && <CheckCircle2 size={20} color="var(--primary)" />}
                </div>
              </div>
            ))}
          </div>

          <h3 className="section-title mt-4"><Clock size={18} /> Select Time</h3>
          <div className="times-grid">
            {timeSlots.map(t => (
              <button
                key={t}
                className={`glass-card time-slot ${selectedTime === t ? 'selected' : ''}`}
                onClick={() => setSelectedTime(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="form-panel glass-panel">
          <h3>Complete Booking</h3>
          <form onSubmit={handleBooking}>
            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                className="input-glass w-full"
                placeholder="Enter your name"
                value={visitorName}
                onChange={e => setVisitorName(e.target.value)}
                required
              />
            </div>

            <div className="summary-box">
              <p><strong>Route:</strong> {selectedRoute ? selectedRoute.name : '—'}</p>
              <p><strong>Time:</strong> {selectedTime ? selectedTime : '—'}</p>
              {selectedRoute && <p><strong>Duration:</strong> ~{selectedRoute.estTime} minutes</p>}
            </div>

            <button
              type="submit"
              className="btn btn-primary submit-btn"
              disabled={!selectedRoute || !selectedTime || !visitorName || bookingStatus === 'loading'}
            >
              {bookingStatus === 'loading' ? 'Processing...' : 'Confirm Booking'}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
