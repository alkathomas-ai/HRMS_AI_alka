import React, { useState, useEffect, useRef } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './WidgetPanel.css';
import { Icons } from '../../assets/icons';
import { getProjectDistributions, getEmployeeDirectory, getEmployeeCount, getDepartment } from '../../services/api';
import Alert from '../common/Alert';

const SortableWidget = ({ id, children, isPinned }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const itemRef = useRef(null);

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div ref={(node) => { setNodeRef(node); itemRef.current = node; }} style={style} {...attributes} {...listeners} className={`masonry-item ${isPinned ? 'pinned' : ''}`}>
      {children}
    </div>
  );
};

const WidgetPanel = ({ isExpanded, onExpand, onClose }) => {
  const [selectedWidgets, setSelectedWidgets] = useState(['project-distribution', 'department-overview', 'employee-directory']);
  const [pinnedWidgets, setPinnedWidgets] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const dropdownRef = useRef(null);

  const [projectDistribution, setProjectDistribution] = useState({ projects: [], total_employees: 0 });
  const [departmentData, setDepartmentData] = useState({ departments: [] });
  const [employeeDirectory, setEmployeeDirectory] = useState({ employees: [] });
  const [employeeCount, setEmployeeCount] = useState({ employeeCount: 0, freepoolCount: 0, projectCount: 0 });
  const [employeePage, setEmployeePage] = useState(0);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const containerRef = useRef(null);
  const employeesPerPage = 5;

  const availableWidgets = [
    { id: 'project-distribution', label: 'Project Distribution' },
    { id: 'department-overview', label: 'Department Overview' },
    { id: 'employee-directory', label: 'Employee Directory' },
    { id: 'available-employees', label: 'Available Employees' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projects, departments, employees, counts] = await Promise.all([
          getProjectDistributions(),
          getDepartment(),
          getEmployeeDirectory(),
          getEmployeeCount()
        ]);
        setProjectDistribution({ projects: projects.projects, total_employees: projects.total_employees });
        setDepartmentData({ departments: departments.departments });
        setEmployeeDirectory({ employees: employees.employees });
        setEmployeeCount({ 
          employeeCount: counts.employee_count || 0, 
          projectCount: counts.project_count || 0, 
          freepoolCount: counts.freepool_count || 0 
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  const toggleWidget = (widgetId) => {
    if (selectedWidgets.includes(widgetId)) {
      setSelectedWidgets(prev => prev.filter(id => id !== widgetId));
    } else {
      setSelectedWidgets(prev => [...prev, widgetId]);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSelectedWidgets((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newItems = [...items];
        newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, active.id);
        return newItems;
      });
    }
  };

  const removeWidget = (id) => {
    setSelectedWidgets(prev => prev.filter(widgetId => widgetId !== id));
    setPinnedWidgets(prev => prev.filter(widgetId => widgetId !== id));
  };

  const togglePin = (id) => {
    setPinnedWidgets(prev => {
      if (prev.includes(id)) {
        return prev.filter(widgetId => widgetId !== id);
      } else if (prev.length >= 3) {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        return prev;
      } else {
        return [...prev, id];
      }
    });
  };

  const renderPieChart = (data) => {
    if (!data?.projects?.length) return null;

    const gradients = [
      { id: 'grad1', colors: ['#667eea', '#764ba2'] },
      { id: 'grad2', colors: ['#f093fb', '#f5576c'] },
      { id: 'grad3', colors: ['#4facfe', '#00f2fe'] },
      { id: 'grad4', colors: ['#43e97b', '#38f9d7'] }
    ];
    
    const circumference = 2 * Math.PI * 55;
    let currentOffset = 0;
    const totalEmployees = data.total_employees || 1;

    return (
      <div className="modern-pie-chart">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <defs>
            {gradients.map(grad => (
              <linearGradient key={grad.id} id={grad.id} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={grad.colors[0]} />
                <stop offset="100%" stopColor={grad.colors[1]} />
              </linearGradient>
            ))}
          </defs>
          
          {data.projects.slice(0, 4).map((project, index) => {
            const percentage = project.employee_count / totalEmployees;
            const strokeDasharray = `${circumference * percentage} ${circumference}`;
            const strokeDashoffset = -currentOffset;
            currentOffset += circumference * percentage;
            
            return (
              <circle
                key={project.project}
                cx="70" cy="70" r="55"
                fill={index === 0 ? "#f8f9fa" : "transparent"}
                stroke={`url(#${gradients[index].id})`}
                strokeWidth="16"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 70 70)"
                onMouseEnter={() => setHoveredSegment({ project: project.project, count: project.employee_count })}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            );
          })}
          
          <circle cx="70" cy="70" r="25" fill="white" />
          <text x="70" y="75" textAnchor="middle" fontSize="14" fontWeight="600" fill="#333">
            {totalEmployees}
          </text>
        </svg>
        
        {hoveredSegment && (
          <div className="chart-tooltip">
            <div className="tooltip-content">
              <strong>{hoveredSegment.project}</strong>
              <span>{hoveredSegment.count} employees</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProgressChart = (data) => {
    const maxCount = Math.max(...data.departments.map(d => d.employee_count));
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ff6b6b'];
    
    return (
      <div className="progress-chart-container">
        {data.departments.slice(0, 6).map((dept, index) => {
          const percentage = (dept.employee_count / maxCount) * 100;
          return (
            <div key={dept.department} className="progress-item">
              <div className="progress-header">
                <span className="dept-name">{dept.department.length > 20 ? dept.department.substring(0, 20) + '...' : dept.department}</span>
                <span className="dept-count">{dept.employee_count}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${percentage}%`, background: colors[index % colors.length] }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWidget = (widgetId) => {
    switch (widgetId) {
      case 'project-distribution':
        return (
          <>
            <div className="grid-item-header">
              <h4>Project Distribution</h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); togglePin(widgetId); }}
                  className={`pin-btn ${pinnedWidgets.includes(widgetId) ? 'pinned' : ''}`}
                >
                  <img src={Icons.pin} alt="" />
                </button>
                <span className='close-btn' onClick={() => removeWidget(widgetId)}>×</span>
              </div>
            </div>
            <span className="widget-subtitle">{projectDistribution.total_employees} Total employees</span>
            <div className="pie-chart-container">
              {renderPieChart(projectDistribution)}
              <div className="chart-legend">
                {projectDistribution.projects.slice(0, 4).map((project, index) => {
                  const percentage = Math.round((project.employee_count / projectDistribution.total_employees) * 100);
                  const gradientColors = [
                    { start: '#667eea', end: '#764ba2' },
                    { start: '#f093fb', end: '#f5576c' },
                    { start: '#4facfe', end: '#00f2fe' },
                    { start: '#43e97b', end: '#38f9d7' }
                  ];
                  return (
                    <div key={project.project} className="modern-legend-item">
                      <div className="modern-legend-color" style={{ background: `linear-gradient(135deg, ${gradientColors[index].start}, ${gradientColors[index].end})` }} />
                      <span className="legend-text">{project.project}</span>
                      <span className="legend-percentage">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        );
      
      case 'department-overview':
        return (
          <>
            <div className="grid-item-header">
              <h4>Department Overview</h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); togglePin(widgetId); }}
                  className={`pin-btn ${pinnedWidgets.includes(widgetId) ? 'pinned' : ''}`}
                >
                  <img src={Icons.pin} alt="" />
                </button>
                <span className='close-btn' onClick={() => removeWidget(widgetId)}>×</span>
              </div>
            </div>
            <div className="widget-subtitle">
              <div className="subtitle-number">{departmentData.departments.reduce((sum, d) => sum + d.employee_count, 0)}</div>
              <div className="subtitle-text">Total employees</div>
            </div>
            <div className="progress-container">
              {renderProgressChart(departmentData)}
            </div>
          </>
        );
      
      case 'employee-directory':
        const startIndex = employeePage * employeesPerPage;
        const currentEmployees = employeeDirectory.employees.slice(startIndex, startIndex + employeesPerPage);
        const totalPages = Math.ceil(employeeDirectory.employees.length / employeesPerPage);
        
        return (
          <>
            <div className="grid-item-header">
              <h4>Employee Directory</h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); togglePin(widgetId); }}
                  className={`pin-btn ${pinnedWidgets.includes(widgetId) ? 'pinned' : ''}`}
                >
                  <img src={Icons.pin} alt="" />
                </button>
                <span className='close-btn' onClick={() => removeWidget(widgetId)}>×</span>
              </div>
            </div>
            <span className="widget-subtitle">{employeeDirectory.employees.length} Employees</span>
            <div className="employee-directory-container">
              {currentEmployees.map((employee) => (
                <div key={employee.employee_id} className="employee-item">
                  <div className="employee-info">
                    <div className="employee-name">{employee.display_name}</div>
                    <div className="employee-details">
                      <span className="employee-dept">{employee.employee_department}</span>
                      <span className="employee-designation">{employee.designation}</span>
                    </div>
                    <div className="employee-location">
                      <i className="fa-solid fa-location-dot"></i>
                      {employee.emp_location}
                    </div>
                  </div>
                </div>
              ))}
              {totalPages > 1 && (
                <div className="pagination">
                  <button onClick={() => setEmployeePage(prev => Math.max(0, prev - 1))} disabled={employeePage === 0} className="page-btn">‹</button>
                  <span className="page-info">{employeePage + 1}/{totalPages}</span>
                  <button onClick={() => setEmployeePage(prev => Math.min(totalPages - 1, prev + 1))} disabled={employeePage >= totalPages - 1} className="page-btn">›</button>
                </div>
              )}
            </div>
          </>
        );
      
      case 'available-employees':
        const availableEmployees = employeeDirectory.employees.filter(emp => emp.is_free_pool);
        return (
          <>
            <div className="grid-item-header">
              <h4>Available Employees</h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); togglePin(widgetId); }}
                  className={`pin-btn ${pinnedWidgets.includes(widgetId) ? 'pinned' : ''}`}
                >
                  <img src={Icons.pin} alt="" />
                </button>
                <span className='close-btn' onClick={() => removeWidget(widgetId)}>×</span>
              </div>
            </div>
            <div className="widget-subtitle">
              <div className="subtitle-number">{availableEmployees.length}</div>
              <div className="subtitle-text">Available for assignment</div>
            </div>
            <div className="employee-directory-container">
              {availableEmployees.slice(0, 5).map((employee) => (
                <div key={employee.employee_id} className="employee-item">
                  <div className="employee-info">
                    <div className="employee-name">{employee.display_name}</div>
                    <div className="employee-details">
                      <span className="employee-dept">{employee.employee_department}</span>
                      <span className="employee-designation">{employee.designation}</span>
                    </div>
                    <div className="employee-location">
                      <i className="fa-solid fa-location-dot"></i>
                      {employee.emp_location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  // Minimized view - Modern & Minimalistic Design
  if (!isExpanded && isExpanded !== null) {
    return (
      <div className="widget-panel-minimized">
        <div className="minimized-header">
          <h3>Dashboard</h3>
          <span className="expand-icon" onClick={onExpand}>
            <img src={Icons.expand} alt="Expand" />
          </span>
        </div>
        
        {/* <div className="minimized-stats-grid">
          <div className="mini-stat-card">
            <div className="stat-icon employees">
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{employeeCount.employeeCount || 0}</div>
              <div className="stat-label">Total Employees</div>
            </div>
          </div>
          
          <div className="mini-stat-card">
            <div className="stat-icon active">
              <i className="fa-solid fa-briefcase"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{employeeCount.projectCount || 0}</div>
              <div className="stat-label">Active Projects</div>
            </div>
          </div>
          
          <div className="mini-stat-card">
            <div className="stat-icon freepool">
              <i className="fa-solid fa-user-clock"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{employeeCount.freepoolCount || 0}</div>
              <div className="stat-label">In Freepool</div>
            </div>
          </div>
        </div> */}

        <div className="minimized-quick-actions">
          <h4>Quick Overview</h4>
          <div className="action-cards">
            <div className="action-card" onClick={onExpand}>
              <div className="action-icon">
                <i className="fa-solid fa-chart-pie"></i>
              </div>
              <div className="action-text">
                <div className="action-title">Projects</div>
                <div className="action-subtitle">View distribution</div>
              </div>
              <i className="fa-solid fa-chevron-right action-arrow"></i>
            </div>
            
            <div className="action-card" onClick={onExpand}>
              <div className="action-icon">
                <i className="fa-solid fa-building"></i>
              </div>
              <div className="action-text">
                <div className="action-title">Departments</div>
                <div className="action-subtitle">See overview</div>
              </div>
              <i className="fa-solid fa-chevron-right action-arrow"></i>
            </div>
            
            <div className="action-card" onClick={onExpand}>
              <div className="action-icon">
                <i className="fa-solid fa-address-book"></i>
              </div>
              <div className="action-text">
                <div className="action-title">Directory</div>
                <div className="action-subtitle">Browse employees</div>
              </div>
              <i className="fa-solid fa-chevron-right action-arrow"></i>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid-container`} data-expanded={isExpanded}>
      <Alert message="Maximum 3 widgets can be pinned" show={showAlert} type="warning" />
      <div className="dashboard-header">
        <div className='welcome'>
          <div className='d-flex justify-btwn align-center'>
            <h2>Welcome back!</h2>
          </div>
          <p>Great talent awaits. Let's hire smart!</p>
        </div>

        <div className="stats">
          <div className="stat">
            <h3>{employeeCount.employeeCount || 0}</h3>
            <span><i className="fa-regular fa-user"></i> Total Employees</span>
          </div>
          <div className="stat">
            <h3>{employeeCount.projectCount || 0}</h3>
            <span><i className="fa-regular fa-eye"></i> Active</span>
          </div>
          <div className="stat">
            <h3>{employeeCount.freepoolCount || 0}</h3>
            <span><i className="fa-regular fa-circle-check"></i> Freepool</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content" ref={containerRef}>
        <div className="filter-bar">
          <div className="filter-controls">
            <div className="search-input">
              <input type="text" placeholder="Search widgets..." />
              <i className="fa-solid fa-search"></i>
            </div>

            <div className="multi-select" ref={dropdownRef}>
              <div className="select-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <span className="placeholder">Select Widgets</span>
                <i className="fa-solid fa-chevron-down"></i>
              </div>

              {isDropdownOpen && (
                <div className="dropdown-menu show">
                  {availableWidgets.map(widget => (
                    <div key={widget.id} className="option">
                      <input 
                        type="checkbox" 
                        id={widget.id} 
                        checked={selectedWidgets.includes(widget.id)}
                        onChange={() => toggleWidget(widget.id)}
                      />
                      <label htmlFor={widget.id}>{widget.label}</label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
              
          <div className="actions">
            <button className="primary-btn">
              <span className='btn-content'>Create a Widget</span> <span className="plus">+</span>
            </button>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={selectedWidgets} strategy={rectSortingStrategy}>
            <div className="masonry-grid">
              {selectedWidgets
                .sort((a, b) => {
                  const aIsPinned = pinnedWidgets.includes(a);
                  const bIsPinned = pinnedWidgets.includes(b);
                  if (aIsPinned && !bIsPinned) return -1;
                  if (!aIsPinned && bIsPinned) return 1;
                  return 0;
                })
                .map(widgetId => (
                  <SortableWidget key={widgetId} id={widgetId} isPinned={pinnedWidgets.includes(widgetId)}>
                    {renderWidget(widgetId)}
                  </SortableWidget>
                ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default WidgetPanel;