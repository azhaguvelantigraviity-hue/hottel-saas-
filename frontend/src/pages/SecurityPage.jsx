import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';

const STORAGE_KEY = 'hms_security';

const DEFAULT = {
  cameras: [
    { id: 'CAM-01', location: 'Main Entrance', status: 'live', type: 'Dome 4K', lastMotion: '2 min ago', recording: true },
    { id: 'CAM-02', location: 'Lobby', status: 'live', type: 'Bullet 4K', lastMotion: '8 min ago', recording: true },
    { id: 'CAM-03', location: 'Parking Lot', status: 'live', type: 'PTZ 2K', lastMotion: '1 hr ago', recording: true },
    { id: 'CAM-04', location: 'Restaurant', status: 'live', type: 'Dome 2K', lastMotion: '30 sec ago', recording: true },
    { id: 'CAM-05', location: 'Pool Area', status: 'live', type: 'Bullet 4K', lastMotion: '15 min ago', recording: true },
    { id: 'CAM-06', location: 'Back Office', status: 'offline', type: 'Dome 2K', lastMotion: 'N/A', recording: false },
    { id: 'CAM-07', location: 'Corridor – Floor 1', status: 'live', type: 'Bullet 2K', lastMotion: '5 min ago', recording: true },
    { id: 'CAM-08', location: 'Corridor – Floor 2', status: 'live', type: 'Bullet 2K', lastMotion: '12 min ago', recording: true },
  ],
  visitors: [
    { id: 'VIS-001', name: 'Rajesh Kumar', purpose: 'Vendor Meeting', host: 'Priya Sharma', checkIn: '09:15 AM', checkOut: '10:45 AM', idVerified: true, phone: '9876500001', vehicle: 'MH-01-AB-1234' },
    { id: 'VIS-002', name: 'Sneha Patel', purpose: 'Interview', host: 'Amit Verma', checkIn: '10:30 AM', checkOut: '11:45 AM', idVerified: true, phone: '9876500002', vehicle: '' },
    { id: 'VIS-003', name: 'Vikram Joshi', purpose: 'Guest', host: 'Deepa Nair (Room 203)', checkIn: '12:00 PM', checkOut: '', idVerified: false, phone: '9876500003', vehicle: 'MH-02-CD-5678' },
    { id: 'VIS-004', name: 'Ananya Reddy', purpose: 'Food Delivery', host: 'Kitchen', checkIn: '12:30 PM', checkOut: '12:45 PM', idVerified: false, phone: '9876500004', vehicle: '' },
    { id: 'VIS-005', name: 'Rohit Mehta', purpose: 'Maintenance', host: 'Housekeeping', checkIn: '02:00 PM', checkOut: '04:30 PM', idVerified: true, phone: '9876500005', vehicle: '' },
    { id: 'VIS-006', name: 'Kavita Sharma', purpose: 'Event Planning', host: 'Events Team', checkIn: '03:00 PM', checkOut: '', idVerified: true, phone: '9876500006', vehicle: 'MH-03-EF-9012' },
    { id: 'VIS-007', name: 'Arun Singh', purpose: 'Guest', host: 'Ravi Gupta (Room 102)', checkIn: '05:15 PM', checkOut: '07:30 PM', idVerified: true, phone: '9876500007', vehicle: '' },
    { id: 'VIS-008', name: 'Neha Kapoor', purpose: 'Personal Visit', host: 'Manager Office', checkIn: '06:00 PM', checkOut: '', idVerified: false, phone: '9876500008', vehicle: 'MH-04-GH-3456' },
  ],
  activities: [
    { id: 'ACT-001', type: 'login', action: 'Staff Login', detail: 'User logged in from Lobby Terminal', user: 'Reception', ip: '192.168.1.42', time: '08:02 AM' },
    { id: 'ACT-002', type: 'system', action: 'Door Access', detail: 'Back Office door unlocked — Keycard #2042', user: 'System', ip: '192.168.1.1', time: '08:15 AM' },
    { id: 'ACT-003', type: 'booking', action: 'New Booking', detail: 'Room 304 booked by walk-in guest', user: 'Priya S.', ip: '192.168.1.42', time: '09:30 AM' },
    { id: 'ACT-004', type: 'housekeeping', action: 'Room Status Change', detail: 'Room 205 marked as Inspected', user: 'Housekeeping', ip: '192.168.1.55', time: '10:00 AM' },
    { id: 'ACT-005', type: 'payment', action: 'Payment Processed', detail: 'Invoice #INV-024 paid – ₹12,500', user: 'Cashier', ip: '192.168.1.60', time: '11:15 AM' },
    { id: 'ACT-006', type: 'login', action: 'Staff Logout', detail: 'User logged out from Lobby Terminal', user: 'Reception', ip: '192.168.1.42', time: '12:00 PM' },
    { id: 'ACT-007', type: 'system', action: 'Motion Alert', detail: 'Motion detected at Parking Lot after hours', user: 'System', ip: '192.168.1.1', time: '01:45 AM' },
    { id: 'ACT-008', type: 'booking', action: 'Booking Cancelled', detail: 'Room 108 cancelled — refund requested', user: 'Amit V.', ip: '192.168.1.42', time: '02:20 PM' },
    { id: 'ACT-009', type: 'housekeeping', action: 'Maintenance Request', detail: 'AC repair requested for Room 402', user: 'Maintenance', ip: '192.168.1.55', time: '03:00 PM' },
    { id: 'ACT-010', type: 'payment', action: 'Refund Issued', detail: 'Refund processed – ₹4,500', user: 'Cashier', ip: '192.168.1.60', time: '04:30 PM' },
    { id: 'ACT-011', type: 'system', action: 'Firmware Update', detail: 'Camera CAM-03 firmware updated to v2.4.1', user: 'System', ip: '192.168.1.1', time: '05:00 PM' },
    { id: 'ACT-012', type: 'login', action: 'Remote Access', detail: 'Admin dashboard accessed from external IP', user: 'Admin', ip: '203.0.113.42', time: '06:45 PM' },
  ],
  sessions: [
    { id: 'SES-01', device: 'Chrome – Windows', location: 'Lobby Reception PC', lastActive: 'Just now', current: true, browser: 'Chrome 125', ip: '192.168.1.42' },
    { id: 'SES-02', device: 'Safari – macOS', location: 'Manager Cabin', lastActive: '2 hours ago', current: false, browser: 'Safari 18', ip: '192.168.1.100' },
    { id: 'SES-03', device: 'Chrome – Android', location: 'Remote – Mumbai', lastActive: 'Yesterday at 8:15 PM', current: false, browser: 'Chrome Mobile 124', ip: '203.0.113.50' },
    { id: 'SES-04', device: 'Firefox – Linux', location: 'IT Server Room', lastActive: '3 days ago', current: false, browser: 'Firefox 127', ip: '192.168.1.10' },
    { id: 'SES-05', device: 'Safari – iOS', location: 'Remote – Delhi', lastActive: '5 days ago', current: false, browser: 'Mobile Safari 18', ip: '198.51.100.75' },
  ],
};

