import React from 'react'
import Navbar from '../navbar/Navbar'
import { Outlet } from 'react-router-dom'
import './MainLayout.css'

const MainLayout = () => {
  return (
    <>
        <div className="page-content">
            <Outlet />
        </div>
    </>
  )
}

export default MainLayout
