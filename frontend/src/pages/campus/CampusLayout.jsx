import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Bot, Bell, LogOut, ArrowUpRight, Globe, Mail, Menu, X } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import './Campus.css';

export default function CampusLayout() {
  const { user, logout } = useAuthStore();
  const [menu, setMenu] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); setMenu(false); setNotifications(false); }, [pathname]);
  return <div className="campus-app">
    <header className="cp-header"><div className="cp-header-inner">
      <Link to="/" className="cp-brand"><Bot size={26} strokeWidth={1.7} /> CampusPath<span className="cp-brand-dot">.</span></Link>
      <nav className={menu ? 'cp-nav open' : 'cp-nav'} aria-label="Main navigation">
        <NavLink to="/" end>Explore</NavLink><NavLink to="/booking">Book Tour</NavLink><NavLink to="/live">Live Track</NavLink><NavLink to="/history">History</NavLink><NavLink to="/guide">AI Guide</NavLink>
      </nav>
      <div className="cp-account">
        <button className="cp-icon" aria-label="Notifications" aria-expanded={notifications} onClick={() => setNotifications(!notifications)}><Bell size={18} /></button>
        {notifications && <div className="cp-notifications"><strong>You're all caught up</strong><p>Tour updates will appear on the Live Track page.</p><Link to="/live">View live tour <ArrowUpRight size={14} /></Link></div>}
        {user ? <><span className="cp-avatar" title={user.username}>{user.username.slice(0, 2).toUpperCase()}</span><button className="cp-icon" aria-label="Sign out" onClick={logout}><LogOut size={17} /></button></> : <Link className="cp-signin" to="/login">Sign in <span className="cp-avatar">CP</span></Link>}
        <button className="cp-icon cp-menu" aria-label="Toggle navigation" aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X size={22} /> : <Menu size={22} />}</button>
      </div>
    </div></header>
    <main className="cp-main"><Outlet /></main>
    <footer className="cp-footer"><div className="cp-footer-grid">
      <div><Link to="/" className="cp-brand"><Bot size={25} /> CampusPath</Link><p>Pioneering the future of autonomous<br />campus mobility with safety and<br />accessibility at our core.</p></div>
      <div><h4>Platform</h4><Link to="/tours/campus">Features</Link><Link to="/tours/campus#logistics">Safety</Link><Link to="/">Explore</Link></div>
      <div><h4>Your campus</h4><Link to="/booking">Book a tour</Link><Link to="/live">Live tracking</Link><Link to="/guide">Ask your AI guide</Link></div>
      <div><h4>Your journey</h4><Link to="/history">Tour history</Link><Link to="/login">Your account</Link><Link to="/tours/campus#logistics">Accessibility</Link></div>
    </div><div className="cp-footer-bottom"><span>© {new Date().getFullYear()} CampusPath. All rights reserved.</span><div><Globe size={16} /><Bot size={16} /><Mail size={16} /></div></div></footer>
  </div>;
}
