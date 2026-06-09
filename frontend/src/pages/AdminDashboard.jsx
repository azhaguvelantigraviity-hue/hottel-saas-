import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import * as adminApi from '../services/adminService';

const PLANS = {
  starter:      { id: 'starter', name: 'Starter', accent: '#6B7280' },
  professional: { id: 'professional', name: 'Professional', accent: '#14B8A6' },
  enterprise:   { id: 'enterprise', name: 'Enterprise', accent: '#D97706' }
};

const AdminDashboard = ({ onNav }) => {
  const [dashboard, setDashboard] = useState({
    totalHotels: 0,
    activeHotels: 0,
    totalRooms: 0,
    totalUsers: 0,
    mrr: 0,
    planBreakdown: { starter: 0, professional: 0, enterprise: 0 },
    revenueData: []
  });
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [dashRes, hotelsRes] = await Promise.all([
          adminApi.getDashboard(),
          adminApi.getAllHotels()
        ]);
        if (dashRes.data) setDashboard(dashRes.data);
        if (hotelsRes.data) setHotels(hotelsRes.data);
      } catch (err) {
        console.error('Failed to load admin dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const { totalHotels, activeHotels, totalRooms, totalUsers, mrr, planBreakdown } = dashboard;

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px)', overflowY: 'auto', flex: 1, opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatCard icon="hotel" iconColor="#C9A84C" label="Total Hotels" value={totalHotels} sub="Registered Hotels" trend={0} />
        <StatCard icon="dollar" iconColor="#2DD4BF" label="Monthly Revenue" value={`₹${(mrr / 1000).toFixed(0)}K`} sub="Platform MRR" trend={0} />
        <StatCard icon="trending" iconColor="#A78BFA" label="Active Subs" value={activeHotels} sub="Active Subscriptions" trend={0} />
        <StatCard icon="users" iconColor="#FB7185" label="Total Staffs" value={totalUsers} sub="Across All Hotels" trend={0} />
      </div>

      {/* Charts Row */}
      <div className="mobile-col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '28px' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)' }}>
          <div className="mobile-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '3px' }}>Platform Revenue Growth</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Monthly Recurring Revenue</div>
            </div>
            <Badge color="gold">MRR</Badge>
          </div>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '10px' }}>
            {(dashboard.revenueData && dashboard.revenueData.length > 0 ? dashboard.revenueData : Array.from({length: 6}).map((_, i) => ({ name: '', subscriptions: 0 }))).map((d, i, arr) => {
              const monthMrr = d.subscriptions || 0;
              const maxMrr = Math.max(...arr.map(x => x.subscriptions || 0)) || 1;
              const pct = monthMrr / maxMrr;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'DM Mono,monospace' }}>₹{(monthMrr / 1000).toFixed(0)}K</div>
                  <div
                    style={{
                      width: '100%',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.5s',
                      height: `${pct * 160}px`,
                      background: i === 5 ? 'linear-gradient(180deg,#C9A84C,#8A6F2E)' : 'rgba(201,168,76,0.3)',
                    }}
                  />
                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{d.name}</div>
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
          <div className="mobile-wrap" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => onNav('hotels')}
              style={{
                fontSize: '12px',
                color: '#000',
                background: 'var(--gold)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <Icon name="plus" size={12} color="#000" /> Add Hotel
            </button>
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
        </div>
        <div className="table-responsive-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
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
            {hotels.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)' }}>No managed hotels found.</td></tr>
            ) : hotels.slice(0, 5).map((h) => (
              <tr
                key={h._id || h.id}
                style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '12px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar initials={h.name?.substring(0, 2).toUpperCase() || 'H'} color={PLANS[h.plan]?.accent || 'var(--gold)'} size={30} />
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{h.name}</span>
                  </div>
                </td>
                <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text2)' }}>{h.address?.city || h.city || '—'}</td>
                <td style={{ padding: '12px' }}>
                  <Badge color={h.plan === 'enterprise' ? 'gold' : h.plan === 'professional' ? 'teal' : 'gray'}>{h.plan}</Badge>
                </td>
                <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text2)' }}>{h.totalRooms || h.rooms || 0}</td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '50px', height: '4px', background: 'var(--surface)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${h.occupancy || 0}%`,
                          background: (h.occupancy || 0) > 80 ? 'var(--green)' : (h.occupancy || 0) > 60 ? 'var(--gold)' : 'var(--rose)',
                          borderRadius: '2px',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text2)' }}>{h.occupancy || 0}%</span>
                  </div>
                </td>
                <td style={{ padding: '12px', fontSize: '13px', fontFamily: 'DM Mono,monospace', color: 'var(--text)' }}>
                  ₹{(h.revenue || 0).toLocaleString()}
                </td>
                <td style={{ padding: '12px' }}>
                  <Badge color={h.planStatus === 'active' || h.status === 'active' ? 'green' : h.planStatus === 'trial' || h.status === 'trial' ? 'amber' : 'rose'}>{h.planStatus || h.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
