import React, { useState } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import * as opApi from '../services/operationsService';
import * as hotelApi from '../services/hotelService';

const priorityColor = { high: 'rose', medium: 'amber', low: 'teal' };
const statusColor = { open: 'rose', assigned: 'blue', 'in-progress': 'violet', resolved: 'green' };
const categories = ['HVAC', 'Plumbing', 'Electronics', 'Elevator', 'Furniture', 'Electrical', 'Other'];

const inputStyle = { width: '100%', padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif' };
const labelStyle = { fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' };

const AssignDropdown = ({ employees, tickets, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const mStaff = employees.filter(e => ['Maintenance', 'Housekeeping'].includes(e.department) || ['Maintenance', 'Housekeeping'].includes(e.dept) || e.role === 'housekeeping');
  
  const activeTickets = tickets.filter(t => ['open', 'in-progress', 'assigned'].includes(t.status));
  const getBusyCount = (name) => activeTickets.filter(t => t.assignedTo === name || (t.assignedTo && t.assignedTo.name === name)).length;

  const staffStats = mStaff.map(s => {
    const busy = getBusyCount(s.name || s.firstName);
    let st = 'Available';
    if (s.status === 'on-leave' || s.status === 'leave') st = 'On Leave';
    else if (busy > 0) st = 'Busy';
    return { ...s, busyCount: busy, calcStatus: st };
  }).sort((a, b) => {
    if (a.calcStatus === 'Available' && b.calcStatus !== 'Available') return -1;
    if (a.calcStatus !== 'Available' && b.calcStatus === 'Available') return 1;
    return a.busyCount - b.busyCount;
  });

  const filtered = staffStats.filter(s => (s.name || s.firstName || '').toLowerCase().includes(search.toLowerCase()) || (s.employeeId || '').toLowerCase().includes(search.toLowerCase()));

  React.useEffect(() => {
    if (!value && staffStats.length > 0 && staffStats[0].calcStatus === 'Available') {
      onChange(staffStats[0].name || staffStats[0].firstName);
    }
  }, [value, staffStats, onChange]);

  return (
    <div style={{ position: 'relative' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ ...inputStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'var(--surface)' }}
      >
        <span>{value || 'Unassigned'}</span>
        <Icon name="chevron-down" size={16} color="var(--text3)" />
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', marginTop: '4px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '250px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
            <input 
              autoFocus 
              placeholder="Search staff..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              style={{ width: '100%', padding: '6px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)', fontSize: '12px', outline: 'none' }} 
            />
          </div>
          <div style={{ overflowY: 'auto', flex: 1, padding: '4px 0' }}>
            {mStaff.length === 0 ? (
              <div style={{ padding: '10px', fontSize: '12px', color: 'var(--text3)', textAlign: 'center' }}>No Maintenance Staff Available</div>
            ) : filtered.length === 0 ? (
               <div style={{ padding: '10px', fontSize: '12px', color: 'var(--text3)', textAlign: 'center' }}>No matches found</div>
            ) : filtered.map(s => (
              <div 
                key={s._id || s.id} 
                onClick={() => { onChange(s.name || s.firstName); setIsOpen(false); setSearch(''); }}
                style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>{s.name || s.firstName}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{s.employeeId || s._id?.slice(-6) || 'ID N/A'}</span>
                </div>
                <Badge color={s.calcStatus === 'Available' ? 'green' : s.calcStatus === 'Busy' ? 'amber' : 'rose'}>{s.calcStatus}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MaintenancePage = ({ role }) => {
  const [tickets, setTickets] = useState([]);
  const [employees, setEmployees] = useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsRes, employeesRes] = await Promise.all([
          opApi.getMaintenanceRequests(),
          hotelApi.getEmployees()
        ]);
        if (ticketsRes.data) setTickets(ticketsRes.data);
        if (employeesRes.data) setEmployees(employeesRes.data);
      } catch (err) {
        console.error('Failed to fetch maintenance data', err);
      }
    };
    fetchData();
  }, []);
  const [filter, setFilter] = useState('all');
  const [showNew, setShowNew] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ room: '', issue: '', category: 'HVAC', priority: 'medium', notes: '', assignedTo: '', status: 'open' });

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter || t.priority === filter);
  const staff = employees.filter(e => ['Security', 'Housekeeping', 'Front Office', 'Management', 'Admin', 'Manager'].includes(e.dept) || e.role === 'admin' || e.role === 'manager');

  const updateTicket = async (id, updates) => {
    try {
      const res = await opApi.updateMaintenanceRequest(id, updates);
      if (res.data) {
        setTickets(prev => prev.map(t => t._id === id ? res.data : t));
      }
    } catch (err) {
      console.error('Failed to update ticket', err);
      // fallback
      setTickets(prev => prev.map(t => t._id === id || t.id === id ? { ...t, ...updates } : t));
    }
  };

  const deleteTicket = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await opApi.deleteMaintenanceRequest(id);
      setTickets(prev => prev.filter(t => t._id !== id && t.id !== id));
      alert('Ticket Deleted Successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to delete ticket');
    }
  };

  const openEdit = (ticket) => {
    setEditingId(ticket._id || ticket.id);
    setForm({
      room: ticket.room || ticket.roomNumber || '',
      issue: ticket.issue || ticket.maintenanceIssue || '',
      category: ticket.category || 'HVAC',
      priority: ticket.priority || 'medium',
      notes: ticket.notes || '',
      assignedTo: ticket.assignedTo?.name || ticket.assignedTo || '',
      status: ticket.status || 'open'
    });
    setShowNew(true);
  };

  const saveTicket = async () => {
    if (!form.room || !form.issue) return;
    const payload = {
      room: form.room,
      issue: form.issue,
      category: form.category,
      priority: form.priority,
      notes: form.notes,
      assignedTo: form.assignedTo || null,
      status: form.status || 'open',
    };
    try {
      if (editingId) {
        const res = await opApi.updateMaintenanceRequest(editingId, payload);
        if (res.data) setTickets(prev => prev.map(t => (t._id || t.id) === editingId ? res.data : t));
        alert('Ticket Updated Successfully');
      } else {
        const res = await opApi.createMaintenanceRequest(payload);
        if (res.data) setTickets(prev => [...prev, res.data]);
      }
    } catch (err) {
      console.error('Failed to save ticket', err);
    }
    setForm({ room: '', issue: '', category: 'HVAC', priority: 'medium', notes: '', assignedTo: '', status: 'open' });
    setShowNew(false);
    setEditingId(null);
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
              <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: '20px' }}>{editingId ? 'Edit Maintenance Ticket' : 'New Maintenance Ticket'}</h2>
              <button onClick={() => { setShowNew(false); setEditingId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="x" size={20} color="var(--text3)" /></button>
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
                  <AssignDropdown employees={employees} tickets={tickets} value={form.assignedTo} onChange={val => setForm(p => ({ ...p, assignedTo: val }))} />
                </div>
                {editingId && (
                  <div>
                    <label style={labelStyle}>STATUS</label>
                    <select style={inputStyle} value={form.status || 'open'} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                      {['open', 'assigned', 'in-progress', 'resolved', 'closed'].map(st => <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1).replace('-',' ')}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label style={labelStyle}>NOTES</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => { setShowNew(false); setEditingId(null); }} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>Cancel</button>
                <button onClick={saveTicket} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>{editingId ? 'Save Changes' : 'Submit Ticket'}</button>
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

      {/* Analytics Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--text)' }}>Tickets by Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {categories.map(c => {
              const count = tickets.filter(t => t.category === c).length;
              const pct = tickets.length ? Math.round((count / tickets.length) * 100) : 0;
              return (
                <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '80px', fontSize: '12px', color: 'var(--text2)' }}>{c}</div>
                  <div style={{ flex: 1, height: '8px', background: 'var(--surface)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gold)', borderRadius: '4px' }} />
                  </div>
                  <div style={{ width: '30px', fontSize: '12px', fontWeight: '600', textAlign: 'right' }}>{count}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--text)' }}>Resolution Analytics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', justifyContent: 'center', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
               <div style={{ fontSize: '13px', color: 'var(--text2)' }}>Average Resolution Time</div>
               <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--green)' }}>2.4 hrs</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
               <div style={{ fontSize: '13px', color: 'var(--text2)' }}>Pending Critical Issues</div>
               <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--rose)' }}>{tickets.filter(t => t.priority === 'high' && t.status !== 'resolved').length}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ fontSize: '13px', color: 'var(--text2)' }}>Total AI-Reported</div>
               <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--violet)' }}>{tickets.filter(t => t.reportedBy && t.reportedBy.includes('AI')).length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {['all', 'open', 'assigned', 'in-progress', 'resolved', 'high', 'medium', 'low'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize', background: filter === f ? 'var(--gold)' : 'transparent', borderColor: filter === f ? 'var(--gold)' : 'var(--border)', color: filter === f ? '#000' : 'var(--text2)' }}>
            {f === 'all' ? 'All' : f.replace('-', ' ')}
          </button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={() => { setEditingId(null); setForm({ room: '', issue: '', category: 'HVAC', priority: 'medium', notes: '', assignedTo: '', status: 'open' }); setShowNew(true); }} style={{ padding: '9px 18px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Inter, sans-serif' }}>
            <Icon name="plus" size={14} color="#fff" /> New Ticket
          </button>
        </div>
      </div>

      {/* Tickets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map(ticket => (
          <div key={ticket._id || ticket.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontFamily: 'DM Mono,monospace', color: 'var(--gold)' }}>{ticket.id || ticket.roomNumber}</span>
                  <Badge color={priorityColor[ticket.priority]}>{ticket.priority}</Badge>
                  <Badge color="gray">{ticket.category || 'Other'}</Badge>
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '2px' }}>{ticket.issue || ticket.maintenanceIssue}</div>
                <div style={{ fontSize: '12px', color: 'var(--text3)' }}>📍 {ticket.room || ticket.roomNumber} · Reported: {ticket.reported || new Date(ticket.createdAt).toLocaleDateString()}</div>
                {ticket.notes && <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px' }}>📝 {ticket.notes}</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Badge color={statusColor[ticket.status] || 'rose'}>{(ticket.status || 'open').replace('-', ' ')}</Badge>
                  {['admin', 'manager'].includes(role) && (
                    <>
                      <button onClick={() => openEdit(ticket)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }} title="Edit"><Icon name="edit-2" size={14} /></button>
                      <button onClick={() => deleteTicket(ticket._id || ticket.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rose)' }} title="Delete"><Icon name="trash-2" size={14} /></button>
                    </>
                  )}
                </div>
                {ticket.assignedTo && <span style={{ fontSize: '12px', color: 'var(--text3)' }}>👤 {ticket.assignedTo?.firstName || ticket.assignedTo}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(!ticket.status || ticket.status === 'open' || ticket.status === 'assigned') && (
                <>
                  <select onChange={e => { if (e.target.value) updateTicket(ticket._id || ticket.id, { assignedTo: e.target.value }); }} defaultValue="" style={{ ...inputStyle, width: 'auto', fontSize: '12px', padding: '6px 10px' }}>
                    <option value="">Assign to…</option>
                    {employees.filter(e => ['Maintenance', 'Housekeeping'].includes(e.department) || e.role === 'housekeeping').map(s => <option key={s._id || s.id} value={s.name || s.firstName}>{s.name || s.firstName}</option>)}
                  </select>
                  <button onClick={() => updateTicket(ticket._id || ticket.id, { status: 'in-progress' })} style={{ padding: '6px 12px', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '6px', color: 'var(--violet)', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>Start Work</button>
                </>
              )}
              {ticket.status === 'in-progress' && (
                <button onClick={() => updateTicket(ticket._id || ticket.id, { status: 'resolved' })} style={{ padding: '6px 12px', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '6px', color: 'var(--green)', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>Mark Resolved</button>
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
