import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import Badge from './Badge';
import * as adminApi from '../services/adminService';

const DashboardDetailModal = ({ type, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // plan or status depending on type
  const [error, setError] = useState('');

  // Plans helper for monthly revenue calculation
  const getPlanPrice = (planId, plansMap) => {
    if (plansMap && plansMap[planId]) return plansMap[planId].price;
    const defaultPrices = { starter: 4999, professional: 12999, enterprise: 24999 };
    return defaultPrices[planId] || 0;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        if (type === 'totalHotels' || type === 'activeSubs' || type === 'monthlyRevenue') {
          const [hotelsRes, plansRes] = await Promise.all([
            adminApi.getAllHotels(),
            adminApi.getPlans()
          ]);
          
          let hotels = hotelsRes.data || [];
          const plansMap = plansRes.data || {};

          if (type === 'activeSubs') {
            hotels = hotels.filter(h => h.planStatus === 'active');
          }

          // Format for revenue
          if (type === 'monthlyRevenue') {
            hotels = hotels.map(h => ({
              ...h,
              monthlyRevenue: h.planStatus === 'active' || h.planStatus === 'trial' ? getPlanPrice(h.plan, plansMap) : 0,
              paymentStatus: h.planStatus === 'active' ? 'Paid' : (h.planStatus === 'trial' ? 'Trial (Free)' : 'Pending')
            }));
            // Default show all hotels, trial ones show 0 revenue.
          }

          setData(hotels);
        } else if (type === 'totalStaffs') {
          const usersRes = await adminApi.getAllUsers();
          const users = usersRes.data || [];
          
          // Group by hotel
          const hotelMap = {};
          users.forEach(u => {
            const hId = u.hotel ? u.hotel._id : 'unassigned';
            const hName = u.hotel ? u.hotel.name : 'Unassigned';
            if (!hotelMap[hId]) hotelMap[hId] = { hotelName: hName, staffCount: 0 };
            hotelMap[hId].staffCount++;
          });
          
          const staffData = Object.values(hotelMap).sort((a,b) => b.staffCount - a.staffCount);
          setData(staffData);
        }
      } catch (err) {
        console.error('Failed to fetch modal data', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  const getTitle = () => {
    switch (type) {
      case 'totalHotels': return 'Total Registered Hotels';
      case 'monthlyRevenue': return 'Monthly Revenue Breakdown';
      case 'activeSubs': return 'Active Subscriptions';
      case 'totalStaffs': return 'Staff Distribution';
      default: return 'Details';
    }
  };

  const filteredData = data.filter(item => {
    if (type === 'totalStaffs') {
      return item.hotelName.toLowerCase().includes(search.toLowerCase());
    }
    
    // For hotels
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || item.plan === filter || item.planStatus === filter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', fontFamily: 'Inter, sans-serif' }}>
      <div 
        onClick={onClose} 
        style={{ position: 'absolute', inset: 0, zIndex: -1 }} 
      />

      <div style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', background: 'var(--card, #fff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface, #f9fafb)' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>{getTitle()}</h2>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}
          >
            <Icon name="x" size={20} color="currentColor" />
          </button>
        </div>

        {/* Toolbar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}>
              <Icon name="search" size={16} />
            </div>
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px' }}
            />
          </div>
          
          {type !== 'totalStaffs' && (
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{ padding: '10px 16px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px', cursor: 'pointer' }}
            >
              <option value="all">All</option>
              <optgroup label="Plan">
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </optgroup>
              <optgroup label="Status">
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
              </optgroup>
            </select>
          )}
        </div>

        {/* Content Table */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>
              Loading data...
            </div>
          ) : error ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--rose)' }}>
              {error}
            </div>
          ) : filteredData.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>
              No results found.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', borderBottom: '1px solid var(--border)', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text3)', letterSpacing: '0.05em' }}>
                <tr>
                  {type === 'totalStaffs' ? (
                    <>
                      <th style={{ padding: '16px 24px', fontWeight: '600' }}>Hotel Name</th>
                      <th style={{ padding: '16px 24px', fontWeight: '600', textAlign: 'right' }}>Total Staff</th>
                    </>
                  ) : (
                    <>
                      <th style={{ padding: '16px 24px', fontWeight: '600' }}>Hotel Name</th>
                      <th style={{ padding: '16px 24px', fontWeight: '600' }}>Plan</th>
                      {type === 'monthlyRevenue' ? (
                        <>
                          <th style={{ padding: '16px 24px', fontWeight: '600', textAlign: 'right' }}>Monthly Revenue</th>
                          <th style={{ padding: '16px 24px', fontWeight: '600', textAlign: 'right' }}>Payment Status</th>
                        </>
                      ) : (
                        <>
                          <th style={{ padding: '16px 24px', fontWeight: '600', textAlign: 'right' }}>Rooms</th>
                          <th style={{ padding: '16px 24px', fontWeight: '600', textAlign: 'right' }}>Status</th>
                        </>
                      )}
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, i) => (
                  <tr key={row._id || i} style={{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
                    {type === 'totalStaffs' ? (
                      <>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text)', fontWeight: '500' }}>{row.hotelName}</td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text2)', textAlign: 'right' }}>
                          <Badge color="gray">{row.staffCount} users</Badge>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text)', fontWeight: '500' }}>{row.name}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <Badge color={row.plan === 'enterprise' ? 'gold' : row.plan === 'professional' ? 'teal' : 'gray'}>
                            {row.plan || 'none'}
                          </Badge>
                        </td>
                        {type === 'monthlyRevenue' ? (
                          <>
                            <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text)', fontWeight: '600', textAlign: 'right' }}>
                              ₹{(row.monthlyRevenue).toLocaleString()}
                            </td>
                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                              <Badge color={row.paymentStatus === 'Paid' ? 'teal' : row.paymentStatus === 'Pending' ? 'rose' : 'gray'}>
                                {row.paymentStatus}
                              </Badge>
                            </td>
                          </>
                        ) : (
                          <>
                            <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text2)', textAlign: 'right' }}>{row.totalRooms || 0}</td>
                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                              <Badge color={row.planStatus === 'active' ? 'teal' : row.planStatus === 'trial' ? 'gold' : 'rose'}>
                                {row.planStatus || 'unknown'}
                              </Badge>
                            </td>
                          </>
                        )}
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardDetailModal;
