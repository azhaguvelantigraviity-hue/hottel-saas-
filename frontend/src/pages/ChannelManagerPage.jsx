import React, { useState } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import * as api from '../services/operationsService';
const ChannelManagerPage = () => {
  const [channels, setChannels] = useState([]);
  const [rates, setRates] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  React.useEffect(() => {
    api.getChannelStatus().then(res => {
      if (res.data) setChannels(res.data.map(c => ({ ...c, connected: true, lastSync: '2 min ago' })));
    }).catch(console.error);
    api.getRevenueReport().then(res => {
      if (res.data) setRevenueData(res.data);
    }).catch(console.error);
  }, []);

  const totalRevenue = channels.reduce((s, c) => s + c.revenue, 0);
  const totalBookings = channels.reduce((s, c) => s + c.bookings, 0);
  const totalCommission = channels.reduce((s, c) => s + Math.round(c.revenue * c.commission / 100), 0);

  const toggleChannel = (idx) => setChannels(prev => prev.map((c, i) => i === idx ? { ...c, connected: !c.connected } : c));

  const updateRate = (roomIdx, channel, value) => {
    setRates(prev => prev.map((r, i) => i === roomIdx ? { ...r, [channel]: +value } : r));
  };

  const inputStyle = { padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'DM Mono,monospace', width: '90px', textAlign: 'right' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ padding: '16px 32px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0' }}>
        {[['overview', 'Overview'], ['rates', 'Rate Management'], ['availability', 'Availability']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === id ? 'var(--gold)' : 'transparent'}`, color: activeTab === id ? 'var(--gold)' : 'var(--text3)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: '24px 32px', overflowY: 'auto', flex: 1 }}>
        {activeTab === 'overview' && (
          <>
            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', marginBottom: '28px' }}>
              {[
                { label: 'Total Bookings', value: totalBookings, color: 'var(--gold)', sub: 'All channels' },
                { label: 'Gross Revenue', value: `₹${(totalRevenue / 1000).toFixed(0)}K`, color: 'var(--green)', sub: 'Before commission' },
                { label: 'Commission Paid', value: `₹${(totalCommission / 1000).toFixed(1)}K`, color: 'var(--rose)', sub: 'OTA fees' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', fontFamily: 'Poppins,sans-serif', color: s.color, marginBottom: '4px' }}>{s.value}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '2px' }}>{s.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Channel Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px', marginBottom: '28px' }}>
              {channels.map((ch, idx) => (
                <div key={ch.channel} style={{ background: 'var(--card)', border: `1px solid ${ch.connected ? ch.color + '40' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: ch.color }}>{ch.channel}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Last sync: {ch.lastSync}</div>
                    </div>
                    <div
                      onClick={() => toggleChannel(idx)}
                      style={{ width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.2s', background: ch.connected ? ch.color : 'var(--border)', position: 'relative' }}
                    >
                      <div style={{ position: 'absolute', top: '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', left: ch.connected ? '23px' : '3px' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '8px' }}>
                    {[['Bookings', ch.bookings], ['Revenue', `₹${(ch.revenue / 1000).toFixed(0)}K`], ['Commission', `${ch.commission}%`], ['Share', `${ch.pct}%`]].map(([k, v]) => (
                      <div key={k} style={{ background: 'var(--surface)', borderRadius: '6px', padding: '8px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '2px' }}>{k.toUpperCase()}</div>
                        <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'DM Mono,monospace' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '12px', height: '4px', background: 'var(--surface)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${ch.pct}%`, background: ch.color, borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue Chart */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>Monthly Booking Trend</div>
              <div style={{ height: '160px', display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                {revenueData.map((d, i) => {
                  const max = Math.max(...revenueData.map(d => d.bookings), 1);
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text3)' }}>{d.bookings}</div>
                      <div style={{ width: '100%', borderRadius: '4px 4px 0 0', height: `${(d.bookings / max) * 120}px`, background: i === revenueData.length - 1 ? 'linear-gradient(180deg,#C9A84C,#8A6F2E)' : 'rgba(201,168,76,0.3)' }} />
                      <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{d.month}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === 'rates' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '700' }}>Rate Parity Management</div>
                <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Set rates per room type across all channels</div>
              </div>
              <button style={{ padding: '9px 18px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
                Sync All Channels
              </button>
            </div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                    {['Room Type', 'Base Rate', 'Booking.com', 'Expedia', 'Agoda'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.05em' }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rates.map((r, idx) => (
                    <tr key={r.type} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600' }}>{r.type}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'DM Mono,monospace', color: 'var(--gold)' }}>₹{r.base.toLocaleString()}</div>
                      </td>
                      {['booking', 'expedia', 'agoda'].map(ch => (
                        <td key={ch} style={{ padding: '8px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text3)' }}>₹</span>
                            <input type="number" value={r[ch]} onChange={e => updateRate(idx, ch, e.target.value)} style={inputStyle} />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'availability' && (
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>Availability Calendar</div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', marginBottom: '8px' }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text3)', fontWeight: '600', padding: '6px' }}>{d}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
                {Array.from({ length: 31 }, (_, i) => {
                  const occ = 0;
                  const color = occ > 85 ? 'var(--rose)' : occ > 70 ? 'var(--amber)' : 'var(--green)';
                  return (
                    <div key={i} style={{ background: 'var(--surface)', borderRadius: '6px', padding: '8px 4px', textAlign: 'center', border: `1px solid ${color}30` }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '2px' }}>{i + 1}</div>
                      <div style={{ fontSize: '10px', color, fontWeight: '700' }}>{occ}%</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                {[['> 85% (High)', 'var(--rose)'], ['70-85% (Med)', 'var(--amber)'], ['< 70% (Low)', 'var(--green)']].map(([l, c]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: c }} />
                    <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelManagerPage;
