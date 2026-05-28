import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';

const MEMBERS = [];

const TIERS = [];

const REFERRALS = [];

const REDEMPTIONS = [];

const tierColor = { Platinum:'#E5E4E2', Gold:'#C9A84C', Silver:'#C0C0C0', Bronze:'#CD7F32' };
const TABS = ['Members', 'Tiers & Benefits', 'Referrals', 'Redeem History'];

const LoyaltyPage = () => {
  const [tab, setTab] = useState(0);
  const thStyle = { padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text3)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' };
  const tdStyle = { padding: '12px 14px', fontSize: 13, color: 'var(--text2)', borderBottom: '1px solid var(--border)' };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard title="Total Members" value={MEMBERS.length} icon="loyalty" color="var(--gold)" />
        <StatCard title="Platinum Members" value={MEMBERS.filter(m=>m.tier==='Platinum').length} icon="crown" color="var(--violet)" />
        <StatCard title="Points Issued" value="-" icon="star" color="var(--teal)" />
        <StatCard title="Referrals" value={REFERRALS.length} icon="users" color="var(--green)" />
      </div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface)', borderRadius: 10, padding: 4 }}>
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: '9px 8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, background: tab === i ? 'var(--card)' : 'transparent', color: tab === i ? 'var(--gold)' : 'var(--text2)' }}>{t}</button>
          ))}
        </div>

        {tab === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
            {MEMBERS.map(m => (
              <div key={m.id} style={{ background: 'var(--surface)', border: `1px solid ${tierColor[m.tier]}44`, borderRadius: 'var(--radius)', padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <Avatar initials={m.name.split(' ').map(n => n[0]).join('')} color={tierColor[m.tier]} size={44} />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: tierColor[m.tier], fontWeight: 600 }}>{m.tier}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                  {[['Points', m.points.toLocaleString()], ['Stays', m.stays], ['Referrals', m.referrals]].map(([l, v]) => (
                    <div key={l} style={{ textAlign: 'center', background: 'var(--card)', borderRadius: 8, padding: '8px 4px' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: 'DM Mono, monospace' }}>{v}</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase' }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '8px', color: 'var(--text2)', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>View</button>
                  <button style={{ flex: 1, background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: 8, padding: '8px', color: '#fff', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Add Points</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {TIERS.map(tier => (
              <div key={tier.name} style={{ display: 'flex', gap: 20, padding: 20, background: 'var(--surface)', border: `1px solid ${tier.color}44`, borderRadius: 'var(--radius)', alignItems: 'flex-start' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: `${tier.color}22`, border: `2px solid ${tier.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 24 }}>⭐</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: tier.color }}>{tier.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>{tier.minPoints.toLocaleString()}+ points</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>{tier.discount}% discount</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {tier.benefits.map(b => <span key={b} style={{ fontSize: 12, padding: '4px 10px', background: `${tier.color}11`, border: `1px solid ${tier.color}33`, borderRadius: 20, color: 'var(--text2)' }}>{b}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 2 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Referrer','Referred Guest','Bonus Points','Status','Date'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {REFERRALS.map(r => (
                <tr key={r.id} onMouseEnter={e=>e.currentTarget.style.background='var(--surface)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ ...tdStyle, color: 'var(--text)', fontWeight: 500 }}>{r.referrer}</td>
                  <td style={tdStyle}>{r.referred}</td>
                  <td style={{ ...tdStyle, fontFamily: 'DM Mono, monospace', color: 'var(--gold)' }}>+{r.bonus}</td>
                  <td style={tdStyle}><span style={{ fontSize: 11, fontWeight: 600, color: r.status === 'credited' ? 'var(--green)' : 'var(--amber)', textTransform: 'uppercase' }}>{r.status}</span></td>
                  <td style={tdStyle}>{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 3 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Member','Points Used','Value','Date','Status'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {REDEMPTIONS.map(r => (
                <tr key={r.id} onMouseEnter={e=>e.currentTarget.style.background='var(--surface)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ ...tdStyle, color: 'var(--text)', fontWeight: 500 }}>{r.member}</td>
                  <td style={{ ...tdStyle, fontFamily: 'DM Mono, monospace', color: 'var(--rose)' }}>-{r.points}</td>
                  <td style={tdStyle}>{r.value}</td>
                  <td style={tdStyle}>{r.date}</td>
                  <td style={tdStyle}><span style={{ fontSize: 11, fontWeight: 600, color: r.status === 'used' ? 'var(--green)' : 'var(--amber)', textTransform: 'uppercase' }}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LoyaltyPage;
