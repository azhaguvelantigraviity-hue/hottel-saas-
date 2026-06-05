import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import { HALLS, EVENT_BOOKINGS, CATERING_PACKAGES } from '../data/mockData';

const TABS = ['Halls', 'Bookings', 'Catering', 'New Booking'];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const statusColor = { confirmed: 'green', pending: 'amber', completed: 'teal', cancelled: 'rose' };
const paymentStatusColor = { unpaid: 'rose', partial: 'amber', paid: 'green', refunded: 'gray' };
const paymentStatusLabel = { unpaid: 'Unpaid', partial: 'Partial', paid: 'Paid', refunded: 'Refunded' };
const STORAGE_HALLS = 'stayos_halls';
const STORAGE_BOOKINGS = 'stayos_event_bookings';
const STORAGE_CATERING = 'stayos_catering';

const safeRead = (key, fallback) => {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
};
const safeWrite = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

const inputStyle = {
  width: '100%', padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: '8px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
};
const labelStyle = { fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' };

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflow: 'auto' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: '18px' }}>{title}</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
          <Icon name="x" size={20} color="var(--text3)" />
        </button>
      </div>
      <div style={{ padding: 'clamp(12px, 3vw, 24px)' }}>{children}</div>
    </div>
  </div>
);

// ── Add/Edit Hall Modal ─────────────────────────────────────
const AddHallModal = ({ onClose, onSave, editHall }) => {
  const [form, setForm] = useState(editHall || { name: '', capacity: '', rate: '', description: '', amenities: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleSave = () => {
    if (!form.name || !form.capacity || !form.rate) return alert('Name, capacity, and rate are required');
    onSave({
      ...(editHall || {}),
      id: editHall ? editHall.id : `H${String(Date.now()).slice(-4)}`,
      name: form.name,
      capacity: +form.capacity,
      rate: +form.rate,
      description: form.description || '',
      amenities: form.amenities ? form.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
      available: [true,true,true,true,true,true,true],
    });
    onClose();
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {[['name','Hall Name','text'],['capacity','Capacity (pax)','number'],['rate','Rate per Event (₹)','number']].map(([f, lbl, t]) => (
        <div key={f}>
          <label style={labelStyle}>{lbl} *</label>
          <input type={t} value={form[f]} onChange={e => set(f, e.target.value)} style={inputStyle} />
        </div>
      ))}
      <div>
        <label style={labelStyle}>Description</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
      </div>
      <div>
        <label style={labelStyle}>Amenities (comma-separated)</label>
        <input value={form.amenities} onChange={e => set('amenities', e.target.value)} placeholder="Stage, Sound System, AC, Projector" style={inputStyle} />
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button onClick={onClose} style={{ padding: '9px 18px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
        <button onClick={handleSave} style={{ padding: '9px 20px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>{editHall ? 'Update Hall' : 'Add Hall'}</button>
      </div>
    </div>
  );
};

// ── Record Payment Modal ────────────────────────────────────
const RecordPaymentModal = ({ booking, onClose, onSave }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const balanceDue = (booking.amount || booking.totalAmount || 0) - (booking.deposit || 0);

  const handleRecord = () => {
    const payAmt = +amount;
    if (!payAmt || payAmt <= 0) return alert('Enter a valid payment amount');
    if (payAmt > balanceDue) return alert(`Amount exceeds balance due of ₹${balanceDue.toLocaleString()}`);
    const newDeposit = (booking.deposit || 0) + payAmt;
    const total = booking.amount || booking.totalAmount || 0;
    const newPaymentStatus = newDeposit >= total ? 'paid' : 'partial';
    onSave(booking, {
      deposit: newDeposit,
      paymentMethod: method,
      paymentStatus: newPaymentStatus,
      paymentDate: date,
      dueDate: booking.dueDate || '',
      refundAmount: booking.refundAmount || 0,
    });
    onClose();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '14px' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: 'var(--text2)' }}>PAYMENT SUMMARY</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text2)', marginBottom: '4px' }}>
          <span>Total Amount</span><span style={{ fontFamily: 'DM Mono,monospace' }}>₹{(total = (booking.amount || booking.totalAmount || 0)).toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text2)', marginBottom: '4px' }}>
          <span>Deposit So Far</span><span style={{ fontFamily: 'DM Mono,monospace' }}>₹{(booking.deposit || 0).toLocaleString()}</span>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '700', color: 'var(--gold)' }}>
          <span>Balance Due</span><span style={{ fontFamily: 'DM Mono,monospace' }}>₹{(total - (booking.deposit || 0)).toLocaleString()}</span>
        </div>
      </div>
      <div>
        <label style={labelStyle}>Payment Amount (₹) *</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`Max ₹${balanceDue.toLocaleString()}`} style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Payment Method *</label>
        <select value={method} onChange={e => setMethod(e.target.value)} style={inputStyle}>
          <option value="cash">Cash</option>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
          <option value="transfer">Bank Transfer</option>
          <option value="cheque">Cheque</option>
        </select>
      </div>
      <div>
        <label style={labelStyle}>Payment Date *</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button onClick={onClose} style={{ padding: '9px 18px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
        <button onClick={handleRecord} style={{ padding: '9px 20px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>Record Payment</button>
      </div>
    </div>
  );
};

// ── Booking Detail Modal ────────────────────────────────────
const BookingDetailModal = ({ booking, onClose, onAction, onRecordPayment, setShowRecordPayment }) => {
  const total = booking.amount || booking.totalAmount || 0;
  const deposit = booking.deposit || 0;
  const balanceDue = total - deposit;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '10px' }}>
        {[['Booking ID', booking.id || booking.bookingId], ['Event', booking.event || booking.eventName],
          ['Hall', booking.hall], ['Date', booking.date],
          ['Client', booking.client || booking.clientName], ['Phone', booking.phone || booking.clientPhone || '—'],
          ['Guests', booking.guests], ['Catering', booking.catering || booking.cateringPackage || '—'],
        ].map(([k, v]) => (
          <div key={k} style={{ background: 'var(--surface)', borderRadius: '8px', padding: '10px 12px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text3)', letterSpacing: '0.06em', marginBottom: '3px' }}>{k.toUpperCase()}</div>
            <div style={{ fontSize: '13px', fontWeight: '600' }}>{v || '—'}</div>
          </div>
        ))}
      </div>

      {/* Payment Section */}
      <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2)', letterSpacing: '0.04em' }}>PAYMENT</div>
          <Badge color={paymentStatusColor[booking.paymentStatus] || 'gray'}>{paymentStatusLabel[booking.paymentStatus] || booking.paymentStatus}</Badge>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text2)', marginBottom: '4px' }}>
          <span>Total Amount</span><span style={{ fontFamily: 'DM Mono,monospace', fontWeight: '600' }}>₹{total.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text2)', marginBottom: '4px' }}>
          <span>Deposit</span><span style={{ fontFamily: 'DM Mono,monospace', fontWeight: '600' }}>₹{deposit.toLocaleString()}</span>
        </div>
        {booking.paymentMethod && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text2)', marginBottom: '4px' }}>
            <span>Payment Method</span><span style={{ textTransform: 'capitalize', fontWeight: '500' }}>{booking.paymentMethod}</span>
          </div>
        )}
        {booking.paymentDate && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text2)', marginBottom: '4px' }}>
            <span>Payment Date</span><span>{booking.paymentDate}</span>
          </div>
        )}
        {booking.dueDate && booking.paymentStatus !== 'paid' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--rose)', marginBottom: '4px' }}>
            <span>Due Date</span><span>{booking.dueDate}</span>
          </div>
        )}
        <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '700', color: 'var(--gold)' }}>
          <span>Balance Due</span><span style={{ fontFamily: 'DM Mono,monospace' }}>₹{balanceDue.toLocaleString()}</span>
        </div>
        {booking.refundAmount > 0 && (
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--rose)' }}>
            <span>Refund Amount</span><span style={{ fontFamily: 'DM Mono,monospace' }}>₹{booking.refundAmount.toLocaleString()}</span>
          </div>
        )}
      </div>

      {booking.notes && (
        <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '4px' }}>NOTES</div>
          <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{booking.notes}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {(booking.paymentStatus === 'unpaid' || booking.paymentStatus === 'partial') && (
          <button onClick={() => { setShowRecordPayment(true); }} style={{ flex: 1, padding: '10px', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '8px', color: 'var(--green)', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
            Record Payment
          </button>
        )}
        {booking.status === 'pending' && (
          <button onClick={() => { onAction(booking, 'confirmed'); onClose(); }} style={{ flex: 1, padding: '10px', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '8px', color: 'var(--green)', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
            Confirm Booking
          </button>
        )}
        {booking.status === 'confirmed' && (
          <button onClick={() => { onAction(booking, 'completed'); onClose(); }} style={{ flex: 1, padding: '10px', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '8px', color: 'var(--gold)', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
            Mark Completed
          </button>
        )}
        {(booking.status === 'pending' || booking.status === 'confirmed') && (
          <button onClick={() => { onAction(booking, 'cancelled'); onClose(); }} style={{ padding: '10px 16px', background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', borderRadius: '8px', color: 'var(--rose)', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

// ── Add Catering Package Modal ─────────────────────────────
const AddCateringModal = ({ onClose, onSave, editPkg }) => {
  const [form, setForm] = useState(editPkg || { name: '', price: '', items: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleSave = () => {
    if (!form.name || !form.price) return alert('Name and price are required');
    onSave({
      ...(editPkg || {}),
      name: form.name,
      price: +form.price,
      items: form.items ? form.items.split(',').map(i => i.trim()).filter(Boolean) : [],
    });
    onClose();
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label style={labelStyle}>Package Name *</label>
        <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Silver" style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Price per Head (₹) *</label>
        <input type="number" value={form.price} onChange={e => set('price', e.target.value)} style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Items (comma-separated)</label>
        <textarea value={form.items} onChange={e => set('items', e.target.value)} rows={4} placeholder="Welcome Drink, Starter (Veg), Main Course (2 items)..." style={{ ...inputStyle, resize: 'vertical' }} />
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button onClick={onClose} style={{ padding: '9px 18px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
        <button onClick={handleSave} style={{ padding: '9px 20px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>{editPkg ? 'Update Package' : 'Add Package'}</button>
      </div>
    </div>
  );
};

// ── Main Page ───────────────────────────────────────────────
const EventsPage = () => {
  const [tab, setTab] = useState(0);
  const [showAddHall, setShowAddHall] = useState(false);
  const [showAddCatering, setShowAddCatering] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [editHall, setEditHall] = useState(null);
  const [editCatering, setEditCatering] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const [halls, setHalls] = useState(() => safeRead(STORAGE_HALLS, HALLS));
  const [bookings, setBookings] = useState(() => safeRead(STORAGE_BOOKINGS, EVENT_BOOKINGS));
  const [catering, setCatering] = useState(() => safeRead(STORAGE_CATERING, CATERING_PACKAGES));

  useEffect(() => { safeWrite(STORAGE_HALLS, halls); }, [halls]);
  useEffect(() => { safeWrite(STORAGE_BOOKINGS, bookings); }, [bookings]);
  useEffect(() => { safeWrite(STORAGE_CATERING, catering); }, [catering]);

  // New Booking form state
  const [form, setForm] = useState({ event:'', client:'', phone:'', email:'', hall:'', date:'', startTime:'', endTime:'', guests:'', catering:'Standard', notes:'', deposit:'', paymentMethod:'', dueDate:'' });
  const setFormField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selectedHall = halls.find(h => h.name === form.hall);
  const selectedCatering = catering.find(c => c.name === form.catering);
  const hallRate = selectedHall?.rate || 0;
  const cateringPrice = selectedCatering?.price || 0;
  const totalAmount = hallRate + (cateringPrice * (+form.guests || 0));
  const depositAmt = +form.deposit || 0;
  const balanceDue = totalAmount - depositAmt;

  // Stats
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const pendingPayments = bookings.filter(b => b.paymentStatus === 'unpaid' || b.paymentStatus === 'partial').length;
  const stats = [
    { label: 'Total Halls', value: halls.length, icon: 'events', iconColor: 'var(--violet)' },
    { label: 'Bookings This Month', value: bookings.filter(b => { const d = new Date(b.date); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; }).length, icon: 'calendar', iconColor: 'var(--gold)' },
    { label: 'Revenue', value: `₹${bookings.filter(b => b.status === 'completed').reduce((s, b) => s + (b.amount || b.totalAmount || 0), 0).toLocaleString()}`, icon: 'dollar', iconColor: 'var(--green)' },
    { label: 'Pending Payments', value: pendingPayments, icon: 'receipt', iconColor: 'var(--amber)' },
  ];

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    const mf = filterStatus === 'all' || b.status === filterStatus;
    const ms = !search || (b.event || b.eventName || '').toLowerCase().includes(search.toLowerCase()) || (b.client || b.clientName || '').toLowerCase().includes(search.toLowerCase()) || (b.id || b.bookingId || '').toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  // Actions
  const addHall = (hall) => setHalls(prev => {
    const existing = prev.findIndex(h => h.id === hall.id);
    if (existing >= 0) { const next = [...prev]; next[existing] = hall; return next; }
    return [...prev, hall];
  });

  const deleteHall = (id) => { if (confirm('Delete this hall?')) setHalls(prev => prev.filter(h => h.id !== id)); };

  const addBooking = (booking) => setBookings(prev => [booking, ...prev]);

  const updateBookingStatus = (booking, newStatus) => setBookings(prev => prev.map(b => {
    if ((b.id || b.bookingId) !== (booking.id || booking.bookingId)) return b;
    const updates = {};
    if (newStatus === 'cancelled' && (b.deposit || 0) > 0) {
      updates.paymentStatus = 'refunded';
      updates.refundAmount = b.deposit || 0;
    }
    return { ...b, status: newStatus, ...updates };
  }));

  const updatePayment = (booking, paymentData) => setBookings(prev => prev.map(b => {
    if ((b.id || b.bookingId) !== (booking.id || booking.bookingId)) return b;
    return { ...b, ...paymentData };
  }));

  const addCateringPkg = (pkg) => setCatering(prev => {
    const existing = prev.findIndex(p => p.name === pkg.name);
    if (existing >= 0) { const next = [...prev]; next[existing] = pkg; return next; }
    return [...prev, pkg];
  });

  const deleteCateringPkg = (name) => { if (confirm('Delete this package?')) setCatering(prev => prev.filter(p => p.name !== name)); };

  const PAYMENT_METHODS = [
    { value: '', label: 'Select Method' },
    { value: 'cash', label: 'Cash' },
    { value: 'upi', label: 'UPI' },
    { value: 'card', label: 'Card' },
    { value: 'transfer', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' },
  ];

  const handleCreateBooking = () => {
    if (!form.event || !form.client || !form.date || !form.guests || !form.hall) {
      alert('Please fill in all required fields: Event Name, Client, Date, Guests, and Hall');
      return;
    }
    const deposit = +form.deposit || 0;
    let paymentStatus = 'unpaid';
    if (deposit >= totalAmount) paymentStatus = 'paid';
    else if (deposit > 0) paymentStatus = 'partial';
    addBooking({
      id: `EVT-${String(bookings.length + 1).padStart(3, '0')}`,
      event: form.event,
      client: form.client,
      phone: form.phone,
      email: form.email,
      hall: form.hall,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      guests: +form.guests,
      catering: form.catering,
      amount: totalAmount,
      deposit,
      paymentMethod: form.paymentMethod,
      paymentStatus,
      dueDate: form.dueDate,
      paymentDate: deposit > 0 ? new Date().toISOString().split('T')[0] : '',
      refundAmount: 0,
      status: 'pending',
      notes: form.notes,
    });
    setForm({ event:'', client:'', phone:'', email:'', hall:'', date:'', startTime:'', endTime:'', guests:'', catering:'Standard', notes:'', deposit:'', paymentMethod:'', dueDate:'' });
    setTab(1);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
      {showAddHall && <Modal title={editHall ? 'Edit Hall' : 'Add Hall'} onClose={() => { setShowAddHall(false); setEditHall(null); }}><AddHallModal onClose={() => { setShowAddHall(false); setEditHall(null); }} onSave={addHall} editHall={editHall} /></Modal>}
      {selectedBooking && !showRecordPayment && <Modal title={`Booking ${selectedBooking.id || selectedBooking.bookingId}`} onClose={() => setSelectedBooking(null)}><BookingDetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} onAction={updateBookingStatus} setShowRecordPayment={setShowRecordPayment} /></Modal>}
      {selectedBooking && showRecordPayment && <Modal title="Record Payment" onClose={() => setShowRecordPayment(false)}><RecordPaymentModal booking={selectedBooking} onClose={() => setShowRecordPayment(false)} onSave={updatePayment} /></Modal>}
      {showAddCatering && <Modal title={editCatering ? 'Edit Package' : 'Add Catering Package'} onClose={() => { setShowAddCatering(false); setEditCatering(null); }}><AddCateringModal onClose={() => { setShowAddCatering(false); setEditCatering(null); }} onSave={addCateringPkg} editPkg={editCatering} /></Modal>}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 16, marginBottom: 24 }}>
        {stats.map(s => <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} iconColor={s.iconColor} />)}
      </div>

      {/* Tabs */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface)', borderRadius: 10, padding: 4 }}>
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: '9px 8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, background: tab === i ? 'var(--card)' : 'transparent', color: tab === i ? 'var(--gold)' : 'var(--text2)' }}>{t}</button>
          ))}
        </div>

        {/* ── TAB 0: Halls ──────────────────────────────────── */}
        {tab === 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button onClick={() => { setEditHall(null); setShowAddHall(true); }} style={{ padding: '8px 16px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Inter, sans-serif' }}>
                <Icon name="plus" size={14} color="#fff" /> Add Hall
              </button>
            </div>
            {halls.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>No halls added yet. Click "Add Hall" to get started.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
                {halls.map(hall => (
                  <div key={hall.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
                      <button onClick={() => { setEditHall(hall); setShowAddHall(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 2 }} title="Edit"><Icon name="edit" size={14} color="var(--text2)" /></button>
                      <button onClick={() => deleteHall(hall.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rose)', padding: 2 }} title="Delete"><Icon name="trash" size={14} color="var(--rose)" /></button>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{hall.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 12 }}>Capacity: {hall.capacity} pax · ₹{hall.rate.toLocaleString()}/event</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                      {hall.amenities.map(a => <span key={a} style={{ fontSize: 11, padding: '3px 8px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--text3)' }}>{a}</span>)}
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Next 7 Days</div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {hall.available.map((av, i) => (
                          <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ fontSize: 9, color: 'var(--text3)', marginBottom: 3 }}>{DAYS[i]}</div>
                            <div style={{ width: '100%', height: 8, borderRadius: 4, background: av ? 'var(--green)' : 'var(--rose)', opacity: 0.8 }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => { setFormField('hall', hall.name); setTab(3); }} style={{ width: '100%', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: 8, padding: '10px', color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13 }}>Book Hall</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 1: Bookings ───────────────────────────────── */}
        {tab === 1 && (
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize', background: filterStatus === s ? 'var(--gold)' : 'transparent', borderColor: filterStatus === s ? 'var(--gold)' : 'var(--border)', color: filterStatus === s ? '#000' : 'var(--text2)' }}>
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
              <div style={{ marginLeft: 'auto' }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search event, client, ID…" style={{ ...inputStyle, width: '220px' }} />
              </div>
            </div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                    {['ID','Event','Hall','Date','Client','Guests','Amount','Payment','Status'].map(h => <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h.toUpperCase()}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', fontSize: '14px' }}>No bookings found</td></tr>
                  ) : filteredBookings.map(b => (
                    <tr key={b.id || b.bookingId} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onClick={() => { setSelectedBooking(b); setShowRecordPayment(false); }}
                    >
                      <td style={{ padding: '12px', fontSize: '12px', fontFamily: 'DM Mono,monospace', color: 'var(--gold)' }}>{b.id || b.bookingId}</td>
                      <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>{b.event || b.eventName}</td>
                      <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text2)' }}>{b.hall}</td>
                      <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text2)' }}>{b.date}</td>
                      <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text)' }}>{b.client || b.clientName}</td>
                      <td style={{ padding: '12px', fontSize: '13px', textAlign: 'center', color: 'var(--text2)' }}>{b.guests}</td>
                      <td style={{ padding: '12px', fontSize: '13px', fontFamily: 'DM Mono,monospace' }}>₹{(b.amount || b.totalAmount || 0).toLocaleString()}</td>
                      <td style={{ padding: '12px' }}><Badge color={paymentStatusColor[b.paymentStatus] || 'gray'}>{paymentStatusLabel[b.paymentStatus] || b.paymentStatus}</Badge></td>
                      <td style={{ padding: '12px' }}><Badge color={statusColor[b.status] || 'gray'}>{b.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: Catering ───────────────────────────────── */}
        {tab === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button onClick={() => { setEditCatering(null); setShowAddCatering(true); }} style={{ padding: '8px 16px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Inter, sans-serif' }}>
                <Icon name="plus" size={14} color="#fff" /> Add Package
              </button>
            </div>
            {catering.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>No catering packages added yet. Click "Add Package" to create one.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
                {catering.map((pkg, i) => {
                  const colors = ['var(--teal)', 'var(--gold)', 'var(--violet)'];
                  const c = colors[i % colors.length];
                  return (
                    <div key={pkg.name} style={{ background: 'var(--surface)', border: `1px solid ${c}44`, borderRadius: 'var(--radius)', padding: 20, position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
                        <button onClick={() => { setEditCatering(pkg); setShowAddCatering(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }} title="Edit"><Icon name="edit" size={14} color="var(--text2)" /></button>
                        <button onClick={() => deleteCateringPkg(pkg.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }} title="Delete"><Icon name="trash" size={14} color="var(--rose)" /></button>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: c, marginBottom: 4 }}>{pkg.name}</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: 'DM Mono, monospace', marginBottom: 16 }}>₹{pkg.price}<span style={{ fontSize: 13, color: 'var(--text3)', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>/head</span></div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {pkg.items.map(item => <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}><Icon name="check" size={14} color={c} />{item}</div>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: New Booking ────────────────────────────── */}
        {tab === 3 && (
          <div style={{ maxWidth: 600 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>New Event Booking</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '14px' }}>
              {[['event','Event Name *','text'],['client','Client Name *','text'],['phone','Phone','text'],['email','Email','email']].map(([f, lbl, t]) => (
                <div key={f}>
                  <label style={labelStyle}>{lbl}</label>
                  <input type={t} value={form[f] || ''} onChange={e => {
                    let val = e.target.value;
                    if (f === 'phone') val = val.replace(/\D/g, '').slice(0, 10);
                    setFormField(f, val);
                  }} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={labelStyle}>Date *</label>
                <input type="date" value={form.date} onChange={e => setFormField('date', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Number of Guests *</label>
                <input type="number" value={form.guests} onChange={e => setFormField('guests', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Start Time</label>
                <input type="time" value={form.startTime} onChange={e => setFormField('startTime', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>End Time</label>
                <input type="time" value={form.endTime} onChange={e => setFormField('endTime', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Hall *</label>
                <select value={form.hall} onChange={e => setFormField('hall', e.target.value)} style={inputStyle}>
                  <option value="">Select Hall</option>
                  {halls.map(h => <option key={h.id} value={h.name}>{h.name} ({h.capacity} pax — ₹{h.rate.toLocaleString()})</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Catering Package</label>
                <select value={form.catering} onChange={e => setFormField('catering', e.target.value)} style={inputStyle}>
                  <option value="None">None</option>
                  {catering.map(c => <option key={c.name} value={c.name}>{c.name} — ₹{c.price}/head</option>)}
                </select>
              </div>
            </div>

            {/* Payment Fields */}
            <div style={{ marginTop: 20, marginBottom: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Payment Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Deposit Amount (₹)</label>
                  <input type="number" value={form.deposit} onChange={e => setFormField('deposit', e.target.value)} placeholder="Advance payment" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Payment Method</label>
                  <select value={form.paymentMethod} onChange={e => setFormField('paymentMethod', e.target.value)} style={inputStyle}>
                    {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Payment Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setFormField('dueDate', e.target.value)} style={inputStyle} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={labelStyle}>Special Requirements</label>
              <textarea value={form.notes} onChange={e => setFormField('notes', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical', width: '100%' }} />
            </div>

            {/* Cost Summary */}
            {form.hall && form.guests > 0 && (
              <div style={{ background: 'var(--surface)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border)', marginTop: 16 }}>
                <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: 'var(--text2)' }}>COST SUMMARY</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text2)', marginBottom: '4px' }}>
                  <span>Hall Rate ({selectedHall?.name || form.hall})</span>
                  <span>₹{hallRate.toLocaleString()}</span>
                </div>
                {form.catering !== 'None' && selectedCatering && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text2)', marginBottom: '4px' }}>
                    <span>Catering ({selectedCatering.name} × {form.guests} guests)</span>
                    <span>₹{(cateringPrice * (+form.guests)).toLocaleString()}</span>
                  </div>
                )}
                <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', color: 'var(--gold)' }}>
                  <span>Total</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
                {depositAmt > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--teal)', marginTop: '8px' }}>
                      <span>Deposit</span>
                      <span style={{ fontWeight: '600' }}>- ₹{depositAmt.toLocaleString()}</span>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '700', color: 'var(--amber)' }}>
                      <span>Balance Due</span>
                      <span>₹{balanceDue.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => { setForm({ event:'', client:'', phone:'', email:'', hall:'', date:'', startTime:'', endTime:'', guests:'', catering:'Standard', notes:'', deposit:'', paymentMethod:'', dueDate:'' }); }} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>Reset</button>
              <button onClick={handleCreateBooking} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>Create Booking</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
