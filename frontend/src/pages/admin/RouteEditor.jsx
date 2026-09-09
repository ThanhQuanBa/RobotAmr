import { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle2, AlertTriangle, Music, MapPin } from 'lucide-react';
import './RouteEditor.css';

const API = window.location.origin;

export default function RouteEditor() {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const res = await fetch(`${API}/api/routes`);
      const data = await res.json();
      setRoutes(data);
    } catch(err) {}
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Campus Management</h1>
          <p>Configure tour paths and update location media assets.</p>
        </div>
        <div className="page-actions">
          <button className="btn-admin-outline">Add POI</button>
          <button className="btn-admin-primary">Create New Route</button>
        </div>
      </div>

      <div className="route-editor-layout">
        <div className="route-sidebar-left">
           <div className="route-list-panel">
              <div className="panel-header-small">
                 <span className="subtitle">ACTIVE ROUTES</span>
                 <span className="badge-small">3 Total</span>
              </div>
              
              <div className="route-card-list">
                 {routes.length > 0 ? routes.map((r, i) => (
                    <div key={r.id} className={`route-card-sm ${i===0 ? 'active' : ''}`}>
                       <div className={`rc-icon ${i===0 ? 'blue' : i===1 ? 'green' : 'red'}`}>
                          <MapPin size={18} />
                       </div>
                       <div className="rc-info">
                          <strong>{r.name}</strong>
                          <span>{r.estTime} mins • {r.waypoints?.filter(w=>w.isPOI)?.length || 0} POIs</span>
                       </div>
                    </div>
                 )) : (
                    <>
                      <div className="route-card-sm active">
                         <div className="rc-icon blue"><MapPin size={18} /></div>
                         <div className="rc-info"><strong>Grand Campus Overview</strong><span>45 mins • 12 POIs</span></div>
                      </div>
                      <div className="route-card-sm">
                         <div className="rc-icon green"><MapPin size={18} /></div>
                         <div className="rc-info"><strong>STEM Innovation Path</strong><span>30 mins • 8 POIs</span></div>
                      </div>
                      <div className="route-card-sm">
                         <div className="rc-icon red"><MapPin size={18} /></div>
                         <div className="rc-info"><strong>Historic Arts Quad</strong><span>20 mins • 5 POIs</span></div>
                      </div>
                    </>
                 )}
              </div>
           </div>

           <div className="media-check-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                 <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>Media Integrity Check</span>
                 <CheckCircle2 size={18} color="#10b981" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                 <span>All routes active</span>
                 <span>100% Sync</span>
              </div>
           </div>
        </div>

        <div className="poi-library-panel">
           <div className="poi-header">
              <h2>POI Library</h2>
              <div className="admin-search-bar" style={{ margin: 0, width: '250px', padding: '8px 12px' }}>
                 <Search size={14} />
                 <input type="text" placeholder="Search POIs..." style={{ fontSize: '0.8rem' }} />
              </div>
           </div>
           
           <div className="poi-grid">
              <div className="poi-card">
                 <div className="poi-img-container">
                    <img src="/poi-innovation.jpg" alt="Innovation Hub" />
                    <div className="poi-media-badge audio"><Music size={12}/> Audio</div>
                 </div>
                 <div className="poi-card-content">
                    <h4>The Innovation Hub</h4>
                    <p>State-of-the-art facility housing robotics labs and...</p>
                    <div className="poi-card-footer">
                       <span>ID: POI-042</span>
                       <button className="text-btn">Edit Details</button>
                    </div>
                 </div>
              </div>

              <div className="poi-card">
                 <div className="poi-img-container">
                    <img src="/poi-library.jpg" alt="Main Library" />
                    <div className="poi-media-badge audio"><Music size={12}/> Audio</div>
                 </div>
                 <div className="poi-card-content">
                    <h4>Main Library</h4>
                    <p>The central repository of campus knowledge and...</p>
                    <div className="poi-card-footer">
                       <span>ID: POI-011</span>
                       <button className="text-btn">Edit Details</button>
                    </div>
                 </div>
              </div>

              <div className="poi-card">
                 <div className="poi-img-container">
                    <img src="/poi-student-union.jpg" alt="Student Union" />
                    <div className="poi-media-badge missing"><AlertTriangle size={12}/> Missing Audio</div>
                 </div>
                 <div className="poi-card-content">
                    <h4>Student Union</h4>
                    <p>Central hub for student life, dining, and recreational...</p>
                    <div className="poi-card-footer">
                       <span>ID: POI-018</span>
                       <button className="text-btn">Edit Details</button>
                    </div>
                 </div>
              </div>

              <div className="poi-card create-new">
                 <div className="create-new-content">
                    <div className="icon-circle">
                       <Plus size={24} />
                    </div>
                    <span>Create New POI</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
