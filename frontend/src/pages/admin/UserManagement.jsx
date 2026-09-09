import { useState, useEffect } from 'react';
import { Download, Plus, Search, Filter, Pencil, Trash2 } from 'lucide-react';

const API = window.location.origin;

export default function UserManagement() {
  const [users, setUsers] = useState([
    { id: '1', name: 'Sarah Jenkins', email: 's.jenkins@campustour.edu', role: 'Administrator', status: 'Active', lastLogin: 'Today, 09:41 AM', avatar: 'S' },
    { id: '2', name: 'Marcus Rodriguez', email: 'm.rodriguez@campustour.edu', role: 'Operator', status: 'Active', lastLogin: 'Yesterday, 14:22 PM', avatar: 'M' },
    { id: '3', name: 'Dr. Alistair Vance', email: 'a.vance@external.edu', role: 'Visitor', status: 'Inactive', lastLogin: 'Oct 12, 2023', avatar: 'A' },
  ]);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>User Management</h1>
          <p>Manage system access, operator roles, and staff accounts.</p>
        </div>
        <div className="page-actions">
          <button className="btn-admin-outline"><Download size={16} /> Export List</button>
          <button className="btn-admin-primary"><Plus size={16} /> Add New User</button>
        </div>
      </div>

      <div className="stat-cards-row">
        <div className="stat-card">
          <div className="stat-card-info">
            <h4>TOTAL USERS</h4>
            <div className="stat-value">1,248</div>
            <div className="stat-sub"><span className="up">↗ +12%</span> this month</div>
          </div>
          <div className="stat-card-icon green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-info">
            <h4>ACTIVE OPERATORS</h4>
            <div className="stat-value">34</div>
            <div className="stat-sub" style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>28 Online</span>
              <span style={{ background: '#f5f3ff', color: '#8b5cf6', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>6 Idle</span>
            </div>
          </div>
          <div className="stat-card-icon blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <h4>PENDING APPROVALS</h4>
            <div className="stat-value">12</div>
            <div className="stat-sub"><span className="down">! Requires Action</span></div>
          </div>
          <div className="stat-card-icon red">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <h4>ADMIN STAFF</h4>
            <div className="stat-value">8</div>
            <div style={{ marginTop: '8px', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: '#2563eb' }} />
            </div>
            <div className="stat-sub" style={{ marginTop: '4px' }}>Full access roles</div>
          </div>
          <div className="stat-card-icon blue">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
           <div className="admin-search-bar" style={{ margin: 0, width: '300px' }}>
              <Search size={16} />
              <input type="text" placeholder="Search users by name..." />
           </div>
           <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-admin-outline" style={{ padding: '6px 14px' }}><Filter size={14} /> Filter</button>
              <button className="btn-admin-outline" style={{ padding: '6px 14px' }}><Download size={14} /> Export</button>
           </div>
        </div>
        
        <table className="admin-table">
          <thead>
            <tr>
              <th>USER</th>
              <th>ROLE</th>
              <th>STATUS</th>
              <th>LAST LOGIN</th>
              <th style={{ textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="user-cell">
                    <img src={`https://ui-avatars.com/api/?name=${u.name}&background=f1f5f9&color=64748b`} alt={u.name} className="user-cell-avatar" />
                    <div className="user-cell-info">
                      <strong>{u.name}</strong>
                      <span>{u.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${u.role.toLowerCase() === 'administrator' ? 'admin' : u.role.toLowerCase()}`}>{u.role}</span>
                </td>
                <td>
                   <div className="status-indicator">
                      <div className={`status-dot ${u.status.toLowerCase()}`}></div>
                      {u.status}
                   </div>
                </td>
                <td>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{u.lastLogin}</span>
                </td>
                <td>
                  <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                    <button className="icon-btn edit"><Pencil size={14} /></button>
                    <button className="icon-btn delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="admin-pagination">
          <span className="pagination-info">Showing 1 to 10 of 1,248 entries</span>
          <div className="pagination-buttons">
            <button className="pagination-btn"><ChevronLeft size={14} /></button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn">2</button>
            <button className="pagination-btn">3</button>
            <span style={{ padding: '0 8px', color: '#94a3b8' }}>...</span>
            <button className="pagination-btn"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick icons
const ChevronLeft = ({size}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const ChevronRight = ({size}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
