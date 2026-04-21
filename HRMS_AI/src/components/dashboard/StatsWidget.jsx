import React, { useState, useEffect } from 'react';
import './StatsWidget.css';

const StatsWidget = ({ employeeCount, projectCount, freepoolCount, onOpenAddModal }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Get custom stats from localStorage
  const customStats = JSON.parse(localStorage.getItem('customStats') || '[]');

  // Listen for localStorage changes to refresh the component
  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event when stats are added
    window.addEventListener('statsUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('statsUpdated', handleStorageChange);
    };
  }, []);

  const handleRemoveStat = (statId) => {
    const updatedStats = customStats.filter(stat => stat.id !== statId);
    localStorage.setItem('customStats', JSON.stringify(updatedStats));
    window.dispatchEvent(new Event('statsUpdated'));
  };

  const defaultStats = [
    {
      id: 'employees',
      value: employeeCount,
      label: 'Total Employees',
      icon: 'fa-solid fa-users'
    },
    {
      id: 'projects',
      value: projectCount,
      label: 'Active Projects',
      icon: 'fa-solid fa-diagram-project'
    },
    {
      id: 'freepool',
      value: freepoolCount,
      label: 'Free Pool',
      icon: 'fa-solid fa-user-check'
    }
  ];

  const allStats = [...defaultStats, ...customStats];

  return (
    <div className="stats-widget">
      <div className="stats-widget-container" key={refreshKey}>
        {allStats.map((stat) => {
          const isCustomStat = customStats.some(customStat => customStat.id === stat.id);
          
          return (
            <div key={stat.id} className={`stat-widget-card ${isCustomStat ? 'custom-stat' : ''}`}>
              {isCustomStat && (
                <button 
                  className="stat-remove-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveStat(stat.id);
                  }}
                  title="Remove stat"
                >
                  ×
                </button>
              )}
              <div className="stat-widget-icon">
                <i className={stat.icon}></i>
              </div>
              <div className="stat-widget-content">
                <div className="stat-widget-value">{stat.value}</div>
                <div className="stat-widget-label">{stat.label}</div>
              </div>
            </div>
          );
        })}

        <div className="stat-widget-card">
          <div className="stats-add-btn" onClick={onOpenAddModal}>
            <i className="fa-solid fa-plus"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsWidget;
