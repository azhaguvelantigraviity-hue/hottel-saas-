import React, { useState, useRef } from 'react';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import Badge from '../components/Badge';

const INVOICES = [
  { id:'INV-2025-001', guest:'Aditya Kumar', room:'301', checkIn:'2025-07-08', checkOut:'2025-07-18', nights:10, roomCharge:280000, food:12400, laundry:820, other:2800, gst:53282, total:349302, status:'paid', date:'2025-07-18', method:'Card' },
  { id:'INV-2025-002', guest:'Priya Sharma', room:'103', checkIn:'2025-07-09', checkOut:'2025-07-15', nights:6, roomCharge:51000, food:4200, laundry:440, other:1500, gst:10282, total:67422, status:'paid', date:'2025-07-15', method:'UPI' },
  { id:'INV-2025-003', guest:'Rohit Verma', room:'201', checkIn:'2025-07-11', checkOut:'2025-07-13', nights:2, roomCharge:24000, food:1800, laundry:260, other:0, gst:4691, total:30751, status:'pending', date:'2025-07-13', method:'-' },
];

const REFUNDS = [
  { id:'RF-001', invoice:'INV-2025-002', guest:'Priya Sharma', amount:3500, reason:'Overcharged for minibar', status:'pending', date:'2025-07-15' },
  { id:'RF-002', invoice:'INV-2025-001', guest:'Aditya Kumar', amount:1200, reason:'Cancelled room service', status:'approved', date:'2025-07-16' },
];

const ADVANCES = [
  { id:'ADV-001', guest:'Karan Malhotra', booking:'BK-1008', amount:10000, date:'2025-07-14', status:'recorded' },
  { id:'ADV-002', guest:'Riya Desai', booking:'BK-1007', amount:5000, date:'2025-07-13', status:'recorded' },
];

const TABS = ['Invoice Generator', 'Split Payment', 'Advance Payment', 'Refunds', 'Invoice History'];

