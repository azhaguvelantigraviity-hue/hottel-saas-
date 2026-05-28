import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import Badge from '../components/Badge';

const PRICING = { Shirt:80, Trouser:100, Suit:250, Saree:200, Bedsheet:150, Towel:60 };

const ORDERS_INIT = [
  { id:'LN-001', room:'101', guest:'Arjun Mehta', items:[{name:'Shirt',qty:3},{name:'Trouser',qty:2}], status:'washing', pickup:'09:00', express:false, amount:440 },
  { id:'LN-002', room:'301', guest:'Aditya Kumar', items:[{name:'Suit',qty:2},{name:'Shirt',qty:4}], status:'ready', pickup:'08:30', express:true, amount:820 },
  { id:'LN-003', room:'201', guest:'Rohit Verma', items:[{name:'Trouser',qty:1},{name:'Shirt',qty:2}], status:'delivered', pickup:'07:00', express:false, amount:260 },
];

const STATUS_FLOW = ['picked','washing','drying','ready','delivered'];
const statusColor = { picked:'var(--blue)', washing:'var(--teal)', drying:'var(--amber)', ready:'var(--green)', delivered:'var(--text3)' };

const TABS = ['Active Orders', 'New Order', 'Billing'];

const LaundryPage = () => {
  const [tab, setTab] = useState(0);
  const [orders, setOrders] = useState(ORDERS_INIT);
  const [form, setForm] = useState({ room:'', guest:'', express:false, items:{ Shirt:0, Trouser:0, Suit:0, Saree:0, Bedsheet:0, Towel:0 } });

  const advance = (id) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const idx = STATUS_FLOW.indexOf(o.status);
      return { ...o, status: STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)] };
    }));
  };

  const calcBill = (items) => Object.entries(items).reduce((sum, [name, qty]) => sum + (PRICING[name] || 0) * qty, 0);
  const formTotal = calcBill(form.items) * (form.express ? 1.5 : 1);

  const addOrder = () => {
    const itemList = Object.entries(form.items).filter(([,q]) => q > 0).map(([name, qty]) => ({ name, qty }));
    if (!form.room || itemList.length === 0) return;
    const newOrder = { id:`LN-00${orders.length + 4}`, room:form.room, guest:form.guest || 'Guest', items:itemList, status:'picked', pickup:new Date().toTimeString().slice(0,5), express:form.express, amount:Math.round(formTotal) };
    setOrders(prev => [newOrder, ...prev]);
    setForm({ room:'', guest:'', express:false, items:{ Shirt:0, Trouser:0, Suit:0, Saree:0, Bedsheet:0, Towel:0 } });
    setTab(0);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard title="Total Today" value="12" icon="laundry" color="var(--teal)" />
        <StatCard title="In Progress" value={orders.filter(o=>['picked','washing','drying'].includes(o.status)).length} icon="refresh" color="var(--amber)" />
        <StatCard title="Ready" value={orders.filter(o=>o.status==='ready').length} icon="check" color="var(--green)" />
        <StatCard title="Delivered" value={orders.filter(o=>o.status==='delivered').length} icon="arrow" color="var(--text3)" />
      </div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface)', borderRadius: 10, padding: 4 }}>
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: '9px 8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, background: tab === i ? 'var(--card)' : 'transparent', color: tab === i ? 'var(--gold)' : 'var(--text2)' }}>{t}</button>
          ))}
        </div>

        {tab === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map(order => (
              <div key={order.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: 'var(--gold)' }}>{order.id}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Room {order.room}</span>
                      <span style={{ fontSize: 12, color: 'var(--text3)' }}>— {order.guest}</span>
                      {order.express && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--rose)', background: 'rgba(251,113,133,0.12)', padding: '2px 8px', borderRadius: 20 }}>EXPRESS</span>}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                      {order.items.map(item => <span key={item.name} style={{ fontSize: 12, padding: '3px 8px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--text2)' }}>{item.name} ×{item.qty}</span>)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>Pickup: {order.pickup} · ₹{order.amount}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: statusColor[order.status], textTransform: 'uppercase', padding: '4px 12px', background: `${statusColor[order.status]}18`, borderRadius: 20 }}>{order.status}</span>
                    {order.status !== 'delivered' && (
                      <button onClick={() => advance(order.id)} style={{ background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: 8, padding: '6px 14px', color: '#fff', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Advance →</button>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
                  {STATUS_FLOW.map((s, i) => {
                    const cur = STATUS_FLOW.indexOf(order.status);
                    return <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= cur ? statusColor[order.status] : 'var(--border)', transition: 'background 0.3s' }} />;
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 1 && (
          <div style={{ maxWidth: 480 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              {[['Room Number','room'],['Guest Name','guest']].map(([label, field]) => (
                <div key={field}>
                  <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
                  <input value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontFamily: 'Inter, sans-serif', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Items</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {Object.keys(PRICING).map(item => (
                  <div key={item} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>{item}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>₹{PRICING[item]}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <button onClick={() => setForm(f => ({ ...f, items: { ...f.items, [item]: Math.max(0, f.items[item] - 1) } }))} style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text2)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 14, color: 'var(--text)', minWidth: 16, textAlign: 'center' }}>{form.items[item]}</span>
                      <button onClick={() => setForm(f => ({ ...f, items: { ...f.items, [item]: f.items[item] + 1 } }))} style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text2)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: 12, background: 'var(--surface)', borderRadius: 8 }}>
              <input type="checkbox" id="express" checked={form.express} onChange={e => setForm(f => ({ ...f, express: e.target.checked }))} />
              <label htmlFor="express" style={{ fontSize: 14, color: 'var(--text2)', cursor: 'pointer' }}>Express Service (+50%)</label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: 14, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8 }}>
              <span style={{ fontSize: 14, color: 'var(--text2)' }}>Total Amount</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold)', fontFamily: 'DM Mono, monospace' }}>₹{Math.round(formTotal)}</span>
            </div>
            <button onClick={addOrder} style={{ background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: 8, padding: '12px 32px', color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14 }}>Create Order</button>
          </div>
        )}

        {tab === 2 && (
          <div style={{ maxWidth: 480 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Price List</div>
            {Object.entries(PRICING).map(([item, price]) => (
              <div key={item} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 14, color: 'var(--text2)' }}>{item}</span>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 14, color: 'var(--text)' }}>₹{price}</span>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: 12, background: 'var(--surface)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>GST (18%)</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>Applied on total bill amount</div>
            </div>
            <div style={{ marginTop: 12, padding: 12, background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--rose)', fontWeight: 600 }}>Express Service</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>50% surcharge on base price</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaundryPage;
