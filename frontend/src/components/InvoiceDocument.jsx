import React from 'react';

const InvoiceDocument = React.forwardRef(({ hotel, booking, guest }, ref) => {
  // Safe defaults
  const hName = hotel?.name || 'THE GRAND MERIDIAN';
  const hTagline = hotel?.tagline || 'WHERE LUXURY MEETS COMFORT';
  const hAddress = hotel?.address ? `${hotel.address.street || ''}, ${hotel.address.city || ''}, ${hotel.address.country || ''}` : '123 Luxury Avenue, Metropolis, NY 10001';
  const hPhone = hotel?.phone || '+1 234 567 890';
  const hEmail = hotel?.email || 'contact@grandmeridian.com';
  const hLogo = hotel?.logo || null;

  const gName = guest ? `${guest.firstName} ${guest.lastName}` : 'Guest Name';
  const gAddress = guest?.address || 'N/A';
  const gPhone = guest?.phone || 'N/A';
  const gEmail = guest?.email || 'N/A';

  const bookingId = booking?.bookingId || 'INV-0000';
  const roomNumber = booking?.room?.roomNumber || 'N/A';
  const roomType = booking?.room?.type || 'Standard';
  
  // Format dates nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const checkInStr = formatDate(booking?.checkIn);
  const checkOutStr = formatDate(booking?.checkOut);
  
  const issueDate = formatDate(new Date());

  const roomRate = booking?.roomRate || 0;
  const nights = booking?.nights || 1;
  const roomTotal = roomRate * nights;
  
  const extraCharges = (booking?.foodCharges || 0) + (booking?.laundryCharges || 0) + (booking?.otherCharges || 0);

  const subtotal = roomTotal + extraCharges;
  const tax = Math.round(subtotal * 0.12); // Example 12% tax, adjust if needed
  const grandTotal = subtotal + tax;

  return (
    <div 
      ref={ref} 
      style={{
        width: '800px', // Fixed width for consistent PDF output
        padding: '50px 60px',
        background: '#ffffff',
        fontFamily: "'Inter', sans-serif",
        color: '#333333',
        position: 'relative'
      }}
    >
      {/* Decorative Top Border */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '10px', background: '#D4AF37' }}></div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '2px solid #eaeaea', paddingBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {hLogo ? (
            <img src={hLogo} alt="Hotel Logo" style={{ height: '70px', objectFit: 'contain' }} />
          ) : (
            <div style={{ width: '60px', height: '60px', background: '#D4AF37', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>
              {hName.charAt(0)}
            </div>
          )}
          <div>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '28px', fontWeight: '800', letterSpacing: '2px', color: '#1a1a1a', textTransform: 'uppercase' }}>
              {hName}
            </h1>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', letterSpacing: '1px', color: '#D4AF37', textTransform: 'uppercase' }}>
              {hTagline}
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '36px', fontWeight: '300', color: '#a0a0a0', letterSpacing: '2px' }}>INVOICE</h2>
          <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
            <div>{hAddress}</div>
            <div>P: {hPhone}</div>
            <div>E: {hEmail}</div>
          </div>
        </div>
      </div>

      {/* Booking & Guest Info Grid */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div style={{ width: '45%' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#D4AF37', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '1px' }}>Billed To</div>
          <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px', borderLeft: '3px solid #D4AF37' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', marginBottom: '5px' }}>{gName}</div>
            <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.5' }}>
              {gAddress !== 'N/A' && <div>{gAddress}</div>}
              {gPhone !== 'N/A' && <div>Phone: {gPhone}</div>}
              {gEmail !== 'N/A' && <div>Email: {gEmail}</div>}
            </div>
          </div>
        </div>

        <div style={{ width: '45%' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#D4AF37', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '1px' }}>Invoice Details</div>
          <div style={{ width: '100%', fontSize: '13px', color: '#333' }}>
            <div style={{ display: 'flex', padding: '6px 0', borderBottom: '1px solid #eee' }}>
              <span style={{ width: '120px', color: '#666' }}>Invoice No:</span>
              <span style={{ fontWeight: '600' }}>{bookingId}</span>
            </div>
            <div style={{ display: 'flex', padding: '6px 0', borderBottom: '1px solid #eee' }}>
              <span style={{ width: '120px', color: '#666' }}>Date of Issue:</span>
              <span style={{ fontWeight: '600' }}>{issueDate}</span>
            </div>
            <div style={{ display: 'flex', padding: '6px 0', borderBottom: '1px solid #eee' }}>
              <span style={{ width: '120px', color: '#666' }}>Check-in:</span>
              <span style={{ fontWeight: '600' }}>{checkInStr}</span>
            </div>
            <div style={{ display: 'flex', padding: '6px 0' }}>
              <span style={{ width: '120px', color: '#666' }}>Check-out:</span>
              <span style={{ fontWeight: '600' }}>{checkOutStr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Charges Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
        <thead>
          <tr style={{ background: '#1a1a1a', color: '#fff' }}>
            <th style={{ padding: '12px 15px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Description</th>
            <th style={{ padding: '12px 15px', textAlign: 'center', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Qty / Nights</th>
            <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Unit Price</th>
            <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #eaeaea' }}>
            <td style={{ padding: '15px', fontSize: '14px', color: '#333' }}>
              <div style={{ fontWeight: '600' }}>Room Accommodation</div>
              <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>Room {roomNumber} - {roomType}</div>
            </td>
            <td style={{ padding: '15px', textAlign: 'center', fontSize: '14px', color: '#333' }}>{nights}</td>
            <td style={{ padding: '15px', textAlign: 'right', fontSize: '14px', color: '#333' }}>₹{roomRate.toLocaleString()}</td>
            <td style={{ padding: '15px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>₹{roomTotal.toLocaleString()}</td>
          </tr>
          
          {extraCharges > 0 && (
            <tr style={{ borderBottom: '1px solid #eaeaea' }}>
              <td style={{ padding: '15px', fontSize: '14px', color: '#333' }}>
                <div style={{ fontWeight: '600' }}>Additional Services & Amenities</div>
                <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>Dining, Laundry, Spa, etc.</div>
              </td>
              <td style={{ padding: '15px', textAlign: 'center', fontSize: '14px', color: '#333' }}>1</td>
              <td style={{ padding: '15px', textAlign: 'right', fontSize: '14px', color: '#333' }}>₹{extraCharges.toLocaleString()}</td>
              <td style={{ padding: '15px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>₹{extraCharges.toLocaleString()}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals Section */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '50px' }}>
        <div style={{ width: '350px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 15px', fontSize: '14px', color: '#555', borderBottom: '1px solid #eaeaea' }}>
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 15px', fontSize: '14px', color: '#555', borderBottom: '1px solid #eaeaea' }}>
            <span>Taxes & Fees (12%)</span>
            <span>₹{tax.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', fontSize: '18px', fontWeight: '700', color: '#1a1a1a', background: '#f9f9f9', borderBottom: '2px solid #D4AF37' }}>
            <span>TOTAL DUE</span>
            <span>₹{grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      <div style={{ borderTop: '1px solid #eaeaea', paddingTop: '20px', fontSize: '11px', color: '#777', textAlign: 'center', lineHeight: '1.6' }}>
        <p style={{ margin: '0 0 5px 0', fontWeight: '600', color: '#333', fontSize: '12px' }}>Thank you for choosing {hName}!</p>
        <p style={{ margin: 0 }}>All accounts are to be settled upon check-out. Late payments may be subject to a 2% monthly interest charge.</p>
        <p style={{ margin: 0 }}>For any inquiries regarding this invoice, please contact our front desk.</p>
      </div>
      
    </div>
  );
});

export default InvoiceDocument;
