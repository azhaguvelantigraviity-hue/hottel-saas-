import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import * as api from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children, hotelDetails, role }) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (hotelDetails && hotelDetails.id) {
      fetchNotifications();

      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        newSocket.emit('joinHotel', { hotelId: hotelDetails.id, role });
      });

      newSocket.on('newNotification', (notif) => {
        setNotifications(prev => {
          // Prevent duplicates
          if (prev.some(n => n.id === notif.id)) return prev;
          return [notif, ...prev];
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [hotelDetails, role]);

  const markRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const removeNotification = async (id) => {
    try {
      await api.deleteReq(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to remove notification', err);
    }
  };

  const editNotification = async (id, data) => {
    try {
      const res = await api.put(`/notifications/${id}`, data);
      if (res && res.data) {
        setNotifications(prev => prev.map(n => n.id === id ? res.data : n));
      }
    } catch (err) {
      console.error('Failed to edit notification', err);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, removeNotification, editNotification, socket }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  return context || { notifications: [], unreadCount: 0, markRead: () => {}, markAllRead: () => {}, removeNotification: () => {}, editNotification: () => {} };
};
