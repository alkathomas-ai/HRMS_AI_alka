import { useState } from 'react'
import {  Route, Routes, useOutletContext } from 'react-router-dom'
import React from 'react' 
import './App.css'
import EditUser from './pages/edit-user/EditUser'
import D from './pages/D'
import Dashboard from './components/dashboard/Dashboard'
import MainLayout from './layout/MainLayout'
import { EmployeeContext } from './context/employeeContext'

const DashboardWrapper = () => {
  const { csvFile } = useOutletContext();
  return <Dashboard csvFile={csvFile} />;
};

const App = () => { 
  const [searchResult, setSearchResult] = useState({result: [], viewModeCard: null});

  return (
    <EmployeeContext.Provider value={{searchResult, setSearchResult}}>

       <Routes>
         
         <Route path='/' element={<MainLayout />}>
            <Route index element={<DashboardWrapper/>} />
            <Route path="dashboard" element={<DashboardWrapper />} />
            <Route path="user" element={<EditUser />} />
            <Route path="d" element={<D />} />
          </Route>

      </Routes>

    </EmployeeContext.Provider>
     
  )
}

export default App
