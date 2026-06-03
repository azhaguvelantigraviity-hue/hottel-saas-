import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import AttendancePage from './AttendancePage';
import { EMPLOYEES } from '../data/mockData';
import { getEmployees as apiGetEmployees, createEmployee as apiCreateEmployee, updateEmployee as apiUpdateEmployee, deleteEmployee as apiDeleteEmployee } from '../services/hotelService';

const mapBEtoFE = (be) => ({
  id: be._id,
  name: be.name,
  role: be.role,
  dept: be.department,
  shift: be.shift,
  salary: be.salary,
  phone: be.phone || '',
  email: be.email || '',
  avatar: be.avatar || be.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
  status: be.status === 'active' ? 'on-duty' : be.status === 'inactive' ? 'off-duty' : be.status === 'on_leave' ? 'leave' : be.status || 'off-duty',
  joined: be.joinedAt ? new Date(be.joinedAt).toISOString().slice(0, 10) : '',
  loginEmail: '',
  loginPassword: '',
});

const mapFEtoBE = (fe) => ({
  name: fe.name,
  role: fe.role,
  department: fe.dept,
  shift: fe.shift,
  salary: fe.salary,
  phone: fe.phone,
  email: fe.email,
  avatar: fe.avatar,
  status: fe.status === 'on-duty' ? 'active' : fe.status === 'off-duty' ? 'inactive' : fe.status === 'leave' ? 'on_leave' : 'active',
  joinedAt: fe.joined ? new Date(fe.joined) : undefined,
  loginEmail: fe.loginEmail,
  loginPassword: fe.loginPassword,
});

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
  const [form, setForm] = useState({ name: '', role: '', dept: 'Front Office', shift: 'Morning', salary: '', phone: '', email: '', avatar: '', loginEmail: '', loginPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
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
              <input type={t} style={inputStyle} value={form[k] || ''} onChange={e => set(k, e.target.value)} />
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
          
          {(() => {
            const rStr = (form.role || '').toLowerCase();
            const isRecep = rStr.includes('reception') || rStr.includes('resep') || rStr.includes('front desk');
            return isRecep && (
            <div style={{ gridColumn: 'span 2', marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2)', display: 'block', marginBottom: '8px' }}>Create Receptionist Login (Optional)</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>LOGIN EMAIL</label>
                  <input type="email" style={inputStyle} value={form.loginEmail} onChange={e => set('loginEmail', e.target.value)} placeholder="recep@hotel.com" />
                </div>
                <div>
                  <label style={labelStyle}>LOGIN PASSWORD</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input type={showPassword ? "text" : "password"} style={{ ...inputStyle, paddingRight: '35px' }} value={form.loginPassword} onChange={e => set('loginPassword', e.target.value)} placeholder="password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
                      <Icon name={showPassword ? "eye-off" : "eye"} size={16} color="var(--text3)" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            );
          })()}

          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>Cancel</button>
            <button onClick={() => { if (form.name && form.role) { 
              const rStr = (form.role || '').toLowerCase();
              const isReceptionist = rStr.includes('reception') || rStr.includes('resep') || rStr.includes('front desk');
              onAdd({ 
                ...form, 
                loginEmail: isReceptionist ? form.loginEmail : '',
                loginPassword: isReceptionist ? form.loginPassword : '',
                id: Date.now(), 
                status: 'off-duty', 
                joined: new Date().toISOString().slice(0, 10), 
                avatar: form.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(), 
                salary: +form.salary || 0 
              }); 
              onClose(); 
            } }} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>Add Employee</button>
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

const EmployeesPage = ({ role, hotelDetails, plan }) => {
  const [employees, setEmployees] = useState(() => {
    try {
      const stored = localStorage.getItem(`stayos_employees_${hotelDetails?.id || 'default'}`);
      const parsed = stored ? JSON.parse(stored) : EMPLOYEES;
      return parsed.length > 0 ? parsed : EMPLOYEES;
    } catch {
      return EMPLOYEES;
    }
  });
  const [apiSynced, setApiSynced] = useState(false);

  // Load from backend API on mount; fall back to localStorage
  useEffect(() => {
    apiGetEmployees()
      .then(res => {
        const list = (res.data || []).map(mapBEtoFE);
        if (list.length > 0) {
          setEmployees(list);
          localStorage.setItem(`stayos_employees_${hotelDetails?.id || 'default'}`, JSON.stringify(list));
        }
      })
      .catch(() => {
        // API unavailable — keep localStorage data
      })
      .finally(() => setApiSynced(true));
  }, [hotelDetails?.id]);
  const [activeTab, setActiveTab] = useState('staff');
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterDept, setFilterDept] = useState('all');

  const depts = ['all', ...new Set(employees.map(e => e.dept))];
  const filtered = filterDept === 'all' ? employees : employees.filter(e => e.dept === filterDept);

  const stats = [
    { label: 'Total Staff', value: employees.length, color: 'var(--gold)' },
    { label: 'On Duty', value: employees.filter(e => e.status === 'on-duty').length, color: 'var(--green)' },
    { label: 'On Leave', value: employees.filter(e => e.status === 'leave').length, color: 'var(--amber)' },
    { label: 'Off Duty', value: employees.filter(e => e.status === 'off-duty').length, color: 'var(--text3)' },
  ];

  const handleAddEmployee = (newEmp) => {
    if (plan === 'starter' && employees.length >= 1) {
      alert("Starter Plan Limit Reached! Your plan allows a maximum of 1 staff account. Please upgrade to a higher plan to add more staff.");
      return;
    }

    // Try backend API first
    apiCreateEmployee(mapFEtoBE(newEmp))
      .then(res => {
        const created = mapBEtoFE(res.data);
        const nextList = [...employees, created];
        setEmployees(nextList);
        localStorage.setItem(`stayos_employees_${hotelDetails?.id || 'default'}`, JSON.stringify(nextList));
      })
      .catch(() => {
        // API unavailable — save to localStorage only
        const localEmp = { ...newEmp, id: Date.now(), status: 'off-duty', joined: new Date().toISOString().slice(0, 10), avatar: newEmp.avatar || newEmp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(), salary: +newEmp.salary || 0 };
        const nextList = [...employees, localEmp];
        setEmployees(nextList);
        localStorage.setItem(`stayos_employees_${hotelDetails?.id || 'default'}`, JSON.stringify(nextList));
      });


  };

  const handleSaveEmployee = (updatedEmp) => {
    // Try backend API first
    apiUpdateEmployee(updatedEmp.id, mapFEtoBE(updatedEmp))
      .then(res => {
        const saved = mapBEtoFE(res.data);
        const nextList = employees.map(e => e.id === updatedEmp.id ? saved : e);
        setEmployees(nextList);
        localStorage.setItem(`stayos_employees_${hotelDetails?.id || 'default'}`, JSON.stringify(nextList));
      })
      .catch(() => {
        // API unavailable — save to localStorage only
        const nextList = employees.map(e => e.id === updatedEmp.id ? updatedEmp : e);
        setEmployees(nextList);
        localStorage.setItem(`stayos_employees_${hotelDetails?.id || 'default'}`, JSON.stringify(nextList));
      });
  };

  const handleDeleteEmployee = (emp) => {
    apiDeleteEmployee(emp.id)
      .then(() => {
        const nextList = employees.filter(e => e.id !== emp.id);
        setEmployees(nextList);
        localStorage.setItem(`stayos_employees_${hotelDetails?.id || 'default'}`, JSON.stringify(nextList));
        setDeleteConfirm(null);
      })
      .catch(() => {
        const nextList = employees.filter(e => e.id !== emp.id);
        setEmployees(nextList);
        localStorage.setItem(`stayos_employees_${hotelDetails?.id || 'default'}`, JSON.stringify(nextList));
        setDeleteConfirm(null);
      });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {selected && <EmployeeModal employee={selected} onClose={() => setSelected(null)} />}
      {showAdd && <AddEmployeeModal onClose={() => setShowAdd(false)} onAdd={handleAddEmployee} />}
      {editEmployee && <EditEmployeeModal employee={editEmployee} onClose={() => setEditEmployee(null)} onSave={handleSaveEmployee} />}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px', padding: '24px' }}>
            <h3 style={{ fontFamily: 'Poppins,sans-serif', margin: '0 0 12px' }}>Delete Employee</h3>
            <p style={{ fontSize: '14px', color: 'var(--text2)', margin: '0 0 20px' }}>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>Cancel</button>
              <button onClick={() => handleDeleteEmployee(deleteConfirm)} style={{ padding: '10px 24px', background: 'var(--rose)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

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
          {employees.length === 0 ? (
            <div style={{
              background: 'var(--card)', border: '2px dashed var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '48px 32px',
              textAlign: 'center', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '16px',
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px',
              }}>
                👤
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'Poppins, sans-serif', color: 'var(--text)', marginBottom: '6px' }}>
                  No Staff Members Yet
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text3)', maxWidth: '400px', lineHeight: '1.6' }}>
                  {plan === 'starter'
                    ? 'Your Starter plan includes 1 receptionist account. Add a receptionist to handle bookings and check-ins.'
                    : 'Add employees to manage your hotel staff, shifts, and attendance.'}
                </div>
              </div>
              <button
                onClick={() => setShowAdd(true)}
                style={{
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #C9A84C, #8A6F2E)',
                  border: 'none', borderRadius: '10px', color: '#fff',
                  cursor: 'pointer', fontSize: '14px', fontWeight: '700',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 4px 14px rgba(201,168,76,0.35)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(201,168,76,0.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(201,168,76,0.35)'; }}
              >
                <Icon name="plus" size={16} color="#fff" />
                {plan === 'starter' ? 'Add Receptionist' : 'Add Employee'}
              </button>
            </div>
          ) : (
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
                  <button onClick={() => setDeleteConfirm(e)} style={{ padding: '7px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--rose)', cursor: 'pointer', transition: 'all 0.15s' }} onMouseEnter={ev => { ev.currentTarget.style.borderColor = 'var(--rose)'; }} onMouseLeave={ev => { ev.currentTarget.style.borderColor = 'var(--border)'; }}>
                    <Icon name="trash" size={13} color="currentColor" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {activeTab === 'attendance' && <AttendancePage employees={employees} hotelDetails={hotelDetails} />}
    </div>
  );
};

export default EmployeesPage;
