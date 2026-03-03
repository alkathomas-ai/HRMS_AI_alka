import React from 'react';
import './StatsWidget.css';

const StatsWidget = ({ employeeCount, projectCount, freepoolCount }) => {
  return (
    <div className="stats-widget-container">
      <div className="stat-widget-card">
        <div className="stat-widget-icon employees">
          <i className="fa-solid fa-users"></i>
        </div>
        <div className="stat-widget-content">
          <div className="stat-widget-value">{employeeCount}</div>
          <div className="stat-widget-label">Total Employees</div>
        </div>
      </div>

      <div className="stat-widget-card">
        <div className="stat-widget-icon projects">
          <i className="fa-solid fa-diagram-project"></i>
        </div>
        <div className="stat-widget-content">
          <div className="stat-widget-value">{projectCount}</div>
          <div className="stat-widget-label">Active Projects</div>
        </div>
      </div>

      <div className="stat-widget-card">
        <div className="stat-widget-icon freepool">
          <i className="fa-solid fa-user-check"></i>
        </div>
        <div className="stat-widget-content">
          <div className="stat-widget-value">{freepoolCount}</div>
          <div className="stat-widget-label">Free Pool</div>
        </div>
      </div>
    </div>
  );
};

export default StatsWidget;
