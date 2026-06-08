import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { getAllNotifications, markAsReadNotifications, markAsUnreadNotifications, deleteNotifications as deleteNotificationsAPI } from '../services/api';
import { websocketService } from '../services/websocket';

const ScheduleNotificationContext = createContext();

export const useScheduleNotification = () => {
  const context = useContext(ScheduleNotificationContext);
  if (!context) throw new Error('useScheduleNotification must be used within ScheduleNotificationProvider');
  return context;
};

export const ScheduleNotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(() => {
    getAllNotifications()
      .then(data => {
        const list = Array.isArray(data) ? data : data?.notifications || data?.data || [];
        setNotifications(list.map(n => ({
          id: n.id ?? n.notification_id,
          title: n.title ?? n.notification_title ?? '',
          text: n.text ?? n.message ?? n.body ?? '',
          time: n.time ?? n.created_at ?? '',
          read: n.read ?? n.is_read ?? false,
        })));
      })
      .catch(err => console.error('Failed to fetch notifications', err));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    markAsReadNotifications([id])
      .then(() => websocketService.refreshNotificationCount())
      .catch(err => console.error('Failed to mark as read', err));
  }, []);

  const markAsUnread = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
    markAsUnreadNotifications([id])
      .then(() => websocketService.refreshNotificationCount())
      .catch(err => console.error('Failed to mark as unread', err));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const unreadIds = prev.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length) {
        markAsReadNotifications(unreadIds)
          .then(() => websocketService.refreshNotificationCount())
          .catch(err => console.error('Failed to mark all as read', err));
      }
      return prev.map(n => ({ ...n, read: true }));
    });
  }, []);

  const markMultipleAsRead = useCallback((ids, readStatus) => {
    setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, read: readStatus } : n));
    const apiFn = readStatus ? markAsReadNotifications : markAsUnreadNotifications;
    apiFn(ids)
      .then(() => websocketService.refreshNotificationCount())
      .catch(err => console.error('Failed to update read status', err));
  }, []);

  const deleteNotifications = useCallback((ids) => {
    setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
    deleteNotificationsAPI(ids)
      .then(() => websocketService.refreshNotificationCount())
      .catch(err => console.error('Failed to delete notifications', err));
  }, []);

  const value = useMemo(() => ({
    notifications,
    fetchNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    markMultipleAsRead,
    deleteNotifications,
  }), [notifications, fetchNotifications, markAsRead, markAsUnread, markAllAsRead, markMultipleAsRead, deleteNotifications]);

  return (
    <ScheduleNotificationContext.Provider value={value}>
      {children}
    </ScheduleNotificationContext.Provider>
  );
};
