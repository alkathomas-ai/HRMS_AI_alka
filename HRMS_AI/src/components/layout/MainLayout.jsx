import React from 'react'
import Navbar from '../navbar/Navbar'
import { Outlet } from 'react-router-dom'

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
