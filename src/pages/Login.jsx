import React, { useState } from 'react';
import Icon from '../components/Icon';

const DEMO_ACCOUNTS = {
  admin: [{ email: 'admin@stayos.in', pass: 'demo123', label: 'Platform Admin', plan: null }],
  hotel: [
    { email: 'gm@grandmeridian.com', pass: 'demo123', label: 'The Grand Meridian (Enterprise)', plan: 'enterprise' },
    { email: 'ops@azuregoa.com', pass: 'demo123', label: 'Azure Boutique Hotel (Professional)', plan: 'professional' },
    { email: 'info@hilltopinn.com', pass: 'demo123', label: 'Hilltop Heritage Inn (Starter)', plan: 'starter' },
  ],
};

const Login = ({ type, onSuccess, onBack }) => {
  const defaults = DEMO_ACCOUNTS[type][0];
  const [email, setEmail] = useState(defaults.email);
  const [pass, setPass] = useState(defaults.pass);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(defaults.plan);

  const handleAccountSelect = (acc) => {
    setEmail(acc.email);
    setPass(acc.pass);
    setSelectedPlan(acc.plan);
  };

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess(selectedPlan);
    }, 800);
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '8px', color: 'var(--text)', fontSize: '14px', outline: 'none', fontFamily: 'DM Sans,sans-serif',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--obsidian)', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 40% 60% at 50% 50%, rgba(201,168,76,0.05), transparent)', pointerEvents: 'none' }} />
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '48px', width: '100%', maxWidth: '440px', position: 'relative' }}>
        <button onClick={onBack} style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'DM Sans,sans-serif' }}>
          ← Back
        </button>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icon name={type === 'admin' ? 'shield' : 'hotel'} size={24} color="#fff" />
          </div>
          <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '26px', marginBottom: '6px' }}>
            {type === 'admin' ? 'Admin Portal' : 'Hotel Login'}
          </h2>
          <p style={{ color: 'var(--text3)', fontSize: '14px' }}>
            {type === 'admin' ? 'StayOS Platform Administration' : 'Sub-Admin Dashboard Access'}
          </p>
        </div>

        {/* Demo account switcher for hotel */}
        {type === 'hotel' && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.06em', marginBottom: '8px' }}>DEMO ACCOUNTS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {DEMO_ACCOUNTS.hotel.map(acc => (
                <button key={acc.email} onClick={() => handleAccountSelect(acc)} style={{ padding: '10px 12px', background: email === acc.email ? 'rgba(201,168,76,0.12)' : 'var(--surface)', border: `1px solid ${email === acc.email ? 'var(--gold)' : 'var(--border)'}`, borderRadius: '8px', color: email === acc.email ? 'var(--gold)' : 'var(--text2)', cursor: 'pointer', fontSize: '12px', fontWeight: '600', textAlign: 'left', fontFamily: 'DM Sans,sans-serif', transition: 'all 0.15s' }}>
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>EMAIL</label>
            <input value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>PASSWORD</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} style={inputStyle} />
          </div>
          <button onClick={handleLogin} disabled={loading} style={{ padding: '13px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '15px', fontWeight: '600', fontFamily: 'DM Sans,sans-serif', marginTop: '6px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </div>
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text3)' }}>
          Demo credentials pre-filled — just click Sign In
        </p>
      </div>
    </div>
  );
};

export default Login;
