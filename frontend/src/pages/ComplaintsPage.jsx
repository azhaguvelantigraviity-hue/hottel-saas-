import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import * as api from '../services/complaintService';
import io from 'socket.io-client';

const ComplaintsPage = ({ role, hotelDetails, currentUser }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [formData, setFormData] = useState({ guestName: '', roomNumber: '', category: 'Other', priority: 'Medium', description: '', assignedDepartment: 'Unassigned' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getComplaints();
      setComplaints(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!hotelDetails) return;
    const socket = io('http://localhost:5000');
    socket.emit('joinHotel', hotelDetails._id || hotelDetails.id);

    socket.on('newComplaint', (complaint) => {
      // If user is a manager/admin, or if it's assigned to their specific department
      const canSee = role !== 'hotel_staff' || (currentUser && currentUser.department === complaint.assignedDepartment);
      if (canSee) {
        setComplaints(prev => [complaint, ...prev.filter(c => c._id !== complaint._id)]);
        setShowToast(`New complaint assigned to ${complaint.assignedDepartment}: ${complaint.category}`);
        setTimeout(() => setShowToast(null), 5000);
      }
    });

    return () => socket.disconnect();
  }, [hotelDetails, role, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createComplaint(formData);
      setShowModal(false);
      setFormData({ guestName: '', roomNumber: '', category: 'Other', priority: 'Medium', description: '', assignedDepartment: 'Unassigned' });
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to submit complaint');
    }
  };

  const handleResolve = async (id) => {
    const remarks = window.prompt("Enter resolution remarks:");
    if (remarks === null) return;
    try {
      await api.updateComplaint(id, { status: 'Resolved', resolutionRemarks: remarks });
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to resolve complaint');
    }
  };

  const handleStartProgress = async (id) => {
    try {
      await api.updateComplaint(id, { status: 'In Progress' });
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update complaint');
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'Urgent': return 'rose';
      case 'High': return 'amber';
      case 'Medium': return 'blue';
      case 'Low': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'Pending': return 'rose';
      case 'In Progress': return 'amber';
      case 'Resolved': return 'green';
      default: return 'gray';
    }
  };

  const activeComplaints = complaints.filter(c => c.status !== 'Resolved');
  const urgentCount = complaints.filter(c => c.priority === 'Urgent' && c.status !== 'Resolved').length;

  return (
    <div style={{ flex: 1, padding: '24px', background: 'var(--bg)', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>Customer Complaints</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text3)', fontSize: '14px' }}>Track and manage guest issues</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: 'var(--gold)', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Icon name="add" size={18} /> New Complaint
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: 600 }}>Active Complaints</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', marginTop: '8px' }}>{activeComplaints.length}</div>
        </div>
        <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: 600 }}>Urgent Issues</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--rose)', marginTop: '8px' }}>{urgentCount}</div>
        </div>
        <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: 600 }}>Resolved Today</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--green)', marginTop: '8px' }}>
            {complaints.filter(c => c.status === 'Resolved' && new Date(c.resolvedAt).toDateString() === new Date().toDateString()).length}
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>Loading complaints...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'var(--text2)' }}>Guest & Room</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'var(--text2)' }}>Issue</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'var(--text2)' }}>Department</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'var(--text2)' }}>Priority</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'var(--text2)' }}>Status</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: 'var(--text2)', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>No complaints found.</td>
                </tr>
              ) : (
                complaints.map(c => (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{c.guestName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <Icon name="bed" size={14} color="var(--gold)" /> Room {c.roomNumber}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)' }}>{c.category}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '2px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.description}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}><Badge color="blue" label={c.assignedDepartment || 'Unassigned'} /></td>
                    <td style={{ padding: '16px' }}><Badge color={getPriorityColor(c.priority)} label={c.priority} /></td>
                    <td style={{ padding: '16px' }}><Badge color={getStatusColor(c.status)} label={c.status} /></td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      {c.status === 'Pending' && (
                        <button 
                          onClick={() => handleStartProgress(c._id)}
                          style={{ background: 'var(--surface)', color: 'var(--amber)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginRight: '8px' }}
                        >
                          Start
                        </button>
                      )}
                      {c.status !== 'Resolved' ? (
                        <button 
                          onClick={() => handleResolve(c._id)}
                          style={{ background: 'var(--surface)', color: 'var(--green)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Resolve
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{new Date(c.resolvedAt).toLocaleDateString()}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--card)', borderRadius: '12px', width: '400px', padding: '24px', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: 'var(--text)' }}>Log Complaint</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text2)' }}>Guest Name</label>
                <input required value={formData.guestName} onChange={e => setFormData({...formData, guestName: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }} />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text2)' }}>Room Number</label>
                  <input required value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text2)' }}>Assign Department</label>
                  <select value={formData.assignedDepartment} onChange={e => setFormData({...formData, assignedDepartment: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
                    <option value="Unassigned">Select Department</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Front Desk">Front Desk</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text2)' }}>Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
                    <option>Cleanliness</option>
                    <option>Noise</option>
                    <option>Service</option>
                    <option>Amenities</option>
                    <option>Maintenance</option>
                    <option>Other</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text2)' }}>Priority</label>
                  <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text2)' }}>Description</label>
                <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', background: 'var(--gold)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showToast && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: 'var(--gold)', color: '#000', padding: '12px 20px', borderRadius: '8px', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1100, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="bell" size={16} /> {showToast}
        </div>
      )}
    </div>
  );
};

export default ComplaintsPage;
