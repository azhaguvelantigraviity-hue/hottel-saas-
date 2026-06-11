import React, { useState } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
const PLANS = {
  starter: { id: 'starter', name: 'Starter', price: 2999, accent: '#6B7280', features: ['Up to 20 Rooms', 'Basic Bookings', 'Standard Support'], missing: ['POS System', 'Channel Manager', 'Advanced Analytics'] },
  professional: { id: 'professional', name: 'Professional', price: 5999, accent: '#0D9488', features: ['Up to 100 Rooms', 'POS System', 'Channel Manager', 'Priority Support'], missing: ['Advanced Analytics'] },
  enterprise: { id: 'enterprise', name: 'Enterprise', price: 9999, accent: '#C9A84C', features: ['Unlimited Rooms', 'All Features', '24/7 Support', 'Dedicated Account Manager'], missing: [] }
};

const Landing = ({ onLogin, theme, setTheme }) => {
  const [hoveredPlan, setHoveredPlan] = useState('professional');
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--obsidian)' }}>
      {/* NAV */}
      <nav
        className="landing-nav"
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
            className="landing-logo-icon"
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
            className="landing-logo-text"
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
        <div className="landing-nav-buttons" style={{ display: 'flex', gap: '12px' }}>
          <button
            className="landing-btn-icon"
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
            className="landing-btn"
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
            className="landing-btn"
            onClick={() => setShowRegister(true)}
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
            Register Hotel
          </button>
          <button
            className="landing-btn"
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
      <div className="landing-hero-container" style={{ padding: '100px 60px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
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
          className="landing-hero-title"
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
        <p className="landing-hero-desc" style={{ fontSize: '18px', color: 'var(--text2)', maxWidth: '560px', margin: '0 auto 40px', lineHeight: 1.7 }}>
          From room bookings to revenue analytics — every tool your hotel needs, in one beautifully unified platform.
        </p>
        <button
          onClick={() => setShowRegister(true)}
          style={{
            padding: '16px 32px',
            background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '700',
            fontFamily: 'DM Sans,sans-serif',
            boxShadow: '0 8px 16px rgba(201,168,76,0.2)',
            transition: 'all 0.3s',
          }}
        >
          Start 2-Day Free Trial
        </button>
      </div>

      {/* FEATURES STRIP */}
      <div className="landing-section-container" style={{ padding: '0 60px 80px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
            Everything Your Hotel Needs
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: '15px' }}>24+ modules built for modern hospitality</p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
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
      <div className="landing-section-container" style={{ padding: '0 60px 100px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '42px', fontWeight: '700', marginBottom: '12px' }}>
            Plans for Every Property
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: '16px' }}>Scale your subscription as your hotel grows</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
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
                  padding: 'clamp(16px, 4vw, 32px)',
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
                  onClick={() => setShowRegister(true)}
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
                  Start Free Trial
                </button>
              </div>
            );
          })}
        </div>
      </div>
      
      {showRegister && (
        <RegistrationModal onClose={() => setShowRegister(false)} />
      )}
    </div>
  );
};

const RegistrationModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    hotelName: '', ownerName: '', email: '', phone: '', address: '', city: '', totalRooms: 10, plan: 'professional', password: '', confirmPassword: ''
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { registerHotelForm } = await import('../services/authService');
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword') submitData.append(key, formData[key]);
      });
      if (documentFile) {
        submitData.append('document', documentFile);
      }
      
      await registerHotelForm(submitData);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to submit registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
      <div style={{ background: 'var(--card)', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '24px', fontFamily: 'Playfair Display,serif', marginBottom: '8px' }}>Register Your Hotel</h2>
        <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '24px' }}>Submit your hotel details to create an account.</p>
        
        {success ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(52, 211, 153, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name="check" size={24} color="#34D399" />
            </div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Registration Submitted!</h3>
            <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '24px' }}>Your request is Pending Approval + Free Trial Requested. You will be notified once it is approved.</p>
            <button onClick={onClose} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', borderRadius: '6px', fontSize: '13px' }}>{error}</div>}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Hotel Name</label>
                <input required value={formData.hotelName} onChange={e => setFormData({...formData, hotelName: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Owner/Manager Name</label>
                <input required value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Phone Number</label>
                <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g,'').slice(0,10)})} style={{ width: '100%', padding: '10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} placeholder="10-digit number" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Hotel Address</label>
                <input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>City</label>
                <input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Total Rooms</label>
                <input required type="number" min="1" value={formData.totalRooms} onChange={e => setFormData({...formData, totalRooms: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Plan</label>
                <select value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}>
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Password</label>
                <input required type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '10px', paddingRight: '40px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} />
                <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '28px', cursor: 'pointer', color: 'var(--text3)' }}>
                  <Icon name={showPassword ? "eye-off" : "eye"} size={16} />
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Confirm Password</label>
                <input required type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} style={{ width: '100%', padding: '10px', paddingRight: '40px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} />
                <div onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '12px', top: '28px', cursor: 'pointer', color: 'var(--text3)' }}>
                  <Icon name={showConfirmPassword ? "eye-off" : "eye"} size={16} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Hotel Documents Upload (PDF/Image)</label>
                <input type="file" onChange={e => setDocumentFile(e.target.files[0])} accept="image/*,.pdf" style={{ width: '100%', padding: '10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', color: '#fff', borderRadius: '6px', cursor: loading ? 'wait' : 'pointer', fontWeight: '600' }}>
                {loading ? 'Submitting...' : 'Start Free Trial'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Landing;
