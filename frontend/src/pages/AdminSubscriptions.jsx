import React, { useState } from 'react';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import { getPlan } from '../data/mockData';

// ── Helpers ───────────────────────────────────────────────────
const PLAN_KEYS = ['starter', 'professional', 'enterprise'];

const DEFAULT_PLANS = {
  starter: {
    id: 'starter', name: 'Starter', accent: '#6B7280',
    price: 4999,
    features: ['Dashboard','Room Management','Bookings','Billing','Notifications','Reports','Settings'],
    missing: ['Guest CRM','Loyalty Program','Restaurant POS','Revenue AI','Smart Check-In','IoT & Door Locks'],
  },
  professional: {
    id: 'professional', name: 'Professional', accent: '#14B8A6',
    price: 12999,
    features: ['Everything in Starter','Guest CRM','Loyalty Program','Restaurant POS','Housekeeping','Employee Management','Channel Manager','Analytics Dashboard'],
    missing: ['Revenue AI','Smart Check-In','Events & Halls','IoT & Door Locks'],
  },
  enterprise: {
    id: 'enterprise', name: 'Enterprise', accent: '#D97706',
    price: 24999,
    features: ['Everything in Professional','Revenue AI','Smart Check-In','Travel Desk','Events & Halls','IoT & Door Locks','Security & CCTV','AI Chatbot'],
    missing: [],
  },
};

const loadPlans = () => {
  try {
    const saved = localStorage.getItem('stayos_plan_prices');
    if (saved) {
      const prices = JSON.parse(saved);
      return {
        starter:      { ...DEFAULT_PLANS.starter,      price: prices.starter      ?? DEFAULT_PLANS.starter.price },
        professional: { ...DEFAULT_PLANS.professional, price: prices.professional ?? DEFAULT_PLANS.professional.price },
        enterprise:   { ...DEFAULT_PLANS.enterprise,   price: prices.enterprise   ?? DEFAULT_PLANS.enterprise.price },
      };
    }
  } catch (_) {}
  return DEFAULT_PLANS;
};

const savePlanPrices = (plans) => {
  try {
    localStorage.setItem('stayos_plan_prices', JSON.stringify({
      starter:      plans.starter.price,
      professional: plans.professional.price,
      enterprise:   plans.enterprise.price,
    }));
  } catch (_) {}
};

const loadHotels = () => {
  try {
    const data = localStorage.getItem('stayos_hotels');
    return data ? JSON.parse(data) : [];
  } catch (e) { console.error('Failed to load hotels:', e); return []; }
};

const saveHotels = (hotels) => {
  try {
    localStorage.setItem('stayos_hotels', JSON.stringify(hotels));
    const saved = JSON.parse(localStorage.getItem('stayos_hotels'));
    if (!saved || saved.length !== hotels.length) {
      console.error('Hotel data verification failed in AdminSubscriptions');
    }
  } catch (e) {
    console.error('Failed to save hotels in AdminSubscriptions:', e);
  }
};

const inp = {
  width: '100%', padding: '10px 12px', background: 'var(--bg)',
  border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)',
  fontSize: '13px', outline: 'none', fontFamily: 'Inter, sans-serif',
};
const lbl = {
  fontSize: '11px', color: 'var(--text3)', fontWeight: '600',
  letterSpacing: '0.06em', display: 'block', marginBottom: '5px',
};

