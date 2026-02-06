import React from 'react'
import "./Navbar.css"
import { useNavigate } from 'react-router-dom'
import { Icons } from '../../assets/icons'



const Navbar = () => {

  const navigate = useNavigate()

  const today = new Date();

  const day = today.getDate();
  const weekday = today.toLocaleDateString("en-US", { weekday: "short" });
  const month = today.toLocaleDateString("en-US", { month: "long" });



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
          <div className="date">
            <span className="day">{day}</span>
            <div className="date-meta">
              <span className="weekday">{weekday}</span>
              <span className="month">{month}</span>
            </div>
          </div>


          <button className="icon-btn" aria-label="Notifications">
            <img src={Icons.bell} alt="Notifications" className="icon-svg" />
          </button>

          <div className="avatar">
            <img src="https://i.pravatar.cc/32" alt="User avatar" />
          </div>
        </div>
      </header>
  )
}

export default Navbar
