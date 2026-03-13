import React, { useState } from 'react'
import Navbar from '../components/navbar/Navbar'
import Sidebar from '../components/sidebar/Sidebar'
import { Outlet } from 'react-router-dom'
import { uploadAPI } from '../services/api'
import { ToastProvider, useToast } from '../context/ToastContext'
import ToastContainer from '../components/toast/ToastContainer'
import './MainLayout.css'

const MainLayoutContent = () => {
  const { showSuccess, showError } = useToast();
    const [scheduleTab, setScheduleTab] = useState('schedule');
    const [csvFile, setCsvFile] = useState(null);
    const [notifications, setNotifications] = useState([
      { id: 1, title: 'Interview Reminder', text: 'Interview with Habibur Rahman at 09:30 AM', time: '2h ago', read: false },
      { id: 2, title: 'Schedule Updated', text: "Willem van Helden's interview rescheduled", time: '5h ago', read: false },
      { id: 3, title: 'Task Completed', text: 'Design Task Review completed', time: '1d ago', read: true },
      { id: 4, title: 'New Application', text: 'New application received for Chef position', time: '2d ago', read: false },
      { id: 5, title: 'Meeting Reminder', text: 'Team standup meeting in 30 minutes', time: '1h ago', read: false },
      { id: 6, title: 'Document Uploaded', text: 'Employee handbook updated by HR', time: '3h ago', read: false },
      { id: 7, title: 'Leave Request', text: 'John Doe submitted leave request for approval', time: '4h ago', read: true },
      { id: 8, title: 'Payroll Processed', text: 'Monthly payroll has been processed successfully', time: '1d ago', read: true },
      { id: 9, title: 'New Message', text: 'You have a new message from Sarah Johnson', time: '6h ago', read: false },
      { id: 10, title: 'Training Session', text: 'Mandatory safety training scheduled for tomorrow', time: '2d ago', read: true },
      { id: 11, title: 'Performance Review', text: 'Q4 performance reviews are now open', time: '3d ago', read: false },
      { id: 12, title: 'System Update', text: 'HRMS system will be updated tonight at 10 PM', time: '5h ago', read: true },
    ]);
  
    const handleNotificationClick = () => {
      setScheduleTab('notification');
    };
  
    const handleMarkAllRead = () => {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const handleCSVUpload = async (file) => {
      setCsvFile(file);
      console.log('Toast functions available:', { showSuccess, showError });
      try {
        const formData = new FormData();
        formData.append('file', file);
        const result = await uploadAPI(formData);
        console.log('About to show success toast');
        showSuccess('CSV file uploaded successfully!');
        console.log('Upload successful:', result);
      } catch (error) {
        console.log('About to show error toast');
        showError('Failed to upload CSV file. Please try again.');
        console.error('Upload failed:', error);
      }
      const timeoutId = setTimeout(() => setCsvFile(null), 100);
      return () => clearTimeout(timeoutId);
    };

  return (
    <>
      <Navbar 
        notifications={notifications} 
        onNotificationClick={handleNotificationClick} 
        onMarkAllRead={handleMarkAllRead}
        onCSVUpload={handleCSVUpload}
      />
      <Sidebar />
      <div className="page-content">
        <Outlet context={{ scheduleTab, setScheduleTab, csvFile }} />
      </div>
    </>
  )
}

const MainLayout = () => {
  return (
    <ToastProvider>
      <MainLayoutContent />
      <ToastContainer />
    </ToastProvider>
  );
}

export default MainLayout
