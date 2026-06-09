import { useState, useEffect } from "react";
import {
  getProjectRequirements,
  addProjectRequirement,
  editProjectRequirement,
  getProjects,
  deleteProjectRequirement,
  generateResourceSuggestion,
  showResourceSuggestion,
} from "../../services/api";
import "../../components/dashboard/SearchAssistant.css";
import "./AISuggestions.css";
import { useToast } from "../../context/ToastContext";
import JDMatch from "./JDMatch";
import ResumeMatch from "./ResumeMatch";
import useConfirmation from "../../components/common/useConfirmation";
import CandidateProfileModal from "../../components/CandidateProfileModal";
import { useCandidateProfileModal } from "../../hooks/useCandidateProfileModal";
import SuggestionCard from "../../components/common/SuggestionCard";
import ProfileCard from "../../components/common/ProfileCard";



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
  const [activeTab, setActiveTab] = useState("projects");
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeSkill, setActiveSkill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProjectId, setLoadingProjectId] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_PROJECT);
  const [editingId, setEditingId] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [projectsSearchQuery, setProjectsSearchQuery] = useState("");
  const [aiSuggestionsSearchQuery, setAiSuggestionsSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isRowsDropdownOpen, setIsRowsDropdownOpen] = useState(false);
  const { showSuccess, showError, showInfo } = useToast();
  const { confirm, ConfirmationModal } = useConfirmation();

  // Candidate Profile Modal for delivery owner
  const {
    isOpen: isModalOpen,
    employee: selectedEmployee,
    loading: modalLoading,
    error: modalError,
    openModal,
    closeModal,
  } = useCandidateProfileModal();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch project requirements for AI suggestions tab
        const requirementsData = await getProjectRequirements();
        const requirementsResult = Array.isArray(requirementsData)
          ? requirementsData
          : requirementsData?.data || requirementsData?.projects || [];
        setProjects(
          requirementsResult.map((p) => ({
            ...p,
            employees: p.employees || [],
          })),
        );

        // Fetch all projects for projects tab
        await fetchProjectsList();
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setProjectsLoading(false);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProjectsList = projectSearch
    ? projectsList.filter(
        (p) =>
          p.project_name?.toLowerCase().includes(projectSearch.toLowerCase()) ||
          p.customer?.toLowerCase().includes(projectSearch.toLowerCase()),
      )
    : projectsList;

  const filteredProjectsForTab = projectsSearchQuery
    ? projectsList.filter(
        (p) =>
          p.project_name
            ?.toLowerCase()
            .includes(projectsSearchQuery.toLowerCase()) ||
          p.customer
            ?.toLowerCase()
            .includes(projectsSearchQuery.toLowerCase()) ||
          p.project_department
            ?.toLowerCase()
            .includes(projectsSearchQuery.toLowerCase()) ||
          p.project_status
            ?.toLowerCase()
            .includes(projectsSearchQuery.toLowerCase()) ||
          p.delivery_owner
            ?.toLowerCase()
            .includes(projectsSearchQuery.toLowerCase()),
      )
    : projectsList;

  // Pagination logic
  const totalPages = Math.ceil(filteredProjectsForTab.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = filteredProjectsForTab.slice(startIndex, endIndex);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [projectsSearchQuery]);

  const filteredProjectsForAI = aiSuggestionsSearchQuery
    ? projects.filter(
        (p) =>
          p.project_name
            ?.toLowerCase()
            .includes(aiSuggestionsSearchQuery.toLowerCase()) ||
          p.customer
            ?.toLowerCase()
            .includes(aiSuggestionsSearchQuery.toLowerCase()) ||
          p.client
            ?.toLowerCase()
            .includes(aiSuggestionsSearchQuery.toLowerCase()) ||
          p.requirements
            ?.toLowerCase()
            .includes(aiSuggestionsSearchQuery.toLowerCase()) ||
          p.required_skills
            ?.toLowerCase()
            .includes(aiSuggestionsSearchQuery.toLowerCase()),
      )
    : projects;

  const handleRowClick = async (project) => {
    if (selectedProject?.id === project.id) {
      setSelectedProject(null);
    } else {
      const latest = projects.find((p) => p.id === project.id);
      setSelectedProject(latest);
      setActiveSkill(null);
      // Only switch to AI suggestions tab if we're not already there
      if (activeTab === "projects") {
        setActiveTab("ai-suggestions");
      }
    }
  };

  const handleFormChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const fetchProjectsList = async () => {
    try {
      const data = await getProjects();
      const list = data?.response ?? [];
      setProjectsList(list);
    } catch (err) {
      console.error("Failed to fetch projects list", err);
    }
  };

  const handleAddNew = () => {
    setForm(EMPTY_PROJECT);
    setEditingId(null);
    setProjectSearch("");
    setShowForm(true);
    setSelectedProject(null);
    fetchProjectsList();
  };

  const handleEdit = (project) => {
    setForm(project);
    setEditingId(project.id);
    setShowForm(true);
    fetchProjectsList();
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
          setProjects(
            projects.map((p) => (p.id === editingId ? updatedProject : p)),
          );
          showSuccess("Project Requirement updated successfully!");
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
            .catch((err) => {
              console.error("Failed to refresh suggestions after edit", err);
              showError("Failed to refresh suggestions!");
            })
            .finally(() => {
              setLoadingProjectId(null);
              if (selectedProject?.id === editingId) {
                setLoading(false);
              }
            });
        }
      } catch (err) {
        console.error("Edit failed, updating locally", err);
        setProjects(
          projects.map((p) =>
            p.id === editingId ? { ...original, ...form, id: editingId } : p,
          ),
        );
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
            setProjects((prev) =>
              prev.map((p) => (p.id === newId ? updated : p)),
            );
            setSelectedProject(updated);
          } catch (err) {
            console.error("Failed to fetch suggestions", err);
          } finally {
            setLoadingProjectId(null);
            setLoading(false);
          }
        }
        showSuccess("Project Requirement added successfully!");
        return;
      } catch (err) {
        console.error("Add failed, adding locally", err);
        showError("Failed to add Project Requirement!");
        setProjects((prev) => [
          ...prev,
          { ...form, id: Date.now(), employees: [] },
        ]);
      }
    }
    setShowForm(false);
    setForm(EMPTY_PROJECT);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm(
      "Are you sure you want to delete this project?",
    );
    if (!confirmed) return;

    try {
      await deleteProjectRequirement(id);
      showSuccess("Project deleted successfully");
      const data = await getProjectRequirements();
      const result = Array.isArray(data)
        ? data
        : data?.data || data?.projects || [];
      setProjects(result.map((p) => ({ ...p, employees: p.employees || [] })));
    } catch (err) {
      showError("Failed to delete project");
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

  const handleShowResourceSuggestion = async (project) => {
    const response = await showResourceSuggestion(project.id);
    console.log("Suggestions response:", response);
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

  const handleEditProject = (project, e) => {
    e.stopPropagation();
    setForm({ ...project });
    setEditingId(project.id);
    setProjectSearch(project.project_name || "");
    setShowForm(true);
    setSelectedProject(null);
    fetchProjectsList();
  };

  const handleDeleteProject = async (id, e) => {
    e.stopPropagation();
    const confirmed = await confirm({
      title: "Delete Requirement",
      message:
        "Are you sure you want to delete this project requirement? This action cannot be undone.",
    });
    if (!confirmed) return;
    try {
      await deleteProjectRequirement(id);
      setProjects(projects.filter((p) => p.id !== id));
      if (selectedProject?.id === id) setSelectedProject(null);
      showSuccess("Project requirement deleted successfully!");
    } catch (err) {
      const msg = err.response?.data?.detail || "";
      if (
        msg.includes("ForeignKeyViolation") ||
        msg.includes("still referenced")
      ) {
        showError("Cannot delete: this requirement has linked suggestions.");
      } else {
        showError("Failed to delete. Please try again.");
      }
    }
  };

  const handleDropdownToggle = (projectId, event) => {
    event.stopPropagation();
    setOpenDropdownId(openDropdownId === projectId ? null : projectId);
  };

  const handleDropdownAction = (action, project, event) => {
    event.stopPropagation();
    setOpenDropdownId(null);
    setIsRowsDropdownOpen(false);

    switch (action) {
      case "edit":
        handleEditProject(project, event);
        break;
      case "delete":
        handleDeleteProject(project.id, event);
        break;
      case "generate":
        handleGetSuggestions(project, event);
        break;
      default:
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both dropdowns
      if (!event.target.closest('.action-dropdown-container') && 
          !event.target.closest('.user-select-wrapper')) {
        setOpenDropdownId(null);
        setIsRowsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // // Helper function to extract employee ID from delivery owner
  // const extractEmployeeId = (deliveryOwner) => {
  //   if (!deliveryOwner) return null;
  //   // Assuming format is "EMP123 - John Doe" or just "EMP123"
  //   const match = deliveryOwner.match(/^([A-Z0-9]+)/);
  //   return match ? match[1] : null;
  // };

  // Handle delivery owner click
  const handleDeliveryOwnerClick = (deliveryOwner, e) => {
    e.stopPropagation();
    if (deliveryOwner) {
      openModal(deliveryOwner);
    }
  };

  const renderProjectsTab = () => (
    <div className="projects-content">
      <div className="projects-table-card">
        {/* Search box integrated with table */}
        <div className="table-search-header">
          <div className="search-box">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search projects by name, customer, department..."
              value={projectsSearchQuery}
              onChange={(e) => setProjectsSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Customer</th>
                <th>Department</th>
                <th>Status</th>
                <th>Delivery Owner</th>
                <th>Project Manager</th>
                <th>End Date</th>
                <th>Updated At</th>
              </tr>
            </thead>
            <tbody>
              {projectsLoading ? (
                <tr>
                  <td colSpan={8} className="table-loader">
                    <div className="table-loader-inner">
                      <div className="spinner"></div>
                      <span>Fetching projects...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProjectsForTab.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table-empty">
                    {projectsSearchQuery
                      ? "No projects found matching your search."
                      : "No projects found."}
                  </td>
                </tr>
              ) : (
                currentProjects.map((project, index) => (
                  <tr
                    key={`${project.project_name}-${index}`}
                    className="project-row"
                  >
                    <td>
                      <div className="project-name-cell">
                        <span className="material-symbols-outlined project-row-icon">
                          folder
                        </span>
                        <span>{project.project_name || "—"}</span>
                      </div>
                    </td>
                    <td>{project.customer || "—"}</td>
                    <td>{project.project_department || "—"}</td>
                    <td>
                      <span
                        className={`status-badge ${project.project_status?.toLowerCase()}`}
                      >
                        {project.project_status || "—"}
                      </span>
                    </td>
                    <td>
                      {project.delivery_owner ? (
                        <span
                          className="delivery-owner-clickable"
                          onClick={(e) =>
                            handleDeliveryOwnerClick(
                              project.delivery_owner_emp_id,
                              e,
                            )
                          }
                          title="Click to view employee profile"
                        >
                          {project.delivery_owner}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {project.pm
                        ? project.pm.split(" - ")[1] || project.pm
                        : "—"}
                    </td>
                    <td>
                      {project.project_extended_end_date ||
                        project.project_committed_end_date ||
                        "—"}
                    </td>
                    <td>
                      {project.updated_at
                        ? new Date(project.updated_at).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bottom-pagination">
            <div className="rows-selector">
              <span>Rows per page:</span>
              <div className="user-select-wrapper">
                <div 
                  className="select-trigger"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRowsDropdownOpen(!isRowsDropdownOpen);
                  }}
                >
                  <span>{itemsPerPage}</span>
                  <span className="material-symbols-outlined">
                    {isRowsDropdownOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </div>
                {isRowsDropdownOpen && (
                  <div className="user-dropdown-menu">
                    {[10, 15, 25].map(value => (
                      <div 
                        key={value}
                        className="option"
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemsPerPage(value);
                          setCurrentPage(1);
                          setIsRowsDropdownOpen(false);
                        }}
                      >
                        {value}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="pagination-info">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredProjectsForTab.length)} of {filteredProjectsForTab.length} projects
            </div>
            <div className="pagination-controls">
              <button
                className="page-btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                className="page-btn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAISuggestionsTab = () => {
    const panelOpen = !!selectedProject;
    const displayedEmployees = activeSkill
      ? selectedProject?.employees?.filter((e) =>
          e.skill_set
            ?.split(",")
            .map((s) => s.trim().toLowerCase())
            .includes(activeSkill.toLowerCase()),
        )
      : selectedProject?.employees;

    return (
      <div className="ai-suggestions-content">
        <div className={`ais-container ${panelOpen ? "panel-open" : ""}`}>
          {/* Main Table Area */}
          <div className="ais-main">
            {/* <div className="ais-toolbar">
              <div>
                <h1 className="welcome-title">AI Resource Suggestions</h1>
              </div>
            </div> */}

            <div className="projects-table-card">
              {/* Search box integrated with table */}
              <div className="table-search-header">
                <div className="search-box">
                  <span className="material-symbols-outlined">search</span>
                  <input
                    type="text"
                    placeholder="Search by project, client, requirements..."
                    value={aiSuggestionsSearchQuery}
                    onChange={(e) =>
                      setAiSuggestionsSearchQuery(e.target.value)
                    }
                  />
                </div>
                <button
                  className="add-requirement-btn"
                  onClick={() => setShowForm(true)}
                >
                  Add Project Requirement
                </button>
              </div>

              <div className="table-wrapper">
                <table className="projects-table">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Client</th>
                      <th>Requirements</th>
                      <th>Suggestions</th>
                      <th>Updated At</th>
                      <th width="40"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectsLoading ? (
                      <tr>
                        <td colSpan={6} className="table-loader">
                          <div className="table-loader-inner">
                            <div className="spinner"></div>
                            <span>Fetching projects...</span>
                          </div>
                        </td>
                      </tr>
                    ) : projects.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="table-empty">
                          No requirements added yet. Click "Add Requirement" to
                          get started.
                        </td>
                      </tr>
                    ) : filteredProjectsForAI.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="table-empty">
                          No projects found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredProjectsForAI.map((p) => (
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
                          <td>{p.customer || p.client || "—"}</td>
                          <td>{p.requirements || p.required_skills || "—"}</td>
                          <td>
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
                          </td>
                          <td>
                            {p.updated_at
                              ? new Date(p.updated_at).toLocaleString("en-IN", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : "—"}
                          </td>
                          <td
                            className="row-actions"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="action-dropdown-container">
                              <button
                                className="action-menu-btn"
                                onClick={(e) => handleDropdownToggle(p.id, e)}
                                title="More actions"
                              >
                                <span className="material-symbols-outlined">
                                  more_vert
                                </span>
                              </button>
                              {openDropdownId === p.id && (
                                <div className="action-dropdown-menu">
                                  <button
                                    className="dropdown-item"
                                    onClick={(e) =>
                                      handleDropdownAction("generate", p, e)
                                    }
                                    disabled={loadingProjectId === p.id}
                                  >
                                    <span className="material-symbols-outlined">
                                      auto_awesome
                                    </span>
                                    {loadingProjectId === p.id
                                      ? "Generating..."
                                      : "Generate AI Suggestions"}
                                  </button>
                                  <button
                                    className="dropdown-item"
                                    onClick={(e) =>
                                      handleDropdownAction("edit", p, e)
                                    }
                                  >
                                    Edit Requirement
                                  </button>
                                  <button
                                    className="dropdown-item"
                                    onClick={(e) =>
                                      handleDropdownAction("delete", p, e)
                                    }
                                  >
                                    Delete Requirement
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Slide Panel */}
          <div className={`suggestions-panel ${panelOpen ? "open" : ""}`}>
            {selectedProject && (
              <>
                <div className="panel-header">
                  <div className="panel-header-info">
                    <h3>{selectedProject.project_name}</h3>
                    <span>
                      {selectedProject.customer || selectedProject.client}
                    </span>
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
                        No Available suggestion for this Project requirement.
                        Edit the requirement or Click AI Suggestion Button to
                        Generate new AI suggestions for this project.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="results-header">
                        <h4>
                          {displayedEmployees?.length || 0} Resource
                          {displayedEmployees?.length !== 1 ? "s" : ""} Found
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
                      <div className="ai-resource-suggestion-cards-list">
                        {displayedEmployees?.map((emp) => (
                          // <ProfileCard
                          <SuggestionCard
                            key={emp.employee_id}
                            employee={emp}
                            activeSkill={activeSkill}
                            setActiveSkill={setActiveSkill}
                            onSkillClick={setActiveSkill}
                          />
                        )) || []}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="loader" id="theme-loader">
        <div className="justify-content-center jimu-primary-loading"></div>
      </div>
    );
  }

  return (
    <div className="ai-suggestions-wrapper">
      {/* TAB SWITCHER */}
      <div className="expanded-tabs justify-btwn">
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === "projects" ? "active" : ""}`}
            onClick={() => setActiveTab("projects")}
          >
            Projects
          </button>
          <button
            className={`tab-button ${activeTab === "ai-suggestions" ? "active" : ""}`}
            onClick={() => setActiveTab("ai-suggestions")}
          >
            AI Resource Suggestions
          </button>
          <button
            className={`tab-button ${activeTab === "jd-match" ? "active" : ""}`}
            onClick={() => setActiveTab("jd-match")}
          >
            Job Description Match
          </button>
          <button
            className={`tab-button ${activeTab === "similar-profiles" ? "active" : ""}`}
            onClick={() => setActiveTab("similar-profiles")}
          >
            Similar Profile Suggestions
          </button>
        </div>
      </div>

      {/* FORM MODAL - Available for both tabs */}
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
              <div className="project-suggestion-form-row">
                <div className="project-suggestion-form-group">
                  <label>
                    Project Name <span className="required">*</span>
                  </label>
                  <div className="autocomplete-wrapper">
                    <input
                      name="project_name"
                      value={projectSearch}
                      onChange={(e) => {
                        setProjectSearch(e.target.value);
                        setForm({
                          ...form,
                          project_name: e.target.value,
                          customer: form.customer,
                        });
                        setShowProjectDropdown(true);
                      }}
                      onFocus={() => setShowProjectDropdown(true)}
                      onBlur={() =>
                        setTimeout(() => setShowProjectDropdown(false), 150)
                      }
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
                              setForm({
                                ...form,
                                project_name: p.project_name,
                                customer: p.customer || form.customer,
                              });
                              setProjectSearch(p.project_name);
                              setShowProjectDropdown(false);
                            }}
                          >
                            <span className="autocomplete-project-name">
                              {p.project_name}
                            </span>
                            {p.customer && (
                              <span className="autocomplete-customer">
                                {p.customer}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="project-suggestion-form-group">
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
              <div className="project-suggestion-form-group">
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
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-confirm">
                  {editingId ? "Save Changes" : "Add Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT - always mounted to preserve state */}
      <div style={{ display: activeTab === "projects" ? "contents" : "none" }}>
        {renderProjectsTab()}
      </div>
      <div style={{ display: activeTab === "ai-suggestions" ? "contents" : "none" }}>
        {renderAISuggestionsTab()}
      </div>
      <div style={{ display: activeTab === "similar-profiles" ? "contents" : "none" }} className="ai-suggestions-content">
        <ResumeMatch showError={showError} />
      </div>
      <div style={{ display: activeTab === "jd-match" ? "contents" : "none" }} className="ai-suggestions-content">
        <JDMatch />
      </div>

      <ConfirmationModal />

      {/* Candidate Profile Modal for delivery owner */}
      <CandidateProfileModal
        isOpen={isModalOpen}
        onClose={closeModal}
        employee={selectedEmployee}
        loading={modalLoading}
        error={modalError}
      />
    </div>
  );
};

export default AISuggestions;
