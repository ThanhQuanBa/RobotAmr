import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Accessibility, Headphones, Bot, MapPin, CalendarDays, CheckCircle2, ArrowRight, Clock } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { tours, useSlots, api } from './campusData';
import CampusMap from './CampusMap';

export default function CampusBooking() {
  const [params] = useSearchParams();
  const tour = tours.find(t => t.id === params.get('tour')) || tours[2];
  const { user } = useAuthStore();
  const { routes, timeSlots, loading, error } = useSlots();
  const [routeId, setRouteId] = useState(params.get('route') || '');
  const [time, setTime] = useState(params.get('time') || '');
  const [name, setName] = useState(user?.username || '');
  const [image, setImage] = useState(tour.image);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const [booking, setBooking] = useState(null);
  const route = routes.find(r => r.id === routeId);
  const photos = [...new Set([tour.image, '/poi-innovation.jpg', '/poi-student-union.jpg', '/hero-campus.jpg'])];
  async function book(e) {
    e.preventDefault();
    if (busy || !route || !timeSlots.includes(time) || !user) return;
    setBusy(true); setFailure('');
    try {
      const data = await api('/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitorName: name.trim(), routeId: route.id, timeSlot: time, userId: user.id }) });
      if (!data.success) throw new Error('Your booking could not be completed. Please try again.');
      setBooking(data.booking);
    } catch (err) { setFailure(err.message); } finally { setBusy(false); }
  }
  if (booking) return <div className="cp-container"><div className="cp-confirmation"><CheckCircle2 size={54} /><span className="cp-eyebrow">YOUR NEXT ADVENTURE</span><h1>You're on the list!</h1><p>Your tour booking has been received.</p><dl><div><dt>Visitor</dt><dd>{booking.visitorName}</dd></div><div><dt>Route</dt><dd>{booking.route?.name}</dd></div><div><dt>Departure</dt><dd>{booking.timeSlot}</dd></div><div><dt>Status</dt><dd>{booking.status}</dd></div></dl><Link className="cp-primary" to="/history">View My Tours <ArrowRight size={16} /></Link><Link to="/live">Open live tracking</Link></div></div>;
  return <div className="cp-container cp-book-page"><div className="cp-breadcrumb"><Link to="/">Explore</Link><span>/</span><Link to={`/tours/${tour.id}`}>{tour.short || tour.name}</Link><span>/</span>Book your tour</div><div className="cp-book-grid"><div><span className="cp-eyebrow">DISCOVER SOMETHING EXTRAORDINARY</span><h1>{tour.name}</h1><p className="cp-intro">{tour.description}</p><div className="cp-book-image"><img src={image} alt="Campus tour preview" /><span className="cp-glass-pill"><Clock size={13} /> {route?.estTime || tour.duration} minutes <span>·</span><Bot size={13} /> AI-guided experience</span></div><div className="cp-gallery">{photos.map(p => <button key={p} className={image === p ? 'selected' : ''} aria-label={`View ${p.split('/').pop().replace('.jpg', '')}`} onClick={() => setImage(p)}><img src={p} alt="Campus tour gallery" /></button>)}</div><div className="cp-benefits">{[[Accessibility,'A welcoming experience','Check route accessibility and let campus staff know if you need assistance.'],[Headphones,'Your own audio guide','Enjoy conversational stories and ask questions along the way.'],[Bot,'A smarter way to explore','Discover the campus with our autonomous mobile robot tour system.'],[MapPin,'Follow your journey','See your robot and tour updates on the live campus map.']].map(([Icon,title,copy]) => <article key={title}><span><Icon size={20} /></span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div><section className="cp-route-preview"><h2>Tour Route Preview</h2><CampusMap /></section></div>
    <aside className="cp-reservation"><form onSubmit={book}><span className="cp-eyebrow">CAMPUS TOUR</span><div className="cp-price">Free <span className="cp-pill">AI guided</span></div><hr /><h3><CalendarDays size={18} /> Plan your visit</h3><label className="cp-field">Select Route<select required value={routeId} onChange={e => setRouteId(e.target.value)} disabled={loading || busy}><option value="">Choose an available route</option>{routes.map(r => <option key={r.id} value={r.id}>{r.name} · {r.estTime} min</option>)}</select></label>{route && <div className="cp-route-summary"><MapPin size={15} /> {route.length} m <Clock size={15} /> {route.estTime} min</div>}<fieldset><legend>Select Time</legend><div className="cp-time-grid">{timeSlots.map(t => <button type="button" key={t} className={time === t ? 'selected' : ''} onClick={() => setTime(t)} disabled={busy}>{t}</button>)}</div></fieldset><label className="cp-field">Visitor Name<input required maxLength={100} placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} disabled={busy} /></label>{loading && <p role="status">Loading available tours…</p>}{(failure || error) && <p className="cp-error" role="alert">{failure || error}</p>}{!loading && !error && !routes.length && <p>No routes are available yet. Please check back soon.</p>}{user ? <button className="cp-primary cp-full" disabled={busy || !route || !timeSlots.includes(time) || !name.trim()}><CalendarDays size={16} /> {busy ? 'Confirming…' : 'Confirm Booking'}</button> : <Link className="cp-primary cp-full" to={`/login?redirect=${encodeURIComponent('/booking?' + params.toString())}`}>Sign in to Book <ArrowRight size={16} /></Link>}<p className="cp-fineprint">Your selected route and departure time will be saved with your booking.</p></form></aside></div></div>;
}
