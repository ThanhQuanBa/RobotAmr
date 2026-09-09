import { Filter, Download, History, ShieldAlert, UserCog, RefreshCw, Search } from 'lucide-react';
import './AuditLogs.css';

const logs = [
  { id: 1, time: 'Oct 24, 2023\n14:32:01 UTC', user: 'Sarah Jenkins', email: 'sarah.j@campustour.edu', avatar: 'S', action: 'Security Policy Updated', type: 'policy', target: 'Global Password Requirement\nID: POL-9021', ip: '192.168.1.45' },
  { id: 2, time: 'Oct 24, 2023\n13:15:44 UTC', user: 'System Auto', email: 'System Account', avatar: '⚙️', action: 'Firmware Update', type: 'firmware', target: 'Fleet Bot Alpha-7\nVersion 2.4.1 deployed', ip: '--' },
  { id: 3, time: 'Oct 24, 2023\n11:05:22 UTC', user: 'Marcus Chen', email: 'm.chen@campustour.edu', avatar: 'M', action: 'Route Modified', type: 'route', target: 'Engineering Quad Loop\nAdded 2 POIs', ip: '10.0.4.112' },
  { id: 4, time: 'Oct 23, 2023\n09:45:10 UTC', user: 'Jane Doe', email: 'jane.d@campustour.edu', avatar: 'J', action: 'User Created', type: 'user', target: 'New Operator Profile\nRole: Tour Guide', ip: '192.168.1.88' },
];

export default function AuditLogs() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Audit Logs</h1>
          <p>Review system activities and security events.</p>
        </div>
        <div className="page-actions">
          <button className="btn-admin-outline"><Filter size={16} /> Filters</button>
          <button className="btn-admin-outline"><Download size={16} /> Export</button>
        </div>
      </div>

      <div className="stat-cards-row">
        <div className="stat-card">
          <div className="stat-card-info">
            <h4>TOTAL EVENTS</h4>
            <div className="stat-value">12,492</div>
            <div className="stat-sub"><span className="up">↗ +5.1%</span> this week</div>
          </div>
          <div className="stat-card-icon blue">
             <History size={20} />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-info">
            <h4>SECURITY ALERTS</h4>
            <div className="stat-value">18</div>
            <div className="stat-sub"><span className="down">↗ +2</span> requires action</div>
          </div>
          <div className="stat-card-icon red">
            <ShieldAlert size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <h4>USER ACTIONS</h4>
            <div className="stat-value">8,204</div>
            <div className="stat-sub"><span style={{color: '#94a3b8'}}>— Stable average</span></div>
          </div>
          <div className="stat-card-icon blue">
            <UserCog size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <h4>SYSTEM UPDATES</h4>
            <div className="stat-value">143</div>
            <div className="stat-sub"><span className="down">↘ -1.1%</span> this week</div>
          </div>
          <div className="stat-card-icon blue">
            <RefreshCw size={20} />
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
           <div className="admin-search-bar" style={{ margin: 0, width: '300px' }}>
              <Search size={16} />
              <input type="text" placeholder="Search specific events..." />
           </div>
           <span className="pagination-info">Showing 1-10 of 12,492</span>
        </div>
        
        <table className="admin-table audit-table">
          <thead>
            <tr>
              <th>TIMESTAMP</th>
              <th>USER</th>
              <th>ACTION</th>
              <th>TARGET / RESOURCE</th>
              <th>IP ADDRESS</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td style={{ whiteSpace: 'pre-line', fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                  {log.time}
                </td>
                <td>
                  <div className="user-cell">
                    {log.avatar === '⚙️' ? (
                       <div className="sys-avatar"><RefreshCw size={16}/></div>
                    ) : (
                       <img src={`https://ui-avatars.com/api/?name=${log.user}&background=f1f5f9&color=64748b`} alt={log.user} className="user-cell-avatar" />
                    )}
                    <div className="user-cell-info">
                      <strong>{log.user}</strong>
                      <span>{log.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                   <span className={`action-badge ${log.type}`}>
                      {log.type === 'policy' && <ShieldAlert size={12}/>}
                      {log.type === 'firmware' && <RefreshCw size={12}/>}
                      {log.type === 'route' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>}
                      {log.type === 'user' && <UserCog size={12}/>}
                      {log.action}
                   </span>
                </td>
                <td style={{ whiteSpace: 'pre-line', fontSize: '0.85rem', lineHeight: 1.4 }}>
                  {log.target}
                </td>
                <td style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#64748b' }}>
                  {log.ip}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="admin-pagination" style={{ justifyContent: 'center', gap: '20px' }}>
          <button className="btn-admin-outline" style={{ padding: '6px 14px' }}><ChevronLeft size={14} /> Previous</button>
          
          <div className="pagination-buttons">
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn">2</button>
            <button className="pagination-btn">3</button>
            <span style={{ padding: '0 8px', color: '#94a3b8' }}>...</span>
            <button className="pagination-btn">12</button>
          </div>

          <button className="btn-admin-outline" style={{ padding: '6px 14px' }}>Next <ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}

const ChevronLeft = ({size}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const ChevronRight = ({size}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
