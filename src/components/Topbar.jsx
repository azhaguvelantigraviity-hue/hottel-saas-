import React from 'react';
import Icon from './Icon';
import Avatar from './Avatar';

const Topbar = ({ title, subtitle, role }) => (
  <div
    style={{
      padding: '20px 32px',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--void)',
    }}
  >
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'Playfair Display, serif', lineHeight: 1.1 }}>
        {title}
      </h1>
      {subtitle && <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '2px' }}>{subtitle}</p>}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ position: 'relative' }}>
        <button
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Icon name="bell" size={16} color="var(--text2)" />
        </button>
        <span
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '8px',
            height: '8px',
            background: 'var(--rose)',
            borderRadius: '50%',
            border: '2px solid var(--void)',
          }}
        />
      </div>
      <Avatar initials={role === 'admin' ? 'SA' : 'GM'} color="var(--gold)" size={36} />
    </div>
  </div>
);

export default Topbar;
