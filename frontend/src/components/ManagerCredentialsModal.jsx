import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const ManagerCredentialsModal = ({ registration, onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    mName: '',
    mUsername: '',
    mEmail: '',
    mPhone: '',
    mPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (registration) {
      setFormData({
        mName: registration.ownerName || '',
        mUsername: registration.email || '',
        mEmail: registration.email || '',
        mPhone: registration.phone || '',
        mPassword: '',
        confirmPassword: ''
      });
    }
  }, [registration]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.mPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (formData.mPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await onSuccess(registration._id, {
        mName: formData.mName,
        mUsername: formData.mUsername,
        mEmail: formData.mEmail,
        mPhone: formData.mPhone,
        mPassword: formData.mPassword
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to approve registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--card)', width: '500px', maxWidth: '95vw', borderRadius: '12px', padding: '2rem', position: 'relative', border: '1px solid var(--border)', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text2)' }}
        >
          <Icon name="x" size={24} />
        </button>
        
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text)' }}>Create Manager Credentials</h2>
        <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Set up the admin account for {registration?.hotelName}</p>
        
        {error && (
          <div style={{ padding: '0.75rem', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: 'var(--rose)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '0.25rem' }}>Manager Name</label>
            <input required value={formData.mName} onChange={e => setFormData({...formData, mName: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '0.25rem' }}>Email</label>
              <input required type="email" value={formData.mEmail} onChange={e => setFormData({...formData, mEmail: e.target.value, mUsername: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '0.25rem' }}>Phone</label>
              <input required value={formData.mPhone} onChange={e => setFormData({...formData, mPhone: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '0.25rem' }}>Password</label>
              <input required type="password" value={formData.mPassword} onChange={e => setFormData({...formData, mPassword: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '0.25rem' }}>Confirm Password</label>
              <input required type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.75rem', background: 'var(--teal)', border: 'none', color: '#fff', borderRadius: '8px', cursor: loading ? 'wait' : 'pointer', fontWeight: '600' }}>
              {loading ? 'Approving...' : 'Approve Hotel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManagerCredentialsModal;
