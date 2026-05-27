import React from 'react';

const Avatar = ({ initials, color = '#C9A84C', size = 36 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}40, ${color}20)`,
      border: `1.5px solid ${color}50`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size / 3,
      fontWeight: '700',
      color,
      flexShrink: 0,
      fontFamily: 'DM Mono, monospace',
    }}
  >
    {initials}
  </div>
);

export default Avatar;
