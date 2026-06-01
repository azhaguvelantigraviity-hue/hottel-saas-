import React, { useState } from 'react';
import { PLANS } from '../data/mockData';
import { updatePassword } from '../services/authService';

const inputStyle = {
  width: '100%', padding: '10px 12px', background: 'var(--surface)',
  border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text)',
  fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
};
const labelStyle = { fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' };

const SettingsPage = ({ role, plan, onNav }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'success'|'error', text }

  const handleSavePassword = async () => {
    setMsg(null);
    if (!currentPassword || !newPassword) { setMsg({ type: 'error', text: 'Current and new passwords are required' }); return; }
    if (newPassword.length < 6) { setMsg({ type: 'error', text: 'New password must be at least 6 characters' }); return; }
    if (newPassword !== confirmPassword) { setMsg({ type: 'error', text: 'New passwords do not match' }); return; }
    setLoading(true);
    try {
      const res = await updatePassword(currentPassword, newPassword);
      const data = res.data || res;
      if (data && data.token) {
        const { setToken, setUser } = await import('../services/api');
        setToken(data.token);
        setUser(data.user);
      }
      setMsg({ type: 'success', text: 'Password updated successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {role === 'hotel' && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', gridColumn: 'span 2' }}>
            <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Current Subscription</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ padding: '16px 24px', background: `${PLANS[plan || 'starter'].accent}12`, border: `1px solid ${PLANS[plan || 'starter'].accent}30`, borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>PLAN</div>
                <div style={{ fontSize: '22px', fontWeight: '700', fontFamily: 'Poppins,sans-serif', color: PLANS[plan || 'starter'].accent, textTransform: 'capitalize' }}>
                  {plan}
                </div>
              </div>
              <div style={{ padding: '16px 24px', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>MONTHLY</div>
                <div style={{ fontSize: '22px', fontWeight: '700', fontFamily: 'DM Mono,monospace' }}>₹{PLANS[plan || 'starter'].price}</div>
              </div>
              <div style={{ padding: '16px 24px', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>NEXT RENEWAL</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>-</div>
              </div>
              {plan !== 'enterprise' && (
                <button style={{ padding: '14px 24px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                  Upgrade Plan ↗
                </button>
              )}
            </div>
          </div>
        )}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Property Settings</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Hotel Name', 'Address', 'City', 'Country', 'Phone', 'Email', 'Website'].map((f) => (
              <div key={f}>
                <label style={labelStyle}>{f.toUpperCase()}</label>
                <input placeholder={f} style={inputStyle} />
              </div>
            ))}
            <button style={{ padding: '10px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '7px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif', marginTop: '4px' }}>
              Save Changes
            </button>
          </div>
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Account Security</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={labelStyle}>CURRENT PASSWORD</label>
              <input type="password" placeholder="Current Password" value={currentPassword} onChange={e => { setCurrentPassword(e.target.value); setMsg(null); }} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>NEW PASSWORD</label>
              <input type="password" placeholder="New Password" value={newPassword} onChange={e => { setNewPassword(e.target.value); setMsg(null); }} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>CONFIRM NEW PASSWORD</label>
              <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setMsg(null); }} style={inputStyle} />
            </div>
            {msg && (
              <div style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, background: msg.type === 'success' ? 'rgba(52,211,153,0.12)' : 'rgba(239,68,68,0.12)', color: msg.type === 'success' ? 'var(--green)' : 'var(--rose)', border: `1px solid ${msg.type === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                {msg.text}
              </div>
            )}
            <button onClick={handleSavePassword} disabled={loading} style={{ padding: '10px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '7px', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif', marginTop: '4px', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
