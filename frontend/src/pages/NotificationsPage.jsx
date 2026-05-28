import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import Badge from '../components/Badge';

const NOTIFS_INIT = [
  { id:1, type:'booking', icon:'calendar', title:'New Booking Received', desc:'BK-1008 — Karan Malhotra, Room 304, Jul 16–20', time:'2 min ago', read:false, color:'var(--gold)' },
  { id:2, type:'payment', icon:'dollar', title:'Payment Confirmed', desc:'₹67,422 received for INV-2025-002 via UPI', time:'15 min ago', read:false, color:'var(--green)' },
  { id:3, type:'housekeeping', icon:'key', title:'Housekeeping Complete', desc:'Room 101 — Linen change completed by Anita Patel', time:'32 min ago', read:false, color:'var(--teal)' },
  { id:4, type:'maintenance', icon:'maintenance', title:'Maintenance Alert', desc:'MT-004 — Elevator door sensor malfunction in Lobby', time:'1 hr ago', read:false, color:'var(--rose)' },
  { id:5, type:'system', icon:'shield', title:'Security Login', desc:'New login from Chrome/Windows at 192.168.1.45', time:'2 hrs ago', read:true, color:'var(--violet)' },
  { id:6, type:'booking', icon:'calendar', title:'Check-out Reminder', desc:'Rohit Verma (Room 201) checks out today at 12:00 PM', time:'3 hrs ago', read:true, color:'var(--gold)' },
  { id:7, type:'payment', icon:'dollar', title:'Advance Payment Recorded', desc:'₹10,000 advance from Karan Malhotra for BK-1008', time:'4 hrs ago', read:true, color:'var(--green)' },
  { id:8, type:'system', icon:'bell', title:'Subscription Expiry Warning', desc:'Your Enterprise plan expires in 14 days. Renew now.', time:'1 day ago', read:false, color:'var(--amber)' },
  { id:9, type:'housekeeping', icon:'key', title:'DND Activated', desc:'Room 103 — Priya Sharma activated Do Not Disturb', time:'1 day ago', read:true, color:'var(--teal)' },
  { id:10, type:'maintenance', icon:'maintenance', title:'Ticket Resolved', desc:'MT-003 — TV remote issue in Room 301 resolved', time:'2 days ago', read:true, color:'var(--green)' },
];

const NOTIF_SETTINGS = [
  { id:'booking', label:'Booking Notifications', desc:'New bookings, cancellations, modifications', email:true, sms:true, push:true, whatsapp:false },
  { id:'payment', label:'Payment Notifications', desc:'Payments received, refunds, pending invoices', email:true, sms:false, push:true, whatsapp:true },
  { id:'housekeeping', label:'Housekeeping Alerts', desc:'Task completions, DND status, room status', email:false, sms:false, push:true, whatsapp:false },
  { id:'maintenance', label:'Maintenance Alerts', desc:'New tickets, status updates, urgent issues', email:true, sms:true, push:true, whatsapp:false },
  { id:'system', label:'System Notifications', desc:'Security events, logins, system updates', email:true, sms:false, push:true, whatsapp:false },
];

const TABS = ['Live Feed', 'Settings', 'Subscription Alerts'];

