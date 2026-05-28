import React from 'react';
import { PLANS } from '../data/mockData';

const SettingsPage = ({ role, plan, onNav }) => (
  <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      {role === 'hotel' && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', gridColumn: 'span 2' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Current Subscription</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ padding: '16px 24px', background: `${PLANS[plan || 'starter'].accent}12`, border: `1px solid ${PLANS[plan || 'starter'].accent}30`, borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>PLAN</div>
              <div style={{ fontSize: '22px', fontWeight: '700', fontFamily: 'Poppins,sans-serif', color: PLANS[plan || 'starter'].accent, textTransform: 'capitalize' }}>
                {plan}
              </div>
            </div>
            <div style={{ padding: '16px 24px', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>MONTHLY</div>
              <div style={{ fontSize: '22px', fontWeight: '700', fontFamily: 'DM Mono,monospace' }}>₹{PLANS[plan || 'starter'].price}</div>
            </div>
            <div style={{ padding: '16px 24px', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>NEXT RENEWAL</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>-</div>
            </div>
            {plan !== 'enterprise' && (
              <button
                style={{
                  padding: '14px 24px',
                  background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Upgrade Plan ↗
              </button>
            )}
          </div>
        </div>
      )}
      {[
        { title: 'Property Settings', fields: ['Hotel Name', 'Address', 'City', 'Country', 'Phone', 'Email', 'Website'] },
        { title: 'Account Security', fields: ['Current Password', 'New Password', 'Two-Factor Auth', 'Session Timeout'] },
      ].map((s) => (
        <div key={s.title} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>{s.title}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {s.fields.map((f) => (
              <div key={f}>
                <label style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' }}>
                  {f.toUpperCase()}
                </label>
                <input
                  placeholder={f}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '7px',
                    color: 'var(--text)',
                    fontSize: '13px',
                    outline: 'none',
                    fontFamily: 'Inter, sans-serif',
                  }}
                />
              </div>
            ))}
            <button
              style={{
                padding: '10px',
                background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)',
                border: 'none',
                borderRadius: '7px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                marginTop: '4px',
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default SettingsPage;
