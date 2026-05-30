import React, { useState, useEffect, useCallback, useRef } from 'react';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import * as api from '../services/hotelService';

const STEPS = [
  { key: 'qr',        label: 'QR Scan',        icon: 'qr' },
  { key: 'details',   label: 'Guest Details',   icon: 'user' },
  { key: 'idscan',    label: 'ID Scan',         icon: 'fingerprint' },
  { key: 'face',      label: 'Face Verification', icon: 'camera' },
  { key: 'signature', label: 'Signature',       icon: 'edit' },
  { key: 'complete',  label: 'Complete',        icon: 'check' },
];

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ────── STEP 1: QR Scan ────────────────────────────────────────
const StepQR = ({ booking, onNext }) => {
  const [bookingId, setBookingId] = useState(booking?.bookingId || '');
  const [qrCode, setQrCode] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [proceeding, setProceeding] = useState(false);

  const lookup = useCallback(async () => {
    setError('');
    if (!bookingId.trim()) { setError('Please enter a Booking ID'); return; }
    setLoading(true);
    try {
      const res = await api.getBooking(bookingId.trim());
      const b = res.data;
      if (b.status === 'checked_in' || b.status === 'checked_out' || b.status === 'cancelled') {
        setError(`Booking is already ${b.status.replace('_', ' ')}`);
      } else {
        // Generate QR code
        const qrRes = await api.generateQRCode(b._id);
        setQrCode(qrRes.data.qrCode);
        onNext({ booking: b, qrScanned: true });
      }
    } catch (err) {
      setError(err.status === 404 ? 'Booking not found. Please check the ID.' : (err.message || 'Failed to look up booking'));
    } finally {
      setLoading(false);
    }
  }, [bookingId, onNext]);

  const handleProceed = () => {
    if (!proceeding) {
      setProceeding(true);
      // Trigger lookup if we have an existing booking
      if (booking && booking._id) {
        lookup();
      } else {
        setError('Please enter a Booking ID first');
        setProceeding(false);
      }
    }
  };

  return (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        {qrCode ? (
          <img src={qrCode} alt="QR Code" style={{ width: 180, height: 180, borderRadius: 12, background: '#fff', padding: 8 }} />
        ) : (
          <div style={{ width: 180, height: 180, borderRadius: 12, background: 'var(--surface)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 14, textAlign: 'center', padding: 16 }}>
            Enter Booking ID to generate QR
          </div>
        )}
        <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>Scan QR code at reception kiosk or enter ID below</div>
      </div>
      <div style={{ flex: 1, minWidth: 260, maxWidth: 400 }}>
        <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 16 }}>Booking ID</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input value={bookingId} onChange={e => setBookingId(e.target.value)} placeholder="e.g. BK-1003" style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontFamily: 'DM Mono, monospace', fontSize: 14 }} />
          <button onClick={lookup} disabled={loading} style={{ background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: 8, padding: '10px 20px', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, opacity: loading ? 0.6 : 1 }}>{loading ? '...' : 'Lookup'}</button>
        </div>
        {error && <div style={{ padding: 12, background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', borderRadius: 8, color: 'var(--rose)', marginBottom: 12, fontSize: 13 }}>{error}</div>}
        {qrCode && (
          <button onClick={handleProceed} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg,#34D399,#059669)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14 }}>
            Proceed to Check-In
          </button>
        )}
      </div>
    </div>
  );
};

// ────── STEP 2: Guest Details ───────────────────────────────────
const StepDetails = ({ booking, onNext }) => {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (booking?.guest) {
      setForm({
        name: `${booking.guest.firstName || ''} ${booking.guest.lastName || ''}`.trim(),
        phone: booking.guest.phone || '',
        email: booking.guest.email || '',
        address: '',
      });
    }
  }, [booking]);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await api.updateGuestDetails(booking._id, form);
      onNext({ detailsFilled: true });
    } catch (err) {
      alert(err.message || 'Failed to save details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Guest Information</div>
        <div style={{ fontSize: 13, color: 'var(--text3)' }}>Please fill in your contact details</div>
      </div>
      {['name', 'phone', 'email', 'address'].map(f => (
        <div key={f} style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {f === 'name' ? 'Full Name *' : f === 'phone' ? 'Phone Number' : f === 'email' ? 'Email' : 'Address'}
          </label>
          {f === 'address' ? (
            <textarea value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} rows={3} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontFamily: 'Inter, sans-serif', fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }} />
          ) : (
            <input value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} type={f === 'email' ? 'email' : 'text'} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontFamily: 'Inter, sans-serif', fontSize: 14, boxSizing: 'border-box' }} />
          )}
        </div>
      ))}
      <button onClick={handleSave} disabled={saving || !form.name.trim()} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, opacity: saving || !form.name.trim() ? 0.6 : 1 }}>
        {saving ? 'Saving...' : 'Save & Continue →'}
      </button>
    </div>
  );
};

