import React, { useState } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import { ROOMS } from '../data/mockData';

const RoomsPage = ({ onNav }) => {
  const [view, setView] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const filtered = filterStatus === 'all' ? ROOMS : ROOMS.filter((r) => r.status === filterStatus);

  const statusColor = { occupied: 'var(--gold)', available: 'var(--green)', reserved: 'var(--violet)', maintenance: 'var(--rose)' };
  const hkColor = { clean: 'var(--green)', dirty: 'var(--rose)', inspect: 'var(--amber)' };

  return (
    <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['all', 'occupied', 'available', 'reserved', 'maintenance'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              padding: '7px 16px',
              borderRadius: '20px',
              border: '1px solid',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              background: filterStatus === s ? statusColor[s] || 'var(--gold)' : 'transparent',
              borderColor: filterStatus === s ? statusColor[s] || 'var(--gold)' : 'var(--border)',
              color: filterStatus === s ? '#000' : 'var(--text2)',
              textTransform: 'capitalize',
            }}
          >
            {s}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setView('grid')}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              background: view === 'grid' ? 'var(--gold)' : 'transparent',
              borderColor: view === 'grid' ? 'var(--gold)' : 'var(--border)',
              color: view === 'grid' ? '#000' : 'var(--text2)',
            }}
          >
            Grid
          </button>
          <button
            onClick={() => setView('list')}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              background: view === 'list' ? 'var(--gold)' : 'transparent',
              borderColor: view === 'list' ? 'var(--gold)' : 'var(--border)',
              color: view === 'list' ? '#000' : 'var(--text2)',
            }}
          >
            List
          </button>
          <button
            onClick={() => onNav && onNav('bookings')}
            style={{
              padding: '7px 14px',
              background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <Icon name="plus" size={12} color="#fff" /> New Booking
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '12px' }}>
          {filtered.map((r) => (
            <div
              key={r.id}
              style={{
                background: 'var(--card)',
                border: `1px solid ${statusColor[r.status]}30`,
                borderRadius: 'var(--radius)',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = statusColor[r.status];
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${statusColor[r.status]}30`;
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, width: '50px', height: '50px', background: `radial-gradient(circle, ${statusColor[r.status]}20, transparent)`, pointerEvents: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span style={{ fontSize: '22px', fontWeight: '900', fontFamily: 'Poppins,sans-serif', color: statusColor[r.status] }}>{r.id}</span>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: hkColor[r.housekeeping], marginTop: '4px' }} />
              </div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text2)', marginBottom: '4px' }}>{r.type}</div>
              <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '8px' }}>Floor {r.floor}</div>
              <Badge color={r.status === 'occupied' ? 'gold' : r.status === 'available' ? 'green' : r.status === 'reserved' ? 'violet' : 'rose'}>{r.status}</Badge>
              {r.guest && <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.guest}</div>}
              <div style={{ marginTop: '8px', fontSize: '12px', fontFamily: 'DM Mono,monospace', color: 'var(--gold)' }}>₹{r.rate.toLocaleString()}/n</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                {['Room', 'Type', 'Floor', 'Status', 'Guest', 'Rate', 'Housekeeping'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.05em' }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 16px', fontFamily: 'DM Mono,monospace', fontWeight: '700', color: statusColor[r.status] }}>{r.id}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{r.type}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text2)' }}>Floor {r.floor}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge color={r.status === 'occupied' ? 'gold' : r.status === 'available' ? 'green' : r.status === 'reserved' ? 'violet' : 'rose'}>{r.status}</Badge>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text2)' }}>{r.guest || '—'}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'DM Mono,monospace', fontSize: '13px' }}>₹{r.rate.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge color={r.housekeeping === 'clean' ? 'green' : r.housekeeping === 'dirty' ? 'rose' : 'amber'}>{r.housekeeping}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
