import React, { useState } from 'react';
import Icon from './Icon';
import { useNotifications } from '../context/NotificationContext';
import { useAdminNotifications } from '../context/AdminNotificationContext';
import { getAllHotels } from '../services/adminService';
import { getUser } from '../services/authService';
import CheckoutAlertPopup from './CheckoutAlertPopup';

const Topbar = ({ title, subtitle, role, onNav, toggleSidebar }) => {
  const [search, setSearch] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const hotelNotifs = useNotifications();
  const adminNotifs = useAdminNotifications();
  const { notifications, unreadCount, markRead, markAllRead, socket } = role === 'admin' ? adminNotifs : hotelNotifs;
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState(localStorage.getItem('selectedHotelId') || '');

  React.useEffect(() => {
    if (role === 'admin') {
      getAllHotels().then(res => setHotels(res.data || [])).catch(console.error);
    }
  }, [role]);

  const handleHotelChange = (e) => {
    const val = e.target.value;
    if (val) localStorage.setItem('selectedHotelId', val);
    else localStorage.removeItem('selectedHotelId');
    setSelectedHotelId(val);
    window.location.reload();
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning,';
    if (h < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  const userName  = role === 'admin' ? 'Admin' : role === 'manager' ? 'Manager' : role === 'reception' ? 'Receptionist' : role === 'housekeeping' ? 'Housekeeping' : 'User';
  const userInitials = role === 'admin' ? 'A' : role === 'manager' ? 'M' : role === 'reception' ? 'R' : role === 'housekeeping' ? 'H' : 'U';

  return (
    <div className="topbar-container" style={{
      padding: '0 28px',
      height: '64px',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--surface)',
      flexShrink: 0,
      gap: '12px',
    }}>
      {/* Left — Hamburger + Page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
        {toggleSidebar && (
          <button 
            className="mobile-block"
            onClick={toggleSidebar}
            style={{
              display: 'none',
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '4px', color: 'var(--text)',
            }}
          >
            <Icon name="menu" size={24} color="var(--text)" />
          </button>
        )}
        <div>
          <h1 className="mobile-text-sm" style={{
            fontSize: '20px', fontWeight: '700', color: 'var(--text)',
            letterSpacing: '-0.02em', lineHeight: 1.2, whiteSpace: 'nowrap',
            textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '150px'
          }}>
            {title}
          </h1>
          {subtitle && (
            <p className="mobile-hidden" style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '500', marginTop: '1px' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right — Search + actions + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {role === 'admin' && (
          <select
            value={selectedHotelId}
            onChange={handleHotelChange}
            className="mobile-hidden"
            style={{
              padding: '8px 12px',
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: '8px', fontSize: '13px', color: 'var(--text)',
              outline: 'none', cursor: 'pointer'
            }}
          >
            <option value="">Global View (All Hotels)</option>
            {hotels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
          </select>
        )}
        
        {role === 'admin' && selectedHotelId && (
          <button 
            onClick={() => window.location.href = '/hotel/dashboard'} 
            className="mobile-hidden"
            style={{ 
              padding: '8px 12px', background: 'var(--primary)', color: 'white', 
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600'
            }}
          >
            Manage Hotel
          </button>
        )}

        {/* Return to Admin Button if currently in hotel dashboard but user is admin */}
        {role !== 'admin' && getUser()?.role === 'platform_admin' && (
          <button 
            onClick={() => window.location.href = '/admin/dashboard'} 
            className="mobile-hidden"
            style={{ 
              padding: '8px 12px', background: 'var(--rose)', color: 'white', 
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600'
            }}
          >
            Exit to Platform Admin
          </button>
        )}

        {/* Search */}
        <div className="mobile-hidden" style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}>
            <Icon name="search" size={15} color="var(--text4)" />
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
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'var(--bg)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <Icon name="bell" size={17} color="var(--text2)" />
            {unreadCount > 0 && (
              <div style={{
                position: 'absolute', top: '-4px', right: '-4px', minWidth: '16px', height: '16px',
                background: 'var(--rose)', borderRadius: '8px', border: '2px solid var(--surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '9px', fontWeight: '700', padding: '0 4px'
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifs && (
            <>
              <div 
                style={{ position: 'fixed', inset: 0, zIndex: 9998 }} 
                onClick={() => setShowNotifs(false)}
              />
              <div style={{
                position: 'absolute', top: '50px', right: 0, width: '320px', maxWidth: '90vw',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                zIndex: 9999, display: 'flex', flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card)' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{ fontSize: '11px', color: 'var(--gold)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
                      Mark all read
                    </button>
                  )}
                </div>
                
                <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px' }}>
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => { markRead(n.id); }}
                        style={{ 
                          padding: '12px 16px', borderBottom: '1px solid var(--border)', 
                          display: 'flex', gap: '12px', cursor: 'pointer',
                          background: n.read ? 'transparent' : 'rgba(201,168,76,0.06)',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--card)'}
                        onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(201,168,76,0.06)'}
                      >
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${n.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon name={n.icon || 'bell'} size={14} color={n.color || 'var(--text2)'} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ fontSize: '13px', fontWeight: n.read ? '500' : '600', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</span>
                            <span style={{ fontSize: '10px', color: 'var(--text3)', flexShrink: 0 }}>
                              {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text3)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {n.desc}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div 
                  onClick={() => { setShowNotifs(false); if (onNav) onNav('notifications'); }}
                  style={{ 
                    padding: '10px', textAlign: 'center', fontSize: '12px', fontWeight: '500', 
                    color: 'var(--primary)', cursor: 'pointer', background: 'var(--surface)',
                    borderTop: '1px solid var(--border)', transition: 'background 0.2s' 
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--card)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
                >
                  View All Notifications
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', background: 'var(--border)' }} />

        {/* User */}
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: '700', color: '#fff', flexShrink: 0,
              boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
            }}>
              {userInitials}
            </div>
            <div className="mobile-hidden" style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{greeting()}</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {userName}
                <Icon name="arrow" size={12} color="var(--text3)" />
              </div>
            </div>
          </div>

          {/* User Dropdown */}
          {showUserMenu && (
            <>
              <div 
                style={{ position: 'fixed', inset: 0, zIndex: 9998 }} 
                onClick={() => setShowUserMenu(false)}
              />
              <div style={{
                position: 'absolute', top: '50px', right: 0, width: '200px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                zIndex: 9999, display: 'flex', flexDirection: 'column',
                overflow: 'hidden', padding: '8px'
              }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>{userName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{role === 'admin' ? 'Platform Administrator' : 'Hotel Staff'}</div>
                </div>
                
                <div 
                  onClick={() => { setShowUserMenu(false); if (onNav) onNav('settings'); }}
                  style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text2)', cursor: 'pointer', borderRadius: '6px', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--card)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Icon name="settings" size={14} color="var(--text2)" />
                  Account Settings
                </div>
                
                <div 
                  onClick={() => {
                    setShowUserMenu(false);
                    // Locate logout button in sidebar and click it as a hack, or call window location
                    const logoutBtn = document.querySelector('aside button:last-child');
                    if (logoutBtn && logoutBtn.textContent.includes('Sign Out')) {
                      logoutBtn.click();
                    } else {
                      window.location.href = '/';
                    }
                  }}
                  style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--rose)', cursor: 'pointer', borderRadius: '6px', transition: 'background 0.2s', marginTop: '4px' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Icon name="logout" size={14} color="var(--rose)" />
                  Sign Out
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <CheckoutAlertPopup socket={socket} />
    </div>
  );
};

export default Topbar;
