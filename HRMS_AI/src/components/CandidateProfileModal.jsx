import React, { useState } from 'react';
import { X, ArrowLeft, Calendar, User, Mail, Phone, MapPin, Briefcase, Building, Clock, Copy, Check } from 'lucide-react';
import { getEmployeeDetails } from '../services/api';
import { useToast } from '../context/ToastContext';
import './CandidateProfileModal.css';

const CandidateProfileModal = ({ isOpen, onClose, employee, loading, error }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [isLoadingManager, setIsLoadingManager] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showError } = useToast();

  // Reset navigation state when a new employee is loaded
  React.useEffect(() => {
    if (employee && isOpen) {
      setCurrentEmployee(null);
      setNavigationHistory([]);
      setActiveTab('details');
    }
  }, [employee, isOpen]);

  // Use currentEmployee if navigating, otherwise use prop employee
  const displayEmployee = currentEmployee || employee;

  if (!isOpen) return null;

  const handleCopyEmployeeId = async () => {
    if (displayEmployee?.employee_id) {
      try {
        await navigator.clipboard.writeText(displayEmployee.employee_id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy employee ID:', err);
      }
    }
  };

  const handleManagerClick = async (managerId) => {
    if (!managerId || managerId === 'N/A') return;
    
    setIsLoadingManager(true);
    try {
      if (managerId && managerId.includes(' -')) {
        managerId = managerId.split(" -")[0].trim();
      }
      const response = await getEmployeeDetails(managerId);
      if (response?.status === 'success' && response?.employee) {
        // Add current employee to navigation history
        setNavigationHistory(prev => [...prev, displayEmployee]);
        setCurrentEmployee(response.employee);
        setActiveTab('details'); // Reset to details tab when navigating
      } else {
        const errorMessage = response?.message || 'No data found for this employee';
        showError(errorMessage);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error loading details';
      showError(errorMessage);
      console.error('Manager details API error:', err);
    } finally {
      setIsLoadingManager(false);
    }
  };

  const handleBackNavigation = () => {
    if (navigationHistory.length > 0) {
      const previousEmployee = navigationHistory[navigationHistory.length - 1];
      setCurrentEmployee(previousEmployee);
      setNavigationHistory(prev => prev.slice(0, -1));
    }
  };

  const handleClose = () => {
    setNavigationHistory([]);
    setCurrentEmployee(null);
    setActiveTab('details');
    setCopied(false);
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getInitials = (name) => {
    if (!name) return 'AP';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const tabs = [
    { id: 'details', label: 'Details' },
    // { id: 'attributes', label: 'Attributes' },
    // { id: 'security', label: 'Security' },
    { id: 'relationships', label: 'Relationships' }
  ];

  return (
    <div className="candidate-modal-overlay" onClick={onClose}>
      <div 
        className={`candidate-modal-container ${isOpen ? 'open' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="profile-modal-header">
          <div className="header-left">
            {navigationHistory.length > 0 ? (
              <button onClick={handleBackNavigation} className="back-button">
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
            ) : (
              <button onClick={handleClose} className="back-button">
                <X size={18} />
                <span>Close</span>
              </button>
            )}
          </div>
          <div className="header-right">
            {/* <button className="settings-button">
              <span>⚙️</span>
            </button> */}
          </div>
        </div>

        {/* Navigation Breadcrumb */}
        {/* {navigationHistory.length > 0 && (
          <div className="navigation-breadcrumb">
            <span className="breadcrumb-item">{employee?.display_name}</span>
            {navigationHistory.map((emp, index) => (
              <span key={index} className="breadcrumb-separator"> → {emp.display_name}</span>
            ))}
            <span className="breadcrumb-separator"> → {displayEmployee?.display_name}</span>
          </div>
        )} */}

        {/* Employee ID and Context */}
        <div className="employee-profile-header">
          <h1 className="employee-id">{displayEmployee?.display_name}</h1>
          <div className="security-context">
            <span className="security-icon"><span className="material-symbols-outlined">
id_card
</span></span>
            <span className="security-text">{displayEmployee?.employee_id}</span>
            <button 
              className="copy-button"
              onClick={handleCopyEmployeeId}
              title={copied ? 'Copied!' : 'Copy Employee ID'}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Created Date */}
        <div className="created-info">
          <Calendar size={16} />
          <span className="created-label">Created</span>
          <span className="created-date">{displayEmployee?.joined_date ? formatDate(displayEmployee.joined_date) : '11/30/2024 5:00AM'}</span>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="candidate-modal-content">
          {(loading || isLoadingManager) && (
            <div className="candidate-modal-loading">
              <div className="loading-spinner"></div>
              <span>{isLoadingManager ? 'Loading manager details...' : 'Loading employee details...'}</span>
            </div>
          )}

          {error && (
            <div className="candidate-modal-error">
              {error}
            </div>
          )}

          {displayEmployee && !loading && !isLoadingManager && (
            <div className="tab-content">
              {activeTab === 'details' && (
                <div className="details-tab">
                  {/* Basic Information */}
                  <div className="info-section">
                    <h3 className="section-title">Basic Information</h3>
                    <div className="info-grid">
                      <div className="info-row">
                        <span className="info-label">Employee ID</span>
                        <span className="info-value">{displayEmployee.employee_id || 'SYS_456'}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Full Name</span>
                        <span className="info-value">{displayEmployee.display_name || 'N/A'}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Department</span>
                        <span className="info-value">{displayEmployee.employee_department || 'Engineering'}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Designation</span>
                        <span className="info-value">{displayEmployee.designation || 'Software Engineer'}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Location</span>
                        <span className="info-value">{displayEmployee.emp_location || 'N/A'}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Experience</span>
                        <span className="info-value">{displayEmployee.total_exp || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  {displayEmployee.skill_set && (
                    <div className="skills-section">
                      <h3 className="section-title">Skills</h3>
                      <div className="skills-container">
                        {displayEmployee.skill_set.split(',').map((skill, index) => (
                          <span key={index} className="skill-tag">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Information */}
                  {/* <div className="info-section">
                    <h3 className="section-title">Contact Information</h3>
                    <div className="info-grid">
                      <div className="info-row">
                        <span className="info-label">Email</span>
                        <span className="info-value">{employee.email || 'N/A'}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Mobile</span>
                        <span className="info-value">{employee.mobile || 'N/A'}</span>
                      </div>
                    </div>
                  </div> */}
                </div>
              )}

              {/* {activeTab === 'attributes' && (
                <div className="attributes-tab">
                  <div className="info-section">
                    <h3 className="section-title">Attribute History</h3>
                    <div className="attribute-history">
                      <div className="attribute-item">
                        <div className="attribute-header">
                          <span className="attribute-user">{employee.rm_name || 'user.123'}</span>
                          <span className="attribute-date">{employee.joined_date ? formatDate(employee.joined_date) : '11/30/2024 - 5:30 AM'}</span>
                        </div>
                        <div className="attribute-action">
                          <span className="action-type published">Published</span>
                          <span className="action-value">status</span>
                        </div>
                      </div>
                      
                      <div className="attribute-item">
                        <div className="attribute-header">
                          <span className="attribute-user">{employee.pm || 'user.123'}</span>
                          <span className="attribute-date">11/30/2024 - 11:30 AM</span>
                        </div>
                        <div className="attribute-action">
                          <span className="action-type confidential">Confidential</span>
                          <span className="action-value">access_level</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="security-tab">
                  <div className="info-section">
                    <h3 className="section-title">Security Context</h3>
                    <div className="security-info">
                      <div className="security-item">
                        <span className="security-label">Security Classification</span>
                        <span className="security-value confidential">CONFIDENTIAL</span>
                      </div>
                      
                      <div className="security-controls">
                        <h4 className="controls-title">Access Controls</h4>
                        <div className="control-item">
                          <span className="control-icon">🔒</span>
                          <span className="control-text">MFA_REQUIRED</span>
                        </div>
                        <div className="control-item">
                          <span className="control-icon">🔒</span>
                          <span className="control-text">IP_RESTRICTED</span>
                        </div>
                        <div className="control-item">
                          <span className="control-icon">📋</span>
                          <span className="control-text">AUDIT_LOGGING_ENABLED</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )} */}

              {activeTab === 'relationships' && (
                <div className="relationships-tab">
                  <div className="info-section">
                    <h3 className="section-title">Reporting Structure</h3>
                    <div className="info-grid">
                      <div className="info-row">
                        <span className="info-label">Reporting Manager</span>
                        <span 
                          className={`info-value ${displayEmployee.rm_name && displayEmployee.rm_name !== 'N/A' && displayEmployee.rm_id ? 'clickable-manager' : ''}`}
                          onClick={() => displayEmployee.rm_name && displayEmployee.rm_name !== 'N/A' && displayEmployee.rm_id && handleManagerClick(displayEmployee.rm_id)}
                        >
                          {displayEmployee.rm_name || 'N/A'}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Tech Group</span>
                        <span className="info-value">{displayEmployee.tech_group || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Projects */}
                  {displayEmployee.projects && displayEmployee.projects.length > 0 && (
                    <div className="profile-projects-section">
                      <h3 className="section-title">Current Projects</h3>
                      <div className="projects-list">
                        {displayEmployee.projects.map((project, index) => (
                          <div key={index} className="project-item">
                            <div className="project-header">
                              <div className="project-name">{project.project_name}</div>
                              {project.deployment && (
                                <span className="deployment-type">{project.deployment}</span>
                              )}
                            </div>
                            <div className="project-details">
                              <span>PM: <span className={`info-value ${project.pm && project.pm !== 'N/A' ? 'clickable-manager' : ''}`} onClick={() => project.pm && project.pm !== 'N/A' && handleManagerClick(project.pm)}>{project.pm && project.pm.includes('-') ? project.pm.split("-")[1] : project.pm || 'N/A'}</span></span>
                              <span>Customer: {project.customer}</span>
                              <span>Role: {project.role}</span>
                              <span>Occupancy: {project.occupancy}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateProfileModal;