import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import * as api from '../services/hotelService';
import { getUser } from '../services/api';
import html2pdf from 'html2pdf.js';
import InvoiceDocument from '../components/InvoiceDocument';
import RoomRecommendationCard from '../components/RoomRecommendationCard';

const PET_CHARGES = {
  small: { label: 'Small (up to 10kg)', perNight: 500 },
  medium: { label: 'Medium (10kg - 25kg)', perNight: 800 },
  large: { label: 'Large (over 25kg)', perNight: 1200 },
  manual: { label: 'Custom / Manual Rate', perNight: 0 },
  deposit: 2000
};

const statusColor = { 'checked-in': 'green', confirmed: 'teal', pending: 'amber', 'checked-out': 'gray', cancelled: 'rose' };
const sourceColor = { direct: 'gold', 'booking.com': 'teal', expedia: 'violet', agoda: 'rose' };


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
  checkInDateTime: b.checkInDateTime || b.checkIn,
  checkOutDateTime: b.checkOutDateTime || b.checkOut,
  stayDays: b.stayDays || b.nights || 0,
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
  timeline: b.timeline || [],
});

const fromFlat = (f) => ({
  guestName: f.guest,
  phone: f.phone,
  email: f.email,
  idType: f.idType,
  idNumber: f.idNumber,
  address: f.address,
  room: f.room,
  checkIn: f.checkIn,
  checkOut: f.checkOut,
  checkInDateTime: f.checkInDateTime,
  checkOutDateTime: f.checkOutDateTime,
  stayDays: f.stayDays,
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
  petSize: f.petSize,
  petManualRate: f.petManualRate,
  petDiscountType: f.petDiscountType,
  petManualDiscountAmount: f.petManualDiscountAmount,
  petCharge: f.petCharge,
  specialRequests: f.specialRequests,
});

const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const bg = type === 'success' ? 'rgba(16,185,129,0.15)' : type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)';
  const border = type === 'success' ? '1px solid rgba(16,185,129,0.3)' : type === 'error' ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(59,130,246,0.3)';
  const color = type === 'success' ? 'var(--green)' : type === 'error' ? 'var(--rose)' : 'var(--blue)';
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 2000, padding: '14px 20px', background: bg, border, borderRadius: '10px', color, fontSize: '13px', fontWeight: '600', fontFamily: 'Inter, sans-serif', maxWidth: '360px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '10px', animation: 'toastIn 0.3s ease' }}>
      <span>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color, fontSize: '16px', lineHeight: 1, padding: '0 0 0 4px' }}>×</button>
    </div>
  );
};

const Modal = ({ title, onClose, children, isSuccess }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', transition: 'opacity 0.3s', opacity: isSuccess ? 0 : 1 }}>
    <style>{`
      @keyframes successBlink {
        0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); border-color: var(--green); }
        50% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); border-color: var(--green); background-color: rgba(16, 185, 129, 0.05); }
        100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); border-color: var(--border); }
      }
    `}</style>
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflow: 'auto', animation: isSuccess ? 'successBlink 1s ease-out' : 'none' }}>
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
    guest: '', phone: '', email: '', room: '', checkInDateTime: '', stayDays: 1, adults: 1, children: 0,
    source: 'direct', specialRequests: '', hasPet: false, petSize: 'small', petType: '',
    idType: 'aadhaar', idNumber: '', address: '',
    ac: true, smoking: false, nearLift: false, view: 'None', floor: '', budgetMin: '', budgetMax: '',
    petSize: 'small', petManualRate: 0, petDiscountType: 'none', petManualDiscountAmount: 0
  });
  const [availableRooms, setAvailableRooms] = useState([]);
  const [guestFound, setGuestFound] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);
  const [allocationDetails, setAllocationDetails] = useState({ assignedBy: 'Manual' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleAadhaarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setOcrLoading(true);
    try {
      const formData = new FormData();
      formData.append("aadhaarImage", file);

      const apiModule = await import('../services/api').then(m => m.default || m);
      
      // Use standard fetch or axios through apiModule if it supports FormData. 
      // Assuming apiModule.post handles FormData correctly (if it uses axios, it will set Content-Type: multipart/form-data automatically).
      const res = await apiModule.post('/hotel/ocr/aadhaar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data) {
        setForm(f => ({
          ...f,
          guest: res.data.name || f.guest,
          phone: res.data.phone || f.phone,
          address: res.data.address || f.address,
          idNumber: res.data.idNumber || f.idNumber,
          idType: 'aadhaar'
        }));
      }
    } catch (err) {
      console.error('OCR failed:', err);
      alert('OCR failed, please enter Aadhaar details manually');
    } finally {
      setOcrLoading(false);
      // Reset input so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  const triggerLookup = async (params) => {
    try {
      const res = await api.lookupGuest(params);
      if (res.data) {
        setGuestFound(true);
        setForm(f => ({
          ...f,
          guest: res.data.firstName ? `${res.data.firstName} ${res.data.lastName || ''}`.trim() : f.guest,
          phone: res.data.phone || f.phone,
          email: res.data.email || f.email,
          address: res.data.address || f.address,
          idType: res.data.idType || f.idType,
          idNumber: res.data.idNumber || f.idNumber,
        }));
      } else {
        setGuestFound(false);
      }
    } catch (e) {
      setGuestFound(false);
    }
  };

  const fetchAiRecommendations = async () => {
    if (!form.checkInDateTime || !form.stayDays) return alert('Please select check-in date and stay duration first.');
    setIsAiLoading(true);
    setManualOverride(false);
    try {
      const apiModule = await import('../services/api').then(m => m.default || m);
      
      const payload = {
        checkIn: form.checkInDateTime,
        checkOut: new Date(new Date(form.checkInDateTime).getTime() + (form.stayDays || 1) * 24 * 60 * 60 * 1000).toISOString(),
        guestCount: (form.adults || 1) + (form.children || 0),
        ac: form.ac,
        smoking: form.smoking,
        nearLift: form.nearLift,
        view: form.view !== 'None' ? form.view : undefined,
      };
      if (form.floor) payload.floor = Number(form.floor);
      if (form.budgetMin) payload.budgetMin = Number(form.budgetMin);
      if (form.budgetMax) payload.budgetMax = Number(form.budgetMax);

      const res = await apiModule.post(`/hotel/allocations/recommend`, payload);
      if (res.data) setAiRecommendations(res.data);
    } catch (err) {
      console.error('AI Allocation Failed:', err);
      alert('Failed to get AI recommendations.');
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await api.getRooms();
        if (res.data) {
          const mapped = res.data.map(r => ({
            id: r.roomNumber || r._id,
            type: r.type,
            rate: r.baseRate || 0,
            status: r.status,
            maxGuests: r.maxGuests || 2,
            bedType: r.bedType || 'Double'
          }));
          setAvailableRooms(mapped);
        }
      } catch (err) {
        setAvailableRooms([]);
      }
    };
    loadRooms();
  }, []);

  const nights = form.stayDays || 1;
  const checkOutDateObj = form.checkInDateTime ? new Date(new Date(form.checkInDateTime).getTime() + nights * 24 * 60 * 60 * 1000) : null;
  const computedCheckOut = checkOutDateObj ? checkOutDateObj.toLocaleString() : '';

  const selectedRoom = availableRooms.find(r => String(r.id) === String(form.room));
  const roomRate = selectedRoom ? selectedRoom.rate : 0;
  
  let petBaseRate = form.petSize === 'manual' ? Number(form.petManualRate || 0) : PET_CHARGES[form.petSize].perNight;
  let computedPetCharge = form.hasPet ? petBaseRate * nights : 0;
  
  if (form.hasPet) {
    if (form.petDiscountType === 'free') {
      computedPetCharge = 0;
    } else if (form.petDiscountType === 'manual_discount') {
      computedPetCharge = Math.max(0, computedPetCharge - Number(form.petManualDiscountAmount || 0));
    } else if (form.petDiscountType === 'low_budget') {
      computedPetCharge = Math.max(0, computedPetCharge * 0.5); // 50% discount for low budget
    }
  }
  
  const petCharge = form.hasPet ? computedPetCharge + PET_CHARGES.deposit : 0;
  const totalAmount = roomRate * nights + petCharge;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: 'var(--rose)', fontSize: '13px', fontWeight: '500' }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '12px' }}>
        <div style={{ gridColumn: '1 / -1', background: 'rgba(201,168,76,0.1)', padding: '12px', borderRadius: '8px', border: '1px dashed var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gold)' }}>Auto-fill with Aadhaar OCR</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Upload a picture of the guest's Aadhaar card to instantly extract Name, ID, Phone, and Address.</div>
          </div>
          <div>
            <input type="file" id="aadhaar-upload" accept="image/*" style={{ display: 'none' }} onChange={handleAadhaarUpload} />
            <label htmlFor="aadhaar-upload" style={{ background: 'var(--gold)', color: '#000', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, cursor: ocrLoading ? 'not-allowed' : 'pointer', opacity: ocrLoading ? 0.7 : 1, display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              {ocrLoading ? 'Extracting...' : 'Upload Aadhaar'}
            </label>
          </div>
        </div>
        <div>
          <label style={labelStyle}>ID TYPE</label>
          <select style={inputStyle} value={form.idType} onChange={e => set('idType', e.target.value)}>
            <option value="aadhaar">Aadhaar</option>
            <option value="passport">Passport</option>
            <option value="driving_license">Driving License</option>
            <option value="voter_id">Voter ID</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>ID NUMBER (Auto-fill) {guestFound && <span style={{color: 'var(--green)', marginLeft: 4}}>✅ Found</span>}</label>
          <input style={inputStyle} value={form.idNumber} onChange={e => {
            const val = e.target.value;
            set('idNumber', val);
            if (val.length >= 5) triggerLookup({ idNumber: val });
            else setGuestFound(false);
          }} placeholder="Enter ID to search..." />
        </div>
        <div>
          <label style={labelStyle}>GUEST NAME *</label>
          <input style={inputStyle} value={form.guest} onChange={e => set('guest', e.target.value)} placeholder="Full name" />
        </div>
        <div>
          <label style={labelStyle}>PHONE {guestFound && <span style={{color: 'var(--green)', marginLeft: 4}}>✅ Found</span>}</label>
          <input style={inputStyle} value={form.phone} onChange={e => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
            set('phone', val);
            if (val.length === 10) triggerLookup({ phone: val });
            else setGuestFound(false);
          }} placeholder="Mobile number (10 digits)" />
        </div>
        <div>
          <label style={labelStyle}>EMAIL</label>
          <input style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} placeholder="Email address" />
        </div>
        <div>
          <label style={labelStyle}>ADDRESS</label>
          <input style={inputStyle} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Guest full address" />
        </div>
        <div>
          <label style={labelStyle}>CHECK-IN DATE & TIME *</label>
          <input type="datetime-local" style={inputStyle} value={form.checkInDateTime} onChange={e => set('checkInDateTime', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>STAY DURATION (DAYS) *</label>
          <input type="number" min="1" style={inputStyle} value={form.stayDays} onChange={e => set('stayDays', +e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>CHECK-OUT DATE & TIME</label>
          <div style={{ ...inputStyle, background: 'var(--bg)', color: 'var(--text3)' }}>
            {computedCheckOut || 'Select check-in time'}
          </div>
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

        <div style={{ gridColumn: '1 / -1', background: 'var(--bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--primary)' }}>✨ AI Smart Room Allocation Preferences</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.ac} onChange={e => set('ac', e.target.checked)} /> AC Room
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.smoking} onChange={e => set('smoking', e.target.checked)} /> Smoking Allowed
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.nearLift} onChange={e => set('nearLift', e.target.checked)} /> Near Lift
            </label>
            <div>
              <label style={labelStyle}>View</label>
              <select style={{...inputStyle, padding: '4px'}} value={form.view} onChange={e => set('view', e.target.value)}>
                <option value="None">No Preference</option>
                <option value="Sea">Sea View</option>
                <option value="City">City View</option>
                <option value="Garden">Garden View</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Floor</label>
              <input type="number" style={{...inputStyle, padding: '4px'}} value={form.floor} onChange={e => set('floor', e.target.value)} placeholder="e.g. 2" />
            </div>
            <div>
              <label style={labelStyle}>Budget Min-Max</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input type="number" style={{...inputStyle, padding: '4px'}} value={form.budgetMin} onChange={e => set('budgetMin', e.target.value)} placeholder="Min" />
                <input type="number" style={{...inputStyle, padding: '4px'}} value={form.budgetMax} onChange={e => set('budgetMax', e.target.value)} placeholder="Max" />
              </div>
            </div>
          </div>
          
          {!aiRecommendations && !manualOverride ? (
            <button type="button" onClick={fetchAiRecommendations} disabled={isAiLoading} style={{ width: '100%', padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: isAiLoading ? 'wait' : 'pointer' }}>
              {isAiLoading ? 'Analyzing Options...' : '✨ Find Best Room Match'}
            </button>
          ) : aiRecommendations ? (
            <RoomRecommendationCard 
              recommendations={aiRecommendations}
              onAutoAssign={(rec) => {
                set('room', String(rec.room.roomNumber || rec.room._id));
                setAllocationDetails({ assignedBy: 'AI', score: rec.score, reason: rec.reasons });
                setAiRecommendations(null);
                setManualOverride(true);
              }}
              onSelectAlternative={(rec) => {
                set('room', String(rec.room.roomNumber || rec.room._id));
                setAllocationDetails({ assignedBy: 'AI', score: rec.score, reason: rec.reasons });
                setAiRecommendations(null);
                setManualOverride(true);
              }}
              onManualOverride={() => {
                setAiRecommendations(null);
                setManualOverride(true);
                setAllocationDetails({ assignedBy: 'Manual', score: null, reason: [] });
              }}
            />
          ) : (
            <div>
              <label style={labelStyle}>MANUAL ROOM SELECTION *</label>
              <div style={{display: 'flex', gap: '10px'}}>
                <select style={inputStyle} value={form.room} onChange={e => {
                  set('room', e.target.value);
                  setAllocationDetails({ assignedBy: 'Manual', score: null, reason: [] });
                }}>
                  <option value="">Select room</option>
                  {availableRooms.filter(r => r.status === 'available').map(r => (
                    <option key={r.id} value={r.id}>{r.id} – {r.type} (Max {r.maxGuests}, {r.bedType}) (₹{r.rate}/night)</option>
                  ))}
                </select>
                <button type="button" onClick={() => setManualOverride(false)} className="btn-secondary" style={{whiteSpace: 'nowrap'}}>
                  Retry AI
                </button>
              </div>
            </div>
          )}
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
                  <option key={k} value={k}>{v.label} {k !== 'manual' ? `— ₹${v.perNight}/night` : ''}</option>
                ))}
              </select>
            </div>
            {form.petSize === 'manual' && (
              <div>
                <label style={labelStyle}>ENTER PET CHARGE PER NIGHT *</label>
                <input type="number" min="0" style={inputStyle} value={form.petManualRate} onChange={e => set('petManualRate', Math.max(0, Number(e.target.value)))} placeholder="e.g. 200" />
              </div>
            )}
            <div>
              <label style={labelStyle}>PET TYPE / BREED</label>
              <input style={inputStyle} value={form.petType} onChange={e => set('petType', e.target.value)} placeholder="e.g. Golden Retriever" />
            </div>
            <div>
              <label style={labelStyle}>DISCOUNT OPTION</label>
              <select style={inputStyle} value={form.petDiscountType} onChange={e => set('petDiscountType', e.target.value)}>
                <option value="none">No Discount</option>
                <option value="low_budget">Low Budget Pet Rate</option>
                <option value="manual_discount">Manual Discount</option>
                <option value="free">Free Pet Stay</option>
              </select>
            </div>
            {form.petDiscountType === 'manual_discount' && (
              <div>
                <label style={labelStyle}>MANUAL DISCOUNT AMOUNT</label>
                <input type="number" min="0" style={inputStyle} value={form.petManualDiscountAmount} onChange={e => set('petManualDiscountAmount', Math.max(0, Number(e.target.value)))} placeholder="e.g. 150" />
              </div>
            )}
            <div style={{ gridColumn: 'span 2', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text2)', marginBottom: '4px' }}>
                <span>Pet charge ({nights} nights × ₹{form.petSize === 'manual' ? form.petManualRate : PET_CHARGES[form.petSize].perNight})</span>
                <span>₹{( (form.petSize === 'manual' ? form.petManualRate : PET_CHARGES[form.petSize].perNight) * nights ).toLocaleString()}</span>
              </div>
              {form.petDiscountType !== 'none' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--rose)', marginBottom: '4px' }}>
                  <span>Discount ({form.petDiscountType.replace('_', ' ')})</span>
                  <span>- ₹{( (form.petSize === 'manual' ? form.petManualRate : PET_CHARGES[form.petSize].perNight) * nights - computedPetCharge ).toLocaleString()}</span>
                </div>
              )}
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
        <button onClick={onClose} disabled={isSubmitting || isSuccess} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: (isSubmitting || isSuccess) ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans,sans-serif', fontSize: '13px' }}>
          Cancel
        </button>
        <button
          disabled={isSubmitting || isSuccess}
          onClick={async () => {
            if (form.guest && form.room && form.checkInDateTime && form.stayDays > 0) {
              setIsSubmitting(true);
              setError('');
              try {
                await onSave({ ...form, checkIn: form.checkInDateTime, checkOut: checkOutDateObj.toISOString(), checkOutDateTime: checkOutDateObj.toISOString(), allocationDetails, preferences: { ac: form.ac, smoking: form.smoking, nearLift: form.nearLift, view: form.view, floor: form.floor, budgetMin: form.budgetMin, budgetMax: form.budgetMax } }, totalAmount, nights, petCharge);
                setIsSuccess(true);
                // Parent handles the auto-close
              } catch (err) {
                setError(err.message || 'Failed to create booking.');
              } finally {
                setIsSubmitting(false);
              }
            } else {
              setError("Please fill out all required fields.");
            }
          }}
          style={{ padding: '10px 24px', background: isSuccess ? 'var(--green)' : 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: (isSubmitting || isSuccess) ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'DM Sans,sans-serif', opacity: (isSubmitting && !isSuccess) ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {isSubmitting && !isSuccess && <Icon name="loader" size={14} className="spin" color="#fff" />}
          {isSuccess ? 'Booked ✓' : isSubmitting ? 'Creating...' : 'Create Booking'}
        </button>
      </div>
    </div>
  );
};

