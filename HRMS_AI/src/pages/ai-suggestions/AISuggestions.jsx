import { useState } from "react";
import { requirementAPI } from "../../services/api";
import dummySuggestions from "../../data/dummySuggestions";
import "../D.css";
import "./AISuggestions.css";

const SuggestionCard = ({ employee, activeSkill, setActiveSkill, onSkillClick }) => {
  const [expanded, setExpanded] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);

  const { display_name, designation, employee_id, employee_department, emp_location, tech_group, total_exp, ai_score, skill_set, ai_reason } = employee;
  const scoreClass = ai_score >= 70 ? "high" : ai_score >= 50 ? "medium" : "low";

  return (
    <div className={`suggestion-card ${scoreClass}-score ${expanded ? "expanded" : ""}`}>
      <div className="suggestion-row" onClick={() => setExpanded(!expanded)}>
        <div className="suggestion-score-pill">
          <span className={`score-dot ${scoreClass}`}></span>
          <span className="score-num">{ai_score}%</span>
        </div>
        <div className="suggestion-name-col">
          <span className="suggestion-name">{display_name}</span>
          <span className="suggestion-designation">{designation}</span>
        </div>
        <div className="suggestion-meta">
          <span><i className="fa-solid fa-location-dot"></i> {emp_location}</span>
          <span><i className="fa-solid fa-laptop-code"></i> {tech_group}</span>
          <span><i className="fa-solid fa-business-time"></i> {total_exp}</span>
        </div>
        <div className="suggestion-skills-preview">
          {skill_set?.split(",").slice(0, 3).map((s, i) => (
            <span key={i} className="skill-badge">{s.trim()}</span>
          ))}
          {skill_set?.split(",").length > 3 && (
            <span className="skill-badge">+{skill_set.split(",").length - 3}</span>
          )}
        </div>
        <span className="expand-chevron material-symbols-outlined">
          {expanded ? "expand_less" : "expand_more"}
        </span>
      </div>

      {expanded && (
        <div className="suggestion-details">
          <div className="suggestion-details-grid">
            <div className="suggestion-details-left">
              <div className="employee-details-text">
                <p><i className="fa-regular fa-id-card"></i> {employee_id}</p>
                <p><i className="fa-solid fa-building"></i> {employee_department}</p>
                <p><i className="fa-solid fa-location-dot"></i> {emp_location}</p>
                <p><i className="fa-solid fa-laptop-code"></i> {tech_group}</p>
                <p><i className="fa-solid fa-business-time"></i> {total_exp}</p>
              </div>
              {employee.projects?.length > 0 && (
                <div className="employee-projects-section" style={{ marginTop: 10 }}>
                  <span className="projects-label">Projects: </span>
                  <span className="projects-text">
                    {employee.projects.map((p, i) => (
                      <span key={i}>
                        <span className="project-name">{p.project_name}</span>
                        <span className="project-customer"> ({p.customer})</span>
                        {i < employee.projects.length - 1 && ", "}
                      </span>
                    ))}
                  </span>
                </div>
              )}
              {skill_set && (
                <div className="employee-skills-section" style={{ marginTop: 10 }}>
                  <span className="skills-label">Skills:</span>
                  <div className="skills-container">
                    {skill_set.split(",").slice(0, showAllSkills ? undefined : 6).map((skill, i) => {
                      const trimmed = skill.trim();
                      const isActive = activeSkill === trimmed;
                      return (
                        <span key={i}
                          onClick={(e) => { e.stopPropagation(); const next = isActive ? null : trimmed; setActiveSkill(next); onSkillClick(next); }}
                          className={isActive ? "skill-badge active-skill-badge" : "skill-badge"}
                        >{trimmed}</span>
                      );
                    })}
                    {skill_set.split(",").length > 6 && (
                      <button onClick={(e) => { e.stopPropagation(); setShowAllSkills(!showAllSkills); }} className="skill-more-btn">
                        {showAllSkills ? "Show Less" : `+${skill_set.split(",").length - 6} More`}
                      </button>
                    )}
                  </div>
                </div>
              )}
              {ai_reason && (
                <div className="ai-reason-section" style={{ marginTop: 10 }}>
                  <span className="reason-label">Why this match?</span>
                  <p className="reason-text">{ai_reason}</p>
                </div>
              )}
            </div>
            {employee.ai_criteria && (
              <div className="suggestion-criteria">
                {Object.entries(employee.ai_criteria).map(([criteria, score]) => {
                  const cls = score >= 70 ? "high" : score >= 50 ? "medium" : "low";
                  return (
                    <div key={criteria} className="criteria-item">
                      <div className="criteria-header">
                        <span className="criteria-name">{criteria}</span>
                        <span className="criteria-score">{score}%</span>
                      </div>
                      <div className="criteria-bar-bg">
                        <div className={`criteria-bar-fill ${cls}`} style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const EMPTY_PROJECT = {
  project_name: "", client: "", required_skills: "",
  experience_min: "", experience_max: "", start_date: "", description: "", employees: [],
};

const AISuggestions = () => {
  const [projects, setProjects] = useState(dummySuggestions);
  const [activeTab, setActiveTab] = useState(dummySuggestions[0].id);
  const [activeSkill, setActiveSkill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const activeProject = projects.find((p) => p.id === activeTab);

  const handleChange = (e) => {
    setProjects(projects.map((p) => p.id === activeTab ? { ...p, [e.target.name]: e.target.value } : p));
  };

  const handleAddProject = () => {
    const newId = Date.now();
    const newProject = { ...EMPTY_PROJECT, id: newId, project_name: "New Project" };
    setProjects([...projects, newProject]);
    setActiveTab(newId);
    setActiveSkill(null);
  };

  const handleRemoveProject = (id, e) => {
    e.stopPropagation();
    const remaining = projects.filter((p) => p.id !== id);
    setProjects(remaining);
    if (activeTab === id) setActiveTab(remaining[0]?.id || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setActiveSkill(null);
    try {
      const response = await requirementAPI(activeProject);
      const result = response?.data || response?.employees || [];
      setProjects(projects.map((p) => p.id === activeTab ? { ...p, employees: result } : p));
    } catch (err) {
      setError("Failed to fetch suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkillFilter = (skill) => {
    setActiveSkill(skill);
  };

  const handleReset = () => {
    setProjects(dummySuggestions);
    setActiveTab(dummySuggestions[0].id);
    setActiveSkill(null);
    setError(null);
  };

  const displayedEmployees = activeSkill
    ? activeProject?.employees.filter((e) =>
        e.skill_set?.split(",").map((s) => s.trim().toLowerCase()).includes(activeSkill.toLowerCase())
      )
    : activeProject?.employees;

  return (
    <div className="ai-suggestions-page">
      {/* Project Tabs */}
      <div className="project-tabs-bar">
        <div className="project-tabs">
          {projects.map((p) => (
            <div
              key={p.id}
              className={`project-tab ${activeTab === p.id ? "active" : ""}`}
              onClick={() => { setActiveTab(p.id); setActiveSkill(null); setError(null); }}
            >
              <span className="material-symbols-outlined tab-icon">folder</span>
              <span className="tab-label">{p.project_name || "Untitled"}</span>
              {projects.length > 1 && (
                <span className="tab-close material-symbols-outlined" onClick={(e) => handleRemoveProject(p.id, e)}>close</span>
              )}
            </div>
          ))}
        </div>
        <button className="add-project-btn" onClick={handleAddProject}>
          <span className="material-symbols-outlined">add</span> New Project
        </button>
      </div>

      {activeProject && (
        <div className="ai-suggestions-layout">
          {/* Left: Form */}
          <div className="requirement-form-card">
            <div className="form-card-header">
              <span className="material-symbols-outlined">assignment</span>
              <h2>Project Requirement</h2>
            </div>
            <form onSubmit={handleSubmit} className="requirement-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Project Name <span className="required">*</span></label>
                  <input name="project_name" value={activeProject.project_name} onChange={handleChange} placeholder="E-Commerce Platform" required />
                </div>
                <div className="form-group">
                  <label>Client</label>
                  <input name="client" value={activeProject.client} onChange={handleChange} placeholder="Acme Corp" />
                </div>
              </div>
              <div className="form-group">
                <label>Required Skills <span className="required">*</span></label>
                <input name="required_skills" value={activeProject.required_skills} onChange={handleChange} placeholder="React, Node.js, AWS" required />
                <span className="form-hint">Comma-separated</span>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Min Exp (yrs)</label>
                  <input type="number" name="experience_min" value={activeProject.experience_min} onChange={handleChange} placeholder="3" min="0" />
                </div>
                <div className="form-group">
                  <label>Max Exp (yrs)</label>
                  <input type="number" name="experience_max" value={activeProject.experience_max} onChange={handleChange} placeholder="8" min="0" />
                </div>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" name="start_date" value={activeProject.start_date} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={activeProject.description} onChange={handleChange} placeholder="Project details, responsibilities..." rows={3} />
              </div>
              <div className="form-actions">
                <button type="button" className="reset-btn-rq btn-outline" onClick={handleReset}>Reset</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading
                    ? <><div className="btn-spinner"></div>Analyzing...</>
                    : <><span className="material-symbols-outlined">auto_awesome</span>Get Suggestions</>
                  }
                </button>
              </div>
            </form>
          </div>

          {/* Right: Results */}
          <div className="suggestions-results">
            {loading ? (
              <div className="chat-loader-new"><div className="spinner"></div></div>
            ) : error ? (
              <div className="suggestions-empty">
                <span className="material-symbols-outlined">error_outline</span>
                <p>{error}</p>
              </div>
            ) : !activeProject.employees?.length ? (
              <div className="suggestions-empty">
                <span className="material-symbols-outlined">person_search</span>
                <p>Fill in the requirement form and click <strong>Get Suggestions</strong>.</p>
              </div>
            ) : (
              <>
                <div className="results-header">
                  <h3>{displayedEmployees.length} Resource{displayedEmployees.length !== 1 ? "s" : ""} Found</h3>
                  {activeSkill && (
                    <button className="clear-filter-btn" onClick={() => setActiveSkill(null)}>
                      <span className="material-symbols-outlined">close</span> {activeSkill}
                    </button>
                  )}
                </div>
                <div className="suggestion-cards-list">
                  {displayedEmployees.map((emp) => (
                    <SuggestionCard
                      key={emp.employee_id}
                      employee={emp}
                      activeSkill={activeSkill}
                      setActiveSkill={setActiveSkill}
                      onSkillClick={handleSkillFilter}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AISuggestions;
