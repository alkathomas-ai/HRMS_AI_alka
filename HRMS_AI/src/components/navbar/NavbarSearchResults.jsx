import { useState, useContext, useRef, useEffect } from "react";
import { EmployeeContext } from "../../context/employeeContext";
import "../dashboard/SearchAssistant.css";
import "./NavbarSearchResults.css";

const NavbarSearchResults = ({ searchQuery }) => {
  const { searchResult } = useContext(EmployeeContext);
  const [activeSkill, setActiveSkill] = useState(null);
  const [showAllSkills, setShowAllSkills] = useState({});
  const [filterText, setFilterText] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
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

  const filteredResults = searchResult.result.filter(emp => 
    emp.display_name?.toLowerCase().includes(filterText.toLowerCase()) ||
    emp.employee_id?.toLowerCase().includes(filterText.toLowerCase()) ||
    emp.designation?.toLowerCase().includes(filterText.toLowerCase())
  );

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
              placeholder="Filter results..."
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        <div className="toolbar-right">
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

        return (
          <div key={employee_id} className={`employee-card ${ai_reason ? `${scoreClass}-score` : ''}`}>
            {ai_score && (
              <div className={`match-badge ${scoreClass}`}>
                <div className="score-text">
                  <span>{ai_score || 0}%</span> match
                </div>
              </div>
            )}
            <div className="employee-card-content">
              <div className="employee-name-row">
                <h2 className="employee-name-search">{display_name}</h2>
                <span className="employee-designation-badge">{designation}</span>
              </div>
              <div className={ai_reason ? "employee-info-section" : "employee-info-section-plain"}>
                <div className="employee-header">
                  <p className="employee-details-text">
                    <p><i className="fa-regular fa-id-card"></i> {employee_id} &nbsp;</p>
                    <p><i className="fa-solid fa-building"></i> {employee_department} &nbsp;</p>
                    <p><i className="fa-solid fa-location-dot"></i> {emp_location} &nbsp;</p>
                    <p><i className="fa-solid fa-laptop-code"></i> {tech_group} &nbsp;</p>
                    <p><i className="fa-solid fa-business-time"></i> {total_exp}</p>
                  </p>
                </div>

                <div className="employee-skill-description">
                  {skill_set && (
                    <div className="employee-skills-section">
                      <span className="skills-label">Skills:</span>
                      <div className="skills-container">
                        {skill_set
                          .split(",")
                          .slice(0, showSkills ? undefined : 5)
                          .map((skill, skillIndex) => {
                            const trimmedSkill = skill.trim();
                            return (
                              <span key={skillIndex} className="skill-badge">
                                {trimmedSkill}
                              </span>
                            );
                          })}
                        {skill_set.split(",").length > 5 && (
                          <button
                            onClick={() =>
                              setShowAllSkills({
                                ...showAllSkills,
                                [employee_id]: !showSkills,
                              })
                            }
                            className="skill-more-btn"
                          >
                            {showSkills
                              ? "Show Less"
                              : `+${skill_set.split(",").length - 5} More`}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {employee.projects && employee.projects.length > 0 && (
                    <div className="employee-projects-section">
                      <span className="projects-label">Projects: </span>
                      <span className="projects-text">
                        {employee.projects.map((project, projectIndex) => (
                          <span key={projectIndex}>
                            <span className="project-name">{project.project_name}</span>
                            <span className="project-customer"> ({project.customer})</span>
                            {projectIndex < employee.projects.length - 1 && <span>, </span>}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}

                  {ai_reason && (
                    <div className="ai-reason-section">
                      <p className="reason-text">{ai_reason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </>
  );
};

export default NavbarSearchResults;
