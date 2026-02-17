import React from 'react'
import Navbar from '../components/navbar/Navbar'
import { Outlet } from 'react-router-dom'
import './MainLayout.css'

const MainLayout = () => {
  return (
    <>
        <Navbar />
        <div className="page-content">
            <Outlet />
        </div>
    </>
  )
}

export default MainLayout
