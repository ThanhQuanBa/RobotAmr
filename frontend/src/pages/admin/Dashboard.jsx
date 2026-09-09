import { Download, Upload, Clock, CheckCircle2, DollarSign, Activity } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Global System Overview</h1>
          <p>Real-time command center for CampusPath fleet.</p>
        </div>
        <div className="page-actions">
          <button className="btn-admin-outline">Export Report</button>
          <button className="btn-admin-primary">Deploy Update</button>
        </div>
      </div>

      <div className="stat-cards-row">
        <div className="stat-card">
          <div className="stat-card-info">
            <h4>AVG. RESPONSE TIME</h4>
            <div className="stat-value">2.4m</div>
            <div className="stat-sub"><span className="down">↘ -0.3m</span> this week</div>
          </div>
          <div className="stat-card-icon green">
            <Clock size={20} />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-info">
            <h4>OPERATIONAL READINESS</h4>
            <div className="stat-value">94%</div>
            <div className="stat-sub" style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>80% Ready</span>
              <span style={{ background: '#ecfdf5', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>14% Service</span>
              <span style={{ background: '#fef2f2', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>6% Maint.</span>
            </div>
          </div>
          <div className="stat-card-icon blue">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <h4>COST PER TOUR</h4>
            <div className="stat-value">$1.15</div>
            <div className="stat-sub"><span className="down">↘ -$0.12</span> this month</div>
          </div>
          <div className="stat-card-icon purple">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <h4>PEAK DEMAND COVERAGE</h4>
            <div className="stat-value">92%</div>
            <div style={{ marginTop: '8px', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '92%', height: '100%', background: '#3b82f6' }} />
            </div>
            <div className="stat-sub" style={{ marginTop: '4px' }}>During 12PM-2PM rush</div>
          </div>
          <div className="stat-card-icon cyan">
            <Activity size={20} />
          </div>
        </div>
      </div>

      <div className="admin-grid-2">
        {/* Revenue Chart */}
        <div className="admin-panel">
          <h3>Revenue vs. Operational Cost</h3>
          <p className="panel-subtitle">12-Month Trend Analysis</p>
          
          <div className="chart-placeholder">
             {/* Simple CSS-based bar chart representation */}
             <div className="css-chart-y-axis">
                <span>$50k</span>
                <span>$37.5k</span>
                <span>$25k</span>
                <span>$12.5k</span>
                <span>$0</span>
             </div>
             <div className="css-chart-bars">
                {[30, 35, 42, 40, 50, 48, 55, 65, 75, 80, 85, 90].map((h, i) => (
                  <div key={i} className="css-bar-group">
                    <div className="css-bar-bg" style={{ height: `${h}%` }}></div>
                    <div className="css-bar-fg" style={{ height: `${h * 0.3}%` }}></div>
                  </div>
                ))}
             </div>
          </div>
          
          <div className="chart-legend">
            <div className="legend-item"><span className="legend-color" style={{background: '#3b82f6'}}></span> Revenue</div>
            <div className="legend-item"><span className="legend-color" style={{background: '#ef4444'}}></span> Operational Cost</div>
          </div>
        </div>

        <div className="admin-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3>Fleet Health & Battery Analytics</h3>
          <div className="health-bars-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
            <div className="health-bar-row">
              <div className="health-bar-labels">
                <span>Healthy (&gt;80%)</span>
                <strong>65% of Fleet</strong>
              </div>
              <div className="health-bar-track">
                <div className="health-bar-fill" style={{ width: '65%', background: '#4d7c49' }}></div>
              </div>
            </div>
            <div className="health-bar-row">
              <div className="health-bar-labels">
                <span>Moderate (40%-80%)</span>
                <strong>25% of Fleet</strong>
              </div>
              <div className="health-bar-track">
                <div className="health-bar-fill" style={{ width: '25%', background: '#60a5fa' }}></div>
              </div>
            </div>
            <div className="health-bar-row">
              <div className="health-bar-labels">
                <span>Requires Attention (&lt;40%)</span>
                <strong>10% of Fleet</strong>
              </div>
              <div className="health-bar-track">
                <div className="health-bar-fill" style={{ width: '10%', background: '#dc2626' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-grid-2">
        <div className="admin-panel">
          <h3>Visitor Growth & Retention</h3>
          <div className="donut-chart-container">
            <div className="donut-chart">
               <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path className="circle"
                    strokeDasharray="68, 100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
               </svg>
               <div className="donut-content">
                  <strong>12k</strong>
                  <span>Total Visitors</span>
               </div>
            </div>
            <div className="donut-legend">
              <div className="d-legend-item">
                <span className="d-legend-color" style={{background: '#2563eb'}}></span>
                <div>
                  <strong>New Visitors</strong>
                  <span>68% (8,160)</span>
                </div>
              </div>
              <div className="d-legend-item">
                <span className="d-legend-color" style={{background: '#4d7c49'}}></span>
                <div>
                  <strong>Returning Visitors</strong>
                  <span>32% (3,840)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-panel">
          <h3>Administrative Audit Log</h3>
          <div className="audit-timeline">
            <div className="timeline-item">
               <div className="tl-time">10:42 AM</div>
               <div className="tl-marker blue"></div>
               <div className="tl-content">
                  <strong>Routing Optimization Deployed</strong>
                  <p>Adjusted paths to improve average response time by 5%.</p>
               </div>
            </div>
            <div className="timeline-item">
               <div className="tl-time">09:15 AM</div>
               <div className="tl-marker red"></div>
               <div className="tl-content">
                  <strong>Maintenance Ticket Created</strong>
                  <p>Unit 042 flagged for immediate battery replacement.</p>
               </div>
            </div>
            <div className="timeline-item">
               <div className="tl-time">Yesterday</div>
               <div className="tl-marker green"></div>
               <div className="tl-content">
                  <strong>Cost Efficiency Report Generated</strong>
                  <p>Monthly review confirms cost per tour dropped to $1.15.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
