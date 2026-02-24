import { useState } from 'react'
import {  Route, Routes } from 'react-router-dom'
import React from 'react' 
import './App.css'
import EditUser from './pages/edit-user/EditUser'
import D from './pages/D'
import Dashboard from './components/dashboard/Dashboard'
import MainLayout from './layout/MainLayout'
import { EmployeeContext } from './context/employeeContext'

const App = () => { 
  const [searchResult, setSearchResult] = useState({result: [], viewModeCard: null});

  return (
    <EmployeeContext.Provider value={{searchResult, setSearchResult}}>

       <Routes>
         
         <Route path='/' element={<MainLayout />}>
            <Route index element={<Dashboard/>} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="user" element={<EditUser />} />
            <Route path="d" element={<D />} />
          </Route>

      </Routes>

    </EmployeeContext.Provider>
     
  )
}

export default App
