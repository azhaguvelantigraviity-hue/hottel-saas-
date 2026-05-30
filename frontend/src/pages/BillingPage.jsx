import React, { useState, useRef, useEffect } from 'react';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import Badge from '../components/Badge';

const BILL_KEY = 'stayos_billing';

const BillingPage = () => {
  const [tab, setTab] = useState(0);
  const [selectedInv, setSelectedInv] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [payMethod, setPayMethod] = useState('Card');
  const [splitPayers, setSplitPayers] = useState([{ name:'', amount:'' }, { name:'', amount:'' }]);
  const [invoices, setInvoices] = useState(() => {
    try { const d = localStorage.getItem(`${BILL_KEY}_invoices`); return d ? JSON.parse(d) : []; } catch { return []; }
  });
  const [refunds, setRefunds] = useState(() => {
    try { const d = localStorage.getItem(`${BILL_KEY}_refunds`); return d ? JSON.parse(d) : []; } catch { return []; }
  });
  const [advances, setAdvances] = useState(() => {
    try { const d = localStorage.getItem(`${BILL_KEY}_advances`); return d ? JSON.parse(d) : []; } catch { return []; }
  });

  useEffect(() => { try { localStorage.setItem(`${BILL_KEY}_invoices`, JSON.stringify(invoices)); } catch {} }, [invoices]);
  useEffect(() => { try { localStorage.setItem(`${BILL_KEY}_refunds`, JSON.stringify(refunds)); } catch {} }, [refunds]);
  useEffect(() => { try { localStorage.setItem(`${BILL_KEY}_advances`, JSON.stringify(advances)); } catch {} }, [advances]);

  const TABS = ['Invoice Generator', 'Split Payment', 'Advance Payment', 'Refunds', 'Invoice History'];

  const thStyle = { padding:'10px 14px', textAlign:'left', fontSize:11, color:'var(--text3)', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'1px solid var(--border)' };
  const tdStyle = { padding:'12px 14px', fontSize:13, color:'var(--text2)', borderBottom:'1px solid var(--border)' };
  const inputStyle = { width:'100%', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', color:'var(--text)', fontFamily:'Inter, sans-serif', fontSize:14, boxSizing:'border-box' };

  return (
    <div style={{ flex:1, overflowY:'auto', padding:24 }}>
      {showModal && <InvoiceModal inv={selectedInv} onClose={() => setShowModal(false)} />}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard title="Invoices Today" value="-" icon="receipt" color="var(--gold)" />
        <StatCard title="Revenue Today" value="-" icon="dollar" color="var(--green)" />
        <StatCard title="Pending" value="-" icon="info" color="var(--amber)" />
        <StatCard title="Refunds" value={refunds.length} icon="refresh" color="var(--rose)" />
      </div>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:24 }}>
        <div style={{ display:'flex', gap:4, marginBottom:24, background:'var(--surface)', borderRadius:10, padding:4, flexWrap:'wrap' }}>
          {TABS.map((t,i) => <button key={i} onClick={() => setTab(i)} style={{ flex:1, minWidth:100, padding:'9px 8px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'Inter, sans-serif', fontSize:12, fontWeight:500, background:tab===i?'var(--card)':'transparent', color:tab===i?'var(--gold)':'var(--text2)' }}>{t}</button>)}
        </div>

        {tab === 0 && (
          <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:280 }}>
              <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:16 }}>Select Booking</div>
              {invoices.map(inv => (
                <div key={inv.id} onClick={() => setSelectedInv(inv)} style={{ padding:14, background:selectedInv?.id===inv.id?'rgba(201,168,76,0.12)':'var(--surface)', border:`1px solid ${selectedInv?.id===inv.id?'var(--gold)':'var(--border)'}`, borderRadius:'var(--radius)', marginBottom:8, cursor:'pointer', transition:'all 0.15s' }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontWeight:600, color:'var(--text)' }}>{inv.guest}</span>
                    <span style={{ fontFamily:'DM Mono,monospace', color:'var(--gold)' }}>₹{inv.total.toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize:12, color:'var(--text3)' }}>Room {inv.room} · {inv.nights} nights</div>
                </div>
              ))}
            </div>
            {selectedInv && (
              <div style={{ flex:2, minWidth:300 }}>
                <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:16 }}>Bill Summary</div>
                {[['Room Charges',selectedInv.roomCharge],['Food & Beverage',selectedInv.food],['Laundry',selectedInv.laundry],['Other',selectedInv.other],['GST (18%)',selectedInv.gst]].map(([l,v]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ fontSize:14, color:'var(--text2)' }}>{l}</span>
                    <span style={{ fontFamily:'DM Mono,monospace', fontSize:14, color:'var(--text)' }}>₹{v.toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', padding:'14px 0', borderBottom:'2px solid var(--gold)' }}>
                  <span style={{ fontSize:16, fontWeight:700, color:'var(--text)' }}>Total</span>
                  <span style={{ fontFamily:'DM Mono,monospace', fontSize:18, fontWeight:700, color:'var(--gold)' }}>₹{selectedInv.total.toLocaleString()}</span>
                </div>
                <div style={{ marginTop:16, marginBottom:16 }}>
                  <div style={{ fontSize:12, color:'var(--text3)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>Payment Method</div>
                  <div style={{ display:'flex', gap:8 }}>
                    {['Cash','Card','UPI','Split'].map(m => <button key={m} onClick={() => setPayMethod(m)} style={{ flex:1, padding:'8px', borderRadius:8, border:`1px solid ${payMethod===m?'var(--gold)':'var(--border)'}`, background:payMethod===m?'rgba(201,168,76,0.12)':'transparent', color:payMethod===m?'var(--gold)':'var(--text2)', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif' }}>{m}</button>)}
                  </div>
                </div>
                <button onClick={() => setShowModal(true)} style={{ background:'linear-gradient(135deg,#C9A84C,#8A6F2E)', border:'none', borderRadius:8, padding:'12px 32px', color:'#fff', cursor:'pointer', fontFamily:'Inter, sans-serif', fontWeight:600, fontSize:14 }}>Generate Invoice</button>
              </div>
            )}
          </div>
        )}

        {tab === 1 && (
          <div style={{ maxWidth:480 }}>
            <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:16 }}>Split Payment</div>
            <div style={{ padding:14, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, marginBottom:16 }}>
              <div style={{ fontSize:13, color:'var(--text2)' }}>Total Bill: <span style={{ fontFamily:'DM Mono,monospace', color:'var(--gold)', fontWeight:700 }}>-</span></div>
            </div>
            {splitPayers.map((p, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                <div><label style={{ fontSize:11, color:'var(--text3)', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.06em' }}>Payer {i+1} Name</label><input value={p.name} onChange={e => setSplitPayers(prev => prev.map((x,j) => j===i?{...x,name:e.target.value}:x))} style={inputStyle} /></div>
                <div><label style={{ fontSize:11, color:'var(--text3)', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.06em' }}>Amount (₹)</label><input type="number" value={p.amount} onChange={e => setSplitPayers(prev => prev.map((x,j) => j===i?{...x,amount:e.target.value}:x))} style={inputStyle} /></div>
              </div>
            ))}
            <button onClick={() => setSplitPayers(p => [...p, { name:'', amount:'' }])} style={{ background:'transparent', border:'1px dashed var(--border)', borderRadius:8, padding:'10px 20px', color:'var(--text3)', cursor:'pointer', fontFamily:'Inter, sans-serif', marginBottom:16, width:'100%' }}>+ Add Payer</button>
            <button style={{ background:'linear-gradient(135deg,#C9A84C,#8A6F2E)', border:'none', borderRadius:8, padding:'12px 32px', color:'#fff', cursor:'pointer', fontFamily:'Inter, sans-serif', fontWeight:600, fontSize:14 }}>Process Split Payment</button>
          </div>
        )}

        {tab === 2 && (
          <div style={{ maxWidth:480 }}>
            <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:16 }}>Record Advance Payment</div>
            {[['Guest Name','text'],['Booking ID','text'],['Amount (₹)','number'],['Payment Method','text']].map(([l,t]) => (
              <div key={l} style={{ marginBottom:14 }}><label style={{ fontSize:11, color:'var(--text3)', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.06em' }}>{l}</label><input type={t} style={inputStyle} /></div>
            ))}
            <button style={{ background:'linear-gradient(135deg,#C9A84C,#8A6F2E)', border:'none', borderRadius:8, padding:'12px 32px', color:'#fff', cursor:'pointer', fontFamily:'Inter, sans-serif', fontWeight:600, fontSize:14, marginBottom:24 }}>Record Advance</button>
            <div style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:12 }}>Recent Advances</div>
            {advances.map(a => (
              <div key={a.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:14, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, marginBottom:8 }}>
                <div><div style={{ fontSize:14, fontWeight:500, color:'var(--text)' }}>{a.guest}</div><div style={{ fontSize:12, color:'var(--text3)' }}>{a.booking} · {a.date}</div></div>
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:16, fontWeight:700, color:'var(--green)' }}>₹{a.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 3 && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {refunds.map(r => (
              <div key={r.id} style={{ display:'flex', alignItems:'center', gap:16, padding:16, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--text)' }}>{r.guest}</div>
                  <div style={{ fontSize:12, color:'var(--text3)' }}>{r.invoice} · {r.reason}</div>
                  <div style={{ fontSize:12, color:'var(--text3)' }}>{r.date}</div>
                </div>
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:16, fontWeight:700, color:'var(--rose)' }}>₹{r.amount.toLocaleString()}</span>
                {r.status === 'pending' ? (
                  <div style={{ display:'flex', gap:8 }}>
                    <button style={{ background:'rgba(52,211,153,0.12)', border:'1px solid rgba(52,211,153,0.3)', borderRadius:8, padding:'6px 14px', color:'var(--green)', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif', fontWeight:600 }}>Approve</button>
                    <button style={{ background:'rgba(251,113,133,0.12)', border:'1px solid rgba(251,113,133,0.3)', borderRadius:8, padding:'6px 14px', color:'var(--rose)', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif', fontWeight:600 }}>Reject</button>
                  </div>
                ) : <span style={{ fontSize:11, fontWeight:600, color:'var(--green)', textTransform:'uppercase' }}>{r.status}</span>}
              </div>
            ))}
          </div>
        )}

        {tab === 4 && (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>{['Invoice ID','Guest','Room','Date','Amount','Method','Status','Action'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} onMouseEnter={e=>e.currentTarget.style.background='var(--surface)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ ...tdStyle, fontFamily:'DM Mono,monospace', color:'var(--gold)' }}>{inv.id}</td>
                  <td style={{ ...tdStyle, color:'var(--text)', fontWeight:500 }}>{inv.guest}</td>
                  <td style={tdStyle}>{inv.room}</td>
                  <td style={tdStyle}>{inv.date}</td>
                  <td style={{ ...tdStyle, fontFamily:'DM Mono,monospace', color:'var(--text)' }}>₹{inv.total.toLocaleString()}</td>
                  <td style={tdStyle}>{inv.method}</td>
                  <td style={tdStyle}><span style={{ fontSize:11, fontWeight:600, color:inv.status==='paid'?'var(--green)':'var(--amber)', textTransform:'uppercase' }}>{inv.status}</span></td>
                  <td style={tdStyle}><button onClick={() => { setSelectedInv(inv); setShowModal(true); }} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:6, padding:'4px 12px', color:'var(--text2)', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif' }}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BillingPage;
