import {  Route, Routes } from 'react-router-dom'
import React from 'react' 
import './App.css'
import User from './user/User'
import D from './components/dashboard/D'
import Dashboard from './components/dashboard/Dashboard'
import MainLayout from './components/layout/MainLayout'

const App = () => { 
  return (
      <Routes>
         
         <Route path='/' element={<MainLayout />}>
            <Route index element={<Dashboard/>} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="user" element={<User />} />
            <Route path="d" element={<D />} />
          </Route>

      </Routes>
  )
}

export default App
