import React, { useState, useEffect, useRef } from 'react';
import GridLayout from 'react-grid-layout';
import './WidgetPanel.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Icons } from '../../assets/icons';
import { getProjectDistributions, getEmployeeDirectory, getEmployeeCount, getDepartment } from '../../services/api';

const WidgetPanel = ({ isExpanded, onExpand, onClose }) => {
  const [selectedWidgets, setSelectedWidgets] = useState(['project-distribution', 'department-overview', 'employee-directory']);
  const [layout, setLayout] = useState([
    { i: 'project-distribution', x: 0, y: 0, w: 4, h: 2.5, minW: 2, minH: 2 },
    { i: 'department-overview', x: 2, y: 0, w: 4, h: 2.5, minW: 2, minH: 2 },
    { i: 'employee-directory', x: 0, y: 1, w: 4, h: 2, minW: 2, minH: 2 }
  ]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
    { id: 'employee-directory', label: 'Employee Directory' }
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
      setLayout(prev => prev.filter(item => item.i !== widgetId));
    } else {
      setSelectedWidgets(prev => [...prev, widgetId]);
      setLayout(prev => [...prev, { i: widgetId, x: 0, y: Infinity, w: 2, h: 4, minW: 2, minH: 3 }]);
    }
  };

  const removeWidget = (id) => {
    setLayout(prev => prev.filter(item => item.i !== id));
    setSelectedWidgets(prev => prev.filter(widgetId => widgetId !== id));
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
              <span className='close-btn' onClick={() => removeWidget(widgetId)}>×</span>
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
              <span className='close-btn' onClick={() => removeWidget(widgetId)}>×</span>
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
              <span className='close-btn' onClick={() => removeWidget(widgetId)}>×</span>
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
      
      default:
        return null;
    }
  };

  return (
    <div className={`grid-container ${!isExpanded && isExpanded !== null ? 'compact' : ''}`} data-expanded={isExpanded}>
      <div className="dashboard-header">
        <div className='welcome'>
          <div className='d-flex justify-btwn align-center'>
            <h2>Welcome back!</h2>
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

        <GridLayout
          className="layout"
          layout={layout}
          cols={6}
          rowHeight={50}
          width={containerWidth}
          onLayoutChange={setLayout}
          isDraggable={true}
          isResizable={true}
          compactType="vertical"
          preventCollision={false}
        >
          {layout.filter(item => selectedWidgets.includes(item.i)).map(item => (
            <div key={item.i} className="grid-item">
              <div className="grid-item-content">
                {renderWidget(item.i)}
              </div>
            </div>
          ))}
        </GridLayout>
      </div>
    </div>
  );
};

export default WidgetPanel;
