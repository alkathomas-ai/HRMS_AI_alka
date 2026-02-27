import { useState, useMemo, useEffect } from "react";
import { Icons } from "../../assets/icons";
import "./Dashboard.css";
import "./Schedule.css";

const Schedule = ({ isExpanded, onExpand, onClose, activeTab: externalTab, onTabChange }) => {
  // --- STATE FOR COMPACT VIEW ---
  const [activeTab, setActiveTab] = useState('Screening');
  const [selectedDateIndex, setSelectedDateIndex] = useState(null);

  // --- STATE FOR EXPANDED VIEW ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expandedTab, setExpandedTab] = useState('schedule');
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
  const [selectedNotifs, setSelectedNotifs] = useState([]);

  // Sync with external tab
  useEffect(() => {
    if (externalTab) setExpandedTab(externalTab);
  }, [externalTab]);

  // --- SHARED DATA ---
  const scheduleData = {
    Screening: [
      { time: '09:30', text: 'Interview with Candidate A', role: "Software Engineer" },
      { time: '11:00', text: 'Technical Assessment Review', role: "Senior Developer" },
      { time: '12:30', text: 'HR Screening Call', role: "HR Manager" },
      { time: '14:00', text: 'Team Fit Interview', role: "Team Lead" },
      { time: '15:30', text: 'Final Round Discussion', role: "Department Head" }
    ],
    'Design Task': [
      { time: '10:00', text: 'UI/UX Portfolio Review', role: "Designer" },
      { time: '14:00', text: 'Design Challenge Presentation', role: "Product Manager" }
    ],
    Interview: [
      { time: '09:00', text: 'Technical Interview - Backend Role', role: "Lead Developer" },
      { time: '13:00', text: 'Behavioral Interview', role: "HR Specialist" },
      { time: '15:30', text: 'Final Round - Senior Position', role: "CTO" }
    ]
  };

  // --- EXPANDED VIEW DATA (matching the design) ---
  const expandedScheduleData = [
    { 
      time: '08:00 AM', 
      name: 'Sarah Johnson', 
      role: 'Software Engineer - Frontend',
      category: 'staff'
    },
    { 
      time: '09:00 AM', 
      name: 'Michael Chen', 
      role: 'Senior Backend Developer',
      status: 'Rescheduled',
      originalTime: '09:00 AM',
      category: 'rescheduled'
    },
    { 
      time: '09:30 AM', 
      name: 'Emily Rodriguez', 
      role: 'DevOps Engineer',
      category: 'staff'
    },
    { 
      time: '10:30 AM', 
      name: 'David Kumar', 
      role: 'Technical Lead - Cloud Services',
      category: 'manager'
    }
  ];

  // --- LOGIC FOR COMPACT VIEW (Week Days) ---
  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - currentDay);
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      const isToday = date.toDateString() === today.toDateString();
      if (isToday && selectedDateIndex === null) {
        setSelectedDateIndex(i);
      }
      return {
        day: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][i],
        date: date.getDate(),
        isToday
      };
    });
  }, [selectedDateIndex]);

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

  const parseTime = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return hour;
  };

  // Get current time for red line indicator
  const getCurrentTime = () => {
    const now = new Date();
    return {
      hour: now.getHours(),
      minute: now.getMinutes(),
      // Calculate position within the hour (0-100%)
      percentage: (now.getMinutes() / 60) * 100
    };
  };

  const currentTime = getCurrentTime();

  // Generate all 24 hours
  const allHours = Array.from({ length: 24 }, (_, i) => i);

  // =========================================================
  // RENDER: COMPACT VIEW (Original Design)
  // =========================================================
  if (!isExpanded) {
    return (
      <div className="schedule-card compact">
        <div className="header">
          <h3>Schedule</h3>
          <span className="expand-icon" onClick={onExpand}>
            <span className="material-symbols-outlined">arrow_outward</span>
          </span>
        </div>

        <div className="dates">
          {weekDays.map((day, idx) => (
            <div 
              key={idx} 
              className={`${selectedDateIndex === idx ? 'active' : ''} ${day.isToday ? 'today' : ''}`}
              onClick={() => setSelectedDateIndex(idx)}
              style={{ cursor: 'pointer' }}
            >
              <span>{day.day}</span>
              <p>{day.date}</p>
            </div>
          ))}
        </div>

        <div className="tabs">
          {Object.keys(scheduleData).map(tab => (
            <span 
              key={tab}
              className={activeTab === tab ? 'active' : ''}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </span>
          ))}
        </div>

        <div className="schedule-list">
          {scheduleData[activeTab].map((item, idx) => (
            <div key={idx} className="item">
              <span className="time">{item.time}</span>
              <span className="text">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER: EXPANDED VIEW (Matching the Design)
  // =========================================================
  return (
    <div className="schedule-expanded-wrapper">
      {/* TAB SWITCHER */}
      <div className="expanded-tabs">
        <button 
          className={expandedTab === 'schedule' ? 'active' : ''}
          onClick={() => {
            setExpandedTab('schedule');
            onTabChange?.('schedule');
          }}
        >
          Schedule
        </button>
        <button 
          className={expandedTab === 'notification' ? 'active' : ''}
          onClick={() => {
            setExpandedTab('notification');
            onTabChange?.('notification');
          }}
        >
          Notification
        </button>
      </div>

      {expandedTab === 'schedule' ? (
        <>
          {/* HEADER AT TOP */}
          <header className="timeline-header">
            <div className="date-title">
              <h2>September 18, Tuesday <span className="text-light">2022</span></h2>
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

                  {/* Events */}
                  {expandedScheduleData
                    .filter((e) => parseTime(e.time) === hour)
                    .map((event, idx) => (
                      <div 
                        key={idx} 
                        className={`event-card ${event.category} ${event.status ? 'rescheduled' : ''}`}
                      >
                        <div className="event-header-row">
                          <div className="event-title">{event.name}</div>
                          {event.status && (
                            <span className="event-status">{event.status}</span>
                          )}
                        </div>
                        <div className="event-meta">
                          {event.time} · {event.role}
                        </div>
                      </div>
                    ))}
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
            {expandedScheduleData.map((event, idx) => (
              <div key={idx} className="summary-card">
                <h5>{event.name}</h5>
                <p>{event.time} · {event.role}</p>
              </div>
            ))}
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
                    setNotifications(notifications.filter(n => !selectedNotifs.includes(n.id)));
                    setSelectedNotifs([]);
                  }} title="Delete">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                  </button>
                  <button className="icon-btn" onClick={() => {
                    setNotifications(notifications.map(n => selectedNotifs.includes(n.id) ? {...n, read: true} : n));
                    setSelectedNotifs([]);
                  }} title="Mark as read">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </button>
                  <button className="icon-btn" onClick={() => {
                    setNotifications(notifications.map(n => selectedNotifs.includes(n.id) ? {...n, read: false} : n));
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
                onClick={(e) => {
                  if (e.target.type !== 'checkbox') {
                    setNotifications(notifications.map(n => n.id === notif.id ? {...n, read: true} : n));
                  }
                }}
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
                  <span className="notif-time">{notif.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;