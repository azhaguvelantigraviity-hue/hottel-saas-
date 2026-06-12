import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import { getAllBranches, createBranch, updateBranch, deleteBranch, getAllHotels } from '../services/adminService';

// The consolidated, policies, transfers data is mocked since it's outside the scope of the branch CRUD, but we keep them to prevent breaking tabs
const CONSOLIDATED = [];
const POLICIES = [];
const TRANSFERS = [];
const TABS = ['Branch Overview', 'Consolidated Reports', 'Branch Comparison', 'Central Settings'];

const MultiBranchPage = () => {
  const [tab, setTab] = useState(0);
  const [branches, setBranches] = useState([]);
  const [hotelsList, setHotelsList] = useState([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [currentBranchId, setCurrentBranchId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', hotelId: '', hotelName: '', location: '', managerName: '', phone: '', email: '', totalRooms: 0, status: 'active', plan: '', planStatus: ''
  });

  useEffect(() => {
    fetchBranches();
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const res = await getAllHotels();
      if (res.data) setHotelsList(res.data);
    } catch (err) {
      console.error('Failed to fetch hotels', err);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await getAllBranches();
      if (res.data) setBranches(res.data);
    } catch (err) {
      console.error('Failed to fetch branches', err);
    }
  };

  const handleOpenModal = (branch = null, viewing = false) => {
    if (branch) {
      setIsEditing(!viewing);
      setIsViewing(viewing);
      setCurrentBranchId(branch._id);
      setFormData({
        name: branch.name, hotelId: branch.hotelId || '', hotelName: branch.hotelName, location: branch.location,
        managerName: branch.managerName, phone: branch.phone, email: branch.email,
        totalRooms: branch.totalRooms, status: branch.status, plan: branch.plan || '', planStatus: branch.planStatus || ''
      });
    } else {
      setIsEditing(false);
      setIsViewing(false);
      setCurrentBranchId(null);
      setFormData({
        name: '', hotelId: '', hotelName: '', location: '', managerName: '', phone: '', email: '', totalRooms: 0, status: 'active', plan: '', planStatus: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 10) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleHotelChange = (e) => {
    const selectedHotelId = e.target.value;
    const selectedHotel = hotelsList.find(h => h._id === selectedHotelId);
    if (selectedHotel) {
      setFormData(prev => ({
        ...prev,
        hotelId: selectedHotel._id,
        hotelName: selectedHotel.name,
        managerName: selectedHotel.owner ? selectedHotel.owner.name : '',
        plan: selectedHotel.plan || '',
        planStatus: selectedHotel.planStatus || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        hotelId: '',
        hotelName: '',
        managerName: '',
        plan: '',
        planStatus: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone && formData.phone.length !== 10) return alert('Phone number must be exactly 10 digits.');
    try {
      if (isEditing) {
        await updateBranch(currentBranchId, formData);
      } else {
        await createBranch(formData);
      }
      fetchBranches();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving branch', err);
      alert('Failed to save branch. Error: ' + err.message + ' Data: ' + JSON.stringify(err.data));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        await deleteBranch(id);
        fetchBranches();
      } catch (err) {
        console.error('Error deleting branch', err);
      }
    }
  };

  // Mocked aggregations based on branches list
  const totalRevenue = branches.reduce((s,b) => s + (b.revenue || 0), 0);
  const totalRooms = branches.reduce((s,b) => s + (b.totalRooms || 0), 0);
  const avgOccupancy = branches.length > 0 ? Math.round(branches.reduce((s,b) => s+(b.occupancy||0), 0) / branches.length) : 0;
  const totalStaff = branches.reduce((s,b) => s+(b.staff||0), 0);
  const maxRev = CONSOLIDATED.length > 0 ? Math.max(...CONSOLIDATED.map(m => m.revenue)) : 1;
  const thStyle = { padding:'10px 14px', textAlign:'left', fontSize:11, color:'var(--text3)', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'1px solid var(--border)' };
  const tdStyle = { padding:'12px 14px', fontSize:13, color:'var(--text2)', borderBottom:'1px solid var(--border)' };

  const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', marginBottom: '12px' };

  return (
    <div style={{ flex:1, overflowY:'auto', padding:24, position: 'relative' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text)' }}>Multi-Branch Management</h2>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          style={{ background: 'var(--gold)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          + Add Branch
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap:16, marginBottom:24 }}>
        <StatCard title="Total Branches" value={branches.length} icon="branch" color="var(--gold)" />
        <StatCard title="Total Revenue" value={`₹${(totalRevenue/100000).toFixed(1)}L`} icon="dollar" color="var(--green)" />
        <StatCard title="Avg Occupancy" value={`${avgOccupancy}%`} icon="trending" color="var(--teal)" />
        <StatCard title="Total Staff" value={totalStaff} icon="users" color="var(--violet)" />
      </div>
      
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:24 }}>
        <div style={{ display:'flex', gap:4, marginBottom:24, background:'var(--surface)', borderRadius:10, padding:4 }}>
          {TABS.map((t,i) => <button key={i} onClick={() => setTab(i)} style={{ flex:1, padding:'9px 8px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:500, background:tab===i?'var(--card)':'transparent', color:tab===i?'var(--gold)':'var(--text2)' }}>{t}</button>)}
        </div>

        {tab === 0 && (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {['Branch Name','Hotel','Location','Manager','Phone','Rooms','Status','Actions'].map(h=><th key={h} style={thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {branches.length === 0 ? (
                <tr><td colSpan="8" style={{...tdStyle, textAlign: 'center', padding: '20px'}}>No branches found. Add a branch to get started.</td></tr>
              ) : branches.map(b => (
                <tr key={b._id} onMouseEnter={e=>e.currentTarget.style.background='var(--surface)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ ...tdStyle, color:'var(--text)', fontWeight:600 }}>{b.name}</td>
                  <td style={tdStyle}>{b.hotelName}</td>
                  <td style={tdStyle}>{b.location}</td>
                  <td style={tdStyle}>{b.managerName || '-'}</td>
                  <td style={tdStyle}>{b.phone || '-'}</td>
                  <td style={{ ...tdStyle, fontFamily:'DM Mono,monospace' }}>{b.totalRooms}</td>
                  <td style={tdStyle}>
                    <span style={{ fontSize:11, fontWeight:600, color: b.status === 'active' ? 'var(--green)' : 'var(--rose)', textTransform:'uppercase' }}>{b.status}</span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button title="View Details" onClick={() => handleOpenModal(b, true)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='var(--surface)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <Icon name="eye" size={16} />
                      </button>
                      <button title="Edit Branch" onClick={() => handleOpenModal(b)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--teal)', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='var(--surface)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <Icon name="edit" size={16} />
                      </button>
                      <button title="Delete Branch" onClick={() => handleDelete(b._id)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--rose)', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='var(--surface)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <Icon name="trash" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Keeping other tabs for visual completeness but without extensive functional data */}
        {tab === 1 && <div style={{ padding: '20px', color: 'var(--text3)' }}>Consolidated reports data will appear here.</div>}
        {tab === 2 && <div style={{ padding: '20px', color: 'var(--text3)' }}>Branch comparison data will appear here.</div>}
        {tab === 3 && <div style={{ padding: '20px', color: 'var(--text3)' }}>Central settings will appear here.</div>}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--card)', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--text)' }}>{isViewing ? 'Branch Details' : isEditing ? 'Edit Branch' : 'Add New Branch'}</h3>
              <button onClick={handleCloseModal} style={{ background: 'transparent', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '18px' }}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Branch Name</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} style={inputStyle} placeholder="e.g. Downtown Branch" readOnly={isViewing} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Hotel</label>
                  {isViewing ? (
                    <input name="hotelName" value={formData.hotelName} style={inputStyle} readOnly />
                  ) : (
                    <select required name="hotelId" value={formData.hotelId} onChange={handleHotelChange} style={inputStyle}>
                      <option value="">Select a Hotel...</option>
                      {hotelsList.map(h => (
                        <option key={h._id} value={h._id}>{h.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Plan Details</label>
                  <input name="plan" value={formData.plan} style={{ ...inputStyle, background: 'var(--card)', color: 'var(--text3)', marginBottom: '0' }} placeholder="Auto-filled" readOnly />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Plan Status</label>
                  <input name="planStatus" value={formData.planStatus} style={{ ...inputStyle, background: 'var(--card)', color: 'var(--text3)', marginBottom: '0' }} placeholder="Auto-filled" readOnly />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Location</label>
                  <input required name="location" value={formData.location} onChange={handleInputChange} style={inputStyle} placeholder="e.g. Mumbai" readOnly={isViewing} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Total Rooms</label>
                  <input type="number" required name="totalRooms" value={formData.totalRooms} onChange={handleInputChange} style={inputStyle} readOnly={isViewing} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Manager Name</label>
                <input name="managerName" value={formData.managerName} onChange={handleInputChange} style={inputStyle} placeholder="e.g. John Doe" readOnly={isViewing} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Phone Number</label>
                  <input name="phone" value={formData.phone} onChange={handleInputChange} style={inputStyle} readOnly={isViewing} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={inputStyle} readOnly={isViewing} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} style={inputStyle} disabled={isViewing}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={handleCloseModal} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>{isViewing ? 'Close' : 'Cancel'}</button>
                {!isViewing && (
                  <button type="submit" style={{ background: 'var(--gold)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{isEditing ? 'Save Changes' : 'Add Branch'}</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MultiBranchPage;