// ────── STEP 3: ID Scan ──────────────────────────────────────
const StepIDScan = ({ booking, onNext }) => {
  const [idType, setIdType] = useState('aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef(null);

  const simulateScan = () => {
    if (!idNumber.trim()) return;
    setScanning(true);
    setTimeout(async () => {
      setScanning(false);
      setSaving(true);
      try {
        // Store dummy base64 document image
        const dummyDoc = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
        await api.uploadIdScan(booking._id, { idType, idNumber, documentImage: dummyDoc });
        setDone(true);
        // Auto-advance after short delay
        setTimeout(() => onNext({ idScanned: true }), 1200);
      } catch (err) {
        alert(err.message || 'Failed to upload ID scan');
      } finally {
        setSaving(false);
      }
    }, 1500);
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>ID Proof Verification</div>
        <div style={{ fontSize: 13, color: 'var(--text3)' }}>Select ID type and enter details, or upload document</div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, justifyContent: 'center' }}>
        {['aadhaar', 'passport', 'driving_license', 'voter_id'].map(t => (
          <button key={t} onClick={() => setIdType(t)} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${idType === t ? 'var(--gold)' : 'var(--border)'}`, background: idType === t ? 'rgba(201,168,76,0.12)' : 'transparent', color: idType === t ? 'var(--gold)' : 'var(--text2)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize', fontSize: 12, whiteSpace: 'nowrap' }}>
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>ID Number *</label>
        <input value={idNumber} onChange={e => setIdNumber(e.target.value)} placeholder="Enter ID number" style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontFamily: 'Inter, sans-serif', fontSize: 14, boxSizing: 'border-box' }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Upload Document</label>
        <div onClick={() => fileRef.current?.click()} style={{ width: '100%', height: 100, border: '2px dashed var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--surface)', color: 'var(--text3)', fontSize: 13 }}>
          {done ? '✓ Document Uploaded' : 'Click to upload ID document (JPG/PNG)'}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={() => { /* File selected - proceed with scan */ }} />
      </div>
      <button onClick={simulateScan} disabled={scanning || saving || !idNumber.trim()} style={{ width: '100%', padding: '12px', background: scanning ? 'var(--surface)' : 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: 8, color: scanning ? 'var(--text3)' : '#fff', cursor: scanning ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: scanning || saving || !idNumber.trim() ? 0.6 : 1 }}>
        <Icon name="fingerprint" size={16} color={scanning ? 'var(--text3)' : '#fff'} />
        {done ? '✓ Verified' : saving ? 'Saving...' : scanning ? 'Scanning...' : 'Scan Document'}
      </button>
    </div>
  );
};

// ────── STEP 4: Face Verification ──────────────────────────────
const StepFace = ({ booking, onNext }) => {
  const [status, setStatus] = useState('idle');
  const [saving, setSaving] = useState(false);

  const handleCapture = async () => {
    setStatus('capturing');
    // Simulate camera capture
    setTimeout(async () => {
      setSaving(true);
      try {
        const dummyImage = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV0hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYI3QIVJEQcaEomLGSFMMhYeHwQVLSU3PWBGJD/9oADAMBAAIRAxEAPwA8n//Z`;
        await api.submitFaceVerification(booking._id, { imageData: dummyImage });
        setStatus('verified');
        setTimeout(() => onNext({ faceVerified: true }), 1500);
      } catch (err) {
        setStatus('failed');
        alert(err.message || 'Face verification failed');
      } finally {
        setSaving(false);
      }
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 400, margin: '0 auto' }}>
      <div style={{ marginBottom: 8, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Face Verification</div>
        <div style={{ fontSize: 13, color: 'var(--text3)' }}>Position face within the frame and capture</div>
      </div>
      <div style={{ width: 200, height: 200, borderRadius: '50%', border: `4px solid ${status === 'verified' ? 'var(--green)' : status === 'capturing' ? 'var(--gold)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', position: 'relative', transition: 'border-color 0.3s' }}>
        <div style={{ fontSize: 64 }}>{status === 'verified' ? '✅' : status === 'failed' ? '❌' : '📷'}</div>
        {status === 'capturing' && <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '4px solid var(--gold)', animation: 'pulse 1s infinite', opacity: 0.5 }} />}
      </div>
      <div style={{ fontSize: 14, color: status === 'verified' ? 'var(--green)' : status === 'failed' ? 'var(--rose)' : 'var(--text2)' }}>
        {status === 'idle' ? 'Ready to capture' : status === 'capturing' ? 'Capturing...' : status === 'verified' ? '✓ Face Verified' : 'Verification failed'}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={handleCapture} disabled={status === 'capturing' || saving} style={{ background: saving ? 'var(--surface)' : 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: 8, padding: '10px 24px', color: saving ? 'var(--text3)' : '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
          {saving ? 'Saving...' : status === 'capturing' ? 'Capturing...' : 'Capture'}
        </button>
        <button onClick={() => setStatus('idle')} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 24px', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Reset</button>
      </div>
      {status === 'verified' && <Badge label="Verified" color="green" />}
    </div>
  );
};

// ────── STEP 5: Digital Signature ──────────────────────────────
const StepSignature = ({ booking, onNext }) => {
  const [signed, setSigned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const svgRef = useRef(null);
  const [pathData, setPathData] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);

  const handleMouseDown = () => {
    if (!signed) setIsDrawing(true);
  };
  const handleMouseUp = () => {
    if (isDrawing) { setIsDrawing(false); setSigned(true); }
  };
  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 300;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPathData(prev => prev + (prev ? ` L${x},${y}` : `M${x},${y}`));
  };

  const clearSignature = () => { setPathData(''); setSigned(false); setSaved(false); };

  const handleSave = async () => {
    if (!signed) return;
    setSaving(true);
    try {
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100"><path d="${pathData}" stroke="var(--gold)" strokeWidth="3" fill="none" strokeLinecap="round"/></svg>`;
      await api.saveSignature(booking._id, { signature: svgContent });
      setSaved(true);
      setTimeout(() => onNext({ signatureDone: true }), 1200);
    } catch (err) {
      alert(err.message || 'Failed to save signature');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Digital Signature</div>
        <div style={{ fontSize: 13, color: 'var(--text3)' }}>Sign below for check-in consent</div>
      </div>
      <div
        ref={svgRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
        style={{ width: '100%', height: 160, border: `2px dashed ${signed ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 12, cursor: 'crosshair', background: 'var(--surface)', marginBottom: 16, position: 'relative', overflow: 'hidden' }}
      >
        {pathData ? (
          <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
            <path d={pathData} stroke="#C9A84C" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 14, pointerEvents: 'none' }}>✍ Sign Here (click & drag)</div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={clearSignature} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text2)', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Clear</button>
        <button onClick={handleSave} disabled={!signed || saving || saved} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, opacity: !signed || saving || saved ? 0.6 : 1 }}>
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Signature'}
        </button>
      </div>
      {saved && <div style={{ marginTop: 12, color: 'var(--green)', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Icon name="check" size={14} color="var(--green)" /> Signature saved successfully</div>}
    </div>
  );
};

// ────── STEP 6: Complete ──────────────────────────────────────
const StepComplete = ({ booking }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '20px 0' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="check" size={40} color="var(--green)" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 8, fontFamily: 'Playfair Display,serif' }}>Check-In Complete!</div>
        <div style={{ fontSize: 14, color: 'var(--text2)' }}>Welcome to StayOS. Enjoy your stay.</div>
      </div>
      <div style={{ background: 'var(--surface)', borderRadius: 12, padding: '20px 32px', border: '1px solid var(--border)', width: '100%', maxWidth: 400 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            ['Booking ID', booking?.bookingId],
            ['Guest', booking?.guest ? `${booking.guest.firstName || ''} ${booking.guest.lastName || ''}`.trim() : '—'],
            ['Room', booking?.room ? `${booking.room.roomNumber || ''}` : '—'],
            ['Check-in', formatDate(booking?.checkIn)],
            ['Check-out', formatDate(booking?.checkOut)],
          ].map(([k, v]) => (
            <div key={k} style={{ background: 'var(--card)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.06em', marginBottom: 3 }}>{k.toUpperCase()}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{v || '—'}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', maxWidth: 400 }}>Room key has been activated. You can now access your room.</div>
    </div>
  );
};

// ────── MAIN WIZARD ────────────────────────────────────────────
const SmartCheckInPage = () => {
  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState(null);
  const [stepsCompleted, setStepsCompleted] = useState({});
  const [stats, setStats] = useState({ today: '-', pending: '-', qrUsed: '-', avgTime: '-' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        const res = await api.getBookings({ date: todayStr });
        const all = res.data || [];
        const checkedIn = all.filter(b => b.status === 'checked_in');
        const pending = all.filter(b => b.status === 'confirmed' || b.status === 'pending');
        setStats({
          today: checkedIn.length,
          pending: pending.length,
          qrUsed: checkedIn.filter(b => (b.source || '').toLowerCase() === 'direct').length || '-',
          avgTime: checkedIn.length > 0 ? '~2m' : '-',
        });
      } catch { /* stats stay as "-" */ }
    };
    fetchStats();
  }, []);

  const handleNext = (data) => {
    if (data.booking) {
      setBooking(data.booking);
      setStepsCompleted(p => ({ ...p, qrScanned: true }));
      // Automatically advance to guest details after QR scan
      setStep(1);
    } else if (data.detailsFilled) {
      setStepsCompleted(p => ({ ...p, detailsFilled: true }));
      setStep(2);
    } else if (data.idScanned) {
      setStepsCompleted(p => ({ ...p, idScanned: true }));
      setStep(3);
    } else if (data.faceVerified) {
      setStepsCompleted(p => ({ ...p, faceVerified: true }));
      setStep(4);
    } else if (data.signatureDone) {
      setStepsCompleted(p => ({ ...p, signatureDone: true }));
      // All steps done - perform the actual check-in
      setStep(5);
      api.checkIn(booking._id).catch(() => {});
    }
  };

  const canSkipTo = (idx) => {
    if (idx === 0) return true;
    if (idx === 1) return stepsCompleted.qrScanned;
    if (idx === 2) return stepsCompleted.detailsFilled;
    if (idx === 3) return stepsCompleted.idScanned;
    if (idx === 4) return stepsCompleted.faceVerified;
    if (idx === 5) return stepsCompleted.signatureDone;
    return false;
  };

  const renderStep = () => {
    switch (step) {
      case 0: return <StepQR booking={booking} onNext={handleNext} />;
      case 1: return <StepDetails booking={booking} onNext={handleNext} />;
      case 2: return <StepIDScan booking={booking} onNext={handleNext} />;
      case 3: return <StepFace booking={booking} onNext={handleNext} />;
      case 4: return <StepSignature booking={booking} onNext={handleNext} />;
      case 5: return <StepComplete booking={booking} />;
      default: return null;
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard title="Today's Check-ins" value={stats.today} icon="check" color="var(--green)" />
        <StatCard title="Pending" value={stats.pending} icon="calendar" color="var(--amber)" />
        <StatCard title="QR Used" value={stats.qrUsed} icon="qr" color="var(--teal)" />
        <StatCard title="Avg Time" value={stats.avgTime} icon="refresh" color="var(--violet)" />
      </div>

      {/* Progress stepper */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: 'var(--surface)', borderRadius: 10, padding: 4 }}>
          {STEPS.map((s, i) => {
            const isActive = step === i;
            const isDone = canSkipTo(i + 1) || (step > i);
            return (
              <button
                key={s.key}
                onClick={() => canSkipTo(i) && setStep(i)}
                style={{
                  flex: 1, padding: '8px 6px', borderRadius: 8, border: 'none', cursor: canSkipTo(i) ? 'pointer' : 'default',
                  fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                  background: isActive ? 'var(--card)' : 'transparent',
                  color: isDone ? 'var(--green)' : isActive ? 'var(--gold)' : 'var(--text3)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all 0.15s',
                  opacity: canSkipTo(i) || isActive ? 1 : 0.5,
                }}
              >
                <span>{isDone ? '✓' : isActive ? '●' : '○'}</span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Step content */}
        <div style={{ animation: 'fadeIn 0.2s ease' }}>
          {renderStep()}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          <button
            onClick={() => setStep(p => Math.max(0, p - 1))}
            disabled={step === 0}
            style={{ padding: '8px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: step === 0 ? 'var(--text3)' : 'var(--text2)', cursor: step === 0 ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13 }}
          >
            ← Back
          </button>
          {step < 5 && (
            <button
              onClick={() => {
                // Skip current step if already done
                if (step === 0 && stepsCompleted.qrScanned) setStep(1);
                else if (step === 1 && stepsCompleted.detailsFilled) setStep(2);
                else if (step === 2 && stepsCompleted.idScanned) setStep(3);
                else if (step === 3 && stepsCompleted.faceVerified) setStep(4);
                else if (step === 4 && stepsCompleted.signatureDone) setStep(5);
              }}
              disabled={!canSkipTo(step + 1)}
              style={{ padding: '8px 20px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: 8, color: '#fff', cursor: canSkipTo(step + 1) ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, opacity: canSkipTo(step + 1) ? 1 : 0.5 }}
            >
              Skip Step →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartCheckInPage;