import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';

const CheckoutAlertPopup = ({ socket }) => {
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    const handleAlert = (payload) => {
      setAlerts((prev) => [...prev, payload]);
      
      // Optional: Play a sound
      try {
        const audio = new Audio('/alert-sound.mp3'); // Assuming there's a sound, or it will fail silently
        audio.play().catch(() => {});
      } catch (e) {}
    };

    socket.on('checkoutAlertPopup', handleAlert);

    return () => {
      socket.off('checkoutAlertPopup', handleAlert);
    };
  }, [socket]);

  if (alerts.length === 0) return null;

  const dismissAlert = (index) => {
    setAlerts((prev) => prev.filter((_, i) => i !== index));
  };

  const viewDetails = (bookingId, index) => {
    dismissAlert(index);
    // Navigate to bookings page or specific booking details
    navigate('/hotel/bookings');
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      pointerEvents: 'none'
    }}>
      {alerts.map((alert, index) => (
        <div key={index} style={{
          background: 'var(--card, #fff)',
          border: '1px solid var(--rose, #f43f5e)',
          borderLeft: '4px solid var(--rose, #f43f5e)',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          padding: '16px',
          width: '320px',
          pointerEvents: 'auto',
          animation: 'slideInRight 0.3s ease-out forwards',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ color: 'var(--rose)' }}>
              <Icon name="clock" size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600', color: 'var(--text)' }}>
                Checkout Alert
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text2)', lineHeight: '1.4' }}>
                {alert.message}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => dismissAlert(index)}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                color: 'var(--text2)'
              }}
            >
              Dismiss
            </button>
            <button 
              onClick={() => viewDetails(alert.bookingId, index)}
              style={{
                padding: '6px 12px',
                background: 'var(--rose)',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                color: '#fff'
              }}
            >
              View Details
            </button>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CheckoutAlertPopup;
