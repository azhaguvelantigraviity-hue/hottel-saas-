import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import Badge from '../components/Badge';

const CAB_BOOKINGS = [
  { id:'CB-001', guest:'Aditya Kumar', room:'301', pickup:'Hotel Lobby', destination:'Chhatrapati Shivaji Airport', date:'2025-07-15', time:'06:00', vehicle:'Luxury', driver:'Ramesh Patil', status:'confirmed', amount:2800 },
  { id:'CB-002', guest:'Rohit Verma', room:'201', pickup:'Hotel Lobby', destination:'Bandra Kurla Complex', date:'2025-07-14', time:'09:30', vehicle:'Sedan', driver:'Sunil Yadav', status:'in-progress', amount:850 },
  { id:'CB-003', guest:'Priya Sharma', room:'103', pickup:'Juhu Beach', destination:'Hotel', date:'2025-07-14', time:'18:00', vehicle:'SUV', driver:'Unassigned', status:'pending', amount:1200 },
];

const PACKAGES = [
  { id:1, name:'City Tour', duration:'8 hrs', price:2500, includes:['AC Vehicle','Driver','Fuel','Toll'], highlights:['Gateway of India','Marine Drive','Elephanta Caves','Colaba Market'] },
  { id:2, name:'Hill Station Trip', duration:'2 Days', price:8500, includes:['AC Vehicle','Driver','Fuel','Toll','1 Night Stay'], highlights:['Lonavala','Khandala','Bhushi Dam','Tiger Point'] },
  { id:3, name:'Beach Trip', duration:'1 Day', price:6000, includes:['AC Vehicle','Driver','Fuel','Toll','Lunch'], highlights:['Alibaug Beach','Kashid Beach','Murud Beach'] },
];

const VEHICLES = ['Sedan', 'SUV', 'Luxury', 'Mini Bus'];
const statusColor = { confirmed:'var(--green)', pending:'var(--amber)', 'in-progress':'var(--teal)', cancelled:'var(--rose)' };
const TABS = ['Cab Booking', 'Airport Transfers', 'Travel Packages'];

