import React, { useState } from 'react';
import Icon from './Icon';

const Sidebar = ({ role, active, onNav, onLogout, plan, isOpen, setIsOpen }) => {

  const adminNav = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'hotels',    icon: 'hotel',     label: 'Hotels' },
    { id: 'subscriptions', icon: 'crown', label: 'Subscriptions' },
    { id: 'revenue',   icon: 'dollar',    label: 'Revenue' },
    { id: 'analytics', icon: 'chart',     label: 'Analytics' },
    { id: 'multibranch', icon: 'branch',  label: 'Multi-Branch' },
    { id: 'settings',  icon: 'settings',  label: 'Settings' },
  ];

  const hotelNavGroups = [
    {
      label: 'MAIN MENU',
      items: [
        { id: 'dashboard', icon: 'dashboard', label: 'Dashboard',      plans: ['starter','professional','enterprise'] },
        { id: 'checkin',   icon: 'checkin',   label: 'Check-In/Out',   plans: ['starter','professional','enterprise'] },
        { id: 'rooms',     icon: 'bed',       label: 'Rooms',          plans: ['starter','professional','enterprise'] },
        { id: 'bookings',  icon: 'calendar',  label: 'Bookings',       plans: ['starter','professional','enterprise'] },
        { id: 'revenue',   icon: 'chart',     label: 'Revenue Report', plans: ['starter','professional','enterprise'] },
        { id: 'billing',   icon: 'receipt',   label: 'Billing',        plans: ['starter','professional','enterprise'] },
      ],
    },
    {
      label: 'GUEST SERVICES',
      items: [
        { id: 'guests',     icon: 'crm',        label: 'Guest CRM',      plans: ['professional','enterprise'] },
        { id: 'loyalty',    icon: 'loyalty',     label: 'Loyalty Program',plans: ['professional','enterprise'] },
        { id: 'restaurant', icon: 'food',        label: 'Restaurant POS', plans: ['professional','enterprise'] },
        { id: 'complaints', icon: 'bell',        label: 'Complaints',     plans: ['starter','professional','enterprise'] },
        { id: 'laundry',    icon: 'laundry',     label: 'Laundry',        plans: ['professional','enterprise'] },
        { id: 'travel',     icon: 'taxi',        label: 'Travel Desk',    plans: ['enterprise'] },
        { id: 'events',     icon: 'events',      label: 'Events & Halls', plans: ['enterprise'] },
      ],
    },
    {
      label: 'STAFF MANAGEMENT',
      items: [
        { id: 'employees',    icon: 'users',       label: 'Employees',    plans: ['starter','professional','enterprise'] },
        { id: 'attendance',   icon: 'calendar',    label: 'Attendance',   plans: ['starter','professional','enterprise'] },
        { id: 'housekeeping', icon: 'key',         label: 'Housekeeping', plans: ['professional','enterprise'] },
        { id: 'maintenance',  icon: 'settings',    label: 'Maintenance',  plans: ['starter','professional','enterprise'] },
        { id: 'payroll',      icon: 'dollar',      label: 'Payroll',      plans: ['professional','enterprise'] },
      ],
    },

  ];

  const planColors = { starter: '#6B7280', professional: '#14B8A6', enterprise: '#D97706' };
  const planColor = planColors[plan] || '#6B7280';

  const NavBtn = ({ item, locked }) => {
    const isActive = active === item.id;
    return (
      <button
        onClick={() => { if(!locked) { onNav(item.id); if(setIsOpen) setIsOpen(false); } }}
        title={locked ? `Requires ${item.plans?.[0]} plan` : item.label}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '8px 12px', borderRadius: '8px', border: 'none',
          cursor: locked ? 'not-allowed' : 'pointer',
          textAlign: 'left', width: '100%', fontSize: '13px', fontWeight: '500',
          transition: 'all 0.15s',
          background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
          color: isActive ? 'var(--sidebar-active-text)' : locked ? 'rgba(199,210,254,0.3)' : 'var(--sidebar-text)',
        }}
        onMouseEnter={e => { if (!isActive && !locked) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
      >
        <Icon
          name={item.icon}
          size={15}
          color={isActive ? '#FFFFFF' : locked ? 'rgba(199,210,254,0.3)' : '#A5B4FC'}
        />
        <span style={{ flex: 1, letterSpacing: '0.01em' }}>{item.label}</span>
        {locked && <span style={{ fontSize: '9px', opacity: 0.5 }}>🔒</span>}
        {isActive && (
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#818CF8', flexShrink: 0 }} />
        )}
      </button>
    );
  };

  return (
    <>
      {isOpen && (
        <div 
          className="mobile-block"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998, display: 'none' }}
          onClick={() => setIsOpen && setIsOpen(false)}
        />
      )}
      <aside 
        className={isOpen ? 'sidebar-open' : 'sidebar-closed'}
        style={{
          width: '220px', flexShrink: 0,
          background: 'var(--sidebar-bg)',
          display: 'flex', flexDirection: 'column',
          height: '100vh', position: 'sticky', top: 0,
          borderRight: '1px solid var(--sidebar-border)',
          zIndex: 9999,
          transition: 'transform 0.3s ease',
        }}
      >
      {/* Logo */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid var(--sidebar-border)',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <div style={{
          width: '34px', height: '34px',
          background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
          borderRadius: '10px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
        }}>
          <span style={{ fontSize: '16px' }}>👑</span>
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '-0.01em' }}>StayOS</div>
          <div style={{ fontSize: '10px', color: 'var(--sidebar-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {role === 'admin' ? 'Platform Admin' : role === 'manager' ? 'Hotel Manager' : 'Reception Desk'}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {role === 'admin' ? (
          adminNav.map(item => <NavBtn key={item.id} item={item} locked={false} />)
        ) : (
          hotelNavGroups.map(group => {
            const isItemVisible = (itemId) => {
              if (role === 'manager') {
                const managerPages = [
                  'dashboard', 'checkin', 'rooms', 'bookings', 
                  'housekeeping', 'attendance', 'restaurant', 
                  'complaints', 'maintenance', 'revenue', 
                  'employees', 'analytics', 'reports', 'settings'
                ];
                return managerPages.includes(itemId);
              }
              if (role === 'staff') {
                const staffPages = [
                  'dashboard', 'rooms', 'bookings', 'checkin', 'billing', 'guests', 'loyalty', 
                  'restaurant', 'laundry', 'travel', 'events', 'housekeeping', 'attendance',
                  'channel', 'revenue', 'analytics', 'marketing', 'whatsapp', 'inventory', 
                  'iot', 'security', 'notifications', 'chatbot', 'reports', 'settings'
                ];
                return staffPages.includes(itemId);
              }
              return true;
            };

            const visibleItems = group.items.filter(item => isItemVisible(item.id));
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.label} style={{ marginBottom: '4px' }}>
                <div style={{
                  fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em',
                  color: 'var(--sidebar-group-label)', padding: '10px 12px 4px',
                  textTransform: 'uppercase',
                }}>
                  {group.label}
                </div>
                {visibleItems.map(item => {
                  const locked = item.plans && !item.plans.includes(plan || 'starter');
                  return <NavBtn key={item.id} item={item} locked={locked} />;
                })}
              </div>
            );
          })
        )}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--sidebar-border)' }}>
        {role !== 'admin' && plan && (
          <div style={{
            padding: '10px 12px', marginBottom: '8px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
          }}>
            <div style={{ fontSize: '10px', color: 'var(--sidebar-text-muted)', letterSpacing: '0.08em', marginBottom: '3px' }}>
              CURRENT PLAN
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: planColor, textTransform: 'capitalize' }}>
                {plan}
              </div>
              <span style={{ fontSize: '14px' }}>👑</span>
            </div>
            <button
              onClick={() => onNav('settings')}
              style={{
                marginTop: '6px', width: '100%', padding: '5px',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '6px', color: 'var(--sidebar-text)', cursor: 'pointer',
                fontSize: '11px', fontWeight: '500',
              }}
            >
              View Plan Details
            </button>
          </div>
        )}
        <button
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 12px', borderRadius: '8px', border: 'none',
            cursor: 'pointer', width: '100%', fontSize: '13px',
            color: 'rgba(199,210,254,0.6)', background: 'transparent',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#C7D2FE'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(199,210,254,0.6)'; }}
        >
          <Icon name="logout" size={15} color="currentColor" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
