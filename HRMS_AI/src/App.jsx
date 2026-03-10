import { useState, useMemo, useEffect } from 'react'
import {  Route, Routes, Navigate, useOutletContext, useNavigate } from 'react-router-dom'
import React from 'react' 
import './App.css'
import EditUser from './pages/edit-user/EditUser'
import D from './pages/D'
import Dashboard from './components/dashboard/Dashboard'
import MainLayout from './layout/MainLayout'
import Login from './pages/Login'
import { EmployeeContext } from './context/employeeContext'
import { ScheduleNotificationProvider } from './context/scheduleNotificationContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import { setSessionExpiredCallback } from './services/api'
import Schedule from './components/dashboard/Schedule'

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

  const contextValue = useMemo(() => ({
    searchResult,
    setSearchResult
  }), [searchResult]);
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
    <ErrorBoundary>
      <EmployeeContext.Provider value={contextValue}>
        <ScheduleNotificationProvider>
         <Routes>
           <Route path="/login" element={<Login />} />
           
           <Route path='/' element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<DashboardWrapper/>} />
              <Route path="dashboard" element={<DashboardWrapper />} />
              <Route path="user" element={<EditUser />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="d" element={<D />} />
            </Route>

        </Routes>
        </ScheduleNotificationProvider>
      </EmployeeContext.Provider>
    </ErrorBoundary>
  )
}

export default App