const NotificationsPage = () => {
  const [tab, setTab] = useState(0);
  const [notifs, setNotifs] = useState(NOTIFS_INIT);
  const [settings, setSettings] = useState(NOTIF_SETTINGS);
  const [filter, setFilter] = useState('all');

  const markRead = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read:true } : n));
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read:true })));
  const toggleSetting = (id, channel) => setSettings(prev => prev.map(s => s.id === id ? { ...s, [channel]: !s[channel] } : s));

  const filtered = filter === 'all' ? notifs : filter === 'unread' ? notifs.filter(n=>!n.read) : notifs.filter(n=>n.type===filter);
  const unread = notifs.filter(n=>!n.read).length;

  return (
    <div style={{ flex:1, overflowY:'auto', padding:24 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard title="Total" value={notifs.length} icon="notification" color="var(--teal)" />
        <StatCard title="Unread" value={unread} icon="bell" color="var(--amber)" />
        <StatCard title="Today" value={notifs.filter(n=>n.time.includes('min')||n.time.includes('hr')).length} icon="calendar" color="var(--gold)" />
        <StatCard title="Critical" value={notifs.filter(n=>n.type==='maintenance'&&!n.read).length} icon="maintenance" color="var(--rose)" />
      </div>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:24 }}>
        <div style={{ display:'flex', gap:4, marginBottom:24, background:'var(--surface)', borderRadius:10, padding:4 }}>
          {TABS.map((t,i) => <button key={i} onClick={() => setTab(i)} style={{ flex:1, padding:'9px 8px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:500, background:tab===i?'var(--card)':'transparent', color:tab===i?'var(--gold)':'var(--text2)' }}>{t}</button>)}
        </div>

        {tab === 0 && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8 }}>
              <div style={{ display:'flex', gap:6 }}>
                {['all','unread','booking','payment','maintenance','system'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding:'5px 12px', borderRadius:20, border:`1px solid ${filter===f?'var(--gold)':'var(--border)'}`, background:filter===f?'rgba(201,168,76,0.12)':'transparent', color:filter===f?'var(--gold)':'var(--text3)', cursor:'pointer', fontSize:11, fontFamily:'Inter, sans-serif', textTransform:'capitalize' }}>{f}</button>
                ))}
              </div>
              {unread > 0 && <button onClick={markAllRead} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:8, padding:'6px 14px', color:'var(--text2)', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif' }}>Mark All Read</button>}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {filtered.map(n => (
                <div key={n.id} onClick={() => markRead(n.id)} style={{ display:'flex', alignItems:'flex-start', gap:14, padding:14, background:n.read?'transparent':'rgba(201,168,76,0.04)', border:`1px solid ${n.read?'var(--border)':'rgba(201,168,76,0.2)'}`, borderRadius:'var(--radius)', cursor:'pointer', transition:'all 0.15s' }} onMouseEnter={e=>e.currentTarget.style.background='var(--surface)'} onMouseLeave={e=>e.currentTarget.style.background=n.read?'transparent':'rgba(201,168,76,0.04)'}>
                  <div style={{ width:36, height:36, borderRadius:8, background:`${n.color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon name={n.icon} size={16} color={n.color} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                      <span style={{ fontSize:14, fontWeight:n.read?500:700, color:'var(--text)' }}>{n.title}</span>
                      {!n.read && <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--gold)', flexShrink:0 }} />}
                    </div>
                    <div style={{ fontSize:12, color:'var(--text3)' }}>{n.desc}</div>
                  </div>
                  <div style={{ fontSize:11, color:'var(--text3)', flexShrink:0 }}>{n.time}</div>
                </div>
              ))}
              {filtered.length === 0 && <div style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>No notifications in this category</div>}
            </div>
          </div>
        )}

        {tab === 1 && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto auto', gap:12, padding:'8px 14px', fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.06em' }}>
              <span>Notification Type</span>
              <span style={{ textAlign:'center', minWidth:60 }}>Email</span>
              <span style={{ textAlign:'center', minWidth:60 }}>SMS</span>
              <span style={{ textAlign:'center', minWidth:60 }}>Push</span>
              <span style={{ textAlign:'center', minWidth:60 }}>WhatsApp</span>
            </div>
            {settings.map(s => (
              <div key={s.id} style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto auto', gap:12, padding:14, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--text)' }}>{s.label}</div>
                  <div style={{ fontSize:12, color:'var(--text3)' }}>{s.desc}</div>
                </div>
                {['email','sms','push','whatsapp'].map(ch => (
                  <div key={ch} style={{ display:'flex', justifyContent:'center', minWidth:60 }}>
                    <div onClick={() => toggleSetting(s.id, ch)} style={{ width:36, height:20, borderRadius:10, background:s[ch]?'var(--green)':'var(--border)', cursor:'pointer', position:'relative', transition:'background 0.3s' }}>
                      <div style={{ position:'absolute', top:2, left:s[ch]?16:2, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left 0.3s' }} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {tab === 2 && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ padding:20, background:'rgba(252,211,77,0.08)', border:'2px solid rgba(252,211,77,0.3)', borderRadius:'var(--radius)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                <Icon name="crown" size={24} color="var(--amber)" />
                <div style={{ fontSize:16, fontWeight:700, color:'var(--amber)' }}>Subscription Expiry Warning</div>
              </div>
              <div style={{ fontSize:14, color:'var(--text2)', marginBottom:12 }}>Your <strong>Enterprise Plan</strong> expires in <strong>14 days</strong> (July 28, 2025). Renew now to avoid service interruption.</div>
              <button style={{ background:'linear-gradient(135deg,#C9A84C,#8A6F2E)', border:'none', borderRadius:8, padding:'10px 24px', color:'#fff', cursor:'pointer', fontFamily:'Inter, sans-serif', fontWeight:600, fontSize:14 }}>Renew Plan</button>
            </div>
            <div style={{ padding:20, background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)', borderRadius:'var(--radius)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:4 }}>
                <Icon name="check" size={20} color="var(--green)" />
                <div style={{ fontSize:15, fontWeight:600, color:'var(--green)' }}>All Features Active</div>
              </div>
              <div style={{ fontSize:13, color:'var(--text3)' }}>All Enterprise features are currently active and running normally.</div>
            </div>
            <div style={{ padding:20, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)' }}>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:12 }}>Subscription Alert Preferences</div>
              {[['30 days before expiry', true], ['14 days before expiry', true], ['7 days before expiry', true], ['1 day before expiry', true]].map(([label, on]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:13, color:'var(--text2)' }}>{label}</span>
                  <div style={{ width:36, height:20, borderRadius:10, background:on?'var(--green)':'var(--border)', cursor:'pointer', position:'relative' }}>
                    <div style={{ position:'absolute', top:2, left:on?16:2, width:16, height:16, borderRadius:'50%', background:'#fff' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
