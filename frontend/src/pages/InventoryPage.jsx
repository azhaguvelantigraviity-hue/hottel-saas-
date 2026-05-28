import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import Badge from '../components/Badge';

const INVENTORY = [];

const POS = [];

const getStatus = (item) => {
  if (item.stock <= item.minLevel * 0.3) return 'critical';
  if (item.stock < item.minLevel) return 'low';
  return 'ok';
};

const statusColor = { ok: 'var(--green)', low: 'var(--amber)', critical: 'var(--rose)' };
const CATS = [...new Set(INVENTORY.map(i => i.category))];
const TABS = ['Stock Overview', 'Items List', 'Low Stock Alerts', 'Purchase Orders'];

const InventoryPage = () => {
  const [tab, setTab] = useState(0);
  const lowItems = INVENTORY.filter(i => getStatus(i) !== 'ok');
  const critical = INVENTORY.filter(i => getStatus(i) === 'critical');

  const thStyle = { padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text3)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' };
  const tdStyle = { padding: '12px 14px', fontSize: 13, color: 'var(--text2)', borderBottom: '1px solid var(--border)' };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard title="Total Items" value={INVENTORY.length} icon="inventory" color="var(--teal)" />
        <StatCard title="Low Stock" value={lowItems.length} icon="info" color="var(--amber)" />
        <StatCard title="Critical" value={critical.length} icon="x" color="var(--rose)" />
        <StatCard title="Purchase Orders" value={POS.length} icon="receipt" color="var(--violet)" />
      </div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface)', borderRadius: 10, padding: 4 }}>
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: '9px 8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, background: tab === i ? 'var(--card)' : 'transparent', color: tab === i ? 'var(--gold)' : 'var(--text2)' }}>{t}</button>
          ))}
        </div>

        {tab === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
            {CATS.map(cat => {
              const items = INVENTORY.filter(i => i.category === cat);
              const worst = items.some(i => getStatus(i) === 'critical') ? 'critical' : items.some(i => getStatus(i) === 'low') ? 'low' : 'ok';
              return (
                <div key={cat} style={{ background: 'var(--surface)', border: `1px solid ${statusColor[worst]}33`, borderRadius: 'var(--radius)', padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{cat}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>{items.length} items</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: statusColor[worst], fontWeight: 600, textTransform: 'uppercase' }}>{worst}</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{items.filter(i => getStatus(i) !== 'ok').length} alerts</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 1 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Item','Category','In Stock','Min Level','Unit','Last Updated','Status','Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {INVENTORY.map(item => {
                  const st = getStatus(item);
                  return (
                    <tr key={item.id} style={{ transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background='var(--surface)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <td style={{ ...tdStyle, color: 'var(--text)', fontWeight: 500 }}>{item.name}</td>
                      <td style={tdStyle}>{item.category}</td>
                      <td style={{ ...tdStyle, fontFamily: 'DM Mono, monospace', color: statusColor[st] }}>{item.stock}</td>
                      <td style={{ ...tdStyle, fontFamily: 'DM Mono, monospace' }}>{item.minLevel}</td>
                      <td style={tdStyle}>{item.unit}</td>
                      <td style={tdStyle}>{item.lastUpdated}</td>
                      <td style={tdStyle}><span style={{ fontSize: 11, fontWeight: 600, color: statusColor[st], textTransform: 'uppercase' }}>{st}</span></td>
                      <td style={tdStyle}><button style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 6, padding: '4px 12px', color: 'var(--gold)', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>Restock</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {lowItems.length === 0 ? <div style={{ color: 'var(--text3)', textAlign: 'center', padding: 40 }}>All items are well stocked!</div> : lowItems.map(item => {
              const st = getStatus(item);
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: `${statusColor[st]}11`, border: `1px solid ${statusColor[st]}33`, borderRadius: 'var(--radius)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor[st], flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>Stock: {item.stock} {item.unit} / Min: {item.minLevel} {item.unit}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: statusColor[st], textTransform: 'uppercase' }}>{st}</span>
                  <button style={{ background: 'linear-gradient(135deg,#C9A84C,#8A6F2E)', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Create PO</button>
                </div>
              );
            })}
          </div>
        )}

        {tab === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {POS.map(po => {
              const sc = { delivered: 'var(--green)', approved: 'var(--teal)', pending: 'var(--amber)' };
              return (
                <div key={po.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: 'var(--gold)', minWidth: 80 }}>{po.id}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{po.supplier}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{po.items}</div>
                  </div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>₹{po.amount.toLocaleString()}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: sc[po.status], textTransform: 'uppercase' }}>{po.status}</span>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{po.date}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
