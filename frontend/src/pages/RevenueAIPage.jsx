import React, { useState } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import { REVENUE_DATA } from '../data/mockData';

const RevenueAIPage = () => {
  const [activeTab, setActiveTab] = useState('insights');
  const [dynamicPricing, setDynamicPricing] = useState(true);
  const [autoAdjust, setAutoAdjust] = useState(false);

  const insights = [];

  const forecast = [];

  const Toggle = ({ value, onChange }) => (
    <div onClick={onChange} style={{ width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.2s', background: value ? 'var(--gold)' : 'var(--border)', position: 'relative', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', left: value ? '23px' : '3px' }} />
    </div>
  );

  const insightBg = { opportunity: 'rgba(52,211,153,0.08)', warning: 'rgba(252,211,77,0.08)', info: 'rgba(96,165,250,0.08)', success: 'rgba(45,212,191,0.08)' };
  const insightBorder = { opportunity: 'rgba(52,211,153,0.25)', warning: 'rgba(252,211,77,0.25)', info: 'rgba(96,165,250,0.25)', success: 'rgba(45,212,191,0.25)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ padding: '16px 32px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0' }}>
        {[['insights', 'AI Insights'], ['forecast', 'Revenue Forecast'], ['pricing', 'Dynamic Pricing'], ['competitors', 'Competitor Intel']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === id ? 'var(--gold)' : 'transparent'}`, color: activeTab === id ? 'var(--gold)' : 'var(--text3)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: '24px 32px', overflowY: 'auto', flex: 1 }}>
        {activeTab === 'insights' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '14px', marginBottom: '28px' }}>
              {[
                { label: 'RevPAR', value: '-', trend: '-', color: 'var(--gold)' },
                { label: 'ADR', value: '-', trend: '-', color: 'var(--teal)' },
                { label: 'Occupancy', value: '-', trend: '-', color: 'var(--green)' },
                { label: 'GOPPAR', value: '-', trend: '-', color: 'var(--violet)' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'Poppins,sans-serif', color: s.color, marginBottom: '4px' }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>{s.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: '600' }}>↑ {s.trend} vs last month</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {insights.map((ins, i) => (
                <div key={i} style={{ background: insightBg[ins.type], border: `1px solid ${insightBorder[ins.type]}`, borderRadius: 'var(--radius)', padding: '18px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <span style={{ fontSize: '24px', flexShrink: 0 }}>{ins.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>{ins.title}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '8px' }}>{ins.desc}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'DM Mono,monospace', color: ins.type === 'warning' ? 'var(--rose)' : 'var(--green)' }}>{ins.impact || '-'}</span>
                      <button style={{ padding: '5px 12px', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '6px', color: 'var(--gold)', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>{ins.action}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'forecast' && (
          <>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)', marginBottom: '20px' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>4-Week Revenue Forecast</div>
              <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
                {forecast.map((f, i) => {
                  const max = Math.max(...forecast.map(f => f.revenue), 1);
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'DM Mono,monospace' }}>₹{(f.revenue / 1000).toFixed(0)}K</div>
                      <div style={{ width: '100%', borderRadius: '4px 4px 0 0', height: `${(f.revenue / max) * 140}px`, background: i === 0 ? 'linear-gradient(180deg,#C9A84C,#8A6F2E)' : 'rgba(201,168,76,0.3)' }} />
                      <div style={{ fontSize: '10px', color: 'var(--text3)', textAlign: 'center' }}>{f.week.slice(0, 6)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {forecast.map((f, i) => (
                <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '12px', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>{f.week}</div>
                  {[['Occupancy', `${f.occupancy}%`, f.occupancy > 80 ? 'var(--green)' : 'var(--amber)'], ['RevPAR', `₹${f.revPAR.toLocaleString()}`, 'var(--gold)'], ['ADR', `₹${f.adr.toLocaleString()}`, 'var(--teal)'], ['Revenue', `₹${(f.revenue / 1000).toFixed(0)}K`, 'var(--violet)']].map(([k, v, c]) => (
                    <div key={k} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: c, fontFamily: 'DM Mono,monospace' }}>{v}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text3)' }}>{k}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'pricing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Dynamic Pricing Settings</div>
              {[
                { label: 'Dynamic Pricing Engine', desc: 'Automatically adjust rates based on demand, occupancy, and market data', value: dynamicPricing, onChange: () => setDynamicPricing(p => !p) },
                { label: 'Auto-Apply Recommendations', desc: 'Automatically apply AI rate recommendations without manual approval', value: autoAdjust, onChange: () => setAutoAdjust(p => !p) },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>{s.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{s.desc}</div>
                  </div>
                  <Toggle value={s.value} onChange={s.onChange} />
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>AI Rate Recommendations</div>
              {[].map(r => (
                <div key={r.room} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{r.room}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{r.reason}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text3)', textDecoration: 'line-through' }}>₹{r.current.toLocaleString()}</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: r.change.startsWith('+') ? 'var(--green)' : 'var(--rose)', fontFamily: 'DM Mono,monospace' }}>₹{r.recommended.toLocaleString()} <span style={{ fontSize: '11px' }}>({r.change})</span></div>
                  </div>
                  <button style={{ padding: '6px 12px', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '6px', color: 'var(--gold)', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>Apply</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'competitors' && (
          <div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)', marginBottom: '20px' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Competitor Rate Intelligence</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '20px' }}>Market data</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Hotel', 'Stars', 'Std Room', 'Deluxe', 'Suite', 'Occupancy', 'vs Us'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.05em' }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[].map((h, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i === 0 ? 'rgba(201,168,76,0.05)' : 'transparent' }}>
                      <td style={{ padding: '12px', fontSize: '13px', fontWeight: i === 0 ? '700' : '400', color: i === 0 ? 'var(--gold)' : 'var(--text)' }}>{h.name}</td>
                      <td style={{ padding: '12px', fontSize: '13px', color: 'var(--amber)' }}>{'★'.repeat(h.stars)}</td>
                      <td style={{ padding: '12px', fontSize: '13px', fontFamily: 'DM Mono,monospace' }}>₹{h.std.toLocaleString()}</td>
                      <td style={{ padding: '12px', fontSize: '13px', fontFamily: 'DM Mono,monospace' }}>₹{h.deluxe.toLocaleString()}</td>
                      <td style={{ padding: '12px', fontSize: '13px', fontFamily: 'DM Mono,monospace' }}>₹{h.suite.toLocaleString()}</td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{h.occ}%</td>
                      <td style={{ padding: '12px' }}>
                        {h.diff === 0 ? <Badge color="gray">You</Badge> : <Badge color={h.diff > 0 ? 'rose' : 'green'}>{h.diff > 0 ? `+${h.diff}%` : `${h.diff}%`}</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueAIPage;
