import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Route, Save, X, MapPin, Clock, Ruler } from 'lucide-react';
import './AdminRoutes.css';

const API = window.location.origin;

export default function AdminRoutes() {
  const [routes, setRoutes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', length: '', estTime: '', waypoints: [] });
  const [simResult, setSimResult] = useState(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    const res = await fetch(`${API}/api/routes`);
    const data = await res.json();
    setRoutes(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await fetch(`${API}/api/routes/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
    } else {
      await fetch(`${API}/api/routes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
    }
    setForm({ name: '', length: '', estTime: '', waypoints: [] });
    setShowForm(false);
    setEditingId(null);
    fetchRoutes();
  };

  const handleEdit = (route) => {
    setEditingId(route.id);
    setForm({ name: route.name, length: route.length, estTime: route.estTime, waypoints: route.waypoints || [] });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this route and all its bookings?')) return;
    await fetch(`${API}/api/routes/${id}`, { method: 'DELETE' });
    fetchRoutes();
  };

  const runSimulation = async () => {
    const res = await fetch(`${API}/api/simulation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data = await res.json();
    setSimResult(data.simulation);
  };

  return (
    <div className="page-container admin-routes">
      <div className="admin-header">
        <div>
          <h2><Route size={24} /> Route Management</h2>
          <p>Create, edit and simulate tour routes for your AMR fleet.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={runSimulation}>
            <MapPin size={16} /> Run Simulation
          </button>
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', length: '', estTime: '', waypoints: [] }); }}>
            <Plus size={16} /> Add Route
          </button>
        </div>
      </div>

      {/* Simulation Result Banner */}
      {simResult && (
        <div className={`glass-panel sim-banner ${simResult.status === 'PASS' ? 'pass' : 'fail'}`}>
          <div className="sim-header">
            <h4>Simulation Result: <span className={simResult.status === 'PASS' ? 'text-success' : 'text-danger'}>{simResult.status}</span></h4>
            <button className="close-btn" onClick={() => setSimResult(null)}><X size={16} /></button>
          </div>
          <div className="sim-stats">
            <div className="sim-stat"><strong>{simResult.totalDistance}</strong><span>Total Distance (px)</span></div>
            <div className="sim-stat"><strong>{simResult.estimatedTimeMin}</strong><span>Est. Time (min)</span></div>
            <div className="sim-stat"><strong>{simResult.batteryDrainPercent}%</strong><span>Battery Drain</span></div>
            <div className="sim-stat"><strong>{simResult.poiCount}</strong><span>POI Stops</span></div>
          </div>
          {simResult.conflicts.length > 0 && (
            <div className="sim-conflicts">
              {simResult.conflicts.map((c, i) => (
                <div key={i} className="conflict-item">⚠️ {c.details}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="glass-panel modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? 'Edit Route' : 'Create New Route'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label><Route size={14} /> Route Name</label>
                <input className="input-glass w-full" placeholder="e.g., Campus Full Tour" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label><Ruler size={14} /> Length (meters)</label>
                  <input className="input-glass w-full" type="number" placeholder="1500" value={form.length} onChange={e => setForm({ ...form, length: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label><Clock size={14} /> Est. Time (minutes)</label>
                  <input className="input-glass w-full" type="number" placeholder="30" value={form.estTime} onChange={e => setForm({ ...form, estTime: e.target.value })} required />
                </div>
              </div>
              
              {/* Waypoints Section */}
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> Waypoints ({form.waypoints.length})</span>
                  <button type="button" className="btn btn-outline btn-sm" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => setForm({...form, waypoints: [...form.waypoints, { x: 0, y: 0, isPOI: false, poiName: '' }]})}>+ Add Point</button>
                </label>
                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '5px' }}>
                  {form.waypoints.map((wp, index) => (
                    <div key={index} style={{ display: 'flex', gap: '6px', alignItems: 'center', background: 'var(--bg-subtle)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      <span style={{fontSize: '0.8rem', color: 'var(--text-muted)', width: '15px'}}>{index+1}</span>
                      <input type="number" placeholder="X" value={wp.x} onChange={e => { const newWp = [...form.waypoints]; newWp[index].x = e.target.value; setForm({...form, waypoints: newWp}) }} className="input-glass" style={{ width: '65px', padding: '6px' }} required />
                      <input type="number" placeholder="Y" value={wp.y} onChange={e => { const newWp = [...form.waypoints]; newWp[index].y = e.target.value; setForm({...form, waypoints: newWp}) }} className="input-glass" style={{ width: '65px', padding: '6px' }} required />
                      <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', margin: 0, cursor: 'pointer' }}>
                        <input type="checkbox" checked={wp.isPOI} onChange={e => { const newWp = [...form.waypoints]; newWp[index].isPOI = e.target.checked; if(!e.target.checked) newWp[index].poiName=''; setForm({...form, waypoints: newWp}) }} /> POI?
                      </label>
                      {wp.isPOI && <input type="text" placeholder="POI Name" value={wp.poiName || ''} onChange={e => { const newWp = [...form.waypoints]; newWp[index].poiName = e.target.value; setForm({...form, waypoints: newWp}) }} className="input-glass" style={{ flex: 1, padding: '6px' }} required />}
                      <button type="button" onClick={() => { const newWp = form.waypoints.filter((_, i) => i !== index); setForm({...form, waypoints: newWp}); }} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', marginLeft: 'auto' }}><X size={16}/></button>
                    </div>
                  ))}
                  {form.waypoints.length === 0 && <span style={{fontSize:'0.85rem', color: 'var(--text-muted)'}}>No waypoints added yet.</span>}
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Save size={16} /> {editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Routes Table */}
      <div className="glass-panel table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Route Name</th>
              <th>Length</th>
              <th>Est. Time</th>
              <th>Waypoints</th>
              <th>Bookings</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map(r => (
              <tr key={r.id}>
                <td><strong>{r.name}</strong></td>
                <td>{r.length}m</td>
                <td>{r.estTime} min</td>
                <td><span className="badge" style={{background: 'var(--bg-subtle)', color: 'var(--text-secondary)'}}>{r.waypoints?.length || 0} pts</span></td>
                <td><span className="badge">{r.bookings?.length || 0}</span></td>
                <td>
                  <div className="table-actions">
                    <button className="icon-btn edit" onClick={() => handleEdit(r)}><Pencil size={14} /></button>
                    <button className="icon-btn delete" onClick={() => handleDelete(r.id)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {routes.length === 0 && (
              <tr><td colSpan="5" className="empty-row">No routes found. Create your first route!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
