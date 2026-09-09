import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { io } from 'socket.io-client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import {
  Activity, Battery, AlertTriangle, CheckCircle, Navigation, Gauge,
  Monitor, Box, RefreshCw, Zap, Radio, Eye, Play, Square,
  ChevronRight, Cpu, Wifi, WifiOff,
  MousePointer2, Hand, Waypoints, Tag, Ruler
} from 'lucide-react';
import './OperatorDashboard.css';

const SOCKET_URL = window.location.origin;

// --- 3D Components ---
function Map3DModel() {
  const { scene } = useGLTF('/map.glb');
  return <primitive object={scene} scale={1} position={[0, 0, 0]} />;
}

function Robot3D({ amr, isSelected, onClick }) {
  const isFault = amr.status === 'FAULT';
  const color = isFault ? '#ff1744' : (amr.status === 'AT_POI' ? '#00e676' : '#00d2ff');
  
  // Tùy chỉnh hệ số scale này để vừa với kích thước thật của bản đồ 3D
  const scaleFactor = 1; 
  const x = amr.pose.x * scaleFactor;
  const z = amr.pose.y * scaleFactor;
  const y = 1; 
  
  return (
    <group position={[x, y, z]} onClick={(e) => { e.stopPropagation(); onClick(); }} rotation={[0, -amr.pose.theta || 0, 0]}>
      {/* Thân robot */}
      <mesh>
        <boxGeometry args={[4, 2, 6]} />
        <meshStandardMaterial color={color} emissive={isSelected ? color : 'black'} emissiveIntensity={isSelected ? 0.8 : 0} />
      </mesh>
      
      {/* Mũi tên chỉ hướng */}
      <mesh position={[0, 1, 3]}>
        <boxGeometry args={[2, 0.5, 2]} />
        <meshStandardMaterial color="#fff" />
      </mesh>

      {/* Hiển thị tên Robot */}
      <Html position={[0, 3, 0]} center>
        <div style={{ 
          background: isSelected ? color : 'rgba(0,0,0,0.8)', 
          color: 'white', padding: '4px 8px', borderRadius: '4px', 
          fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap',
          border: `1px solid ${color}`,
          pointerEvents: 'none'
        }}>
          {amr.name} {isFault ? '⚠️' : ''}
        </div>
      </Html>
    </group>
  );
}
// ---------------------

