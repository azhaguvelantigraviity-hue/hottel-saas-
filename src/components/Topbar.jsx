import React, { useState } from 'react';
import Icon from './Icon';

const Topbar = ({ title, subtitle, role, notifCount = 3 }) => {
  const [search, setSearch] = useState('');

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning,';
    if (h < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  const userName  = role === 'admin' ? 'Super Admin' : 'Hotel Admin';
  const userInitials = role === 'admin' ? 'SA' : 'GM';

  return (
    <div style={{
      padding: '0 28px',
      height: '64px',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--surface)',
      flexShrink: 0,
      gap: '16px',
    }}>
      {/* Left — Page title */}
      <div style={{ minWidth: 0 }}>
        <h1 style={{
          fontSize: '20px', fontWeight: '700', color: 'var(--text)',
          letterSpacing: '-0.02em', lineHeight: 1.2, whiteSpace: 'nowrap',
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '500', marginTop: '1px' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right — Search + actions + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}>
            <Icon name="eye" size={15} color="var(--text4)" />
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search everywhere..."
            style={{
              width: '220px', padding: '8px 12px 8px 36px',
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: '8px', fontSize: '13px', color: 'var(--text)',
              outline: 'none', transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Notification bell */}
        <div style={{ position: 'relative' }}>
          <button style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'var(--bg)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <Icon name="bell" size={17} color="var(--text2)" />
          </button>
          {notifCount > 0 && (
            <div style={{
              position: 'absolute', top: '-4px', right: '-4px',
              minWidth: '18px', height: '18px', borderRadius: '9px',
              background: 'var(--rose)', border: '2px solid var(--surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: '700', color: '#fff', padding: '0 3px',
            }}>
              {notifCount}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', background: 'var(--border)' }} />

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: '700', color: '#fff', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
          }}>
            {userInitials}
          </div>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{greeting()}</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {userName}
              <Icon name="arrow" size={12} color="var(--text3)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
