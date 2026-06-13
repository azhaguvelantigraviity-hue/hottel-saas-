import React, { useState } from 'react';

import { updatePassword } from '../services/authService';

const inputStyle = {
  width: '100%', padding: '10px 12px', background: 'var(--surface)',
  border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text)',
  fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
};
const labelStyle = { fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' };

const getPlan = (planKey) => ({ id: planKey, name: planKey, price: 0, accent: '#6B7280', features: [], missing: [] });

const SettingsPage = ({ role, plan, onNav }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'success'|'error', text }
  const [propMsg, setPropMsg] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [profile, setProfile] = useState({
    name: '', address: '', city: '', country: '', phone: '', email: '', website: '', logo: '', tagline: ''
  });

  React.useEffect(() => {
    import('../services/api').then(api => {
      const user = api.getUser();
      if (user && user.hotel && typeof user.hotel === 'object') {
        setProfile({
          name: user.hotel.name || '',
          address: user.hotel.address?.street || '',
          city: user.hotel.address?.city || '',
          country: user.hotel.address?.country || '',
          phone: user.hotel.phone || '',
          email: user.hotel.email || '',
          website: user.hotel.website || '',
          logo: user.hotel.logo || '',
          tagline: user.hotel.tagline || ''
        });
      }
    });
  }, []);

  const handleSaveProfile = async () => {
    setPropMsg(null);
    setLoading(true);
    try {
      const api = await import('../services/api').then(m => m.default || m);
      
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('address', profile.address);
      formData.append('city', profile.city);
      formData.append('country', profile.country);
      formData.append('phone', profile.phone);
      formData.append('email', profile.email);
      formData.append('website', profile.website);
      if (profile.tagline) formData.append('tagline', profile.tagline);
      
      if (logoFile) {
        formData.append('logoFile', logoFile);
      } else if (profile.logo) {
        formData.append('logo', profile.logo);
      }
      
      const res = await api.putForm('/hotel/profile', formData);
      
      // Update local storage so the rest of the app sees the updated hotel data
      if (res.data) {
        const currentUser = api.getUser();
        if (currentUser) {
          currentUser.hotel = res.data;
          api.setUser(currentUser);
        }
      }
      
      setPropMsg({ type: 'success', text: 'Property settings updated!' });
    } catch (e) {
      setPropMsg({ type: 'error', text: e.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

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

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiateCheckout = async (selectedPlan) => {
    setLoading(true);
    const res = await loadRazorpay();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      const api = await import('../services/api').then(m => m.default || m);
      const orderRes = await api.post('/hotel/subscription/create-order', { plan: selectedPlan });
      const orderData = orderRes.data?.data || orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy_key',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'StayOS',
        description: `Upgrade to ${selectedPlan} plan`,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            await api.post('/hotel/subscription/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: selectedPlan
            });
            alert('Payment successful! Your plan has been upgraded.');
            setShowUpgradeModal(false);
            window.location.reload();
          } catch (err) {
            console.error(err);
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: 'Hotel Administrator',
          email: 'admin@hotel.com',
        },
        theme: { color: '#C9A84C' }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      alert('Failed to initiate checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px)', overflowY: 'auto', flex: 1, position: 'relative' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
        {role === 'hotel' && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)', gridColumn: 'span 2' }}>
            <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Current Subscription</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ padding: '16px 24px', background: `${getPlan(plan || 'starter').accent}12`, border: `1px solid ${getPlan(plan || 'starter').accent}30`, borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>PLAN</div>
                <div style={{ fontSize: '22px', fontWeight: '700', fontFamily: 'Poppins,sans-serif', color: getPlan(plan || 'starter').accent, textTransform: 'capitalize' }}>
                  {plan}
                </div>
              </div>
              <div style={{ padding: '16px 24px', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>MONTHLY</div>
                <div style={{ fontSize: '22px', fontWeight: '700', fontFamily: 'DM Mono,monospace' }}>₹{getPlan(plan || 'starter').price}</div>
              </div>
              <div style={{ padding: '16px 24px', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>NEXT RENEWAL</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>30 Days</div>
              </div>
              {plan !== 'enterprise' && (
                <button 
                  onClick={() => setShowUpgradeModal(true)}
                  style={{ padding: '14px 24px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                  Upgrade Plan ↗
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Property Settings (Only for Hotel role) */}
        {role !== 'admin' && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)' }}>
            <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Property Settings</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div><label style={labelStyle}>HOTEL NAME</label><input style={inputStyle} value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} /></div>
              <div><label style={labelStyle}>ADDRESS</label><input style={inputStyle} value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} /></div>
              <div><label style={labelStyle}>CITY</label><input style={inputStyle} value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} /></div>
              <div><label style={labelStyle}>COUNTRY</label><input style={inputStyle} value={profile.country} onChange={e => setProfile({...profile, country: e.target.value})} /></div>
              <div><label style={labelStyle}>PHONE</label><input style={inputStyle} value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} /></div>
              <div><label style={labelStyle}>EMAIL</label><input style={inputStyle} value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} /></div>
              <div><label style={labelStyle}>WEBSITE</label><input style={inputStyle} value={profile.website} onChange={e => setProfile({...profile, website: e.target.value})} /></div>
              
              {propMsg && (
                <div style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, background: propMsg.type === 'success' ? 'rgba(52,211,153,0.12)' : 'rgba(239,68,68,0.12)', color: propMsg.type === 'success' ? 'var(--green)' : 'var(--rose)', border: `1px solid ${propMsg.type === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                  {propMsg.text}
                </div>
              )}
              
              <button onClick={handleSaveProfile} disabled={loading} style={{ padding: '10px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '7px', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif', marginTop: '4px', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
        
        {/* Invoice Settings (Only for Hotel role) */}
        {role !== 'admin' && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)' }}>
            <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Invoice Settings</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={labelStyle}>HOTEL LOGO</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="file" accept="image/*" onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      setLogoFile(file);
                      setProfile({...profile, logo: URL.createObjectURL(file)});
                    }
                  }} style={{ fontSize: '12px' }} />
                </div>
              </div>
              <div><label style={labelStyle}>TAGLINE</label><input style={inputStyle} value={profile.tagline} onChange={e => setProfile({...profile, tagline: e.target.value})} placeholder="Where Luxury Meets Comfort" /></div>
              
              {profile.logo && (
                <div style={{ marginTop: '8px', padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', justifyContent: 'center' }}>
                  <img src={profile.logo} alt="Hotel Logo Preview" style={{ maxHeight: '60px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              )}
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                These settings will be used to customize your PDF invoices generated during guest checkout. Make sure your Hotel Name and Address are also correct in the Property Settings.
              </div>
              <button onClick={handleSaveProfile} disabled={loading} style={{ padding: '10px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '7px', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif', marginTop: '4px', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Saving...' : 'Save Invoice Settings'}
              </button>
            </div>
          </div>
        )}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'clamp(12px, 3vw, 24px)' }}>
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

      {showUpgradeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--card)', padding: 'clamp(12px, 3vw, 24px)', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid var(--border)' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: 'var(--text)' }}>Upgrade Subscription</h2>
            <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '24px' }}>Select a plan to upgrade to. Payment will be processed securely via Razorpay.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(plan === 'starter' ? ['professional', 'enterprise'] : ['enterprise']).map(p => (
                <div key={p} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '600', textTransform: 'capitalize', color: getPlan(p).accent }}>{p}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text3)' }}>₹{getPlan(p).price} / month</div>
                  </div>
                  <button 
                    onClick={() => initiateCheckout(p)}
                    disabled={loading}
                    style={{ padding: '8px 16px', background: 'var(--card)', border: `1px solid ${getPlan(p).accent}`, color: getPlan(p).accent, borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '13px' }}>
                    {loading ? 'Processing...' : 'Select'}
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button 
                onClick={() => setShowUpgradeModal(false)}
                disabled={loading}
                style={{ padding: '8px 16px', background: 'transparent', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
