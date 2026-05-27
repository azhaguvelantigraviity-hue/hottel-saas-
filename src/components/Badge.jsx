import React from 'react';

const Badge = ({ children, color = 'gold' }) => {
  const colors = {
    gold: {
      background: 'rgba(201, 168, 76, 0.15)',
      color: '#C9A84C',
      border: '1px solid rgba(201, 168, 76, 0.3)',
    },
    teal: {
      background: 'rgba(45, 212, 191, 0.15)',
      color: '#2DD4BF',
      border: '1px solid rgba(45, 212, 191, 0.3)',
    },
    rose: {
      background: 'rgba(251, 113, 133, 0.15)',
      color: '#FB7185',
      border: '1px solid rgba(251, 113, 133, 0.3)',
    },
    violet: {
      background: 'rgba(167, 139, 250, 0.15)',
      color: '#A78BFA',
      border: '1px solid rgba(167, 139, 250, 0.3)',
    },
    green: {
      background: 'rgba(52, 211, 153, 0.15)',
      color: '#34D399',
      border: '1px solid rgba(52, 211, 153, 0.3)',
    },
    gray: {
      background: 'rgba(110, 106, 98, 0.15)',
      color: '#B8B4AA',
      border: '1px solid rgba(110, 106, 98, 0.3)',
    },
    amber: {
      background: 'rgba(252, 211, 77, 0.15)',
      color: '#FCD34D',
      border: '1px solid rgba(252, 211, 77, 0.3)',
    },
  };

  const activeStyle = colors[color] || colors.gray;

  return (
    <span
      style={{
        ...activeStyle,
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '600',
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
};

export default Badge;
