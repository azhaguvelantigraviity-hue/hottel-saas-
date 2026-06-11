import React, { useEffect, useState } from 'react';
import Icon from './Icon';
import Badge from './Badge';

const FeatureDetailModal = ({ feature, onClose, onStartTrial }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    setIsVisible(true);
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for exit animation
  };

  if (!feature) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'clamp(10px, 3vw, 40px)',
      background: isVisible ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0)',
      backdropFilter: isVisible ? 'blur(8px)' : 'blur(0px)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Click-away overlay */}
      <div 
        onClick={handleClose} 
        style={{ position: 'absolute', inset: 0, zIndex: -1 }} 
      />

      <div style={{
        width: '100%', maxWidth: '1000px',
        maxHeight: '100%',
        background: 'var(--card, #ffffff)',
        border: '1px solid var(--border, #e5e7eb)',
        borderRadius: '24px',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        
        {/* Header / Top Bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 30px',
          borderBottom: '1px solid var(--border, #e5e7eb)',
          background: 'var(--surface, #f9fafb)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: `${feature.color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Icon name={feature.icon} size={20} color={feature.color} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'var(--text, #111827)' }}>
                {feature.label}
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--text3, #6b7280)' }}>{feature.shortDesc}</span>
            </div>
          </div>
          <button 
            onClick={handleClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              width: '36px', height: '36px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text3, #6b7280)', transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--border, #e5e7eb)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Icon name="x" size={20} color="currentColor" />
          </button>
        </div>

        {/* Content Area */}
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          overflowY: 'auto',
          flex: 1
        }}>
          
          {/* Left Column: Text & Workflows */}
          <div style={{
            flex: '1 1 400px',
            padding: '30px',
            borderRight: '1px solid var(--border, #e5e7eb)'
          }}>
            <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--text2, #4b5563)', marginBottom: '24px' }}>
              {feature.description}
            </p>

            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text, #111827)' }}>Key Benefits</h3>
            <ul style={{ padding: 0, margin: '0 0 32px 0', listStyle: 'none' }}>
              {feature.benefits.map((benefit, i) => (
                <li key={i} style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'flex-start' }}>
                  <Icon name="check" size={16} color={feature.color} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: 'var(--text2, #4b5563)', lineHeight: 1.5 }}>{benefit}</span>
                </li>
              ))}
            </ul>

            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text, #111827)' }}>How it Works</h3>
            <div style={{ position: 'relative', paddingLeft: '16px', marginLeft: '8px', borderLeft: '2px solid var(--border, #e5e7eb)' }}>
              {feature.workflow.map((wf, i) => (
                <div key={i} style={{ position: 'relative', marginBottom: i === feature.workflow.length - 1 ? 0 : '24px' }}>
                  <div style={{
                    position: 'absolute', left: '-21px', top: '2px',
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: feature.color, border: '2px solid var(--card, #fff)'
                  }} />
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text, #111827)', marginBottom: '4px' }}>{wf.step}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text3, #6b7280)' }}>{wf.detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual & FAQs */}
          <div style={{
            flex: '1 1 350px',
            background: 'var(--surface, #f9fafb)',
            padding: '30px',
            display: 'flex', flexDirection: 'column'
          }}>
            {/* Abstract Graphic Representation */}
            <div style={{
              width: '100%', height: '220px', borderRadius: '16px',
              background: `linear-gradient(135deg, ${feature.color}15, ${feature.color}05)`,
              border: `1px solid ${feature.color}30`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              marginBottom: '32px', position: 'relative', overflow: 'hidden'
            }}>
              <Icon name={feature.icon} size={64} color={`${feature.color}60`} />
              <div style={{ marginTop: '16px', fontSize: '14px', fontWeight: '600', color: feature.color }}>
                {feature.placeholderText}
              </div>
              {/* Glassmorphic decorative elements */}
              <div style={{ position: 'absolute', top: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: `${feature.color}20`, filter: 'blur(20px)' }} />
              <div style={{ position: 'absolute', bottom: -30, right: -10, width: 120, height: 120, borderRadius: '50%', background: `${feature.color}20`, filter: 'blur(20px)' }} />
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text, #111827)' }}>Frequently Asked Questions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              {feature.faqs.map((faq, i) => (
                <div key={i} style={{ background: 'var(--card, #fff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border, #e5e7eb)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text, #111827)', marginBottom: '6px' }}>{faq.q}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text2, #4b5563)', lineHeight: 1.5 }}>{faq.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px 30px',
          borderTop: '1px solid var(--border, #e5e7eb)',
          background: 'var(--card, #fff)',
          display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text3, #6b7280)', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Available In Plans
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['starter', 'professional', 'enterprise'].map(plan => {
                const isActive = feature.plans.includes(plan);
                const colors = {
                  starter: 'gray',
                  professional: 'teal',
                  enterprise: 'gold'
                };
                return (
                  <Badge key={plan} color={isActive ? colors[plan] : 'gray'} style={{ opacity: isActive ? 1 : 0.4 }}>
                    {plan}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => { alert('A sales representative will contact you shortly to schedule a demo.'); handleClose(); }}
              style={{
                padding: '12px 24px', background: 'transparent',
                border: '1px solid var(--border, #e5e7eb)', borderRadius: '8px',
                color: 'var(--text, #111827)', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface, #f9fafb)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Book Demo
            </button>
            <button 
              onClick={() => {
                handleClose();
                setTimeout(() => onStartTrial(), 300);
              }}
              style={{
                padding: '12px 24px', background: 'linear-gradient(135deg, #C9A84C, #8A6F2E)',
                border: 'none', borderRadius: '8px',
                color: '#fff', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(201,168,76,0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(201,168,76,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(201,168,76,0.3)'; }}
            >
              Start Free Trial
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FeatureDetailModal;
