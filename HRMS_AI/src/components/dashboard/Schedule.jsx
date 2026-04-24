import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Dashboard.css";
import "./Schedule.css";
import { useScheduleNotification } from "../../context/scheduleNotificationContext";

const Schedule = () => {
  const { notifications, fetchNotifications, markAsRead, markAsUnread, deleteNotifications, markMultipleAsRead } = useScheduleNotification();
  const location = useLocation();
  
  // --- STATE FOR EXPANDED VIEW ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expandedTab, setExpandedTab] = useState('schedule');
  const [selectedNotifs, setSelectedNotifs] = useState([]);

  // Handle navigation state to switch to notification tab
  useEffect(() => {
    if (location.state?.scheduleTab === 'notification') {
      setExpandedTab('notification');
    }
  }, [location.state]);

  useEffect(() => {
    if (expandedTab === 'notification') fetchNotifications();
  }, [expandedTab]);

  // --- LOGIC FOR EXPANDED VIEW (Calendar) ---
  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1; 
    const days = [];
    
    // Get today's date for comparison
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const todayDate = today.getDate();
    
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="cal-day empty"></div>);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = isCurrentMonth && d === todayDate;
      const isSelected = d === 18; // Hardcoded demo selection for September 18
      days.push(
        <div 
          key={d} 
          className={`cal-day ${isSelected ? "selected" : ""} ${isToday && !isSelected ? "today" : ""}`}
        >
          {d}
        </div>
      );
    }
    return days;
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getMonthName = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  // Get current time for red line indicator
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return {
      hour: now.getHours(),
      minute: now.getMinutes(),
      percentage: (now.getMinutes() / 60) * 100
    };
  });

  useEffect(() => {
    // Only update time when in expanded schedule view
    if (expandedTab !== 'schedule') return;

    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime({
        hour: now.getHours(),
        minute: now.getMinutes(),
        percentage: (now.getMinutes() / 60) * 100
      });
    }, 60000);
    
    return () => clearInterval(interval);
  }, [expandedTab]);

  // Generate all 24 hours
  const allHours = Array.from({ length: 24 }, (_, i) => i);

  // =========================================================
  // RENDER: EXPANDED VIEW (Matching the Design)
  // =========================================================
  return (
    <div className="schedule-expanded-wrapper">
      {/* TAB SWITCHER */}
      <div className="expanded-tabs">
        <button 
          className={expandedTab === 'schedule' ? 'active' : ''}
          onClick={() => setExpandedTab('schedule')}
        >
          Schedule
        </button>
        <button 
          className={expandedTab === 'notification' ? 'active' : ''}
          onClick={() => setExpandedTab('notification')}
        >
          Notification
        </button>
      </div>

      {expandedTab === 'schedule' ? (
        <>
          {/* HEADER AT TOP */}
          <header className="timeline-header">
            <div className="date-title">
              <h2>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} <span className="text-light">{new Date().getFullYear()}</span></h2>
            </div>
            <div className="header-actions">
              <button className="btn-nav">‹</button>
              <button className="btn-today">Today</button>
              <button className="btn-nav">›</button>
              <div className="dropdown-trigger">Day view ▾</div>
              <button className="primary-btn btn-settings">
                <span className='btn-content'>Create a Schedule</span> <span className="plus">+</span>
              </button>
            </div>
          </header>

      {/* CONTENT AREA: TIMELINE + SIDE PANEL */}
      <div className="schedule-content-area">
        {/* LEFT PANEL: TIMELINE */}
        <div className="main-timeline-panel">
          <div className="timeline-scroll-area">
            {allHours.map((hour) => (
              <div key={hour} className="timeline-row">
                <div className="time-label">
                  {hour === 0 ? '12am' : hour === 12 ? '12pm' : hour > 12 ? `${hour - 12}pm` : `${hour}am`}
                </div>
                
                <div className="events-track">
                  {/* Red Line for current time */}
                  {hour === currentTime.hour && (
                    <div 
                      className="current-time-indicator"
                      style={{ top: `${currentTime.percentage}%` }}
                    >
                      <div className="red-dot"></div>
                      <div className="red-line"></div>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: SIDEBAR */}
        <div className="side-panel">
          <div className="side-header">
            <button onClick={() => changeMonth(-1)}>‹</button>
            <h4>{getMonthName()}</h4>
            <button onClick={() => changeMonth(1)}>›</button>
          </div>

          <div className="mini-calendar">
            <div className="cal-header-row">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="cal-grid">
              {renderCalendarDays()}
            </div>
          </div>

          <div className="day-summary-list">
            <h4>Scheduled for this day:</h4>
            <div className="notif-empty">No schedule data available</div>
          </div>
        </div>
      </div>
        </>
      ) : (
        <div className="notification-content">
          <div className="notif-toolbar">
            <div className="notif-left">
              <label className="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  checked={selectedNotifs.length === notifications.length && notifications.length > 0}
                  onChange={(e) => setSelectedNotifs(e.target.checked ? notifications.map(n => n.id) : [])}
                />
              </label>
              {selectedNotifs.length > 0 && (
                <>
                  <button className="icon-btn" onClick={() => {
                    deleteNotifications(selectedNotifs);
                    setSelectedNotifs([]);
                  }} title="Delete">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                  </button>
                  <button className="icon-btn" onClick={() => {
                    markMultipleAsRead(selectedNotifs, true);
                    setSelectedNotifs([]);
                  }} title="Mark as read">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </button>
                  <button className="icon-btn" onClick={() => {
                    markMultipleAsRead(selectedNotifs, false);
                    setSelectedNotifs([]);
                  }} title="Mark as unread">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      <line x1="3" y1="3" x2="21" y2="21"/>
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="notification-list">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`notif-row ${notif.read ? 'read' : 'unread'} ${selectedNotifs.includes(notif.id) ? 'selected' : ''}`}
              >
                <label className="checkbox-wrapper" onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    checked={selectedNotifs.includes(notif.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      setSelectedNotifs(e.target.checked ? [...selectedNotifs, notif.id] : selectedNotifs.filter(id => id !== notif.id));
                    }}
                  />
                </label>
                <div className="notif-body">
                  <h4>{notif.title}</h4>
                  <p>{notif.text}</p>
                  <span className="notif-time">{notif.time
                              ? new Date(notif.time + "Z").toLocaleString("en-IN", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                  timeZone: "Asia/Kolkata",
                                })
                              : "—"}</span>
                </div>
                <button
                  className="icon-btn notif-toggle-btn"
                  title={notif.read ? 'Mark as unread' : 'Mark as read'}
                  onClick={() => notif.read ? markAsUnread(notif.id) : markAsRead(notif.id)}
                >
                  <span className="material-symbols-outlined">
                    {notif.read ? 'mark_email_unread' : 'mark_email_read'}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;