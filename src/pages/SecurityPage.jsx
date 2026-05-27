import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import Badge from '../components/Badge';

const CAMERAS = [
  { id:1, location:'Main Lobby', status:'live' }, { id:2, location:'Parking Lot A', status:'live' },
  { id:3, location:'Pool Area', status:'live' }, { id:4, location:'Restaurant Entrance', status:'offline' },
  { id:5, location:'Floor 1 Corridor', status:'live' }, { id:6, location:'Rooftop', status:'live' },
];

const VISITORS = [
  { id:1, name:'Ramesh Gupta', purpose:'Meeting Guest', host:'Aditya Kumar (301)', checkIn:'09:15', checkOut:'10:45', idVerified:true, date:'2025-07-14' },
  { id:2, name:'Delivery — Amazon', purpose:'Package Delivery', host:'Front Desk', checkIn:'11:30', checkOut:'11:35', idVerified:false, date:'2025-07-14' },
  { id:3, name:'Priya Contractor', purpose:'Maintenance', host:'Engineering Dept', checkIn:'14:00', checkOut:'16:30', idVerified:true, date:'2025-07-14' },
  { id:4, name:'Suresh Mehta', purpose:'Business Meeting', host:'Rohit Verma (201)', checkIn:'15:00', checkOut:null, idVerified:true, date:'2025-07-14' },
];

const ACTIVITY = [
  { id:1, user:'Rajesh Kumar', action:'Staff Login', detail:'Front Desk Terminal', time:'08:02', ip:'192.168.1.45', type:'login' },
  { id:2, user:'System', action:'Booking Created', detail:'BK-1008 — Karan Malhotra', time:'09:15', ip:'203.0.113.42', type:'booking' },
  { id:3, user:'Anita Patel', action:'Housekeeping Update', detail:'Room 103 — Completed', time:'10:30', ip:'192.168.1.52', type:'housekeeping' },
  { id:4, user:'System', action:'Payment Received', detail:'INV-2025-002 — ₹67,422', time:'11:45', ip:'203.0.113.18', type:'payment' },
  { id:5, user:'Admin', action:'Settings Changed', detail:'Checkout time updated', time:'13:00', ip:'192.168.1.1', type:'system' },
  { id:6, user:'Meena Joshi', action:'Staff Login', detail:'Reception Terminal', time:'22:05', ip:'192.168.1.46', type:'login' },
];

const SESSIONS = [
  { id:1, device:'Chrome / Windows 11', location:'Mumbai, IN', lastActive:'2 min ago', current:true },
  { id:2, device:'Safari / iPhone 15', location:'Mumbai, IN', lastActive:'1 hr ago', current:false },
  { id:3, device:'Firefox / MacOS', location:'Delhi, IN', lastActive:'3 hrs ago', current:false },
];

const TABS = ['CCTV Feeds', 'Visitor Log', 'Activity Logs', '2FA Settings', 'Device Sessions'];
const actColor = { login:'var(--teal)', booking:'var(--gold)', housekeeping:'var(--violet)', payment:'var(--green)', system:'var(--rose)' };

