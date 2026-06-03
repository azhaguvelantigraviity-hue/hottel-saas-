import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import InvoiceModal from './InvoiceModal';
import { useApi, useMutation } from '../hooks/useApi';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice, generateInvoiceFromBooking, recordPayment, processRefund, getRevenueDashboard, getRevenueReport } from '../services/hotelService';

const thStyle = { padding:'10px 14px', textAlign:'left', fontSize:11, color:'var(--text3)', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'1px solid var(--border)' };
const tdStyle = { padding:'12px 14px', fontSize:13, color:'var(--text2)', borderBottom:'1px solid var(--border)' };
const inputStyle = { width:'100%', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', color:'var(--text)', fontFamily:'Inter, sans-serif', fontSize:14, boxSizing:'border-box' };
const labelStyle = { fontSize:11, color:'var(--text3)', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.06em' };
const btnGold = { background:'linear-gradient(135deg,#C9A84C,#8A6F2E)', border:'none', borderRadius:8, padding:'12px 32px', color:'#fff', cursor:'pointer', fontFamily:'Inter, sans-serif', fontWeight:600, fontSize:14 };
const btnSec = { background:'transparent', border:'1px solid var(--border)', borderRadius:8, padding:'10px 20px', color:'var(--text2)', cursor:'pointer', fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:500 };

const statusBadge = (s) => {
  const m = { paid:'var(--green)', partial:'var(--amber)', draft:'var(--text3)', issued:'#818CF8', cancelled:'var(--rose)', refunded:'var(--rose)' };
  return <span style={{ fontSize:11, fontWeight:600, color:m[s]||'var(--text3)', textTransform:'capitalize' }}>{s}</span>;
};

const BillingPage = () => {
  const [tab, setTab] = useState(0);
  const [selectedInv, setSelectedInv] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState({ status:'', guestName:'', page:1, limit:20 });
  const [paymentData, setPaymentData] = useState({ amount:'', method:'Card', notes:'' });
  const [refundData, setRefundData] = useState({ amount:'', reason:'' });
  const [splitPayers, setSplitPayers] = useState([{ name:'', amount:'', method:'Card' }, { name:'', amount:'', method:'Card' }]);
  const [invForm, setInvForm] = useState({ guestName:'', guestEmail:'', guestPhone:'', roomNumber:'', booking:'', roomCharges:0, foodCharges:0, laundryCharges:0, spaCharges:0, otherCharges:0, taxRate:18, discountType:'fixed', discountValue:0, notes:'', invoiceType:'booking' });
  const [genBookingId, setGenBookingId] = useState('');
  const [reportFilter, setReportFilter] = useState({ groupBy:'day', startDate:'', endDate:'' });

  const { data: dashboard, loading: dashLoad, refetch: refetchDash } = useApi(getRevenueDashboard, []);
  const { data: invoices, loading: invLoad, refetch: refetchInvoices } = useApi(() => getInvoices(filter), [JSON.stringify(filter)]);
  const { data: report, loading: repLoad, refetch: refetchReport } = useApi(() => getRevenueReport(reportFilter), [JSON.stringify(reportFilter)]);

  const { mutate: createInvApi } = useMutation(createInvoice);
  const { mutate: updateInvApi } = useMutation(updateInvoice);
  const { mutate: deleteInvApi } = useMutation(deleteInvoice);
  const { mutate: generateFromBookingApi } = useMutation(generateInvoiceFromBooking);
  const { mutate: recordPaymentApi } = useMutation(recordPayment);
  const { mutate: processRefundApi } = useMutation(processRefund);

  useEffect(() => { if (selectedInv) setPaymentData(p => ({ ...p, amount: selectedInv.dueAmount || selectedInv.totalAmount })); }, [selectedInv]);

  const handleCreateInvoice = async () => {
    try {
      const charges = ['roomCharges','foodCharges','laundryCharges','spaCharges','otherCharges'].reduce((a,k) => ({ ...a, [k]: Number(invForm[k]) }), {});
      const subtotal = Object.values(charges).reduce((a,b) => a+b, 0);
      const discountValue = Number(invForm.discountValue) || 0;
      const discountAmount = invForm.discountType === 'percentage' ? Math.round(subtotal * discountValue / 100) : discountValue;
      const taxRate = Number(invForm.taxRate) || 18;
      const taxable = Math.max(0, subtotal - discountAmount);
      const taxAmount = Math.round(taxable * taxRate / 100);
      const totalAmount = taxable + taxAmount;
      await createInvApi({ ...charges, guestName:invForm.guestName, guestEmail:invForm.guestEmail, guestPhone:invForm.guestPhone, roomNumber:invForm.roomNumber, booking:invForm.booking || undefined, taxRate, taxAmount, discountType:invForm.discountType, discountValue, discountAmount, subtotal, totalAmount, notes:invForm.notes, invoiceType:invForm.invoiceType });
      refetchInvoices();
      refetchDash();
      setInvForm({ guestName:'', guestEmail:'', guestPhone:'', roomNumber:'', booking:'', roomCharges:0, foodCharges:0, laundryCharges:0, spaCharges:0, otherCharges:0, taxRate:18, discountType:'fixed', discountValue:0, notes:'', invoiceType:'booking' });
    } catch (e) { alert(e.message); }
  };

  const handleGenerateFromBooking = async () => {
    if (!genBookingId) return alert('Enter Booking ID');
    try {
      await generateFromBookingApi(genBookingId);
      refetchInvoices();
      refetchDash();
      setGenBookingId('');
    } catch (e) { alert(e.message); }
  };

  const handleRecordPayment = async () => {
    if (!selectedInv) return alert('Select an invoice first');
    try {
      await recordPaymentApi(selectedInv._id, { amount:Number(paymentData.amount), method:paymentData.method, notes:paymentData.notes });
      refetchInvoices();
      refetchDash();
      setPaymentData({ amount:'', method:'Card', notes:'' });
    } catch (e) { alert(e.message); }
  };

  const handleProcessRefund = async () => {
    if (!selectedInv) return alert('Select an invoice first');
    try {
      await processRefundApi(selectedInv._id, { amount:Number(refundData.amount) || selectedInv.paidAmount, reason:refundData.reason });
      refetchInvoices();
      refetchDash();
      setRefundData({ amount:'', reason:'' });
    } catch (e) { alert(e.message); }
  };

  const handleSplitPayment = async () => {
    if (!selectedInv) return alert('Select an invoice first');
    const totalSplit = splitPayers.reduce((a,p) => a + (Number(p.amount) || 0), 0);
    if (totalSplit !== Number(selectedInv.dueAmount || selectedInv.totalAmount)) return alert(`Split total (₹${totalSplit}) must equal due amount (₹${selectedInv.dueAmount || selectedInv.totalAmount})`);
    try {
      for (const p of splitPayers) await recordPaymentApi(selectedInv._id, { amount:Number(p.amount), method:p.method, notes:`Split payment by ${p.name}` });
      refetchInvoices();
      refetchDash();
    } catch (e) { alert(e.message); }
  };

  const dash = dashboard || { today:{ count:0, revenue:0 }, month:{ count:0, revenue:0 }, total:{ revenue:0 }, counts:{} };

  const TABS = ['Dashboard', 'Invoice Generator', 'All Invoices', 'Payments & Refunds', 'Revenue Reports'];

  return (
    <div style={{ flex:1, overflowY:'auto', padding:24 }}>
      {showModal && selectedInv && <InvoiceModal inv={selectedInv} onClose={() => setShowModal(false)} />}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap:16, marginBottom:24 }}>
        <StatCard title="Today's Invoices" value={dashLoad ? '-' : dash.today?.count || 0} icon="receipt" iconColor="var(--gold)" sub={`₹${(dash.today?.revenue || 0).toLocaleString()}`} />
        <StatCard title="Monthly Revenue" value={dashLoad ? '-' : `₹${(dash.month?.revenue || 0).toLocaleString()}`} icon="dollar" iconColor="var(--green)" sub={`Year: ₹${(dash.year?.revenue || 0).toLocaleString()}`} />
        <StatCard title="Total Revenue" value={dashLoad ? '-' : `₹${(dash.total?.revenue || 0).toLocaleString()}`} icon="trending" iconColor="#818CF8" sub={`${dash.total?.count || 0} invoices`} />
        <StatCard title="Pending" value={dashLoad ? '-' : (dash.counts?.pending||0)} icon="info" iconColor="var(--amber)" sub={`Paid: ${dash.counts?.paid||0} · Refunded: ${dash.counts?.refunded||0}`} />
      </div>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:24 }}>
        <div style={{ display:'flex', gap:4, marginBottom:24, background:'var(--surface)', borderRadius:10, padding:4, flexWrap:'wrap' }}>
          {TABS.map((t,i) => <button key={i} onClick={() => setTab(i)} style={{ flex:1, minWidth:100, padding:'9px 8px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'Inter, sans-serif', fontSize:12, fontWeight:500, background:tab===i?'var(--card)':'transparent', color:tab===i?'var(--gold)':'var(--text2)' }}>{t}</button>)}
        </div>

        {tab === 0 && (
          <div>
            <div style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Revenue Overview</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap:16, marginBottom:24 }}>
              <div style={{ padding:16, background:'var(--surface)', borderRadius:8, border:'1px solid var(--border)' }}>
                <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Today</div>
                <div style={{ fontSize:22, fontWeight:700, fontFamily:'DM Mono,monospace', color:'var(--gold)', marginTop:4 }}>₹{(dash.today?.revenue || 0).toLocaleString()}</div>
                <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>{dash.today?.count || 0} invoices</div>
              </div>
              <div style={{ padding:16, background:'var(--surface)', borderRadius:8, border:'1px solid var(--border)' }}>
                <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.06em' }}>This Month</div>
                <div style={{ fontSize:22, fontWeight:700, fontFamily:'DM Mono,monospace', color:'var(--green)', marginTop:4 }}>₹{(dash.month?.revenue || 0).toLocaleString()}</div>
                <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>{dash.month?.count || 0} invoices</div>
              </div>
              <div style={{ padding:16, background:'var(--surface)', borderRadius:8, border:'1px solid var(--border)' }}>
                <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.06em' }}>All Time</div>
                <div style={{ fontSize:22, fontWeight:700, fontFamily:'DM Mono,monospace', color:'#818CF8', marginTop:4 }}>₹{(dash.total?.revenue || 0).toLocaleString()}</div>
                <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>{dash.total?.count || 0} invoices</div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap:16 }}>
              {['pending','partial','paid','cancelled','refunded'].map(s => (
                <div key={s} style={{ padding:'12px 16px', background:'var(--surface)', borderRadius:8, border:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:13, textTransform:'capitalize', color:'var(--text2)' }}>{s}</span>
                  <span style={{ fontSize:16, fontWeight:700, fontFamily:'DM Mono,monospace' }}>{dash.counts?.[s] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 1 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap:24, flexWrap:'wrap' }}>
            <div>
              <div style={{ fontSize:15, fontWeight:700, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>Create Invoice</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap:12 }}>
                {['guestName','guestEmail','guestPhone'].map(f => (
                  <div key={f} style={{ gridColumn: f==='guestEmail'?'span 2':'span 1' }}><label style={labelStyle}>{f.replace('guest','Guest ')}</label><input value={invForm[f]} onChange={e => setInvForm(p => ({...p,[f]:e.target.value}))} style={inputStyle} placeholder={f==='guestEmail'?'guest@example.com':''} /></div>
                ))}
                <div><label style={labelStyle}>Room Number</label><input value={invForm.roomNumber} onChange={e => setInvForm(p => ({...p,roomNumber:e.target.value}))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Invoice Type</label><select value={invForm.invoiceType} onChange={e => setInvForm(p => ({...p,invoiceType:e.target.value}))} style={inputStyle}><option value="booking">Booking</option><option value="restaurant">Restaurant</option><option value="events">Events</option></select></div>
              </div>
              <div style={{ marginTop:12 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:8 }}>Charges (₹)</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap:10 }}>
                  {[{k:'roomCharges',l:'Room'},{k:'foodCharges',l:'Food'},{k:'laundryCharges',l:'Laundry'},{k:'spaCharges',l:'Spa'},{k:'otherCharges',l:'Other'}].map(({k,l}) => (
                    <div key={k}><label style={labelStyle}>{l}</label><input type="number" value={invForm[k]} onChange={e => setInvForm(p => ({...p,[k]:e.target.value}))} style={inputStyle} /></div>
                  ))}
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap:10, marginTop:12 }}>
                <div><label style={labelStyle}>Tax Rate (%)</label><input type="number" value={invForm.taxRate} onChange={e => setInvForm(p => ({...p,taxRate:e.target.value}))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Discount Type</label><select value={invForm.discountType} onChange={e => setInvForm(p => ({...p,discountType:e.target.value}))} style={inputStyle}><option value="fixed">Fixed (₹)</option><option value="percentage">Percentage (%)</option></select></div>
                <div><label style={labelStyle}>{invForm.discountType === 'percentage' ? 'Discount %' : 'Discount ₹'}</label><input type="number" value={invForm.discountValue} onChange={e => setInvForm(p => ({...p,discountValue:e.target.value}))} style={inputStyle} /></div>
              </div>
              <div style={{ marginTop:12 }}><label style={labelStyle}>Notes</label><textarea value={invForm.notes} onChange={e => setInvForm(p => ({...p,notes:e.target.value}))} style={{...inputStyle, resize:'vertical', minHeight:50, fontFamily:'Inter, sans-serif' }} /></div>
              <button onClick={handleCreateInvoice} style={{...btnGold, marginTop:16}}>Generate Invoice</button>
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Generate from Booking</div>
              <div style={{ padding:16, background:'var(--surface)', borderRadius:8, border:'1px solid var(--border)' }}>
                <label style={labelStyle}>Booking ID</label>
                <div style={{ display:'flex', gap:8 }}>
                  <input value={genBookingId} onChange={e => setGenBookingId(e.target.value)} style={inputStyle} placeholder="e.g. 665abc..." />
                  <button onClick={handleGenerateFromBooking} style={{...btnGold, padding:'10px 20px', whiteSpace:'nowrap'}}>Generate</button>
                </div>
                <div style={{ fontSize:11, color:'var(--text3)', marginTop:8 }}>Pulls booking charges + linked POS orders to auto-create an invoice</div>
              </div>
              <div style={{ marginTop:20 }}>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:12 }}>Quick Preview</div>
                {(() => {
                  const subtotal = ['roomCharges','foodCharges','laundryCharges','spaCharges','otherCharges'].reduce((a,k) => a + (Number(invForm[k])||0), 0);
                  const dv = Number(invForm.discountValue) || 0;
                  const da = invForm.discountType === 'percentage' ? Math.round(subtotal * dv / 100) : dv;
                  const taxable = Math.max(0, subtotal - da);
                  const tax = Math.round(taxable * (Number(invForm.taxRate)||18) / 100);
                  const total = taxable + tax;
                  return (
                    <div style={{ padding:16, background:'var(--surface)', borderRadius:8, border:'1px solid var(--border)' }}>
                      {[{l:'Subtotal',v:subtotal},{l:'Discount',v:-da},{l:'Taxable',v:taxable},{l:`GST ${invForm.taxRate||18}%`,v:tax}].map(r => (
                        <div key={r.l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:13, borderBottom:'1px solid var(--border)' }}>
                          <span style={{ color:'var(--text2)' }}>{r.l}</span>
                          <span style={{ fontFamily:'DM Mono,monospace', color: r.v<0?'var(--rose)':'var(--text)' }}>₹{Math.abs(r.v).toLocaleString()}</span>
                        </div>
                      ))}
                      <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0 0', fontSize:16, fontWeight:700, borderTop:'2px solid var(--gold)', marginTop:4 }}>
                        <span>Total</span>
                        <span style={{ fontFamily:'DM Mono,monospace', color:'var(--gold)' }}>₹{total.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {tab === 2 && (
          <div>
            <div style={{ display:'flex', gap:12, marginBottom:16, flexWrap:'wrap', alignItems:'end' }}>
              <div style={{ flex:1, minWidth:150 }}><label style={labelStyle}>Status</label>
                <select value={filter.status} onChange={e => setFilter(p => ({...p,status:e.target.value,page:1}))} style={inputStyle}>
                  <option value="">All</option><option value="draft">Draft</option><option value="issued">Issued</option><option value="paid">Paid</option><option value="partial">Partial</option><option value="cancelled">Cancelled</option><option value="refunded">Refunded</option>
                </select>
              </div>
              <div style={{ flex:1, minWidth:150 }}><label style={labelStyle}>Guest Name</label><input value={filter.guestName} onChange={e => setFilter(p => ({...p,guestName:e.target.value,page:1}))} style={inputStyle} placeholder="Search..." /></div>
              <button onClick={() => refetchInvoices()} style={btnSec}><Icon name="refresh" size={14} color="var(--text2)" /></button>
            </div>
            {invLoad ? <div style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>Loading...</div> : (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
                  <thead><tr>{['Invoice No','Guest','Room','Total','Paid','Due','Status','Date','Action'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                  <tbody>
                    {(invoices?.invoices || invoices?.data || invoices || []).length === 0 ? (
                      <tr><td colSpan={9} style={{ textAlign:'center', padding:30, color:'var(--text3)' }}>No invoices found</td></tr>
                    ) : (invoices?.invoices || invoices?.data || invoices || []).map(inv => (
                      <tr key={inv._id} onMouseEnter={e=>e.currentTarget.style.background='var(--surface)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'} style={{ cursor:'pointer' }} onClick={() => { setSelectedInv(inv); setShowModal(true); }}>
                        <td style={{...tdStyle, fontFamily:'DM Mono,monospace', color:'var(--gold)', fontWeight:600}}>{inv.invoiceNo || inv._id?.slice(-6)}</td>
                        <td style={{...tdStyle, color:'var(--text)', fontWeight:500}}>{inv.guestName}</td>
                        <td style={tdStyle}>{inv.roomNumber || '-'}</td>
                        <td style={{...tdStyle, fontFamily:'DM Mono,monospace'}}>₹{inv.totalAmount?.toLocaleString()}</td>
                        <td style={{...tdStyle, fontFamily:'DM Mono,monospace', color:'var(--green)'}}>₹{(inv.paidAmount || 0).toLocaleString()}</td>
                        <td style={{...tdStyle, fontFamily:'DM Mono,monospace', color:'var(--rose)'}}>₹{(inv.dueAmount || 0).toLocaleString()}</td>
                        <td style={tdStyle}>{statusBadge(inv.paymentStatus)}</td>
                        <td style={tdStyle}>{new Date(inv.createdAt || inv.date).toLocaleDateString('en-IN')}</td>
                        <td style={tdStyle}>
                          <button onClick={e => { e.stopPropagation(); setSelectedInv(inv); setShowModal(true); }} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:6, padding:'4px 12px', color:'var(--text2)', cursor:'pointer', fontSize:12, fontFamily:'Inter, sans-serif' }}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 3 && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap:24 }}>
              <div>
                <div style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Record Payment</div>
                <div style={{ padding:16, background:'var(--surface)', borderRadius:8, border:'1px solid var(--border)' }}>
                  {!selectedInv ? (
                    <div style={{ fontSize:13, color:'var(--text3)', textAlign:'center', padding:20 }}>Select an invoice from the "All Invoices" tab first</div>
                  ) : (
                    <>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                        <span style={{ color:'var(--text2)', fontSize:13 }}>Invoice: <strong style={{ color:'var(--gold)' }}>{selectedInv.invoiceNo || selectedInv._id?.slice(-6)}</strong></span>
                        <span style={{ color:'var(--text2)', fontSize:13 }}>Due: <strong style={{ fontFamily:'DM Mono,monospace', color:'var(--rose)' }}>₹{(selectedInv.dueAmount || selectedInv.totalAmount || 0).toLocaleString()}</strong></span>
                      </div>
                      <div style={{ marginBottom:12 }}><label style={labelStyle}>Amount (₹)</label><input type="number" value={paymentData.amount} onChange={e => setPaymentData(p => ({...p,amount:e.target.value}))} style={inputStyle} /></div>
                      <div style={{ marginBottom:12 }}><label style={labelStyle}>Method</label>
                        <select value={paymentData.method} onChange={e => setPaymentData(p => ({...p,method:e.target.value}))} style={inputStyle}>
                          <option value="Cash">Cash</option><option value="Card">Card</option><option value="UPI">UPI</option><option value="Bank Transfer">Bank Transfer</option>
                        </select>
                      </div>
                      <div style={{ marginBottom:12 }}><label style={labelStyle}>Notes</label><input value={paymentData.notes} onChange={e => setPaymentData(p => ({...p,notes:e.target.value}))} style={inputStyle} placeholder="Optional transaction note" /></div>
                      <button onClick={handleRecordPayment} style={btnGold}>Record Payment</button>
                    </>
                  )}
                </div>
              </div>
              <div>
                <div style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Split Payment</div>
                <div style={{ padding:16, background:'var(--surface)', borderRadius:8, border:'1px solid var(--border)' }}>
                  {!selectedInv ? (
                    <div style={{ fontSize:13, color:'var(--text3)', textAlign:'center', padding:20 }}>Select an invoice first</div>
                  ) : (
                    <>
                      <div style={{ fontSize:13, color:'var(--text2)', marginBottom:12 }}>Due: <strong style={{ fontFamily:'DM Mono,monospace', color:'var(--gold)' }}>₹{(selectedInv.dueAmount || selectedInv.totalAmount || 0).toLocaleString()}</strong></div>
                      {splitPayers.map((p,i) => (
                        <div key={i} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap:8, marginBottom:10 }}>
                          <input value={p.name} onChange={e => setSplitPayers(prev => prev.map((x,j) => j===i?{...x,name:e.target.value}:x))} style={inputStyle} placeholder={`Payer ${i+1} name`} />
                          <input type="number" value={p.amount} onChange={e => setSplitPayers(prev => prev.map((x,j) => j===i?{...x,amount:e.target.value}:x))} style={inputStyle} placeholder="Amount" />
                          <select value={p.method} onChange={e => setSplitPayers(prev => prev.map((x,j) => j===i?{...x,method:e.target.value}:x))} style={inputStyle}><option value="Cash">Cash</option><option value="Card">Card</option><option value="UPI">UPI</option></select>
                        </div>
                      ))}
                      <button onClick={() => setSplitPayers(p => [...p, { name:'', amount:'', method:'Card' }])} style={{ background:'transparent', border:'1px dashed var(--border)', borderRadius:8, padding:'8px 16px', color:'var(--text3)', cursor:'pointer', fontFamily:'Inter, sans-serif', marginBottom:12, width:'100%', fontSize:12 }}>+ Add Payer</button>
                      <button onClick={handleSplitPayment} style={btnGold}>Process Split Payment</button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div style={{ marginTop:24 }}>
              <div style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Process Refund</div>
              <div style={{ maxWidth:400, padding:16, background:'var(--surface)', borderRadius:8, border:'1px solid var(--border)' }}>
                {!selectedInv ? (
                  <div style={{ fontSize:13, color:'var(--text3)', textAlign:'center', padding:20 }}>Select an invoice first</div>
                ) : (
                  <>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                      <span style={{ color:'var(--text2)', fontSize:13 }}>Paid: <strong style={{ fontFamily:'DM Mono,monospace', color:'var(--green)' }}>₹{(selectedInv.paidAmount || 0).toLocaleString()}</strong></span>
                      <span style={{ color:'var(--text2)', fontSize:13 }}>Status: {statusBadge(selectedInv.paymentStatus)}</span>
                    </div>
                    <div style={{ marginBottom:12 }}><label style={labelStyle}>Refund Amount (₹)</label><input type="number" value={refundData.amount} onChange={e => setRefundData(p => ({...p,amount:e.target.value}))} style={inputStyle} placeholder={`Max: ₹${(selectedInv.paidAmount || 0).toLocaleString()}`} /></div>
                    <div style={{ marginBottom:12 }}><label style={labelStyle}>Reason</label><input value={refundData.reason} onChange={e => setRefundData(p => ({...p,reason:e.target.value}))} style={inputStyle} placeholder="Cancellation / Adjustment" /></div>
                    <button onClick={handleProcessRefund} style={{...btnGold, background:'linear-gradient(135deg,#EF4444,#B91C1C)'}}>Process Refund</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 4 && (
          <div>
            <div style={{ display:'flex', gap:12, marginBottom:16, flexWrap:'wrap', alignItems:'end' }}>
              <div style={{ minWidth:130 }}><label style={labelStyle}>Group By</label>
                <select value={reportFilter.groupBy} onChange={e => setReportFilter(p => ({...p,groupBy:e.target.value}))} style={inputStyle}>
                  <option value="day">Day</option><option value="month">Month</option><option value="type">Invoice Type</option><option value="method">Payment Method</option>
                </select>
              </div>
              <div style={{ minWidth:150 }}><label style={labelStyle}>Start Date</label><input type="date" value={reportFilter.startDate} onChange={e => setReportFilter(p => ({...p,startDate:e.target.value}))} style={inputStyle} /></div>
              <div style={{ minWidth:150 }}><label style={labelStyle}>End Date</label><input type="date" value={reportFilter.endDate} onChange={e => setReportFilter(p => ({...p,endDate:e.target.value}))} style={inputStyle} /></div>
              <button onClick={() => refetchReport()} style={{...btnSec, marginTop:16}}><Icon name="refresh" size={14} color="var(--text2)" /> Refresh</button>
            </div>
            {repLoad ? <div style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>Loading...</div> : (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', minWidth:500 }}>
                  <thead><tr><th style={thStyle}>Label</th><th style={thStyle}>Count</th><th style={thStyle}>Revenue (₹)</th></tr></thead>
                  <tbody>
                    {(!report || (report.report || []).length === 0) ? (
                      <tr><td colSpan={3} style={{ textAlign:'center', padding:30, color:'var(--text3)' }}>No data for selected filters</td></tr>
                    ) : (report.report || []).map((r,i) => (
                      <tr key={i} style={{ background:i%2?'var(--surface)':'transparent' }}>
                        <td style={{...tdStyle, color:'var(--text)', fontWeight:500}}>{r._id || r.label || r.date}</td>
                        <td style={tdStyle}>{r.count || 0}</td>
                        <td style={{...tdStyle, fontFamily:'DM Mono,monospace', color:'var(--gold)', fontWeight:600}}>₹{(r.revenue || r.totalAmount || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {report?.report?.length > 0 && (() => {
              const totalRevenue = report.report.reduce((s,r) => s + (r.revenue || 0), 0);
              const totalCount = report.report.reduce((s,r) => s + (r.count || 0), 0);
              return (
                <div style={{ marginTop:16, padding:16, background:'var(--surface)', borderRadius:8, border:'1px solid var(--border)', display:'flex', gap:24 }}>
                  <div><span style={{ fontSize:12, color:'var(--text3)' }}>Total Revenue</span><div style={{ fontSize:20, fontWeight:700, fontFamily:'DM Mono,monospace', color:'var(--gold)' }}>₹{totalRevenue.toLocaleString()}</div></div>
                  <div><span style={{ fontSize:12, color:'var(--text3)' }}>Total Invoices</span><div style={{ fontSize:20, fontWeight:700, fontFamily:'DM Mono,monospace' }}>{totalCount}</div></div>
                  <div><span style={{ fontSize:12, color:'var(--text3)' }}>Average</span><div style={{ fontSize:20, fontWeight:700, fontFamily:'DM Mono,monospace', color:'var(--green)' }}>₹{totalCount ? Math.round(totalRevenue / totalCount).toLocaleString() : 0}</div></div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingPage;