const InvoiceModal = ({ inv, onClose }) => {
  const printRef = useRef(null);

  const handleDownloadPdf = () => {
    if (!printRef.current) return;

    if (!window.html2pdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => generatePdf();
      document.body.appendChild(script);
    } else {
      generatePdf();
    }

    function generatePdf() {
      const opt = {
        margin:       0.5,
        filename:     `${inv.id}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      window.html2pdf().set(opt).from(printRef.current).save();
    }
  };

  if (!inv) return null;
  const subtotal = inv.roomCharge + inv.food + inv.laundry + inv.other;
  const cgst = Math.round(subtotal * 0.09);
  const sgst = Math.round(subtotal * 0.09);
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <div style={{ background:'#fff', borderRadius:12, padding:32, width:560, maxHeight:'90vh', overflowY:'auto', color:'#111' }}>
        <div ref={printRef} style={{ padding: '10px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
          <div>
            <div style={{ fontSize:22, fontWeight:800, fontFamily:'Poppins,sans-serif', color:'#C9A84C' }}>The Grand Meridian</div>
            <div style={{ fontSize:12, color:'#666' }}>Mumbai, Maharashtra · GST: 27AABCG1234A1Z5</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:16, fontWeight:700, color:'#111' }}>TAX INVOICE</div>
            <div style={{ fontSize:13, color:'#666' }}>{inv.id}</div>
            <div style={{ fontSize:12, color:'#666' }}>{inv.date}</div>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20, padding:16, background:'#f9f9f9', borderRadius:8 }}>
          <div><div style={{ fontSize:11, color:'#888', textTransform:'uppercase', marginBottom:4 }}>Bill To</div><div style={{ fontWeight:600 }}>{inv.guest}</div><div style={{ fontSize:13, color:'#555' }}>Room {inv.room}</div></div>
          <div><div style={{ fontSize:11, color:'#888', textTransform:'uppercase', marginBottom:4 }}>Stay Details</div><div style={{ fontSize:13 }}>Check-in: {inv.checkIn}</div><div style={{ fontSize:13 }}>Check-out: {inv.checkOut}</div><div style={{ fontSize:13 }}>{inv.nights} nights</div></div>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:16 }}>
          <thead><tr style={{ background:'#f0f0f0' }}>{['Description','Amount'].map(h=><th key={h} style={{ padding:'8px 12px', textAlign:h==='Amount'?'right':'left', fontSize:12, fontWeight:600 }}>{h}</th>)}</tr></thead>
          <tbody>
            {[['Room Charges',inv.roomCharge],['Food & Beverage',inv.food],['Laundry',inv.laundry],['Other Charges',inv.other]].map(([l,v])=>v>0&&(
              <tr key={l}><td style={{ padding:'8px 12px', fontSize:13, borderBottom:'1px solid #eee' }}>{l}</td><td style={{ padding:'8px 12px', fontSize:13, textAlign:'right', borderBottom:'1px solid #eee', fontFamily:'DM Mono,monospace' }}>₹{v.toLocaleString()}</td></tr>
            ))}
            <tr><td style={{ padding:'8px 12px', fontSize:13, borderBottom:'1px solid #eee' }}>Subtotal</td><td style={{ padding:'8px 12px', fontSize:13, textAlign:'right', borderBottom:'1px solid #eee', fontWeight:600, fontFamily:'DM Mono,monospace' }}>₹{subtotal.toLocaleString()}</td></tr>
            <tr><td style={{ padding:'8px 12px', fontSize:13, borderBottom:'1px solid #eee', color:'#666' }}>CGST (9%)</td><td style={{ padding:'8px 12px', fontSize:13, textAlign:'right', borderBottom:'1px solid #eee', color:'#666', fontFamily:'DM Mono,monospace' }}>₹{cgst.toLocaleString()}</td></tr>
            <tr><td style={{ padding:'8px 12px', fontSize:13, borderBottom:'1px solid #eee', color:'#666' }}>SGST (9%)</td><td style={{ padding:'8px 12px', fontSize:13, textAlign:'right', borderBottom:'1px solid #eee', color:'#666', fontFamily:'DM Mono,monospace' }}>₹{sgst.toLocaleString()}</td></tr>
            <tr style={{ background:'#C9A84C11' }}><td style={{ padding:'10px 12px', fontSize:15, fontWeight:700 }}>Total</td><td style={{ padding:'10px 12px', fontSize:15, textAlign:'right', fontWeight:700, fontFamily:'DM Mono,monospace', color:'#C9A84C' }}>₹{inv.total.toLocaleString()}</td></tr>
          </tbody>
        </table>
        <div style={{ fontSize:12, color:'#888', marginBottom:20 }}>Thank you for staying at The Grand Meridian. We hope to see you again!</div>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={onClose} style={{ flex:1, background:'#f0f0f0', border:'none', borderRadius:8, padding:'10px', cursor:'pointer', fontFamily:'Inter, sans-serif', fontWeight:600 }}>Close</button>
          <button onClick={() => window.print()} style={{ flex:1, background:'#111', border:'none', borderRadius:8, padding:'10px', color:'#fff', cursor:'pointer', fontFamily:'Inter, sans-serif', fontWeight:600 }}>🖨 Print</button>
          <button onClick={handleDownloadPdf} style={{ flex:1, background:'linear-gradient(135deg,#C9A84C,#8A6F2E)', border:'none', borderRadius:8, padding:'10px', color:'#fff', cursor:'pointer', fontFamily:'Inter, sans-serif', fontWeight:600 }}>⬇ Download PDF</button>
        </div>
      </div>
    </div>
  );
};

const BillingPage = () => {
  const [tab, setTab] = useState(0);
  const [selectedInv, setSelectedInv] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [payMethod, setPayMethod] = useState('Card');
  const [splitPayers, setSplitPayers] = useState([{ name:'', amount:'' }, { name:'', amount:'' }]);

  const thStyle = { padding:'10px 14px', textAlign:'left', fontSize:11, color:'var(--text3)', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'1px solid var(--border)' };
  const tdStyle = { padding:'12px 14px', fontSize:13, color:'var(--text2)', borderBottom:'1px solid var(--border)' };
  const inputStyle = { width:'100%', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', color:'var(--text)', fontFamily:'Inter, sans-serif', fontSize:14, boxSizing:'border-box' };

  return (
    <div style={{ flex:1, overflowY:'auto', padding:24 }}>
      {showModal && <InvoiceModal inv={selectedInv} onClose={() => setShowModal(false)} />}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard title="Invoices Today" value="8" icon="receipt" color="var(--gold)" />
        <StatCard title="Revenue Today" value="₹4.2L" icon="dollar" color="var(--green)" />
        <StatCard title="Pending" value="3" icon="info" color="var(--amber)" />
        <StatCard title="Refunds" value={REFUNDS.length} icon="refresh" color="var(--rose)" />
      </div>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:24 }}>
        <div style={{ display:'flex', gap:4, marginBottom:24, background:'var(--surface)', borderRadius:10, padding:4, flexWrap:'wrap' }}>
          {TABS.map((t,i) => <button key={i} onClick={() => setTab(i)} style={{ flex:1, minWidth:100, padding:'9px 8px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'Inter, sans-serif', fontSize:12, fontWeight:500, background:tab===i?'var(--card)':'transparent', color:tab===i?'var(--gold)':'var(--text2)' }}>{t}</button>)}
        </div>

        {tab === 0 && (
          <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:280 }}>
              <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:16 }}>Select Booking</div>
              {INVOICES.map(inv => (
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
              <div style={{ fontSize:13, color:'var(--text2)' }}>Total Bill: <span style={{ fontFamily:'DM Mono,monospace', color:'var(--gold)', fontWeight:700 }}>₹30,751</span></div>
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
            {ADVANCES.map(a => (
              <div key={a.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:14, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, marginBottom:8 }}>
                <div><div style={{ fontSize:14, fontWeight:500, color:'var(--text)' }}>{a.guest}</div><div style={{ fontSize:12, color:'var(--text3)' }}>{a.booking} · {a.date}</div></div>
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:16, fontWeight:700, color:'var(--green)' }}>₹{a.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 3 && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {REFUNDS.map(r => (
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
              {INVOICES.map(inv => (
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
