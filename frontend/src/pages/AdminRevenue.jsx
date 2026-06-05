import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';

const REVENUE_DATA = [
  { name: 'Jan', subscriptions: 120000, commissions: 35000 },
  { name: 'Feb', subscriptions: 140000, commissions: 42000 },
  { name: 'Mar', subscriptions: 165000, commissions: 55000 },
  { name: 'Apr', subscriptions: 180000, commissions: 60000 },
  { name: 'May', subscriptions: 210000, commissions: 75000 },
  { name: 'Jun', subscriptions: 245000, commissions: 90000 }
];

const PLAN_DATA = [
  { name: 'Enterprise', value: 450000, color: 'var(--gold)' },
  { name: 'Professional', value: 280000, color: 'var(--teal)' },
  { name: 'Starter', value: 95000, color: 'var(--rose)' }
];

const TRANSACTIONS = [
  { id: 'TXN-9092', hotel: 'The Grand Resort', type: 'Subscription (Enterprise)', amount: 39900, date: '2025-10-15', status: 'completed' },
  { id: 'TXN-9091', hotel: 'Seaside Villas', type: 'Commission (Sep)', amount: 12500, date: '2025-10-14', status: 'completed' },
  { id: 'TXN-9090', hotel: 'Mountain Retreat', type: 'Subscription (Pro)', amount: 14900, date: '2025-10-12', status: 'pending' },
  { id: 'TXN-9089', hotel: 'City Center Inn', type: 'Commission (Sep)', amount: 8400, date: '2025-10-10', status: 'completed' }
];

const thStyle = { padding: '14px 20px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', background: 'var(--surface)' };
const tdStyle = { padding: '14px 20px', fontSize: '13px', color: 'var(--text2)', borderBottom: '1px solid var(--border)' };

// Simple bar chart built with pure CSS
const SimpleBarChart = ({ data, maxVal }) => {
  const max = maxVal || Math.max(...data.map(d => d.subscriptions + d.commissions));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '220px', paddingTop: '20px' }}>
      {data.map((d, i) => {
        const subH = (d.subscriptions / max) * 100;
        const comH = (d.commissions / max) * 100;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '180px' }}>
              <div style={{ width: '60%', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{
                  height: `${comH * 1.8}px`, background: 'var(--teal)', borderRadius: '4px 4px 0 0',
                  transition: 'height 0.6s ease', minHeight: comH > 0 ? '4px' : '0px',
                  opacity: 0.85
                }} title={`Commissions: ₹${(d.commissions/1000).toFixed(0)}K`} />
                <div style={{
                  height: `${subH * 1.8}px`, background: 'var(--gold)', borderRadius: '0 0 4px 4px',
                  transition: 'height 0.6s ease', minHeight: subH > 0 ? '4px' : '0px',
                }} title={`Subscriptions: ₹${(d.subscriptions/1000).toFixed(0)}K`} />
              </div>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '500' }}>{d.name}</div>
          </div>
        );
      })}
    </div>
  );
};

// Horizontal bar for plan breakdown
const HorizontalBar = ({ label, value, maxValue, color }) => {
  const pct = (value / maxValue) * 100;
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', fontFamily: 'DM Mono,monospace' }}>₹{(value/1000).toFixed(0)}K</span>
      </div>
      <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color, borderRadius: '4px',
          transition: 'width 0.8s ease',
        }} />
      </div>
    </div>
  );
};

const AdminRevenue = () => {
  const [timeframe, setTimeframe] = useState('6m');
  const maxPlanVal = Math.max(...PLAN_DATA.map(d => d.value));

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px)', overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', marginBottom: '4px', fontFamily: 'Poppins, sans-serif' }}>Revenue Management</h2>
          <p style={{ fontSize: '13px', color: 'var(--text3)' }}>Platform-wide revenue tracking from subscriptions and transaction commissions.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: 'var(--surface)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          {['1m', '3m', '6m', '1y'].map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              style={{
                padding: '6px 16px', borderRadius: '6px', border: 'none',
                fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', textTransform: 'uppercase',
                background: timeframe === t ? 'var(--card)' : 'transparent',
                color: timeframe === t ? 'var(--gold)' : 'var(--text2)',
                boxShadow: timeframe === t ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard title="Total MRR" value="-" icon="dollar" color="var(--teal)" />
        <StatCard title="Subscription Revenue" value="-" icon="crown" color="var(--gold)" />
        <StatCard title="Commission Revenue" value="-" icon="chart" color="var(--violet)" />
        <StatCard title="Avg Rev Per Hotel" value="-" icon="hotel" color="var(--rose)" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Revenue Growth Chart */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'clamp(12px, 3vw, 24px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', fontFamily: 'Poppins, sans-serif' }}>Revenue Growth Overview</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--gold)' }} />
                <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Subscriptions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--teal)' }} />
                <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Commissions</span>
              </div>
            </div>
          </div>
          <SimpleBarChart data={REVENUE_DATA} />
        </div>

        {/* Revenue by Plan */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'clamp(12px, 3vw, 24px)' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', marginBottom: '24px', fontFamily: 'Poppins, sans-serif' }}>Revenue by Plan Type</div>
          {PLAN_DATA.map(p => (
            <HorizontalBar key={p.name} label={p.name} value={p.value} maxValue={maxPlanVal} color={p.color} />
          ))}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '16px', paddingTop: '16px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Active Hotels</span>
              <span style={{ fontWeight: '600', color: 'var(--text)' }}>-</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Avg Churn Rate</span>
              <span style={{ fontWeight: '600', color: 'var(--green)' }}>-</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text2)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Projected Next Month</span>
              <span style={{ fontWeight: '600', color: 'var(--gold)' }}>-</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', fontFamily: 'Poppins, sans-serif' }}>Recent Transactions</h3>
          <button style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>View All</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr>
                <th style={thStyle}>Transaction ID</th>
                <th style={thStyle}>Hotel</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map(txn => (
                <tr key={txn.id} onMouseEnter={e => e.currentTarget.style.background='var(--surface)'} onMouseLeave={e => e.currentTarget.style.background='transparent'} style={{ transition: 'background 0.15s' }}>
                  <td style={{ ...tdStyle, fontFamily: 'DM Mono,monospace', color: 'var(--gold)', fontWeight: '500' }}>{txn.id}</td>
                  <td style={{ ...tdStyle, fontWeight: '500', color: 'var(--text)' }}>{txn.hotel}</td>
                  <td style={tdStyle}>{txn.type}</td>
                  <td style={{ ...tdStyle, fontFamily: 'DM Mono,monospace', fontWeight: '600', color: 'var(--text)' }}>₹{txn.amount.toLocaleString()}</td>
                  <td style={tdStyle}>{txn.date}</td>
                  <td style={tdStyle}>
                    <Badge color={txn.status === 'completed' ? 'green' : txn.status === 'pending' ? 'amber' : 'rose'}>
                      {txn.status}
                    </Badge>
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

export default AdminRevenue;
