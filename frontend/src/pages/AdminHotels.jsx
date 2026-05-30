import React, { useState } from 'react';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import { HOTELS, PLANS, getPlan } from '../data/mockData';

// ── Shared input style ────────────────────────────────────────
const inp = {
  width: '100%', padding: '10px 12px', background: 'var(--surface)',
  border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)',
  fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif',
};
const lbl = {
  fontSize: '11px', color: 'var(--text3)', fontWeight: '600',
  letterSpacing: '0.06em', display: 'block', marginBottom: '5px',
};

// ── Hotel Detail Modal ────────────────────────────────────────
const HotelDetailModal = ({ hotel, onClose, onEdit }) => {
  const plan = getPlan(hotel.plan);
  const stats = [
    { label: 'Total Rooms',  value: hotel.rooms },
    { label: 'Staff',        value: hotel.staff },
    { label: 'Occupancy',    value: `${hotel.occupancy}%` },
    { label: 'Revenue',      value: `₹${hotel.revenue.toLocaleString()}` },
    { label: 'Joined',       value: hotel.joined },
    { label: 'Contact',      value: hotel.contact },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '560px',
        maxHeight: '90vh', overflow: 'auto',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Avatar initials={hotel.avatar} color={plan.accent} size={52} />
            <div>
              <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: '20px', marginBottom: '4px' }}>
                {hotel.name}
              </h2>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Badge color={hotel.plan === 'enterprise' ? 'gold' : hotel.plan === 'professional' ? 'teal' : 'gray'}>
                  {hotel.plan}
                </Badge>
                <Badge color={hotel.status === 'active' ? 'green' : hotel.status === 'trial' ? 'amber' : 'rose'}>
                  {hotel.status}
                </Badge>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <Icon name="x" size={20} color="var(--text3)" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Location */}
          <div style={{ background: 'var(--surface)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '4px' }}>LOCATION</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{hotel.city}, India</div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {stats.map(s => (
              <div key={s.label} style={{ background: 'var(--surface)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text3)', letterSpacing: '0.06em', marginBottom: '4px' }}>
                  {s.label.toUpperCase()}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'DM Mono,monospace', wordBreak: 'break-all' }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Occupancy bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text2)' }}>Occupancy Rate</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: hotel.occupancy > 80 ? 'var(--green)' : hotel.occupancy > 60 ? 'var(--gold)' : 'var(--rose)' }}>
                {hotel.occupancy}%
              </span>
            </div>
            <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '4px', transition: 'width 0.6s ease',
                width: `${hotel.occupancy}%`,
                background: hotel.occupancy > 80 ? 'var(--green)' : hotel.occupancy > 60 ? 'var(--gold)' : 'var(--rose)',
              }} />
            </div>
          </div>

          {/* Plan features */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>Plan Features</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {plan.features.slice(0, 8).map(f => (
                <div key={f} style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '4px 10px', background: `${plan.accent}12`,
                  border: `1px solid ${plan.accent}30`, borderRadius: '20px',
                  fontSize: '11px', color: plan.accent,
                }}>
                  <Icon name="check" size={10} color={plan.accent} /> {f}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => { onClose(); onEdit(hotel); }}
              style={{
                flex: 1, padding: '11px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)',
                border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer',
                fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              <Icon name="edit" size={14} color="#fff" /> Edit Hotel
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '11px 20px', background: 'transparent',
                border: '1px solid var(--border)', borderRadius: '8px',
                color: 'var(--text2)', cursor: 'pointer', fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Edit Hotel Modal ──────────────────────────────────────────
const EditHotelModal = ({ hotel, onClose, onSave }) => {
  const [form, setForm] = useState({
    name:      hotel.name,
    city:      hotel.city,
    contact:   hotel.contact,
    plan:      hotel.plan,
    status:    hotel.status,
    rooms:     hotel.rooms,
    staff:     hotel.staff,
    occupancy: hotel.occupancy,
    revenue:   hotel.revenue,
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    onSave({ ...hotel, ...form, rooms: +form.rooms, staff: +form.staff, occupancy: +form.occupancy, revenue: +form.revenue });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '520px',
        maxHeight: '90vh', overflow: 'auto',
      }}>
        <div style={{
          padding: '24px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: '20px' }}>Edit Hotel</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Icon name="x" size={20} color="var(--text3)" />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={lbl}>HOTEL NAME</label>
              <input style={inp} value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>CITY</label>
              <input style={inp} value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>CONTACT EMAIL</label>
              <input style={inp} value={form.contact} onChange={e => set('contact', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>PLAN</label>
              <select style={inp} value={form.plan} onChange={e => set('plan', e.target.value)}>
                {['starter', 'professional', 'enterprise'].map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>STATUS</label>
              <select style={inp} value={form.status} onChange={e => set('status', e.target.value)}>
                {['active', 'trial', 'suspended'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>TOTAL ROOMS</label>
              <input type="number" style={inp} value={form.rooms} onChange={e => set('rooms', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>STAFF COUNT</label>
              <input type="number" style={inp} value={form.staff} onChange={e => set('staff', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>OCCUPANCY (%)</label>
              <input type="number" min="0" max="100" style={inp} value={form.occupancy} onChange={e => set('occupancy', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>MONTHLY REVENUE (₹)</label>
              <input type="number" style={inp} value={form.revenue} onChange={e => set('revenue', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px', background: 'transparent',
                border: '1px solid var(--border)', borderRadius: '8px',
                color: 'var(--text2)', cursor: 'pointer', fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '10px 24px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)',
                border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer',
                fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif',
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Add Hotel Modal ───────────────────────────────────────────
const AddHotelModal = ({ onClose, onAdd }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '', city: '', contact: '', plan: 'professional', status: 'active',
    rooms: '', staff: '', avatar: '', adminEmail: '', adminPassword: ''
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleAdd = () => {
    if (!form.name || !form.city || !form.adminEmail || !form.adminPassword) {
      alert("Please fill in the required fields (Name, City, Manager Email, Password)");
      return;
    }
    onAdd({
      ...form,
      id: Date.now(),
      rooms: +form.rooms || 0,
      staff: +form.staff || 0,
      occupancy: 0,
      revenue: 0,
      joined: new Date().toISOString().slice(0, 10),
      avatar: form.avatar || form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '520px',
      }}>
        <div style={{
          padding: '24px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: '20px' }}>Add New Hotel</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Icon name="x" size={20} color="var(--text3)" />
          </button>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={lbl}>HOTEL NAME *</label>
              <input style={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. The Royal Palace" />
            </div>
            <div>
              <label style={lbl}>CITY *</label>
              <input style={inp} value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Mumbai" />
            </div>
            <div>
              <label style={lbl}>CONTACT EMAIL</label>
              <input style={inp} value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="gm@hotel.com" />
            </div>
            <div>
              <label style={lbl}>PLAN</label>
              <select style={inp} value={form.plan} onChange={e => set('plan', e.target.value)}>
                {['starter', 'professional', 'enterprise'].map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>STATUS</label>
              <select style={inp} value={form.status} onChange={e => set('status', e.target.value)}>
                {['active', 'trial', 'suspended'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>TOTAL ROOMS</label>
              <input type="number" style={inp} value={form.rooms} onChange={e => set('rooms', e.target.value)} placeholder="e.g. 50" />
            </div>
            <div>
              <label style={lbl}>STAFF COUNT</label>
              <input type="number" style={inp} value={form.staff} onChange={e => set('staff', e.target.value)} placeholder="e.g. 12" />
            </div>
          </div>

          <div style={{ marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--text)' }}>Manager Login Credentials</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={lbl}>MANAGER EMAIL *</label>
                <input type="email" style={inp} value={form.adminEmail} onChange={e => set('adminEmail', e.target.value)} placeholder="manager@hotel.com" />
              </div>
              <div style={{ position: 'relative' }}>
                <label style={lbl}>MANAGER PASSWORD *</label>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  style={{ ...inp, paddingRight: '40px' }} 
                  value={form.adminPassword} 
                  onChange={e => set('adminPassword', e.target.value)} 
                  placeholder="••••••••" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    bottom: '8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px'
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  <Icon name={showPassword ? "eye-off" : "eye"} size={16} color="currentColor" />
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
              Cancel
            </button>
            <button onClick={handleAdd} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
              Add Hotel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
const getStoredHotels = () => {
  try {
    const data = localStorage.getItem('stayos_hotels');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveStoredHotels = (hotels) => {
  try {
    localStorage.setItem('stayos_hotels', JSON.stringify(hotels));
    const saved = JSON.parse(localStorage.getItem('stayos_hotels'));
    if (!saved || saved.length !== hotels.length) {
      console.error('Hotel data verification failed — data may not be persisted');
    }
  } catch (e) {
    console.error('Failed to save hotels to localStorage:', e);
  }
};

const AdminHotels = () => {
  const [hotels, setHotels] = useState(() => {
    const stored = getStoredHotels();
    return stored.length > 0 ? stored : HOTELS;
  });
  const [filter, setFilter] = useState('all');
  const [viewHotel, setViewHotel] = useState(null);
  const [editHotel, setEditHotel] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = filter === 'all'
    ? hotels
    : hotels.filter(h => h.plan === filter || h.status === filter);

  const handleSave = (updated) => {
    const next = hotels.map(h => h.id === updated.id ? updated : h);
    setHotels(next);
    saveStoredHotels(next);
  };

  const handleAdd = (newHotel) => {
    const next = [...hotels, { ...newHotel, receptionists: newHotel.receptionists || [] }];
    setHotels(next);
    saveStoredHotels(next);
  };

  const handleDelete = (hotel) => {
    if (!confirm(`Delete "${hotel.name}"? This cannot be undone.`)) return;
    const next = hotels.filter(h => h.id !== hotel.id);
    setHotels(next);
    saveStoredHotels(next);
  };

  return (
    <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
      {viewHotel && (
        <HotelDetailModal
          hotel={viewHotel}
          onClose={() => setViewHotel(null)}
          onEdit={(h) => setEditHotel(h)}
        />
      )}
      {editHotel && (
        <EditHotelModal
          hotel={editHotel}
          onClose={() => setEditHotel(null)}
          onSave={handleSave}
        />
      )}
      {showAdd && (
        <AddHotelModal
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
        />
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'starter', 'professional', 'enterprise', 'active', 'trial', 'suspended'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: '20px', border: '1px solid',
                fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', textTransform: 'capitalize',
                background: filter === f ? 'var(--gold)' : 'transparent',
                borderColor: filter === f ? 'var(--gold)' : 'var(--border)',
                color: filter === f ? '#000' : 'var(--text2)',
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            padding: '9px 18px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)',
            border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer',
            fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center',
            gap: '6px', fontFamily: 'Inter, sans-serif',
          }}
        >
          <Icon name="plus" size={14} color="#fff" /> Add Hotel
        </button>
      </div>

      {/* Hotel Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '16px' }}>
        {filtered.map(h => (
          <div
            key={h.id}
            style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '20px', transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar initials={h.avatar} color={getPlan(h.plan).accent} size={42} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '2px' }}>{h.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{h.city} · {h.rooms} rooms</div>
                </div>
              </div>
              <Badge color={h.status === 'active' ? 'green' : h.status === 'trial' ? 'amber' : 'rose'}>
                {h.status}
              </Badge>
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <Badge color={h.plan === 'enterprise' ? 'gold' : h.plan === 'professional' ? 'teal' : 'gray'}>
                {h.plan}
              </Badge>
              <Badge color="gray">{h.staff} staff</Badge>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '10px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '3px' }}>OCCUPANCY</div>
                <div style={{
                  fontSize: '18px', fontWeight: '700', fontFamily: 'DM Mono,monospace',
                  color: h.occupancy > 80 ? 'var(--green)' : h.occupancy > 60 ? 'var(--gold)' : 'var(--rose)',
                }}>
                  {h.occupancy}%
                </div>
              </div>
              <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '10px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '3px' }}>REVENUE</div>
                <div style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'DM Mono,monospace' }}>
                  ₹{(h.revenue / 1000).toFixed(0)}K
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setViewHotel(h)}
                style={{
                  flex: 1, padding: '8px',
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.25)',
                  borderRadius: '6px', color: 'var(--gold)', cursor: 'pointer',
                  fontSize: '12px', fontWeight: '600', fontFamily: 'Inter, sans-serif',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,168,76,0.1)'}
              >
                View Details
              </button>
              <button
                onClick={() => setEditHotel(h)}
                style={{
                  padding: '8px 12px', background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: '6px',
                  color: 'var(--text2)', cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}
                title="Edit hotel"
              >
                <Icon name="edit" size={14} color="currentColor" />
              </button>
              <button
                onClick={() => handleDelete(h)}
                style={{
                  padding: '8px 12px', background: 'transparent',
                  border: '1px solid var(--border)', borderRadius: '6px',
                  color: '#EF4444', cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
                title="Delete hotel"
              >
                <Icon name="trash" size={14} color="#EF4444" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminHotels;

