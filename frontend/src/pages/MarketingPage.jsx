import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import Badge from '../components/Badge';

const COUPONS = [];

const CAMPAIGNS = [];

const REVIEWS = [];

const SEO_PAGES = [];

const TABS = ['Coupons', 'Promo Campaigns', 'Google Reviews', 'SEO Pages'];

const MarketingPage = () => {
  const [tab, setTab] = useState(0);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code:'', discount:'', type:'percent', maxUsage:'', expiry:'' });

  const thStyle = { padding:'10px 14px', textAlign:'left', fontSize:11, color:'var(--text3)', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'1px solid var(--border)' };
  const tdStyle = { padding:'12px 14px', fontSize:13, color:'var(--text2)', borderBottom:'1px solid var(--border)' };
  const inputStyle = { width:'100%', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', color:'var(--text)', fontFamily:'Inter, sans-serif', fontSize:14, boxSizing:'border-box' };

  return (
    <div style={{ flex:1, overflowY:'auto', padding:24 }}>
      {showCouponModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:28, width:420 }}>
            <div style={{ fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:20 }}>Create Coupon</div>
            {[['Coupon Code','code','text'],['Discount Value','discount','text'],['Max Usage','maxUsage','number'],['Expiry Date','expiry','date']].map(([l,f,t]) => (
              <div key={f} style={{ marginBottom:14 }}><label style={{ fontSize:11, color:'var(--text3)', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.06em' }}>{l}</label><input type={t} value={newCoupon[f]} onChange={e=>setNewCoupon(p=>({...p,[f]:e.target.value}))} style={inputStyle} /></div>
            ))}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:11, color:'var(--text3)', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.06em' }}>Discount Type</label>
              <div style={{ display:'flex', gap:8 }}>
                {['percent','flat'].map(t => <button key={t} onClick={() => setNewCoupon(p=>({...p,type:t}))} style={{ flex:1, padding:'8px', borderRadius:8, border:`1px solid ${newCoupon.type===t?'var(--gold)':'var(--border)'}`, background:newCoupon.type===t?'rgba(201,168,76,0.12)':'transparent', color:newCoupon.type===t?'var(--gold)':'var(--text2)', cursor:'pointer', fontFamily:'Inter, sans-serif', textTransform:'capitalize' }}>{t === 'percent' ? '% Percentage' : '₹ Flat Amount'}</button>)}
              </div>
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={() => setShowCouponModal(false)} style={{ flex:1, background:'transparent', border:'1px solid var(--border)', borderRadius:8, padding:'10px', color:'var(--text2)', cursor:'pointer', fontFamily:'Inter, sans-serif' }}>Cancel</button>
              <button onClick={() => setShowCouponModal(false)} style={{ flex:1, background:'linear-gradient(135deg,#C9A84C,#8A6F2E)', border:'none', borderRadius:8, padding:'10px', color:'#fff', cursor:'pointer', fontFamily:'Inter, sans-serif', fontWeight:600 }}>Create</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard title="Active Coupons" value={COUPONS.filter(c=>c.status==='active').length} icon="marketing" color="var(--gold)" />
        <StatCard title="Campaigns" value={CAMPAIGNS.length} icon="trending" color="var(--teal)" />
        <StatCard title="Avg Rating" value="-" icon="star" color="var(--amber)" />
        <StatCard title="SEO Pages" value={SEO_PAGES.length} icon="report" color="var(--violet)" />
      </div>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:24 }}>
        <div style={{ display:'flex', gap:4, marginBottom:24, background:'var(--surface)', borderRadius:10, padding:4 }}>
          {TABS.map((t,i) => <button key={i} onClick={() => setTab(i)} style={{ flex:1, padding:'9px 8px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:500, background:tab===i?'var(--card)':'transparent', color:tab===i?'var(--gold)':'var(--text2)' }}>{t}</button>)}
        </div>

        {tab === 0 && (
          <div>
            <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
              <button onClick={() => setShowCouponModal(true)} style={{ background:'linear-gradient(135deg,#C9A84C,#8A6F2E)', border:'none', borderRadius:8, padding:'10px 20px', color:'#fff', cursor:'pointer', fontFamily:'Inter, sans-serif', fontWeight:600, fontSize:13, display:'flex', alignItems:'center', gap:6 }}><Icon name="plus" size={14} color="#fff" />Create Coupon</button>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>{['Code','Discount','Usage','Max Usage','Expiry','Status','Action'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {COUPONS.map(c => (
                  <tr key={c.id} onMouseEnter={e=>e.currentTarget.style.background='var(--surface)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ ...tdStyle, fontFamily:'DM Mono,monospace', color:'var(--gold)', fontWeight:700 }}>{c.code}</td>
                    <td style={{ ...tdStyle, color:'var(--text)', fontWeight:600 }}>{c.discount}</td>
                    <td style={{ ...tdStyle, fontFamily:'DM Mono,monospace' }}>{c.usage}</td>
                    <td style={{ ...tdStyle, fontFamily:'DM Mono,monospace' }}>{c.maxUsage}</td>
                    <td style={tdStyle}>{c.expiry}</td>
                    <td style={tdStyle}><span style={{ fontSize:11, fontWeight:600, color:c.status==='active'?'var(--green)':'var(--rose)', textTransform:'uppercase' }}>{c.status}</span></td>
                    <td style={tdStyle}><button style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:6, padding:'4px 12px', color:'var(--text2)', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif' }}>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 1 && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {CAMPAIGNS.map(c => (
              <div key={c.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:4 }}>{c.name}</div>
                    <div style={{ fontSize:12, color:'var(--text3)' }}>{c.channel}</div>
                  </div>
                  <span style={{ fontSize:11, fontWeight:600, color:c.status==='active'?'var(--green)':'var(--amber)', textTransform:'uppercase', padding:'4px 10px', background:c.status==='active'?'rgba(52,211,153,0.12)':'rgba(252,211,77,0.12)', borderRadius:20 }}>{c.status}</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                  {[['Reach', c.reach.toLocaleString()], ['Conversions', c.conversions], ['Revenue', c.revenue > 0 ? `₹${c.revenue.toLocaleString()}` : '-'], ['ROI', c.roi]].map(([l,v]) => (
                    <div key={l} style={{ textAlign:'center', background:'var(--card)', borderRadius:8, padding:'10px 4px' }}>
                      <div style={{ fontSize:16, fontWeight:700, color:'var(--text)', fontFamily:'DM Mono,monospace' }}>{v}</div>
                      <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase' }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 2 && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {REVIEWS.map(r => (
              <div key={r.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:4 }}>{r.guest}</div>
                    <div style={{ display:'flex', gap:2 }}>{Array.from({length:5},(_,i) => <span key={i} style={{ color:i<r.rating?'var(--amber)':'var(--border)', fontSize:14 }}>★</span>)}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:12, color:'var(--text3)' }}>{r.date}</div>
                    {r.replied && <div style={{ fontSize:11, color:'var(--green)', marginTop:4 }}>✓ Replied</div>}
                  </div>
                </div>
                <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6, marginBottom:10 }}>{r.text}</div>
                {!r.replied && <button style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:8, padding:'6px 14px', color:'var(--text2)', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif' }}>Reply to Review</button>}
              </div>
            ))}
          </div>
        )}

        {tab === 3 && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {SEO_PAGES.map(p => (
              <div key={p.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:4 }}>{p.title}</div>
                    <div style={{ fontSize:12, color:'var(--teal)', fontFamily:'DM Mono,monospace', marginBottom:6 }}>{p.slug}</div>
                    <div style={{ fontSize:12, color:'var(--text3)' }}>{p.meta}</div>
                  </div>
                  <div style={{ textAlign:'right', marginLeft:16 }}>
                    <span style={{ fontSize:11, fontWeight:600, color:p.status==='published'?'var(--green)':'var(--amber)', textTransform:'uppercase' }}>{p.status}</span>
                    {p.traffic > 0 && <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>{p.traffic.toLocaleString()} visits/mo</div>}
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:6, padding:'5px 12px', color:'var(--text2)', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif' }}>Edit</button>
                  <button style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:6, padding:'5px 12px', color:'var(--text2)', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif' }}>Preview</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingPage;
