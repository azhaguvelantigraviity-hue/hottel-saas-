import React, { useState, useEffect } from 'react';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import { getRoles, createRole, updateRole, deleteRole } from '../services/adminService';

const PERMISSIONS_CONFIG = [
  { category: 'Core Operations', perms: [
    { id: 'dashboard', label: 'View Dashboard' },
    { id: 'rooms', label: 'Manage Rooms' },
    { id: 'bookings', label: 'Manage Bookings' },
    { id: 'checkin', label: 'Smart Check-In' }
  ]},
  { category: 'Financials', perms: [
    { id: 'billing', label: 'Manage Billing' },
    { id: 'revenue', label: 'View Revenue' },
    { id: 'payroll', label: 'Process Payroll' }
  ]},
  { category: 'Guest Services', perms: [
    { id: 'guests', label: 'Guest CRM' },
    { id: 'complaints', label: 'Manage Complaints' },
    { id: 'restaurant', label: 'Restaurant POS' },
    { id: 'housekeeping', label: 'Housekeeping' }
  ]},
  { category: 'Management', perms: [
    { id: 'employees', label: 'Manage Employees' },
    { id: 'attendance', label: 'View Attendance' },
    { id: 'analytics', label: 'View Analytics' },
    { id: 'settings', label: 'System Settings' }
  ]}
];

const AdminRoles = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await getRoles();
      if (res.data) {
        setRoles(res.data);
        if (res.data.length > 0 && !selectedRole) {
          setSelectedRole(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch roles', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      const res = await createRole({ ...newRoleForm, permissions: [] });
      setIsModalOpen(false);
      setNewRoleForm({ name: '', description: '' });
      fetchRoles();
      if (res.data) setSelectedRole(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create role');
    }
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm('Are you sure you want to delete this custom role?')) return;
    try {
      await deleteRole(id);
      setSelectedRole(null);
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete role');
    }
  };

  const togglePermission = async (permId) => {
    if (!selectedRole || selectedRole.isSystem) return;
    
    const currentPerms = selectedRole.permissions || [];
    const hasPerm = currentPerms.includes(permId);
    
    const newPerms = hasPerm 
      ? currentPerms.filter(p => p !== permId)
      : [...currentPerms, permId];

    try {
      const updated = { ...selectedRole, permissions: newPerms };
      setSelectedRole(updated);
      setRoles(roles.map(r => r._id === updated._id ? updated : r));
      await updateRole(updated._id, { permissions: newPerms });
    } catch (err) {
      console.error('Failed to update permissions', err);
      // Revert on failure
      fetchRoles();
    }
  };

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px)', display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>Roles & Permissions</h2>
          <div style={{ fontSize: '13px', color: 'var(--text3)' }}>Define access control and operational capabilities.</div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            background: 'linear-gradient(135deg, var(--gold), #8A6F2E)',
            border: 'none', borderRadius: '8px', padding: '10px 16px',
            color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <span>+ Create Custom Role</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0 }}>
        {/* Roles List Sidebar */}
        <div style={{ width: '280px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', overflowY: 'auto' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontSize: '12px', fontWeight: '600', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            System & Custom Roles
          </div>
          <div>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
            ) : roles.map(role => (
              <div 
                key={role._id}
                onClick={() => setSelectedRole(role)}
                style={{ 
                  padding: '16px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                  background: selectedRole?._id === role._id ? 'var(--surface)' : 'transparent',
                  borderLeft: selectedRole?._id === role._id ? '3px solid var(--gold)' : '3px solid transparent',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <div style={{ fontWeight: '600', color: selectedRole?._id === role._id ? 'var(--gold)' : 'var(--text)', fontSize: '14px' }}>
                    {role.name}
                  </div>
                  {role.isSystem && <Badge color="gray">System</Badge>}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text3)', lineHeight: 1.4 }}>
                  {role.description || 'No description provided'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions Matrix Content */}
        <div style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedRole ? (
            <>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>
                    {selectedRole.name} Permissions
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                    {selectedRole.isSystem 
                      ? 'System roles are locked and cannot be edited or deleted.' 
                      : 'Toggle the switches below to update permissions instantly.'}
                  </div>
                </div>
                {!selectedRole.isSystem && (
                  <button onClick={() => handleDeleteRole(selectedRole._id)} style={{ background: 'transparent', border: '1px solid var(--rose)', borderRadius: '6px', color: 'var(--rose)', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>
                    Delete Role
                  </button>
                )}
              </div>
              
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                  {PERMISSIONS_CONFIG.map((group, idx) => (
                    <div key={idx} style={{ background: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', fontSize: '12px', fontWeight: '600', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {group.category}
                      </div>
                      <div>
                        {group.perms.map((perm, pIdx) => {
                          const hasPerm = (selectedRole.permissions || []).includes(perm.id);
                          return (
                            <div key={perm.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: pIdx !== group.perms.length - 1 ? '1px solid var(--border)' : 'none' }}>
                              <span style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: '500' }}>{perm.label}</span>
                              <div 
                                onClick={() => togglePermission(perm.id)}
                                style={{
                                  width: '36px', height: '20px', borderRadius: '10px',
                                  background: hasPerm ? 'var(--gold)' : 'var(--border)',
                                  position: 'relative', cursor: selectedRole.isSystem ? 'not-allowed' : 'pointer',
                                  opacity: selectedRole.isSystem ? 0.6 : 1,
                                  transition: 'background 0.3s'
                                }}
                              >
                                <div style={{
                                  position: 'absolute', top: '2px', left: hasPerm ? '18px' : '2px',
                                  width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'left 0.3s'
                                }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
              Select a role to view permissions
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--card)', width: '100%', maxWidth: '400px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>Create Custom Role</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '20px' }}>×</button>
            </div>
            
            <form onSubmit={handleCreateRole} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role Name *</label>
                <input required value={newRoleForm.name} onChange={e => setNewRoleForm({...newRoleForm, name: e.target.value})} placeholder="e.g. Front Desk Staff" style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', color: 'var(--text)', boxSizing: 'border-box' }} />
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                <textarea value={newRoleForm.description} onChange={e => setNewRoleForm({...newRoleForm, description: e.target.value})} placeholder="Brief description of responsibilities..." style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', color: 'var(--text)', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 20px', color: 'var(--text2)', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                <button type="submit" style={{ background: 'linear-gradient(135deg, var(--gold), #8A6F2E)', border: 'none', borderRadius: '8px', padding: '10px 24px', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoles;