export default function OperatorDashboard() {
  const [fleet, setFleet] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedAmr, setSelectedAmr] = useState(null);
  const [activeTab, setActiveTab] = useState('3dmap'); // '3dmap' | 'twin' | 'foxglove'
  const [activeTool, setActiveTool] = useState('select');
  const [foxgloveConfig, setFoxgloveConfig] = useState(null);
  const [pois, setPois] = useState([]);
  const [tourEvents, setTourEvents] = useState([]);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('amr_telemetry', (data) => {
      if (data.fleet) {
        setFleet(data.fleet);
        if (!selectedAmr && data.fleet.length > 0) {
          setSelectedAmr(data.fleet[0].id);
        }
      }
    });

    socketRef.current.on('map_pois', (data) => setPois(data));

    socketRef.current.on('amr_alert', (alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 10));
    });

    socketRef.current.on('amr_at_poi', (data) => {
      setTourEvents(prev => [{
        type: 'poi_arrival',
        text: `${data.amrId} arrived at ${data.poi.name}`,
        time: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 20));
    });

    socketRef.current.on('tour_complete', (data) => {
      setTourEvents(prev => [{
        type: 'complete',
        text: `Tour completed by ${data.amrId}`,
        time: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 20));
    });

    socketRef.current.on('amr_reassigned', (data) => {
      setTourEvents(prev => [{
        type: 'reassign',
        text: `Mission reassigned: ${data.from} → ${data.to}`,
        time: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 20));
    });

    // Fetch Foxglove config
    fetch(`${SOCKET_URL}/api/foxglove/config`)
      .then(r => r.json())
      .then(setFoxgloveConfig)
      .catch(() => {});

    return () => socketRef.current.disconnect();
  }, []);

  // Canvas Drawing Loop
  const drawCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background gradient
    const grad = ctx.createRadialGradient(w/2, h/2, 50, w/2, h/2, w/2);
    grad.addColorStop(0, 'rgba(0, 210, 255, 0.02)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Draw path lines between POIs
    if (pois.length > 1) {
      ctx.strokeStyle = 'rgba(0, 210, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(pois[0].x, pois[0].y);
      for (let i = 1; i < pois.length; i++) {
        ctx.lineTo(pois[i].x, pois[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw POIs
    pois.forEach(poi => {
      // Outer ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(poi.x, poi.y, 12, 0, Math.PI * 2);
      ctx.stroke();

      // Inner dot
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(poi.x, poi.y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '11px Outfit';
      ctx.fillText(poi.name, poi.x - 20, poi.y - 18);
    });

    // Draw each AMR
    const time = Date.now() / 1000;
    fleet.forEach(amr => {
      const { x, y } = amr.pose;
      const isSelected = amr.id === selectedAmr;
      const isFault = amr.status === 'FAULT';

      // Selection ring
      if (isSelected) {
        ctx.strokeStyle = isFault ? 'rgba(255, 23, 68, 0.5)' : 'rgba(0, 210, 255, 0.5)';
        ctx.lineWidth = 2;
        const selRadius = 20 + Math.sin(time * 3) * 3;
        ctx.beginPath();
        ctx.arc(x, y, selRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Glow
      const glowColor = isFault ? 'rgba(255, 23, 68, 0.3)' : 'rgba(0, 210, 255, 0.3)';
      const glowGrad = ctx.createRadialGradient(x, y, 2, x, y, 25);
      glowGrad.addColorStop(0, glowColor);
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(x - 25, y - 25, 50, 50);

      // Robot body
      const baseColor = isFault ? '#ff1744' : (amr.status === 'AT_POI' ? '#00e676' : '#00d2ff');
      const pulseRadius = 8 + Math.sin(time * 5) * (isFault ? 3 : 1.5);
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Direction arrow (only when moving)
      if (amr.status === 'EN_ROUTE') {
        const arrowLen = 18;
        const theta = amr.pose.theta;
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(theta) * arrowLen, y + Math.sin(theta) * arrowLen);
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Outfit';
      ctx.fillText(amr.name, x - 22, y + 25);
    });

    animationRef.current = requestAnimationFrame(drawCanvas);
  }, [fleet, pois, selectedAmr]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(drawCanvas);
    return () => cancelAnimationFrame(animationRef.current);
  }, [drawCanvas]);

  const triggerFault = async (amrId, faultType) => {
    await fetch(`${SOCKET_URL}/api/amr/${amrId}/fault`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faultType, severity: 'HIGH' })
    });
  };

  const resumeAmr = async (amrId) => {
    await fetch(`${SOCKET_URL}/api/amr/${amrId}/resume`, { method: 'POST' });
  };

  const reassignAmr = async (amrId) => {
    await fetch(`${SOCKET_URL}/api/amr/${amrId}/reassign`, { method: 'POST' });
  };

  const currentAmr = fleet.find(a => a.id === selectedAmr);
  const getStatusColor = (status) => {
    const map = { IDLE: 'var(--text-muted)', EN_ROUTE: 'var(--primary)', AT_POI: 'var(--success)', FAULT: 'var(--danger)' };
    return map[status] || 'var(--text-muted)';
  };

  return (
    <div className="page-container dashboard">
      <div className="dashboard-header">
        <h2><Monitor size={24} /> Operations Center</h2>
        <div className="header-badges">
          <div className="status-badge live"><Radio size={14} /> System Live</div>
          <div className="status-badge fleet">{fleet.length} AMR{fleet.length > 1 ? 's' : ''} Online</div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="tab-bar">
        <button className={`tab-btn ${activeTab === '3dmap' ? 'active' : ''}`} onClick={() => setActiveTab('3dmap')}>
          <Box size={16} /> 3D Map View
        </button>
        <button className={`tab-btn ${activeTab === 'twin' ? 'active' : ''}`} onClick={() => setActiveTab('twin')}>
          <Eye size={16} /> 2D Digital Twin
        </button>
        <button className={`tab-btn ${activeTab === 'foxglove' ? 'active' : ''}`} onClick={() => setActiveTab('foxglove')}>
          <Box size={16} /> Foxglove 3D View
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Main View */}
        <div className="glass-panel map-container">
          {activeTab === '3dmap' ? (
            <>
              <div className="panel-header">
                <h3>Interactive 3D Campus Map</h3>
                <span className="live-indicator">● LIVE 3D</span>
              </div>
              <div className="canvas-wrapper" style={{ position: 'relative', width: '100%', height: '100%', minHeight: '420px', background: '#111' }}>
                
                {/* Floating 3D Map Toolbar */}
                <div className="map-toolbar">
                  <button 
                    className={`tool-btn ${activeTool === 'select' ? 'active' : ''}`}
                    onClick={() => setActiveTool('select')}
                    data-title="Select Object"
                  ><MousePointer2 size={18} /></button>
                  <button 
                    className={`tool-btn ${activeTool === 'pan' ? 'active' : ''}`}
                    onClick={() => setActiveTool('pan')}
                    data-title="Pan Map"
                  ><Hand size={18} /></button>
                  <button 
                    className={`tool-btn ${activeTool === 'route' ? 'active' : ''}`}
                    onClick={() => setActiveTool('route')}
                    data-title="Edit Route"
                  ><Waypoints size={18} /></button>
                  <button 
                    className={`tool-btn ${activeTool === 'tag' ? 'active' : ''}`}
                    onClick={() => setActiveTool('tag')}
                    data-title="Add POI Tag"
                  ><Tag size={18} /></button>
                  <button 
                    className={`tool-btn ${activeTool === 'measure' ? 'active' : ''}`}
                    onClick={() => setActiveTool('measure')}
                    data-title="Measure Distance"
                  ><Ruler size={18} /></button>
                </div>

                <Canvas camera={{ position: [0, 50, 100], fov: 45 }}>
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[10, 20, 10]} intensity={1} />
                  
                  <Suspense fallback={<Html center><div style={{color:'white'}}>Loading Map...</div></Html>}>
                    <Map3DModel />
                  </Suspense>

                  {/* Render AMR Robots */}
                  {fleet.map(amr => (
                    <Robot3D 
                      key={amr.id} 
                      amr={amr} 
                      isSelected={selectedAmr === amr.id}
                      onClick={() => setSelectedAmr(amr.id)}
                    />
                  ))}

                  <OrbitControls makeDefault />
                </Canvas>
              </div>
            </>
          ) : activeTab === 'twin' ? (
            <>
              <div className="panel-header">
                <h3>Digital Twin Monitor</h3>
                <span className="live-indicator">● LIVE</span>
              </div>
              <div className="canvas-wrapper">
                <canvas ref={canvasRef} width={800} height={420} className="map-canvas" />
              </div>
            </>
          ) : (
            <>
              <div className="panel-header">
                <h3>Foxglove Studio — ROS2 3D Visualization</h3>
                {foxgloveConfig && (
                  <span className="foxglove-status">
                    {foxgloveConfig.isConnected ? (
                      <><Wifi size={14} color="var(--success)" /> Connected</>
                    ) : (
                      <><WifiOff size={14} color="var(--warning)" /> Waiting for ROS2</>
                    )}
                  </span>
                )}
              </div>
              <div className="foxglove-embed">
                {foxgloveConfig?.isConnected ? (
                  <iframe
                    src={`https://studio.foxglove.dev/?ds=foxglove-websocket&ds.url=${encodeURIComponent(foxgloveConfig.foxgloveWsUrl)}`}
                    width="100%" height="100%" frameBorder="0"
                    title="Foxglove Studio"
                    allow="autoplay; fullscreen"
                  />
                ) : (
                  <div className="foxglove-placeholder">
                    <Box size={64} />
                    <h3>Foxglove Studio Integration</h3>
                    <p>Connect your ROS2 environment to enable 3D visualization.</p>
                    <div className="foxglove-steps">
                      <div className="step-item">
                        <span className="step-num">1</span>
                        <div>
                          <strong>Start ROS2 Foxglove Bridge</strong>
                          <code>ros2 launch foxglove_bridge foxglove_bridge_launch.xml</code>
                        </div>
                      </div>
                      <div className="step-item">
                        <span className="step-num">2</span>
                        <div>
                          <strong>Configure WebSocket URL</strong>
                          <code>FOXGLOVE_WS_URL=ws://localhost:8765</code>
                        </div>
                      </div>
                      <div className="step-item">
                        <span className="step-num">3</span>
                        <div>
                          <strong>Topics Published</strong>
                          {foxgloveConfig && (
                            <div className="topic-list">
                              {Object.entries(foxgloveConfig.topics).map(([key, val]) => (
                                <span key={key} className="topic-chip">{val}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="telemetry-sidebar">
          {/* Fleet Overview */}
          <div className="glass-panel fleet-panel">
            <h3><Cpu size={16} /> AMR Fleet</h3>
            <div className="fleet-list">
              {fleet.map(amr => (
                <div
                  key={amr.id}
                  className={`fleet-item ${selectedAmr === amr.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAmr(amr.id)}
                >
                  <div className="fleet-item-left">
                    <span className="fleet-dot" style={{ background: getStatusColor(amr.status) }} />
                    <div>
                      <strong>{amr.name}</strong>
                      <span className="fleet-status">{amr.status}</span>
                    </div>
                  </div>
                  <div className="fleet-item-right">
                    <Battery size={14} color={amr.battery > 30 ? 'var(--success)' : 'var(--danger)'} />
                    <span>{amr.battery.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected AMR Details */}
          {currentAmr && (
            <div className="glass-panel telemetry-card">
              <h3>Telemetry: {currentAmr.name}</h3>
              <div className="stat-grid">
                <div className="stat-box">
                  <Battery size={18} color={currentAmr.battery > 30 ? 'var(--success)' : 'var(--danger)'} />
                  <div className="stat-value">{currentAmr.battery.toFixed(1)}%</div>
                  <div className="stat-label">Battery</div>
                </div>
                <div className="stat-box">
                  <Navigation size={18} color={getStatusColor(currentAmr.status)} />
                  <div className="stat-value" style={{ color: getStatusColor(currentAmr.status), fontSize: '0.85rem' }}>
                    {currentAmr.status}
                  </div>
                  <div className="stat-label">State</div>
                </div>
                <div className="stat-box">
                  <Gauge size={18} color="var(--primary)" />
                  <div className="stat-value">{currentAmr.speed.toFixed(1)}</div>
                  <div className="stat-label">Speed</div>
                </div>
                <div className="stat-box">
                  <Activity size={18} color="var(--primary)" />
                  <div className="stat-value mono">{currentAmr.pose.x.toFixed(1)}, {currentAmr.pose.y.toFixed(1)}</div>
                  <div className="stat-label">Position</div>
                </div>
              </div>

              <div className="control-actions">
                {currentAmr.status === 'FAULT' ? (
                  <div className="action-row">
                    <button className="btn btn-primary" onClick={() => resumeAmr(currentAmr.id)}>
                      <Play size={16} /> Resume
                    </button>
                    <button className="btn btn-outline" onClick={() => reassignAmr(currentAmr.id)}>
                      <RefreshCw size={16} /> Reassign
                    </button>
                  </div>
                ) : (
                  <div className="fault-triggers">
                    <span className="trigger-label">Simulate Fault:</span>
                    <div className="action-row">
                      <button className="btn btn-danger btn-sm" onClick={() => triggerFault(currentAmr.id, 'OBSTACLE')}>
                        Obstacle
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => triggerFault(currentAmr.id, 'SENSOR_ERROR')}>
                        Sensor
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => triggerFault(currentAmr.id, 'LOW_BATTERY')}>
                        Battery
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Alerts & Events */}
          <div className="glass-panel alerts-card">
            <h3><AlertTriangle size={16} /> Alerts & Events</h3>
            <div className="alerts-list">
              {alerts.length === 0 && tourEvents.length === 0 ? (
                <div className="no-alerts">
                  <CheckCircle size={22} color="var(--success)" />
                  <p>All systems nominal</p>
                </div>
              ) : (
                <>
                  {alerts.map(a => (
                    <div key={a.id} className="alert-item danger">
                      <AlertTriangle size={14} />
                      <div className="alert-content">
                        <strong>{a.amrName}: {a.type}</strong>
                        <span>{new Date(a.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                  {tourEvents.map((ev, i) => (
                    <div key={`ev-${i}`} className={`alert-item ${ev.type === 'complete' ? 'success' : 'info'}`}>
                      <ChevronRight size={14} />
                      <div className="alert-content">
                        <strong>{ev.text}</strong>
                        <span>{ev.time}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
