import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';
import { Icons } from '../../assets/icons';

const WidgetPanel = ({ isExpanded, onExpand, onClose }) => {
  const [widgets, setWidgets] = useState([
    { id: 'frontend' },
    { id: 'backend' },
    { id: 'devops' }
  ]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedWidgets, setSelectedWidgets] = useState(['frontend', 'backend', 'devops']);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleWidget = (widgetId) => {
    setSelectedWidgets(prev => 
      prev.includes(widgetId) 
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
    
    // Add widget back to widgets array if it doesn't exist
    setWidgets(prev => {
      if (!prev.some(w => w.id === widgetId)) {
        return [...prev, { id: widgetId }];
      }
      return prev;
    });
  };

  const removeWidget = (id) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
    setSelectedWidgets(prev => prev.filter(widgetId => widgetId !== id));
  };

  return (
    <div className="grid-container">

      {/* HEADER */}
      <div className="dashboard-header">
        <div className="welcome">
           <div className='d-flex justify-btwn align-center'>
               <h2>Welcome back,</h2>
                {/* <span className="expand-icon">
                {!isExpanded ? (
                    <button onClick={onExpand}>⤢</button>
                ) : (
                    <button onClick={onClose}>✕</button>
                )}
                </span> */}
                {!isExpanded && (
                    <span className="expand-icon" onClick={onExpand}>
                        <img src={Icons.expand} alt="" />
                    </span>
                    )
                }
           </div>
          <p>Great talent awaits. Let’s hire smart!</p>
        </div>


        <div className="stats">
          <div className="stat">
            <h3>67</h3>
            <span>
              <i className="fa-regular fa-user"></i> New Applied
            </span>
          </div>
          <div className="stat">
            <h3>24</h3>
            <span>
              <i className="fa-regular fa-eye"></i> Reviewed
            </span>
          </div>
          <div className="stat">
            <h3>06</h3>
            <span>
              <i className="fa-regular fa-circle-check"></i> Offered
            </span>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="filter-controls">

          <div className="search-input">
            <input type="text" placeholder="Search Widgets..." />
            <i className="fa-solid fa-search"></i>
          </div>

          <div className="multi-select" ref={dropdownRef}>
            <div className="select-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <span className="placeholder">Select Widgets</span>
              <i className="fa-solid fa-chevron-down"></i>
            </div>

            {isDropdownOpen && (
            <div className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
              {['frontend', 'backend', 'devops'].map(opt => (
                <div key={opt} className="option">
                  <input 
                    type="checkbox" 
                    id={opt} 
                    checked={selectedWidgets.includes(opt)}
                    onChange={() => toggleWidget(opt)}
                  />
                  <label htmlFor={opt}>{opt}</label>
                </div>
              ))}
            </div>
            )}
          </div>

        </div>

        <div className="actions">
          <button className="primary-btn">
            Create a Job <span className="plus">+</span>
          </button>
        </div>
      </div>

      {/* WIDGETS */}
      <div className="responsive-grid">
        {widgets.filter(widget => selectedWidgets.includes(widget.id)).map(widget => (
          <div key={widget.id} className="grid-item-content">
            <div className="grid-item-header">
              <h4>{widget.id}</h4>
              <button onClick={() => removeWidget(widget.id)}>×</button>
            </div>
            <p>Widget content here</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default WidgetPanel;
