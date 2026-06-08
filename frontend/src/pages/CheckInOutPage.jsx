import React, { useState, useEffect } from 'react';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import * as api from '../services/hotelService';

const CheckInOutPage = () => {
  const [activeTab, setActiveTab] = useState('arrivals'); // 'arrivals' | 'departures'
  const [arrivals, setArrivals] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkInModalBooking, setCheckInModalBooking] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [arrRes, depRes] = await Promise.all([
        api.getTodayCheckins(),
        api.getTodayCheckouts()
      ]);
      setArrivals(arrRes.data || []);
      setDepartures(depRes.data || []);
    } catch (err) {
      console.error('Failed to load check-ins/outs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async (id) => {
    try {
      await api.checkIn(id);
      setCheckInModalBooking(null);
      fetchData(); // refresh lists
    } catch (err) {
      alert(err.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (id) => {
    if (!window.confirm("Confirm check-out for this guest?")) return;
    try {
      await api.checkOut(id);
      fetchData(); // refresh lists
    } catch (err) {
      alert(err.message || 'Check-out failed');
    }
  };

  const pendingArrivals = arrivals.filter(a => a.status === 'confirmed' || a.status === 'pending');
  const checkedIn = arrivals.filter(a => a.status === 'checked_in');

  const pendingDepartures = departures.filter(d => d.status === 'checked_in');
  const checkedOut = departures.filter(d => d.status === 'checked_out');

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'var(--bg)' }}>
      {checkInModalBooking && (
        <CheckInModal 
          booking={checkInModalBooking} 
          onClose={() => setCheckInModalBooking(null)} 
          onConfirm={handleCheckIn} 
        />
      )}
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <MetricCard title="Expected Arrivals" count={pendingArrivals.length} total={arrivals.length} color="var(--blue)" icon="login" />
        <MetricCard title="Checked-In Today" count={checkedIn.length} total={arrivals.length} color="var(--green)" icon="check" />
        <MetricCard title="Expected Departures" count={pendingDepartures.length} total={departures.length} color="var(--amber)" icon="logout" />
        <MetricCard title="Checked-Out Today" count={checkedOut.length} total={departures.length} color="var(--teal)" icon="check" />
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border)' }}>
        <TabButton active={activeTab === 'arrivals'} onClick={() => setActiveTab('arrivals')} label={`Arrivals (${arrivals.length})`} />
        <TabButton active={activeTab === 'departures'} onClick={() => setActiveTab('departures')} label={`Departures (${departures.length})`} />
      </div>

      {/* Data Table */}
      <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>Loading data...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px', color: 'var(--text2)', fontWeight: 600, fontSize: '13px' }}>Guest Name</th>
                <th style={{ padding: '16px', color: 'var(--text2)', fontWeight: 600, fontSize: '13px' }}>Booking ID</th>
                <th style={{ padding: '16px', color: 'var(--text2)', fontWeight: 600, fontSize: '13px' }}>Room</th>
                <th style={{ padding: '16px', color: 'var(--text2)', fontWeight: 600, fontSize: '13px' }}>Status</th>
                <th style={{ padding: '16px', color: 'var(--text2)', fontWeight: 600, fontSize: '13px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'arrivals' ? arrivals : departures).length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>
                    No {activeTab} for today.
                  </td>
                </tr>
              ) : (
                (activeTab === 'arrivals' ? arrivals : departures).map(b => (
                  <tr key={b._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                        {b.guest ? `${b.guest.firstName} ${b.guest.lastName}` : 'Walk-in Guest'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{b.guest?.phone || '-'}</div>
                    </td>
                    <td style={{ padding: '16px', fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text2)' }}>
                      {b.bookingId}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {b.room ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', background: 'var(--surface)', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}>
                          <Icon name="bed" size={14} color="var(--gold)" />
                          {b.room.roomNumber}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text3)' }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <StatusBadge status={b.status} />
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      {activeTab === 'arrivals' ? (
                        b.status === 'checked_in' ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 600 }}>Checked In ✓</span>
                            <button 
                              onClick={() => setCheckInModalBooking(b)}
                              style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Icon name="file" size={14} color="var(--gold)" /> Docs
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setCheckInModalBooking(b)}
                            style={{ background: 'var(--green)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                            Check In
                          </button>
                        )
                      ) : (
                        b.status === 'checked_out' ? (
                          <span style={{ fontSize: '13px', color: 'var(--teal)', fontWeight: 600 }}>Checked Out ✓</span>
                        ) : b.status === 'checked_in' ? (
                          <button 
                            onClick={() => handleCheckOut(b._id)}
                            style={{ background: 'var(--rose)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                            Check Out
                          </button>
                        ) : (
                          <span style={{ fontSize: '13px', color: 'var(--text3)' }}>Not Checked-In</span>
                        )
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ title, count, total, color, icon }) => (
  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
      <Icon name={icon} size={24} />
    </div>
    <div>
      <div style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: 600, marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>
        {count} <span style={{ fontSize: '14px', color: 'var(--text3)', fontWeight: 500 }}>/ {total}</span>
      </div>
    </div>
  </div>
);

const TabButton = ({ active, onClick, label }) => (
  <button 
    onClick={onClick}
    style={{
      padding: '12px 24px',
      background: 'transparent',
      border: 'none',
      borderBottom: `2px solid ${active ? 'var(--gold)' : 'transparent'}`,
      color: active ? 'var(--gold)' : 'var(--text2)',
      fontWeight: 600,
      fontSize: '14px',
      cursor: 'pointer',
      marginBottom: '-1px'
    }}
  >
    {label}
  </button>
);

const StatusBadge = ({ status }) => {
  const map = {
    'pending': { color: 'amber', label: 'Pending' },
    'confirmed': { color: 'blue', label: 'Confirmed' },
    'checked_in': { color: 'green', label: 'Checked In' },
    'checked_out': { color: 'teal', label: 'Checked Out' },
    'cancelled': { color: 'rose', label: 'Cancelled' },
  };
  const config = map[status] || { color: 'gray', label: status };
  return <Badge color={config.color} label={config.label} />;
};

const CheckInModal = ({ booking, onClose, onConfirm }) => {
  const [documents, setDocuments] = useState([]);
  const [docType, setDocType] = useState('Aadhaar');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const fetchDocs = async () => {
    try {
      const res = await api.getDocuments(booking._id);
      setDocuments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async () => {
    if (!file) return alert('Please select a file');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('documentFile', file);
      formData.append('docType', docType);
      await api.uploadDocument(booking._id, formData);
      setFile(null);
      fetchDocs();
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await api.deleteDocument(docId);
      fetchDocs();
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ background: 'var(--card)', borderRadius: '12px', width: '100%', maxWidth: '500px', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Smart Check-In: {booking.guest?.firstName} {booking.guest?.lastName}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="x" size={20} color="var(--text3)" /></button>
        </div>
        
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>Guest ID Documents</div>
            {loadingDocs ? <div style={{ fontSize: '13px', color: 'var(--text3)' }}>Loading documents...</div> : documents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                {documents.map(d => (
                  <div key={d._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'var(--surface)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon name="file" size={16} color="var(--gold)" />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{d.docType}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{d.fileName}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <a href={d.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', fontSize: '12px', textDecoration: 'none', fontWeight: 600 }}>View</a>
                      <button onClick={() => handleDelete(d._id)} style={{ background: 'none', border: 'none', color: 'var(--rose)', cursor: 'pointer', padding: 0, display: 'flex' }}><Icon name="trash" size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '16px' }}>No documents uploaded yet. A document is highly recommended.</div>
            )}
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--surface)', padding: '10px', borderRadius: '8px', border: '1px dashed var(--border)' }}>
              <select value={docType} onChange={e => setDocType(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', outline: 'none' }}>
                <option value="Aadhaar">Aadhaar</option>
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
                <option value="PAN">PAN</option>
                <option value="Other">Other</option>
              </select>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files[0])} style={{ flex: 1, fontSize: '12px', color: 'var(--text)' }} />
              <button onClick={handleUpload} disabled={uploading} style={{ padding: '8px 12px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer' }}>
                {uploading ? '...' : 'Upload'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            {booking.status === 'checked_in' ? (
              <button onClick={onClose} style={{ padding: '10px 16px', background: 'var(--green)', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Done</button>
            ) : (
              <>
                <button onClick={onClose} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button onClick={() => onConfirm(booking._id)} style={{ padding: '10px 16px', background: 'var(--green)', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Confirm Check-In</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInOutPage;
