import React, { useState } from 'react'
import "./Navbar.css"
import { useNavigate } from 'react-router-dom'
import { Icons } from '../../assets/icons'
import ColorPalette from './ColorPalette'



const Navbar = ({ notifications = [], onNotificationClick, onMarkAllRead }) => {

  const navigate = useNavigate()
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)

  const today = new Date();

  const day = today.getDate();
  const weekday = today.toLocaleDateString("en-US", { weekday: "short" });
  const month = today.toLocaleDateString("en-US", { month: "long" });

  const todayNotifications = notifications.filter(n => !n.read && n.time.includes('h ago'));
  const hasUnread = todayNotifications.length > 0;



  return (
      <header className="topbar">
        {/* Left section  */}
        <div className="topbar-left">
          <div className="logo">
            <img src={Icons.logo} className="logo-icon" />
            <span className="logo-text">HRMS.AI</span>
          </div>
        </div>

        {/* Center icons */}
        <div className="topbar-center">
          <button onClick={() => {
            navigate("/")
          }} className="icon-btn" aria-label="Home">
            <img src={Icons.home} alt="Home" className="icon-svg" />
          </button>
          <button onClick={() => {
            navigate("/user")
          }} className="icon-btn" aria-label="Users">
            <img src={Icons.people} alt="Users" className="icon-svg" />
          </button>
          <button className="icon-btn" aria-label="Documents">
            <img src={Icons.doc} alt="Documents" className="icon-svg" />
          </button>
          <button className="icon-btn" aria-label="Reports">
            <img src={Icons.pie} alt="Reports" className="icon-svg" />
          </button>
          <button className="icon-btn" aria-label="Notes">
            <img src={Icons.note} alt="Notes" className="icon-svg" />
          </button>
        </div>

        {/* Right section */}
        <div className="topbar-right">
          <ColorPalette />
          <div className="date">
            <span className="day">{day}</span>
            <div className="date-meta">
              <span className="weekday">{weekday}</span>
              <span className="month">{month}</span>
            </div>
          </div>


          <div className="notif-wrapper">
            <button className="icon-btn" aria-label="Notifications" onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
              <img src={Icons.bell} alt="Notifications" className="icon-svg" />
              {hasUnread && <span className="notif-badge"></span>}
            </button>
            {showNotifDropdown && (
              <div className="notif-dropdown">
                <div className="notif-dropdown-header">
                  <h4>Notifications</h4>
                  {todayNotifications.length > 0 && (
                    <button className="mark-all-read" onClick={() => onMarkAllRead?.()}>Mark all as read</button>
                  )}
                </div>
                <div className="notif-dropdown-list">
                  {todayNotifications.length > 0 ? (
                    todayNotifications.map(notif => (
                      <div key={notif.id} className="notif-dropdown-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
                        </svg>
                        <div>
                          <h5>{notif.title}</h5>
                          <p>{notif.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="notif-empty">No new notifications</div>
                  )}
                </div>
                <button className="notif-show-all" onClick={() => {
                  setShowNotifDropdown(false);
                  onNotificationClick?.();
                }}>Show all notifications</button>
              </div>
            )}
          </div>

          <div className="avatar">
            <img src="https://i.pravatar.cc/32" alt="User avatar" />
          </div>
        </div>
      </header>
  )
}

export default Navbar