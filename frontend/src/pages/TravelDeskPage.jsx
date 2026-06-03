import React, { useState, useEffect, useCallback } from 'react';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import * as api from '../services/hotelService';

const VEHICLES = ['Sedan', 'SUV', 'Hatchback', 'Tempo Traveller', 'Luxury'];
const statusColor = { confirmed:'var(--green)', pending:'var(--amber)', 'in-progress':'var(--teal)', completed:'var(--violet)', cancelled:'var(--rose)' };
const TABS = ['Cab Booking', 'Airport Transfers', 'Travel Packages'];
const thStyle = { padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text3)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' };
const tdStyle = { padding: '12px 14px', fontSize: 13, color: 'var(--text2)', borderBottom: '1px solid var(--border)' };
const inputStyle = { width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontFamily: 'Inter, sans-serif', fontSize: 14, boxSizing: 'border-box' };

const CAB_STORAGE_KEY = 'stayos_cab_bookings';
const PKG_STORAGE_KEY = 'stayos_travel_packages';

const safeRead = (key, fallback) => {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
};
const safeWrite = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { }
};

const formatDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const TravelDeskPage = () => {
  const [tab, setTab] = useState(0);
  const [cabBookings, setCabBookings] = useState(() => safeRead(CAB_STORAGE_KEY, []));
  const [packages, setPackages] = useState(() => safeRead(PKG_STORAGE_KEY, []));
  const [stats, setStats] = useState({ todayCabs: '-', airportTransfers: '-', packagesBooked: '-', revenue: '-' });
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ pickup:'', destination:'', date:'', time:'', vehicle:'Sedan', guest:'', room:'', notes:'' });
  const [airForm, setAirForm] = useState({ guest:'', room:'', flight:'', type:'pickup', date:'', time:'', vehicle:'Sedan' });

  useEffect(() => { safeWrite(CAB_STORAGE_KEY, cabBookings); }, [cabBookings]);
  useEffect(() => { safeWrite(PKG_STORAGE_KEY, packages); }, [packages]);

  const computeStats = useCallback((cabs) => {
    const today = new Date().toISOString().slice(0, 10);
    const todayCabs = cabs.filter(b => b.date && new Date(b.date).toISOString().slice(0, 10) === today && b.type === 'cab');
    const todayAirport = cabs.filter(b => b.date && new Date(b.date).toISOString().slice(0, 10) === today && b.type === 'airport');
    const totalRev = todayCabs.reduce((s, b) => s + (b.amount || 0), 0) + todayAirport.reduce((s, b) => s + (b.amount || 0), 0);
    setStats({
      todayCabs: todayCabs.length,
      airportTransfers: todayAirport.length,
      packagesBooked: cabs.filter(b => b.type === 'package').length || '-',
      revenue: totalRev > 0 ? `₹${totalRev.toLocaleString()}` : '-',
    });
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [cabRes, pkgRes] = await Promise.all([
        api.getCabBookings(),
        api.getTravelPackages(),
      ]);
      const cabs = cabRes.data || [];
      const pkgs = pkgRes.data || [];
      setCabBookings(cabs);
      setPackages(pkgs);
      computeStats(cabs);
    } catch {
      computeStats(cabBookings);
    }
  }, [computeStats]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleBookCab = async () => {
    if (saving) return;
    if (!form.guest || !form.pickup || !form.date || !form.time) return;
    setSaving(true);
    try {
      await api.createCabBooking({
        guest: form.guest,
        room: form.room,
        pickupLocation: form.pickup,
        destination: form.destination,
        date: form.date,
        time: form.time,
        vehicleType: form.vehicle,
        notes: form.notes,
        type: 'cab',
        status: 'confirmed',
        amount: form.vehicle === 'SUV' ? 1500 : form.vehicle === 'Luxury' ? 2500 : form.vehicle === 'Tempo Traveller' ? 3000 : 800,
      });
      await loadData();
      setForm({ pickup:'', destination:'', date:'', time:'', vehicle:'Sedan', guest:'', room:'', notes:'' });
    } catch (err) {
      alert(err.message || 'Failed to book cab');
    } finally {
      setSaving(false);
    }
  };

  const handleBookAirport = async () => {
    if (saving) return;
    if (!airForm.guest || !airForm.flight || !airForm.date || !airForm.time) return;
    setSaving(true);
    try {
      await api.createCabBooking({
        guest: airForm.guest,
        room: airForm.room,
        type: 'airport',
        pickupLocation: airForm.type === 'pickup' ? 'Airport' : 'Hotel',
        destination: airForm.type === 'pickup' ? 'Hotel' : 'Airport',
        flightNumber: airForm.flight,
        transferType: airForm.type,
        date: airForm.date,
        time: airForm.time,
        vehicleType: airForm.vehicle,
        status: 'confirmed',
        amount: 1800,
      });
      await loadData();
      setAirForm({ guest:'', room:'', flight:'', type:'pickup', date:'', time:'', vehicle:'Sedan' });
    } catch (err) {
      alert(err.message || 'Failed to book transfer');
    } finally {
      setSaving(false);
    }
  };

  const handleBookPackage = async (pkg) => {
    if (saving) return;
    setSaving(true);
    try {
      await api.createCabBooking({
        guest: 'Walk-in',
        type: 'package',
        pickupLocation: 'Hotel',
        destination: pkg.name,
        date: new Date().toISOString().slice(0, 10),
        time: '09:00',
        vehicleType: 'SUV',
        status: 'confirmed',
        amount: pkg.price,
        notes: `Travel package: ${pkg.name}`,
      });
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to book package');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard title="Today's Cabs" value={stats.todayCabs} icon="taxi" color="var(--gold)" />
        <StatCard title="Airport Transfers" value={stats.airportTransfers} icon="map" color="var(--teal)" />
        <StatCard title="Packages Booked" value={stats.packagesBooked} icon="star" color="var(--violet)" />
        <StatCard title="Revenue Today" value={stats.revenue} icon="dollar" color="var(--green)" />
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 12, marginBottom: 12 }}>
                {[['Guest Name','guest'],['Room','room']].map(([l,f]) => (
                  <div key={f}><label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</label><input value={form[f]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} style={inputStyle} /></div>
                ))}
              </div>
              {[['Pickup Location','pickup'],['Destination','destination']].map(([l,f]) => (
                <div key={f} style={{ marginBottom: 12 }}><label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</label><input value={form[f]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} style={inputStyle} /></div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 12, marginBottom: 12 }}>
                <div><label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date</label><input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} style={inputStyle} /></div>
                <div><label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Time</label><input type="time" value={form.time} onChange={e=>setForm(p=>({...p,time:e.target.value}))} style={inputStyle} /></div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vehicle Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {VEHICLES.map(v => <button key={v} onClick={() => setForm(p=>({...p,vehicle:v}))} style={{ flex: 1, padding: '8px 4px', borderRadius: 8, border: `1px solid ${form.vehicle===v?'var(--gold)':'var(--border)'}`, background: form.vehicle===v?'rgba(201,168,76,0.12)':'transparent', color: form.vehicle===v?'var(--gold)':'var(--text2)', cursor: 'pointer', fontSize: 11, fontFamily: 'Inter, sans-serif' }}>{v}</button>)}
                </div>
              </div>
              <button onClick={handleBookCab} disabled={saving} style={{ background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: 8, padding: '12px 32px', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, opacity: saving ? 0.6 : 1 }}>{saving ? 'Booking...' : 'Book Cab'}</button>
            </div>
            <div style={{ flex: 2, minWidth: 300 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Active Bookings</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>{['ID','Guest','Route','Date','Vehicle','Status','Fare'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                  {cabBookings.filter(b => b.type !== 'package').length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: 'clamp(16px, 4vw, 32px)', textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>No cab bookings yet</td></tr>
                  ) : cabBookings.filter(b => b.type !== 'package').map(b => (
                    <tr key={b._id} onMouseEnter={e=>e.currentTarget.style.background='var(--surface)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ ...tdStyle, fontFamily:'DM Mono,monospace', color:'var(--gold)' }}>{b.bookingId}</td>
                      <td style={{ ...tdStyle, color:'var(--text)', fontWeight:500 }}>{b.guest}</td>
                      <td style={tdStyle}><div style={{ fontSize:12 }}>{b.pickupLocation}</div><div style={{ fontSize:11, color:'var(--text3)' }}>→ {b.destination || b.flightNumber || '—'}</div></td>
                      <td style={tdStyle}>{formatDate(b.date)} {b.time}</td>
                      <td style={tdStyle}>{b.vehicleType}</td>
                      <td style={tdStyle}><span style={{ fontSize:11, fontWeight:600, color:statusColor[b.status]||'var(--text3)', textTransform:'uppercase' }}>{b.status}</span></td>
                      <td style={{ ...tdStyle, fontFamily:'DM Mono,monospace' }}>₹{(b.amount||0).toLocaleString()}</td>
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
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap:12, marginBottom:16 }}>
              <div><label style={{ fontSize:11, color:'var(--text3)', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.06em' }}>Date</label><input type="date" value={airForm.date} onChange={e=>setAirForm(p=>({...p,date:e.target.value}))} style={inputStyle} /></div>
              <div><label style={{ fontSize:11, color:'var(--text3)', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.06em' }}>Time</label><input type="time" value={airForm.time} onChange={e=>setAirForm(p=>({...p,time:e.target.value}))} style={inputStyle} /></div>
            </div>
            <div style={{ padding:14, background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:8, marginBottom:16 }}>
              <div style={{ fontSize:13, color:'var(--text2)' }}>Standard airport transfer: ₹1,800 (Sedan) — includes meet & greet service</div>
            </div>
            <button onClick={handleBookAirport} disabled={saving} style={{ background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: 8, padding: '12px 32px', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, opacity: saving ? 0.6 : 1 }}>{saving ? 'Booking...' : 'Book Transfer'}</button>
          </div>
        )}

        {tab === 2 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
            {packages.length === 0 ? (
              <div style={{ gridColumn:'1/-1', padding:'40px', textAlign:'center', color:'var(--text3)', fontSize:14 }}>No travel packages available</div>
            ) : packages.map((pkg, i) => {
              const colors = ['var(--teal)','var(--violet)','var(--blue)'];
              const c = colors[i % colors.length];
              return (
                <div key={pkg._id} style={{ background:'var(--surface)', border:`1px solid ${c}44`, borderRadius:'var(--radius)', padding:20 }}>
                  <div style={{ fontSize:18, fontWeight:700, color:'var(--text)', marginBottom:4 }}>{pkg.name}</div>
                  <div style={{ fontSize:13, color:'var(--text3)', marginBottom:12 }}>{pkg.duration}</div>
                  <div style={{ fontSize:28, fontWeight:700, color:c, fontFamily:'DM Mono,monospace', marginBottom:16 }}>₹{pkg.price.toLocaleString()}</div>
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Includes</div>
                    {(pkg.includes||[]).map(inc => <div key={inc} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--text2)', marginBottom:4 }}><Icon name="check" size={12} color={c} />{inc}</div>)}
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Highlights</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {(pkg.highlights||[]).map(h => <span key={h} style={{ fontSize:11, padding:'3px 8px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:20, color:'var(--text2)' }}>{h}</span>)}
                    </div>
                  </div>
                  <button onClick={() => handleBookPackage(pkg)} disabled={saving} style={{ width:'100%', background:`linear-gradient(135deg,${c},${c}99)`, border:'none', borderRadius:8, padding:'10px', color:'#fff', cursor:saving?'not-allowed':'pointer', fontFamily:'Inter, sans-serif', fontWeight:600, fontSize:13, opacity:saving?0.6:1 }}>Book Package</button>
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