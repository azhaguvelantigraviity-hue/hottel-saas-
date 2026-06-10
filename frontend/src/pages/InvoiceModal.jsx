import React, { useRef } from 'react';
import Icon from '../components/Icon';

const rowStyle = { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee', fontSize: '13px' };

const InvoiceModal = ({ inv, onClose }) => {
  const printRef = useRef();

  const handlePrint = () => {
    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <html><head><title>Invoice ${inv.invoiceNo || inv._id?.slice(-6)}</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; padding: 40px; color: #222; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .title { font-size: 24px; font-weight: 700; color: #C9A84C; }
        .subtitle { font-size: 12px; color: #888; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { text-align: left; padding: 10px 12px; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #ddd; }
        td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #eee; }
        .total-row td { font-weight: 700; border-top: 2px solid #C9A84C; }
        .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 20px; }
        .badge { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .badge-paid { background: #d4edda; color: #155724; }
        .badge-partial { background: #fff3cd; color: #856404; }
        .badge-pending { background: #f8d7da; color: #721c24; }
        .charges { margin: 20px 0; }
        .charges-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
        .total-line { display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px; font-weight: 700; border-top: 2px solid #C9A84C; margin-top: 6px; }
      </style></head><body>
        <div class="header">
          <div><div class="title">STAYOS HOTEL</div><div class="subtitle">Tax Invoice</div></div>
          <div style="text-align:right"><div style="font-size:18px;font-weight:700">${inv.invoiceNo || 'INV-0000'}</div><div class="subtitle">${new Date(inv.createdAt || inv.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:20px;padding:16px;background:#f9f9f9;border-radius:8px">
          <div><div style="font-size:12px;color:#888">BILL TO</div><div style="font-weight:600;margin-top:4px">${inv.guestName}</div>${inv.guestEmail ? `<div style="font-size:12px;color:#666">${inv.guestEmail}</div>` : ''}${inv.guestPhone ? `<div style="font-size:12px;color:#666">${inv.guestPhone}</div>` : ''}</div>
          <div style="text-align:right"><div style="font-size:12px;color:#888">INVOICE DETAILS</div><div style="font-size:12px;margin-top:4px">Status: <span class="badge badge-${inv.paymentStatus}">${inv.paymentStatus}</span></div>${inv.roomNumber ? `<div style="font-size:12px;color:#666">Room ${inv.roomNumber}${inv.nights ? ` · ${inv.nights} nights` : ''}</div>` : ''}</div>
        </div>
        <div class="charges">
          <div style="font-size:14px;font-weight:600;margin-bottom:8px">Charges Breakdown</div>
          ${inv.roomCharges ? `<div class="charges-row"><span>Room Charges</span><span>₹${inv.roomCharges.toLocaleString()}</span></div>` : ''}
          ${inv.foodCharges ? `<div class="charges-row"><span>Food & Beverage</span><span>₹${inv.foodCharges.toLocaleString()}</span></div>` : ''}
          ${inv.laundryCharges ? `<div class="charges-row"><span>Laundry</span><span>₹${inv.laundryCharges.toLocaleString()}</span></div>` : ''}
          ${inv.spaCharges ? `<div class="charges-row"><span>Spa</span><span>₹${inv.spaCharges.toLocaleString()}</span></div>` : ''}
          ${inv.otherCharges ? `<div class="charges-row"><span>Other Charges</span><span>₹${inv.otherCharges.toLocaleString()}</span></div>` : ''}
          ${inv.discountAmount ? `<div class="charges-row" style="color:#e53e3e"><span>Discount${inv.discountType === 'percentage' ? ` (${inv.discountValue}%)` : ''}</span><span>-₹${inv.discountAmount.toLocaleString()}</span></div>` : ''}
          <div class="charges-row" style="color:#666"><span>GST @ ${inv.taxRate || 18}%</span><span>₹${(inv.taxAmount || 0).toLocaleString()}</span></div>
          <div class="total-line"><span>Total Amount</span><span>₹${(inv.totalAmount || 0).toLocaleString()}</span></div>
        </div>
        ${inv.paidAmount > 0 ? `<div style="margin:16px 0;padding:12px;background:#f0fff4;border-radius:6px;display:flex;justify-content:space-between"><span style="font-weight:600">Amount Paid</span><span style="font-weight:700;color:#38a169">₹${inv.paidAmount.toLocaleString()}</span></div>` : ''}
        ${inv.dueAmount > 0 ? `<div style="margin:16px 0;padding:12px;background:#fff5f5;border-radius:6px;display:flex;justify-content:space-between"><span style="font-weight:600">Balance Due</span><span style="font-weight:700;color:#e53e3e">₹${inv.dueAmount.toLocaleString()}</span></div>` : ''}
        ${inv.notes ? `<div style="margin-top:12px;font-size:12px;color:#666"><strong>Notes:</strong> ${inv.notes}</div>` : ''}
        <div class="footer">Thank you for your stay! · This is a computer-generated invoice · StayOS Hotel Management</div>
      </body></html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 300);
  };

  const handleDownloadPDF = () => {
    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <html><head><title>Invoice ${inv.invoiceNo || inv._id?.slice(-6)}</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: 'Inter', Arial, sans-serif; padding: 0; color: #222; width: 210mm; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .title { font-size: 24px; font-weight: 700; color: #C9A84C; }
        .subtitle { font-size: 12px; color: #888; margin-top: 2px; }
        .charges-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
        .total-line { display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px; font-weight: 700; border-top: 2px solid #C9A84C; margin-top: 6px; }
        .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 20px; }
        .badge { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .badge-paid { background: #d4edda; color: #155724; }
        .badge-partial { background: #fff3cd; color: #856404; }
        .badge-pending { background: #f8d7da; color: #721c24; }
        @media print { body { width: auto; } }
      </style></head><body>
        <div class="header">
          <div><div class="title">STAYOS HOTEL</div><div class="subtitle">Tax Invoice</div></div>
          <div style="text-align:right"><div style="font-size:18px;font-weight:700">${inv.invoiceNo || 'INV-0000'}</div><div class="subtitle">${new Date(inv.createdAt || inv.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:20px;padding:16px;background:#f9f9f9;border-radius:8px">
          <div><div style="font-size:12px;color:#888">BILL TO</div><div style="font-weight:600;margin-top:4px">${inv.guestName}</div>${inv.guestEmail ? `<div style="font-size:12px;color:#666">${inv.guestEmail}</div>` : ''}${inv.guestPhone ? `<div style="font-size:12px;color:#666">${inv.guestPhone}</div>` : ''}</div>
          <div style="text-align:right"><div style="font-size:12px;color:#888">INVOICE DETAILS</div><div style="font-size:12px;margin-top:4px">Status: <span class="badge badge-${inv.paymentStatus}">${inv.paymentStatus}</span></div>${inv.roomNumber ? `<div style="font-size:12px;color:#666">Room ${inv.roomNumber}${inv.nights ? ` · ${inv.nights} nights` : ''}</div>` : ''}</div>
        </div>
        <div style="margin:20px 0">
          <div style="font-size:14px;font-weight:600;margin-bottom:8px">Charges Breakdown</div>
          ${inv.roomCharges ? `<div class="charges-row"><span>Room Charges</span><span>₹${inv.roomCharges.toLocaleString()}</span></div>` : ''}
          ${inv.foodCharges ? `<div class="charges-row"><span>Food & Beverage</span><span>₹${inv.foodCharges.toLocaleString()}</span></div>` : ''}
          ${inv.laundryCharges ? `<div class="charges-row"><span>Laundry</span><span>₹${inv.laundryCharges.toLocaleString()}</span></div>` : ''}
          ${inv.spaCharges ? `<div class="charges-row"><span>Spa</span><span>₹${inv.spaCharges.toLocaleString()}</span></div>` : ''}
          ${inv.otherCharges ? `<div class="charges-row"><span>Other Charges</span><span>₹${inv.otherCharges.toLocaleString()}</span></div>` : ''}
          ${inv.discountAmount ? `<div class="charges-row" style="color:#e53e3e"><span>Discount${inv.discountType === 'percentage' ? ` (${inv.discountValue}%)` : ''}</span><span>-₹${inv.discountAmount.toLocaleString()}</span></div>` : ''}
          <div class="charges-row" style="color:#666"><span>GST @ ${inv.taxRate || 18}%</span><span>₹${(inv.taxAmount || 0).toLocaleString()}</span></div>
          <div class="total-line"><span>Total Amount</span><span>₹${(inv.totalAmount || 0).toLocaleString()}</span></div>
        </div>
        ${inv.paidAmount > 0 ? `<div style="margin:16px 0;padding:12px;background:#f0fff4;border-radius:6px;display:flex;justify-content:space-between"><span style="font-weight:600">Amount Paid</span><span style="font-weight:700;color:#38a169">₹${inv.paidAmount.toLocaleString()}</span></div>` : ''}
        ${inv.dueAmount > 0 ? `<div style="margin:16px 0;padding:12px;background:#fff5f5;border-radius:6px;display:flex;justify-content:space-between"><span style="font-weight:600">Balance Due</span><span style="font-weight:700;color:#e53e3e">₹${inv.dueAmount.toLocaleString()}</span></div>` : ''}
        ${inv.notes ? `<div style="margin-top:12px;font-size:12px;color:#666"><strong>Notes:</strong> ${inv.notes}</div>` : ''}
        <div class="footer">Thank you for your stay! · This is a computer-generated invoice · StayOS Hotel Management</div>
        <script>window.onload = function() { window.print(); window.close(); }</script>
      </body></html>
    `);
    printWin.document.close();
  };

  const chargeEntries = [
    { label: 'Room Charges', value: inv.roomCharges },
    { label: 'Food & Beverage', value: inv.foodCharges },
    { label: 'Laundry', value: inv.laundryCharges },
    { label: 'Spa', value: inv.spaCharges },
    { label: 'Other Charges', value: inv.otherCharges },
  ].filter(c => c.value);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div ref={printRef} onClick={e => e.stopPropagation()} style={{ background: 'var(--card)', borderRadius: 'var(--radius)', width: '100%', maxWidth: '600px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border)' }}>
        <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--gold)' }}>Tax Invoice</div>
            <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{inv.invoiceNo || inv._id?.slice(-6)}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleDownloadPDF} style={{ padding: '7px 14px', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '6px', color: 'var(--green)', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Icon name="download" size={13} color="var(--green)" /> PDF
            </button>
            <button onClick={handlePrint} style={{ padding: '7px 14px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '6px', color: '#818CF8', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Icon name="print" size={13} color="#818CF8" /> Print
            </button>
            <button onClick={onClose} style={{ padding: '7px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
              <Icon name="x" size={18} />
            </button>
          </div>
        </div>

        <div style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Bill To</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{inv.guestName}</div>
              {inv.guestEmail && <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{inv.guestEmail}</div>}
              {inv.guestPhone && <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{inv.guestPhone}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Status</div>
              <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', background: inv.paymentStatus === 'paid' ? 'rgba(52,211,153,0.15)' : inv.paymentStatus === 'partial' ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.15)', color: inv.paymentStatus === 'paid' ? 'var(--green)' : inv.paymentStatus === 'partial' ? 'var(--amber)' : 'var(--rose)' }}>
                {inv.paymentStatus}
              </span>
              {inv.roomNumber && <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px' }}>Room {inv.roomNumber}{inv.nights ? ` · ${inv.nights} nights` : ''}</div>}
              <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{new Date(inv.createdAt || inv.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>

          <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text2)' }}>Charges</div>
            {chargeEntries.map(c => (
              <div key={c.label} style={rowStyle}>
                <span style={{ color: 'var(--text2)' }}>{c.label}</span>
                <span style={{ fontFamily: 'DM Mono,monospace' }}>₹{c.value.toLocaleString()}</span>
              </div>
            ))}
            {inv.discountAmount > 0 && (
              <div style={{ ...rowStyle, color: 'var(--rose)' }}>
                <span>Discount{inv.discountType === 'percentage' ? ` (${inv.discountValue}%)` : ''}</span>
                <span style={{ fontFamily: 'DM Mono,monospace' }}>-₹{inv.discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div style={rowStyle}>
              <span style={{ color: 'var(--text2)' }}>Subtotal</span>
              <span style={{ fontFamily: 'DM Mono,monospace' }}>₹{((inv.subtotal || 0) - (inv.discountAmount || 0)).toLocaleString()}</span>
            </div>
            <div style={rowStyle}>
              <span style={{ color: 'var(--text2)' }}>GST @ {inv.taxRate || 18}%</span>
              <span style={{ fontFamily: 'DM Mono,monospace' }}>₹{(inv.taxAmount || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontSize: '16px', fontWeight: '700', borderTop: '2px solid var(--gold)', marginTop: '4px' }}>
              <span>Total</span>
              <span style={{ fontFamily: 'DM Mono,monospace', color: 'var(--gold)' }}>₹{(inv.totalAmount || 0).toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {inv.paidAmount > 0 && (
              <div style={{ flex: 1, padding: '12px', background: 'rgba(52,211,153,0.08)', borderRadius: '8px', border: '1px solid rgba(52,211,153,0.2)' }}>
                <div style={{ fontSize: '11px', color: 'var(--green)', marginBottom: '2px' }}>Paid</div>
                <div style={{ fontSize: '15px', fontWeight: '700', fontFamily: 'DM Mono,monospace', color: 'var(--green)' }}>₹{inv.paidAmount.toLocaleString()}</div>
              </div>
            )}
            {inv.dueAmount > 0 && (
              <div style={{ flex: 1, padding: '12px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div style={{ fontSize: '11px', color: 'var(--rose)', marginBottom: '2px' }}>Due</div>
                <div style={{ fontSize: '15px', fontWeight: '700', fontFamily: 'DM Mono,monospace', color: 'var(--rose)' }}>₹{inv.dueAmount.toLocaleString()}</div>
              </div>
            )}
          </div>

          {inv.notes && <div style={{ marginTop: '12px', padding: '10px', background: 'var(--surface)', borderRadius: '6px', fontSize: '12px', color: 'var(--text2)' }}><strong>Notes:</strong> {inv.notes}</div>}

          {inv.splitPayments?.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Split Payments</div>
              {inv.splitPayments.map((sp, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', borderBottom: '1px solid var(--border)' }}>
                  <span>{sp.name}</span>
                  <span style={{ fontFamily: 'DM Mono,monospace' }}>₹{sp.amount.toLocaleString()} ({sp.method})</span>
                </div>
              ))}
            </div>
          )}

          {inv.refundAmount > 0 && (
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div style={{ fontSize: '12px', color: 'var(--rose)', fontWeight: '600', marginBottom: '2px' }}>Refund Processed</div>
              <div style={{ fontSize: '13px', color: 'var(--text2)' }}>Amount: ₹{inv.refundAmount.toLocaleString()}{inv.refundReason ? ` · Reason: ${inv.refundReason}` : ''}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
