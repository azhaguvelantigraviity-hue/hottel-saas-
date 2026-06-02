import React, { useEffect } from 'react';
import Icon from './Icon';

const Toast = ({ type = 'info', message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration) {
      const t = setTimeout(onClose, duration);
      return () => clearTimeout(t);
    }
  }, [duration, onClose]);

  const colors = {
    success: '#34D399',
    error: '#FB7185',
    info: '#60A5FA',
    warning: '#FBBF24'
  };

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px',
      background: 'var(--card)', borderLeft: `4px solid ${colors[type]}`,
      padding: '16px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex', alignItems: 'center', gap: '12px', zIndex: 9999
    }}>
      <div style={{ color: 'var(--text)', fontSize: '14px', fontWeight: '500' }}>{message}</div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
        <Icon name="x" size={16} color="var(--text3)" />
      </button>
    </div>
  );
};

export default Toast;
