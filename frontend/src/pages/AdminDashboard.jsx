import React from 'react';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import { HOTELS, PLANS, ADMIN_REVENUE } from '../data/mockData';

const AdminDashboard = ({ onNav }) => {
  const totalMRR = 0;
  const totalHotels = 0;
  const planBreakdown = { starter: 0, professional: 0, enterprise: 0 };

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px)', overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatCard icon="hotel" iconColor="#C9A84C" label="Total Hotels" value={totalHotels} sub="-" trend={0} />
        <StatCard icon="dollar" iconColor="#2DD4BF" label="Monthly Revenue" value={`₹${(totalMRR / 1000).toFixed(0)}K`} sub="Platform MRR" trend={0} />
        <StatCard icon="trending" iconColor="#A78BFA" label="Active Subs" value="-" sub="-" trend={0} />
        <StatCard icon="users" iconColor="#FB7185" label="Total Rooms" value="-" sub="-" trend={0} />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '28px' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifySpace: 'space-between', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '3px' }}>Platform Revenue Growth</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Monthly Recurring Revenue</div>
            </div>
            <Badge color="gold">MRR</Badge>
          </div>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '10px' }}>
            {ADMIN_REVENUE.map((d, i) => {
              const max = Math.max(...ADMIN_REVENUE.map(d => d.mrr), 1);
              const pct = d.mrr / max;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'DM Mono,monospace' }}>₹{(d.mrr / 1000).toFixed(0)}K</div>
                  <div
                    style={{
                      width: '100%',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.5s',
                      height: `${pct * 160}px`,
                      background: i === ADMIN_REVENUE.length - 1 ? 'linear-gradient(180deg,#C9A84C,#8A6F2E)' : 'rgba(201,168,76,0.3)',
                    }}
                  />
                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{d.month}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Plan Distribution</div>
          <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '20px' }}>Active subscriptions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
{ name: 'Enterprise', count: planBreakdown.enterprise, total: totalHotels, color: '#C9A84C' },
{ name: 'Professional', count: planBreakdown.professional, total: totalHotels, color: '#2DD4BF' },
{ name: 'Starter', count: planBreakdown.starter, total: totalHotels, color: '#6E6A62' },
            ].map((p) => (
              <div key={p.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: p.color, fontWeight: '600' }}>{p.name}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{p.count} hotels</span>
                </div>
                <div style={{ height: '6px', background: 'var(--surface)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(p.count / p.total) * 100}%`, background: p.color, borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '20px', padding: '12px', background: 'var(--surface)', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>Upgrade Opportunities</div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--gold)', fontFamily: 'Poppins,sans-serif' }}>0</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Starter hotels eligible to upgrade</div>
          </div>
        </div>
      </div>

      {/* Recent Hotels */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ fontSize: '15px', fontWeight: '700' }}>Managed Hotels</div>
          <button
            onClick={() => onNav('hotels')}
            style={{
              fontSize: '13px',
              color: 'var(--gold)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            View All <Icon name="arrow" size={14} color="var(--gold)" />
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Hotel', 'City', 'Plan', 'Rooms', 'Occupancy', 'Revenue', 'Status'].map((h) => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.06em' }}>
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOTELS.slice(0, 5).map((h) => (
              <tr
                key={h.id}
                style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '12px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar initials={h.avatar} color={PLANS[h.plan].accent} size={30} />
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{h.name}</span>
                  </div>
                </td>
                <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text2)' }}>{h.city}</td>
                <td style={{ padding: '12px' }}>
                  <Badge color={h.plan === 'enterprise' ? 'gold' : h.plan === 'professional' ? 'teal' : 'gray'}>{h.plan}</Badge>
                </td>
                <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text2)' }}>{h.rooms}</td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '50px', height: '4px', background: 'var(--surface)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${h.occupancy}%`,
                          background: h.occupancy > 80 ? 'var(--green)' : h.occupancy > 60 ? 'var(--gold)' : 'var(--rose)',
                          borderRadius: '2px',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text2)' }}>{h.occupancy}%</span>
                  </div>
                </td>
                <td style={{ padding: '12px', fontSize: '13px', fontFamily: 'DM Mono,monospace', color: 'var(--text)' }}>
                  ₹{h.revenue.toLocaleString()}
                </td>
                <td style={{ padding: '12px' }}>
                  <Badge color={h.status === 'active' ? 'green' : h.status === 'trial' ? 'amber' : 'rose'}>{h.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
