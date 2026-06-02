import React, { useState } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import { PLANS } from '../data/mockData';

const Landing = ({ onLogin, theme, setTheme }) => {
  const [hoveredPlan, setHoveredPlan] = useState('professional');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--obsidian)' }}>
      {/* NAV */}
      <nav
        style={{
          padding: '20px 60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          background: 'var(--void)',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="hotel" size={16} color="#fff" />
          </div>
          <span
            style={{
              fontSize: '20px',
              fontWeight: '700',
              fontFamily: 'Playfair Display,serif',
              letterSpacing: '0.02em',
            }}
          >
            StayOS
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              padding: '9px',
              background: 'transparent',
              border: '1px solid var(--border2)',
              borderRadius: '8px',
              color: 'var(--text2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} color="currentColor" />
          </button>
          <button
            onClick={() => onLogin('hotel')}
            style={{
              padding: '9px 20px',
              background: 'transparent',
              border: '1px solid var(--border2)',
              borderRadius: '8px',
              color: 'var(--text2)',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'DM Sans,sans-serif',
            }}
          >
            Hotel Login
          </button>
          <button
            onClick={() => onLogin('admin')}
            style={{
              padding: '9px 20px',
              background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'DM Sans,sans-serif',
            }}
          >
            Admin Login
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ padding: '100px 60px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201,168,76,0.08), transparent)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: '20px',
            marginBottom: '24px',
          }}
        >
          <Icon name="star" size={12} color="#C9A84C" />
          <span style={{ fontSize: '12px', color: '#C9A84C', fontWeight: '600', letterSpacing: '0.06em' }}>
            ALL-IN-ONE HOTEL MANAGEMENT PLATFORM
          </span>
        </div>
        <h1
          style={{
            fontSize: 'clamp(48px,6vw,80px)',
            fontFamily: 'Playfair Display,serif',
            fontWeight: '900',
            lineHeight: 1.1,
            marginBottom: '24px',
            maxWidth: '800px',
            margin: '0 auto 24px',
          }}
        >
          The Complete
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg,#C9A84C,#E8C97A)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Hotel Management
          </span>
          <br />
          Operating System
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text2)', maxWidth: '560px', margin: '0 auto 40px', lineHeight: 1.7 }}>
          From room bookings to revenue analytics — every tool your hotel needs, in one beautifully unified platform.
        </p>
      </div>

      {/* FEATURES STRIP */}
      <div style={{ padding: '0 60px 80px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
            Everything Your Hotel Needs
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: '15px' }}>24+ modules built for modern hospitality</p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '14px',
        }}>
          {[
            { icon: 'bed',         label: 'Room Management',     color: '#2DD4BF', desc: 'Live room status & floor map' },
            { icon: 'calendar',    label: 'Smart Bookings',       color: '#A78BFA', desc: 'Reservations with pet charges' },
            { icon: 'food',        label: 'Restaurant POS',       color: '#FB7185', desc: 'Orders, kitchen & billing' },
            { icon: 'maintenance', label: 'Maintenance',          color: '#FCD34D', desc: 'Tickets & repair tracking' },
            { icon: 'channel',     label: 'OTA Channel Sync',     color: '#60A5FA', desc: 'Booking.com, Expedia & more' },
            { icon: 'revenue',     label: 'Revenue Analytics',    color: '#C9A84C', desc: 'AI pricing & forecasting' },
            { icon: 'users',       label: 'Employee Management',  color: '#34D399', desc: 'Attendance & payroll' },
            { icon: 'key',         label: 'Housekeeping',         color: '#F97316', desc: 'Tasks, timers & room status' },
            { icon: 'crm',         label: 'Guest CRM & Loyalty',  color: '#EC4899', desc: 'Points, tiers & referrals' },
            { icon: 'shield',      label: 'Security & CCTV',      color: '#8B5CF6', desc: 'Visitor logs & 2FA' },
            { icon: 'invoice',     label: 'Advanced Billing',     color: '#06B6D4', desc: 'Split pay, GST & PDF invoices' },
            { icon: 'hotel',       label: 'Multi-Branch',         color: '#EF4444', desc: 'Centralized control' },
          ].map((f) => (
            <div
              key={f.label}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                transition: 'border-color 0.2s, transform 0.2s',
                cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = f.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0,
                background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={f.icon} size={20} color={f.color} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', marginBottom: '2px' }}>{f.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PRICING */}
      <div style={{ padding: '0 60px 100px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '42px', fontWeight: '700', marginBottom: '12px' }}>
            Plans for Every Property
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: '16px' }}>Scale your subscription as your hotel grows</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
          {Object.values(PLANS).map((plan) => {
            const isHov = hoveredPlan === plan.id;
            return (
              <div
                key={plan.id}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan('professional')}
                style={{
                  background: isHov ? `linear-gradient(160deg, ${plan.accent}12, var(--card))` : 'var(--card)',
                  border: `1px solid ${isHov ? plan.accent : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '32px',
                  transition: 'all 0.3s',
                  transform: isHov ? 'translateY(-4px)' : 'none',
                  cursor: 'pointer',
                }}
              >
                {plan.id === 'professional' && (
                  <div style={{ marginBottom: '12px' }}>
                    <Badge color="teal">MOST POPULAR</Badge>
                  </div>
                )}
                {plan.id === 'enterprise' && (
                  <div style={{ marginBottom: '12px' }}>
                    <Badge color="gold">BEST VALUE</Badge>
                  </div>
                )}
                <div style={{ fontSize: '14px', fontWeight: '600', color: plan.accent, letterSpacing: '0.08em', marginBottom: '8px' }}>
                  {plan.name.toUpperCase()}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '42px', fontWeight: '900', fontFamily: 'Playfair Display,serif' }}>
                    ₹{plan.price}
                  </span>
                  <span style={{ color: 'var(--text3)', fontSize: '14px' }}>/mo</span>
                </div>
                <div
                  style={{
                    borderTop: '1px solid var(--border)',
                    paddingTop: '20px',
                    marginBottom: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text2)' }}>
                      <Icon name="check" size={14} color={plan.accent} /> {f}
                    </div>
                  ))}
                  {plan.missing.slice(0, 3).map((f) => (
                    <div
                      key={f}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text3)', opacity: 0.5 }}
                    >
                      <Icon name="x" size={14} color="var(--text3)" /> {f}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => onLogin('hotel')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: isHov ? `linear-gradient(135deg,${plan.accent},${plan.accent}99)` : 'transparent',
                    border: `1px solid ${plan.accent}`,
                    borderRadius: '8px',
                    color: isHov ? '#fff' : plan.accent,
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    fontFamily: 'DM Sans,sans-serif',
                    transition: 'all 0.3s',
                  }}
                >
                  Get Started
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Landing;
