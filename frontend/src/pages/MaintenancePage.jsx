import React, { useState } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import { MAINTENANCE_TICKETS, EMPLOYEES } from '../data/mockData';

const priorityColor = { high: 'rose', medium: 'amber', low: 'teal' };
const statusColor = { open: 'rose', 'in-progress': 'violet', resolved: 'green' };
const categories = ['HVAC', 'Plumbing', 'Electronics', 'Elevator', 'Furniture', 'Electrical', 'Other'];

const inputStyle = { width: '100%', padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif' };
const labelStyle = { fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' };

const MaintenancePage = () => {
  const [tickets, setTickets] = useState(MAINTENANCE_TICKETS);
  const [filter, setFilter] = useState('all');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ room: '', issue: '', category: 'HVAC', priority: 'medium', notes: '', assignedTo: '' });

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter || t.priority === filter);
  const staff = EMPLOYEES.filter(e => ['Security', 'Housekeeping', 'Front Office', 'Management', 'Admin', 'Manager'].includes(e.dept) || e.role === 'admin' || e.role === 'manager');

  const updateTicket = (id, updates) => setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

  const addTicket = () => {
    if (!form.room || !form.issue) return;
    setTickets(prev => [...prev, {
      ...form,
      id: `MT-${String(prev.length + 1).padStart(3, '0')}`,
      status: 'open',
      assignedTo: form.assignedTo || null,
      reported: new Date().toISOString().slice(0, 10),
    }]);
    setForm({ room: '', issue: '', category: 'HVAC', priority: 'medium', notes: '', assignedTo: '' });
    setShowNew(false);
  };

  const stats = [
    { label: 'Total', value: tickets.length, color: 'var(--text2)' },
    { label: 'Open', value: tickets.filter(t => t.status === 'open').length, color: 'var(--rose)' },
    { label: 'In Progress', value: tickets.filter(t => t.status === 'in-progress').length, color: 'var(--violet)' },
    { label: 'Resolved', value: tickets.filter(t => t.status === 'resolved').length, color: 'var(--green)' },
  ];

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px)', overflowY: 'auto', flex: 1 }}>
      {showNew && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '480px' }}>
            <div style={{ padding: 'clamp(12px, 3vw, 24px)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: '20px' }}>New Maintenance Ticket</h2>
              <button onClick={() => setShowNew(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="x" size={20} color="var(--text3)" /></button>
            </div>
            <div style={{ padding: 'clamp(12px, 3vw, 24px)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>ROOM / LOCATION</label>
                  <input style={inputStyle} value={form.room} onChange={e => setForm(p => ({ ...p, room: e.target.value }))} placeholder="e.g. 101 or Lobby" />
                </div>
                <div>
                  <label style={labelStyle}>CATEGORY</label>
                  <select style={inputStyle} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>ISSUE DESCRIPTION</label>
                  <input style={inputStyle} value={form.issue} onChange={e => setForm(p => ({ ...p, issue: e.target.value }))} placeholder="Describe the issue" />
                </div>
                <div>
                  <label style={labelStyle}>PRIORITY</label>
                  <select style={inputStyle} value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                    {['high', 'medium', 'low'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>ASSIGN TO</label>
                  <select style={inputStyle} value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))}>
                    <option value="">Unassigned</option>
                    {staff.map(s => <option key={s.id} value={s.name}>{s.name} ({s.dept})</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>NOTES</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowNew(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>Cancel</button>
                <button onClick={addTicket} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>Submit Ticket</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '14px', marginBottom: '24px' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '26px', fontWeight: '700', fontFamily: 'Poppins,sans-serif', color: s.color, marginBottom: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {['all', 'open', 'in-progress', 'resolved', 'high', 'medium', 'low'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize', background: filter === f ? 'var(--gold)' : 'transparent', borderColor: filter === f ? 'var(--gold)' : 'var(--border)', color: filter === f ? '#000' : 'var(--text2)' }}>
            {f === 'all' ? 'All' : f.replace('-', ' ')}
          </button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={() => setShowNew(true)} style={{ padding: '9px 18px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Inter, sans-serif' }}>
            <Icon name="plus" size={14} color="#fff" /> New Ticket
          </button>
        </div>
      </div>

      {/* Tickets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map(ticket => (
          <div key={ticket.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontFamily: 'DM Mono,monospace', color: 'var(--gold)' }}>{ticket.id}</span>
                  <Badge color={priorityColor[ticket.priority]}>{ticket.priority}</Badge>
                  <Badge color="gray">{ticket.category}</Badge>
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '2px' }}>{ticket.issue}</div>
                <div style={{ fontSize: '12px', color: 'var(--text3)' }}>📍 {ticket.room} · Reported: {ticket.reported}</div>
                {ticket.notes && <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px' }}>📝 {ticket.notes}</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <Badge color={statusColor[ticket.status]}>{ticket.status.replace('-', ' ')}</Badge>
                {ticket.assignedTo && <span style={{ fontSize: '12px', color: 'var(--text3)' }}>👤 {ticket.assignedTo}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {ticket.status === 'open' && (
                <>
                  <select onChange={e => { if (e.target.value) updateTicket(ticket.id, { assignedTo: e.target.value }); }} defaultValue="" style={{ ...inputStyle, width: 'auto', fontSize: '12px', padding: '6px 10px' }}>
                    <option value="">Assign to…</option>
                    {staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                  <button onClick={() => updateTicket(ticket.id, { status: 'in-progress' })} style={{ padding: '6px 12px', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '6px', color: 'var(--violet)', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>Start Work</button>
                </>
              )}
              {ticket.status === 'in-progress' && (
                <button onClick={() => updateTicket(ticket.id, { status: 'resolved' })} style={{ padding: '6px 12px', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '6px', color: 'var(--green)', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>Mark Resolved</button>
              )}
              {ticket.status === 'resolved' && <span style={{ fontSize: '12px', color: 'var(--green)' }}>✓ Issue Resolved</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaintenancePage;
