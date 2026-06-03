import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import { getLaundryOrders, createLaundryOrder, advanceLaundryOrder } from '../services/laundryService';

// ── Pricing — hardcoded so items always show ──────────────────
const PRICING = {
  Shirt:    80,
  Trouser:  100,
  Suit:     250,
  Saree:    200,
  Bedsheet: 150,
  Towel:    60,
};

const ITEM_ICONS = {
  Shirt: '👔', Trouser: '👖', Suit: '🤵',
  Saree: '🥻', Bedsheet: '🛏️', Towel: '🧺',
};

const STATUS_FLOW  = ['picked', 'washing', 'drying', 'ready', 'delivered'];
const STATUS_COLOR = {
  picked:    '#3B82F6',
  washing:   '#14B8A6',
  drying:    '#F59E0B',
  ready:     '#10B981',
  delivered: '#6B7280',
};
const STATUS_LABEL = {
  picked: 'Picked Up', washing: 'Washing', drying: 'Drying',
  ready: 'Ready', delivered: 'Delivered',
};

const TABS = ['Active Orders', 'New Order', 'Price List'];

const inp = {
  width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
  borderRadius: '8px', padding: '10px 14px', color: 'var(--text)',
  fontFamily: 'Inter, sans-serif', fontSize: '14px', boxSizing: 'border-box', outline: 'none',
};

const EMPTY_ITEMS = Object.fromEntries(Object.keys(PRICING).map(k => [k, 0]));

