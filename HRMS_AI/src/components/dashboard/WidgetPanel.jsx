import React, { useState, useEffect, useRef } from 'react';
import GridLayout from 'react-grid-layout';
import './Dashboard.css';
import './WidgetPanel.css'
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Icons } from '../../assets/icons';
import { getProjectDistributions, getEmployeeDirectory, getEmployeeCount, getDepartment } from '../../services/api';

const WidgetPanel = ({ isExpanded, onExpand, onClose }) => {
  // Mock data structure similar to what would come from API
  const [widgetData, setWidgetData] = useState({
    database_results: {
      select_employees_0: {
        data: [
          { employee_id: 1, display_name: 'John Doe', is_free_pool: false, employee_department: 'Engineering' },
          { employee_id: 2, display_name: 'Jane Smith', is_free_pool: true, employee_department: 'Marketing' },
          { employee_id: 3, display_name: 'Bob Johnson', is_free_pool: false, employee_department: 'Sales' }
        ]
      }
    }
  });
  
  const [projectDistribution, setProjectDistribution] = useState({
    projects: [],
    total_employees: ""
  });
  
  const [departmentData, setDepartmentData] = useState({
    departments: []
  });
  
  const [employeeDirectory, setEmployeeDirectory] = useState({
    employees: []
  });
  
  const [employeePage, setEmployeePage] = useState(0);
  const employeesPerPage = 5;
  
  
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [layout, setLayout] = useState([
    { i: 'project-distribution', x: 0, y: 0, w: 2, h: 1 },
    { i: 'department-overview', x: 2, y: 0, w: 2, h: 1 },
    { i: 'employee-directory', x: 0, y: 3, w: 4, h: 1 }
  ]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedWidgets, setSelectedWidgets] = useState(['project-distribution', 'department-overview', 'employee-directory']);
  const dropdownRef = useRef(null);
  const [dragEnabledWidgets, setDragEnabledWidgets] = useState(new Set());

  const getWidgetTemplates = () => {
    const employees = widgetData?.database_results?.select_employees_0?.data || [];
    const totalEmployees = employees.length;
    const freepoolCount = employees.filter(emp => emp.is_free_pool === true).length;
    const activeCount = employees.filter(emp => emp.is_free_pool === false).length;
    const reviewedCount = employees.filter(emp => emp.employee_department && emp.employee_department !== 'Unknown').length;
    

    return {
      'project-distribution': { 
        title: 'Project Distribution', 
        content: `${projectDistribution?.total_employees || totalEmployees} Total employees`,
        type: 'chart',
        data: {
          totalEmployees: projectDistribution?.total_employees || totalEmployees,
          projects: projectDistribution?.projects || []
        }
      },
      'department-overview': { 
        title: 'Department Overview', 
        content: `${departmentData?.departments?.length || 0} Departments`,
        type: 'progress',
        data: { departments: departmentData?.departments || [] }
      },
      'employee-directory': {
        title: 'Employee Directory',
        content: `${employeeDirectory?.employees?.length || 0} Employees`,
        type: 'directory',
        data: { employees: employeeDirectory?.employees || [] }
      },
      fullstack: { 
        title: 'Full Stack Overview', 
        content: `${reviewedCount} Assigned employees`,
        data: { reviewedCount }
      },
      mobile: { 
        title: 'Mobile Development', 
        content: `${totalEmployees} Total resources`,
        data: { totalEmployees }
      },
      devops: { 
        title: 'DevOps Infrastructure', 
        content: `${freepoolCount} Available resources`,
        data: { freepoolCount }
      }
    };
  };

  const renderProgressChart = (data) => {
    const maxCount = Math.max(...data.departments.map(d => d.employee_count));
    
    return (
      <div className="progress-chart-container">
        {data.departments.slice(0, 6).map((dept, index) => {
          const percentage = (dept.employee_count / maxCount) * 100;
          const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ff6b6b'];
          
          return (
            <div key={dept.department} className="progress-item">
              <div className="progress-header">
                <span className="dept-name">{dept.department.length > 20 ? dept.department.substring(0, 20) + '...' : dept.department}</span>
                <span className="dept-count">{dept.employee_count}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, ${colors[index % colors.length]}, ${colors[index % colors.length]}aa)`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getWidgetData = (id) => {
    const templates = getWidgetTemplates();
    return templates[id] || { title: 'Widget', content: 'Content' };
  };

  const renderDynamicChart = (data) => {
    if (!data?.projects?.length) {
      // Fallback static chart with modern styling
      return (
        <div className="modern-pie-chart">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f093fb" />
                <stop offset="100%" stopColor="#f5576c" />
              </linearGradient>
              <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4facfe" />
                <stop offset="100%" stopColor="#00f2fe" />
              </linearGradient>
              <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#43e97b" />
                <stop offset="100%" stopColor="#38f9d7" />
              </linearGradient>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.1)" />
              </filter>
            </defs>
            <circle cx="70" cy="70" r="55" fill="#f8f9fa" stroke="url(#gradient1)" strokeWidth="16" strokeDasharray="103 345" strokeDashoffset="0" transform="rotate(-90 70 70)" filter="url(#shadow)" />
            <circle cx="70" cy="70" r="55" fill="transparent" stroke="url(#gradient2)" strokeWidth="16" strokeDasharray="69 345" strokeDashoffset="-103" transform="rotate(-90 70 70)" filter="url(#shadow)" />
            <circle cx="70" cy="70" r="55" fill="transparent" stroke="url(#gradient3)" strokeWidth="16" strokeDasharray="52 345" strokeDashoffset="-172" transform="rotate(-90 70 70)" filter="url(#shadow)" />
            <circle cx="70" cy="70" r="55" fill="transparent" stroke="url(#gradient4)" strokeWidth="16" strokeDasharray="121 345" strokeDashoffset="-224" transform="rotate(-90 70 70)" filter="url(#shadow)" />
            <circle cx="70" cy="70" r="25" fill="white" filter="url(#shadow)" />
            <text x="70" y="75" textAnchor="middle" fontSize="14" fontWeight="600" fill="#333">100%</text>
          </svg>
        </div>
      );
    }

    const gradients = [
      { id: 'grad1', colors: ['#667eea', '#764ba2'] },
      { id: 'grad2', colors: ['#f093fb', '#f5576c'] },
      { id: 'grad3', colors: ['#4facfe', '#00f2fe'] },
      { id: 'grad4', colors: ['#43e97b', '#38f9d7'] },
      { id: 'grad5', colors: ['#fa709a', '#fee140'] }
    ];
    
    const circumference = 2 * Math.PI * 55; // radius = 55
    let currentOffset = 0;
    const totalEmployees = data.totalEmployees || 1;

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
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.1)" />
            </filter>
          </defs>
          
          {data.projects.slice(0, 5).map((project, index) => {
            const percentage = project.employee_count / totalEmployees;
            const strokeDasharray = `${circumference * percentage} ${circumference}`;
            const strokeDashoffset = -currentOffset;
            currentOffset += circumference * percentage;
            
            return (
              <circle
                key={project.project}
                cx="70"
                cy="70"
                r="55"
                fill={index === 0 ? "#f8f9fa" : "transparent"}
                stroke={`url(#${gradients[index].id})`}
                strokeWidth="16"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 70 70)"
                filter="url(#shadow)"
                className="chart-segment"
                onMouseEnter={() => setHoveredSegment({ project: project.project, count: project.employee_count, index })}
                onMouseLeave={() => setHoveredSegment(null)}
                style={{ cursor: 'pointer' }}
              />
            );
          })}
          
          <circle cx="70" cy="70" r="25" fill="white" filter="url(#shadow)" />
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


  const departmentApi = async() => {
    try {
      const response = await getDepartment();
      setDepartmentData({ departments: response.departments });
    } catch (error) {
      console.error('Error fetching department data:', error);
    }
  };

  const employeeDirectoryApi = async() => {
    try {
      const response = await getEmployeeDirectory();
      setEmployeeDirectory({ employees: response.employees });
    } catch (error) {
      console.error('Error fetching employee directory:', error);
    }
  };
  const [EmployeeCount, setEmployeeCount] = useState({
    employeeCount: 0,
    freepoolCount: 0,
    projectCount: 0,
  });

  const employeeCountApi = async() => {
    try {
      const response = await getEmployeeCount();
      setEmployeeCount({...EmployeeCount, employeeCount:response.employee_count || 0, projectCount:response.project_count || 0, freepoolCount: response.freepool_count || 0})
    } catch (error) {
      console.error('Error fetching employee count:', error);
    }
  };

    const projectDistributionApi = async() => {
     const response = await  getProjectDistributions()
     //  console.log("resp:", response);
    setProjectDistribution({...projectDistribution, projects: response.projects, total_employees: response.total_employees})
    
    }



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


  useEffect(() => {
    projectDistributionApi();
    departmentApi();
    employeeDirectoryApi();
    employeeCountApi();
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            <h3>{EmployeeCount.employeeCount || 0}</h3>
            <span>
              <i className="fa-regular fa-user"></i> Total Employees
            </span>
          </div>
          <div className="stat">
            <h3>{EmployeeCount.projectCount || 0}</h3>
            <span>
              <i className="fa-regular fa-eye"></i> Active
            </span>
          </div>
          <div className="stat">
            <h3>{EmployeeCount.freepoolCount || 0}</h3>
            <span>
              <i className="fa-regular fa-circle-check"></i> Freepool
            </span>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-controls">
          <div className="search-input">
            <input 
              type="text" 
              placeholder={`Search ${widgetData?.database_results?.select_employees_0?.data?.length || 0} Widgets...`} 
            />
            <i className="fa-solid fa-search"></i>
          </div>

          <div className="multi-select" ref={dropdownRef}>
            <div className="select-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <span className="placeholder">Select Widgets</span>
              <i className="fa-solid fa-chevron-down"></i>
            </div>

            {isDropdownOpen && (
            <div className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
              {['project-distribution', 'department-overview', 'employee-directory', 'fullstack', 'mobile', 'devops'].map(opt => (
                <div key={opt} className="option">
                  <input 
                    type="checkbox" 
                    id={opt} 
                    checked={selectedWidgets.includes(opt)}
                    onChange={() => toggleWidget(opt)}
                  />
                  <label htmlFor={opt}>{opt.replace('-', ' ')}</label>
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
        preventCollision={true}
        allowOverlap={false}
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
                {widgetData.type === 'progress' ? (
                  <>
                    <div className="widget-subtitle">
                      <div className="subtitle-number">{widgetData.data?.departments?.reduce((sum, d) => sum + d.employee_count, 0) || 0}</div>
                      <div className="subtitle-text">Total employees</div>
                    </div>
                    <div className="progress-container">
                      {renderProgressChart(widgetData.data)}
                    </div>
                  </>
                ) : widgetData.type === 'chart' ? (
                  <>
                    <span className="widget-subtitle">{widgetData.content}</span>
                    <div className="pie-chart-container">
                      {renderDynamicChart(widgetData.data)}
                      <div className="chart-legend">
                        {widgetData.data?.projects?.slice(0, 4).map((project, index) => {
                          const gradientColors = [
                            { start: '#667eea', end: '#764ba2' },
                            { start: '#f093fb', end: '#f5576c' },
                            { start: '#4facfe', end: '#00f2fe' },
                            { start: '#43e97b', end: '#38f9d7' }
                          ];
                          const percentage = widgetData.data.totalEmployees > 0 
                            ? Math.round((project.employee_count / widgetData.data.totalEmployees) * 100)
                            : 0;
                          return (
                            <div key={project.project} className="modern-legend-item">
                              <div 
                                className="modern-legend-color" 
                                style={{
                                  background: `linear-gradient(135deg, ${gradientColors[index].start}, ${gradientColors[index].end})`
                                }}
                              ></div>
                              <span className="legend-text">{project.project}</span>
                              <span className="legend-percentage">{percentage}%</span>
                            </div>
                          );
                        }) || [
                          <div key="default1" className="modern-legend-item">
                            <div className="modern-legend-color" style={{background: 'linear-gradient(135deg, #667eea, #764ba2)'}}></div>
                            <span className="legend-text">Frontend</span>
                            <span className="legend-percentage">30%</span>
                          </div>,
                          <div key="default2" className="modern-legend-item">
                            <div className="modern-legend-color" style={{background: 'linear-gradient(135deg, #f093fb, #f5576c)'}}></div>
                            <span className="legend-text">Department Overview</span>
                            <span className="legend-percentage">20%</span>
                          </div>,
                          <div key="default3" className="modern-legend-item">
                            <div className="modern-legend-color" style={{background: 'linear-gradient(135deg, #4facfe, #00f2fe)'}}></div>
                            <span className="legend-text">DevOps</span>
                            <span className="legend-percentage">15%</span>
                          </div>,
                          <div key="default4" className="modern-legend-item">
                            <div className="modern-legend-color" style={{background: 'linear-gradient(135deg, #43e97b, #38f9d7)'}}></div>
                            <span className="legend-text">Others</span>
                            <span className="legend-percentage">35%</span>
                          </div>
                        ]}
                      </div>
                    </div>
                  </>
                ) : widgetData.type === 'directory' ? (
                  <>
                    <span className="widget-subtitle">{widgetData.content}</span>
                    <div className="employee-directory-container">
                      {(() => {
                        const employees = widgetData.data?.employees || [];
                        const startIndex = employeePage * employeesPerPage;
                        const endIndex = startIndex + employeesPerPage;
                        const currentEmployees = employees.slice(startIndex, endIndex);
                        const totalPages = Math.ceil(employees.length / employeesPerPage);
                        
                        return (
                          <>
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
                                <button 
                                  onClick={() => setEmployeePage(prev => Math.max(0, prev - 1))}
                                  disabled={employeePage === 0}
                                  className="page-btn"
                                >
                                  ‹
                                </button>
                                <span className="page-info">{employeePage + 1}/{totalPages}</span>
                                <button 
                                  onClick={() => setEmployeePage(prev => Math.min(totalPages - 1, prev + 1))}
                                  disabled={employeePage >= totalPages - 1}
                                  className="page-btn"
                                >
                                  ›
                                </button>
                              </div>
                            )}
                          </>
                        );
                      })()
                      }
                    </div>
                  </>
                ) : (
                  <p>{widgetData.content}</p>
                )}
                {/* {isDragEnabled && (
                  <div className="drag-indicator">Drag mode active - Click and drag to move</div>
                )} */}
              </div>
            </div>
          );
        })}
      </GridLayout>
    </div>
  );
};

export default WidgetPanel;