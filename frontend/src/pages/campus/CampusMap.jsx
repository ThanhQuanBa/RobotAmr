import { useState } from 'react';
import { defaultPois } from './campusData';
import { Plus, Minus, LocateFixed } from 'lucide-react';

const blocks = [[80,85,100,65],[230,65,105,60],[405,70,100,85],[570,60,115,70],[120,235,110,65],[315,225,95,80],[535,220,120,65],[85,385,125,65],[285,380,110,60],[505,365,105,75]];
export default function CampusMap({ robot, pois = defaultPois, interactive = false }) {
  const [zoom, setZoom] = useState(1);
  return <div className="cp-map">
    <svg viewBox="0 0 780 520" role="img" aria-label="Illustrated campus route map">
      <defs><pattern id="cp-windows" width="13" height="12" patternUnits="userSpaceOnUse"><rect width="13" height="12" fill="#496c80" /><path d="M0 0H13M0 0V12" stroke="#a1c6d3" strokeWidth="2" /></pattern><filter id="cp-shadow"><feDropShadow dx="5" dy="8" stdDeviation="5" floodOpacity=".16" /></filter></defs>
      <rect width="780" height="520" fill="#e4ecdf" />
      <g style={{ transform: `translate(390px, 260px) scale(${zoom}) translate(-390px, -260px)`, transition: 'transform .2s' }}>
        <path d="M0 185H780M0 345H780M260 0V520M490 0V520M45 0V520M735 0V520" stroke="#fff" strokeWidth="33" fill="none" />
        <path d="M0 185H780M0 345H780M260 0V520M490 0V520M45 0V520M735 0V520" stroke="#cdd5d9" strokeWidth="23" fill="none" />
        <path d="M0 185H780M0 345H780M260 0V520M490 0V520" stroke="#fff" strokeDasharray="10 8" fill="none" />
        {Array.from({ length: 36 }, (_, i) => <g key={i} transform={`translate(${60 + (i * 97) % 660},${25 + (i * 131) % 455})`}><ellipse cy="5" rx="11" ry="7" fill="#638864" opacity=".2" /><circle r="9" fill={i % 2 ? '#8bb16b' : '#669c67'} /><circle cx="-2" cy="-3" r="6" fill="#a3c986" /></g>)}
        {blocks.map(([x,y,w,h], i) => <g key={i} filter="url(#cp-shadow)"><path d={`M${x} ${y}l18 -18h${w}v${h}l-18 18Z`} fill="#668698" /><rect x={x} y={y} width={w} height={h} fill="url(#cp-windows)" /><path d={`M${x} ${y}l18 -18h${w}l-18 18Z`} fill="#dce5e9" /><path d={`M${x+12} ${y-4}l10 -10h${w-23}l-10 10Z`} fill="#6f929f" /><rect x={x+w/2-7} y={y+h-19} width="14" height="19" fill="#334d5e" /></g>)}
        <polyline points={pois.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="white" strokeWidth="9" strokeLinejoin="round" />
        <polyline points={pois.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#2469ed" strokeWidth="4" strokeLinejoin="round" strokeDasharray="8 4" />
        {pois.map((p,i) => <g key={p.id || i}><circle cx={p.x} cy={p.y} r="8" fill="#fff" stroke="#2469ed" strokeWidth="3" /><text x={p.x} y={p.y - 16} textAnchor="middle" fontSize="10" fontWeight="600" fill="#173e63" stroke="#fff" strokeWidth="3" paintOrder="stroke">{p.name || p.poiName}</text></g>)}
        {robot?.pose && <g transform={`translate(${robot.pose.x},${robot.pose.y})`}><circle r="20" fill="#165dff" opacity=".2" /><circle r="13" fill="#165dff" stroke="white" strokeWidth="3" /><rect x="-7" y="-5" width="14" height="10" rx="3" fill="white" /><circle cx="-3" cy="-1" r="1.5" fill="#165dff" /><circle cx="3" cy="-1" r="1.5" fill="#165dff" /></g>}
      </g>
    </svg>
    <span className="cp-map-caption">Campus route · Illustrative map</span>
    {interactive && <div className="cp-map-controls"><button aria-label="Zoom in" onClick={() => setZoom(z => Math.min(2, z + .2))}><Plus size={17} /></button><button aria-label="Zoom out" onClick={() => setZoom(z => Math.max(.8, z - .2))}><Minus size={17} /></button><button aria-label="Reset map" onClick={() => setZoom(1)}><LocateFixed size={17} /></button></div>}
  </div>;
}
