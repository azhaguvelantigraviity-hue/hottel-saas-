import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import * as api from '../services/hotelService';

const PET_CHARGES = {
  small: { label: 'Small (up to 10kg)', perNight: 500 },
  medium: { label: 'Medium (10kg - 25kg)', perNight: 800 },
  large: { label: 'Large (over 25kg)', perNight: 1200 },
  deposit: 2000
};

const statusColor = { 'checked-in': 'green', confirmed: 'teal', pending: 'amber', 'checked-out': 'gray', cancelled: 'rose' };
const sourceColor = { direct: 'gold', 'booking.com': 'teal', expedia: 'violet', agoda: 'rose' };
const BOOKINGS_STORAGE_KEY = 'stayos_bookings';
const ROOMS_STORAGE_KEY = 'stayos_rooms';

const safeReadJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const safeWriteJson = (key, value) => {
  try { ); } catch { }
};

const formatDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const toFlat = (b) => ({
  id: b.bookingId || b._id,
  _id: b._id,
  guest: b.guest ? `${b.guest.firstName || ''} ${b.guest.lastName || ''}`.trim() : (b.guest || ''),
  phone: b.guest?.phone || b.phone || '',
  email: b.guest?.email || b.email || '',
  room: b.room ? `${b.room.roomNumber || ''} – ${b.room.type || ''}`.trim() : (b.room || ''),
  checkIn: formatDate(b.checkIn),
  checkOut: formatDate(b.checkOut),
  nights: b.nights || 0,
  adults: b.adults || 1,
  children: b.children || 0,
  amount: b.totalAmount || b.amount || 0,
  paid: b.paidAmount || 0,
  source: (b.source || 'direct').toLowerCase(),
  status: (b.status || 'confirmed').replace(/_/g, '-'),
  hasPet: b.hasPet || false,
  petType: b.petType || '',
  petCharge: b.petCharge || 0,
  specialRequests: b.specialRequests || '',
  checkedInAt: b.checkedInAt,
  checkedOutAt: b.checkedOutAt,
});

