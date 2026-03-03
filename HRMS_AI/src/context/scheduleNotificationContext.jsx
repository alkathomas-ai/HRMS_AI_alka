import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';

const ScheduleNotificationContext = createContext();

export const useScheduleNotification = () => {
  const context = useContext(ScheduleNotificationContext);
  if (!context) {
    throw new Error('useScheduleNotification must be used within ScheduleNotificationProvider');
  }
  return context;
};

export const ScheduleNotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Interview Reminder', text: 'Technical interview scheduled at 09:30 AM', time: '2h ago', read: false },
    { id: 2, title: 'Schedule Updated', text: 'Backend developer interview rescheduled', time: '5h ago', read: false },
    { id: 3, title: 'Task Completed', text: 'Code review completed for new hire', time: '1d ago', read: true },
    { id: 4, title: 'New Application', text: 'New application received for Senior Developer position', time: '2d ago', read: false },
    { id: 5, title: 'Meeting Reminder', text: 'Team standup meeting in 30 minutes', time: '1h ago', read: false },
    { id: 6, title: 'Document Uploaded', text: 'Employee onboarding checklist updated', time: '3h ago', read: false },
    { id: 7, title: 'Leave Request', text: 'Leave request submitted for approval', time: '4h ago', read: true },
    { id: 8, title: 'Payroll Processed', text: 'Monthly payroll has been processed successfully', time: '1d ago', read: true },
    { id: 9, title: 'New Message', text: 'Message from hiring manager regarding candidate', time: '6h ago', read: false },
    { id: 10, title: 'Training Session', text: 'New employee orientation scheduled for tomorrow', time: '2d ago', read: true },
    { id: 11, title: 'Performance Review', text: 'Q4 performance reviews are now open', time: '3d ago', read: false },
    { id: 12, title: 'System Update', text: 'HRMS system maintenance scheduled tonight', time: '5h ago', read: true },
  ]);

  const scheduleData = useMemo(() => ({
    schedule: [
      { time: '08:00 AM', name: 'Sarah Johnson', role: 'Software Engineer - Frontend', category: 'staff' },
      { time: '09:00 AM', name: 'Michael Chen', role: 'Senior Backend Developer', status: 'Rescheduled', originalTime: '09:00 AM', category: 'rescheduled' },
      { time: '09:30 AM', name: 'Emily Rodriguez', role: 'DevOps Engineer', category: 'staff' },
      { time: '10:30 AM', name: 'David Kumar', role: 'Technical Lead - Cloud Services', category: 'manager' }
    ]
  }), []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotifications = useCallback((ids) => {
    setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
  }, []);

  const markMultipleAsRead = useCallback((ids, readStatus) => {
    setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, read: readStatus } : n));
  }, []);

  const value = useMemo(() => ({
    notifications,
    scheduleData,
    markAsRead,
    markAllAsRead,
    deleteNotifications,
    markMultipleAsRead
  }), [notifications, scheduleData, markAsRead, markAllAsRead, deleteNotifications, markMultipleAsRead]);

  return (
    <ScheduleNotificationContext.Provider value={value}>
      {children}
    </ScheduleNotificationContext.Provider>
  );
};