const SecurityPage = () => {
  const [tab, setTab] = useState(0);
  const [twoFA, setTwoFA] = useState(true);
  const now = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const thStyle = { padding:'10px 14px', textAlign:'left', fontSize:11, color:'var(--text3)', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'1px solid var(--border)' };
  const tdStyle = { padding:'12px 14px', fontSize:13, color:'var(--text2)', borderBottom:'1px solid var(--border)' };

  return (
    <div style={{ flex:1, overflowY:'auto', padding:24 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard title="Cameras Online" value={`${CAMERAS.filter(c=>c.status==='live').length}/${CAMERAS.length}`} icon="camera" color="var(--green)" />
        <StatCard title="Visitors Today" value={VISITORS.length} icon="users" color="var(--teal)" />
        <StatCard title="Activity Events" value={ACTIVITY.length} icon="shield" color="var(--violet)" />
        <StatCard title="Active Sessions" value={SESSIONS.length} icon="security" color="var(--gold)" />
      </div>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:24 }}>
        <div style={{ display:'flex', gap:4, marginBottom:24, background:'var(--surface)', borderRadius:10, padding:4, flexWrap:'wrap' }}>
          {TABS.map((t,i) => <button key={i} onClick={() => setTab(i)} style={{ flex:1, minWidth:100, padding:'9px 8px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontSize:12, fontWeight:500, background:tab===i?'var(--card)':'transparent', color:tab===i?'var(--gold)':'var(--text2)' }}>{t}</button>)}
        </div>

        {tab === 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {CAMERAS.map(cam => (
              <div key={cam.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', overflow:'hidden' }}>
                <div style={{ height:120, background:'#0a0a0f', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, position:'relative' }}>
                  <Icon name="camera" size={32} color={cam.status==='live'?'var(--text3)':'var(--rose)'} />
                  <div style={{ fontSize:11, color:'var(--text3)' }}>{cam.status === 'live' ? 'No Signal Preview' : 'OFFLINE'}</div>
                  {cam.status === 'live' && (
                    <div style={{ position:'absolute', top:8, right:8, display:'flex', alignItems:'center', gap:4, background:'rgba(251,113,133,0.9)', padding:'3px 8px', borderRadius:20 }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:'#fff', animation:'pulse 1s infinite' }} />
                      <span style={{ fontSize:10, color:'#fff', fontWeight:700 }}>LIVE</span>
                    </div>
                  )}
                  <div style={{ position:'absolute', bottom:8, left:8, fontSize:10, color:'rgba(255,255,255,0.5)', fontFamily:'DM Mono,monospace' }}>{now}</div>
                </div>
                <div style={{ padding:'10px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:13, color:'var(--text)', fontWeight:500 }}>{cam.location}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:cam.status==='live'?'var(--green)':'var(--rose)', textTransform:'uppercase' }}>{cam.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 1 && (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>{['Name','Purpose','Host','Check-In','Check-Out','ID Verified'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {VISITORS.map(v => (
                <tr key={v.id} onMouseEnter={e=>e.currentTarget.style.background='var(--surface)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ ...tdStyle, color:'var(--text)', fontWeight:500 }}>{v.name}</td>
                  <td style={tdStyle}>{v.purpose}</td>
                  <td style={tdStyle}>{v.host}</td>
                  <td style={{ ...tdStyle, fontFamily:'DM Mono,monospace' }}>{v.checkIn}</td>
                  <td style={{ ...tdStyle, fontFamily:'DM Mono,monospace' }}>{v.checkOut || <span style={{ color:'var(--green)' }}>Still Inside</span>}</td>
                  <td style={tdStyle}>{v.idVerified ? <span style={{ color:'var(--green)', fontSize:12, fontWeight:600 }}>✓ Verified</span> : <span style={{ color:'var(--rose)', fontSize:12, fontWeight:600 }}>✗ Not Verified</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 2 && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {ACTIVITY.map(a => (
              <div key={a.id} style={{ display:'flex', alignItems:'center', gap:14, padding:14, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:actColor[a.type], flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{a.action}</div>
                  <div style={{ fontSize:12, color:'var(--text3)' }}>{a.detail}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:12, color:'var(--text2)' }}>{a.user}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', fontFamily:'DM Mono,monospace' }}>{a.ip}</div>
                </div>
                <div style={{ fontSize:12, color:'var(--text3)', fontFamily:'DM Mono,monospace', minWidth:50, textAlign:'right' }}>{a.time}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 3 && (
          <div style={{ maxWidth:480 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:20, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', marginBottom:20 }}>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:4 }}>Two-Factor Authentication</div>
                <div style={{ fontSize:13, color:'var(--text3)' }}>Secure your account with 2FA</div>
              </div>
              <div onClick={() => setTwoFA(!twoFA)} style={{ width:48, height:26, borderRadius:13, background:twoFA?'var(--green)':'var(--border)', cursor:'pointer', position:'relative', transition:'background 0.3s' }}>
                <div style={{ position:'absolute', top:3, left:twoFA?22:3, width:20, height:20, borderRadius:'50%', background:'#fff', transition:'left 0.3s' }} />
              </div>
            </div>
            {twoFA && (
              <div style={{ padding:20, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)' }}>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:12 }}>Setup Authenticator App</div>
                <div style={{ background:'#fff', padding:16, borderRadius:8, display:'inline-block', marginBottom:12 }}>
                  <svg width={120} height={120} viewBox="0 0 10 10">
                    {Array.from({length:100},(_,i)=>Math.random()>0.5).map((on,i)=>on?<rect key={i} x={i%10} y={Math.floor(i/10)} width={1} height={1} fill="#000"/>:null)}
                    <rect x={1} y={1} width={3} height={3} fill="#000"/><rect x={2} y={2} width={1} height={1} fill="#fff"/>
                    <rect x={6} y={1} width={3} height={3} fill="#000"/><rect x={7} y={2} width={1} height={1} fill="#fff"/>
                    <rect x={1} y={6} width={3} height={3} fill="#000"/><rect x={2} y={7} width={1} height={1} fill="#fff"/>
                  </svg>
                </div>
                <div style={{ fontSize:12, color:'var(--text3)', marginBottom:12 }}>Scan with Google Authenticator or Authy</div>
                <div style={{ fontSize:12, color:'var(--text2)', fontFamily:'DM Mono,monospace', background:'var(--card)', padding:'8px 12px', borderRadius:6 }}>JBSWY3DPEHPK3PXP</div>
              </div>
            )}
          </div>
        )}

        {tab === 4 && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {SESSIONS.map(s => (
              <div key={s.id} style={{ display:'flex', alignItems:'center', gap:16, padding:16, background:'var(--surface)', border:`1px solid ${s.current?'var(--gold)':'var(--border)'}`, borderRadius:'var(--radius)' }}>
                <Icon name="security" size={20} color={s.current?'var(--gold)':'var(--text3)'} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:500, color:'var(--text)' }}>{s.device}</div>
                  <div style={{ fontSize:12, color:'var(--text3)' }}>{s.location} · {s.lastActive}</div>
                </div>
                {s.current ? <span style={{ fontSize:11, fontWeight:600, color:'var(--green)', background:'rgba(52,211,153,0.12)', padding:'4px 10px', borderRadius:20 }}>Current Session</span> : <button style={{ background:'rgba(251,113,133,0.12)', border:'1px solid rgba(251,113,133,0.3)', borderRadius:8, padding:'6px 14px', color:'var(--rose)', cursor:'pointer', fontSize:12, fontFamily:'DM Sans,sans-serif', fontWeight:600 }}>Revoke</button>}
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
};

export default SecurityPage;
