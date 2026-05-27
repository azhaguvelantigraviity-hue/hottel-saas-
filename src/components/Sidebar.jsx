import React from 'react';
import Icon from './Icon';

const Sidebar = ({ role, active, onNav, onLogout, plan }) => {
  const adminNav = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'hotels', icon: 'hotel', label: 'Hotels' },
    { id: 'subscriptions', icon: 'crown', label: 'Subscriptions' },
    { id: 'revenue', icon: 'dollar', label: 'Revenue' },
    { id: 'analytics', icon: 'chart', label: 'Analytics' },
    { id: 'multibranch', icon: 'branch', label: 'Multi-Branch' },
    { id: 'audit', icon: 'shield', label: 'Audit Logs' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
  ];

  const hotelNavGroups = [
    {
      label: 'Operations',
      items: [
        { id: 'dashboard', icon: 'dashboard', label: 'Dashboard', plans: ['starter','professional','enterprise'] },
        { id: 'rooms', icon: 'bed', label: 'Rooms', plans: ['starter','professional','enterprise'] },
        { id: 'bookings', icon: 'calendar', label: 'Bookings', plans: ['starter','professional','enterprise'] },
        { id: 'checkin', icon: 'qr', label: 'Smart Check-In', plans: ['enterprise'] },
        { id: 'billing', icon: 'receipt', label: 'Billing', plans: ['starter','professional','enterprise'] },
      ]
    },
    {
      label: 'Guest Services',
      items: [
        { id: 'guests', icon: 'crm', label: 'Guest CRM', plans: ['professional','enterprise'] },
        { id: 'loyalty', icon: 'loyalty', label: 'Loyalty', plans: ['professional','enterprise'] },
        { id: 'restaurant', icon: 'food', label: 'Restaurant POS', plans: ['professional','enterprise'] },
        { id: 'laundry', icon: 'laundry', label: 'Laundry', plans: ['professional','enterprise'] },
        { id: 'travel', icon: 'taxi', label: 'Travel Desk', plans: ['enterprise'] },
        { id: 'events', icon: 'events', label: 'Events & Halls', plans: ['enterprise'] },
      ]
    },
    {
      label: 'Staff',
      items: [
        { id: 'employees', icon: 'users', label: 'Employees', plans: ['professional','enterprise'] },
        { id: 'housekeeping', icon: 'key', label: 'Housekeeping', plans: ['professional','enterprise'] },
        { id: 'maintenance', icon: 'maintenance', label: 'Maintenance', plans: ['professional','enterprise'] },
      ]
    },
    {
      label: 'Business',
      items: [
        { id: 'channel', icon: 'channel', label: 'Channel Manager', plans: ['professional','enterprise'] },
        { id: 'revenue', icon: 'revenue', label: 'Revenue AI', plans: ['enterprise'] },
        { id: 'analytics', icon: 'chart', label: 'Analytics', plans: ['professional','enterprise'] },
        { id: 'marketing', icon: 'marketing', label: 'Marketing', plans: ['professional','enterprise'] },
        { id: 'whatsapp', icon: 'whatsapp', label: 'WhatsApp', plans: ['professional','enterprise'] },
      ]
    },
    {
      label: 'System',
      items: [
        { id: 'inventory', icon: 'inventory', label: 'Inventory', plans: ['professional','enterprise'] },
        { id: 'iot', icon: 'iot', label: 'IoT & Door Locks', plans: ['enterprise'] },
        { id: 'security', icon: 'security', label: 'Security', plans: ['enterprise'] },
        { id: 'notifications', icon: 'notification', label: 'Notifications', plans: ['starter','professional','enterprise'] },
        { id: 'chatbot', icon: 'chatbot', label: 'AI Chatbot', plans: ['enterprise'] },
        { id: 'reports', icon: 'report', label: 'Reports', plans: ['starter','professional','enterprise'] },
        { id: 'settings', icon: 'settings', label: 'Settings', plans: ['starter','professional','enterprise'] },
      ]
    },
  ];

  const btnStyle = (isActive, locked) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: 'none',
    cursor: locked ? 'not-allowed' : 'pointer',
    textAlign: 'left',
    width: '100%',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.15s',
    background: isActive ? 'rgba(201, 168, 76, 0.12)' : 'transparent',
    color: isActive ? 'var(--gold)' : locked ? 'var(--text3)' : 'var(--text2)',
    opacity: locked ? 0.4 : 1,
  });

  return (
    <aside style={{ width: '220px', flexShrink: 0, background: 'var(--void)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
      <div style={{ padding: '20px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #C9A84C, #8A6F2E)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="hotel" size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Playfair Display, serif', lineHeight: 1.1 }}>StayOS</div>
          <div style={{ fontSize: '10px', color: 'var(--text3)', letterSpacing: '0.06em' }}>{role === 'admin' ? 'PLATFORM ADMIN' : 'HOTEL PORTAL'}</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {role === 'admin' ? (
          adminNav.map((item) => {
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => onNav(item.id)} style={btnStyle(isActive, false)}>
                <Icon name={item.icon} size={16} color={isActive ? 'var(--gold)' : 'var(--text2)'} />
                <span style={{ flex: 1 }}>{item.label}</span>
              </button>
            );
          })
        ) : (
          hotelNavGroups.map((group, gi) => (
            <div key={gi}>
              {gi > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '8px 4px' }} />}
              <div style={{ fontSize: '9px', color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 12px 4px', fontWeight: 600 }}>{group.label}</div>
              {group.items.map((item) => {
                const locked = item.plans && !item.plans.includes(plan || 'starter');
                const isActive = active === item.id;
                return (
                  <button key={item.id} onClick={() => !locked && onNav(item.id)} style={btnStyle(isActive, locked)}>
                    <Icon name={item.icon} size={15} color={isActive ? 'var(--gold)' : locked ? 'var(--text3)' : 'var(--text2)'} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {locked && <span style={{ fontSize: '9px', color: 'var(--text3)' }}>🔒</span>}
                  </button>
                );
              })}
            </div>
          ))
        )}
      </nav>

      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
        {role === 'hotel' && plan && (
          <div style={{ padding: '8px 12px', background: 'rgba(201, 168, 76, 0.08)', border: '1px solid rgba(201, 168, 76, 0.2)', borderRadius: '8px', marginBottom: '8px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text3)', letterSpacing: '0.06em', marginBottom: '2px' }}>CURRENT PLAN</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--gold)', textTransform: 'capitalize' }}>{plan}</div>
          </div>
        )}
        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--text3)', background: 'transparent' }}>
          <Icon name="logout" size={16} color="var(--text3)" /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
