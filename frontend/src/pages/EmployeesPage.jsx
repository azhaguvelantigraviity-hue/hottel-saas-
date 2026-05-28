import React, { useState } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import AttendancePage from './AttendancePage';
import { EMPLOYEES } from '../data/mockData';

const inputStyle = { width: '100%', padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif' };
const labelStyle = { fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' };

const EmployeeModal = ({ employee, onClose }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '520px' }}>
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Avatar initials={employee.avatar} color={employee.status === 'on-duty' ? 'var(--green)' : employee.status === 'leave' ? 'var(--amber)' : 'var(--text3)'} size={48} />
          <div>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: '20px' }}>{employee.name}</h2>
            <div style={{ fontSize: '13px', color: 'var(--text3)' }}>{employee.role}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="x" size={20} color="var(--text3)" /></button>
      </div>
      <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {[['Department', employee.dept], ['Shift', employee.shift + ' Shift'], ['Status', employee.status.replace('-', ' ')], ['Salary', `₹${employee.salary.toLocaleString()}/mo`], ['Joined', employee.joined], ['Phone', employee.phone || '—'], ['Email', employee.email || '—']].map(([k, v]) => (
          <div key={k} style={{ background: 'var(--surface)', borderRadius: '8px', padding: '10px 12px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text3)', letterSpacing: '0.06em', marginBottom: '3px' }}>{k.toUpperCase()}</div>
            <div style={{ fontSize: '13px', fontWeight: '600' }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AddEmployeeModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ name: '', role: '', dept: 'Front Office', shift: 'Morning', salary: '', phone: '', email: '', avatar: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '520px' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: '20px' }}>Add Employee</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="x" size={20} color="var(--text3)" /></button>
        </div>
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[['name', 'FULL NAME', 'text'], ['role', 'ROLE / DESIGNATION', 'text'], ['phone', 'PHONE', 'text'], ['email', 'EMAIL', 'email'], ['salary', 'MONTHLY SALARY (₹)', 'number']].map(([k, l, t]) => (
            <div key={k} style={{ gridColumn: k === 'name' || k === 'role' ? 'span 2' : 'span 1' }}>
              <label style={labelStyle}>{l}</label>
              <input type={t} style={inputStyle} value={form[k]} onChange={e => set(k, e.target.value)} />
            </div>
          ))}
          <div>
            <label style={labelStyle}>DEPARTMENT</label>
            <select style={inputStyle} value={form.dept} onChange={e => set('dept', e.target.value)}>
              {['Front Office', 'Housekeeping', 'F&B', 'Security', 'Wellness', 'Maintenance'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>SHIFT</label>
            <select style={inputStyle} value={form.shift} onChange={e => set('shift', e.target.value)}>
              {['Morning', 'Evening', 'Night'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>Cancel</button>
            <button onClick={() => { if (form.name && form.role) { onAdd({ ...form, id: Date.now(), status: 'off-duty', joined: new Date().toISOString().slice(0, 10), avatar: form.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(), salary: +form.salary || 0 }); onClose(); } }} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>Add Employee</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditEmployeeModal = ({ employee, onClose, onSave }) => {
  const [form, setForm] = useState({ 
    name: employee.name, 
    role: employee.role, 
    dept: employee.dept, 
    shift: employee.shift, 
    salary: employee.salary, 
    phone: employee.phone || '', 
    email: employee.email || '' 
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '520px' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: '20px' }}>Edit Employee</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="x" size={20} color="var(--text3)" /></button>
        </div>
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[['name', 'FULL NAME', 'text'], ['role', 'ROLE / DESIGNATION', 'text'], ['phone', 'PHONE', 'text'], ['email', 'EMAIL', 'email'], ['salary', 'MONTHLY SALARY (₹)', 'number']].map(([k, l, t]) => (
            <div key={k} style={{ gridColumn: k === 'name' || k === 'role' ? 'span 2' : 'span 1' }}>
              <label style={labelStyle}>{l}</label>
              <input type={t} style={inputStyle} value={form[k]} onChange={e => set(k, e.target.value)} />
            </div>
          ))}
          <div>
            <label style={labelStyle}>DEPARTMENT</label>
            <select style={inputStyle} value={form.dept} onChange={e => set('dept', e.target.value)}>
              {['Front Office', 'Housekeeping', 'F&B', 'Security', 'Wellness', 'Maintenance'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>SHIFT</label>
            <select style={inputStyle} value={form.shift} onChange={e => set('shift', e.target.value)}>
              {['Morning', 'Evening', 'Night'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>Cancel</button>
            <button onClick={() => { if (form.name && form.role) { onSave({ ...employee, ...form, salary: +form.salary || 0, avatar: form.name !== employee.name ? form.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : employee.avatar }); onClose(); } }} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmployeesPage = () => {
  const [employees, setEmployees] = useState(EMPLOYEES);
  const [activeTab, setActiveTab] = useState('staff');
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [filterDept, setFilterDept] = useState('all');

  const depts = ['all', ...new Set(employees.map(e => e.dept))];
  const filtered = filterDept === 'all' ? employees : employees.filter(e => e.dept === filterDept);

  const stats = [
    { label: 'Total Staff', value: employees.length, color: 'var(--gold)' },
    { label: 'On Duty', value: employees.filter(e => e.status === 'on-duty').length, color: 'var(--green)' },
    { label: 'On Leave', value: employees.filter(e => e.status === 'leave').length, color: 'var(--amber)' },
    { label: 'Off Duty', value: employees.filter(e => e.status === 'off-duty').length, color: 'var(--text3)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {selected && <EmployeeModal employee={selected} onClose={() => setSelected(null)} />}
      {showAdd && <AddEmployeeModal onClose={() => setShowAdd(false)} onAdd={emp => setEmployees(p => [...p, emp])} />}
      {editEmployee && <EditEmployeeModal employee={editEmployee} onClose={() => setEditEmployee(null)} onSave={emp => setEmployees(p => p.map(e => e.id === emp.id ? emp : e))} />}

      <div style={{ padding: '16px 32px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0' }}>
        {[['staff', 'Staff Directory'], ['attendance', 'Attendance']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === id ? 'var(--gold)' : 'transparent'}`, color: activeTab === id ? 'var(--gold)' : 'var(--text3)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'staff' && (
        <div style={{ padding: '24px 32px', overflowY: 'auto', flex: 1 }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
            {stats.map(s => (
              <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '26px', fontWeight: '700', fontFamily: 'Poppins,sans-serif', color: s.color, marginBottom: '4px' }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters + Actions */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            {depts.map(d => (
              <button key={d} onClick={() => setFilterDept(d)} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize', background: filterDept === d ? 'var(--gold)' : 'transparent', borderColor: filterDept === d ? 'var(--gold)' : 'var(--border)', color: filterDept === d ? '#000' : 'var(--text2)' }}>{d}</button>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              <button style={{ padding: '9px 18px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>Export</button>
              <button onClick={() => setShowAdd(true)} style={{ padding: '9px 18px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Inter, sans-serif' }}>
                <Icon name="plus" size={14} color="#fff" /> Add Employee
              </button>
            </div>
          </div>

          {/* Employee Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '14px' }}>
            {filtered.map(e => (
              <div key={e.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar initials={e.avatar} color={e.status === 'on-duty' ? 'var(--green)' : e.status === 'leave' ? 'var(--amber)' : 'var(--text3)'} size={44} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700' }}>{e.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{e.role}</div>
                  </div>
                  <Badge color={e.status === 'on-duty' ? 'green' : e.status === 'leave' ? 'amber' : 'gray'}>{e.status.replace('-', ' ')}</Badge>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Badge color="gray">{e.dept}</Badge>
                  <Badge color="violet">{e.shift} Shift</Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--surface)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '2px' }}>SALARY</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'DM Mono,monospace', color: 'var(--gold)' }}>₹{e.salary.toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '2px' }}>JOINED</div>
                    <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{e.joined}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => setSelected(e)} style={{ flex: 1, padding: '7px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '6px', color: 'var(--gold)', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>View Profile</button>
                  <button onClick={() => setEditEmployee(e)} style={{ padding: '7px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text2)', cursor: 'pointer', transition: 'all 0.15s' }} onMouseEnter={ev => { ev.currentTarget.style.borderColor = 'var(--gold)'; ev.currentTarget.style.color = 'var(--gold)'; }} onMouseLeave={ev => { ev.currentTarget.style.borderColor = 'var(--border)'; ev.currentTarget.style.color = 'var(--text2)'; }}>
                    <Icon name="edit" size={13} color="currentColor" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'attendance' && <AttendancePage />}
    </div>
  );
};

export default EmployeesPage;
