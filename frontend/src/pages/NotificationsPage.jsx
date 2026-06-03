import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import Badge from '../components/Badge';

const NOTIFS_INIT = [];

const NOTIF_SETTINGS = [];

const TABS = ['Live Feed', 'Settings', 'Subscription Alerts'];

const NotificationsPage = ({ plan }) => {
  const [tab, setTab] = useState(0);
  const [notifs, setNotifs] = useState(NOTIFS_INIT);
  const [settings, setSettings] = useState(NOTIF_SETTINGS);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const markRead = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read:true } : n));
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read:true })));
  const toggleSetting = (id, channel) => setSettings(prev => prev.map(s => s.id === id ? { ...s, [channel]: !s[channel] } : s));

  const filtered = filter === 'all' ? notifs : filter === 'unread' ? notifs.filter(n=>!n.read) : notifs.filter(n=>n.type===filter);
  const unread = notifs.filter(n=>!n.read).length;

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRenew = async () => {
    const currentPlan = plan || 'starter';
    setLoading(true);
    const res = await loadRazorpay();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      const api = await import('../services/api').then(m => m.default || m);
      const orderRes = await api.post('/hotel/subscription/create-order', { plan: currentPlan });
      const orderData = orderRes.data?.data || orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy_key',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'StayOS',
        description: `Renew ${currentPlan} plan`,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            await api.post('/hotel/subscription/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: currentPlan
            });
            alert('Payment successful! Your plan has been renewed.');
            window.location.reload();
          } catch (err) {
            console.error(err);
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: 'Hotel Administrator',
          email: 'admin@hotel.com',
        },
        theme: { color: '#C9A84C' }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      alert('Failed to initiate checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              <div style={{ fontSize:14, color:'var(--text2)', marginBottom:12 }}>Your plan expires soon. Renew now to avoid service interruption.</div>
              <button 
                onClick={handleRenew}
                disabled={loading}
                style={{ background:'linear-gradient(135deg,#C9A84C,#8A6F2E)', border:'none', borderRadius:8, padding:'10px 24px', color:'#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'Inter, sans-serif', fontWeight:600, fontSize:14 }}>
                {loading ? 'Processing...' : 'Renew Plan'}
              </button>
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
