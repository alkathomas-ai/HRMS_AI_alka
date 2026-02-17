import React, { useState, useEffect, useRef } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './WidgetPanel.css';
import { Icons } from '../../assets/icons';
import { getProjectDistributions, getEmployeeDirectory, getEmployeeCount, getDepartment, getSoonAvailableEmployees } from '../../services/api';
import Alert from '../common/Alert';
import DoughnutChart from './charts/DoughnutChart';
import BarChart from './charts/BarChart';
import CreateWidgetModal from './CreateWidgetModal';
import DynamicWidget from './DynamicWidget';


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
  const [selectedWidgets, setSelectedWidgets] = useState(() => {
    const saved = localStorage.getItem('selectedWidgets');
    return saved ? JSON.parse(saved) : ['project-distribution', 'department-overview', 'employee-directory', 'available-employees'];
  });
  const [pinnedWidgets, setPinnedWidgets] = useState(() => {
    const saved = localStorage.getItem('pinnedWidgets');
    return saved ? JSON.parse(saved) : [];
  });
  const [dynamicWidgets, setDynamicWidgets] = useState(() => {
    const saved = localStorage.getItem('dynamicWidgets');
    return saved ? JSON.parse(saved) : [];
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [projectDistribution, setProjectDistribution] = useState({ projects: [], total_employees: 0 });
  const [departmentData, setDepartmentData] = useState({ departments: [] });
  const [employeeDirectory, setEmployeeDirectory] = useState({ employees: [] });
  const [employeeCount, setEmployeeCount] = useState({ employeeCount: 0, freepoolCount: 0, projectCount: 0 });
  const [employeePage, setEmployeePage] = useState(0);
  const [soonAvailableEmployees, setSoonAvailableEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [widgetSearch, setWidgetSearch] = useState('');
  const [containerWidth, setContainerWidth] = useState(1200);
  const [activeReleaseDate, setActiveReleaseDate] = useState(null);
  const timelineRef = useRef(null);
  const containerRef = useRef(null);
  const employeesPerPage = 5;

  const availableWidgets = [
    { id: 'project-distribution', label: 'Project Distribution' },
    { id: 'department-overview', label: 'Department Overview' },
    { id: 'employee-directory', label: 'Employee Directory' },
    { id: 'available-employees', label: 'Available Employees' },
  ];

  useEffect(() => {
    localStorage.setItem('selectedWidgets', JSON.stringify(selectedWidgets));
  }, [selectedWidgets]);

  useEffect(() => {
    localStorage.setItem('dynamicWidgets', JSON.stringify(dynamicWidgets));
  }, [dynamicWidgets]);

  useEffect(() => {
    localStorage.setItem('pinnedWidgets', JSON.stringify(pinnedWidgets));
  }, [pinnedWidgets]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projects, departments, employees, counts, availableEmployees] = await Promise.all([
          getProjectDistributions(),
          getDepartment(),
          getEmployeeDirectory(),
          getEmployeeCount(),
          getSoonAvailableEmployees()
        ]);
        setProjectDistribution({ projects: projects.projects, total_employees: projects.total_employees });
        setDepartmentData({ departments: departments.departments });
        setEmployeeDirectory({ employees: employees.employees });
        setSoonAvailableEmployees(availableEmployees?.data || []);
        setEmployeeCount({
          employeeCount: counts.employee_count || 0,
          projectCount: counts.project_count || 0,
          freepoolCount: counts.freepool_count || 0
        });
        if (availableEmployees?.data?.length) {
          const sorted = [...availableEmployees.data]
            .filter(emp => emp.committed_relieving_date)
            .sort((a, b) =>
              new Date(a.committed_relieving_date) -
              new Date(b.committed_relieving_date)
            );

          setActiveReleaseDate(sorted[0]?.committed_relieving_date);
        }

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
    if (id.startsWith('dynamic-')) {
      setDynamicWidgets(prev => prev.filter(w => w.id !== id));
    }
  };

  const togglePin = (id) => {
    setPinnedWidgets(prev => {
      if (prev.includes(id)) {
        return prev.filter(widgetId => widgetId !== id);
      } else if (prev.length >= 5) {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        return prev;
      } else {
        return [...prev, id];
      }
    });
  };



  const renderWidget = (widgetId) => {
    const dynamicWidget = dynamicWidgets.find(w => w.id === widgetId);
    if (dynamicWidget) {
      return (
        <>
          <div className="grid-item-header">
            <h4>{dynamicWidget.title}</h4>
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
          <DynamicWidget widgetData={dynamicWidget} />
        </>
      );
    }

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
              <div style={{ height: '180px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <DoughnutChart data={projectDistribution.projects} total={projectDistribution.total_employees} />
              </div>
              <div className="chart-legend">
                {projectDistribution.projects.map((project, index) => {
                  const percentage = Math.round((project.employee_count / projectDistribution.total_employees) * 100);
                  const gradientColors = [
                    { start: '#667eea', end: '#764ba2' },
                    { start: '#f093fb', end: '#f5576c' },
                    { start: '#4facfe', end: '#00f2fe' },
                    { start: '#43e97b', end: '#38f9d7' },
                    { start: '#fa709a', end: '#fee140' }
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
            <div className="progress-container" style={{ height: '250px' }}>
              <BarChart data={departmentData.departments.slice(0, 6)} />
            </div>
          </>
        );

      case 'employee-directory':
        const filteredEmployees = employeeDirectory.employees.filter(emp =>
          emp.display_name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
          emp.employee_department.toLowerCase().includes(employeeSearch.toLowerCase()) ||
          emp.designation.toLowerCase().includes(employeeSearch.toLowerCase())
        );
        const startIndex = employeePage * employeesPerPage;
        const currentEmployees = filteredEmployees.slice(startIndex, startIndex + employeesPerPage);
        const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

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
            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Search employees..."
                value={employeeSearch}
                onChange={(e) => { setEmployeeSearch(e.target.value); setEmployeePage(0); }}
                className="employee-search-input"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <span className="widget-subtitle">{filteredEmployees.length} Employees</span>
            <div className="employee-directory-container">
              {currentEmployees.map((employee) => (
                <div key={employee.employee_id} className="employee-item">
                  <div className="employee-avatar">{employee.display_name.charAt(0).toUpperCase()}</div>
                  <div className="employee-info">
                    <div className="employee-name">{employee.display_name}</div>
                    <div className="employee-meta">
                      <span className="employee-dept">{employee.employee_department}</span>
                      <span className="employee-dot">•</span>
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
            {totalPages > 1 && (
              <div className="pagination">
                <button onClick={() => setEmployeePage(prev => Math.max(0, prev - 1))} disabled={employeePage === 0} className="page-btn">‹</button>
                <span className="page-info">{employeePage + 1}/{totalPages}</span>
                <button onClick={() => setEmployeePage(prev => Math.min(totalPages - 1, prev + 1))} disabled={employeePage >= totalPages - 1} className="page-btn">›</button>
              </div>
            )}
          </>
        );

      case 'available-employees': {

        // 1️⃣ Split Employees
        const freeEmployees = soonAvailableEmployees.filter(emp =>
          !emp.committed_relieving_date &&
          emp.projects?.some(p => p.project_name === "CLUD_FREE")
        );

        const releasingEmployees = soonAvailableEmployees
          .filter(emp => emp.committed_relieving_date)
          .sort((a, b) =>
            new Date(a.committed_relieving_date) -
            new Date(b.committed_relieving_date)
          );

        const dateGroups = [
          ...new Set(releasingEmployees.map(emp => emp.committed_relieving_date))
        ];

        // 2️⃣ Build Timeline Items (FREE first)
        const timelineItems = [
          ...(freeEmployees.length ? ["FREE"] : []),
          ...dateGroups
        ];

        // 3️⃣ Determine Employees for Selected Item
        let filteredEmployees = [];

        if (activeReleaseDate === "FREE") {
          filteredEmployees = freeEmployees;
        } else {
          filteredEmployees = releasingEmployees.filter(
            emp => emp.committed_relieving_date === activeReleaseDate
          );
        }

        const activeIndex = Math.max(timelineItems.indexOf(activeReleaseDate), 0);

        return (
          <>
            <div className="grid-item-header">
              <h4>Available Timeline</h4>
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

            <div className="timeline-wrapper">

              {/* LEFT SIDE — CHRONOLOGICAL BAR */}
              <div className="timeline-bar" ref={timelineRef}>
                {timelineItems.map(item => {

                  const itemCount =
                    item === "FREE"
                      ? freeEmployees.length
                      : releasingEmployees.filter(
                        emp => emp.committed_relieving_date === item
                      ).length;

                  return (
                    <div
                      key={item}
                      className={`timeline-date-item ${activeReleaseDate === item ? 'active' : ''
                        }`}
                      onClick={() => setActiveReleaseDate(item)}
                    >
                      <span>
                        {item === "FREE"
                          ? "Free"
                          : new Date(item).toLocaleDateString()}
                      </span>

                      {/* <span className="timeline-freepool-count">
                        {itemCount}
                      </span> */}
                    </div>
                  );
                })}

                <div
                  className="timeline-slider"
                  style={{
                    top: activeIndex * 48 + 'px'
                  }}
                />
              </div>


              {/* RIGHT SIDE — EMPLOYEES */}
              <div className="timeline-content">
                {filteredEmployees.map(emp => {
                  const releaseDate = emp.committed_relieving_date
                    ? new Date(emp.committed_relieving_date)
                    : null;

                  const today = new Date();
                  const daysLeft = releaseDate
                    ? Math.ceil((releaseDate - today) / (1000 * 60 * 60 * 24))
                    : null;

                  return (
                    <div key={emp.employee_id} className="timeline-employee-card">
                      <div className="timeline-employee-name">
                        {emp.display_name}
                      </div>
                      <div className="timeline-employee-meta">
                        {emp.tech_group} • {emp.emp_location}
                      </div>
                      <div className="timeline-employee-projects">

                        {emp.projects.map(p => (
                          <span
                            key={p.project_id || p.project_name}
                            className="timeline-employee-project"
                          >
                            {p.project_name}
                          </span>
                        ))}
                      </div>

                      <div
                        className="timeline-employee-badge"
                        style={
                          activeReleaseDate === "FREE"
                            ? { background: "#dcfce7", color: "#166534" }
                            : {}
                        }
                      >
                        {activeReleaseDate === "FREE"
                          ? "Available Now"
                          : `${daysLeft} days remaining`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        );
      }





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
      <Alert message="Maximum 5 widgets can be pinned" show={showAlert} type="warning" />
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
            <span>
              {/* <i className="fa-regular fa-user"></i> */}
              Total Employees
            </span>
          </div>
          <div className="stat">
            <h3>{employeeCount.projectCount || 0}</h3>
            <span>
              {/* <i className="fa-regular fa-eye"></i>  */}
              Active
            </span>
          </div>
          <div className="stat">
            <h3>{employeeCount.freepoolCount || 0}</h3>
            <span>
              {/* <i className="fa-regular fa-circle-check"></i> */}
              Freepool
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-content" ref={containerRef}>
        <div className="filter-bar">
          <div className="filter-controls">
            <div className="search-input">
              <input
                type="text"
                placeholder="Search widgets..."
                value={widgetSearch}
                onChange={(e) => setWidgetSearch(e.target.value)}
              />
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
            <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
              <span className='btn-content'>Create a Widget</span> <span className="plus">+</span>
            </button>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={selectedWidgets} strategy={rectSortingStrategy}>
            {/* Pinned Widgets Row */}
            {pinnedWidgets.length > 0 && (
              <div className="masonry-grid">
                {selectedWidgets
                  .filter(widgetId => {
                    const widget = availableWidgets.find(w => w.id === widgetId);
                    const dynamicWidget = dynamicWidgets.find(w => w.id === widgetId);
                    const label = widget?.label || dynamicWidget?.title || '';
                    return pinnedWidgets.includes(widgetId) && label.toLowerCase().includes(widgetSearch.toLowerCase());
                  })
                  .map(widgetId => (
                    <SortableWidget key={widgetId} id={widgetId} isPinned={true}>
                      {renderWidget(widgetId)}
                    </SortableWidget>
                  ))}
              </div>
            )}

            {/* Unpinned Widgets Masonry Grid */}
            <div className="masonry-grid">
              {selectedWidgets
                .filter(widgetId => {
                  const widget = availableWidgets.find(w => w.id === widgetId);
                  const dynamicWidget = dynamicWidgets.find(w => w.id === widgetId);
                  const label = widget?.label || dynamicWidget?.title || '';
                  return !pinnedWidgets.includes(widgetId) && label.toLowerCase().includes(widgetSearch.toLowerCase());
                })
                .map(widgetId => (
                  <SortableWidget key={widgetId} id={widgetId} isPinned={false}>
                    {renderWidget(widgetId)}
                  </SortableWidget>
                ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <CreateWidgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={(widgetData) => {
          const newWidget = { id: `dynamic-${Date.now()}`, ...widgetData };
          setDynamicWidgets(prev => [newWidget, ...prev]);
          setSelectedWidgets(prev => [newWidget.id, ...prev]);
          setIsModalOpen(false);
        }}
      />

    </div>
  );
};

export default WidgetPanel;