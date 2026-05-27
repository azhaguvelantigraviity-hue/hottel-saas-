import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import Badge from '../components/Badge';

const TEMPLATES = [
  { id:1, name:'Booking Confirmation', preview:'Dear {guest_name}, your booking {booking_id} at The Grand Meridian is confirmed. Check-in: {checkin_date}. Room: {room_type}. We look forward to welcoming you!', status:'approved' },
  { id:2, name:'Check-in Reminder', preview:'Hello {guest_name}! Your check-in at The Grand Meridian is tomorrow at 2:00 PM. Room {room_number} is ready for you. Need airport transfer? Reply YES.', status:'approved' },
  { id:3, name:'Invoice Ready', preview:'Dear {guest_name}, your invoice #{invoice_id} for ₹{amount} is ready. Download: {link}. Thank you for staying with us!', status:'approved' },
  { id:4, name:'Payment Reminder', preview:'Hi {guest_name}, your payment of ₹{amount} for booking {booking_id} is pending. Please complete payment to confirm your reservation.', status:'pending' },
  { id:5, name:'Checkout Summary', preview:'Thank you for staying at The Grand Meridian, {guest_name}! We hope you enjoyed your {nights}-night stay. Rate your experience: {rating_link}', status:'approved' },
];

const SENT_MESSAGES = [
  { id:1, guest:'Aditya Kumar', phone:'9876500006', template:'Booking Confirmation', status:'read', time:'2025-07-08 14:02' },
  { id:2, guest:'Priya Sharma', phone:'9876500002', template:'Check-in Reminder', status:'delivered', time:'2025-07-08 18:00' },
  { id:3, guest:'Rohit Verma', phone:'9876500004', template:'Invoice Ready', status:'read', time:'2025-07-13 12:30' },
  { id:4, guest:'Kavya Nair', phone:'9876500003', template:'Booking Confirmation', status:'failed', time:'2025-07-12 10:15' },
  { id:5, guest:'Sneha Iyer', phone:'9876500005', template:'Check-in Reminder', status:'delivered', time:'2025-07-12 18:00' },
];

const TABS = ['Message Templates', 'Sent Messages', 'Bulk Campaigns', 'Settings'];
const statusColor = { read:'var(--green)', delivered:'var(--teal)', failed:'var(--rose)', pending:'var(--amber)' };

