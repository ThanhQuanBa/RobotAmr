import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Route, Sparkles, Award, Leaf, CheckCircle2, RotateCcw, Clock, ArrowRight, CalendarDays } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { api, tours } from './campusData';

export default function CampusHistory() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [limit, setLimit] = useState(6);
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let active = true;
    api(`/bookings?userId=${encodeURIComponent(user.id)}`).then(data => { if (active) setBookings(data.filter(b => b.userId === user.id)); }).catch(() => { if (active) setError('Could not load your tour history. Please refresh to try again.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);
  const completed = bookings.filter(b => b.status === 'COMPLETED');
  const distance = completed.reduce((sum,b) => sum + (b.route?.length || 0), 0) / 1000;
  const filtered = bookings.filter(b => filter === 'ALL' || b.status === filter);
  const months = Array.from({ length: 6 }, (_,i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 5 + i); return { label: d.toLocaleDateString('en', { month: 'short' }), count: completed.filter(b => { const date = new Date(b.createdAt); return date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear(); }).length }; });
  const max = Math.max(1, ...months.map(m => m.count));
  return <div className="cp-container cp-history"><span className="cp-eyebrow">EVERY JOURNEY TELLS A STORY</span><h1>My Past Explorations</h1><p className="cp-intro">A chronological record of your campus tours and achievements.</p><div className="cp-stats"><article><span><MapPin size={20} /></span><strong>{completed.length}</strong><small>COMPLETED TOURS</small></article><article><span><Route size={20} /></span><strong>{distance.toFixed(1)}<em> km</em></strong><small>DISTANCE EXPLORED</small></article><article><span><Sparkles size={20} /></span><strong>{bookings.length}</strong><small>TOTAL BOOKINGS</small></article><div className="cp-badges"><h3><Award size={19} /> Badges</h3><div className={completed.length ? 'earned' : ''}><span><Leaf size={18} /></span><p>Eco-Explorer<small>{completed.length ? 'First campus tour completed' : 'Complete your first campus tour'}</small></p></div><div className={completed.length >= 5 ? 'earned' : ''}><span><Award size={18} /></span><p>Campus Expert<small>{completed.length >= 5 ? 'Five campus tours completed' : `${Math.min(completed.length,5)} / 5 tours completed`}</small></p></div></div></div>
    <section className="cp-chart-panel"><h2>Monthly Journey</h2><p>Completed tours booked in the last 6 months.</p><div className="cp-chart" role="img" aria-label={months.map(m => `${m.label}: ${m.count} tours`).join(', ')}><div className="cp-chart-axis"><span>{max}</span><span>0</span></div>{months.map((m,i) => <div className="cp-chart-column" key={i}><div className="cp-bar-space"><div className={i === 5 ? 'cp-bar current' : 'cp-bar'} style={{ height: `${m.count / max * 100}%`, minHeight: m.count ? 8 : 2 }}><span>{m.count}</span></div></div><span>{m.label}</span></div>)}</div></section>
    <section className="cp-section"><div className="cp-section-heading"><h2>Tour History</h2><select aria-label="Filter tour history" value={filter} onChange={e => { setFilter(e.target.value); setLimit(6); }}><option value="ALL">All tours</option>{['COMPLETED','SCHEDULED','PENDING','IN_PROGRESS','CANCELLED'].map(s => <option key={s} value={s}>{s.replaceAll('_',' ')}</option>)}</select></div>{loading ? <div className="cp-empty" role="status">Loading your journeys…</div> : error ? <p className="cp-error" role="alert">{error}</p> : !filtered.length ? <div className="cp-empty"><CalendarDays size={35} /><h3>{user ? 'Your next adventure starts here' : 'Your journeys, all in one place'}</h3><p>{user ? 'Your tours will appear here once you make a booking.' : 'Sign in to see your tours, milestones and campus memories.'}</p><Link to={user ? '/booking' : '/login?redirect=/history'} className="cp-primary">{user ? 'Explore Tours' : 'Sign in'} <ArrowRight size={15} /></Link></div> : <><div className="cp-three-grid">{filtered.slice(0,limit).map((b,i) => <article className="cp-tour-card cp-history-card" key={b.id}><div className="cp-card-image"><img src={tours[i % tours.length].image} alt="Campus tour" /><span className="cp-image-tag"><CheckCircle2 size={13} /> {b.status.replaceAll('_',' ')}</span></div><div className="cp-card-body"><span className="cp-date">{new Date(b.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</span><h3>{b.route?.name || 'Campus Tour'}</h3><div className="cp-meta"><Clock size={13} /> {b.timeSlot}<MapPin size={13} /> {b.route?.length || 0} m</div><h4>Your booking</h4><p>Visitor: {b.visitorName}<br />Duration: {b.route?.estTime || '—'} minutes</p><Link className="cp-primary cp-full" to={`/booking?route=${encodeURIComponent(b.routeId)}`}><RotateCcw size={13} /> Re-explore</Link></div></article>)}</div>{filtered.length > limit && <button className="cp-secondary cp-load" onClick={() => setLimit(limit+6)}>Load More History</button>}</> }</section>
    <section className="cp-recommendations"><h2><Sparkles size={20} /> Recommended Next Tours</h2><p>A little inspiration for your next adventure.</p><div className="cp-two-grid">{[tours[2],tours[3]].map(t => <Link key={t.id} to={`/tours/${t.id}`}><span><Sparkles size={20} /></span><div><h3>{t.short || t.name}</h3><p>{t.theme} · {t.duration} minutes</p></div><ArrowRight size={18} /></Link>)}</div></section>
  </div>;
}
