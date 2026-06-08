import React, { useState } from 'react';
import * as authService from '../services/authService';

const Login = ({ type, onSuccess, onBack }) => {
  const [email,   setEmail]   = useState('');
  const [pass,    setPass]    = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !pass) return;
    setLoading(true);
    
    try {
      const response = await authService.login(email, pass);
      const user = response.user || response.data;
      const role = user.role;
      const hotel = user.hotel;
      if (type === 'admin' && role !== 'platform_admin') {
        setLoading(false);
        alert('This portal is restricted to Platform Administrators. Please use the Hotel Login page.');
        return;
      }
      
      if (type === 'hotel' && role === 'platform_admin') {
        setLoading(false);
        alert('Platform administrators must use the Admin Portal to log in.');
        return;
      }

      setLoading(false);
      
      if (role === 'platform_admin') {
        onSuccess('enterprise', 'admin', null);
      } else if (role === 'hotel_admin') {
        const hotelDetails = hotel ? {
          id: hotel._id || hotel.id,
          name: hotel.name,
          plan: hotel.plan || 'enterprise',
          ...hotel
        } : null;
        onSuccess(hotel?.plan || 'enterprise', 'manager', hotelDetails);
      } else if (role === 'hotel_staff') {
        const hotelDetails = hotel ? {
          id: hotel._id || hotel.id,
          name: hotel.name,
          plan: hotel.plan || 'enterprise',
          ...hotel
        } : null;
        let uiRole = 'staff';
        if (user.department === 'Front Desk') uiRole = 'reception';
        else if (user.department === 'Housekeeping') uiRole = 'housekeeping';
        else if (user.department === 'Manager') uiRole = 'manager';
        
        onSuccess(hotel?.plan || 'enterprise', uiRole, hotelDetails);
      } else {
        alert('Unknown user role');
      }
    } catch (error) {
      setLoading(false);
      alert(error.message || 'Login failed. Please check your credentials.');
    }
  };

  const inp = {
    width: '100%',
    padding: '11px 14px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  const lbl = {
    fontSize: '11px',
    color: 'var(--text3)',
    fontWeight: '600',
    letterSpacing: '0.07em',
    display: 'block',
    marginBottom: '6px',
    textTransform: 'uppercase',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '20px',
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '460px',
        boxShadow: 'var(--shadow)',
        position: 'relative',
      }}>
        <button
          onClick={onBack}
          style={{
            position: 'absolute', top: '18px', left: '18px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '13px', color: 'var(--text3)',
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 8px', borderRadius: '6px',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          ← Back
        </button>

        <div style={{ textAlign: 'center', marginBottom: '28px', paddingTop: '8px' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
            fontSize: '24px',
          }}>
            {type === 'admin' ? '🛡️' : '🏨'}
          </div>
          <h2 style={{
            fontSize: '22px', fontWeight: '700',
            color: 'var(--text)', marginBottom: '4px',
            letterSpacing: '-0.02em',
          }}>
            {type === 'admin' ? 'Admin Portal' : 'Hotel Login'}
          </h2>
          <p style={{ color: 'var(--text3)', fontSize: '13px' }}>
            {type === 'admin'
              ? 'StayOS Platform Administration'
              : 'Sign in to your hotel account'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={lbl}>EMAIL</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter email address"
              autoComplete="off"
              style={inp}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div>
            <label style={lbl}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={pass}
                onChange={e => setPass(e.target.value)}
                placeholder="Enter password"
                autoComplete="new-password"
                style={{ ...inp, paddingRight: '44px' }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text4)', fontSize: '13px', padding: '2px',
                }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || !email || !pass}
            style={{
              padding: '13px',
              background: loading || !email || !pass
                ? 'var(--border2)'
                : 'linear-gradient(135deg, #6366F1, #4F46E5)',
              border: 'none',
              borderRadius: '10px',
              color: loading || !email || !pass ? 'var(--text4)' : '#fff',
              cursor: loading || !email || !pass ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              marginTop: '4px',
              transition: 'all 0.2s',
              boxShadow: loading || !email || !pass ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </div>

        <p style={{
          textAlign: 'center', marginTop: '16px',
          fontSize: '12px', color: 'var(--text4)',
          lineHeight: 1.5,
        }}>
          Enter your credentials to sign in
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
