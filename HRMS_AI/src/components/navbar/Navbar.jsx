import React from 'react'
import "./Navbar.css"
import { useNavigate } from 'react-router-dom'
import { Icons } from '../../assets/icons'



const Navbar = () => {

    const navigate = useNavigate()




  return (
    <div>
        <header className="topbar">
  {/* Left section  */}
  <div className="topbar-left">
    <div className="logo">
      <img src={Icons.logo} className="logo-icon"/>
      <span className="logo-text">HRMS.AI</span>
    </div>
  </div>

   {/* Center icons */}
  <div className="topbar-center">
    <button onClick={()=>{
        navigate("/")
    }} className="icon-btn" aria-label="Home">
      <img src={Icons.home} alt="Home" className="icon-svg"/>
    </button>
    <button onClick={()=>{
        navigate("/user")
    }} className="icon-btn" aria-label="Users">
      <img src={Icons.people} alt="Users" className="icon-svg"/>
    </button>
    <button className="icon-btn" aria-label="Documents">
      <img src={Icons.doc} alt="Documents" className="icon-svg"/>
    </button>
    <button className="icon-btn" aria-label="Reports">
      <img src={Icons.pie} alt="Reports" className="icon-svg"/>
    </button>
    <button className="icon-btn" aria-label="Notes">
      <img src={Icons.note} alt="Notes" className="icon-svg"/>
    </button>
  </div>

   {/* Right section */}
  <div className="topbar-right">
    <div className="date">
      <span className="day">19</span>
      <div className="date-meta">
        <span className="weekday">Thu</span>
        <span className="month">September</span>
      </div>
    </div>


    <button className="icon-btn" aria-label="Notifications">
      <img src={Icons.bell} alt="Notifications" className="icon-svg"/>
    </button>

    <div className="avatar">
      <img src="https://i.pravatar.cc/32" alt="User avatar"/>
    </div>
  </div>
</header>

      
    </div>
  )
}

export default Navbar