const ExtendStayForm = ({ booking, onClose, onSave }) => {
  const [extendType, setExtendType] = useState('hours');
  const [value, setValue] = useState(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '13px', color: 'var(--text2)' }}>
        Current Check-out: <strong>{booking.checkOutDateTime ? new Date(booking.checkOutDateTime).toLocaleString() : booking.checkOut}</strong>
      </div>
      <div>
        <label style={labelStyle}>EXTENSION TYPE</label>
        <select style={inputStyle} value={extendType} onChange={e => setExtendType(e.target.value)}>
          <option value="hours">Hours</option>
          <option value="days">Days</option>
        </select>
      </div>
      <div>
        <label style={labelStyle}>{extendType === 'hours' ? 'NUMBER OF HOURS' : 'NUMBER OF DAYS'}</label>
        <input type="number" min="1" style={inputStyle} value={value} onChange={e => setValue(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
        <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontSize: '13px' }}>
          Cancel
        </button>
        <button
          onClick={() => {
            const data = extendType === 'hours' ? { addHours: Number(value) } : { addDays: Number(value) };
            onSave(data);
          }}
          style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'DM Sans,sans-serif' }}
        >
          Confirm Extension
        </button>
      </div>
    </div>
  );
};

const ChangeRoomForm = ({ booking, onClose, onSave }) => {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [newRoomId, setNewRoomId] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    api.getRooms().then(res => {
      if (res.data) setAvailableRooms(res.data.filter(r => r.status === 'available'));
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '13px', color: 'var(--text2)' }}>
        Current Room: <strong>{booking.room}</strong>
      </div>
      <div>
        <label style={labelStyle}>SELECT NEW ROOM *</label>
        <select style={inputStyle} value={newRoomId} onChange={e => setNewRoomId(e.target.value)}>
          <option value="">Select available room</option>
          {availableRooms.map(r => (
            <option key={r._id} value={r._id}>{r.roomNumber} – {r.type} (₹{r.baseRate}/night)</option>
          ))}
        </select>
      </div>
      <div>
        <label style={labelStyle}>REASON FOR CHANGE</label>
        <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }} value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. AC not working..." />
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
        <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontSize: '13px' }}>
          Cancel
        </button>
        <button
          onClick={() => { if(newRoomId) onSave({ newRoomId, reason }); }}
          style={{ padding: '10px 24px', background: 'var(--gold)', border: 'none', borderRadius: '8px', color: '#000', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'DM Sans,sans-serif' }}
        >
          Change Room
        </button>
      </div>
    </div>
  );
};

