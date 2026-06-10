import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Icon from '../components/Icon';
import * as adminService from '../services/adminService';
import { getUser } from '../services/authService';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState([]);

  // Filters
  const [filterHotel, setFilterHotel] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterHotel) filters.hotel = filterHotel;
      if (filterType) filters.type = filterType;
      if (filterStatus) filters.status = filterStatus;

      const res = await adminService.getAdminNotifications(filters);
      if (res && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotels = async () => {
    try {
      const res = await adminService.getAllHotels();
      if (res && res.data) {
        setHotels(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch hotels', err);
    }
  };

  useEffect(() => {
    fetchHotels();
    
    // Setup socket for real-time updates
    const user = getUser();
    if (user && user.role === 'platform_admin') {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        newSocket.emit('joinAdmin');
      });

      newSocket.on('newAdminNotification', (notif) => {
        setNotifications(prev => [notif, ...prev]);
      });

      return () => newSocket.disconnect();
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [filterHotel, filterType, filterStatus]);

  const handleMarkRead = async (id) => {
    try {
      await adminService.markAdminNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'read' } : n));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleResolve = async (id) => {
    try {
      await adminService.resolveAdminNotification(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'resolved' } : n));
    } catch (err) {
      console.error('Failed to resolve', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      await adminService.deleteAdminNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'var(--gold)';
      case 'unread': return 'var(--rose)';
      case 'read': return 'var(--text3)';
      case 'resolved': return 'var(--teal)';
      default: return 'var(--text3)';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'help_request': return 'alert-triangle';
      case 'checkout': return 'log-out';
      case 'payment': return 'credit-card';
      case 'maintenance': return 'tool';
      case 'subscription': return 'refresh-cw';
      case 'staff': return 'users';
      default: return 'bell';
    }
  };

  return (
    <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text)' }}>Platform Notifications</h1>
          <p style={{ color: 'var(--text3)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Monitor alerts across all hotels</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <select
          value={filterHotel}
          onChange={(e) => setFilterHotel(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', minWidth: '200px' }}
        >
          <option value="">All Hotels</option>
          {hotels.map(h => (
            <option key={h._id} value={h._id}>{h.name}</option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', minWidth: '150px' }}
        >
          <option value="">All Types</option>
          <option value="help_request">Help Requests</option>
          <option value="checkout">Checkouts</option>
          <option value="payment">Payments</option>
          <option value="maintenance">Maintenance</option>
          <option value="subscription">Subscriptions</option>
          <option value="staff">Staff/Hotel</option>
          <option value="system">System</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', minWidth: '150px' }}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)' }}>Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <Icon name="bell-off" size={48} color="var(--text3)" />
          <h3 style={{ marginTop: '1rem', color: 'var(--text)' }}>No Notifications Found</h3>
          <p style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map(notif => (
            <div key={notif._id} style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              justifyContent: 'space-between',
              padding: '1.5rem', 
              background: 'var(--surface)', 
              borderRadius: '12px', 
              border: `1px solid ${notif.status === 'unread' ? 'var(--brand)' : 'var(--border)'}`,
              boxShadow: notif.status === 'unread' ? '0 4px 12px rgba(99, 102, 241, 0.1)' : 'none',
              transition: 'all 0.2s'
            }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ 
                  width: '40px', height: '40px', 
                  borderRadius: '10px', 
                  background: `${getStatusColor(notif.status)}15`,
                  color: getStatusColor(notif.status),
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon name={getTypeIcon(notif.type)} size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text)' }}>{notif.title}</h3>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '12px', 
                      background: `${getStatusColor(notif.status)}20`,
                      color: getStatusColor(notif.status),
                      fontWeight: '500',
                      textTransform: 'uppercase'
                    }}>
                      {notif.status}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                    {notif.message}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text3)' }}>
                    {notif.hotelId && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Icon name="home" size={14} /> {notif.hotelId.name || notif.hotelId}
                      </span>
                    )}
                    {notif.managerId && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Icon name="user" size={14} /> {notif.managerId.name} {notif.managerId.role && `(${notif.managerId.role.replace('_', ' ')})`}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Icon name="clock" size={14} /> {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(notif.status === 'unread' || notif.status === 'pending') && (
                  <button 
                    onClick={() => handleMarkRead(notif._id)}
                    style={{ padding: '0.5rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Icon name="check" size={14} /> Mark Read
                  </button>
                )}
                {notif.status !== 'resolved' && (
                  <button 
                    onClick={() => handleResolve(notif._id)}
                    style={{ padding: '0.5rem 1rem', background: 'var(--teal)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Icon name="check-circle" size={14} /> Resolve
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(notif._id)}
                  style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--rose)', borderRadius: '6px', color: 'var(--rose)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Icon name="trash-2" size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
