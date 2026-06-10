import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import Toast from '../components/Toast';
import { getHotelDashboard, updateHousekeeping } from '../services/hotelService';
import { useNotifications } from '../context/NotificationContext';

// ── Skeleton Components ──────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--surface)', animation: 'pulse 1.5s infinite' }} />
    <div style={{ flex: 1 }}>
      <div style={{ width: '60%', height: '14px', background: 'var(--surface)', borderRadius: '4px', marginBottom: '8px', animation: 'pulse 1.5s infinite' }} />
      <div style={{ width: '40%', height: '24px', background: 'var(--surface)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
    </div>
  </div>
);

const SkeletonTable = () => (
  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px' }}>
    <div style={{ width: '150px', height: '20px', background: 'var(--surface)', borderRadius: '4px', marginBottom: '20px', animation: 'pulse 1.5s infinite' }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[1,2,3].map(i => <div key={i} style={{ width: '100%', height: '40px', background: 'var(--surface)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />)}
    </div>
  </div>
);

// ── Memoized Housekeeping Table ──────────────────────────────────────
const HousekeepingTable = memo(({ rooms, onHousekeepingChange }) => (
  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)' }}>
    <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Housekeeping Status</div>
    <div style={{ maxHeight: '150px' }} className="table-responsive-wrapper">
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '300px' }}>
        <tbody>
          {rooms.map(r => (
            <tr key={r._id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 0', fontSize: '13px' }}>Room {r.roomNumber}</td>
              <td style={{ padding: '8px 0', textAlign: 'right' }}>
                <select 
                  value={r.housekeepingStatus || 'clean'} 
                  onChange={(e) => onHousekeepingChange(r._id, e.target.value)}
                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '12px' }}
                >
                  <option value="clean">Clean</option>
                  <option value="dirty">Dirty</option>
                  <option value="in-progress">In Progress</option>
                  <option value="inspect">Inspect</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
));

const HotelDashboard = ({ plan, onNav }) => {
  const [data, setData] = useState({
    rooms: [],
    revenueData: null,
    bookings: [],
    checkins: [],
    checkouts: [],
    pendingPayments: [],
    maintenance: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const { socket } = useNotifications();

  const fetchDashboardData = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground && !data.rooms.length) setLoading(true);
      const res = await getHotelDashboard();
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      if (!isBackground) setError(err.message || 'Failed to load dashboard data');
      else setToast({ type: 'error', message: 'Auto-refresh failed' });
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [data.rooms.length]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(true), 60000); // 60s polling
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  useEffect(() => {
    if (socket) {
      const handleStatusUpdate = (updateData) => {
        setData(prev => ({
          ...prev,
          rooms: prev.rooms.map(r => {
            if (r._id === updateData.roomId || r.id === updateData.roomId) {
              return { ...r, status: updateData.status, housekeepingStatus: updateData.housekeepingStatus || r.housekeepingStatus };
            }
            return r;
          })
        }));
      };
      socket.on('roomStatusUpdated', handleStatusUpdate);
      return () => socket.off('roomStatusUpdated', handleStatusUpdate);
    }
  }, [socket]);

  const handleHousekeepingChange = useCallback(async (roomId, status) => {
    try {
      await updateHousekeeping(roomId, status);
      setToast({ type: 'success', message: 'Room status updated' });
      
      // Optimistic update
      setData(prev => ({
        ...prev,
        rooms: prev.rooms.map(r => r._id === roomId ? { ...r, housekeepingStatus: status } : r)
      }));
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Update failed' });
    }
  }, []);

  const { occupied, available, occupancyPct } = useMemo(() => {
    const occ = data.rooms.filter((r) => r.status === 'occupied').length;
    const avail = data.rooms.filter((r) => r.status === 'available').length;
    const pct = data.rooms.length > 0 ? Math.round((occ / data.rooms.length) * 100) : 0;
    return { occupied: occ, available: avail, occupancyPct: pct };
  }, [data.rooms]);

  if (loading) {
    return (
      <div style={{ padding: 'clamp(16px, 4vw, 32px)', overflowY: 'auto', flex: 1 }}>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px', marginBottom: '28px' }}>
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px', marginBottom: '28px' }}>
          <SkeletonTable /><SkeletonTable /><SkeletonTable />
        </div>
      </div>
    );
  }

  if (error) {
    return <div style={{ padding: 'clamp(16px, 4vw, 32px)', color: 'red' }}>Error: {error}</div>;
  }

  const { rooms, revenueData, bookings, checkins, checkouts, pendingPayments, maintenance } = data;

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px)', overflowY: 'auto', flex: 1 }}>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatCard icon="bed" iconColor="#2DD4BF" label="Total Rooms" value={rooms.length} sub={`${occupied} occupied`} trend={0} />
        <StatCard icon="calendar" iconColor="#A78BFA" label="Today's Check-ins" value={checkins.length} sub={`${checkouts.length} check-outs`} trend={0} />
        <StatCard icon="dollar" iconColor="#C9A84C" label="Today's Revenue" value={`₹${revenueData?.today?.revenue?.toLocaleString() || 0}`} sub={`${revenueData?.month?.revenue ? \`₹${revenueData.month.revenue.toLocaleString()} this month\` : '-'}`} trend={0} />
        <StatCard icon="users" iconColor="#34D399" label="Pending Payments" value={pendingPayments.length} sub="Requires attention" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Occupancy */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)', gridColumn: 'span 1' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>Occupancy Rate</div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <div style={{ flex: 1, background: 'var(--surface)', borderRadius: '8px', padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--gold)', fontFamily: 'DM Mono,monospace' }}>{occupied}</div>
              <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>Occupied</div>
            </div>
            <div style={{ flex: 1, background: 'var(--surface)', borderRadius: '8px', padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--green)', fontFamily: 'DM Mono,monospace' }}>{available}</div>
              <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>Available</div>
            </div>
          </div>
          <div style={{ height: '8px', background: 'var(--surface)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ height: '100%', width: `${occupancyPct}%`, background: 'var(--gold)' }} />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '8px', textAlign: 'center' }}>{occupancyPct}% occupancy rate</div>
        </div>

        {/* Housekeeping */}
        <HousekeepingTable rooms={rooms} onHousekeepingChange={handleHousekeepingChange} />

        {/* Pending Payments Alert */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: 'var(--rose)' }}>Payment Alerts</div>
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {pendingPayments.length === 0 ? (
              <div style={{ fontSize: '13px', color: 'var(--text3)' }}>No pending payments.</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {pendingPayments.map(p => (
                  <li key={p._id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>{p.bookingId} - {p.guestName || p.guest?.firstName || 'Guest'}</span>
                    <span style={{ color: 'var(--rose)', fontWeight: '600' }}>₹{p.totalAmount - (p.paidAmount || 0)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', marginBottom: '28px' }}>
         {/* Today's Check-ins */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Today's Check-ins</div>
          <div className="table-responsive-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '11px', color: 'var(--text3)' }}>GUEST</th>
                  <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '11px', color: 'var(--text3)' }}>ROOM</th>
                  <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '11px', color: 'var(--text3)' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {checkins.length === 0 ? (
                  <tr><td colSpan="3" style={{ padding: '16px 0', color: 'var(--text3)', fontSize: '13px' }}>No check-ins today</td></tr>
                ) : (
                  checkins.map(c => (
                    <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 0', fontSize: '13px', fontWeight: '600' }}>{c.guest?.firstName} {c.guest?.lastName}</td>
                      <td style={{ padding: '10px 0', fontSize: '13px' }}>{c.room?.roomNumber}</td>
                      <td style={{ padding: '10px 0' }}><Badge color={c.status === 'checked-in' || c.status === 'checked_in' ? 'green' : 'amber'}>{c.status}</Badge></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Check-outs */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Today's Check-outs</div>
          <div className="table-responsive-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '11px', color: 'var(--text3)' }}>GUEST</th>
                  <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '11px', color: 'var(--text3)' }}>ROOM</th>
                  <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '11px', color: 'var(--text3)' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {checkouts.length === 0 ? (
                  <tr><td colSpan="3" style={{ padding: '16px 0', color: 'var(--text3)', fontSize: '13px' }}>No check-outs today</td></tr>
                ) : (
                  checkouts.map(c => (
                    <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 0', fontSize: '13px', fontWeight: '600' }}>{c.guest?.firstName} {c.guest?.lastName}</td>
                      <td style={{ padding: '10px 0', fontSize: '13px' }}>{c.room?.roomNumber}</td>
                      <td style={{ padding: '10px 0' }}><Badge color={c.status === 'checked-out' || c.status === 'checked_out' ? 'gray' : 'amber'}>{c.status}</Badge></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {/* Room Maintenance */}
        {maintenance.length > 0 && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)' }}>
            <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: 'var(--amber)' }}>Maintenance Tracking</div>
            <div className="table-responsive-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '11px', color: 'var(--text3)' }}>ROOM</th>
                    <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '11px', color: 'var(--text3)' }}>ISSUE</th>
                    <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '11px', color: 'var(--text3)' }}>EXPECTED COMPLETION</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenance.map(m => (
                    <tr key={m._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 0', fontSize: '13px', fontWeight: '600' }}>Room {m.roomNumber}</td>
                      <td style={{ padding: '10px 0', fontSize: '13px' }}>{m.maintenanceIssue || 'Under Maintenance'}</td>
                      <td style={{ padding: '10px 0', fontSize: '13px', color: 'var(--text2)' }}>
                        {m.expectedCompletion ? new Date(m.expectedCompletion).toLocaleDateString() : 'TBD'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Bookings */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ fontSize: '15px', fontWeight: '700' }}>Recent Bookings</div>
            <button onClick={() => onNav && onNav('bookings')} style={{ fontSize: '13px', color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Inter, sans-serif' }}>
              All Bookings <Icon name="arrow" size={14} color="var(--gold)" />
            </button>
          </div>
          <div className="table-responsive-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Booking ID', 'Guest', 'Room', 'Check-in', 'Check-out', 'Stay Days', 'Status'].map((h) => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.05em' }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '11px 10px', fontSize: '12px', fontFamily: 'DM Mono,monospace', color: 'var(--gold)' }}>{b.bookingId}</td>
                    <td style={{ padding: '11px 10px', fontSize: '13px', fontWeight: '600' }}>{b.guest?.firstName} {b.guest?.lastName}</td>
                    <td style={{ padding: '11px 10px', fontSize: '12px', color: 'var(--text2)' }}>{b.room?.roomNumber}</td>
                    <td style={{ padding: '11px 10px', fontSize: '12px', color: 'var(--text2)' }}>{b.checkInDateTime ? new Date(b.checkInDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : new Date(b.checkIn).toLocaleDateString()}</td>
                    <td style={{ padding: '11px 10px', fontSize: '12px', color: 'var(--text2)' }}>{b.checkOutDateTime ? new Date(b.checkOutDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : new Date(b.checkOut).toLocaleDateString()}</td>
                    <td style={{ padding: '11px 10px', fontSize: '13px', fontFamily: 'DM Mono,monospace' }}>{b.stayDays || b.nights || 1} Days</td>
                    <td style={{ padding: '11px 10px' }}>
                      <Badge color={b.status === 'checked-in' || b.status === 'checked_in' ? 'green' : 'amber'}>{b.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HotelDashboard;
