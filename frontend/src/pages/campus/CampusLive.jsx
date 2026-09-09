import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Radio, Battery, Gauge, Sparkles, MapPin, Bot, ArrowRight } from 'lucide-react';
import { API, defaultPois } from './campusData';
import CampusMap from './CampusMap';

export default function CampusLive() {
  const [connected, setConnected] = useState(false);
  const [fleet, setFleet] = useState([]);
  const [selected, setSelected] = useState('');
  const [pois, setPois] = useState(defaultPois);
  const [arrivals, setArrivals] = useState({});
  useEffect(() => {
    const socket = io(API);
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => { setConnected(false); setFleet([]); });
    socket.on('amr_telemetry', data => { if (data.fleet) setFleet(data.fleet); });
    socket.on('map_pois', data => { if (data.length) setPois(data); });
    socket.on('amr_at_poi', data => setArrivals(prev => ({ ...prev, [data.amrId]: data.poi.name })));
    return () => socket.disconnect();
  }, []);
  const robot = fleet.find(r => r.id === selected) || fleet.find(r => r.status === 'EN_ROUTE' || r.status === 'AT_POI') || fleet[0];
  const active = robot && ['EN_ROUTE','AT_POI'].includes(robot.status);
  const currentPoi = robot ? arrivals[robot.id] : null;
  return <div className="cp-container cp-live"><div className="cp-section-heading"><div><span className="cp-eyebrow">YOUR CAMPUS, IN MOTION</span><h1>Follow Your Journey</h1></div><span className={`cp-live-status ${connected ? 'online' : ''}`}><Radio size={14} /> {connected ? 'Live tracking connected' : 'Connecting to live tracking…'}</span></div><div className="cp-live-grid"><div className="cp-live-map"><CampusMap robot={robot} pois={pois} interactive /><span className="cp-live-map-label"><Bot size={15} /> {robot?.name || 'Campus overview'}</span></div><aside className="cp-live-sidebar"><section className="cp-live-progress"><h2>Tour Progress</h2><div className="cp-progress-row"><div className={`cp-progress-orb ${active ? 'active' : ''}`}><Bot size={32} /></div><div><span className="cp-eyebrow">CURRENT STATUS</span><h3>{robot ? robot.status.replaceAll('_',' ') : 'Awaiting connection'}</h3><p>{active ? 'Your campus adventure is underway' : 'Ready for your next adventure'}</p></div></div><label className="cp-field">Tour Robot<select value={robot?.id || ''} onChange={e => setSelected(e.target.value)} disabled={!fleet.length}>{!fleet.length && <option value="">No robots available</option>}{fleet.map(r => <option value={r.id} key={r.id}>{r.name || r.id}</option>)}</select></label></section><section className="cp-current-route"><span className="cp-eyebrow">CAMPUS STOPS</span>{pois.map((p,i) => <div className={currentPoi === p.name ? 'cp-stop current' : 'cp-stop'} key={p.id || i}><MapPin size={17} /><div><h3>{p.name}</h3><p>{currentPoi === p.name ? 'Last reported arrival' : `Stop ${i + 1}`}</p></div></div>)}</section><section className="cp-live-guide"><h3><Sparkles size={16} /> AI Voice Guide</h3><p>Curious about what you see? Ask your campus guide a question, hands-free.</p><Link to="/guide" className="cp-primary cp-full">Talk to your guide <ArrowRight size={15} /></Link></section><div className="cp-two-grid cp-telemetry"><div><span><Gauge size={14} /> Speed</span><strong>{robot ? `${Number(robot.speed || 0).toFixed(1)} m/s` : '—'}</strong><small>{connected ? 'Live telemetry' : 'Offline'}</small></div><div><span><Battery size={14} /> Battery</span><strong>{robot ? `${Math.round(robot.battery)}%` : '—'}</strong><small>{robot ? 'Reported by robot' : 'Waiting for data'}</small></div></div></aside></div></div>;
}
