import { useState, useEffect } from 'react';
import { CalendarDays, Trash2, Filter, RefreshCw, User, MapPin, Clock } from 'lucide-react';
import './AdminRoutes.css'; // Shared styles

const API = window.location.origin;

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const res = await fetch(`${API}/api/bookings`);
    const data = await res.json();
    setBookings(data);
  };

  const updateStatus = async (id, status) => {
    await fetch(`${API}/api/bookings/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchBookings();
  };

  const deleteBooking = async (id) => {
    if (!window.confirm('Delete this booking permanently?')) return;
    await fetch(`${API}/api/bookings/${id}`, { method: 'DELETE' });
    fetchBookings();
  };

  const filters = ['ALL', 'PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  const filteredBookings = filter === 'ALL'
    ? bookings
    : bookings.filter(b => b.status === filter);

  const getStatusClass = (status) => {
    const map = {
      PENDING: 'pending',
      SCHEDULED: 'scheduled',
      IN_PROGRESS: 'in_progress',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled'
    };
    return map[status] || '';
  };

  return (
    <div className="page-container admin-bookings">
      <div className="admin-header">
        <div>
          <h2><CalendarDays size={24} /> Booking Management</h2>
          <p>View and manage all visitor tour bookings.</p>
        </div>
        <button className="btn btn-outline" onClick={fetchBookings}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <Filter size={16} style={{ color: 'var(--text-muted)' }} />
        {filters.map(f => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? `All (${bookings.length})` : `${f} (${bookings.filter(b => b.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="glass-panel table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Visitor</th>
              <th>Route</th>
              <th>Time Slot</th>
              <th>Status</th>
              <th>Booked At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(b => (
              <tr key={b.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={14} color="var(--text-muted)" />
                    <strong>{b.visitorName}</strong>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} color="var(--primary)" />
                    {b.route?.name || 'Unknown'}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} color="var(--text-muted)" />
                    {b.timeSlot}
                  </div>
                </td>
                <td>
                  <span className={`status-tag ${getStatusClass(b.status)}`}>{b.status}</span>
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {new Date(b.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </td>
                <td>
                  <div className="table-actions">
                    {b.status === 'PENDING' && (
                      <button className="icon-btn edit" title="Approve" onClick={() => updateStatus(b.id, 'SCHEDULED')}>✓</button>
                    )}
                    {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                      <button className="icon-btn delete" title="Cancel" onClick={() => updateStatus(b.id, 'CANCELLED')}>✕</button>
                    )}
                    <button className="icon-btn delete" title="Delete" onClick={() => deleteBooking(b.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredBookings.length === 0 && (
              <tr><td colSpan="6" className="empty-row">No bookings found for this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
