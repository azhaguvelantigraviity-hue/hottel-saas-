import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import Badge from '../components/Badge';

const ROOMS_INIT = [];

const MOBILE_KEYS = [];

const RFID_CARDS = [];

const ACCESS_LOG = [];

const TABS = ['Room Controls', 'Mobile Keys', 'RFID Cards', 'Access Log'];

const IoTPage = () => {
  const [tab, setTab] = useState(0);
  const [rooms, setRooms] = useState(ROOMS_INIT);

  const updateRoom = (id, key, val) => setRooms(prev => prev.map(r => r.id === id ? { ...r, [key]: val } : r));

  const thStyle = { padding:'10px 14px', textAlign:'left', fontSize:11, color:'var(--text3)', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'1px solid var(--border)' };
  const tdStyle = { padding:'12px 14px', fontSize:13, color:'var(--text2)', borderBottom:'1px solid var(--border)' };

  return (
    <div style={{ flex:1, overflowY:'auto', padding:24 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard title="Connected Rooms" value={rooms.length} icon="iot" color="var(--teal)" />
        <StatCard title="Locked" value={rooms.filter(r=>r.locked).length} icon="lock" color="var(--green)" />
        <StatCard title="DND Active" value={rooms.filter(r=>r.dnd).length} icon="bell" color="var(--amber)" />
        <StatCard title="Mobile Keys" value={MOBILE_KEYS.filter(k=>k.status==='active').length} icon="key" color="var(--violet)" />
      </div>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:24 }}>
        <div style={{ display:'flex', gap:4, marginBottom:24, background:'var(--surface)', borderRadius:10, padding:4 }}>
          {TABS.map((t,i) => <button key={i} onClick={() => setTab(i)} style={{ flex:1, padding:'9px 8px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:500, background:tab===i?'var(--card)':'transparent', color:tab===i?'var(--gold)':'var(--text2)' }}>{t}</button>)}
        </div>

        {tab === 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
            {rooms.map(room => (
              <div key={room.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:16, fontWeight:700, color:'var(--text)' }}>Room {room.id}</div>
                    <div style={{ fontSize:12, color:'var(--text3)' }}>{room.guest}</div>
                  </div>
                  {room.dnd && <span style={{ fontSize:10, fontWeight:700, color:'var(--rose)', background:'rgba(251,113,133,0.12)', padding:'3px 8px', borderRadius:20 }}>DND</span>}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Icon name={room.locked?'lock':'unlock'} size={16} color={room.locked?'var(--green)':'var(--rose)'} />
                      <span style={{ fontSize:13, color:'var(--text2)' }}>Door Lock</span>
                    </div>
                    <button onClick={() => updateRoom(room.id, 'locked', !room.locked)} style={{ padding:'4px 12px', borderRadius:20, border:`1px solid ${room.locked?'var(--green)':'var(--rose)'}`, background:'transparent', color:room.locked?'var(--green)':'var(--rose)', cursor:'pointer', fontSize:11, fontFamily:'Inter, sans-serif', fontWeight:600 }}>{room.locked?'Locked':'Unlocked'}</button>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Icon name="thermometer" size={16} color="var(--teal)" />
                      <span style={{ fontSize:13, color:'var(--text2)' }}>AC Temp</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <button onClick={() => updateRoom(room.id, 'temp', Math.max(16, room.temp-1))} style={{ width:24, height:24, borderRadius:'50%', border:'1px solid var(--border)', background:'var(--card)', color:'var(--text2)', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>-</button>
                      <span style={{ fontFamily:'DM Mono,monospace', fontSize:14, color:'var(--teal)', minWidth:36, textAlign:'center' }}>{room.temp}°C</span>
                      <button onClick={() => updateRoom(room.id, 'temp', Math.min(30, room.temp+1))} style={{ width:24, height:24, borderRadius:'50%', border:'1px solid var(--border)', background:'var(--card)', color:'var(--text2)', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                    </div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Icon name="lightbulb" size={16} color={room.lights?'var(--amber)':'var(--text3)'} />
                      <span style={{ fontSize:13, color:'var(--text2)' }}>Lights</span>
                    </div>
                    <div onClick={() => updateRoom(room.id, 'lights', !room.lights)} style={{ width:40, height:22, borderRadius:11, background:room.lights?'var(--amber)':'var(--border)', cursor:'pointer', position:'relative', transition:'background 0.3s' }}>
                      <div style={{ position:'absolute', top:2, left:room.lights?18:2, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 0.3s' }} />
                    </div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Icon name="bell" size={16} color={room.dnd?'var(--rose)':'var(--text3)'} />
                      <span style={{ fontSize:13, color:'var(--text2)' }}>Do Not Disturb</span>
                    </div>
                    <div onClick={() => updateRoom(room.id, 'dnd', !room.dnd)} style={{ width:40, height:22, borderRadius:11, background:room.dnd?'var(--rose)':'var(--border)', cursor:'pointer', position:'relative', transition:'background 0.3s' }}>
                      <div style={{ position:'absolute', top:2, left:room.dnd?18:2, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 0.3s' }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 1 && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {MOBILE_KEYS.map(k => (
              <div key={k.id} style={{ display:'flex', alignItems:'center', gap:16, padding:16, background:'var(--surface)', border:`1px solid ${k.status==='active'?'var(--border)':'rgba(251,113,133,0.2)'}`, borderRadius:'var(--radius)' }}>
                <div style={{ width:40, height:40, borderRadius:8, background:'rgba(201,168,76,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon name="key" size={20} color="var(--gold)" />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--text)' }}>{k.guest} — Room {k.room}</div>
                  <div style={{ fontSize:12, color:'var(--text3)' }}>Issued: {k.issued} · Valid until: {k.validUntil}</div>
                </div>
                <span style={{ fontSize:11, fontWeight:600, color:k.status==='active'?'var(--green)':'var(--rose)', textTransform:'uppercase' }}>{k.status}</span>
                {k.status === 'active' && <button style={{ background:'rgba(251,113,133,0.12)', border:'1px solid rgba(251,113,133,0.3)', borderRadius:8, padding:'6px 14px', color:'var(--rose)', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif', fontWeight:600 }}>Revoke</button>}
              </div>
            ))}
          </div>
        )}

        {tab === 2 && (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>{['Card ID','Room','Guest','Issued','Status','Action'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {RFID_CARDS.map(c => (
                <tr key={c.id} onMouseEnter={e=>e.currentTarget.style.background='var(--surface)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ ...tdStyle, fontFamily:'DM Mono,monospace', color:'var(--gold)' }}>{c.id}</td>
                  <td style={tdStyle}>{c.room}</td>
                  <td style={{ ...tdStyle, color:'var(--text)', fontWeight:500 }}>{c.guest}</td>
                  <td style={tdStyle}>{c.issued}</td>
                  <td style={tdStyle}><span style={{ fontSize:11, fontWeight:600, color:c.status==='active'?'var(--green)':'var(--rose)', textTransform:'uppercase' }}>{c.status}</span></td>
                  <td style={tdStyle}><button style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:6, padding:'4px 12px', color:'var(--text2)', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif' }}>{c.status==='active'?'Deactivate':'Reactivate'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 3 && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {ACCESS_LOG.map(log => (
              <div key={log.id} style={{ display:'flex', alignItems:'center', gap:14, padding:14, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--teal)', flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>Room {log.room} — {log.event}</div>
                  <div style={{ fontSize:12, color:'var(--text3)' }}>{log.user} via {log.method}</div>
                </div>
                <div style={{ fontSize:12, color:'var(--text3)', fontFamily:'DM Mono,monospace' }}>{log.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IoTPage;
