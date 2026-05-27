import React, { useState } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import { BOOKINGS, ROOMS, PET_CHARGES } from '../data/mockData';

const statusColor = { 'checked-in': 'green', confirmed: 'teal', pending: 'amber', 'checked-out': 'gray', cancelled: 'rose' };
const sourceColor = { direct: 'gold', 'booking.com': 'teal', expedia: 'violet', agoda: 'rose' };

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflow: 'auto' }}>
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '20px' }}>{title}</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: '4px' }}>
          <Icon name="x" size={20} color="var(--text3)" />
        </button>
      </div>
      <div style={{ padding: '24px' }}>{children}</div>
    </div>
  </div>
);

const inputStyle = {
  width: '100%', padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: '8px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'DM Sans,sans-serif',
};
const labelStyle = { fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' };

const NewBookingForm = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    guest: '', phone: '', email: '', room: '', checkIn: '', checkOut: '', adults: 1, children: 0,
    source: 'direct', specialRequests: '', hasPet: false, petSize: 'small', petType: '',
  });

  const nights = form.checkIn && form.checkOut
    ? Math.max(0, Math.ceil((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000))
    : 0;

  const selectedRoom = ROOMS.find(r => String(r.id) === String(form.room));
  const roomRate = selectedRoom ? selectedRoom.rate : 0;
  const petCharge = form.hasPet ? PET_CHARGES[form.petSize].perNight * nights + PET_CHARGES.deposit : 0;
  const totalAmount = roomRate * nights + petCharge;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={labelStyle}>GUEST NAME *</label>
          <input style={inputStyle} value={form.guest} onChange={e => set('guest', e.target.value)} placeholder="Full name" />
        </div>
        <div>
          <label style={labelStyle}>PHONE</label>
          <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Mobile number" />
        </div>
        <div>
          <label style={labelStyle}>EMAIL</label>
          <input style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} placeholder="Email address" />
        </div>
        <div>
          <label style={labelStyle}>ROOM *</label>
          <select style={inputStyle} value={form.room} onChange={e => set('room', e.target.value)}>
            <option value="">Select room</option>
            {ROOMS.filter(r => r.status === 'available').map(r => (
              <option key={r.id} value={r.id}>{r.id} – {r.type} (₹{r.rate}/night)</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>CHECK-IN *</label>
          <input type="date" style={inputStyle} value={form.checkIn} onChange={e => set('checkIn', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>CHECK-OUT *</label>
          <input type="date" style={inputStyle} value={form.checkOut} onChange={e => set('checkOut', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>ADULTS</label>
          <input type="number" min="1" max="6" style={inputStyle} value={form.adults} onChange={e => set('adults', +e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>CHILDREN</label>
          <input type="number" min="0" max="4" style={inputStyle} value={form.children} onChange={e => set('children', +e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>BOOKING SOURCE</label>
          <select style={inputStyle} value={form.source} onChange={e => set('source', e.target.value)}>
            {['direct', 'booking.com', 'expedia', 'agoda'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>SPECIAL REQUESTS</label>
        <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }} value={form.specialRequests} onChange={e => set('specialRequests', e.target.value)} placeholder="Any special requirements..." />
      </div>

      {/* Pet Section */}
      <div style={{ background: 'var(--surface)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: form.hasPet ? '14px' : '0' }}>
          <span style={{ fontSize: '20px' }}>🐾</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>Travelling with a Pet?</div>
            <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Additional charges apply per night + refundable deposit</div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <div
              onClick={() => set('hasPet', !form.hasPet)}
              style={{
                width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.2s',
                background: form.hasPet ? 'var(--gold)' : 'var(--border)', position: 'relative',
              }}
            >
              <div style={{
                position: 'absolute', top: '3px', width: '18px', height: '18px', borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s', left: form.hasPet ? '23px' : '3px',
              }} />
            </div>
          </label>
        </div>
        {form.hasPet && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>PET SIZE</label>
              <select style={inputStyle} value={form.petSize} onChange={e => set('petSize', e.target.value)}>
                {Object.entries(PET_CHARGES).filter(([k]) => k !== 'deposit').map(([k, v]) => (
                  <option key={k} value={k}>{v.label} — ₹{v.perNight}/night</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>PET TYPE / BREED</label>
              <input style={inputStyle} value={form.petType} onChange={e => set('petType', e.target.value)} placeholder="e.g. Golden Retriever" />
            </div>
            <div style={{ gridColumn: 'span 2', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text2)', marginBottom: '4px' }}>
                <span>Pet charge ({nights} nights × ₹{PET_CHARGES[form.petSize].perNight})</span>
                <span>₹{(PET_CHARGES[form.petSize].perNight * nights).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text2)', marginBottom: '8px' }}>
                <span>Refundable pet deposit</span>
                <span>₹{PET_CHARGES.deposit.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700', color: 'var(--gold)' }}>
                <span>Total Pet Charges</span>
                <span>₹{petCharge.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      {nights > 0 && selectedRoom && (
        <div style={{ background: 'var(--surface)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: 'var(--text2)' }}>BOOKING SUMMARY</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text2)', marginBottom: '4px' }}>
            <span>Room {selectedRoom.id} × {nights} nights</span>
            <span>₹{(roomRate * nights).toLocaleString()}</span>
          </div>
          {form.hasPet && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text2)', marginBottom: '4px' }}>
              <span>Pet charges</span>
              <span>₹{petCharge.toLocaleString()}</span>
            </div>
          )}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', color: 'var(--gold)' }}>
            <span>Total</span>
            <span>₹{totalAmount.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
        <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontSize: '13px' }}>
          Cancel
        </button>
        <button
          onClick={() => { if (form.guest && form.room && form.checkIn && form.checkOut) { onSave({ ...form, id: `BK-${1009 + Math.floor(Math.random() * 100)}`, amount: totalAmount, nights, petCharge, status: 'confirmed' }); onClose(); } }}
          style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'DM Sans,sans-serif' }}
        >
          Create Booking
        </button>
      </div>
    </div>
  );
};

const BookingDetail = ({ booking, onClose, onAction }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      {[
        ['Booking ID', booking.id], ['Guest', booking.guest], ['Phone', booking.phone || '—'],
        ['Email', booking.email || '—'], ['Room', booking.room], ['Source', booking.source],
        ['Check-in', booking.checkIn], ['Check-out', booking.checkOut],
        ['Nights', booking.nights], ['Adults', booking.adults], ['Children', booking.children || 0],
      ].map(([k, v]) => (
        <div key={k} style={{ background: 'var(--surface)', borderRadius: '8px', padding: '10px 12px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text3)', letterSpacing: '0.06em', marginBottom: '3px' }}>{k.toUpperCase()}</div>
          <div style={{ fontSize: '13px', fontWeight: '600' }}>{v}</div>
        </div>
      ))}
    </div>
    {booking.hasPet && (
      <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '24px' }}>🐾</span>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--gold)' }}>Pet Registered: {booking.petType}</div>
          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Pet charge: ₹{booking.petCharge?.toLocaleString()} (incl. deposit)</div>
        </div>
      </div>
    )}
    {booking.specialRequests && (
      <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '12px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '4px' }}>SPECIAL REQUESTS</div>
        <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{booking.specialRequests}</div>
      </div>
    )}
    <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '700' }}>
        <span>Total Amount</span>
        <span style={{ color: 'var(--gold)', fontFamily: 'DM Mono,monospace' }}>₹{booking.amount?.toLocaleString()}</span>
      </div>
    </div>
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {booking.status === 'confirmed' && (
        <button onClick={() => { onAction(booking.id, 'checked-in'); onClose(); }} style={{ flex: 1, padding: '10px', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '8px', color: 'var(--green)', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'DM Sans,sans-serif' }}>
          ✓ Check In
        </button>
      )}
      {booking.status === 'checked-in' && (
        <button onClick={() => { onAction(booking.id, 'checked-out'); onClose(); }} style={{ flex: 1, padding: '10px', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '8px', color: 'var(--gold)', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'DM Sans,sans-serif' }}>
          ↗ Check Out
        </button>
      )}
      {(booking.status === 'confirmed' || booking.status === 'pending') && (
        <button onClick={() => { onAction(booking.id, 'cancelled'); onClose(); }} style={{ padding: '10px 16px', background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', borderRadius: '8px', color: 'var(--rose)', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'DM Sans,sans-serif' }}>
          Cancel
        </button>
      )}
    </div>
  </div>
);

const BookingsPage = () => {
  const [bookings, setBookings] = useState(BOOKINGS);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState(null);

  const filtered = bookings.filter(b => {
    const matchFilter = filter === 'all' || b.status === filter;
    const matchSearch = !search || b.guest.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase()) || b.room.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleAction = (id, newStatus) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  const handleSave = (newBooking) => {
    const room = ROOMS.find(r => String(r.id) === String(newBooking.room));
    setBookings(prev => [...prev, {
      ...newBooking,
      room: room ? `${room.id} – ${room.type}` : newBooking.room,
    }]);
  };

  const stats = [
    { label: 'Total', count: bookings.length, color: 'var(--text2)' },
    { label: 'Checked In', count: bookings.filter(b => b.status === 'checked-in').length, color: 'var(--green)' },
    { label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length, color: 'var(--teal)' },
    { label: 'Pending', count: bookings.filter(b => b.status === 'pending').length, color: 'var(--amber)' },
    { label: 'With Pets 🐾', count: bookings.filter(b => b.hasPet).length, color: 'var(--gold)' },
  ];

  return (
    <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
      {showNew && <Modal title="New Booking" onClose={() => setShowNew(false)}><NewBookingForm onClose={() => setShowNew(false)} onSave={handleSave} /></Modal>}
      {selected && <Modal title={`Booking ${selected.id}`} onClose={() => setSelected(null)}><BookingDetail booking={selected} onClose={() => setSelected(null)} onAction={handleAction} /></Modal>}

      {/* Stats */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 20px', textAlign: 'center', minWidth: '100px' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'Playfair Display,serif', color: s.color }}>{s.count}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowNew(true)} style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'DM Sans,sans-serif', alignSelf: 'center' }}>
          <Icon name="plus" size={14} color="#fff" /> New Booking
        </button>
      </div>

      {/* Filters + Search */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {['all', 'checked-in', 'confirmed', 'pending', 'checked-out', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', textTransform: 'capitalize', background: filter === s ? 'var(--gold)' : 'transparent', borderColor: filter === s ? 'var(--gold)' : 'var(--border)', color: filter === s ? '#000' : 'var(--text2)' }}>
            {s === 'all' ? 'All' : s.replace('-', ' ')}
          </button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guest, room, ID…" style={{ ...inputStyle, width: '220px' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
              {['Booking ID', 'Guest', 'Room', 'Check-in', 'Check-out', 'Nights', 'Amount', 'Pet', 'Source', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={11} style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', fontSize: '14px' }}>No bookings found</td></tr>
            ) : filtered.map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => setSelected(b)}
              >
                <td style={{ padding: '12px', fontSize: '12px', fontFamily: 'DM Mono,monospace', color: 'var(--gold)' }}>{b.id}</td>
                <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600' }}>{b.guest}</td>
                <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text2)' }}>{b.room}</td>
                <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text2)' }}>{b.checkIn}</td>
                <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text2)' }}>{b.checkOut}</td>
                <td style={{ padding: '12px', fontSize: '13px', textAlign: 'center', color: 'var(--text2)' }}>{b.nights}</td>
                <td style={{ padding: '12px', fontSize: '13px', fontFamily: 'DM Mono,monospace' }}>₹{b.amount?.toLocaleString()}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {b.hasPet ? <span title={`${b.petType} — ₹${b.petCharge}`} style={{ fontSize: '16px', cursor: 'help' }}>🐾</span> : <span style={{ color: 'var(--text3)', fontSize: '12px' }}>—</span>}
                </td>
                <td style={{ padding: '12px' }}><Badge color={sourceColor[b.source] || 'gray'}>{b.source}</Badge></td>
                <td style={{ padding: '12px' }}><Badge color={statusColor[b.status] || 'gray'}>{b.status}</Badge></td>
                <td style={{ padding: '12px' }}>
                  <button onClick={e => { e.stopPropagation(); setSelected(b); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
                    <Icon name="eye" size={14} color="var(--text3)" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsPage;