// ── Edit Plan Price Modal ─────────────────────────────────────
const EditPlanModal = ({ plan, onClose, onSave }) => {
  const [price, setPrice] = useState(String(plan.price));
  const [features, setFeatures] = useState(plan.features.join('\n'));

  const handleSave = () => {
    const p = parseInt(price, 10);
    if (isNaN(p) || p < 0) return;
    onSave({ ...plan, price: p, features: features.split('\n').map(f => f.trim()).filter(Boolean) });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>Edit {plan.name} Plan</h2>
            <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>Update pricing and features</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <Icon name="x" size={20} color="var(--text3)" />
          </button>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={lbl}>MONTHLY PRICE (₹)</label>
            <input
              type="number" min="0" style={inp} value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="e.g. 4999"
            />
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
              This price will be shown to hotels on the landing page and billing
            </div>
          </div>
          <div>
            <label style={lbl}>FEATURES (one per line)</label>
            <textarea
              style={{ ...inp, resize: 'vertical', minHeight: '140px', lineHeight: '1.6' }}
              value={features}
              onChange={e => setFeatures(e.target.value)}
            />
          </div>
          <div style={{ padding: '12px', background: `${plan.accent}10`, border: `1px solid ${plan.accent}30`, borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: plan.accent, fontWeight: '600', marginBottom: '4px' }}>Preview</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: plan.accent, fontFamily: 'DM Mono,monospace' }}>
              ₹{parseInt(price || '0', 10).toLocaleString()}<span style={{ fontSize: '13px', fontWeight: '400', color: 'var(--text3)' }}>/mo</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontSize: '13px' }}>
              Cancel
            </button>
            <button onClick={handleSave} style={{ padding: '10px 24px', background: `linear-gradient(135deg, ${plan.accent}, ${plan.accent}cc)`, border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Manage Hotel Subscription Modal ──────────────────────────
const ManageSubModal = ({ hotel, plans, onClose, onSave }) => {
  const [form, setForm] = useState({
    plan:   hotel.plan   || 'starter',
    status: hotel.status || 'active',
    renewal: hotel.renewal || '',
    notes: hotel.notes || '',
  });

  const handleSave = () => {
    onSave({ ...hotel, ...form });
    onClose();
  };

  const selectedPlan = plans[form.plan] || DEFAULT_PLANS[form.plan];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', width: '100%', maxWidth: '500px' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>Manage Subscription</h2>
            <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>{hotel.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Icon name="x" size={20} color="var(--text3)" />
          </button>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={lbl}>SUBSCRIPTION PLAN</label>
            <select style={inp} value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}>
              {PLAN_KEYS.map(k => (
                <option key={k} value={k}>
                  {plans[k]?.name || DEFAULT_PLANS[k].name} — ₹{(plans[k]?.price || DEFAULT_PLANS[k].price).toLocaleString()}/mo
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={lbl}>STATUS</label>
            <select style={inp} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              {['active', 'trial', 'suspended', 'cancelled'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={lbl}>RENEWAL DATE</label>
            <input type="date" style={inp} value={form.renewal} onChange={e => setForm(p => ({ ...p, renewal: e.target.value }))} />
          </div>
          <div>
            <label style={lbl}>ADMIN NOTES</label>
            <textarea style={{ ...inp, resize: 'vertical', minHeight: '60px' }} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Internal notes..." />
          </div>

          {/* Price preview */}
          <div style={{ padding: '12px', background: `${selectedPlan?.accent || '#6B7280'}10`, border: `1px solid ${selectedPlan?.accent || '#6B7280'}30`, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Monthly charge</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: selectedPlan?.accent || '#6B7280', fontFamily: 'DM Mono,monospace' }}>
                ₹{(selectedPlan?.price || 0).toLocaleString()}
              </div>
            </div>
            <Badge color={form.plan === 'enterprise' ? 'gold' : form.plan === 'professional' ? 'teal' : 'gray'}>
              {form.plan}
            </Badge>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontSize: '13px' }}>
              Cancel
            </button>
            <button onClick={handleSave} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
              Update Subscription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
const AdminSubscriptions = () => {
  const [plans, setPlans]       = useState(loadPlans);
  const [hotels, setHotels]     = useState(loadHotels);
  const [editPlan, setEditPlan] = useState(null);
  const [manageSub, setManageSub] = useState(null);
  const [filterPlan, setFilterPlan] = useState('all');
  const [saved, setSaved]       = useState(false);

  const handleSavePlan = (updated) => {
    const next = { ...plans, [updated.id]: updated };
    setPlans(next);
    savePlanPrices(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleUpdateSub = (updated) => {
    const next = hotels.map(h => h.id === updated.id ? updated : h);
    setHotels(next);
    saveHotels(next);
  };

  const filteredHotels = filterPlan === 'all' ? hotels : hotels.filter(h => h.plan === filterPlan || h.status === filterPlan);

  // Stats per plan
  const planStats = PLAN_KEYS.reduce((acc, k) => {
    const planHotels = hotels.filter(h => h.plan === k && h.status === 'active');
    acc[k] = { count: planHotels.length, revenue: planHotels.length * (plans[k]?.price || 0) };
    return acc;
  }, {});

  const totalMRR = PLAN_KEYS.reduce((s, k) => s + planStats[k].revenue, 0);

  return (
    <div style={{ padding: '28px 32px', overflowY: 'auto', flex: 1, background: 'var(--bg)' }}>
      {editPlan  && <EditPlanModal   plan={editPlan}  onClose={() => setEditPlan(null)}  onSave={handleSavePlan} />}
      {manageSub && <ManageSubModal  hotel={manageSub} plans={plans} onClose={() => setManageSub(null)} onSave={handleUpdateSub} />}

      {/* Save toast */}
      {saved && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 2000, background: 'var(--green)', color: '#fff', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="check" size={16} color="#fff" /> Plan prices saved successfully
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)', marginBottom: '2px' }}>Subscription Management</h2>
          <p style={{ fontSize: '13px', color: 'var(--text3)' }}>Manage plan pricing and hotel subscriptions</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Total MRR</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--green)', fontFamily: 'DM Mono,monospace' }}>
            ₹{totalMRR.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Plan Cards — admin editable */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {PLAN_KEYS.map(k => {
          const plan = plans[k];
          return (
            <div key={k} style={{ background: 'var(--surface)', border: `1px solid ${plan.accent}30`, borderRadius: '12px', padding: '22px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: `radial-gradient(circle, ${plan.accent}15, transparent)`, pointerEvents: 'none' }} />

              {/* Plan name + edit */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: plan.accent, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {plan.name}
                </div>
                <button
                  onClick={() => setEditPlan(plan)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: `${plan.accent}12`, border: `1px solid ${plan.accent}30`, borderRadius: '6px', color: plan.accent, cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
                >
                  <Icon name="edit" size={11} color={plan.accent} /> Edit Price
                </button>
              </div>

              {/* Price — big and editable */}
              <div style={{ marginBottom: '4px' }}>
                <span style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text)', fontFamily: 'DM Mono,monospace' }}>
                  ₹{plan.price.toLocaleString()}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text3)', marginLeft: '4px' }}>/month</span>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: plan.accent, fontFamily: 'DM Mono,monospace' }}>{planStats[k].count}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Active hotels</div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--green)', fontFamily: 'DM Mono,monospace' }}>
                    ₹{(planStats[k].revenue / 1000).toFixed(0)}K
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Monthly revenue</div>
                </div>
              </div>

              {/* Features */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.06em', marginBottom: '8px' }}>TOP FEATURES</div>
                {plan.features.slice(0, 4).map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text2)', marginBottom: '5px' }}>
                    <Icon name="check" size={12} color={plan.accent} /> {f}
                  </div>
                ))}
                {plan.features.length > 4 && (
                  <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>+{plan.features.length - 4} more features</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscription Overview Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)' }}>Subscription Overview</div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>{hotels.length} hotels registered</div>
          </div>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['all', 'starter', 'professional', 'enterprise', 'active', 'trial', 'suspended'].map(f => (
              <button
                key={f}
                onClick={() => setFilterPlan(f)}
                style={{
                  padding: '5px 12px', borderRadius: '20px', border: '1px solid',
                  fontSize: '11px', fontWeight: '600', cursor: 'pointer', textTransform: 'capitalize',
                  background: filterPlan === f ? 'var(--primary)' : 'transparent',
                  borderColor: filterPlan === f ? 'var(--primary)' : 'var(--border)',
                  color: filterPlan === f ? '#fff' : 'var(--text3)',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredHotels.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏨</div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', marginBottom: '6px' }}>No hotels yet</div>
            <div style={{ fontSize: '13px', color: 'var(--text3)' }}>Add hotels from the Hotels page to manage their subscriptions here</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  {['Hotel', 'Plan', 'Monthly', 'Since', 'Renewal', 'Status', 'Notes', 'Action'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', fontWeight: '600', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredHotels.map(h => {
                  const plan = plans[h.plan] || DEFAULT_PLANS[h.plan] || DEFAULT_PLANS.starter;
                  return (
                    <tr
                      key={h.id}
                      style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                            background: `${plan.accent}20`, border: `1px solid ${plan.accent}40`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: '700', color: plan.accent,
                          }}>
                            {(h.avatar || h.name?.slice(0, 2) || 'HT').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>{h.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{h.city}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Badge color={h.plan === 'enterprise' ? 'gold' : h.plan === 'professional' ? 'teal' : 'gray'}>
                          {h.plan || 'starter'}
                        </Badge>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontFamily: 'DM Mono,monospace', color: 'var(--text)', fontWeight: '600' }}>
                        ₹{plan.price.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text3)' }}>
                        {h.joined || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: h.renewal ? 'var(--text2)' : 'var(--text4)' }}>
                        {h.renewal || '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Badge color={h.status === 'active' ? 'green' : h.status === 'trial' ? 'amber' : h.status === 'suspended' ? 'rose' : 'gray'}>
                          {h.status || 'trial'}
                        </Badge>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text3)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {h.notes || '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => setManageSub(h)}
                          style={{
                            padding: '6px 14px', background: 'var(--primary-bg)',
                            border: '1px solid var(--primary)', borderRadius: '6px',
                            color: 'var(--primary)', cursor: 'pointer', fontSize: '12px',
                            fontWeight: '600', whiteSpace: 'nowrap',
                          }}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div style={{ marginTop: '20px', padding: '16px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <Icon name="info" size={16} color="var(--text3)" />
        <span style={{ fontSize: '13px', color: 'var(--text3)', flex: 1 }}>
          Plan prices are saved locally and applied to all new billing calculations. Click <strong style={{ color: 'var(--text2)' }}>Edit Price</strong> on any plan card to update pricing.
        </span>
      </div>
    </div>
  );
};

export default AdminSubscriptions;
