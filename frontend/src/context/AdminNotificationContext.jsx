import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import * as adminService from '../services/adminService';
import { getUser } from '../services/authService';

const AdminNotificationContext = createContext();

export const AdminNotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const mapNotification = (n) => ({
    id: n._id,
    type: n.type,
    title: n.title,
    desc: `${n.hotelId?.name ? `[${n.hotelId.name}] ` : ''}${n.message}`,
    time: n.createdAt,
    read: n.status !== 'unread',
    icon: n.type === 'help_request' ? 'alert-triangle' : (n.type === 'payment' || n.type === 'subscription' ? 'credit-card' : 'bell'),
    color: n.type === 'help_request' ? 'var(--rose)' : (n.type === 'payment' || n.type === 'subscription' ? 'var(--gold)' : 'var(--brand)')
  });

  const fetchNotifications = async () => {
    try {
      const res = await adminService.getAdminNotifications({ status: 'unread' });
      if (res && res.data) {
        setNotifications(res.data.map(mapNotification));
      }
    } catch (err) {
      console.error('Failed to fetch admin notifications', err);
    }
  };

  useEffect(() => {
    const user = getUser();
    if (user && user.role === 'platform_admin') {
      fetchNotifications();

      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        newSocket.emit('joinAdmin');
      });

      newSocket.on('newAdminNotification', (req) => {
        setNotifications(prev => [mapNotification(req), ...prev]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, []);

  const markRead = async (id) => {
    try {
      await adminService.markAdminNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark admin notification as read', err);
    }
  };

  const markAllRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => adminService.markAdminNotificationRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  return (
    <AdminNotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, fetchNotifications }}>
      {children}
    </AdminNotificationContext.Provider>
  );
};

export const useAdminNotifications = () => {
  const context = useContext(AdminNotificationContext);
  return context || { notifications: [], unreadCount: 0, markRead: () => {}, markAllRead: () => {}, fetchNotifications: () => {} };
};
