import React, { useState } from "react";
// import "./Dashboard.css";
import "./D.css";
import "../components/dashboard/SearchAssistant.css";
import { Icons } from "../assets/icons";
import { searchAPI } from "../services/api";
import CandidateProfileModal from "../components/CandidateProfileModal";
import { useCandidateProfileModal } from "../hooks/useCandidateProfileModal";

const RequirementCard = ({ employee, filterFunction, activeSkill, setActiveSkill, onEmployeeClick }) => {
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showReason, setShowReason] = useState(false);

  if (!employee) return null;

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

  return (
    <div className={`employee-card ${scoreClass}-score`} onClick={() => onEmployeeClick(employee.employee_id)}>
      <div className={`match-badge ${scoreClass}`}>
        <div className="score-text"><span>{ai_score || 0}%</span> match</div>
      </div>
      <div className="employee-card-content">
        <div className="employee-info-section">
          <div className="employee-header">
            <div className="employee-name-row">
              <h2 className="employee-name-search">{display_name}</h2>
              <span className="employee-designation-badge">{designation}</span>
            </div>
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
            {skill_set && (
              <div className="employee-skills-section">
                <span className="skills-label">Skills:</span>
                <div className="skills-container">
                  {skill_set
                    .split(",")
                    .slice(0, showAllSkills ? undefined : 5)
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
                  {skill_set.split(",").length > 5 && (
                    <button
                      onClick={() => setShowAllSkills(!showAllSkills)}
                      className="skill-more-btn"
                    >
                      {showAllSkills
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
                      <span className="project-name">
                        {project.project_name}
                      </span>
                      <span className="project-customer">
                        {" "}
                        ({project.customer})
                      </span>
                      {projectIndex < employee.projects.length - 1 && (
                        <span>, </span>
                      )}
                    </span>
                  ))}
                </span>
              </div>
            )}

            {ai_reason && (
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
            )}
          </div>
          <div className="employee-score-section">


            {employee.ai_criteria && (
              <div className="criteria-list">
                {Object.entries(employee.ai_criteria).map(
                  ([criteria, criteriaScore]) => {
                    const criteriaClass =
                      criteriaScore >= 80
                        ? "high"
                        : criteriaScore >= 60
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
};

const D = () => {
  const { isOpen, employee, loading: modalLoading, error, openModal, closeModal } = useCandidateProfileModal();
  const [activeSkill, setActiveSkill] = useState(null);
  const [allEmployees, setAllEmployees] = useState([
    {
      display_name: "John Doe",
      designation: "Senior Developer",
      employee_id: "EMP001",
      employee_department: "Engineering",
      emp_location: "New York",
      tech_group: "Full Stack",
      total_exp: "8 years",
      ai_score: 85,
      skill_set: "React, Node.js, Python, AWS, Docker, Kubernetes",
      ai_reason: "Strong match based on technical skills and experience level",
      projects: [
        { project_name: "E-Commerce Platform", customer: "ABC Corp" },
        { project_name: "Mobile App", customer: "XYZ Inc" },
      ],
      ai_criteria: {
        "Technical Skills": 90,
        Experience: 85,
        "Domain Knowledge": 80,
      },
    },
    {
      display_name: "Jane Smith",
      designation: "Tech Lead",
      employee_id: "EMP002",
      employee_department: "Engineering",
      emp_location: "San Francisco",
      tech_group: "Backend",
      total_exp: "10 years",
      ai_score: 58,
      skill_set: "Java, Spring Boot, Microservices, PostgreSQL, Redis",
      ai_reason: "Excellent technical expertise and leadership experience",
      projects: [{ project_name: "Banking System", customer: "Finance Co" }],
      ai_criteria: {
        "Technical Skills": 50,
        Experience: 68,
        "Domain Knowledge": 54,
      },
    },
    {
      display_name: "Mike Johnson",
      designation: "Junior Developer",
      employee_id: "EMP003",
      employee_department: "Engineering",
      emp_location: "Austin",
      tech_group: "Frontend",
      total_exp: "3 years",
      ai_score: 25,
      skill_set: "React, JavaScript, CSS, HTML, Git",
      ai_reason: "Good foundational skills with growth potential",
      projects: [{ project_name: "Dashboard UI", customer: "Tech Startup" }],
      ai_criteria: {
        "Technical Skills": 70,
        Experience: 60,
        "Domain Knowledge": 65,
      },
    },
  ]);
  const [employees, setEmployees] = useState([
    {
      display_name: "John Doe",
      designation: "Senior Developer",
      employee_id: "EMP001",
      employee_department: "Engineering",
      emp_location: "New York",
      tech_group: "Full Stack",
      total_exp: "8 years",
      ai_score: 85,
      skill_set: "React, Node.js, Python, AWS, Docker, Kubernetes",
      ai_reason: "Strong match based on technical skills and experience level",
      projects: [
        { project_name: "E-Commerce Platform", customer: "ABC Corp" },
        { project_name: "Mobile App", customer: "XYZ Inc" },
      ],
      ai_criteria: {
        "Technical Skills": 90,
        Experience: 85,
        "Domain Knowledge": 80,
      },
    },
    {
      display_name: "Jane Smith",
      designation: "Tech Lead",
      employee_id: "EMP002",
      employee_department: "Engineering",
      emp_location: "San Francisco",
      tech_group: "Backend",
      total_exp: "10 years",
      ai_score: 58,
      skill_set: "Java, Spring Boot, Microservices, PostgreSQL, Redis",
      ai_reason: "Excellent technical expertise and leadership experience",
      projects: [{ project_name: "Banking System", customer: "Finance Co" }],
      ai_criteria: {
        "Technical Skills": 50,
        Experience: 68,
        "Domain Knowledge": 54,
      },
    },
    {
      display_name: "Mike Johnson",
      designation: "Junior Developer",
      employee_id: "EMP003",
      employee_department: "Engineering",
      emp_location: "Austin",
      tech_group: "Frontend",
      total_exp: "3 years",
      ai_score: 25,
      skill_set: "React, JavaScript, CSS, HTML, Git",
      ai_reason: "Good foundational skills with growth potential",
      projects: [{ project_name: "Dashboard UI", customer: "Tech Startup" }],
      ai_criteria: {
        "Technical Skills": 70,
        Experience: 60,
        "Domain Knowledge": 65,
      },
    },
  ]);
  const [inputText, setInputText] = useState();
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    setLoading(true);

    try {
      const response = await searchAPI(inputText);
      setEmployees(response?.data || response?.employee || []);
      setAllEmployees(response?.data || response?.employee || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };
 
  // console.log(employees);
  function filterOnSearch(skill) {
    let filterEmp;
    if(skill) {
      filterEmp = allEmployees.filter((item) =>
        item.skill_set
          .split(",")
          .map((s) => s.trim())
          .includes(skill.trim()),
      );
    }
    else filterEmp = allEmployees;
    setEmployees(filterEmp);
  }

  return (
    <div className="employee-matches-container">
      <div className="employee-matches-wrapper">
        <h1 className="employee-matches-title">Employee Matches</h1>
        <div className="assistant-control assistant-control-width">
          <div className="assistant-box">
            <div className="assistant-input">
              <span className="search-icon">
                <img src={Icons.search} alt="" />
              </span>

              <input
                type="text"
                placeholder="Ask me anything..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
            </div>
            {/* <div className="assistant-microphone">
                      <button className="chat-submit-btn"
                       onClick={handleSendMessage}
                       >
                        <img src={Icons.send} alt="" />
                      </button>
                    </div> */}
          </div>
        </div>
        {loading ? (
          <div className="chat-loader chat-loader-new">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="employee-cards-list">
            {employees.map((employee) => (
              <RequirementCard
                key={employee.employee_id}
                employee={employee}
                filterFunction={filterOnSearch}
                activeSkill={activeSkill}   
                setActiveSkill={setActiveSkill}
                onEmployeeClick={openModal}
              />
            ))}
          </div>
        )}
      </div>
      
      <CandidateProfileModal
        isOpen={isOpen}
        onClose={closeModal}
        employee={employee}
        loading={modalLoading}
        error={error}
      />
    </div>
  );
};

export default D;
