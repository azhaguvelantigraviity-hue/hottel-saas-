import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import { ROOMS } from '../data/mockData';
import * as api from '../services/hotelService';

const ROOMS_KEY = 'stayos_rooms';
const safeRead = (key, fallback) => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; } };
const safeWrite = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch { } };

const inp = (slim) => ({
  width: '100%', padding: slim ? '8px 10px' : '10px 12px', background: 'var(--surface)',
  border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)',
  fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
});
const lbl = {
  fontSize: '11px', color: 'var(--text3)', fontWeight: '600',
  letterSpacing: '0.06em', display: 'block', marginBottom: '5px',
};

const RoomFormModal = ({ title, room, onClose, onSave }) => {
  const [form, setForm] = useState(room || { id: '', type: 'Deluxe King', floor: 1, rate: 3500, status: 'available', housekeeping: 'clean', guest: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.id) { alert('Please enter a room number.'); return; }
    onSave(form);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: '18px', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="x" size={20} color="var(--text3)" /></button>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={lbl}>ROOM NUMBER / ID *</label>
            <input style={inp()} value={form.id} onChange={e => set('id', e.target.value)} placeholder="e.g. 301" />
          </div>
          <div>
            <label style={lbl}>ROOM TYPE</label>
            <select style={inp()} value={form.type} onChange={e => set('type', e.target.value)}>
              {['Standard Twin','Deluxe King','Deluxe Queen','Suite','Premium Suite','Presidential Suite','Executive'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={lbl}>FLOOR</label>
            <input type="number" style={inp()} value={form.floor} onChange={e => set('floor', e.target.value)} />
          </div>
          <div>
            <label style={lbl}>NIGHTLY RATE (₹)</label>
            <input type="number" style={inp()} value={form.rate} onChange={e => set('rate', e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button onClick={onClose} style={{ padding: '9px 18px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
            <button onClick={handleSave} style={{ padding: '9px 20px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoomsPage = ({ onNav, role, hotelDetails }) => {
  const [view, setView] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [rooms, setRooms] = useState(() => safeRead(`${ROOMS_KEY}_${hotelDetails?.id || 'default'}`, ROOMS));
  const [saving, setSaving] = useState(false);

  useEffect(() => { safeWrite(`${ROOMS_KEY}_${hotelDetails?.id || 'default'}`, rooms); }, [rooms, hotelDetails?.id]);

  const loadRooms = useCallback(async () => {
    try {
      const res = await api.getRooms();
      if (res.data && res.data.length > 0) setRooms(res.data);
    } catch { /* keep localStorage */ }
  }, []);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  const toApi = (r) => ({
    roomNumber: r.id,
    type: r.type,
    floor: r.floor,
    rate: r.rate,
    status: r.status === 'occupied' ? 'occupied' : r.status === 'maintenance' ? 'maintenance' : r.status === 'reserved' ? 'reserved' : 'available',
    housekeepingStatus: r.housekeeping || 'clean',
  });

  const fromApi = (r) => ({
    _id: r._id,
    id: r.roomNumber || r._id,
    type: r.type,
    floor: r.floor,
    rate: r.rate || 0,
    status: r.status,
    housekeeping: r.housekeepingStatus || 'clean',
    guest: r.guest || '',
  });

  const roomLimit = hotelDetails?.rooms ?? 10;

  const handleAddRoom = async (newRoom) => {
    if (rooms.some(r => r.id === newRoom.id)) { alert(`Room ${newRoom.id} already exists!`); return; }
    setSaving(true);
    try {
      if (rooms.length >= roomLimit) {
        const localRooms = [...rooms, { ...newRoom, _id: Date.now().toString() }];
        setRooms(localRooms);
        alert(`Room added locally. Server limit (${roomLimit}) reached.`);
        return;
      }
      const res = await api.createRoom(toApi(newRoom));
      const created = fromApi(res.data);
      setRooms(prev => [...prev, created]);
    } catch {
      const localRooms = [...rooms, { ...newRoom, _id: Date.now().toString() }];
      setRooms(localRooms);
    } finally {
      setSaving(false);
    }
  };

  const handleEditRoom = async (updatedRoom) => {
    setSaving(true);
    try {
      if (updatedRoom._id && !updatedRoom._id.startsWith('_')) {
        await api.updateRoom(updatedRoom._id, toApi(updatedRoom));
      }
      setRooms(prev => prev.map(r => (r.id === updatedRoom.id ? updatedRoom : r)));
    } catch {
      setRooms(prev => prev.map(r => (r.id === updatedRoom.id ? updatedRoom : r)));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = (roomId) => {
    setRooms(prev => prev.filter(r => r.id !== roomId));
  };

  const filtered = filterStatus === 'all' ? rooms : rooms.filter(r => r.status === filterStatus);
  const counts = {
    all: rooms.length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    available: rooms.filter(r => r.status === 'available').length,
    reserved: rooms.filter(r => r.status === 'reserved').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  };

  const statusColor = { occupied: 'var(--gold)', available: 'var(--green)', reserved: 'var(--violet)', maintenance: 'var(--rose)' };
  const hkColor = { clean: 'var(--green)', dirty: 'var(--rose)', inspect: 'var(--amber)' };

  return (
    <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
      {showAddRoom && <RoomFormModal title="Add Room" onClose={() => setShowAddRoom(false)} onSave={handleAddRoom} />}
      {editRoom && <RoomFormModal title="Edit Room" room={editRoom} onClose={() => setEditRoom(null)} onSave={handleEditRoom} />}

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['all', 'occupied', 'available', 'reserved', 'maintenance'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '7px 16px', borderRadius: '20px', border: '1px solid', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif', background: filterStatus === s ? statusColor[s] || 'var(--gold)' : 'transparent', borderColor: filterStatus === s ? statusColor[s] || 'var(--gold)' : 'var(--border)', color: filterStatus === s ? '#000' : 'var(--text2)', textTransform: 'capitalize' }}>
            {s} ({counts[s]})
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
          <button onClick={() => setView('grid')} style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', background: view === 'grid' ? 'var(--gold)' : 'transparent', borderColor: view === 'grid' ? 'var(--gold)' : 'var(--border)', color: view === 'grid' ? '#000' : 'var(--text2)' }}>Grid</button>
          <button onClick={() => setView('list')} style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', background: view === 'list' ? 'var(--gold)' : 'transparent', borderColor: view === 'list' ? 'var(--gold)' : 'var(--border)', color: view === 'list' ? '#000' : 'var(--text2)' }}>List</button>
          {role === 'manager' ? (
            <button onClick={() => setShowAddRoom(true)} disabled={saving} style={{ padding: '7px 14px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Inter, sans-serif', opacity: saving ? 0.6 : 1 }}>
              <Icon name="plus" size={12} color="#fff" /> {saving ? 'Saving...' : 'Add Room'}
            </button>
          ) : (
            <button onClick={() => onNav && onNav('bookings')} style={{ padding: '7px 14px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Inter, sans-serif' }}>
              <Icon name="plus" size={12} color="#fff" /> New Booking
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>No rooms found for this status.</div>
      ) : view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '12px' }}>
          {filtered.map(r => (
            <div key={r.id || r._id} style={{ background: 'var(--card)', border: `1px solid ${statusColor[r.status]}30`, borderRadius: 'var(--radius)', padding: '16px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = statusColor[r.status]; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${statusColor[r.status]}30`; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '50px', height: '50px', background: `radial-gradient(circle, ${statusColor[r.status]}20, transparent)`, pointerEvents: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span style={{ fontSize: '22px', fontWeight: '900', fontFamily: 'Poppins,sans-serif', color: statusColor[r.status] }}>{r.id || r.roomNumber}</span>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: hkColor[r.housekeeping] || 'var(--green)', marginTop: '4px' }} />
              </div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text2)', marginBottom: '4px' }}>{r.type}</div>
              <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '8px' }}>Floor {r.floor}</div>
              <Badge color={r.status === 'occupied' ? 'gold' : r.status === 'available' ? 'green' : r.status === 'reserved' ? 'violet' : 'rose'}>{r.status}</Badge>
              {r.guest && <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.guest}</div>}
              <div style={{ marginTop: '8px', fontSize: '12px', fontFamily: 'DM Mono,monospace', color: 'var(--gold)' }}>₹{(r.rate || 0).toLocaleString()}/n</div>
              {role === 'manager' && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                  <button onClick={e => { e.stopPropagation(); setEditRoom(r); }} style={{ flex: 1, padding: '4px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '6px', color: 'var(--gold)', cursor: 'pointer', fontSize: '10px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>Edit</button>
                  <button onClick={e => { e.stopPropagation(); handleDeleteRoom(r.id); }} style={{ padding: '4px 8px', background: 'transparent', border: '1px solid var(--rose)', borderRadius: '6px', color: 'var(--rose)', cursor: 'pointer', fontSize: '10px', fontFamily: 'Inter, sans-serif', opacity: 0.7 }}>✕</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                {['Room', 'Type', 'Floor', 'Status', 'Guest', 'Rate', 'Housekeeping', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.05em' }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id || r._id} style={{ borderBottom: '1px solid var(--border)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 16px', fontFamily: 'DM Mono,monospace', fontWeight: '700', color: statusColor[r.status] }}>{r.id || r.roomNumber}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{r.type}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text2)' }}>Floor {r.floor}</td>
                  <td style={{ padding: '12px 16px' }}><Badge color={r.status === 'occupied' ? 'gold' : r.status === 'available' ? 'green' : r.status === 'reserved' ? 'violet' : 'rose'}>{r.status}</Badge></td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text2)' }}>{r.guest || '—'}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'DM Mono,monospace', fontSize: '13px' }}>₹{(r.rate || 0).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}><Badge color={r.housekeeping === 'clean' ? 'green' : r.housekeeping === 'dirty' ? 'rose' : 'amber'}>{r.housekeeping}</Badge></td>
                  <td style={{ padding: '12px 16px' }}>
                    {role === 'manager' && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => setEditRoom(r)} style={{ padding: '4px 8px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '6px', color: 'var(--gold)', cursor: 'pointer', fontSize: '10px', fontFamily: 'Inter, sans-serif' }}>Edit</button>
                        <button onClick={() => handleDeleteRoom(r.id)} style={{ padding: '4px 8px', background: 'transparent', border: '1px solid var(--rose)', borderRadius: '6px', color: 'var(--rose)', cursor: 'pointer', fontSize: '10px', fontFamily: 'Inter, sans-serif' }}>✕</button>
                      </div>
                    )}
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
