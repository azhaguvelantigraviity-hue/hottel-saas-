import React, { useState } from 'react';
import * as authService from '../services/authService';

const DEMO_ACCOUNTS = {
  admin: [
    {
      email: 'admin@stayos.in',
      pass: 'Admin@StayOS2025!',
      label: 'Super Admin',
      sublabel: 'Platform Overview & Hotel Mgmt',
      icon: '🛡️',
      role: 'admin',
      plan: 'enterprise'
    }
  ],
  hotel: [
    {
      email: 'manager@hotel.com',
      pass: 'password',
      label: 'Hotel Manager (Grand Resort)',
      sublabel: 'Monitor hotel & add rooms (limit 10)',
      icon: '🏨',
      role: 'manager',
      plan: 'enterprise',
      badge: 'Manager',
      badgeColor: '#D97706'
    },
    {
      email: 'recep@hotel.com',
      pass: 'password',
      label: 'Receptionist (Grand Resort)',
      sublabel: 'Manage bookings & check-ins',
      icon: '🔑',
      role: 'staff',
      plan: 'enterprise',
      badge: 'Receptionist',
      badgeColor: '#14B8A6'
    }
  ],
};

const Login = ({ type, onSuccess, onBack }) => {
  const defaults = DEMO_ACCOUNTS[type][0] || {};
  const [email,        setEmail]        = useState(defaults.email || '');
  const [pass,         setPass]         = useState(defaults.pass || '');
  const [loading,      setLoading]      = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(defaults.plan || null);
  const [selectedRole, setSelectedRole] = useState(defaults.role || '');
  const [selectedKey,  setSelectedKey]  = useState(defaults.email || '');
  const [showPass,     setShowPass]     = useState(false);

  const handleAccountSelect = (acc) => {
    setEmail(acc.email);
    setPass(acc.pass);
    setSelectedPlan(acc.plan);
    setSelectedRole(acc.role);
    setSelectedKey(acc.email);
  };

  const handleLogin = async () => {
    if (!email || !pass) return;
    setLoading(true);
    
    try {
      // Call the real backend API
      const response = await authService.login(email, pass);
      
      // Extract user data from response
      const user = response.user || response.data;
      const role = user.role;
      const hotel = user.hotel;
      
      setLoading(false);
      
      // Map backend roles to frontend roles
      if (role === 'platform_admin') {
        onSuccess('enterprise', 'admin', null);
      } else if (role === 'hotel_admin') {
        // Fetch hotel details if available
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
        onSuccess(hotel?.plan || 'enterprise', 'staff', hotelDetails);
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
      {/* Card */}
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
        {/* Back */}
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

        {/* Header */}
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

        {/* Demo account selector */}
        <div style={{ marginBottom: '22px' }}>
          {DEMO_ACCOUNTS[type].length > 0 && <div style={lbl}>
            {type === 'admin' ? 'ACCOUNT' : 'DEMO ACCOUNTS'}
          </div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {DEMO_ACCOUNTS[type].map(acc => {
              const isSelected = selectedKey === acc.email;
              return (
                <button
                  key={acc.email}
                  onClick={() => handleAccountSelect(acc)}
                  style={{
                    padding: '11px 14px',
                    background: isSelected ? 'var(--primary-bg)' : 'var(--bg)',
                    border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border2)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                    background: isSelected ? 'rgba(99,102,241,0.12)' : 'var(--card2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px',
                  }}>
                    {acc.icon}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '13px', fontWeight: '600',
                      color: isSelected ? 'var(--primary)' : 'var(--text)',
                      marginBottom: '1px',
                    }}>
                      {acc.label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                      {acc.sublabel}
                    </div>
                  </div>

                  {/* Plan badge */}
                  {acc.badge && (
                    <span style={{
                      padding: '2px 8px', borderRadius: '20px', fontSize: '10px',
                      fontWeight: '700', flexShrink: 0,
                      background: `${acc.badgeColor}18`,
                      color: acc.badgeColor,
                      border: `1px solid ${acc.badgeColor}30`,
                    }}>
                      {acc.badge}
                    </span>
                  )}

                  {/* Selected indicator */}
                  {isSelected && (
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: 'var(--primary)', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        {DEMO_ACCOUNTS[type].length > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontSize: '11px', color: 'var(--text4)', fontWeight: '500' }}>OR ENTER MANUALLY</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>}

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={lbl}>EMAIL</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter email address"
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

        {/* Footer note */}
        <p style={{
          textAlign: 'center', marginTop: '16px',
          fontSize: '12px', color: 'var(--text4)',
          lineHeight: 1.5,
        }}>
          Enter your credentials to sign in
        </p>
      </div>

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