const fromFlat = (f) => ({
  guestName: f.guest,
  phone: f.phone,
  email: f.email,
  room: f.room,
  checkIn: f.checkIn,
  checkOut: f.checkOut,
  nights: f.nights,
  adults: f.adults,
  children: f.children,
  amount: f.amount,
  totalAmount: f.amount,
  id: f.id,
  source: f.source,
  status: (f.status || 'confirmed').replace(/-/g, '_'),
  hasPet: f.hasPet,
  petType: f.petType,
  petCharge: f.petCharge,
  specialRequests: f.specialRequests,
});

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflow: 'auto' }}>
      <div style={{ padding: 'clamp(12px, 3vw, 24px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '20px' }}>{title}</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: '4px' }}>
          <Icon name="x" size={20} color="var(--text3)" />
        </button>
      </div>
      <div style={{ padding: 'clamp(12px, 3vw, 24px)' }}>{children}</div>
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
  const [availableRooms, setAvailableRooms] = useState([]);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await api.getRooms();
        if (res.data) {
          const mapped = res.data.map(r => ({
            id: r.roomNumber || r._id,
            type: r.type,
            rate: r.baseRate || 0,
            status: r.status
          }));
          setAvailableRooms(mapped);
        }
      } catch (err) {
        setAvailableRooms([]);
      }
    };
    loadRooms();
  }, []);

  const nights = form.checkIn && form.checkOut
    ? Math.max(0, Math.ceil((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000))
    : 0;

  const selectedRoom = availableRooms.find(r => String(r.id) === String(form.room));
  const roomRate = selectedRoom ? selectedRoom.rate : 0;
  const petCharge = form.hasPet ? PET_CHARGES[form.petSize].perNight * nights + PET_CHARGES.deposit : 0;
  const totalAmount = roomRate * nights + petCharge;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '12px' }}>
        <div>
          <label style={labelStyle}>GUEST NAME *</label>
          <input style={inputStyle} value={form.guest} onChange={e => set('guest', e.target.value)} placeholder="Full name" />
        </div>
        <div>
          <label style={labelStyle}>PHONE</label>
          <input style={inputStyle} value={form.phone} onChange={e => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
            set('phone', val);
          }} placeholder="Mobile number (10 digits)" />
        </div>
        <div>
          <label style={labelStyle}>EMAIL</label>
          <input style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} placeholder="Email address" />
        </div>
        <div>
          <label style={labelStyle}>ROOM *</label>
          <select style={inputStyle} value={form.room} onChange={e => set('room', e.target.value)}>
            <option value="">Select room</option>
            {availableRooms.filter(r => r.status === 'available').map(r => (
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '12px' }}>
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
          onClick={() => { if (form.guest && form.room && form.checkIn && form.checkOut) { onSave(form, totalAmount, nights, petCharge); onClose(); } }}
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '12px' }}>
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
        <button onClick={() => { onAction(booking, 'checked-in'); onClose(); }} style={{ flex: 1, padding: '10px', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '8px', color: 'var(--green)', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'DM Sans,sans-serif' }}>
          ✓ Check In
        </button>
      )}
      {booking.status === 'checked-in' && (
        <button onClick={() => { onAction(booking, 'checked-out'); onClose(); }} style={{ flex: 1, padding: '10px', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '8px', color: 'var(--gold)', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'DM Sans,sans-serif' }}>
          ↗ Check Out
        </button>
      )}
      {(booking.status === 'confirmed' || booking.status === 'pending') && (
        <button onClick={() => { onAction(booking, 'cancelled'); onClose(); }} style={{ padding: '10px 16px', background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', borderRadius: '8px', color: 'var(--rose)', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'DM Sans,sans-serif' }}>
          Cancel
        </button>
      )}
      <button onClick={() => { onAction(booking, 'deleted'); onClose(); }} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid var(--rose)', borderRadius: '8px', color: 'var(--rose)', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'DM Sans,sans-serif' }}>
        Delete
      </button>
    </div>
  </div>
);

const BookingsPage = () => {
  const [bookings, setBookings] = useState(() => safeReadJson(BOOKINGS_STORAGE_KEY, []));
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState(null);
  const [apiReady, setApiReady] = useState(false);

  useEffect(() => {
    const loadFromApi = async () => {
      try {
        const res = await api.getBookings();
        if (res.data) {
          const flat = res.data.map(toFlat);
          setBookings(flat);
          safeWriteJson(BOOKINGS_STORAGE_KEY, flat);
          setApiReady(true);
        }
      } catch (err) {
        console.error("loadFromApi failed:", err);
        // API not available, use localStorage (already set via useState)
      }
    };
    loadFromApi();
  }, []);

    // Hydrate shared in-memory room list from persisted room states is no longer needed since ROOMS mockData is removed.

  useEffect(() => {
    safeWriteJson(BOOKINGS_STORAGE_KEY, bookings);
  }, [bookings]);

  const filtered = bookings.filter(b => {
    const matchFilter = filter === 'all' || b.status === filter;
    const matchSearch = !search || b.guest.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase()) || b.room.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleAction = useCallback(async (booking, newStatus) => {
    if (newStatus === 'deleted') {
      if (!window.confirm(`Are you sure you want to permanently delete Booking ${booking.id}?`)) return;
      if (apiReady && booking._id) {
        try { await api.deleteBooking(booking._id); }
        catch (err) { console.error('Failed to delete booking', err); return; }
      }
      setBookings(prev => {
        const next = prev.filter(b => b.id !== booking.id);
        safeWriteJson(BOOKINGS_STORAGE_KEY, next);
        return next;
      });
      return;
    }

    const apiStatus = newStatus.replace(/-/g, '_');
    // Try API first
    if (apiReady && booking._id) {
      try {
        if (newStatus === 'checked-in') {
          await api.checkIn(booking._id);
        } else if (newStatus === 'checked-out') {
          await api.checkOut(booking._id);
        } else if (newStatus === 'cancelled') {
          await api.cancelBooking(booking._id);
        }
      } catch {
        // Fall back to localStorage below
      }
    }
    // Update localStorage booking state
    setBookings(prev => prev.map(b => {
      if (b.id !== booking.id) return b;
      // removed local ROOMS mutation since we don't use ROOMS anymore
      // We still update BOOKINGS_STORAGE_KEY
      const roomId = String(booking.room).split(' – ')[0];
      // The room status will be updated next time RoomsPage loads from API or localStorage
      return { ...b, status: newStatus };
    }));
  }, [apiReady]);

  const handleSave = useCallback(async (form, totalAmount, nights, petCharge) => {
    const newBooking = {
      guest: form.guest,
      phone: form.phone,
      email: form.email,
      room: form.room,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      adults: form.adults,
      children: form.children,
      amount: totalAmount,
      nights,
      petCharge,
      source: form.source,
      specialRequests: form.specialRequests,
      hasPet: form.hasPet,
      petType: form.petType,
      status: 'confirmed',
    };

    // Try API first
    if (apiReady) {
      try {
        const flatForm = fromFlat({ ...newBooking, id: `BK-${Date.now()}` });
        const res = await api.createBooking(flatForm);
        if (res.data) {
          const flat = toFlat(res.data);
          // Backend should update room status automatically, 
          // we don't need to manually update ROOMS mock data.
          setBookings(prev => [...prev, flat]);
          return;
        }
      } catch (err) {
        console.error("createBooking failed:", err);
        // Fall through to localStorage
      }
    }

    // Fallback: localStorage only
    // Note: We don't have ROOMS anymore to mutate, we just create the booking.
    setBookings(prev => [...prev, {
      id: `BK-${1009 + Math.floor(Math.random() * 100)}`,
      ...newBooking,
      room: form.room,
    }]);
  }, [apiReady]);

  const stats = [
    { label: 'Total', count: bookings.length, color: 'var(--text2)' },
    { label: 'Checked In', count: bookings.filter(b => b.status === 'checked-in').length, color: 'var(--green)' },
    { label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length, color: 'var(--teal)' },
    { label: 'Pending', count: bookings.filter(b => b.status === 'pending').length, color: 'var(--amber)' },
    { label: 'With Pets 🐾', count: bookings.filter(b => b.hasPet).length, color: 'var(--gold)' },
  ];

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px)', overflowY: 'auto', flex: 1 }}>
      {showNew && <Modal title="New Booking" onClose={() => setShowNew(false)}><NewBookingForm onClose={() => setShowNew(false)} onSave={handleSave} /></Modal>}
      {selected && <Modal title={`Booking ${selected.id}`} onClose={() => setSelected(null)}><BookingDetail booking={selected} onClose={() => setSelected(null)} onAction={handleAction} /></Modal>}

      {/* Stats + New Booking button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 20px', textAlign: 'center', minWidth: '90px' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'Playfair Display,serif', color: s.color }}>{s.count}</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowNew(true)}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'DM Sans,sans-serif',
            flexShrink: 0,
          }}
        >
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