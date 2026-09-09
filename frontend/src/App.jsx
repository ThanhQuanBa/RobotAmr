import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import Explore from './pages/campus/Explore';
import CampusLayout from './pages/campus/CampusLayout';
import CampusBooking from './pages/campus/CampusBooking';
import CampusHistory from './pages/campus/CampusHistory';
import CampusLive from './pages/campus/CampusLive';
import TourDetail from './pages/campus/TourDetail';

import AIGuide from './pages/AIGuide';
import Auth from './pages/Auth';

// Admin Pages
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import RouteEditor from './pages/admin/RouteEditor';
import SystemPolicies from './pages/admin/SystemPolicies';
import AuditLogs from './pages/admin/AuditLogs';

import './App.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'visitor' ? '/booking' : '/admin'} replace />;
  }

  return children;
};

function App() {
  const { ready, sessionError, restoreSession } = useAuthStore();
  useEffect(() => { restoreSession(); }, [restoreSession]);
  if (!ready) return <div className="app-recovery" role={sessionError ? 'alert' : 'status'}>
    <h1>CampusPath</h1>
    <p>{sessionError || 'Đang khôi phục phiên đăng nhập…'}</p>
    {sessionError && <button onClick={restoreSession}>Thử lại</button>}
  </div>;
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          {/* Public & Visitor Routes */}
          <Route element={<CampusLayout />}>
            <Route path="/" element={<Explore />} />
            <Route path="/tours/:id" element={<TourDetail />} />
            <Route path="/live" element={<CampusLive />} />
            <Route path="/history" element={<CampusHistory />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/booking" element={<CampusBooking />} />
            <Route path="/guide" element={
              <ProtectedRoute allowedRoles={['visitor']}>
                <AIGuide />
              </ProtectedRoute>
            } />
          </Route>

          {/* Operator/Admin Routes (using AdminLayout) */}
          <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
          
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['operator', 'administrator']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="routes" element={<RouteEditor />} />
            <Route path="policies" element={<SystemPolicies />} />
            <Route path="logs" element={<AuditLogs />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
