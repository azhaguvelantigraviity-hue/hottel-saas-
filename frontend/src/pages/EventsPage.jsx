import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import Badge from '../components/Badge';

const HALLS = [];

const BOOKINGS = [];

const CATERING = [];

const TABS = ['Halls', 'Bookings', 'Catering', 'New Booking'];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const statusColor = { confirmed: 'var(--green)', pending: 'var(--amber)', cancelled: 'var(--rose)' };

const EventsPage = () => {
  const [tab, setTab] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ event:'', hall:'', date:'', guests:'', catering:'Standard', notes:'' });
  const thStyle = { padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text3)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' };
  const tdStyle = { padding: '12px 14px', fontSize: 13, color: 'var(--text2)', borderBottom: '1px solid var(--border)' };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard title="Total Halls" value={HALLS.length} icon="events" color="var(--violet)" />
        <StatCard title="Bookings This Month" value={BOOKINGS.length} icon="calendar" color="var(--gold)" />
        <StatCard title="Revenue" value="-" icon="dollar" color="var(--green)" />
        <StatCard title="Upcoming Events" value="-" icon="trending" color="var(--teal)" />
      </div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface)', borderRadius: 10, padding: 4 }}>
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: '9px 8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, background: tab === i ? 'var(--card)' : 'transparent', color: tab === i ? 'var(--gold)' : 'var(--text2)' }}>{t}</button>
          ))}
        </div>

        {tab === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
            {HALLS.map(hall => (
              <div key={hall.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{hall.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 12 }}>Capacity: {hall.capacity} pax · ₹{hall.rate.toLocaleString()}/event</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {hall.amenities.map(a => <span key={a} style={{ fontSize: 11, padding: '3px 8px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--text3)' }}>{a}</span>)}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Next 7 Days</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {hall.available.map((av, i) => (
                      <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: 9, color: 'var(--text3)', marginBottom: 3 }}>{DAYS[i]}</div>
                        <div style={{ width: '100%', height: 8, borderRadius: 4, background: av ? 'var(--green)' : 'var(--rose)', opacity: 0.8 }} />
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => { setTab(3); }} style={{ width: '100%', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: 8, padding: '10px', color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13 }}>Book Hall</button>
              </div>
            ))}
          </div>
        )}

        {tab === 1 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['ID','Event','Hall','Date','Client','Guests','Catering','Amount','Status'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {BOOKINGS.map(b => (
                <tr key={b.id} onMouseEnter={e=>e.currentTarget.style.background='var(--surface)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ ...tdStyle, fontFamily: 'DM Mono, monospace', color: 'var(--gold)' }}>{b.id}</td>
                  <td style={{ ...tdStyle, color: 'var(--text)', fontWeight: 500 }}>{b.event}</td>
                  <td style={tdStyle}>{b.hall}</td>
                  <td style={tdStyle}>{b.date}</td>
                  <td style={tdStyle}>{b.client}</td>
                  <td style={{ ...tdStyle, fontFamily: 'DM Mono, monospace' }}>{b.guests}</td>
                  <td style={tdStyle}>{b.catering}</td>
                  <td style={{ ...tdStyle, fontFamily: 'DM Mono, monospace', color: 'var(--text)' }}>₹{b.amount.toLocaleString()}</td>
                  <td style={tdStyle}><span style={{ fontSize: 11, fontWeight: 600, color: statusColor[b.status], textTransform: 'uppercase' }}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
            {CATERING.map((pkg, i) => {
              const colors = ['var(--teal)', 'var(--gold)', 'var(--violet)'];
              return (
                <div key={pkg.name} style={{ background: 'var(--surface)', border: `1px solid ${colors[i]}44`, borderRadius: 'var(--radius)', padding: 20 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: colors[i], marginBottom: 4 }}>{pkg.name}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: 'DM Mono, monospace', marginBottom: 16 }}>₹{pkg.price}<span style={{ fontSize: 13, color: 'var(--text3)', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>/head</span></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {pkg.items.map(item => <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}><Icon name="check" size={14} color={colors[i]} />{item}</div>)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 3 && (
          <div style={{ maxWidth: 560 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>New Event Booking</div>
            {[['Event Name','event','text'],['Client Name','client','text'],['Date','date','date'],['Number of Guests','guests','number']].map(([label, field, type]) => (
              <div key={field} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
                <input type={type} value={form[field] || ''} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontFamily: 'Inter, sans-serif', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hall</label>
              <select value={form.hall} onChange={e => setForm(f => ({ ...f, hall: e.target.value }))} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
                <option value="">Select Hall</option>
                {HALLS.map(h => <option key={h.id} value={h.name}>{h.name} ({h.capacity} pax)</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Catering Package</label>
              <select value={form.catering} onChange={e => setForm(f => ({ ...f, catering: e.target.value }))} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
                {CATERING.map(c => <option key={c.name} value={c.name}>{c.name} — ₹{c.price}/head</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Special Requirements</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontFamily: 'Inter, sans-serif', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <button style={{ background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: 8, padding: '12px 32px', color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14 }}>Create Booking</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