const loadData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { ...DEFAULT, cameras: DEFAULT.cameras.map(c => ({ ...c })), visitors: DEFAULT.visitors.map(v => ({ ...v })), activities: DEFAULT.activities.map(a => ({ ...a })), sessions: DEFAULT.sessions.map(s => ({ ...s })) };
};

const TABS = ['CCTV Feeds', 'Visitor Log', 'Activity Logs', '2FA Settings', 'Device Sessions'];
const actColor = { login: 'var(--teal)', booking: 'var(--gold)', housekeeping: 'var(--violet)', payment: 'var(--green)', system: 'var(--rose)' };
const thStyle = { padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text3)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' };
const tdStyle = { padding: '12px 14px', fontSize: 13, color: 'var(--text2)', borderBottom: '1px solid var(--border)' };

const SecurityPage = () => {
  const [data, setData] = useState(loadData);
  const [tab, setTab] = useState(0);
  const [twoFA, setTwoFA] = useState(true);
  const [showAddCamera, setShowAddCamera] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [newCamera, setNewCamera] = useState({ location: '', type: 'Dome 4K' });
  const [newVisitor, setNewVisitor] = useState({ name: '', purpose: '', host: '', phone: '', vehicle: '', idVerified: false });
  const [visitorFilter, setVisitorFilter] = useState('all');
  const [actFilter, setActFilter] = useState('all');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const persist = (key, arr) => {
    setData(prev => ({ ...prev, [key]: arr }));
  };

  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const cameras = data.cameras;
  const visitors = data.visitors;
  const activities = data.activities;
  const sessions = data.sessions;

  const liveCameras = cameras.filter(c => c.status === 'live').length;
  const visitorsToday = visitors.length;
  const insideVisitors = visitors.filter(v => !v.checkOut).length;

  const stats = [
    { label: 'Cameras Online', value: `${liveCameras}/${cameras.length}`, icon: 'camera', iconColor: liveCameras === cameras.length ? 'var(--green)' : 'var(--amber)' },
    { label: 'Visitors Today', value: visitorsToday, icon: 'users', iconColor: 'var(--teal)', sub: `${insideVisitors} still inside` },
    { label: 'Activity Events', value: activities.length, icon: 'shield', iconColor: 'var(--violet)' },
    { label: 'Active Sessions', value: sessions.filter(s => s.current).length, icon: 'security', iconColor: 'var(--gold)' },
  ];

  const addCamera = () => {
    if (!newCamera.location.trim()) return;
    const id = `CAM-${String(cameras.length + 1).padStart(3, '0')}`;
    const cam = { id, location: newCamera.location, status: 'live', type: newCamera.type, lastMotion: 'Just now', recording: true };
    persist('cameras', [...cameras, cam]);
    setNewCamera({ location: '', type: 'Dome 4K' });
    setShowAddCamera(false);
  };

  const toggleCameraStatus = (id) => {
    persist('cameras', cameras.map(c => c.id === id ? { ...c, status: c.status === 'live' ? 'offline' : 'live', recording: c.status !== 'live' } : c));
  };

  const deleteCamera = (id) => {
    persist('cameras', cameras.filter(c => c.id !== id));
  };

  const checkInVisitor = () => {
    if (!newVisitor.name.trim() || !newVisitor.purpose.trim() || !newVisitor.host.trim()) return;
    const id = `VIS-${String(visitors.length + 1).padStart(3, '0')}`;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const visitor = { id, ...newVisitor, checkIn: time, checkOut: '' };
    persist('visitors', [visitor, ...visitors]);
    setNewVisitor({ name: '', purpose: '', host: '', phone: '', vehicle: '', idVerified: false });
    setShowCheckIn(false);
  };

  const checkOutVisitor = (id) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    persist('visitors', visitors.map(v => v.id === id ? { ...v, checkOut: time } : v));
  };

  const deleteVisitor = (id) => {
    persist('visitors', visitors.filter(v => v.id !== id));
  };

  const revokeSession = (id) => {
    persist('sessions', sessions.filter(s => s.id !== id));
  };

  const filteredVisitors = visitors.filter(v => {
    if (visitorFilter === 'inside') return !v.checkOut;
    if (visitorFilter === 'verified') return v.idVerified;
    if (visitorFilter === 'unverified') return !v.idVerified;
    return true;
  });

  const filteredActivities = activities.filter(a => actFilter === 'all' || a.type === actFilter);

  const thSticky = { ...thStyle, position: 'sticky', top: 0, background: 'var(--card)', zIndex: 1 };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 16, marginBottom: 24 }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface)', borderRadius: 10, padding: 4, flexWrap: 'wrap' }}>
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{
              flex: 1, minWidth: 100, padding: '9px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
              background: tab === i ? 'var(--card)' : 'transparent',
              color: tab === i ? 'var(--gold)' : 'var(--text2)',
            }}>{t}</button>
          ))}
        </div>

        {tab === 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button onClick={() => setShowAddCamera(true)} style={{
                background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.3)',
                borderRadius: 8, padding: '8px 16px', color: 'var(--gold)', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6,
              }}><Icon name="plus" size={14} /> Add Camera</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
              {cameras.map(cam => (
                <div key={cam.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                  <div style={{
                    height: 130, background: '#0a0a0f', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 6, position: 'relative',
                  }}>
                    <Icon name="camera" size={28} color={cam.status === 'live' ? 'var(--text3)' : 'var(--rose)'} />
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{cam.status === 'live' ? 'Live Feed' : 'OFFLINE'}</div>
                    {cam.recording && cam.status === 'live' && (
                      <div style={{
                        position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', gap: 4,
                        background: cam.status === 'live' ? 'rgba(239,68,68,0.9)' : 'rgba(107,114,128,0.9)',
                        padding: '3px 8px', borderRadius: 20,
                      }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff', animation: 'pulse 1s infinite' }} />
                        <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>REC</span>
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: 8, left: 8, fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Mono,monospace' }}>{now}</div>
                    <div style={{ position: 'absolute', top: 8, left: 8, fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'DM Mono,monospace' }}>{cam.id}</div>
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{cam.location}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: cam.status === 'live' ? 'var(--green)' : 'var(--rose)', textTransform: 'uppercase' }}>{cam.status}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>{cam.type}</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>Motion: {cam.lastMotion}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button onClick={() => toggleCameraStatus(cam.id)} style={{
                        flex: 1, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)',
                        borderRadius: 6, padding: '5px 8px', color: cam.status === 'live' ? 'var(--rose)' : 'var(--green)',
                        cursor: 'pointer', fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 600,
                      }}>{cam.status === 'live' ? 'Take Offline' : 'Bring Online'}</button>
                      <button onClick={() => deleteCamera(cam.id)} style={{
                        background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.25)',
                        borderRadius: 6, padding: '5px 10px', color: 'var(--rose)', cursor: 'pointer', fontSize: 11,
                        fontFamily: 'Inter, sans-serif', fontWeight: 600,
                      }}><Icon name="trash" size={13} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 1 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['all', 'inside', 'verified', 'unverified'].map(f => (
                  <button key={f} onClick={() => setVisitorFilter(f)} style={{
                    padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
                    background: visitorFilter === f ? 'rgba(217,119,6,0.15)' : 'var(--surface)',
                    color: visitorFilter === f ? 'var(--gold)' : 'var(--text2)',
                    border: visitorFilter === f ? '1px solid rgba(217,119,6,0.3)' : '1px solid var(--border)',
                  }}>{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
                ))}
              </div>
              <button onClick={() => setShowCheckIn(true)} style={{
                background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.3)',
                borderRadius: 8, padding: '8px 16px', color: 'var(--gold)', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6,
              }}><Icon name="plus" size={14} /> Check-In Visitor</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr>
                    {['Name', 'Purpose', 'Host', 'Check-In', 'Check-Out', 'ID Verified', 'Vehicle', 'Actions'].map(h => <th key={h} style={thSticky}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredVisitors.length === 0 ? (
                    <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text3)', padding: 40 }}>No visitors found</td></tr>
                  ) : (
                    filteredVisitors.map(v => (
                      <tr key={v.id} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ ...tdStyle, color: 'var(--text)', fontWeight: 500 }}>
                          <div>{v.name}</div>
                          {v.phone && <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono,monospace' }}>{v.phone}</div>}
                        </td>
                        <td style={tdStyle}>{v.purpose}</td>
                        <td style={tdStyle}>{v.host}</td>
                        <td style={{ ...tdStyle, fontFamily: 'DM Mono,monospace' }}>{v.checkIn}</td>
                        <td style={{ ...tdStyle, fontFamily: 'DM Mono,monospace' }}>
                          {v.checkOut || <span style={{ color: 'var(--green)', fontWeight: 600 }}>Still Inside</span>}
                        </td>
                        <td style={tdStyle}>
                          {v.idVerified
                            ? <span style={{ color: 'var(--green)', fontSize: 12, fontWeight: 600 }}>✓ Verified</span>
                            : <span style={{ color: 'var(--rose)', fontSize: 12, fontWeight: 600 }}>✗ Not Verified</span>}
                        </td>
                        <td style={{ ...tdStyle, fontSize: 12 }}>{v.vehicle || '—'}</td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {!v.checkOut && <button onClick={() => checkOutVisitor(v.id)} style={{
                              background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)',
                              borderRadius: 6, padding: '4px 10px', color: 'var(--green)', cursor: 'pointer',
                              fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 600,
                            }}>Check-Out</button>}
                            <button onClick={() => deleteVisitor(v.id)} style={{
                              background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.25)',
                              borderRadius: 6, padding: '4px 10px', color: 'var(--rose)', cursor: 'pointer',
                              fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 600,
                            }}><Icon name="trash" size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 2 && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              {[{ k: 'all', l: 'All Events' }, { k: 'login', l: 'Logins' }, { k: 'system', l: 'System' }, { k: 'booking', l: 'Bookings' }, { k: 'payment', l: 'Payments' }, { k: 'housekeeping', l: 'Housekeeping' }].map(f => (
                <button key={f.k} onClick={() => setActFilter(f.k)} style={{
                  padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
                  background: actFilter === f.k ? 'rgba(217,119,6,0.15)' : 'var(--surface)',
                  color: actFilter === f.k ? 'var(--gold)' : 'var(--text2)',
                  border: actFilter === f.k ? '1px solid rgba(217,119,6,0.3)' : '1px solid var(--border)',
                }}>{f.l}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredActivities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No activity events found</div>
              ) : (
                filteredActivities.map(a => (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: 14,
                    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: actColor[a.type], flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{a.action}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>{a.detail}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>{a.user}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono,monospace' }}>{a.ip}</div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'DM Mono,monospace', minWidth: 50, textAlign: 'right' }}>{a.time}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === 3 && (
          <div style={{ maxWidth: 520 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: 20, background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', marginBottom: 20,
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Two-Factor Authentication</div>
                <div style={{ fontSize: 13, color: 'var(--text3)' }}>Secure your account with 2FA</div>
              </div>
              <div onClick={() => setTwoFA(!twoFA)} style={{
                width: 48, height: 26, borderRadius: 13, background: twoFA ? 'var(--green)' : 'var(--border)',
                cursor: 'pointer', position: 'relative', transition: 'background 0.3s',
              }}>
                <div style={{
                  position: 'absolute', top: 3, left: twoFA ? 22 : 3, width: 20, height: 20,
                  borderRadius: '50%', background: '#fff', transition: 'left 0.3s',
                }} />
              </div>
            </div>
            {twoFA && (
              <div>
                <div style={{ padding: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Authenticator App</div>
                  <div style={{ background: '#fff', padding: 16, borderRadius: 8, display: 'inline-block', marginBottom: 12 }}>
                    <svg width={120} height={120} viewBox="0 0 10 10">
                      {Array.from({ length: 100 }, (_, i) => Math.random() > 0.5).map((on, i) => on ? <rect key={i} x={i % 10} y={Math.floor(i / 10)} width={1} height={1} fill="#000" /> : null)}
                      <rect x={1} y={1} width={3} height={3} fill="#000" /><rect x={2} y={2} width={1} height={1} fill="#fff" />
                      <rect x={6} y={1} width={3} height={3} fill="#000" /><rect x={7} y={2} width={1} height={1} fill="#fff" />
                      <rect x={1} y={6} width={3} height={3} fill="#000" /><rect x={2} y={7} width={1} height={1} fill="#fff" />
                    </svg>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>Scan with Google Authenticator or Authy</div>
                  <div style={{
                    fontSize: 12, color: 'var(--text2)', fontFamily: 'DM Mono,monospace',
                    background: 'var(--card)', padding: '8px 12px', borderRadius: 6,
                  }}>JBSWY3DPEHPK3PXP</div>
                </div>
                <div style={{ padding: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Recovery Codes</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>Keep these somewhere safe — each code can be used once.</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 8 }}>
                    {['A1B2-C3D4', 'E5F6-G7H8', 'I9J0-K1L2', 'M3N4-O5P6', 'Q7R8-S9T0', 'U1V2-W3X4'].map(code => (
                      <div key={code} style={{
                        fontFamily: 'DM Mono,monospace', fontSize: 12, color: 'var(--text2)',
                        background: 'var(--card)', padding: '8px 12px', borderRadius: 6,
                        textAlign: 'center', letterSpacing: '0.05em',
                      }}>{code}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 4 && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No active sessions</div>
              ) : (
                sessions.map(s => (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: 16,
                    background: 'var(--surface)',
                    border: `1px solid ${s.current ? 'var(--gold)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                  }}>
                    <Icon name="security" size={20} color={s.current ? 'var(--gold)' : 'var(--text3)'} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{s.device}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>{s.location} · {s.lastActive}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono,monospace', marginTop: 2 }}>{s.browser} · {s.ip}</div>
                    </div>
                    {s.current
                      ? <span style={{
                        fontSize: 11, fontWeight: 600, color: 'var(--green)',
                        background: 'rgba(52,211,153,0.12)', padding: '4px 10px', borderRadius: 20,
                      }}>Current Session</span>
                      : <button onClick={() => revokeSession(s.id)} style={{
                        background: 'rgba(251,113,133,0.12)', border: '1px solid rgba(251,113,133,0.3)',
                        borderRadius: 8, padding: '6px 14px', color: 'var(--rose)', cursor: 'pointer',
                        fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 600,
                      }}>Revoke</button>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Camera Modal */}
      {showAddCamera && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setShowAddCamera(false)}>
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
            padding: 28, width: 400, maxWidth: '90vw',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Add Camera</div>
              <button onClick={() => setShowAddCamera(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}><Icon name="x" size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500, marginBottom: 4 }}>Location</div>
                <input value={newCamera.location} onChange={e => setNewCamera(p => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Roof Terrace"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500, marginBottom: 4 }}>Camera Type</div>
                <select value={newCamera.type} onChange={e => setNewCamera(p => ({ ...p, type: e.target.value }))} style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)',
                  background: 'var(--surface)', color: 'var(--text)', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none',
                }}>
                  <option value="Dome 4K">Dome 4K</option>
                  <option value="Bullet 4K">Bullet 4K</option>
                  <option value="PTZ 2K">PTZ 2K</option>
                  <option value="Dome 2K">Dome 2K</option>
                  <option value="Bullet 2K">Bullet 2K</option>
                </select>
              </div>
              <button onClick={addCamera} style={{
                marginTop: 8, width: '100%', padding: '10px', borderRadius: 10, border: 'none',
                background: 'var(--gold)', color: '#fff', cursor: 'pointer', fontWeight: 700,
                fontFamily: 'Inter, sans-serif', fontSize: 13,
              }}>Add Camera</button>
            </div>
          </div>
        </div>
      )}

      {/* Check-In Visitor Modal */}
      {showCheckIn && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setShowCheckIn(false)}>
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
            padding: 28, width: 420, maxWidth: '90vw',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Visitor Check-In</div>
              <button onClick={() => setShowCheckIn(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}><Icon name="x" size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[ 
                { label: 'Full Name', key: 'name', placeholder: 'Visitor name' },
                { label: 'Purpose', key: 'purpose', placeholder: 'e.g. Meeting, Delivery' },
                { label: 'Host', key: 'host', placeholder: 'e.g. Room 203, Manager Office' },
                { label: 'Phone', key: 'phone', placeholder: 'Phone number (optional)' },
                { label: 'Vehicle', key: 'vehicle', placeholder: 'Vehicle number (optional)' },
              ].map(f => (
                <div key={f.key}>
                  <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500, marginBottom: 4 }}>{f.label}</div>
                  <input value={newVisitor[f.key]} onChange={e => setNewVisitor(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <input type="checkbox" id="idVerified" checked={newVisitor.idVerified}
                  onChange={e => setNewVisitor(p => ({ ...p, idVerified: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: 'var(--gold)' }} />
                <label htmlFor="idVerified" style={{ fontSize: 13, color: 'var(--text2)', cursor: 'pointer' }}>ID Verified</label>
              </div>
              <button onClick={checkInVisitor} style={{
                marginTop: 8, width: '100%', padding: '10px', borderRadius: 10, border: 'none',
                background: 'var(--gold)', color: '#fff', cursor: 'pointer', fontWeight: 700,
                fontFamily: 'Inter, sans-serif', fontSize: 13,
              }}>Check In</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
};

export default SecurityPage;
