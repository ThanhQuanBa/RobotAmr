import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import {
  LayoutDashboard, Users, Route, ShieldCheck, FileText,
  Settings, LogOut, Bell, Bus, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import './AdminLayout.css';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/admin/users', icon: Users, label: 'User Management' },
  { path: '/admin/routes', icon: Route, label: 'Route & POI Editor' },
  { path: '/admin/policies', icon: ShieldCheck, label: 'System Policies' },
  { path: '/admin/logs', icon: FileText, label: 'Audit Logs' },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`admin-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* ---- SIDEBAR ---- */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon-box">
              <Bus size={20} />
            </div>
            <span className="logo-text">System Control</span>
          </div>
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={18} />
              <span className="link-text">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/admin/settings" className="sidebar-link">
            <Settings size={18} />
            <span className="link-text">Settings</span>
          </NavLink>
          <button className="sidebar-link logout-link" onClick={handleLogout}>
            <LogOut size={18} />
            <span className="link-text">Log Out</span>
          </button>
        </div>
      </aside>

      {/* ---- MAIN CONTENT ---- */}
      <div className="admin-main">
        {/* Top Header Bar */}
        <header className="admin-topbar">
          <h1 className="topbar-title">CampusPath Admin</h1>
          <div className="topbar-right">
            <button className="topbar-icon-btn" aria-label="Notifications">
              <Bell size={18} />
              <span className="notif-dot" />
            </button>
            <div className="topbar-avatar">
              <img
                src={`https://ui-avatars.com/api/?name=${user?.username || 'A'}&background=3b82f6&color=fff&size=36`}
                alt="User avatar"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
