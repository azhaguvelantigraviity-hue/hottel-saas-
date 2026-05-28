import React from 'react';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import { ROOMS, REVENUE_DATA, BOOKINGS } from '../data/mockData';

const HotelDashboard = ({ plan, onNav }) => {
  const occupied = ROOMS.filter((r) => r.status === 'occupied').length;
  const available = ROOMS.filter((r) => r.status === 'available').length;
  const occupancyPct = Math.round((occupied / ROOMS.length) * 100);

  return (
    <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <StatCard icon="bed" iconColor="#2DD4BF" label="Total Rooms" value={ROOMS.length} sub={`${occupied} occupied`} trend={occupancyPct - 70} />
        <StatCard icon="calendar" iconColor="#A78BFA" label="Today's Bookings" value="6" sub="3 check-ins" trend={20} />
        <StatCard icon="dollar" iconColor="#C9A84C" label="Today's Revenue" value="₹54.2K" sub="vs ₹48K yesterday" trend={12} />
        <StatCard icon="users" iconColor="#34D399" label="Staff On Duty" value="24" sub="4 departments" />
      </div>

      {/* Occupancy + Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '28px' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', gridColumn: 'span 1' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>Room Status</div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {[
              { label: 'Occupied', count: occupied, color: 'var(--gold)' },
              { label: 'Available', count: available, color: 'var(--green)' },
              { label: 'Reserved', count: ROOMS.filter((r) => r.status === 'reserved').length, color: 'var(--violet)' },
              { label: 'Maintenance', count: ROOMS.filter((r) => r.status === 'maintenance').length, color: 'var(--rose)' },
            ].map((s) => (
              <div key={s.label} style={{ flex: 1, background: 'var(--surface)', borderRadius: '8px', padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: s.color, fontFamily: 'DM Mono,monospace' }}>{s.count}</div>
                <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ height: '8px', background: 'var(--surface)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ height: '100%', width: `${(occupied / ROOMS.length) * 100}%`, background: 'var(--gold)' }} />
            <div style={{ height: '100%', width: `${(available / ROOMS.length) * 100}%`, background: 'var(--green)' }} />
            <div style={{ height: '100%', width: `${(ROOMS.filter((r) => r.status === 'reserved').length / ROOMS.length) * 100}%`, background: 'var(--violet)' }} />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '8px', textAlign: 'center' }}>{occupancyPct}% occupancy rate</div>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Revenue (7 days)</div>
          <div style={{ height: '120px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            {REVENUE_DATA.slice(-7).map((d, i) => {
              const max = 124000;
              const pct = d.revenue / max;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '100%', borderRadius: '3px 3px 0 0', height: `${pct * 100}px`, background: i === 6 ? 'linear-gradient(180deg,#C9A84C,#8A6F2E)' : 'rgba(201,168,76,0.3)' }} />
                  <div style={{ fontSize: '10px', color: 'var(--text3)' }}>{d.month}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Housekeeping</div>
          {[
            { label: 'Clean', count: ROOMS.filter((r) => r.housekeeping === 'clean').length, color: 'var(--green)' },
            { label: 'Dirty', count: ROOMS.filter((r) => r.housekeeping === 'dirty').length, color: 'var(--rose)' },
            { label: 'Inspect', count: ROOMS.filter((r) => r.housekeeping === 'inspect').length, color: 'var(--amber)' },
          ].map((s) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text2)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
                {s.label}
              </div>
              <span style={{ fontSize: '14px', fontWeight: '700', color: s.color, fontFamily: 'DM Mono,monospace' }}>{s.count}</span>
            </div>
          ))}
          <button style={{ width: '100%', marginTop: '8px', padding: '8px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: '6px', color: 'var(--green)', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
            Assign Tasks
          </button>
        </div>
      </div>

      {/* Recent Bookings */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ fontSize: '15px', fontWeight: '700' }}>Recent Bookings</div>
          <button onClick={() => onNav && onNav('bookings')} style={{ fontSize: '13px', color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Inter, sans-serif' }}>
            All Bookings <Icon name="arrow" size={14} color="var(--gold)" />
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Booking ID', 'Guest', 'Room', 'Check-in', 'Check-out', 'Amount', 'Source', 'Status'].map((h) => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.05em' }}>
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BOOKINGS.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '11px 10px', fontSize: '12px', fontFamily: 'DM Mono,monospace', color: 'var(--gold)' }}>{b.id}</td>
                <td style={{ padding: '11px 10px', fontSize: '13px', fontWeight: '600' }}>{b.guest}</td>
                <td style={{ padding: '11px 10px', fontSize: '12px', color: 'var(--text2)' }}>{b.room}</td>
                <td style={{ padding: '11px 10px', fontSize: '12px', color: 'var(--text2)' }}>{b.checkIn}</td>
                <td style={{ padding: '11px 10px', fontSize: '12px', color: 'var(--text2)' }}>{b.checkOut}</td>
                <td style={{ padding: '11px 10px', fontSize: '13px', fontFamily: 'DM Mono,monospace' }}>₹{b.amount.toLocaleString()}</td>
                <td style={{ padding: '11px 10px' }}>
                  <Badge color={b.source === 'direct' ? 'gold' : b.source === 'booking.com' ? 'teal' : 'violet'}>{b.source}</Badge>
                </td>
                <td style={{ padding: '11px 10px' }}>
                  <Badge color={b.status === 'checked-in' ? 'green' : 'amber'}>{b.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HotelDashboard;