const TravelDeskPage = () => {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({ pickup:'Hotel Lobby', destination:'', date:'', time:'', vehicle:'Sedan', guest:'', room:'', notes:'' });
  const [airForm, setAirForm] = useState({ guest:'', room:'', flight:'', type:'pickup', date:'', time:'', vehicle:'Sedan' });

  const thStyle = { padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text3)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' };
  const tdStyle = { padding: '12px 14px', fontSize: 13, color: 'var(--text2)', borderBottom: '1px solid var(--border)' };
  const inputStyle = { width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontFamily: 'Inter, sans-serif', fontSize: 14, boxSizing: 'border-box' };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard title="Today's Cabs" value="6" icon="taxi" color="var(--gold)" />
        <StatCard title="Airport Transfers" value="3" icon="map" color="var(--teal)" />
        <StatCard title="Packages Booked" value="2" icon="star" color="var(--violet)" />
        <StatCard title="Revenue Today" value="₹18,400" icon="dollar" color="var(--green)" />
      </div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface)', borderRadius: 10, padding: 4 }}>
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: '9px 8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, background: tab === i ? 'var(--card)' : 'transparent', color: tab === i ? 'var(--gold)' : 'var(--text2)' }}>{t}</button>
          ))}
        </div>

        {tab === 0 && (
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Book a Cab</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                {[['Guest Name','guest'],['Room','room']].map(([l,f]) => (
                  <div key={f}><label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</label><input value={form[f]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} style={inputStyle} /></div>
                ))}
              </div>
              {[['Pickup Location','pickup'],['Destination','destination']].map(([l,f]) => (
                <div key={f} style={{ marginBottom: 12 }}><label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</label><input value={form[f]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} style={inputStyle} /></div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date</label><input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} style={inputStyle} /></div>
                <div><label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Time</label><input type="time" value={form.time} onChange={e=>setForm(p=>({...p,time:e.target.value}))} style={inputStyle} /></div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vehicle Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {VEHICLES.map(v => <button key={v} onClick={() => setForm(p=>({...p,vehicle:v}))} style={{ flex: 1, padding: '8px 4px', borderRadius: 8, border: `1px solid ${form.vehicle===v?'var(--gold)':'var(--border)'}`, background: form.vehicle===v?'rgba(201,168,76,0.12)':'transparent', color: form.vehicle===v?'var(--gold)':'var(--text2)', cursor: 'pointer', fontSize: 11, fontFamily: 'Inter, sans-serif' }}>{v}</button>)}
                </div>
              </div>
              <button style={{ background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: 8, padding: '12px 32px', color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14 }}>Book Cab</button>
            </div>
            <div style={{ flex: 2, minWidth: 300 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Active Bookings</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>{['ID','Guest','Route','Time','Vehicle','Status','Fare'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                  {CAB_BOOKINGS.map(b => (
                    <tr key={b.id} onMouseEnter={e=>e.currentTarget.style.background='var(--surface)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ ...tdStyle, fontFamily:'DM Mono,monospace', color:'var(--gold)' }}>{b.id}</td>
                      <td style={{ ...tdStyle, color:'var(--text)', fontWeight:500 }}>{b.guest}</td>
                      <td style={tdStyle}><div style={{ fontSize:12 }}>{b.pickup}</div><div style={{ fontSize:11, color:'var(--text3)' }}>→ {b.destination}</div></td>
                      <td style={tdStyle}>{b.time}</td>
                      <td style={tdStyle}>{b.vehicle}</td>
                      <td style={tdStyle}><span style={{ fontSize:11, fontWeight:600, color:statusColor[b.status], textTransform:'uppercase' }}>{b.status}</span></td>
                      <td style={{ ...tdStyle, fontFamily:'DM Mono,monospace' }}>₹{b.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 1 && (
          <div style={{ maxWidth: 520 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Airport Transfer Booking</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {['pickup','drop'].map(t => <button key={t} onClick={() => setAirForm(f=>({...f,type:t}))} style={{ flex:1, padding:'10px', borderRadius:8, border:`1px solid ${airForm.type===t?'var(--gold)':'var(--border)'}`, background:airForm.type===t?'rgba(201,168,76,0.12)':'transparent', color:airForm.type===t?'var(--gold)':'var(--text2)', cursor:'pointer', fontFamily:'Inter, sans-serif', fontWeight:600, textTransform:'capitalize' }}>{t === 'pickup' ? '✈ Airport Pickup' : '✈ Airport Drop'}</button>)}
            </div>
            {[['Guest Name','guest'],['Room Number','room'],['Flight Number','flight']].map(([l,f]) => (
              <div key={f} style={{ marginBottom: 12 }}><label style={{ fontSize:11, color:'var(--text3)', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.06em' }}>{l}</label><input value={airForm[f]} onChange={e=>setAirForm(p=>({...p,[f]:e.target.value}))} style={inputStyle} placeholder={f==='flight'?'e.g. AI-202':''} /></div>
            ))}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
              <div><label style={{ fontSize:11, color:'var(--text3)', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.06em' }}>Date</label><input type="date" value={airForm.date} onChange={e=>setAirForm(p=>({...p,date:e.target.value}))} style={inputStyle} /></div>
              <div><label style={{ fontSize:11, color:'var(--text3)', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.06em' }}>Time</label><input type="time" value={airForm.time} onChange={e=>setAirForm(p=>({...p,time:e.target.value}))} style={inputStyle} /></div>
            </div>
            <div style={{ padding:14, background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:8, marginBottom:16 }}>
              <div style={{ fontSize:13, color:'var(--text2)' }}>Sedan: ₹1,800 · SUV: ₹2,400 · Luxury: ₹3,500</div>
            </div>
            <button style={{ background:'linear-gradient(135deg,#C9A84C,#8A6F2E)', border:'none', borderRadius:8, padding:'12px 32px', color:'#fff', cursor:'pointer', fontFamily:'Inter, sans-serif', fontWeight:600, fontSize:14 }}>Book Transfer</button>
          </div>
        )}

        {tab === 2 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
            {PACKAGES.map((pkg, i) => {
              const colors = ['var(--teal)','var(--violet)','var(--blue)'];
              return (
                <div key={pkg.id} style={{ background:'var(--surface)', border:`1px solid ${colors[i]}44`, borderRadius:'var(--radius)', padding:20 }}>
                  <div style={{ fontSize:18, fontWeight:700, color:'var(--text)', marginBottom:4 }}>{pkg.name}</div>
                  <div style={{ fontSize:13, color:'var(--text3)', marginBottom:12 }}>{pkg.duration}</div>
                  <div style={{ fontSize:28, fontWeight:700, color:colors[i], fontFamily:'DM Mono,monospace', marginBottom:16 }}>₹{pkg.price.toLocaleString()}</div>
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Includes</div>
                    {pkg.includes.map(inc => <div key={inc} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--text2)', marginBottom:4 }}><Icon name="check" size={12} color={colors[i]} />{inc}</div>)}
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Highlights</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {pkg.highlights.map(h => <span key={h} style={{ fontSize:11, padding:'3px 8px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:20, color:'var(--text2)' }}>{h}</span>)}
                    </div>
                  </div>
                  <button style={{ width:'100%', background:`linear-gradient(135deg,${colors[i]},${colors[i]}99)`, border:'none', borderRadius:8, padding:'10px', color:'#fff', cursor:'pointer', fontFamily:'Inter, sans-serif', fontWeight:600, fontSize:13 }}>Book Package</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelDeskPage;
