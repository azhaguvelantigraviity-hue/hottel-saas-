import React, { useState } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import { GUESTS, BOOKINGS } from '../data/mockData';

const loyaltyColor = { Platinum: 'gold', Gold: 'amber', Silver: 'gray', Bronze: 'rose' };
const statusColor = { vip: 'gold', regular: 'teal', new: 'green' };

const inputStyle = { width: '100%', padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'DM Sans,sans-serif' };
const labelStyle = { fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' };

const GuestDetail = ({ guest, onClose }) => {
  const guestBookings = BOOKINGS.filter(b => b.guest === guest.name);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Avatar initials={guest.name.split(' ').map(n => n[0]).join('')} color={guest.status === 'vip' ? 'var(--gold)' : 'var(--teal)'} size={48} />
            <div>
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '20px' }}>{guest.name}</h2>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <Badge color={statusColor[guest.status]}>{guest.status.toUpperCase()}</Badge>
                <Badge color={loyaltyColor[guest.loyalty]}>{guest.loyalty}</Badge>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="x" size={20} color="var(--text3)" /></button>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[['Email', guest.email], ['Phone', guest.phone], ['City', guest.city], ['Total Visits', guest.visits], ['Total Spent', `₹${guest.totalSpent.toLocaleString()}`], ['Last Visit', guest.lastVisit]].map(([k, v]) => (
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
        </div>
      </div>
    </div>
  );
};

const GuestCRMPage = () => {
  const [guests, setGuests] = useState(GUESTS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', email: '', phone: '', city: '', notes: '' });

  const filtered = guests.filter(g => {
    const matchFilter = filter === 'all' || g.status === filter || g.loyalty === filter;
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.email.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalRevenue = guests.reduce((s, g) => s + g.totalSpent, 0);

  return (
    <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
      {selected && <GuestDetail guest={selected} onClose={() => setSelected(null)} />}

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '480px' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '20px' }}>Add Guest</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="x" size={20} color="var(--text3)" /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[['name', 'FULL NAME'], ['email', 'EMAIL'], ['phone', 'PHONE'], ['city', 'CITY']].map(([k, l]) => (
                <div key={k}>
                  <label style={labelStyle}>{l}</label>
                  <input style={inputStyle} value={newGuest[k]} onChange={e => setNewGuest(p => ({ ...p, [k]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label style={labelStyle}>NOTES</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }} value={newGuest.notes} onChange={e => setNewGuest(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowAdd(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontSize: '13px' }}>Cancel</button>
                <button onClick={() => { if (newGuest.name) { setGuests(p => [...p, { ...newGuest, id: p.length + 1, visits: 0, totalSpent: 0, lastVisit: '—', status: 'new', loyalty: 'Bronze' }]); setShowAdd(false); setNewGuest({ name: '', email: '', phone: '', city: '', notes: '' }); } }} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'DM Sans,sans-serif' }}>Add Guest</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Guests', value: guests.length, color: 'var(--gold)' },
          { label: 'VIP Guests', value: guests.filter(g => g.status === 'vip').length, color: 'var(--amber)' },
          { label: 'Platinum Members', value: guests.filter(g => g.loyalty === 'Platinum').length, color: 'var(--violet)' },
          { label: 'Total Revenue', value: `₹${(totalRevenue / 1000).toFixed(0)}K`, color: 'var(--green)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'Playfair Display,serif', color: s.color, marginBottom: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {['all', 'vip', 'regular', 'new', 'Platinum', 'Gold', 'Silver'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', textTransform: 'capitalize', background: filter === f ? 'var(--gold)' : 'transparent', borderColor: filter === f ? 'var(--gold)' : 'var(--border)', color: filter === f ? '#000' : 'var(--text2)' }}>{f}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guests…" style={{ ...inputStyle, width: '200px' }} />
          <button onClick={() => setShowAdd(true)} style={{ padding: '10px 16px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'DM Sans,sans-serif', whiteSpace: 'nowrap' }}>
            <Icon name="plus" size={14} color="#fff" /> Add Guest
          </button>
        </div>
      </div>

      {/* Guest Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '14px' }}>
        {filtered.map(g => (
          <div key={g.id} onClick={() => setSelected(g)} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Avatar initials={g.name.split(' ').map(n => n[0]).join('')} color={g.status === 'vip' ? 'var(--gold)' : g.status === 'regular' ? 'var(--teal)' : 'var(--green)'} size={44} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '700' }}>{g.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{g.city}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                <Badge color={statusColor[g.status]}>{g.status}</Badge>
                <Badge color={loyaltyColor[g.loyalty]}>{g.loyalty}</Badge>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[['Visits', g.visits], ['Spent', `₹${(g.totalSpent / 1000).toFixed(0)}K`], ['Last Stay', g.lastVisit.slice(5)]].map(([k, v]) => (
                <div key={k} style={{ background: 'var(--surface)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>{v}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text3)' }}>{k}</div>
                </div>
              ))}
            </div>
            {g.notes && <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text3)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📝 {g.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuestCRMPage;
