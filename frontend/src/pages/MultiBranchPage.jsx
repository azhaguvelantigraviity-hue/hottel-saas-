import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';

const BRANCHES = [
  { id: 'br-001', name: 'Downtown', city: 'Mumbai', rooms: 120, occupancy: 78, revenue: 8500000, staff: 45, plan: 'Professional', status: 'active', avatar: 'D' },
  { id: 'br-002', name: 'Uptown', city: 'Delhi', rooms: 95, occupancy: 65, revenue: 6200000, staff: 38, plan: 'Enterprise', status: 'active', avatar: 'U' },
  { id: 'br-003', name: 'Beachside', city: 'Goa', rooms: 60, occupancy: 82, revenue: 4800000, staff: 22, plan: 'Starter', status: 'maintenance', avatar: 'B' },
];

const CONSOLIDATED = [
  { month: 'Jan', revenue: 2500000 },
  { month: 'Feb', revenue: 2700000 },
  { month: 'Mar', revenue: 3000000 },
  { month: 'Apr', revenue: 3200000 },
  { month: 'May', revenue: 3400000 },
  { month: 'Jun', revenue: 3600000 },
];

const POLICIES = [];

const TRANSFERS = [];

const TABS = ['Branch Overview', 'Consolidated Reports', 'Branch Comparison', 'Central Settings'];

