import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import Badge from '../components/Badge';

const TABS = ['QR Check-In', 'ID Scan', 'Face Verification', 'Digital Signature'];

const QRTab = () => {
  const [bookingId, setBookingId] = useState('');
  const [found, setFound] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const BOOKINGS = {};
  const lookup = () => { setFound(BOOKINGS[bookingId.toUpperCase()] || 'not_found'); setCheckedIn(false); };
  const cells = Array.from({ length: 100 }, (_, i) => Math.random() > 0.5);
  return (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ background: '#fff', padding: 16, borderRadius: 12 }}>
          <svg width={160} height={160} viewBox="0 0 10 10">
            {cells.map((on, i) => on ? <rect key={i} x={i % 10} y={Math.floor(i / 10)} width={1} height={1} fill="#000" /> : null)}
            <rect x={1} y={1} width={3} height={3} fill="#000" /><rect x={2} y={2} width={1} height={1} fill="#fff" />
            <rect x={6} y={1} width={3} height={3} fill="#000" /><rect x={7} y={2} width={1} height={1} fill="#fff" />
            <rect x={1} y={6} width={3} height={3} fill="#000" /><rect x={2} y={7} width={1} height={1} fill="#fff" />
          </svg>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>Scan QR code at reception kiosk</div>
      </div>
      <div style={{ flex: 1, minWidth: 260 }}>
        <div style={{ marginBottom: 16, fontSize: 14, color: 'var(--text2)' }}>Or enter Booking ID manually:</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input value={bookingId} onChange={e => setBookingId(e.target.value)} placeholder="e.g. BK-1003" style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontFamily: 'DM Mono, monospace', fontSize: 14 }} />
          <button onClick={lookup} style={{ background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: 8, padding: '10px 20px', color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Lookup</button>
        </div>
        {found === 'not_found' && <div style={{ padding: 16, background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', borderRadius: 8, color: 'var(--rose)' }}>Booking not found. Please check the ID.</div>}
        {found && found !== 'not_found' && (
          <div style={{ padding: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{found.guest}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>Room: {found.room}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>Check-in: {found.checkIn} → Check-out: {found.checkOut}</div>
            {!checkedIn ? (
              <button onClick={() => setCheckedIn(true)} style={{ background: 'linear-gradient(135deg,#34D399,#059669)', border: 'none', borderRadius: 8, padding: '10px 24px', color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14 }}>✓ Confirm Check-In</button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)', fontWeight: 600 }}><Icon name="check" size={18} color="var(--green)" /> Checked In Successfully!</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const IDScanTab = () => {
  const [scanning, setScanning] = useState(false);
  const [filled, setFilled] = useState(false);
  const [form, setForm] = useState({ name: '', idNumber: '', dob: '', type: 'aadhaar' });
  const simulate = () => { setScanning(true); setTimeout(() => { setScanning(false); setFilled(true); }, 2000); };
  return (
    <div style={{ maxWidth: 480 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {['aadhaar', 'passport'].map(t => (
          <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{ padding: '8px 20px', borderRadius: 8, border: `1px solid ${form.type === t ? 'var(--gold)' : 'var(--border)'}`, background: form.type === t ? 'rgba(201,168,76,0.12)' : 'transparent', color: form.type === t ? 'var(--gold)' : 'var(--text2)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>
      {['name', 'idNumber', 'dob'].map(field => (
        <div key={field} style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{field === 'idNumber' ? 'ID Number' : field === 'dob' ? 'Date of Birth' : 'Full Name'}</label>
          <input value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} type={field === 'dob' ? 'date' : 'text'} style={{ width: '100%', background: filled ? 'rgba(52,211,153,0.08)' : 'var(--surface)', border: `1px solid ${filled ? 'rgba(52,211,153,0.3)' : 'var(--border)'}`, borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontFamily: 'Inter, sans-serif', fontSize: 14, boxSizing: 'border-box', transition: 'all 0.3s' }} />
        </div>
      ))}
      <button onClick={simulate} disabled={scanning} style={{ background: scanning ? 'var(--surface)' : 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: 8, padding: '12px 24px', color: scanning ? 'var(--text3)' : '#fff', cursor: scanning ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="fingerprint" size={16} color={scanning ? 'var(--text3)' : '#fff'} />
        {scanning ? 'Scanning...' : 'Scan Document'}
      </button>
      {filled && <div style={{ marginTop: 12, color: 'var(--green)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="check" size={14} color="var(--green)" /> Document verified & auto-filled</div>}
    </div>
  );
};

const FaceTab = () => {
  const [status, setStatus] = useState('idle');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div style={{ width: 200, height: 200, borderRadius: '50%', border: `4px solid ${status === 'verified' ? 'var(--green)' : status === 'capturing' ? 'var(--gold)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', position: 'relative', transition: 'border-color 0.3s' }}>
        <div style={{ fontSize: 64 }}>{status === 'verified' ? '✅' : '📷'}</div>
        {status === 'capturing' && <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '4px solid var(--gold)', animation: 'pulse 1s infinite', opacity: 0.5 }} />}
      </div>
      <div style={{ fontSize: 14, color: status === 'verified' ? 'var(--green)' : 'var(--text2)' }}>
        {status === 'idle' ? 'Position face within the frame' : status === 'capturing' ? 'Capturing...' : '✓ Face Verified'}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => { setStatus('capturing'); setTimeout(() => setStatus('verified'), 2000); }} disabled={status === 'capturing'} style={{ background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: 8, padding: '10px 24px', color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Capture</button>
        <button onClick={() => setStatus('idle')} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 24px', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Reset</button>
      </div>
      {status === 'verified' && <Badge label="Verified" color="green" />}
    </div>
  );
};

const SignatureTab = () => {
  const [signed, setSigned] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <div style={{ maxWidth: 480 }}>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>Guest signature for check-in consent</div>
      <div onClick={() => setSigned(true)} style={{ width: '100%', height: 160, border: `2px dashed ${signed ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'crosshair', background: 'var(--surface)', marginBottom: 16, position: 'relative', transition: 'border-color 0.3s' }}>
        {signed ? <svg width="80%" height="80%" viewBox="0 0 300 100"><path d="M20,70 Q60,20 100,60 Q140,100 180,40 Q220,-20 280,50" stroke="var(--gold)" strokeWidth="3" fill="none" strokeLinecap="round"/></svg> : <span style={{ color: 'var(--text3)', fontSize: 14 }}>✍ Sign Here</span>}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => { setSigned(false); setSaved(false); }} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 20px', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Clear</button>
        <button onClick={() => { if (signed) setSaved(true); }} style={{ background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: 8, padding: '10px 20px', color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Save Signature</button>
      </div>
      {saved && <div style={{ marginTop: 12, color: 'var(--green)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="check" size={14} color="var(--green)" /> Signature saved successfully</div>}
    </div>
  );
};

const SmartCheckInPage = () => {
  const [tab, setTab] = useState(0);
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard title="Today's Check-ins" value="-" icon="check" color="var(--green)" />
        <StatCard title="Pending" value="-" icon="calendar" color="var(--amber)" />
        <StatCard title="QR Used" value="-" icon="qr" color="var(--teal)" />
        <StatCard title="Avg Time" value="-" icon="refresh" color="var(--violet)" />
      </div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface)', borderRadius: 10, padding: 4 }}>
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, background: tab === i ? 'var(--card)' : 'transparent', color: tab === i ? 'var(--gold)' : 'var(--text2)', transition: 'all 0.15s' }}>{t}</button>
          ))}
        </div>
        {tab === 0 && <QRTab />}
        {tab === 1 && <IDScanTab />}
        {tab === 2 && <FaceTab />}
        {tab === 3 && <SignatureTab />}
      </div>
    </div>
  );
};

export default SmartCheckInPage;
