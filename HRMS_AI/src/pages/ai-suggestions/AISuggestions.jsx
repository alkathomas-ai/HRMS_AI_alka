import { useState, useEffect } from "react";
import { getProjectRequirements, addProjectRequirement, editProjectRequirement, getProjects, deleteProjectRequirement, generateResourceSuggestion, showResourceSuggestion } from "../../services/api";
import dummySuggestions from "../../data/dummySuggestions";
import "../D.css";
import "./AISuggestions.css";

const SuggestionCard = ({
  employee,
  activeSkill,
  setActiveSkill,
  onSkillClick,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);

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
  const scoreClass =
    ai_score >= 70 ? "high" : ai_score >= 50 ? "medium" : "low";


  return (
    <div
      className={`suggestion-card ${scoreClass}-score ${expanded ? "expanded" : ""}`}
    >
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
          <span>
            <i className="fa-solid fa-location-dot"></i> {emp_location}
          </span>
          <span>
            <i className="fa-solid fa-laptop-code"></i> {tech_group}
          </span>
          <span>
            <i className="fa-solid fa-business-time"></i> {total_exp}
          </span>
        </div>
        <div className="suggestion-skills-preview">
          {skill_set
            ?.split(",")
            .slice(0, 3)
            .map((s, i) => (
              <span key={i} className="skill-badge">
                {s.trim()}
              </span>
            ))}
          {skill_set?.split(",").length > 3 && (
            <span className="skill-badge">
              +{skill_set.split(",").length - 3}
            </span>
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
                <p>
                  <i className="fa-regular fa-id-card"></i> {employee_id}
                </p>
                <p>
                  <i className="fa-solid fa-building"></i> {employee_department}
                </p>
                <p>
                  <i className="fa-solid fa-location-dot"></i> {emp_location}
                </p>
                <p>
                  <i className="fa-solid fa-laptop-code"></i> {tech_group}
                </p>
                <p>
                  <i className="fa-solid fa-business-time"></i> {total_exp}
                </p>
              </div>
              {employee.projects?.length > 0 && (
                <div
                  className="employee-projects-section"
                  style={{ marginTop: 10 }}
                >
                  <span className="projects-label">Projects: </span>
                  <span className="projects-text">
                    {employee.projects.map((p, i) => (
                      <span key={i}>
                        <span className="project-name">{p.project_name}</span>
                        <span className="project-customer">
                          {" "}
                          ({p.customer})
                        </span>
                        {i < employee.projects.length - 1 && ", "}
                      </span>
                    ))}
                  </span>
                </div>
              )}
              {skill_set && (
                <div
                  className="employee-skills-section"
                  style={{ marginTop: 10 }}
                >
                  <span className="skills-label">Skills:</span>
                  <div className="skills-container">
                    {skill_set
                      .split(",")
                      .slice(0, showAllSkills ? undefined : 6)
                      .map((skill, i) => {
                        const trimmed = skill.trim();
                        const isActive = activeSkill === trimmed;
                        return (
                          <span
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              const next = isActive ? null : trimmed;
                              setActiveSkill(next);
                              onSkillClick(next);
                            }}
                            className={
                              isActive
                                ? "skill-badge active-skill-badge"
                                : "skill-badge"
                            }
                          >
                            {trimmed}
                          </span>
                        );
                      })}
                    {skill_set.split(",").length > 6 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAllSkills(!showAllSkills);
                        }}
                        className="skill-more-btn"
                      >
                        {showAllSkills
                          ? "Show Less"
                          : `+${skill_set.split(",").length - 6} More`}
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
                {Object.entries(employee.ai_criteria).map(
                  ([criteria, score]) => {
                    const cls =
                      score >= 70 ? "high" : score >= 50 ? "medium" : "low";
                    return (
                      <div key={criteria} className="criteria-item">
                        <div className="criteria-header">
                          <span className="criteria-name">{criteria}</span>
                          <span className="criteria-score">{score}%</span>
                        </div>
                        <div className="criteria-bar-bg">
                          <div
                            className={`criteria-bar-fill ${cls}`}
                            style={{ width: `${score}%` }}
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
      )}
    </div>
  );
};

const EMPTY_PROJECT = {
  project_name: "",
  client: "",
  required_skills: "",
  experience_min: "",
  experience_max: "",
  start_date: "",
  description: "",
  employees: [],
};

const AISuggestions = () => {
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjectRequirements();
        const result = Array.isArray(data)
          ? data
          : data?.data || data?.projects || [];
        setProjects(
          result.map((p) => ({ ...p, employees: p.employees || [] })),
        );
      } catch (err) {
        console.error("Failed to fetch projects, using dummy data", err);
        setProjects(dummySuggestions);
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, []);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeSkill, setActiveSkill] = useState(null);
  const [loading, setLoading] = useState(false);
  // Track which project is currently loading for suggestions
  const [loadingProjectId, setLoadingProjectId] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_PROJECT);
  const [editingId, setEditingId] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [projectSearch, setProjectSearch] = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const filteredProjectsList = projectSearch
    ? projectsList.filter((p) =>
        p.project_name?.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.customer?.toLowerCase().includes(projectSearch.toLowerCase())
      )
    : projectsList;

  const handleRowClick = async (project) => {
    // await getResourceSuggestion(project)
    if (selectedProject?.id === project.id) {
      setSelectedProject(null);
    } else {
      const latest = projects.find((p) => p.id === project.id);
      setSelectedProject(latest);
      setActiveSkill(null);
    }
  };

  const handleFormChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const fetchProjectsList = async () => {
    try {
      const data = await getProjects();
      console.log('Projects API raw response:', data);
      const list = data?.response ?? [];
      console.log('Projects list parsed:', list);
      setProjectsList(list);
    } catch (err) {
      console.error('Failed to fetch projects list', err);
    }
  };

  const handleAddNew = () => {
    setForm(EMPTY_PROJECT);
    setEditingId(null);
    setProjectSearch('');
    setShowForm(true);
    setSelectedProject(null);
    fetchProjectsList();
  };

  const handleEdit = (project, e) => {
    e.stopPropagation();
    setForm({ ...project });
    setEditingId(project.id);
    setProjectSearch(project.project_name || '');
    setShowForm(true);
    setSelectedProject(null);
    fetchProjectsList();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this requirement?')) return;
    try {
      await deleteProjectRequirement(id);
      setProjects(projects.filter((p) => p.id !== id));
      if (selectedProject?.id === id) setSelectedProject(null);
    } catch (err) {
      const msg = err.response?.data?.detail || '';
      if (msg.includes('ForeignKeyViolation') || msg.includes('still referenced')) {
        alert('Cannot delete this requirement because it has linked suggestions. Please delete the suggestions first.');
      } else {
        alert('Failed to delete. Please try again.');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      const original = projects.find((p) => p.id === editingId);
      try {
        const response = await editProjectRequirement(editingId, form);
        if (response) {
          // Update the project in the list
          const updatedProject = { ...original, ...form, id: editingId };
          setProjects(projects.map((p) =>
            p.id === editingId ? updatedProject : p
          ));
          
          // Close the modal immediately
          setShowForm(false);
          setForm(EMPTY_PROJECT);
          setEditingId(null);
          
          // Show loader in the table row's Get AI Suggestions button and call API
          setLoadingProjectId(editingId);
          if (selectedProject?.id === editingId) {
            setSelectedProject(updatedProject);
            setLoading(true);
          }
          
          handlegeneratedResponse(updatedProject)
            .catch(err => console.error('Failed to refresh suggestions after edit', err))
            .finally(() => {
              setLoadingProjectId(null);
              if (selectedProject?.id === editingId) {
                setLoading(false);
              }
            });
        }
      } catch (err) {
        console.error('Edit failed, updating locally', err);
        setProjects(projects.map((p) =>
          p.id === editingId ? { ...original, ...form, id: editingId } : p
        ));
        // Close modal even on error
        setShowForm(false);
        setForm(EMPTY_PROJECT);
        setEditingId(null);
      }
    } else {
      let newId = null;
      try {
        const res = await addProjectRequirement(form);
        newId = res?.id || res?.project_requirement_id || null; 
        const newProject = { ...form, id: newId, employees: [] };
        setProjects((prev) => [...prev, newProject]);
        setShowForm(false);
        setForm(EMPTY_PROJECT);
        setEditingId(null);
        // fetch suggestions for the new requirement
        if (newId) {
          setSelectedProject(newProject);
          setActiveSkill(null);
          setLoadingProjectId(newId);
          setLoading(true);
          try {
            const suggestions = await generateResourceSuggestion(newId);
            const employees = suggestions?.response?.[0]?.response ?? [];
            const updated = { ...newProject, employees };
            setProjects((prev) => prev.map((p) => p.id === newId ? updated : p));
            setSelectedProject(updated);
          } catch (err) {
            console.error('Failed to fetch suggestions', err);
          } finally {
            setLoadingProjectId(null);
            setLoading(false);
          }
        }
        return;
      } catch (err) {
        console.error('Add failed, adding locally', err);
        setProjects((prev) => [...prev, { ...form, id: Date.now(), employees: [] }]);
      }
    }
    setShowForm(false);
    setForm(EMPTY_PROJECT);
    setEditingId(null);
  };

  const handleGetSuggestions = async (project, e) => {
    e.stopPropagation();
    setSelectedProject(project);
    setActiveSkill(null);
    setLoadingProjectId(project.id);
    setLoading(true);
    setError(null);
    try {
      await handlegeneratedResponse(project);
    } catch (err) {
      console.log(err);
      setSelectedProject(project);
    } finally {
      setLoadingProjectId(null);
      setLoading(false);
    }
  };

  const handlegeneratedResponse = async (project) => {
    const response = await generateResourceSuggestion(project.id);
    const result = response?.response?.[0]?.response ?? [];
    if (result.length > 0) {
      const updated = projects.map((p) =>
        p.id === project.id ? { ...p, employees: result } : p,
      );
      setProjects(updated);
      setSelectedProject({ ...project, employees: result });
    } else {
      setSelectedProject(project);
    }
  };

  const handleShowResourceSuggestion = async (project) => {
    const response = await showResourceSuggestion(project.id);
    console.log('Suggestions response:', response);
    const result = response?.response?.[0].suggestion ?? [];
    if (result.length > 0) {
      const updated = projects.map((p) =>
        p.id === project.id ? { ...p, employees: result } : p,
      );
      setProjects(updated);
      setSelectedProject({ ...project, employees: result });
    } else {
      setSelectedProject(project);
    }
  };

  const getResourceSuggestion = async (project) => {
    setSelectedProject(project);
    setActiveSkill(null);
    setLoadingProjectId(project.id);
    setLoading(true);
    setError(null);
    try {
      await handleShowResourceSuggestion(project);
    } catch (err) {
      console.log(err);
      setSelectedProject(project);
    } finally {
      setLoadingProjectId(null);
      setLoading(false);
    }
  };

  const handleSkillFilter = (skill) => setActiveSkill(skill);

  const displayedEmployees = activeSkill
    ? selectedProject?.employees?.filter((e) =>
        e.skill_set
          ?.split(",")
          .map((s) => s.trim().toLowerCase())
          .includes(activeSkill.toLowerCase()),
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
              <span className="material-symbols-outlined">add</span> Add
              Requirement
            </button>
          </div>

          <div className="projects-table-card">
            <table className="projects-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  {/* <th>Required Skills</th> */}
                  <th>Requirements</th>
                  {/* <th>Experience</th>
                  <th>Start Date</th>
                  <th>Suggestions</th> */}
                  <th>Updated At</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {projectsLoading ? (
                  <tr>
                    <td colSpan={7} className="table-loader">
                      <div className="table-loader-inner">
                        <div className="spinner"></div>
                        <span>Fetching projects...</span>
                      </div>
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-empty">
                      No requirements added yet. Click "Add Requirement" to get
                      started.
                    </td>
                  </tr>
                ) : null}
                {!projectsLoading &&
                  projects.map((p) => (
                    <tr
                      key={p.id}
                      className={`project-row ${selectedProject?.id === p.id ? "active-row" : ""}`}
                      onClick={() => getResourceSuggestion(p)}
                    >
                      <td>
                        <div className="project-name-cell">
                          <span className="material-symbols-outlined project-row-icon">
                            folder
                          </span>
                          <span>{p.project_name || "—"}</span>
                        </div>
                      </td>
                      <td>{p.customer || "—"}</td>
                      <td>
                        {/* <div className="table-skills">
                        {p.required_skills?.split(",").slice(0, 3).map((s, i) => (
                          <span key={i} className="skill-badge">{s.trim()}</span>
                        ))}
                        {p.required_skills?.split(",").length > 3 && (
                          <span className="skill-badge">+{p.required_skills.split(",").length - 3}</span>
                        )}
                      </div> */}
                        {p.requirements}
                      </td>
                      {/* <td>{p.experience_min || "—"}{p.experience_max ? `–${p.experience_max} yrs` : p.experience_min ? " yrs" : ""}</td> */}
                      {/* <td>{p.start_date || "—"}</td> */}
                      <td>
                        {p.updated_at
                          ? new Date(p.updated_at).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "—"}
                      </td>
                      {/* <td>{p.updated_at ? timeAgo(p.updated_at) : "—"}</td> */}
                      {/* <td>
                        {p.employees?.length > 0 ? (
                          <span className="suggestions-count">
                            <span className="material-symbols-outlined">
                              group
                            </span>
                            {p.employees.length} found
                          </span>
                        ) : (
                          <span className="no-suggestions">—</span>
                        )}
                      </td> */}
                      <td
                        className="row-actions"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="icon-action-btn"
                          title="Get AI Suggestions"
                          onClick={(e) => handleGetSuggestions(p, e)}
                          disabled={loadingProjectId === p.id}
                        >
                          {loadingProjectId === p.id ? (
                            <div className="spinner-small"></div>
                          ) : (
                            <span className="material-symbols-outlined">
                              auto_awesome
                            </span>
                          )}
                        </button>
                        <button
                          className="icon-action-btn"
                          title="Edit"
                          onClick={(e) => handleEdit(p, e)}
                        >
                          <span className="material-symbols-outlined">
                            edit
                          </span>
                        </button>
                        <button
                          className="icon-action-btn danger"
                          title="Delete"
                          onClick={(e) => handleDelete(p.id, e)}
                        >
                          <span className="material-symbols-outlined">
                            delete
                          </span>
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
                  <span>{selectedProject.customer}</span>
                </div>
                <button
                  className="panel-close-btn"
                  onClick={() => setSelectedProject(null)}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="panel-body">
                {loading ? (
                  <div className="chat-loader-new">
                    <div className="spinner"></div>
                  </div>
                ) : error ? (
                  <div className="suggestions-empty">
                    <span className="material-symbols-outlined">
                      error_outline
                    </span>
                    <p>{error}</p>
                  </div>
                ) : !selectedProject.employees?.length ? (
                  <div className="suggestions-empty">
                    <span className="material-symbols-outlined">
                      auto_awesome
                    </span>
                    <p>
                      Click the <strong>✨</strong> button on the row to get AI
                      suggestions for this project.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="results-header">
                      <h4>
                        {displayedEmployees.length} Resource
                        {displayedEmployees.length !== 1 ? "s" : ""} Found
                      </h4>
                      {activeSkill && (
                        <button
                          className="clear-filter-btn"
                          onClick={() => setActiveSkill(null)}
                        >
                          <span className="material-symbols-outlined">
                            close
                          </span>{" "}
                          {activeSkill}
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
              <button
                className="panel-close-btn"
                onClick={() => setShowForm(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="requirement-form">
              <div className="form-row">
                <div className="project-suggestion-form-group">
                  <label>Project Name <span className="required">*</span></label>
                  <div className="autocomplete-wrapper">
                    <input
                      name="project_name"
                      value={projectSearch}
                      onChange={(e) => {
                        setProjectSearch(e.target.value);
                        setForm({ ...form, project_name: e.target.value, customer: form.customer });
                        setShowProjectDropdown(true);
                      }}
                      onFocus={() => setShowProjectDropdown(true)}
                      onBlur={() => setTimeout(() => setShowProjectDropdown(false), 150)}
                      placeholder="Eg: BPLU_DCMA"
                      required
                      autoComplete="off"
                    />
                    {showProjectDropdown && filteredProjectsList.length > 0 && (
                      <div className="autocomplete-dropdown">
                        {filteredProjectsList.map((p, i) => (
                          <div
                            key={i}
                            className="autocomplete-option"
                            onMouseDown={() => {
                              setForm({ ...form, project_name: p.project_name, customer: p.customer || form.customer });
                              setProjectSearch(p.project_name);
                              setShowProjectDropdown(false);
                            }}
                          >
                            <span className="autocomplete-project-name">{p.project_name}</span>
                            {p.customer && <span className="autocomplete-customer">{p.customer}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>Client</label>
                  <input
                    name="customer"
                    value={form.customer}
                    onChange={handleFormChange}
                    placeholder="Eg: Buspatrol"
                    readOnly
                    className="readonly-input"
                  />
                </div>
              </div>
              <div className="form-group">
                {/* <label>Required Skills <span className="required">*</span></label> */}
                <label>
                  Requirements <span className="required">*</span>
                </label>
                <textarea
                  name="requirements"
                  value={form.requirements}
                  onChange={handleFormChange}
                  placeholder="React employee with 3 years experience"
                  rows={3}
                  required
                />
                {/* <span className="form-hint">Comma-separated</span> */}
              </div>
              {/* <div className="form-row">
                <div className="form-group">
                  <label>Min Exp (yrs)</label>
                  <input
                    type="number"
                    name="experience_min"
                    value={form.experience_min}
                    onChange={handleFormChange}
                    placeholder="3"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Max Exp (yrs)</label>
                  <input
                    type="number"
                    name="experience_max"
                    value={form.experience_max}
                    onChange={handleFormChange}
                    placeholder="8"
                    min="0"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Project details, responsibilities..."
                  rows={3}
                />
              </div> */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <span className="material-symbols-outlined">
                    {editingId ? "save" : "add"}
                  </span>
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
