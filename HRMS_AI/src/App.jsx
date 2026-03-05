import { useState, useEffect } from 'react'
import {  Route, Routes, Navigate, useOutletContext, useNavigate } from 'react-router-dom'
import React from 'react' 
import './App.css'
import EditUser from './pages/edit-user/EditUser'
import D from './pages/D'
import Dashboard from './components/dashboard/Dashboard'
import MainLayout from './layout/MainLayout'
import Login from './pages/Login'
import { EmployeeContext } from './context/employeeContext'
import { setSessionExpiredCallback } from './services/api'

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('authToken');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const DashboardWrapper = () => {
  const { csvFile } = useOutletContext();
  return <Dashboard csvFile={csvFile} />;
};

const App = () => { 
  const [searchResult, setSearchResult] = useState({result: [], viewModeCard: null});
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setSessionExpiredCallback(() => {
      setShowSessionExpired(true);
    });
  }, []);

  const handleSessionExpiredClose = () => {
    setShowSessionExpired(false);
    navigate('/login');
  };

  return (
    <EmployeeContext.Provider value={{searchResult, setSearchResult}}>
      {showSessionExpired && (
        <div className="session-expired-modal">
          <div className="session-expired-content">
            <h2>Session Expired</h2>
            <p>Your session has expired due to inactivity. Please log in again.</p>
            <button onClick={handleSessionExpiredClose}>Go to Login</button>
          </div>
        </div>
      )}

       <Routes>
         <Route path="/login" element={<Login />} />
         
         <Route path='/' element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
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
