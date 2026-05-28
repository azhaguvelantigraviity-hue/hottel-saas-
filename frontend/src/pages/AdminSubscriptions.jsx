import React from 'react';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import { HOTELS, PLANS } from '../data/mockData';

const AdminSubscriptions = () => (
  <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
      {Object.values(PLANS).map((plan) => (
        <div
          key={plan.id}
          style={{
            background: 'var(--card)',
            border: `1px solid ${plan.accent}30`,
            borderRadius: 'var(--radius)',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: `radial-gradient(circle, ${plan.accent}15, transparent)`,
              pointerEvents: 'none',
            }}
          />
          <div style={{ fontSize: '13px', fontWeight: '700', color: plan.accent, letterSpacing: '0.08em', marginBottom: '8px' }}>
            {plan.name.toUpperCase()}
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', fontFamily: 'Poppins,sans-serif', marginBottom: '4px' }}>
            {plan.id === 'starter' ? '18' : plan.id === 'professional' ? '27' : '11'}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '16px' }}>Active hotels</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: plan.accent, fontFamily: 'DM Mono,monospace', marginBottom: '4px' }}>
            ₹
            {plan.id === 'starter'
              ? (18 * plan.price).toLocaleString()
              : plan.id === 'professional'
              ? (27 * plan.price).toLocaleString()
              : (11 * plan.price).toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Monthly contribution</div>
          <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px' }}>TOP FEATURES</div>
            {plan.features.slice(0, 4).map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text2)', marginBottom: '5px' }}>
                <Icon name="check" size={12} color={plan.accent} /> {f}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px' }}>
      <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Subscription Overview</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['Hotel', 'Plan', 'Monthly', 'Since', 'Renewal', 'Status', 'Action'].map((h) => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.05em' }}>
                {h.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOTELS.map((h) => (
            <tr key={h.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Avatar initials={h.avatar} color={PLANS[h.plan].accent} size={28} />
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>{h.name}</span>
                </div>
              </td>
              <td style={{ padding: '12px' }}>
                <Badge color={h.plan === 'enterprise' ? 'gold' : h.plan === 'professional' ? 'teal' : 'gray'}>{h.plan}</Badge>
              </td>
              <td style={{ padding: '12px', fontSize: '13px', fontFamily: 'DM Mono,monospace' }}>₹{PLANS[h.plan].price.toLocaleString()}</td>
              <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text3)' }}>{h.joined}</td>
              <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text2)' }}>Aug 1, 2025</td>
              <td style={{ padding: '12px' }}>
                <Badge color={h.status === 'active' ? 'green' : h.status === 'trial' ? 'amber' : 'rose'}>{h.status}</Badge>
              </td>
              <td style={{ padding: '12px' }}>
                <button style={{ fontSize: '12px', color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Manage
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminSubscriptions;