const BookingDetail = ({ booking, onClose, onAction, apiReady }) => {
  const [documents, setDocuments] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showExtend, setShowExtend] = useState(false);
  const [showChangeRoom, setShowChangeRoom] = useState(false);
  const balance = Math.max(0, (booking.amount || 0) - (booking.paid || 0));
  const [paymentAmount, setPaymentAmount] = useState(balance);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  const [isPrinting, setIsPrinting] = useState(false);
  const user = getUser();
  const hotelDetails = user?.hotel || null;

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(async () => {
      try {
        const element = document.getElementById('booking-invoice-wrap');
        if (element) {
          const opt = {
            margin:       0,
            filename:     `${booking.id || 'Invoice'}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
          };
          await html2pdf().from(element).set(opt).save();
        }
      } catch (err) {
        console.error(err);
        alert('Failed to generate invoice PDF.');
      } finally {
        setIsPrinting(false);
      }
    }, 800);
  };

  useEffect(() => {
    if (booking._id) {
      api.getDocuments(booking._id).then(res => setDocuments(res.data || [])).catch(err => console.error(err));
    }
  }, [booking._id]);

  if (showExtend) {
    return <ExtendStayForm booking={booking} onClose={() => setShowExtend(false)} onSave={(data) => { onAction(booking, 'extend-stay', data); setShowExtend(false); onClose(); }} />;
  }

  if (showChangeRoom) {
    return <ChangeRoomForm booking={booking} onClose={() => setShowChangeRoom(false)} onSave={(data) => { onAction(booking, 'change-room', data); setShowChangeRoom(false); onClose(); }} />;
  }

  return (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '12px' }}>
      {[
        ['Booking ID', booking.id], ['Guest', booking.guest], ['Phone', booking.phone || '—'],
        ['Email', booking.email || '—'], ['Room', booking.room], ['Source', booking.source],
        ['Check-in', booking.checkInDateTime ? new Date(booking.checkInDateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : booking.checkIn],
        ['Check-out', booking.checkOutDateTime ? new Date(booking.checkOutDateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : booking.checkOut],
        ['Stay Days', booking.stayDays || booking.nights], ['Adults', booking.adults], ['Children', booking.children || 0],
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
    {documents.length > 0 && (
      <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '12px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '8px' }}>UPLOADED DOCUMENTS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {documents.map(d => (
            <div key={d._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: 'var(--bg)', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="file" size={14} color="var(--gold)" />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{d.docType}</span>
              </div>
              <a href={d.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', fontSize: '12px', textDecoration: 'none', fontWeight: 600 }}>View</a>
            </div>
          ))}
        </div>
      </div>
    )}

    {booking.timeline && booking.timeline.length > 0 && (
      <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '12px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '8px' }}>ACTIVITY TIMELINE</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {booking.timeline.map((log, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)', marginTop: '4px' }}></div>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text)' }}>{log.description}</div>
                <div style={{ fontSize: '10px', color: 'var(--text3)' }}>{new Date(log.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {booking.status === 'confirmed' && !showCheckout && (
        <button onClick={() => { onAction(booking, 'checked-in'); onClose(); }} style={{ flex: 1, padding: '10px', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '8px', color: 'var(--green)', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'DM Sans,sans-serif' }}>
          ✓ Check In
        </button>
      )}
      {booking.status === 'checked-in' && (
        !showCheckout ? (
          <>
            <button onClick={() => setShowExtend(true)} style={{ flex: 1, padding: '10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'DM Sans,sans-serif' }}>
              Extend Stay
            </button>
            <button onClick={() => setShowChangeRoom(true)} style={{ flex: 1, padding: '10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'DM Sans,sans-serif' }}>
              Change Room
            </button>
            <button onClick={() => setShowCheckout(true)} style={{ flex: 1, padding: '10px', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '8px', color: 'var(--gold)', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'DM Sans,sans-serif' }}>
              ↗ Check Out
            </button>
          </>
        ) : (
          <div style={{ flexBasis: '100%' }}>
            <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Checkout Payment</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                <span style={{ color: 'var(--text3)' }}>Total Amount</span>
                <span>₹{booking.amount?.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                <span style={{ color: 'var(--text3)' }}>Paid Amount</span>
                <span style={{ color: 'var(--green)' }}>₹{booking.paid?.toLocaleString() || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>
                <span>Balance Due</span>
                <span style={{ color: 'var(--rose)' }}>₹{balance.toLocaleString()}</span>
              </div>
              
              {balance > 0 && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>PAYING NOW (₹)</label>
                    <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', outline: 'none', fontSize: '13px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>PAYMENT METHOD</label>
                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', outline: 'none', fontSize: '13px' }}>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>
              )}
              
              {balance > 0 ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowCheckout(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>Cancel</button>
                  <button onClick={() => onAction(booking, 'collect-payment', { paymentAmount: Number(paymentAmount), paymentMethod })} style={{ flex: 2, padding: '10px', background: 'var(--green)', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                    Collect Payment
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowCheckout(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>Cancel</button>
                  <button onClick={() => { onAction(booking, 'checked-out', { paymentAmount: 0, paymentMethod }); onClose(); }} style={{ flex: 2, padding: '10px', background: 'var(--gold)', border: 'none', borderRadius: '6px', color: '#000', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                    Confirm & Check Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      )}
      {(booking.status === 'confirmed' || booking.status === 'pending') && !showCheckout && (
        <button onClick={() => { onAction(booking, 'cancelled'); onClose(); }} style={{ padding: '10px 16px', background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', borderRadius: '8px', color: 'var(--rose)', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'DM Sans,sans-serif' }}>
          Cancel
        </button>
      )}
      {!showCheckout && (
        <>
          <button onClick={() => { onAction(booking, 'deleted'); onClose(); }} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid var(--rose)', borderRadius: '8px', color: 'var(--rose)', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'DM Sans,sans-serif' }}>
            Delete
          </button>
          
          <button onClick={handlePrint} disabled={isPrinting} style={{ marginLeft: 'auto', padding: '10px 16px', background: 'transparent', border: '1px solid var(--gold)', borderRadius: '8px', color: 'var(--gold)', cursor: isPrinting ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'DM Sans,sans-serif', opacity: isPrinting ? 0.7 : 1 }}>
            {isPrinting ? 'Printing...' : '🖨️ Print Invoice'}
          </button>
        </>
      )}
    </div>

    {/* Hidden Invoice Component for PDF generation */}
    <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
      <div id="booking-invoice-wrap">
        <InvoiceDocument 
          hotel={hotelDetails} 
          booking={booking} 
          guest={booking.guest} 
        />
      </div>
    </div>
  </div>
);
};

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newBookingSuccess, setNewBookingSuccess] = useState(false);
  const [selected, setSelected] = useState(null);
  const [apiReady, setApiReady] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => setToast({ message, type, key: Date.now() });

  useEffect(() => {
    const loadFromApi = async () => {
      try {
        const res = await api.getBookings();
        if (res.data) {
          const flat = res.data.map(toFlat);
          setBookings(flat);
          setApiReady(true);
        }
      } catch (err) {
        console.error("loadFromApi failed:", err);
      }
    };
    loadFromApi();
  }, []);

  const filtered = bookings.filter(b => {
    const matchFilter = filter === 'all' || b.status === filter;
    const matchSearch = !search || b.guest.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase()) || b.room.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleAction = useCallback(async (booking, newStatus, extraData = {}) => {
    if (newStatus === 'deleted') {
      if (!window.confirm(`Are you sure you want to permanently delete Booking ${booking.id}?`)) return;
      if (apiReady && booking._id) {
        try { 
          await api.deleteBooking(booking._id); 
          setBookings(prev => prev.filter(b => b.id !== booking.id));
        }
        catch (err) { 
          console.error('Failed to delete booking', err);
          alert(err.message || 'Failed to delete booking');
        }
      }
      return;
    }

    const apiStatus = newStatus.replace(/-/g, '_');
    // Try API
    if (apiReady && booking._id) {
      try {
        if (newStatus === 'checked-in') {
          await api.checkIn(booking._id);
        } else if (newStatus === 'checked-out') {
          await api.checkOut(booking._id, extraData);
        } else if (newStatus === 'extend-stay') {
          const res = await api.extendStay(booking._id, extraData);
          const updated = toFlat(res.data);
          setBookings(prev => prev.map(b => b.id === booking.id ? updated : b));
          setSelected(updated);
          return;
        } else if (newStatus === 'change-room') {
          const res = await api.changeRoom(booking._id, extraData);
          const updated = toFlat(res.data);
          setBookings(prev => prev.map(b => b.id === booking.id ? updated : b));
          setSelected(updated);
          return;
        } else if (newStatus === 'collect-payment') {
          await api.updateBooking(booking._id, {
            paidAmount: (booking.paid || 0) + extraData.paymentAmount,
            paymentMethod: extraData.paymentMethod
          });
          setBookings(prev => prev.map(b => {
            if (b.id !== booking.id) return b;
            return { ...b, paid: (b.paid || 0) + extraData.paymentAmount };
          }));
          setSelected(prev => {
            if (!prev || prev.id !== booking.id) return prev;
            return { ...prev, paid: (prev.paid || 0) + extraData.paymentAmount };
          });
          return;
        } else if (newStatus === 'cancelled') {
          await api.cancelBooking(booking._id);
        }
        // Update local state only if API succeeded
        setBookings(prev => prev.map(b => {
          if (b.id !== booking.id) return b;
          return { ...b, status: newStatus };
        }));
      } catch (err) {
        console.error('Failed to update booking status', err);
        alert(err.message || 'Failed to update booking status');
      }
    }
  }, [apiReady]);

  const handleSave = useCallback(async (form, totalAmount, nights, petCharge) => {
    if (form.phone && form.phone.length !== 10) throw new Error('Phone number must be exactly 10 digits.');
    const newBooking = {
      guest: form.guest,
      phone: form.phone,
      email: form.email,
      idType: form.idType,
      idNumber: form.idNumber,
      address: form.address,
      room: form.room,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      checkInDateTime: form.checkInDateTime,
      checkOutDateTime: form.checkOutDateTime,
      stayDays: form.stayDays,
      adults: form.adults,
      children: form.children,
      amount: totalAmount,
      nights,
      petCharge,
      source: form.source,
      specialRequests: form.specialRequests,
      hasPet: form.hasPet,
      petType: form.petType,
      petSize: form.petSize,
      petManualRate: form.petManualRate,
      petDiscountType: form.petDiscountType,
      petManualDiscountAmount: form.petManualDiscountAmount,
      status: 'confirmed',
    };

    if (apiReady) {
      try {
        const flatForm = fromFlat({ ...newBooking, id: `BK-${Date.now()}` });
        const res = await api.createBooking(flatForm);
        if (res.data) {
          const flat = toFlat(res.data);
          setBookings(prev => [...prev, flat]);
          setNewBookingSuccess(true);
          showToast('Room Booked Successfully', 'success');
          setTimeout(() => {
            setShowNew(false);
            setNewBookingSuccess(false);
          }, 1000);
        }
      } catch (err) {
        console.error("createBooking failed:", err);
        const msg = err.data?.message || err.message || 'Failed to create booking';
        throw new Error(msg);
      }
    }
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
      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showNew && <Modal title="New Booking" isSuccess={newBookingSuccess} onClose={() => setShowNew(false)}><NewBookingForm onClose={() => setShowNew(false)} onSave={handleSave} /></Modal>}
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
        <div className="table-responsive-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
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
    </div>
  );
};

export default BookingsPage;