const MultiBranchPage = () => {
  const [tab, setTab] = useState(0);
  const totalRevenue = BRANCHES.reduce((s,b) => s+b.revenue, 0);
  const totalRooms = BRANCHES.reduce((s,b) => s+b.rooms, 0);
  const avgOccupancy = BRANCHES.length > 0 ? Math.round(BRANCHES.reduce((s,b) => s+b.occupancy, 0) / BRANCHES.length) : 0;
  const totalStaff = BRANCHES.reduce((s,b) => s+b.staff, 0);

  const maxRev = Math.max(...CONSOLIDATED.map(m => m.revenue));
  const thStyle = { padding:'10px 14px', textAlign:'left', fontSize:11, color:'var(--text3)', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'1px solid var(--border)' };
  const tdStyle = { padding:'12px 14px', fontSize:13, color:'var(--text2)', borderBottom:'1px solid var(--border)' };

  return (
    <div style={{ flex:1, overflowY:'auto', padding:24 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap:16, marginBottom:24 }}>
        <StatCard title="Total Branches" value={BRANCHES.length} icon="branch" color="var(--gold)" />
        <StatCard title="Total Revenue" value={`₹${(totalRevenue/100000).toFixed(1)}L`} icon="dollar" color="var(--green)" />
        <StatCard title="Avg Occupancy" value={`${avgOccupancy}%`} icon="trending" color="var(--teal)" />
        <StatCard title="Total Staff" value={totalStaff} icon="users" color="var(--violet)" />
      </div>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:24 }}>
        <div style={{ display:'flex', gap:4, marginBottom:24, background:'var(--surface)', borderRadius:10, padding:4 }}>
          {TABS.map((t,i) => <button key={i} onClick={() => setTab(i)} style={{ flex:1, padding:'9px 8px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:500, background:tab===i?'var(--card)':'transparent', color:tab===i?'var(--gold)':'var(--text2)' }}>{t}</button>)}
        </div>

        {tab === 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
            {BRANCHES.map((branch, i) => {
              const colors = ['var(--gold)', 'var(--teal)', 'var(--violet)'];
              return (
                <div key={branch.id} style={{ background:'var(--surface)', border:`1px solid ${colors[i]}44`, borderRadius:'var(--radius)', padding:20 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                    <Avatar name={branch.avatar} size={44} />
                    <div>
                      <div style={{ fontSize:15, fontWeight:700, color:'var(--text)' }}>{branch.name}</div>
                      <div style={{ fontSize:12, color:'var(--text3)' }}>{branch.city} · {branch.rooms} Rooms</div>
                    </div>
                    <div style={{ marginLeft:'auto' }}>
                      <span style={{ fontSize:10, fontWeight:700, color:'var(--green)', background:'rgba(52,211,153,0.12)', padding:'3px 8px', borderRadius:20, textTransform:'uppercase' }}>{branch.status}</span>
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap:10, marginBottom:16 }}>
                    {[['Occupancy', `${branch.occupancy}%`, colors[i]], ['Revenue', `₹${(branch.revenue/1000).toFixed(0)}K`, 'var(--green)'], ['Staff', branch.staff, 'var(--teal)'], ['Plan', branch.plan, 'var(--gold)']].map(([l,v,c]) => (
                      <div key={l} style={{ background:'var(--card)', borderRadius:8, padding:'10px 12px' }}>
                        <div style={{ fontSize:14, fontWeight:700, color:c, fontFamily:'DM Mono,monospace', textTransform:'capitalize' }}>{v}</div>
                        <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase' }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ height:6, background:'var(--card)', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${branch.occupancy}%`, background:colors[i], borderRadius:3 }} />
                  </div>
                  <div style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>Occupancy Rate</div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 1 && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20 }}>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:16 }}>Consolidated Monthly Revenue (All Branches)</div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:140 }}>
                {CONSOLIDATED.map((m, i) => (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ width:'100%', background:'linear-gradient(180deg,var(--gold),var(--gold-dim))', borderRadius:'4px 4px 0 0', height:`${(m.revenue/maxRev)*100}%`, minHeight:4, transition:'height 0.5s' }} title={`₹${m.revenue.toLocaleString()}`} />
                    <div style={{ fontSize:10, color:'var(--text3)' }}>{m.month}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap:12 }}>
              {[['Total Revenue', `₹${totalRevenue.toLocaleString()}`, 'var(--gold)'], ['Total Rooms', totalRooms, 'var(--teal)'], ['Avg Occupancy', `${avgOccupancy}%`, 'var(--green)']].map(([l,v,c]) => (
                <div key={l} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:16, textAlign:'center' }}>
                  <div style={{ fontSize:22, fontWeight:700, color:c, fontFamily:'DM Mono,monospace', marginBottom:4 }}>{v}</div>
                  <div style={{ fontSize:12, color:'var(--text3)' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 2 && (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>{['Branch','City','Rooms','Occupancy','Revenue','Staff','Status'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {BRANCHES.map(b => (
                <tr key={b.id} onMouseEnter={e=>e.currentTarget.style.background='var(--surface)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ ...tdStyle, color:'var(--text)', fontWeight:600 }}>{b.name}</td>
                  <td style={tdStyle}>{b.city}</td>
                  <td style={{ ...tdStyle, fontFamily:'DM Mono,monospace' }}>{b.rooms}</td>
                  <td style={tdStyle}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ flex:1, height:6, background:'var(--card)', borderRadius:3, overflow:'hidden', minWidth:60 }}>
                        <div style={{ height:'100%', width:`${b.occupancy}%`, background:b.occupancy>85?'var(--green)':b.occupancy>70?'var(--amber)':'var(--rose)', borderRadius:3 }} />
                      </div>
                      <span style={{ fontFamily:'DM Mono,monospace', fontSize:12, color:'var(--text)', minWidth:36 }}>{b.occupancy}%</span>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, fontFamily:'DM Mono,monospace', color:'var(--gold)' }}>₹{b.revenue.toLocaleString()}</td>
                  <td style={{ ...tdStyle, fontFamily:'DM Mono,monospace' }}>{b.staff}</td>
                  <td style={tdStyle}><span style={{ fontSize:11, fontWeight:600, color:'var(--green)', textTransform:'uppercase' }}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 3 && (
          <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:280 }}>
              <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:16 }}>Shared Policies</div>
              {POLICIES.map(p => (
                <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{p.name}</div>
                    <div style={{ fontSize:11, color:'var(--text3)' }}>{p.scope}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:13, color:'var(--teal)', fontFamily:'DM Mono,monospace' }}>{p.value}</span>
                    <button style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:6, padding:'3px 10px', color:'var(--text3)', cursor:'pointer', fontSize:11, fontFamily:'Inter, sans-serif' }}>Edit</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ flex:1, minWidth:280 }}>
              <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:16 }}>Staff Transfers</div>
              {TRANSFERS.map(t => (
                <div key={t.id} style={{ padding:14, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', marginBottom:10 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:4 }}>{t.employee}</div>
                  <div style={{ fontSize:12, color:'var(--text3)', marginBottom:4 }}>{t.role}</div>
                  <div style={{ fontSize:12, color:'var(--text2)', marginBottom:8 }}>{t.from} → {t.to}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:11, color:'var(--text3)' }}>{t.date}</span>
                    <span style={{ fontSize:11, fontWeight:600, color:t.status==='approved'?'var(--green)':'var(--amber)', textTransform:'uppercase' }}>{t.status}</span>
                  </div>
                </div>
              ))}
              <button style={{ width:'100%', background:'linear-gradient(135deg,#C9A84C,#8A6F2E)', border:'none', borderRadius:8, padding:'10px', color:'#fff', cursor:'pointer', fontFamily:'Inter, sans-serif', fontWeight:600, fontSize:13 }}>+ New Transfer Request</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiBranchPage;
