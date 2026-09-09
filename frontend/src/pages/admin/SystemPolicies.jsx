import { Clock, CheckCircle2 } from 'lucide-react';
import './SystemPolicies.css';

export default function SystemPolicies() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>System Policies & Constraints</h1>
          <p>Global configuration for autonomous fleet behavior and security.</p>
        </div>
        <div className="page-actions">
          <button className="btn-admin-outline">Reset Defaults</button>
          <button className="btn-admin-primary">Save Changes</button>
        </div>
      </div>

      <div className="policies-layout">
        <div className="policies-main">
          
          <div className="policy-group-card">
            <div className="policy-group-header">
              <div className="pg-icon blue"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
              <h3>Operational Constraints</h3>
            </div>
            
            <div className="constraints-grid">
              <div className="constraint-box">
                <div className="cb-header">
                  <span>Global Speed Limit</span>
                  <div className="cb-value">10 <small>mph</small></div>
                </div>
                <div className="cb-slider-track">
                  <div className="cb-slider-fill" style={{width: '60%'}}></div>
                  <div className="cb-slider-thumb" style={{left: '60%'}}></div>
                </div>
              </div>

              <div className="constraint-box">
                <div className="cb-header">
                  <span>Proximity Alert Distance</span>
                  <div className="cb-value">5 <small>ft</small></div>
                </div>
                <div className="cb-slider-track">
                  <div className="cb-slider-fill" style={{width: '30%'}}></div>
                  <div className="cb-slider-thumb" style={{left: '30%'}}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="policy-group-card">
             <div className="policy-group-header" style={{ marginBottom: '16px' }}>
                <h3>Allowed Operation Hours</h3>
             </div>
             
             <div className="hours-config">
                <div className="time-input-wrap">
                  <input type="text" className="time-input" defaultValue="06:00 AM" />
                  <Clock size={16} />
                </div>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>TO</span>
                <div className="time-input-wrap">
                  <input type="text" className="time-input" defaultValue="11:00 PM" />
                  <Clock size={16} />
                </div>
             </div>

             <div className="toggle-row" style={{ marginTop: '20px' }}>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
                <span className="toggle-label" style={{ fontSize: '0.9rem', color: '#1e293b' }}>Enable 24/7 Operations</span>
             </div>
          </div>

        </div>

        <div className="policies-sidebar">
          <div className="access-matrix-card">
            <h3>Access Control Matrix</h3>
            <p className="matrix-desc">Role-based permission management</p>
            
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Permission</th>
                  <th>Admin</th>
                  <th>Ops</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Tele-op</td>
                  <td><div className="matrix-check active"><CheckCircle2 size={16}/></div></td>
                  <td><div className="matrix-check active"><CheckCircle2 size={16}/></div></td>
                </tr>
                <tr>
                  <td>Edit Routes</td>
                  <td><div className="matrix-check active"><CheckCircle2 size={16}/></div></td>
                  <td><div className="matrix-check inactive"><div className="x-icon">×</div></div></td>
                </tr>
                <tr>
                  <td>Audit Logs</td>
                  <td><div className="matrix-check active"><CheckCircle2 size={16}/></div></td>
                  <td><div className="matrix-check inactive"><div className="x-icon">×</div></div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
