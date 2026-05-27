import React from 'react';
import Icon from './Icon';

const StatCard = ({ icon, iconColor, label, value, sub, trend }) => (
  <div
    style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '80px',
        height: '80px',
        background: `radial-gradient(circle at 70% 30%, ${iconColor}18, transparent 70%)`,
        pointerEvents: 'none',
      }}
    />
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: `${iconColor}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={18} color={iconColor} />
      </div>
      {trend !== undefined && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: trend >= 0 ? 'var(--green)' : 'var(--rose)',
            fontSize: '12px',
            fontWeight: '600',
          }}
        >
          <span>
            {trend >= 0 ? '↑' : '↓'}
            {Math.abs(trend)}%
          </span>
        </div>
      )}
    </div>
    <div
      style={{
        fontSize: '26px',
        fontWeight: '700',
        fontFamily: 'Playfair Display, serif',
        lineHeight: 1.1,
        marginBottom: '4px',
      }}
    >
      {value}
    </div>
    <div style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: '500' }}>
      {label}
    </div>
    {sub && (
      <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
        {sub}
      </div>
    )}
  </div>
);

export default StatCard;
