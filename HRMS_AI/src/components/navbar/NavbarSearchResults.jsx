import { useState, useContext, useRef, useEffect, useMemo } from "react";
import { EmployeeContext } from "../../context/employeeContext";
import "../dashboard/SearchAssistant.css";
import "./NavbarSearchResults.css";
import "../../pages/D.css";

const NavbarSearchResults = ({ searchQuery }) => {
  const { searchResult } = useContext(EmployeeContext);
  const [activeSkill, setActiveSkill] = useState(null);
  const [showAllSkills, setShowAllSkills] = useState({});
  const [filterText, setFilterText] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showExpDropdown, setShowExpDropdown] = useState(false);
  const [showLocDropdown, setShowLocDropdown] = useState(false);
  const [deptFilters, setDeptFilters] = useState({});
  const [expFilter, setExpFilter] = useState("");
  const [locFilters, setLocFilters] = useState({});
  const dropdownRef = useRef(null);
  const deptDropdownRef = useRef(null);
  const expDropdownRef = useRef(null);
  const locDropdownRef = useRef(null);
  const [showReason, setShowReason] = useState(false);


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(e.target)) {
        setShowDeptDropdown(false);
      }
      if (expDropdownRef.current && !expDropdownRef.current.contains(e.target)) {
        setShowExpDropdown(false);
      }
      if (locDropdownRef.current && !locDropdownRef.current.contains(e.target)) {
        setShowLocDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterOnSearch = (skill) => {
    // This would need to be implemented if filtering is needed
  };

  if (!searchResult?.result || searchResult.result.length === 0) {
    return <p>No results found for "{searchQuery}"</p>;
  }

  const uniqueDepts = useMemo(() => {
    if (!searchResult?.result) return [];
    return [...new Set(searchResult.result.map(e => e.employee_department).filter(Boolean))];
  }, [searchResult?.result]);

  const uniqueLocs = useMemo(() => {
    if (!searchResult?.result) return [];
    return [...new Set(searchResult.result.map(e => e.emp_location).filter(Boolean))];
  }, [searchResult?.result]);

  const filteredResults = useMemo(() => {
    if (!searchResult?.result) return [];
    
    let filtered = searchResult.result;
    
    filtered = filtered.filter(emp => 
      emp.display_name?.toLowerCase().includes(filterText.toLowerCase()) ||
      emp.employee_id?.toLowerCase().includes(filterText.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(filterText.toLowerCase())
    );
    
    const selectedDepts = Object.keys(deptFilters).filter(k => deptFilters[k]);
    if (selectedDepts.length > 0) {
      filtered = filtered.filter(e => selectedDepts.includes(e.employee_department));
    }
    
    const selectedLocs = Object.keys(locFilters).filter(k => locFilters[k]);
    if (selectedLocs.length > 0) {
      filtered = filtered.filter(e => selectedLocs.includes(e.emp_location));
    }
    
    if (expFilter) {
      filtered = filtered.filter(e => {
        const exp = parseInt(e.total_exp);
        if (expFilter === "0-2") return exp >= 0 && exp <= 2;
        if (expFilter === "3-5") return exp >= 3 && exp <= 5;
        if (expFilter === "6-10") return exp >= 6 && exp <= 10;
        if (expFilter === "10+") return exp > 10;
        return true;
      });
    }
    
    return filtered;
  }, [searchResult?.result, filterText, deptFilters, locFilters, expFilter]);

  const totalPages = Math.ceil(filteredResults.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedResults = filteredResults.slice(startIndex, startIndex + rowsPerPage);

  return (
    <>
      <div className="search-results-toolbar">
          <div className="toolbar-left">
            <div className="search-filter">
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder="Filter search results..."
                value={filterText}
                onChange={(e) => {
                  setFilterText(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          <div className="toolbar-right">
            <div className="quick-filters">
              <div className="filter-dropdown-wrapper" ref={deptDropdownRef}>
              <span className="filter-label">Filter by:</span>
  
                <button className="filter-btn" onClick={() => setShowDeptDropdown(!showDeptDropdown)}>
                  Department <i className="fas fa-chevron-down"></i>
                </button>
                {showDeptDropdown && (
                  <div className="filter-dropdown">
                    {uniqueDepts.map(dept => (
                      <label key={dept} className="filter-option">
                        <input 
                          type="checkbox" 
                          checked={deptFilters[dept] || false}
                          onChange={(e) => setDeptFilters({...deptFilters, [dept]: e.target.checked})}
                        />
                        {dept}
                      </label>
                    ))}
                  </div>
                )}
              </div>
  
              <div className="filter-dropdown-wrapper" ref={expDropdownRef}>
                <button className="filter-btn" onClick={() => setShowExpDropdown(!showExpDropdown)}>
                  Experience <i className="fas fa-chevron-down"></i>
                </button>
                {showExpDropdown && (
                  <div className="filter-dropdown">
                    <label className="filter-option">
                      <input 
                        type="radio" 
                        name="exp"
                        checked={expFilter === ""}
                        onChange={() => setExpFilter("")}
                      />
                      All
                    </label>
                    <label className="filter-option">
                      <input 
                        type="radio" 
                        name="exp"
                        checked={expFilter === "0-2"}
                        onChange={() => setExpFilter("0-2")}
                      />
                      0-2 years
                    </label>
                    <label className="filter-option">
                      <input 
                        type="radio" 
                        name="exp"
                        checked={expFilter === "3-5"}
                        onChange={() => setExpFilter("3-5")}
                      />
                      3-5 years
                    </label>
                    <label className="filter-option">
                      <input 
                        type="radio" 
                        name="exp"
                        checked={expFilter === "6-10"}
                        onChange={() => setExpFilter("6-10")}
                      />
                      6-10 years
                    </label>
                    <label className="filter-option">
                      <input 
                        type="radio" 
                        name="exp"
                        checked={expFilter === "10+"}
                        onChange={() => setExpFilter("10+")}
                      />
                      10+ years
                    </label>
                  </div>
                )}
              </div>
  
              <div className="filter-dropdown-wrapper" ref={locDropdownRef}>
                <button className="filter-btn" onClick={() => setShowLocDropdown(!showLocDropdown)}>
                  Location <i className="fas fa-chevron-down"></i>
                </button>
                {showLocDropdown && (
                  <div className="filter-dropdown">
                    {uniqueLocs.map(loc => (
                      <label key={loc} className="filter-option">
                        <input 
                          type="checkbox" 
                          checked={locFilters[loc] || false}
                          onChange={(e) => setLocFilters({...locFilters, [loc]: e.target.checked})}
                        />
                        {loc}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="search-results-pagination">
            <div className="rows-selector">
              <span>Rows per page:</span>
              <div className="custom-select-wrapper" ref={dropdownRef}>
                <div className="select-trigger" onClick={() => {
                  console.log('Dropdown clicked, current state:', isDropdownOpen);
                  setIsDropdownOpen(!isDropdownOpen);
                }}>
                  <span>{rowsPerPage}</span>
                  <i className="fa-solid fa-chevron-down"></i>
                </div>
                {isDropdownOpen && (
                  <div className="dropdown-menu" style={{ display: 'block' }}>
                    {[5, 10, 20, 50].map(num => (
                      <div 
                        key={num} 
                        className="option" 
                        onClick={() => { 
                          setRowsPerPage(num); 
                          setCurrentPage(1); 
                          setIsDropdownOpen(false); 
                        }}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="pagination-info">
              {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredResults.length)} of {filteredResults.length}
            </div>
            <div className="pagination-controls">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="page-btn"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
      </div>
      <div className="employee-cards-list">
      {paginatedResults.map((employee) => {
        const {
          display_name,
          designation,
          employee_id,
          employee_department,
          emp_location,
          tech_group,
          total_exp,
          ai_score,
          skill_set,
          ai_reason,
        } = employee;

        const getScoreClass = () => {
          if (ai_score >= 70) return "high";
          if (ai_score >= 50) return "medium";
          return "low";
        };

        const scoreClass = getScoreClass();
        const showSkills = showAllSkills[employee_id] || false;

        
  // AI-powered UI with scores and criteria
  if (ai_reason) {
    return (
      <div className={`employee-card ${scoreClass}-score`}>
        {ai_score && <div className={`match-badge ${scoreClass}`}>
          <div className="score-text"><span>{ai_score || 0}%</span> match</div>
        </div>}
        <div className="employee-card-content">
          <div className="employee-name-row">
            <h2 className="employee-name-search">{display_name}</h2>
            <span className="employee-designation-badge">{designation}</span>
          </div>
          <div className="employee-info-section">
            <div className="employee-header">
              <p className="employee-details-text">
                <p>
                  <i className="fa-regular fa-id-card"></i> {employee_id} &nbsp;
                </p>
                <p>
                  <i className="fa-solid fa-building"></i> {employee_department}{" "}
                  &nbsp;
                </p>
                <p>
                  <i className="fa-solid fa-location-dot"></i> {emp_location}{" "}
                  &nbsp;
                </p>
                <p>
                  <i className="fa-solid fa-laptop-code"></i> {tech_group} &nbsp;
                </p>
                <p>
                  <i className="fa-solid fa-business-time"></i> {total_exp}
                </p>
              </p>
            </div>

            <div className="employee-skill-description">
              {employee.projects && employee.projects.length > 0 && (
                <div className="employee-projects-section">
                  {/* <span className="projects-label">Projects:</span> */}
                  <div className="projects-container">
                    {employee.projects.map((project, projectIndex) => (
                      <span key={projectIndex} className="project-badge">
                        <span className="project-name">{project.project_name}</span> ({project.customer}) - {project.occupancy}%
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {skill_set && (
                <div className="employee-skills-section">
                  <span className="skills-label">Skills:</span>
                  <div className="skills-container">
                    {skill_set
                      .split(",")
                      .slice(0, showAllSkills ? undefined : 8)
                      .map((skill, skillIndex) => {
                        const trimmedSkill = skill.trim();

                        return (
                          <span
                            key={skillIndex}
                            onClick={() => {
                              const newSkill =
                                activeSkill === trimmedSkill
                                  ? null
                                  : trimmedSkill;
                              setActiveSkill(newSkill);
                              filterFunction(newSkill);
                            }}
                            className={
                              activeSkill === trimmedSkill
                                ? "skill-badge active-skill-badge"
                                : "skill-badge"
                            }
                          >
                            {trimmedSkill}
                          </span>
                        );
                      })}
                    {skill_set.split(",").length > 8 && (
                      <button
                        onClick={() => setShowAllSkills(!showAllSkills)}
                        className="skill-more-btn"
                      >
                        {showAllSkills
                          ? "Show Less"
                          : `+${skill_set.split(",").length - 8} More`}
                      </button>
                    )}
                    </div>
                </div>
              )}


              <div className="ai-reason-section">
                <button
                  onClick={() => setShowReason(!showReason)}
                  className="reason-toggle-btn"
                >
                  <span className="reason-label">Why this match?</span>
                  <i
                    className={`fa-solid fa-chevron-${showReason ? "up" : "down"}`}
                  ></i>
                </button>
                {!showReason && <p className="reason-text">{ai_reason}</p>}
              </div>
            </div>
            <div className="employee-score-section">
              {employee.ai_criteria && (
                <div className="criteria-list">
                  {Object.entries(employee.ai_criteria).map(
                    ([criteria, criteriaScore]) => {
                      const criteriaClass =
                        criteriaScore >= 70
                          ? "high"
                          : criteriaScore >= 50
                            ? "medium"
                            : "low";
                      return (
                        <div key={criteria} className="criteria-item">
                          <div className="criteria-header">
                            <span className="criteria-name">{criteria}</span>
                            <span className="criteria-score">
                              {criteriaScore}%
                            </span>
                          </div>
                          <div className="criteria-bar-bg">
                            <div
                              className={`criteria-bar-fill ${criteriaClass}`}
                              style={{ width: `${criteriaScore}%` }}
                            />
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

      })}
      </div>
    </>
  );
};

export default NavbarSearchResults;
