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
  const [selectedProject, setSelectedProject] = useState(dummySuggestions[0]);
  const [activeSkill, setActiveSkill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_PROJECT);
  const [editingId, setEditingId] = useState(null);

  const handleRowClick = (project) => {
    if (selectedProject?.id === project.id) {
      setSelectedProject(null);
    } else {
      const latest = projects.find((p) => p.id === project.id);
      setSelectedProject(latest);
      setActiveSkill(null);
    }
  };

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddNew = () => {
    setForm(EMPTY_PROJECT);
    setEditingId(null);
    setShowForm(true);
    setSelectedProject(null);
  };

  const handleEdit = (project, e) => {
    e.stopPropagation();
    setForm({ ...project });
    setEditingId(project.id);
    setShowForm(true);
    setSelectedProject(null);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setProjects(projects.filter((p) => p.id !== id));
    if (selectedProject?.id === id) setSelectedProject(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      const original = projects.find((p) => p.id === editingId);
      setProjects(projects.map((p) => p.id === editingId ? { ...original, ...form, id: editingId } : p));
    } else {
      const newProject = { ...form, id: Date.now(), employees: [] };
      setProjects([...projects, newProject]);
    }
    setShowForm(false);
    setForm(EMPTY_PROJECT);
    setEditingId(null);
  };

  const handleGetSuggestions = async (project, e) => {
    e.stopPropagation();
    const latest = projects.find((p) => p.id === project.id);
    setSelectedProject(latest);
    setActiveSkill(null);
    setLoading(true);
    setError(null);
    try {
      const response = await requirementAPI(project);
      const result = response?.data || response?.employees || [];
      if (result.length > 0) {
        const updated = projects.map((p) => p.id === project.id ? { ...p, employees: result } : p);
        setProjects(updated);
        setSelectedProject({ ...latest, employees: result });
      } else {
        setSelectedProject(latest);
      }
    } catch (err) {
      // keep existing employees on error
      setSelectedProject(latest);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillFilter = (skill) => setActiveSkill(skill);

  const displayedEmployees = activeSkill
    ? selectedProject?.employees?.filter((e) =>
        e.skill_set?.split(",").map((s) => s.trim().toLowerCase()).includes(activeSkill.toLowerCase())
      )
    : selectedProject?.employees;

  const panelOpen = !!selectedProject;

  return (
    <div className="ai-suggestions-page">
      <div className={`ais-container ${panelOpen ? "panel-open" : ""}`}>

        {/* Main Table Area */}
        <div className="ais-main">
          <div className="ais-toolbar">
            <div>
              <h1 className="welcome-title">AI Resource Suggestions</h1>
            </div>
            <button className="btn-primary" onClick={handleAddNew}>
              <span className="material-symbols-outlined">add</span> Add Requirement
            </button>
          </div>

          <div className="projects-table-card">
            <table className="projects-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Required Skills</th>
                  <th>Experience</th>
                  <th>Start Date</th>
                  <th>Suggestions</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={7} className="table-empty">No requirements added yet. Click "Add Requirement" to get started.</td>
                  </tr>
                )}
                {projects.map((p) => (
                  <tr
                    key={p.id}
                    className={`project-row ${selectedProject?.id === p.id ? "active-row" : ""}`}
                    onClick={() => handleRowClick(p)}
                  >
                    <td>
                      <div className="project-name-cell">
                        <span className="material-symbols-outlined project-row-icon">folder</span>
                        <span>{p.project_name || "—"}</span>
                      </div>
                    </td>
                    <td>{p.client || "—"}</td>
                    <td>
                      <div className="table-skills">
                        {p.required_skills?.split(",").slice(0, 3).map((s, i) => (
                          <span key={i} className="skill-badge">{s.trim()}</span>
                        ))}
                        {p.required_skills?.split(",").length > 3 && (
                          <span className="skill-badge">+{p.required_skills.split(",").length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td>{p.experience_min || "—"}{p.experience_max ? `–${p.experience_max} yrs` : p.experience_min ? " yrs" : ""}</td>
                    <td>{p.start_date || "—"}</td>
                    <td>
                      {p.employees?.length > 0
                        ? <span className="suggestions-count"><span className="material-symbols-outlined">group</span>{p.employees.length} found</span>
                        : <span className="no-suggestions">—</span>
                      }
                    </td>
                    <td className="row-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="icon-action-btn" title="Get AI Suggestions" onClick={(e) => handleGetSuggestions(p, e)}>
                        <span className="material-symbols-outlined">auto_awesome</span>
                      </button>
                      <button className="icon-action-btn" title="Edit" onClick={(e) => handleEdit(p, e)}>
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button className="icon-action-btn danger" title="Delete" onClick={(e) => handleDelete(p.id, e)}>
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Slide Panel */}
        <div className={`suggestions-panel ${panelOpen ? "open" : ""}`}>
          {selectedProject && (
            <>
              <div className="panel-header">
                <div className="panel-header-info">
                  <h3>{selectedProject.project_name}</h3>
                  <span>{selectedProject.client}</span>
                </div>
                <button className="panel-close-btn" onClick={() => setSelectedProject(null)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="panel-body">
                {loading ? (
                  <div className="chat-loader-new"><div className="spinner"></div></div>
                ) : error ? (
                  <div className="suggestions-empty">
                    <span className="material-symbols-outlined">error_outline</span>
                    <p>{error}</p>
                  </div>
                ) : !selectedProject.employees?.length ? (
                  <div className="suggestions-empty">
                    <span className="material-symbols-outlined">auto_awesome</span>
                    <p>Click the <strong>✨</strong> button on the row to get AI suggestions for this project.</p>
                  </div>
                ) : (
                  <>
                    <div className="results-header">
                      <h4>{displayedEmployees.length} Resource{displayedEmployees.length !== 1 ? "s" : ""} Found</h4>
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
            </>
          )}
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h3>{editingId ? "Edit Requirement" : "New Requirement"}</h3>
              <button className="panel-close-btn" onClick={() => setShowForm(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="requirement-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Project Name <span className="required">*</span></label>
                  <input name="project_name" value={form.project_name} onChange={handleFormChange} placeholder="E-Commerce Platform" required />
                </div>
                <div className="form-group">
                  <label>Client</label>
                  <input name="client" value={form.client} onChange={handleFormChange} placeholder="Acme Corp" />
                </div>
              </div>
              <div className="form-group">
                <label>Required Skills <span className="required">*</span></label>
                <input name="required_skills" value={form.required_skills} onChange={handleFormChange} placeholder="React, Node.js, AWS" required />
                <span className="form-hint">Comma-separated</span>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Min Exp (yrs)</label>
                  <input type="number" name="experience_min" value={form.experience_min} onChange={handleFormChange} placeholder="3" min="0" />
                </div>
                <div className="form-group">
                  <label>Max Exp (yrs)</label>
                  <input type="number" name="experience_max" value={form.experience_max} onChange={handleFormChange} placeholder="8" min="0" />
                </div>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" name="start_date" value={form.start_date} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Project details, responsibilities..." rows={3} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <span className="material-symbols-outlined">{editingId ? "save" : "add"}</span>
                  {editingId ? "Save Changes" : "Add Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISuggestions;
