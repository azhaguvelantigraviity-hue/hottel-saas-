import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import * as api from '../services/hotelService';

const GUEST_STORAGE_KEY = 'stayos_guests';

const safeRead = (key, fallback) => {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
};
const safeWrite = (key, val) => {
  try { ); } catch { }
};

const deriveStatus = (g) => {
  if (g.isBlacklisted) return 'blacklisted';
  if ((g.totalSpent || 0) > 50000) return 'vip';
  if ((g.totalStays || 0) > 3) return 'regular';
  return 'new';
};

const loyaltyColor = { Platinum: 'gold', Gold: 'amber', Silver: 'gray', Bronze: 'rose' };
const statusColor = { vip: 'gold', regular: 'teal', new: 'green', blacklisted: 'rose' };

const inputStyle = { width: '100%', padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' };
const labelStyle = { fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' };

const GuestDetail = ({ guest, onClose, onDelete, onRefresh }) => {
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const name = [guest.firstName, guest.lastName].filter(Boolean).join(' ') || 'Guest';
  const status = deriveStatus(guest);
  const guestBookings = []; // backend booking lookup could go here

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(guest._id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ padding: 'clamp(12px, 3vw, 24px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Avatar initials={name.split(' ').map(n => n[0]).join('')} color={status === 'vip' ? 'var(--gold)' : status === 'blacklisted' ? 'var(--rose)' : 'var(--teal)'} size={48} />
            <div>
              <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: '20px', margin: 0 }}>{name}</h2>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <Badge color={statusColor[status]}>{status.toUpperCase()}</Badge>
                <Badge color={loyaltyColor[guest.loyaltyTier] || 'gray'}>{guest.loyaltyTier || 'Bronze'}</Badge>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="x" size={20} color="var(--text3)" /></button>
        </div>
        <div style={{ padding: 'clamp(12px, 3vw, 24px)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '10px' }}>
            {[
              ['Email', guest.email || '—'],
              ['Phone', guest.phone || '—'],
              ['Address', guest.address || '—'],
              ['Total Stays', guest.totalStays ?? 0],
              ['Total Spent', `₹${(guest.totalSpent || 0).toLocaleString()}`],
              ['Last Visit', guest.lastVisit || (guest.createdAt ? new Date(guest.createdAt).toLocaleDateString('en-IN') : '—')],
            ].map(([k, v]) => (
              <div key={k} style={{ background: 'var(--surface)', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text3)', letterSpacing: '0.06em', marginBottom: '3px' }}>{k.toUpperCase()}</div>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>{v}</div>
              </div>
            ))}
          </div>
          {guest.notes && (
            <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '4px' }}>NOTES & PREFERENCES</div>
              <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{guest.notes}</div>
            </div>
          )}
          {guestBookings.length > 0 && (
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>Booking History</div>
              {guestBookings.map(b => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--surface)', borderRadius: '8px', marginBottom: '6px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontFamily: 'DM Mono,monospace', color: 'var(--gold)' }}>{b.id}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{b.room} · {b.checkIn} → {b.checkOut}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'DM Mono,monospace' }}>₹{b.amount.toLocaleString()}</div>
                    <Badge color={b.status === 'checked-in' ? 'green' : 'amber'}>{b.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            {confirm ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,77,77,0.08)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--rose)' }}>Delete this guest permanently?</span>
                <button onClick={handleDelete} disabled={deleting} style={{ padding: '6px 14px', background: 'var(--rose)', border: 'none', borderRadius: '6px', color: '#fff', cursor: deleting ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>{deleting ? 'Deleting...' : 'Yes, Delete'}</button>
                <button onClick={() => setConfirm(false)} style={{ padding: '6px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text2)', cursor: 'pointer', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
              </div>
            ) : (
              <button onClick={() => setConfirm(true)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--rose)', borderRadius: '8px', color: 'var(--rose)', cursor: 'pointer', fontWeight: '600', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
                <Icon name="trash" size={14} color="var(--rose)" /> Delete Guest
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const GuestCRMPage = () => {
  const [guests, setGuests] = useState(() => safeRead(GUEST_STORAGE_KEY, []));
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', email: '', phone: '', city: '', notes: '' });

  useEffect(() => { safeWrite(GUEST_STORAGE_KEY, guests); }, [guests]);

  const loadGuests = useCallback(async () => {
    try {
      const res = await api.getGuests();
      const data = res.data || [];
      setGuests(data);
    } catch {
      // keep localStorage data
    }
  }, []);

  useEffect(() => { loadGuests(); }, [loadGuests]);

  const handleAddGuest = async () => {
    if (!newGuest.name) return;
    setSaving(true);
    try {
      const nameParts = newGuest.name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || 'Guest';
      const payload = {
        firstName,
        lastName,
        email: newGuest.email,
        phone: newGuest.phone,
        address: newGuest.city,
        notes: newGuest.notes,
        source: 'CRM',
      };
      await api.createGuest(payload);
      await loadGuests();
      setShowAdd(false);
      setNewGuest({ name: '', email: '', phone: '', city: '', notes: '' });
    } catch (err) {
      alert(err.message || 'Failed to add guest');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGuest = async (id) => {
    try {
      await api.deleteGuest(id);
      await loadGuests();
      setSelected(null);
    } catch (err) {
      alert(err.message || 'Failed to delete guest');
    }
  };

  const computeStatus = (g) => {
    if (filter === 'all') return true;
    const s = deriveStatus(g);
    if (s === filter) return true;
    if (['Platinum','Gold','Silver','Bronze'].includes(filter) && (g.loyaltyTier || 'Bronze') === filter) return true;
    return false;
  };

  const filtered = guests.filter(g => {
    if (!computeStatus(g)) return false;
    if (!search) return true;
    const name = [g.firstName, g.lastName].filter(Boolean).join(' ').toLowerCase();
    const email = (g.email || '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const displayName = (g) => [g.firstName, g.lastName].filter(Boolean).join(' ') || 'Unknown';

  const totalRevenue = guests.reduce((s, g) => s + (g.totalSpent || 0), 0);

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px)', overflowY: 'auto', flex: 1 }}>
      {selected && <GuestDetail guest={selected} onClose={() => setSelected(null)} onDelete={handleDeleteGuest} />}

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '480px' }}>
            <div style={{ padding: 'clamp(12px, 3vw, 24px)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: '20px', margin: 0 }}>Add Guest</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="x" size={20} color="var(--text3)" /></button>
            </div>
            <div style={{ padding: 'clamp(12px, 3vw, 24px)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[['name', 'FULL NAME'], ['email', 'EMAIL'], ['phone', 'PHONE'], ['city', 'CITY / ADDRESS']].map(([k, l]) => (
                <div key={k}>
                  <label style={labelStyle}>{l}</label>
                  <input style={inputStyle} value={newGuest[k]} onChange={e => {
                    let val = e.target.value;
                    if (k === 'phone') val = val.replace(/\D/g, '').slice(0, 10);
                    setNewGuest(p => ({ ...p, [k]: val }));
                  }} />
                </div>
              ))}
              <div>
                <label style={labelStyle}>NOTES</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }} value={newGuest.notes} onChange={e => setNewGuest(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowAdd(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>Cancel</button>
                <button onClick={handleAddGuest} disabled={saving} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif', opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving...' : 'Add Guest'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Guests', value: guests.length, color: 'var(--gold)' },
          { label: 'VIP Guests', value: guests.filter(g => deriveStatus(g) === 'vip').length, color: 'var(--amber)' },
          { label: 'Platinum Members', value: guests.filter(g => g.loyaltyTier === 'Platinum').length, color: 'var(--violet)' },
          { label: 'Total Revenue', value: totalRevenue > 0 ? `₹${(totalRevenue / 1000).toFixed(0)}K` : '—', color: 'var(--green)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'Poppins,sans-serif', color: s.color, marginBottom: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {['all', 'vip', 'regular', 'new', 'Platinum', 'Gold', 'Silver'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize', background: filter === f ? 'var(--gold)' : 'transparent', borderColor: filter === f ? 'var(--gold)' : 'var(--border)', color: filter === f ? '#000' : 'var(--text2)' }}>{f}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guests…" style={{ ...inputStyle, width: '200px' }} />
          <button onClick={() => setShowAdd(true)} style={{ padding: '10px 16px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
            <Icon name="plus" size={14} color="#fff" /> Add Guest
          </button>
        </div>
      </div>

      {/* Guest Cards */}
      {filtered.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', fontSize: '14px' }}>No guests found. Click "Add Guest" to create one.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '14px' }}>
          {filtered.map(g => {
            const status = deriveStatus(g);
            const name = displayName(g);
            return (
              <div key={g._id} onClick={() => setSelected(g)} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <Avatar initials={name.split(' ').map(n => n[0]).join('')} color={status === 'vip' ? 'var(--gold)' : status === 'regular' ? 'var(--teal)' : 'var(--green)'} size={44} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700' }}>{name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{g.address || ''}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                    <Badge color={statusColor[status]}>{status}</Badge>
                    <Badge color={loyaltyColor[g.loyaltyTier] || 'gray'}>{g.loyaltyTier || 'Bronze'}</Badge>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '8px' }}>
                  {[
                    ['Visits', g.totalStays ?? 0],
                    ['Spent', `₹${((g.totalSpent || 0) / 1000).toFixed(0)}K`],
                    ['Since', g.createdAt ? new Date(g.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: 'var(--surface)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>{v}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text3)' }}>{k}</div>
                    </div>
                  ))}
                </div>
                {g.notes && <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text3)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📝 {g.notes}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GuestCRMPage;
