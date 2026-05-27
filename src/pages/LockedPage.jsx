import React from 'react';

const LockedPage = ({ feature, requiredPlan, onNav }) => (
  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
    <div style={{ textAlign: 'center', maxWidth: '400px' }}>
      <div
        style={{
          width: '64px',
          height: '64px',
          background: 'rgba(201,168,76,0.1)',
          border: '1px solid rgba(201,168,76,0.25)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}
      >
        <span style={{ fontSize: '28px' }}>🔒</span>
      </div>
      <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '24px', marginBottom: '10px' }}>{feature}</h2>
      <p style={{ color: 'var(--text3)', fontSize: '14px', lineHeight: 1.7, marginBottom: '24px' }}>
        This feature is available on the <span style={{ color: 'var(--gold)', fontWeight: '700', textTransform: 'capitalize' }}>{requiredPlan}</span> plan and above. Upgrade to unlock full access.
      </p>
      <button
        onClick={() => onNav('settings')}
        style={{
          padding: '13px 28px',
          background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)',
          border: 'none',
          borderRadius: '9px',
          color: '#fff',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '14px',
          fontFamily: 'DM Sans,sans-serif',
        }}
      >
        Upgrade Now
      </button>
    </div>
  </div>
);

export default LockedPage;
