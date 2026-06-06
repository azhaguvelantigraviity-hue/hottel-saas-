import React, { useState, useEffect } from 'react';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import { getAllUsers, createUser, updateUser, deleteUser, getAllHotels } from '../services/adminService';

const thStyle = { padding: '16px 20px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', background: 'var(--surface)' };
const tdStyle = { padding: '16px 20px', fontSize: '13px', color: 'var(--text2)', borderBottom: '1px solid var(--border)' };

const AdminAccounts = () => {
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'hotel_admin', hotel: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, hotelsRes] = await Promise.all([
        getAllUsers(),
        getAllHotels()
      ]);
      if (usersRes.data) setUsers(usersRes.data);
      if (hotelsRes.data) setHotels(hotelsRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setForm({
        name: user.name,
        email: user.email,
        password: '', // Leave blank for edit
        role: user.role,
        hotel: user.hotel ? user.hotel._id : ''
      });
    } else {
      setEditingUser(null);
      setForm({ name: '', email: '', password: '', role: 'hotel_admin', hotel: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (payload.hotel === '') delete payload.hotel;
      if (editingUser) {
        if (!payload.password) delete payload.password; // don't update if blank
        await updateUser(editingUser._id, payload);
      } else {
        await createUser(payload);
      }
      closeModal();
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to save account');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      await deleteUser(id);
      fetchData();
    } catch (err) {
      alert('Failed to delete account');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await updateUser(user._id, { isActive: !user.isActive });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px)', overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>Accounts & Owners</h2>
          <div style={{ fontSize: '13px', color: 'var(--text3)' }}>Manage platform access and hotel ownership.</div>
        </div>
        <button
          onClick={() => openModal()}
          style={{
            background: 'linear-gradient(135deg, var(--gold), #8A6F2E)',
            border: 'none', borderRadius: '8px', padding: '10px 16px',
            color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <span>+ Add Account</span>
        </button>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>User Details</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Assigned Hotel</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} style={{ transition: 'background 0.15s' }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '2px' }}>{user.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{user.email}</div>
                  </td>
                  <td style={tdStyle}>
                    <Badge color={user.role === 'hotel_admin' ? 'purple' : 'blue'}>
                      {user.role.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </td>
                  <td style={tdStyle}>
                    {user.hotel ? (
                      <span style={{ fontWeight: '500', color: 'var(--text2)' }}>{user.hotel.name}</span>
                    ) : (
                      <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>Unassigned</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: user.isActive ? 'var(--green)' : 'var(--rose)' }} />
                      <span style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: '500' }}>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <button onClick={() => openModal(user)} style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '6px', marginRight: '4px' }} title="Edit">
                      <Icon name="settings" size={16} />
                    </button>
                    <button onClick={() => handleToggleStatus(user)} style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '6px', marginRight: '4px' }} title={user.isActive ? 'Suspend' : 'Activate'}>
                      <Icon name={user.isActive ? 'logout' : 'check'} size={16} />
                    </button>
                    <button onClick={() => handleDelete(user._id)} style={{ background: 'transparent', border: 'none', color: 'var(--rose)', cursor: 'pointer', padding: '6px' }} title="Delete">
                      <Icon name="logout" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>No accounts found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--card)', width: '100%', maxWidth: '480px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>
                {editingUser ? 'Edit Account' : 'Create New Account'}
              </h3>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '20px' }}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', color: 'var(--text)', boxSizing: 'border-box' }} />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address *</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', color: 'var(--text)', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
                </label>
                <input required={!editingUser} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', color: 'var(--text)', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', color: 'var(--text)', boxSizing: 'border-box' }}>
                    <option value="hotel_admin">Hotel Owner / Admin</option>
                    <option value="hotel_staff">Hotel Staff</option>
                  </select>
                </div>
                
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assign Hotel</label>
                  <select value={form.hotel} onChange={e => setForm({...form, hotel: e.target.value})} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', color: 'var(--text)', boxSizing: 'border-box' }}>
                    <option value="">-- No Hotel --</option>
                    {hotels.map(h => (
                      <option key={h._id} value={h._id}>{h.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <button type="button" onClick={closeModal} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 20px', color: 'var(--text2)', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                <button type="submit" style={{ background: 'linear-gradient(135deg, var(--gold), #8A6F2E)', border: 'none', borderRadius: '8px', padding: '10px 24px', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                  {editingUser ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccounts;
