import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import Toast from '../components/Toast';
import { 
  getRooms, getRevenueDashboard, getBookings,
  getTodayCheckins, getTodayCheckouts,
  getPendingPayments, getMaintenanceRooms,
  updateHousekeeping
} from '../services/hotelService';

const HotelDashboard = ({ plan, onNav }) => {
  const [rooms, setRooms] = useState([]);
  const [revenueData, setRevenueData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [checkouts, setCheckouts] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchAllData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const [
        roomsRes, revenueRes, bookingsRes, 
        checkinsRes, checkoutsRes, pendingRes, maintenanceRes
      ] = await Promise.all([
        getRooms(),
        getRevenueDashboard(),
        getBookings({ limit: 10 }),
        getTodayCheckins(),
        getTodayCheckouts(),
        getPendingPayments(),
        getMaintenanceRooms()
      ]);

      setRooms(roomsRes.data || []);
      setRevenueData(revenueRes.data || null);
      setBookings(bookingsRes.data || []);
      setCheckins(checkinsRes.data || []);
      setCheckouts(checkoutsRes.data || []);
      setPendingPayments(pendingRes.data || []);
      setMaintenance(maintenanceRes.data || []);
    } catch (err) {
      console.error(err);
      if (!isBackground) setError(err.message || 'Failed to load dashboard data');
      else setToast({ type: 'error', message: 'Auto-refresh failed' });
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => fetchAllData(true), 60000); // 60s polling
    return () => clearInterval(interval);
  }, []);

  const handleHousekeepingChange = async (roomId, status) => {
    try {
      await updateHousekeeping(roomId, status);
      setToast({ type: 'success', message: 'Room status updated' });
      fetchAllData(true); // refresh in background
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Update failed' });
    }
  };

  if (loading) {
    return <div style={{ padding: 'clamp(16px, 4vw, 32px)' }}>Loading dashboard...</div>;
  }

  if (error) {
    return <div style={{ padding: 'clamp(16px, 4vw, 32px)', color: 'red' }}>Error: {error}</div>;
  }

  const occupied = rooms.filter((r) => r.status === 'occupied').length;
  const available = rooms.filter((r) => r.status === 'available').length;
  const occupancyPct = rooms.length > 0 ? Math.round((occupied / rooms.length) * 100) : 0;

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px)', overflowY: 'auto', flex: 1 }}>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatCard icon="bed" iconColor="#2DD4BF" label="Total Rooms" value={rooms.length} sub={`${occupied} occupied`} trend={0} />
        <StatCard icon="calendar" iconColor="#A78BFA" label="Today's Check-ins" value={checkins.length} sub={`${checkouts.length} check-outs`} trend={0} />
        <StatCard icon="dollar" iconColor="#C9A84C" label="Today's Revenue" value={`₹${revenueData?.today?.revenue?.toLocaleString() || 0}`} sub={`${revenueData?.month?.revenue ? `₹${revenueData.month.revenue.toLocaleString()} this month` : '-'}`} trend={0} />
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
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Housekeeping Status</div>
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {rooms.map(r => (
                  <tr key={r._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 0', fontSize: '13px' }}>Room {r.roomNumber}</td>
                    <td style={{ padding: '8px 0', textAlign: 'right' }}>
                      <select 
                        value={r.housekeepingStatus || 'clean'} 
                        onChange={(e) => handleHousekeepingChange(r._id, e.target.value)}
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
                    <span>{p.bookingId} - {p.guest?.firstName}</span>
                    <span style={{ color: 'var(--rose)', fontWeight: '600' }}>₹{p.totalAmount - p.paidAmount}</span>
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
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                    <td style={{ padding: '10px 0' }}><Badge color={c.status === 'checked_in' ? 'green' : 'amber'}>{c.status}</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Today's Check-outs */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Today's Check-outs</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                    <td style={{ padding: '10px 0' }}><Badge color={c.status === 'checked_out' ? 'gray' : 'amber'}>{c.status}</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {/* Room Maintenance */}
        {maintenance.length > 0 && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)' }}>
            <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: 'var(--amber)' }}>Maintenance Tracking</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
        )}

        {/* Recent Bookings */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ fontSize: '15px', fontWeight: '700' }}>Recent Bookings</div>
            <button onClick={() => onNav && onNav('bookings')} style={{ fontSize: '13px', color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Inter, sans-serif' }}>
              All Bookings <Icon name="arrow" size={14} color="var(--gold)" />
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Booking ID', 'Guest', 'Room', 'Check-in', 'Check-out', 'Amount', 'Status'].map((h) => (
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
                  <td style={{ padding: '11px 10px', fontSize: '12px', color: 'var(--text2)' }}>{new Date(b.checkIn).toLocaleDateString()}</td>
                  <td style={{ padding: '11px 10px', fontSize: '12px', color: 'var(--text2)' }}>{new Date(b.checkOut).toLocaleDateString()}</td>
                  <td style={{ padding: '11px 10px', fontSize: '13px', fontFamily: 'DM Mono,monospace' }}>₹{b.totalAmount?.toLocaleString()}</td>
                  <td style={{ padding: '11px 10px' }}>
                    <Badge color={b.status === 'checked_in' ? 'green' : 'amber'}>{b.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default HotelDashboard;