const LaundryPage = () => {
  const [tab,     setTab]    = useState(0);
  const [orders,  setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]   = useState({ room: '', guest: '', express: false, items: { ...EMPTY_ITEMS } });
  const [error,   setError]  = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getLaundryOrders();
        setOrders(res.data || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Advance order status ──────────────────────────────────
  const advance = async (id) => {
    try {
      const res = await advanceLaundryOrder(id);
      setOrders(prev => prev.map(o => o._id === id ? res.data : o));
    } catch {
      // silently fail
    }
  };

  // ── Bill calculation ──────────────────────────────────────
  const calcBill = (items) =>
    Object.entries(items).reduce((sum, [name, qty]) => sum + (PRICING[name] || 0) * qty, 0);

  const subtotal  = calcBill(form.items);
  const formTotal = Math.round(subtotal * (form.express ? 1.5 : 1));

  const totalItems = Object.values(form.items).reduce((s, q) => s + q, 0);

  // ── Create order ──────────────────────────────────────────
  const addOrder = async () => {
    setError('');
    if (!form.room.trim()) { setError('Please enter a room number.'); return; }
    if (totalItems === 0)  { setError('Please add at least one item.'); return; }

    const itemList = Object.entries(form.items)
      .filter(([, q]) => q > 0)
      .map(([name, qty]) => ({ name, qty, price: PRICING[name] || 0 }));

    try {
      const res = await createLaundryOrder({
        room:    form.room.trim(),
        guest:   form.guest.trim() || 'Guest',
        items:   itemList,
        express: form.express,
        amount:  formTotal,
      });
      setOrders(prev => [res.data, ...prev]);
      setForm({ room: '', guest: '', express: false, items: { ...EMPTY_ITEMS } });
      setTab(0);
    } catch (err) {
      setError(err.message || 'Failed to create order');
    }
  };

  // ── Stats ─────────────────────────────────────────────────
  const inProgress = orders.filter(o => ['picked', 'washing', 'drying'].includes(o.status)).length;
  const ready      = orders.filter(o => o.status === 'ready').length;
  const delivered  = orders.filter(o => o.status === 'delivered').length;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(12px, 3vw, 24px)' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard title="Total Orders" value={orders.length} icon="laundry" color="var(--teal)" />
        <StatCard title="In Progress"  value={inProgress}    icon="refresh" color="var(--amber)" />
        <StatCard title="Ready"        value={ready}         icon="check"   color="var(--green)" />
        <StatCard title="Delivered"    value={delivered}     icon="arrow"   color="var(--text3)" />
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{
              flex: 1, padding: '14px 8px', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '600',
              background: 'transparent',
              borderBottom: `2px solid ${tab === i ? 'var(--primary)' : 'transparent'}`,
              color: tab === i ? 'var(--primary)' : 'var(--text3)',
              transition: 'all 0.15s',
            }}>{t}</button>
          ))}
        </div>

        <div style={{ padding: 'clamp(12px, 3vw, 24px)' }}>
          {/* ── Active Orders ── */}
          {tab === 0 && (
            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)', fontSize: '14px' }}>Loading orders...</div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🧺</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '6px' }}>No laundry orders yet</div>
                  <div style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '20px' }}>Go to "New Order" tab to create one</div>
                  <button onClick={() => setTab(1)} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                    + New Order
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {orders.map(order => (
                    <div key={order._id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '13px', color: 'var(--primary)', fontWeight: '700' }}>{order.orderId}</span>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>Room {order.room}</span>
                            <span style={{ fontSize: '12px', color: 'var(--text3)' }}>— {order.guest}</span>
                            {order.express && (
                              <span style={{ fontSize: '10px', fontWeight: '700', color: '#fff', background: 'var(--rose)', padding: '2px 8px', borderRadius: '20px' }}>EXPRESS</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                            {order.items.map(item => (
                              <span key={item.name} style={{ fontSize: '12px', padding: '3px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', color: 'var(--text2)' }}>
                                {ITEM_ICONS[item.name] || '👕'} {item.name} ×{item.qty}
                              </span>
                            ))}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                            Picked up: {order.pickup} &nbsp;·&nbsp;
                            <span style={{ fontFamily: 'DM Mono,monospace', color: 'var(--text)', fontWeight: '600' }}>₹{order.amount}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                          <span style={{
                            fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                            padding: '5px 14px', borderRadius: '20px',
                            color: STATUS_COLOR[order.status],
                            background: `${STATUS_COLOR[order.status]}18`,
                            border: `1px solid ${STATUS_COLOR[order.status]}40`,
                          }}>
                            {STATUS_LABEL[order.status]}
                          </span>
                          {order.status !== 'delivered' && (
                            <button
                              onClick={() => advance(order._id)}
                              style={{ background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: '8px', padding: '7px 16px', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                            >
                              Advance →
                            </button>
                          )}
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
                        {STATUS_FLOW.map((s, i) => {
                          const cur = STATUS_FLOW.indexOf(order.status);
                          return (
                            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                              <div style={{ height: '4px', width: '100%', borderRadius: '2px', background: i <= cur ? STATUS_COLOR[order.status] : 'var(--border)', transition: 'background 0.3s' }} />
                              <div style={{ fontSize: '9px', color: i <= cur ? STATUS_COLOR[order.status] : 'var(--text4)', fontWeight: i === cur ? '700' : '400' }}>
                                {STATUS_LABEL[s].split(' ')[0]}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── New Order ── */}
          {tab === 1 && (
            <div style={{ maxWidth: '520px' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', marginBottom: '20px' }}>Create Laundry Order</div>

              {/* Room + Guest */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Room Number *</label>
                  <input value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} style={inp} placeholder="e.g. 101" />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Guest Name</label>
                  <input value={form.guest} onChange={e => setForm(f => ({ ...f, guest: e.target.value }))} style={inp} placeholder="e.g. Rahul Sharma" />
                </div>
              </div>

              {/* Items */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Select Items *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '10px' }}>
                  {Object.entries(PRICING).map(([item, price]) => {
                    const qty = form.items[item] || 0;
                    return (
                      <div key={item} style={{
                        background: qty > 0 ? 'rgba(201,168,76,0.08)' : 'var(--bg)',
                        border: `1px solid ${qty > 0 ? 'rgba(201,168,76,0.4)' : 'var(--border)'}`,
                        borderRadius: '10px', padding: '12px', textAlign: 'center',
                        transition: 'all 0.15s',
                      }}>
                        <div style={{ fontSize: '22px', marginBottom: '4px' }}>{ITEM_ICONS[item]}</div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', marginBottom: '2px' }}>{item}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '10px' }}>₹{price}/pc</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                          <button
                            onClick={() => setForm(f => ({ ...f, items: { ...f.items, [item]: Math.max(0, (f.items[item] || 0) - 1) } }))}
                            style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}
                          >−</button>
                          <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '15px', fontWeight: '700', color: qty > 0 ? 'var(--gold)' : 'var(--text)', minWidth: '20px', textAlign: 'center' }}>{qty}</span>
                          <button
                            onClick={() => setForm(f => ({ ...f, items: { ...f.items, [item]: (f.items[item] || 0) + 1 } }))}
                            style={{ width: '26px', height: '26px', borderRadius: '50%', border: 'none', background: 'var(--gold)', color: '#fff', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}
                          >+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Express toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '12px 16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <div
                  onClick={() => setForm(f => ({ ...f, express: !f.express }))}
                  style={{ width: '40px', height: '22px', borderRadius: '11px', cursor: 'pointer', transition: 'background 0.2s', background: form.express ? 'var(--gold)' : 'var(--border)', position: 'relative', flexShrink: 0 }}
                >
                  <div style={{ position: 'absolute', top: '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', left: form.express ? '21px' : '3px' }} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Express Service</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>50% surcharge — delivered within 4 hours</div>
                </div>
              </div>

              {/* Bill summary */}
              {totalItems > 0 && (
                <div style={{ padding: '14px 16px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '10px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text2)', marginBottom: '4px' }}>
                    <span>Subtotal ({totalItems} items)</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {form.express && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--rose)', marginBottom: '4px' }}>
                      <span>Express surcharge (50%)</span>
                      <span>₹{Math.round(subtotal * 0.5)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', color: 'var(--gold)', borderTop: '1px solid rgba(201,168,76,0.2)', paddingTop: '8px', marginTop: '4px' }}>
                    <span>Total</span>
                    <span style={{ fontFamily: 'DM Mono,monospace' }}>₹{formTotal}</span>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: 'var(--rose)', fontSize: '13px', marginBottom: '14px' }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={addOrder}
                style={{
                  width: '100%', padding: '13px', background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)',
                  border: 'none', borderRadius: '10px', color: '#fff', cursor: 'pointer',
                  fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '8px',
                }}
              >
                🧺 Create Laundry Order
              </button>
            </div>
          )}

          {/* ── Price List ── */}
          {tab === 2 && (
            <div style={{ width: '100%', maxWidth: '400px' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', marginBottom: '16px' }}>Laundry Price List</div>
              {Object.entries(PRICING).map(([item, price]) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{ITEM_ICONS[item]}</span>
                    <span style={{ fontSize: '14px', color: 'var(--text2)' }}>{item}</span>
                  </div>
                  <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>₹{price}/pc</span>
                </div>
              ))}
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--rose)', fontWeight: '600', marginBottom: '2px' }}>Express Service</div>
                <div style={{ fontSize: '13px', color: 'var(--text2)' }}>50% surcharge on base price · Delivered within 4 hours</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LaundryPage;
