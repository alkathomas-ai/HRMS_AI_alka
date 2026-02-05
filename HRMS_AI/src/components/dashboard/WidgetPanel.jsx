import React, { useState, useEffect, useRef } from 'react';
import GridLayout from 'react-grid-layout';
import './Dashboard.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Icons } from '../../assets/icons';

const WidgetPanel = ({ isExpanded, onExpand, onClose }) => {
  const [layout, setLayout] = useState([
    { i: 'frontend', x: 0, y: 0, w: 2, h: 1 },
    { i: 'backend', x: 0, y: 0, w: 2, h: 1 },
    { i: 'devops', x: 0, y: 0, w: 4, h: 1 }
  ]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedWidgets, setSelectedWidgets] = useState(['frontend', 'backend', 'devops']);
  const dropdownRef = useRef(null);
  const [dragEnabledWidgets, setDragEnabledWidgets] = useState(new Set());

  const widgetTemplates = {
    frontend: { title: 'Frontend Dashboard', content: 'Frontend development metrics' },
    backend: { title: 'Backend Dashboard', content: 'Backend services monitoring' },
    fullstack: { title: 'Full Stack Dashboard', content: 'Complete application overview' },
    mobile: { title: 'Mobile Dashboard', content: 'Mobile app development' },
    devops: { title: 'DevOps Dashboard', content: 'Infrastructure status' }
  };

  const getWidgetData = (id) => {
    return widgetTemplates[id] || { title: 'Widget', content: 'Content' };
  };

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
    if (selectedWidgets.includes(widgetId)) {
      setSelectedWidgets(prev => prev.filter(id => id !== widgetId));
      setLayout(prev => prev.filter(item => item.i !== widgetId));
    } else {
      setSelectedWidgets(prev => [...prev, widgetId]);
      setLayout(prev => [...prev, { i: widgetId, x: 0, y: 0, w: 2, h: 3 }]);
    }
  };

  const removeWidget = (id) => {
    setLayout(prev => prev.filter(item => item.i !== id));
    setSelectedWidgets(prev => prev.filter(widgetId => widgetId !== id));
  };

  const onLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  const handleDoubleClick = (widgetId) => {
    setDragEnabledWidgets(prev => new Set([...prev, widgetId]));
  };

  const onDragStop = () => {
    // Clear all drag enabled widgets after any drag operation
    setDragEnabledWidgets(new Set());
  };

  return (
    <div className={`grid-container ${!isExpanded && isExpanded !== null ? 'compact' : ''}`} data-expanded={isExpanded}>
      <div className="dashboard-header">
        <div className="welcome">
           <div className='d-flex justify-btwn align-center'>
               <h2>Welcome back,</h2>
                {!isExpanded && isExpanded !== null && (
                    <span className="expand-icon" onClick={onExpand}>
                        <img src={Icons.expand} alt="" />
                    </span>
                )}
           </div>
          <p>Great talent awaits. Let's hire smart!</p>
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
              {['frontend', 'backend', 'fullstack', 'mobile', 'devops'].map(opt => (
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

      <GridLayout
        className="layout"
        layout={layout}
        cols={6}
        rowHeight={50}
        width={1200}
        onLayoutChange={onLayoutChange}
        onDragStop={onDragStop}
        isDraggable={false}
        dragHandleClassName="drag-enabled"
        isResizable={true}
        compactType="vertical"
        preventCollision={false}
      >
        {layout.filter(widget => selectedWidgets.includes(widget.i)).map(widget => {
          const widgetData = getWidgetData(widget.i);
          const isDragEnabled = dragEnabledWidgets.has(widget.i);
          return (
            <div 
              key={widget.i} 
              className={`grid-item ${isDragEnabled ? 'drag-mode' : ''} ${isDragEnabled ? 'drag-enabled' : ''}`}
              onDoubleClick={() => handleDoubleClick(widget.i)}
            >
              <div className="grid-item-content">
                <div className="grid-item-header">
                  <h4>{widgetData.title}</h4>
                  <span className='close-btn' onClick={() => removeWidget(widget.i)}>×</span>
                </div>
                <p>{widgetData.content}</p>
                {isDragEnabled && (
                  <div className="drag-indicator">Drag mode active - Click and drag to move</div>
                )}
              </div>
            </div>
          );
        })}
      </GridLayout>
    </div>
  );
};

export default WidgetPanel;