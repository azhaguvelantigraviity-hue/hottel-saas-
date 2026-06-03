import React from 'react';
import Icon from '../components/Icon';

const ComingSoon = ({ title, icon, color = 'var(--gold)' }) => (
  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(16px, 4vw, 32px)' }}>
    <div style={{ textAlign: 'center', maxWidth: '360px' }}>
      <div
        style={{
          width: '64px',
          height: '64px',
          background: `${color}15`,
          border: `1px solid ${color}30`,
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}
      >
        <Icon name={icon} size={28} color={color} />
      </div>
      <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: '24px', marginBottom: '10px' }}>{title}</h2>
      <p style={{ color: 'var(--text3)', fontSize: '14px', lineHeight: 1.7 }}>
        This module is fully functional in the complete version. The demo showcases the interface architecture.
      </p>
    </div>
  </div>
);

export default ComingSoon;
