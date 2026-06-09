import React, { useState, useEffect, useCallback } from 'react';
import * as travelService from '../services/travelService';
import Badge from '../components/Badge';

const inputStyle = { width: '100%', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '13px' };
const labelStyle = { display: 'block', marginBottom: '4px', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' };
const btnStyle = { padding: '8px 16px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' };
const thStyle = { padding: '10px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' };
const tdStyle = { padding: '10px', fontSize: '13px', borderBottom: '1px solid var(--border)' };

const TravelsManagementPage = () => {
  const [activeTab, setActiveTab] = useState('agencies'); // agencies, bookings
  const [agencies, setAgencies] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  const [agencyForm, setAgencyForm] = useState({ agencyName: '', phone: '', email: '', contactPerson: '', address: '' });
  const [bookingForm, setBookingForm] = useState({ guest: '', room: '', agency: '', pickupLocation: '', destination: '', date: '', time: '', vehicleType: '', amount: 0 });

  const loadData = useCallback(async () => {
    try {
      const agRes = await travelService.getAgencies();
      setAgencies(agRes.data || []);
      const bkRes = await travelService.getBookings();
      setBookings(bkRes.data || []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAddAgency = async () => {
    if (!agencyForm.agencyName || !agencyForm.phone) return;
    try {
      await travelService.createAgency(agencyForm);
      setAgencyForm({ agencyName: '', phone: '', email: '', contactPerson: '', address: '' });
      loadData();
    } catch (e) { alert(e.message); }
  };

  const handleAddBooking = async () => {
    if (!bookingForm.guest || !bookingForm.date || !bookingForm.time || !bookingForm.agency) return;
    try {
      await travelService.createBooking({ ...bookingForm, status: 'confirmed', paymentStatus: 'pending' });
      setBookingForm({ guest: '', room: '', agency: '', pickupLocation: '', destination: '', date: '', time: '', vehicleType: '', amount: 0 });
      loadData();
    } catch (e) { alert(e.message); }
  };

  const updateBookingStatus = async (id, status) => {
    try { await travelService.updateBookingStatus(id, status); loadData(); } catch(e) { alert(e.message); }
  };

  const updatePaymentStatus = async (id, paymentStatus) => {
    try { await travelService.updateBookingPayment(id, paymentStatus); loadData(); } catch(e) { alert(e.message); }
  };

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px)', overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button onClick={() => setActiveTab('agencies')} style={{ ...btnStyle, background: activeTab === 'agencies' ? 'var(--gold)' : 'var(--surface)', color: activeTab === 'agencies' ? '#000' : 'var(--text)' }}>Agencies & Vehicles</button>
        <button onClick={() => setActiveTab('bookings')} style={{ ...btnStyle, background: activeTab === 'bookings' ? 'var(--gold)' : 'var(--surface)', color: activeTab === 'bookings' ? '#000' : 'var(--text)' }}>Bookings</button>
      </div>

      {activeTab === 'agencies' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Add Travel Agency</h3>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Agency Name</label><input style={inputStyle} value={agencyForm.agencyName} onChange={e=>setAgencyForm({...agencyForm, agencyName: e.target.value})} /></div>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Phone</label><input style={inputStyle} value={agencyForm.phone} onChange={e=>setAgencyForm({...agencyForm, phone: e.target.value})} /></div>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Contact Person</label><input style={inputStyle} value={agencyForm.contactPerson} onChange={e=>setAgencyForm({...agencyForm, contactPerson: e.target.value})} /></div>
            <button onClick={handleAddAgency} style={btnStyle}>Save Agency</button>
          </div>
          
          <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Agencies</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={thStyle}>Name</th><th style={thStyle}>Contact</th><th style={thStyle}>Phone</th></tr></thead>
              <tbody>
                {agencies.map(a => (
                  <tr key={a._id}>
                    <td style={tdStyle}>{a.agencyName}</td>
                    <td style={tdStyle}>{a.contactPerson || '-'}</td>
                    <td style={tdStyle}>{a.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>New Booking</h3>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Agency</label>
              <select style={inputStyle} value={bookingForm.agency} onChange={e=>setBookingForm({...bookingForm, agency: e.target.value})}>
                <option value="">Select Agency</option>
                {agencies.map(a => <option key={a._id} value={a._id}>{a.agencyName}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Guest Name</label><input style={inputStyle} value={bookingForm.guest} onChange={e=>setBookingForm({...bookingForm, guest: e.target.value})} /></div>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Pickup Location</label><input style={inputStyle} value={bookingForm.pickupLocation} onChange={e=>setBookingForm({...bookingForm, pickupLocation: e.target.value})} /></div>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Destination</label><input style={inputStyle} value={bookingForm.destination} onChange={e=>setBookingForm({...bookingForm, destination: e.target.value})} /></div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}><label style={labelStyle}>Date</label><input type="date" style={inputStyle} value={bookingForm.date} onChange={e=>setBookingForm({...bookingForm, date: e.target.value})} /></div>
              <div style={{ flex: 1 }}><label style={labelStyle}>Time</label><input type="time" style={inputStyle} value={bookingForm.time} onChange={e=>setBookingForm({...bookingForm, time: e.target.value})} /></div>
            </div>
            <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Amount</label><input type="number" style={inputStyle} value={bookingForm.amount} onChange={e=>setBookingForm({...bookingForm, amount: e.target.value})} /></div>
            <button onClick={handleAddBooking} style={btnStyle}>Create Booking</button>
          </div>

          <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Travel Bookings</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={thStyle}>Guest</th><th style={thStyle}>Agency</th><th style={thStyle}>Route</th><th style={thStyle}>Date</th><th style={thStyle}>Status</th><th style={thStyle}>Payment</th></tr></thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id}>
                    <td style={tdStyle}>{b.guest}</td>
                    <td style={tdStyle}>{b.agency?.agencyName || 'Direct'}</td>
                    <td style={tdStyle}>{b.pickupLocation} → {b.destination}</td>
                    <td style={tdStyle}>{new Date(b.date).toLocaleDateString()} {b.time}</td>
                    <td style={tdStyle}>
                      <select style={{ ...inputStyle, padding: '4px' }} value={b.status} onChange={e=>updateBookingStatus(b._id, e.target.value)}>
                        <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <select style={{ ...inputStyle, padding: '4px' }} value={b.paymentStatus} onChange={e=>updatePaymentStatus(b._id, e.target.value)}>
                        <option value="pending">Pending</option><option value="paid">Paid</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelsManagementPage;
