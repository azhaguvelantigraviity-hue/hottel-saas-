import React, { useState, useEffect } from 'react';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import * as api from '../services/hotelService';

const CheckInOutPage = () => {
  const [activeTab, setActiveTab] = useState('arrivals'); // 'arrivals' | 'departures'
  const [arrivals, setArrivals] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [arrRes, depRes] = await Promise.all([
        api.getTodayCheckins(),
        api.getTodayCheckouts()
      ]);
      setArrivals(arrRes.data || []);
      setDepartures(depRes.data || []);
    } catch (err) {
      console.error('Failed to load check-ins/outs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async (id) => {
    if (!window.confirm("Confirm check-in for this guest?")) return;
    try {
      await api.checkIn(id);
      fetchData(); // refresh lists
    } catch (err) {
      alert(err.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (id) => {
    if (!window.confirm("Confirm check-out for this guest?")) return;
    try {
      await api.checkOut(id);
      fetchData(); // refresh lists
    } catch (err) {
      alert(err.message || 'Check-out failed');
    }
  };

  const pendingArrivals = arrivals.filter(a => a.status === 'confirmed' || a.status === 'pending');
  const checkedIn = arrivals.filter(a => a.status === 'checked_in');

  const pendingDepartures = departures.filter(d => d.status === 'checked_in');
  const checkedOut = departures.filter(d => d.status === 'checked_out');

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'var(--bg)' }}>
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <MetricCard title="Expected Arrivals" count={pendingArrivals.length} total={arrivals.length} color="var(--blue)" icon="login" />
        <MetricCard title="Checked-In Today" count={checkedIn.length} total={arrivals.length} color="var(--green)" icon="check" />
        <MetricCard title="Expected Departures" count={pendingDepartures.length} total={departures.length} color="var(--amber)" icon="logout" />
        <MetricCard title="Checked-Out Today" count={checkedOut.length} total={departures.length} color="var(--teal)" icon="check" />
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border)' }}>
        <TabButton active={activeTab === 'arrivals'} onClick={() => setActiveTab('arrivals')} label={`Arrivals (${arrivals.length})`} />
        <TabButton active={activeTab === 'departures'} onClick={() => setActiveTab('departures')} label={`Departures (${departures.length})`} />
      </div>

      {/* Data Table */}
      <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>Loading data...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px', color: 'var(--text2)', fontWeight: 600, fontSize: '13px' }}>Guest Name</th>
                <th style={{ padding: '16px', color: 'var(--text2)', fontWeight: 600, fontSize: '13px' }}>Booking ID</th>
                <th style={{ padding: '16px', color: 'var(--text2)', fontWeight: 600, fontSize: '13px' }}>Room</th>
                <th style={{ padding: '16px', color: 'var(--text2)', fontWeight: 600, fontSize: '13px' }}>Status</th>
                <th style={{ padding: '16px', color: 'var(--text2)', fontWeight: 600, fontSize: '13px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'arrivals' ? arrivals : departures).length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>
                    No {activeTab} for today.
                  </td>
                </tr>
              ) : (
                (activeTab === 'arrivals' ? arrivals : departures).map(b => (
                  <tr key={b._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                        {b.guest ? `${b.guest.firstName} ${b.guest.lastName}` : 'Walk-in Guest'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{b.guest?.phone || '-'}</div>
                    </td>
                    <td style={{ padding: '16px', fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text2)' }}>
                      {b.bookingId}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {b.room ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', background: 'var(--surface)', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}>
                          <Icon name="bed" size={14} color="var(--gold)" />
                          {b.room.roomNumber}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text3)' }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <StatusBadge status={b.status} />
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      {activeTab === 'arrivals' ? (
                        b.status === 'checked_in' ? (
                          <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 600 }}>Checked In ✓</span>
                        ) : (
                          <button 
                            onClick={() => handleCheckIn(b._id)}
                            style={{ background: 'var(--green)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                            Check In
                          </button>
                        )
                      ) : (
                        b.status === 'checked_out' ? (
                          <span style={{ fontSize: '13px', color: 'var(--teal)', fontWeight: 600 }}>Checked Out ✓</span>
                        ) : b.status === 'checked_in' ? (
                          <button 
                            onClick={() => handleCheckOut(b._id)}
                            style={{ background: 'var(--rose)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                            Check Out
                          </button>
                        ) : (
                          <span style={{ fontSize: '13px', color: 'var(--text3)' }}>Not Checked-In</span>
                        )
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ title, count, total, color, icon }) => (
  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
      <Icon name={icon} size={24} />
    </div>
    <div>
      <div style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: 600, marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>
        {count} <span style={{ fontSize: '14px', color: 'var(--text3)', fontWeight: 500 }}>/ {total}</span>
      </div>
    </div>
  </div>
);

const TabButton = ({ active, onClick, label }) => (
  <button 
    onClick={onClick}
    style={{
      padding: '12px 24px',
      background: 'transparent',
      border: 'none',
      borderBottom: `2px solid ${active ? 'var(--gold)' : 'transparent'}`,
      color: active ? 'var(--gold)' : 'var(--text2)',
      fontWeight: 600,
      fontSize: '14px',
      cursor: 'pointer',
      marginBottom: '-1px'
    }}
  >
    {label}
  </button>
);

const StatusBadge = ({ status }) => {
  const map = {
    'pending': { color: 'amber', label: 'Pending' },
    'confirmed': { color: 'blue', label: 'Confirmed' },
    'checked_in': { color: 'green', label: 'Checked In' },
    'checked_out': { color: 'teal', label: 'Checked Out' },
    'cancelled': { color: 'rose', label: 'Cancelled' },
  };
  const config = map[status] || { color: 'gray', label: status };
  return <Badge color={config.color} label={config.label} />;
};

export default CheckInOutPage;
