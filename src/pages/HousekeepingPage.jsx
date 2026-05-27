import React, { useState } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import { HOUSEKEEPING_TASKS, ROOMS, EMPLOYEES } from '../data/mockData';

const priorityColor = { high: 'rose', medium: 'amber', low: 'teal' };
const statusColor = { pending: 'amber', 'in-progress': 'violet', completed: 'green' };

const HousekeepingPage = () => {
  const [tasks, setTasks] = useState(HOUSEKEEPING_TASKS);
  const [filter, setFilter] = useState('all');
  const [showAssign, setShowAssign] = useState(false);
  const [newTask, setNewTask] = useState({ room: '', type: 'Full Clean', assignedTo: '', priority: 'medium', notes: '', time: '' });

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const housekeepers = EMPLOYEES.filter(e => e.dept === 'Housekeeping' || e.dept === 'Front Office');

  const updateStatus = (id, status) => setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));

  const addTask = () => {
    if (!newTask.room || !newTask.assignedTo) return;
    setTasks(prev => [...prev, { ...newTask, id: prev.length + 1, status: 'pending' }]);
    setNewTask({ room: '', type: 'Full Clean', assignedTo: '', priority: 'medium', notes: '', time: '' });
    setShowAssign(false);
  };

  const inputStyle = { width: '100%', padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'DM Sans,sans-serif' };
  const labelStyle = { fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' };

  const stats = [
    { label: 'Total Tasks', value: tasks.length, color: 'var(--text2)' },
    { label: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: 'var(--amber)' },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: 'var(--violet)' },
    { label: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: 'var(--green)' },
  ];

  const roomStatus = ROOMS.map(r => ({ ...r, hkTask: tasks.find(t => t.room === String(r.id)) }));

  return (
    <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
      {showAssign && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '480px' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '20px' }}>Assign Task</h2>
              <button onClick={() => setShowAssign(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="x" size={20} color="var(--text3)" /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>ROOM</label>
                  <select style={inputStyle} value={newTask.room} onChange={e => setNewTask(p => ({ ...p, room: e.target.value }))}>
                    <option value="">Select room</option>
                    {ROOMS.map(r => <option key={r.id} value={r.id}>{r.id} – {r.type}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>TASK TYPE</label>
                  <select style={inputStyle} value={newTask.type} onChange={e => setNewTask(p => ({ ...p, type: e.target.value }))}>
                    {['Full Clean', 'Turndown', 'Inspection', 'Linen Change', 'Minibar Restock', 'Deep Clean'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>ASSIGN TO</label>
                  <select style={inputStyle} value={newTask.assignedTo} onChange={e => setNewTask(p => ({ ...p, assignedTo: e.target.value }))}>
                    <option value="">Select staff</option>
                    {housekeepers.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>PRIORITY</label>
                  <select style={inputStyle} value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}>
                    {['high', 'medium', 'low'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>TIME</label>
                  <input type="time" style={inputStyle} value={newTask.time} onChange={e => setNewTask(p => ({ ...p, time: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>NOTES</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }} value={newTask.notes} onChange={e => setNewTask(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowAssign(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontSize: '13px' }}>Cancel</button>
                <button onClick={addTask} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'DM Sans,sans-serif' }}>Assign Task</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '26px', fontWeight: '700', fontFamily: 'Playfair Display,serif', color: s.color, marginBottom: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Task List */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['all', 'pending', 'in-progress', 'completed'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', textTransform: 'capitalize', background: filter === f ? 'var(--gold)' : 'transparent', borderColor: filter === f ? 'var(--gold)' : 'var(--border)', color: filter === f ? '#000' : 'var(--text2)' }}>
                  {f === 'all' ? 'All' : f.replace('-', ' ')}
                </button>
              ))}
            </div>
            <button onClick={() => setShowAssign(true)} style={{ padding: '8px 16px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'DM Sans,sans-serif' }}>
              <Icon name="plus" size={12} color="#fff" /> Assign Task
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(task => (
              <div key={task.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '900', fontFamily: 'Playfair Display,serif', color: 'var(--gold)' }}>Room {task.room}</span>
                      <Badge color={priorityColor[task.priority]}>{task.priority}</Badge>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{task.type}</div>
                    {task.notes && <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>{task.notes}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <Badge color={statusColor[task.status]}>{task.status.replace('-', ' ')}</Badge>
                    {task.time && <span style={{ fontSize: '11px', color: 'var(--text3)' }}>⏰ {task.time}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text2)' }}>👤 {task.assignedTo}</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {task.status === 'pending' && <button onClick={() => updateStatus(task.id, 'in-progress')} style={{ padding: '5px 10px', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '6px', color: 'var(--violet)', cursor: 'pointer', fontSize: '11px', fontWeight: '600', fontFamily: 'DM Sans,sans-serif' }}>Start</button>}
                    {task.status === 'in-progress' && <button onClick={() => updateStatus(task.id, 'completed')} style={{ padding: '5px 10px', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '6px', color: 'var(--green)', cursor: 'pointer', fontSize: '11px', fontWeight: '600', fontFamily: 'DM Sans,sans-serif' }}>Complete</button>}
                    {task.status === 'completed' && <span style={{ fontSize: '11px', color: 'var(--green)' }}>✓ Done</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Room Status Grid */}
        <div>
          <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px' }}>Room Housekeeping Status</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
            {ROOMS.map(r => {
              const hkColor = { clean: 'var(--green)', dirty: 'var(--rose)', inspect: 'var(--amber)' };
              return (
                <div key={r.id} style={{ background: 'var(--card)', border: `1px solid ${hkColor[r.housekeeping]}30`, borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: '900', fontFamily: 'Playfair Display,serif', color: hkColor[r.housekeeping] }}>{r.id}</div>
                  <div style={{ fontSize: '9px', color: 'var(--text3)', textTransform: 'uppercase', marginTop: '2px' }}>{r.housekeeping}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[['Clean', 'var(--green)'], ['Dirty', 'var(--rose)'], ['Inspect', 'var(--amber)']].map(([l, c]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />
                <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HousekeepingPage;
