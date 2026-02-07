import { useState, useMemo } from "react";
import { Icons } from "../../assets/icons";
import "./Dashboard.css";
import "./Schedule.css";

const Schedule = ({ isExpanded, onExpand, onClose }) => {
  // --- STATE FOR COMPACT VIEW ---
  const [activeTab, setActiveTab] = useState('Screening');
  const [selectedDateIndex, setSelectedDateIndex] = useState(null);

  // --- STATE FOR EXPANDED VIEW ---
  const [currentDate, setCurrentDate] = useState(new Date());

  // --- SHARED DATA ---
  const scheduleData = {
    Screening: [
      { time: '09:30', text: 'Interview with Habibur Rahman', role: "Kitchen Staff" },
      { time: '11:00', text: 'Design Task Review & QA', role: "Chef" },
      { time: '12:30', text: 'Design Task Review', role: "Manager" },
      { time: '14:00', text: 'Team Meeting', role: "Staff" },
      { time: '15:30', text: 'Client Call - ABC Corp', role: "Client" }
    ],
    'Design Task': [
      { time: '10:00', text: 'UI/UX Design Review', role: "Designer" },
      { time: '14:00', text: 'Prototype Presentation', role: "Product Owner" }
    ],
    Interview: [
      { time: '09:00', text: 'Technical Interview - John Doe', role: "Lead Dev" },
      { time: '13:00', text: 'HR Interview - Jane Smith', role: "HR" },
      { time: '15:30', text: 'Final Round - Mike Johnson', role: "CTO" }
    ]
  };

  // --- EXPANDED VIEW DATA (matching the design) ---
  const expandedScheduleData = [
    { 
      time: '08:00 AM', 
      name: 'James Williams', 
      role: 'Kitchen Staff Local',
      category: 'staff'
    },
    { 
      time: '09:00 AM', 
      name: 'Willem van Helden', 
      role: 'Dishwasher',
      status: 'Rescheduled',
      originalTime: '09:00 AM',
      category: 'rescheduled'
    },
    { 
      time: '09:30 AM', 
      name: 'Dianne Russell', 
      role: 'Dishwasher',
      category: 'staff'
    },
    { 
      time: '10:30 AM', 
      name: 'Theresa Webb', 
      role: 'Operational Manager Regional',
      category: 'manager'
    }
  ];

  // --- LOGIC FOR COMPACT VIEW (Week Days) ---
  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const isToday = date.toDateString() === today.toDateString();
      if (isToday && selectedDateIndex === null) {
        setSelectedDateIndex(i);
      }
      return {
        day: ['M', 'T', 'W', 'T', 'F', 'S'][i],
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
            <img src={Icons.expand} alt="" />
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
          <button className="btn-settings" onClick={onClose}>⚙ Settings</button>
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
    </div>
  );
};

export default Schedule;