import { useState, useContext } from "react";
import { EmployeeContext } from "../../context/employeeContext";
import "../dashboard/SearchAssistant.css";

const NavbarSearchResults = ({ searchQuery }) => {
  const { searchResult } = useContext(EmployeeContext);
  const [activeSkill, setActiveSkill] = useState(null);
  const [showAllSkills, setShowAllSkills] = useState({});

  const filterOnSearch = (skill) => {
    // This would need to be implemented if filtering is needed
  };

  if (!searchResult?.result || searchResult.result.length === 0) {
    return <p>No results found for "{searchQuery}"</p>;
  }

  return (
    <div className="employee-cards-list">
      {searchResult.result.map((employee) => {
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
  );
};

export default NavbarSearchResults;
