import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import * as adminService from '../services/adminService';
import { getUser } from '../services/authService';

const AdminNotificationContext = createContext();

export const AdminNotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    try {
      const res = await adminService.getHelpRequests();
      if (res && res.data) {
        // Map HelpRequests to the same notification structure expected by Topbar
        const mapped = res.data.map(req => ({
          id: req._id,
          title: 'Manager Help Required',
          desc: `${req.hotelId?.name || 'A hotel'} - ${req.managerId?.name || 'Manager'}: ${req.message}`,
          time: req.createdAt,
          read: req.status !== 'unread',
          icon: 'alert-triangle',
          color: 'var(--rose)'
        }));
        setNotifications(mapped);
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

      newSocket.on('newHelpRequest', (req) => {
        const mapped = {
          id: req._id,
          title: 'Manager Help Required',
          desc: `${req.hotelId?.name || 'A hotel'} - ${req.managerId?.name || 'Manager'}: ${req.message}`,
          time: req.createdAt,
          read: req.status !== 'unread',
          icon: 'alert-triangle',
          color: 'var(--rose)'
        };
        setNotifications(prev => [mapped, ...prev]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, []);

  const markRead = async (id) => {
    try {
      await adminService.markHelpRequestRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark admin notification as read', err);
    }
  };

  const markAllRead = async () => {
    try {
      // marking all read isn't natively supported yet for help requests,
      // but we can loop through unread ones.
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => adminService.markHelpRequestRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  return (
    <AdminNotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead }}>
      {children}
    </AdminNotificationContext.Provider>
  );
};

export const useAdminNotifications = () => {
  const context = useContext(AdminNotificationContext);
  return context || { notifications: [], unreadCount: 0, markRead: () => {}, markAllRead: () => {} };
};
