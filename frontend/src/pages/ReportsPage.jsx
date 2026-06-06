import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import * as api from '../services/operationsService';

const ReportsPage = () => {
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    api.getRevenueReport().then(res => {
      if (res.data) setRevenueData(res.data);
    }).catch(console.error);
  }, []);

  return (
  <div style={{ padding: 'clamp(16px, 4vw, 32px)', overflowY: 'auto', flex: 1 }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)' }}>
        <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Revenue vs Expenses</div>
        <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '20px' }}>Last 7 months</div>
        <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
          {revenueData.map((d, i) => {
            const max = Math.max(...revenueData.map(d => Math.max(d.revenue, d.expenses)), 1);
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', gap: '3px', height: '160px' }}>
                  <div style={{ flex: 1, borderRadius: '3px 3px 0 0', height: `${(d.revenue / max) * 160}px`, background: 'linear-gradient(180deg,#C9A84C80,#C9A84C40)' }} />
                  <div style={{ flex: 1, borderRadius: '3px 3px 0 0', height: `${(d.expenses / max) * 160}px`, background: 'linear-gradient(180deg,#FB718580,#FB718540)' }} />
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text3)' }}>{d.month}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--gold)', opacity: 0.7 }} />
            <span style={{ fontSize: '12px', color: 'var(--text3)' }}>Revenue</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--rose)', opacity: 0.7 }} />
            <span style={{ fontSize: '12px', color: 'var(--text3)' }}>Expenses</span>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)' }}>
        <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Booking Sources</div>
        <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '20px' }}>Current period</div>
        {[].map((s) => (
          <div key={s.label} style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{s.label}</span>
              <span style={{ fontSize: '12px', fontFamily: 'DM Mono,monospace', color: s.color }}>
                {s.count} ({s.pct}%)
              </span>
            </div>
            <div style={{ height: '6px', background: 'var(--surface)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${s.pct}%`, background: s.color, borderRadius: '3px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '14px' }}>
      {[].map((r) => (
        <div
          key={r.title}
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border2)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: `${r.color}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}
          >
            <Icon name={r.icon} size={18} color={r.color} />
          </div>
          <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '3px' }}>{r.title}</div>
          <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '12px' }}>{r.date}</div>
          <button
            style={{
              width: '100%',
              padding: '7px',
              background: 'transparent',
              border: `1px solid ${r.color}40`,
              borderRadius: '6px',
              color: r.color,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Download PDF
          </button>
        </div>
      ))}
    </div>
  </div>
  );
};

export default ReportsPage;