const WhatsAppPage = () => {
  const [tab, setTab] = useState(0);
  const [apiKey, setApiKey] = useState('waba_live_••••••••••••••••••••••••••••••••');
  const [webhook, setWebhook] = useState('https://api.stayos.in/webhooks/whatsapp');
  const [segment, setSegment] = useState('all');
  const [bulkTemplate, setBulkTemplate] = useState('');
  const [testSent, setTestSent] = useState(null);

  const thStyle = { padding:'10px 14px', textAlign:'left', fontSize:11, color:'var(--text3)', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'1px solid var(--border)' };
  const tdStyle = { padding:'12px 14px', fontSize:13, color:'var(--text2)', borderBottom:'1px solid var(--border)' };
  const inputStyle = { width:'100%', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', color:'var(--text)', fontFamily:'DM Sans,sans-serif', fontSize:14, boxSizing:'border-box' };

  return (
    <div style={{ flex:1, overflowY:'auto', padding:24 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard title="Messages Sent" value="142" icon="whatsapp" color="var(--green)" />
        <StatCard title="Delivered" value="138" icon="check" color="var(--teal)" />
        <StatCard title="Read Rate" value="94%" icon="eye" color="var(--gold)" />
        <StatCard title="Templates" value={TEMPLATES.length} icon="report" color="var(--violet)" />
      </div>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:24 }}>
        <div style={{ display:'flex', gap:4, marginBottom:24, background:'var(--surface)', borderRadius:10, padding:4 }}>
          {TABS.map((t,i) => <button key={i} onClick={() => setTab(i)} style={{ flex:1, padding:'9px 8px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:500, background:tab===i?'var(--card)':'transparent', color:tab===i?'var(--gold)':'var(--text2)' }}>{t}</button>)}
        </div>

        {tab === 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {TEMPLATES.map(tpl => (
              <div key={tpl.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:4 }}>{tpl.name}</div>
                    <span style={{ fontSize:11, fontWeight:600, color:tpl.status==='approved'?'var(--green)':'var(--amber)', textTransform:'uppercase' }}>{tpl.status}</span>
                  </div>
                  <button onClick={() => setTestSent(tpl.id)} style={{ background:'rgba(201,168,76,0.12)', border:'1px solid rgba(201,168,76,0.3)', borderRadius:8, padding:'6px 14px', color:'var(--gold)', cursor:'pointer', fontSize:12, fontFamily:'DM Sans,sans-serif', fontWeight:600 }}>
                    {testSent === tpl.id ? '✓ Sent!' : 'Send Test'}
                  </button>
                </div>
                <div style={{ fontSize:13, color:'var(--text3)', background:'var(--card)', padding:12, borderRadius:8, lineHeight:1.6, borderLeft:'3px solid var(--green)' }}>{tpl.preview}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 1 && (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>{['Guest','Phone','Template','Status','Time'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {SENT_MESSAGES.map(m => (
                <tr key={m.id} onMouseEnter={e=>e.currentTarget.style.background='var(--surface)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ ...tdStyle, color:'var(--text)', fontWeight:500 }}>{m.guest}</td>
                  <td style={{ ...tdStyle, fontFamily:'DM Mono,monospace' }}>{m.phone}</td>
                  <td style={tdStyle}>{m.template}</td>
                  <td style={tdStyle}><span style={{ fontSize:11, fontWeight:600, color:statusColor[m.status], textTransform:'uppercase' }}>{m.status}</span></td>
                  <td style={{ ...tdStyle, fontFamily:'DM Mono,monospace', fontSize:12 }}>{m.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 2 && (
          <div style={{ maxWidth:520 }}>
            <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:16 }}>Send Bulk Campaign</div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, color:'var(--text3)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>Guest Segment</label>
              <select value={segment} onChange={e=>setSegment(e.target.value)} style={inputStyle}>
                <option value="all">All Guests (142)</option>
                <option value="checkedin">Currently Checked-In (4)</option>
                <option value="upcoming">Upcoming Arrivals (3)</option>
                <option value="vip">VIP Guests (3)</option>
                <option value="loyalty">Loyalty Members (5)</option>
              </select>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, color:'var(--text3)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>Message Template</label>
              <select value={bulkTemplate} onChange={e=>setBulkTemplate(e.target.value)} style={inputStyle}>
                <option value="">Select Template</option>
                {TEMPLATES.filter(t=>t.status==='approved').map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, color:'var(--text3)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>Schedule (Optional)</label>
              <input type="datetime-local" style={inputStyle} />
            </div>
            <div style={{ padding:14, background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:8, marginBottom:16 }}>
              <div style={{ fontSize:13, color:'var(--text2)' }}>Estimated recipients: <strong style={{ color:'var(--gold)' }}>142 guests</strong></div>
            </div>
            <button style={{ background:'linear-gradient(135deg,#25D366,#128C7E)', border:'none', borderRadius:8, padding:'12px 32px', color:'#fff', cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:14, display:'flex', alignItems:'center', gap:8 }}>
              <Icon name="whatsapp" size={16} color="#fff" /> Send Campaign
            </button>
          </div>
        )}

        {tab === 3 && (
          <div style={{ maxWidth:520 }}>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, color:'var(--text3)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>WhatsApp Business API Key</label>
              <input value={apiKey} onChange={e=>setApiKey(e.target.value)} type="password" style={inputStyle} />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, color:'var(--text3)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>Webhook URL</label>
              <input value={webhook} onChange={e=>setWebhook(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom:20, padding:14, background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)', borderRadius:8 }}>
              <div style={{ fontSize:13, color:'var(--green)', fontWeight:600 }}>✓ Connection Active</div>
              <div style={{ fontSize:12, color:'var(--text3)' }}>Last verified: 2025-07-14 09:00</div>
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <button style={{ background:'linear-gradient(135deg,#C9A84C,#8A6F2E)', border:'none', borderRadius:8, padding:'12px 24px', color:'#fff', cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:14 }}>Save Settings</button>
              <button style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:8, padding:'12px 24px', color:'var(--text2)', cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontSize:14 }}>Test Connection</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppPage;
