import { Icons } from "../../assets/icons";
import "./Dashboard.css";
import "./SearchAssistant.css";
import { useContext, useRef, useState, useEffect } from "react";
import { uploadAPI, searchAPI } from "../../services/api";
import { createPortal } from "react-dom";
import { EmployeeContext } from "../../context/employeeContext";
import UploadResultsModal from "./UploadResultsModal";

const RequirementCard = ({ employee, filterFunction, activeSkill, setActiveSkill }) => {
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
              {skill_set && (
                <div className="employee-skills-section">
                  <span className="skills-label">Skills:</span>
                  <div className="skills-container">
                    {skill_set
                      .split(",")
                      .slice(0, showAllSkills ? undefined : 5)
                      .map((skill, skillIndex) => {
                          const trimmedSkill = skill.trim();
                          const isActive = activeSkill && (trimmedSkill.toLowerCase().includes(activeSkill.toLowerCase()) || activeSkill.toLowerCase().includes(trimmedSkill.toLowerCase()));

                        return (
                          <span
                            key={skillIndex}
                            onClick={() => {
                              const newSkill = isActive ? null : trimmedSkill;
                              setActiveSkill(newSkill);
                              filterFunction(newSkill);
                            }}
                            className={
                              isActive
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

  // Simple UI without AI features
  return (
    <div className="employee-card">
      <div className="employee-card-content">
        <div className="employee-name-row">
          <h2 className="employee-name-search">{display_name}</h2>
          <span className="employee-designation-badge">{designation}</span>
        </div>
        <div className="employee-info-section-plain">
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
            {skill_set && (
              <div className="employee-skills-section">
                <span className="skills-label">Skills:</span>
                <div className="skills-container">
                  {skill_set
                    .split(",")
                    .slice(0, showAllSkills ? undefined : 5)
                    .map((skill, skillIndex) => {
                      const trimmedSkill = skill.trim();
                      const isActive = activeSkill && (trimmedSkill.toLowerCase().includes(activeSkill.toLowerCase()) || activeSkill.toLowerCase().includes(trimmedSkill.toLowerCase()));

                      return (
                        <span
                          key={skillIndex}
                          onClick={() => {
                            const newSkill = isActive ? null : trimmedSkill;
                            setActiveSkill(newSkill);
                            filterFunction(newSkill);
                          }}
                          className={
                            isActive
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
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchAssistant = ({ isExpanded, onExpand, onClose, csvFile }) => {
  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [popupPosition, setPopupPosition] = useState({
    top: 0,
    left: 0,
    arrowTop: 0,
  });
  const {searchResult, setSearchResult} = useContext(EmployeeContext);
  const [allCardEmployees, setAllCardEmployees] = useState();
  const [viewMode, setViewMode] = useState(searchResult.viewModeCard);
  const [activeSkill, setActiveSkill] = useState(null);
  const [tableEmployees, setTableEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [deptFilters, setDeptFilters] = useState({
    cloud: false,
    vision: false,
    others: false
  });
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (csvFile) {
      handleSendMessage(csvFile);
    }
  }, [csvFile]);

//   function filterOnSearch(skill) {
//   let filtered;

//   if (skill) {
//     filtered = allCardEmployees.filter((item) =>
//       item.skill_set
//         ?.split(",")
//         .map((s) => s.trim())
//         .includes(skill.trim())
//     );
//   } else {
//     filtered = allCardEmployees;
//   }

//   setSearchResult({...searchResult, result : filtered})
// }

function filterOnSearch(skill) {
  let filtered;

  if (skill) {
    const searchSkill = skill.trim().toLowerCase();

    filtered = allCardEmployees.filter((item) =>
      item.skill_set
        ?.toLowerCase()
        .split(",")
        .map((s) => s.trim())
        .some((s) => s.includes(searchSkill) || searchSkill.includes(s))
    );
  } else {
    filtered = allCardEmployees;
  }

  setSearchResult({ ...searchResult, result: filtered });
}

  function filterOnDepartment() {
    if (!allCardEmployees) return;
    
    const selectedDepts = [];
    if (deptFilters.cloud) selectedDepts.push("Cloud and Mobile Apps");
    if (deptFilters.vision) selectedDepts.push("Vision");
    if (deptFilters.others) selectedDepts.push("Others");
    
    if (selectedDepts.length === 0) {
      setSearchResult({...searchResult, result: allCardEmployees});
    } else {
      const filtered = allCardEmployees.filter(emp => 
        selectedDepts.includes(emp.employee_department)
      );
      setSearchResult({...searchResult, result: filtered});
    }
  }


  const handleSendMessage = async (fileToUpload = null) => {
  if (!inputText.trim() && !fileToUpload) return;

  setIsLoading(true);
  if (!fileToUpload) {
    setViewMode("card");
  }

  const textToSend = inputText;

  setUploadedFile(null);
  if (fileInputRef.current) fileInputRef.current.value = "";

  try {
    const startTime = Date.now();
    let response;

    if (fileToUpload) {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      if (textToSend) formData.append("message", textToSend);

      response = await uploadAPI(formData);

      const employees =
        response?.all_employees ||
        response?.data?.all_employees ||
        [];

      setTableEmployees(employees);
      setViewMode("table");
      setSearchResult({...searchResult, viewModeCard : "table"})
      setShowUploadModal(true);

      const elapsed = Date.now() - startTime;
      if (elapsed < 2000) {
        await new Promise((resolve) => setTimeout(resolve, 2000 - elapsed));
      }
    } else {
      response = await searchAPI(textToSend);

      const employees = response?.data || response?.employee || [];

      setSearchResult({ result: employees, viewModeCard: "card"})
      setAllCardEmployees(employees);
      setViewMode("card");
    }
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }
};





  // const handleMicClick = async () => {
  //   if (isRecording) {
  //     mediaRecorderRef.current?.stop();
  //     setIsRecording(false);
  //   } else {
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  //       const mediaRecorder = new MediaRecorder(stream);
  //       const chunks = [];

  //       mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
  //       mediaRecorder.onstop = () => {
  //         const blob = new Blob(chunks, { type: 'audio/webm' });
  //         console.log('Audio recorded:', blob);
  //         // Add your audio processing logic here
  //         stream.getTracks().forEach(track => track.stop());
  //       };

  //       mediaRecorderRef.current = mediaRecorder;
  //       mediaRecorder.start();
  //       setIsRecording(true);
  //     } catch (err) {
  //       alert('Microphone access denied');
  //     }
  //   }
  // };

  // console.log(messages);

  console.log("Card", searchResult);
  
  return (
    <>
      <UploadResultsModal 
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        employees={tableEmployees}
        isLoading={isLoading}
      />
      {isExpanded ? (
        <div className="card assistant-card assistant-card-expanded">
          {viewMode === null ?  (
            <div className="upload-prompt-container">
              <div className="upload-prompt-content">
                {/* <span className="assistant-badge bubbles">
                  <img src="src/assets/icons/bubbles.svg" alt="" srcSet="" />
                </span> */}
                <h3>
                  Ready To Find the Right Resource for Your Project, Instantly?
                </h3>
                <div className="search-container">
                  <div className="search-header">
                    <div className="assistant-control">
                      <div className="assistant-box">
                        <div className="assistant-input">
                          <span className="search-icon">
                            {/* <img src={Icons.search} alt="" /> */}
                            <span className="assistant-badge bubbles">
                              <img
                                src="/bubbles.svg"
                                alt=""
                                srcSet=""
                              />
                            </span>
                          </span>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".csv"
                            style={{ display: "none" }}
                          />
                          {uploadedFile ? (
                            <div
                              className="assistant-file"
                              style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <span className="material-symbols-outlined">
                                csv
                              </span>
                              {/* <span>{uploadedFile.name}</span>
                          <button className="remove-file-btn" onClick={handleRemoveFile}>✕</button> */}
                            </div>
                          ) : (
                            <input
                              type="text"
                              placeholder="Ask me anything..."
                              value={inputText}
                              onChange={(e) => setInputText(e.target.value)}
                              onKeyPress={(e) =>
                                e.key === "Enter" && handleSendMessage()
                              }
                            />
                          )}
                        </div>
                        <div className="assistant-microphone">
                          <button
                            className="chat-submit-btn"
                            onClick={handleSendMessage}
                          >
                        <span className="search-icon">
                          <img src={Icons.search} alt="" />
                        </span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="assistant-btns">
                    </div>
                  </div>
                  {/* AI Context / Search Hints  */}
                  <div className="search-hints">
                    <span className="hint-label">Try searching:</span>

                    <button className="hint-btn">
                      "Senior developers in Kochi"
                    </button>

                    <button className="hint-btn">"Design team lead"</button>

                    <button className="hint-btn">
                      "Experts in Machine Learning"
                    </button>
                  </div>

                  {/* Empty State  */}
                  <div className="empty-state">
                    <div className="empty-icon">
                      <i className="fas fa-user-friends"></i>
                    </div>

                    <h3>Start typing to see results</h3>

                    <p>
                      {/* Enter name, department, or skill and let AI help you find the best-fit employee. */}
                      Enter name, department, or skill to discover matching
                      employees, with the most relevant profiles rising to the
                      top.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="assistant-header">
                <h3>
                  Ready To Find the Right Resource for Your Project, Instantly?
                </h3>
              </div>

                <div className="search-header">
                  <div className="assistant-control">
                    <div className="assistant-box">
                      <div className="assistant-input">
                        <span className="assistant-badge bubbles">
                          <img
                            src="/bubbles.svg"
                            alt=""
                            srcSet=""
                          />
                        </span>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept=".csv"
                          style={{ display: "none" }}
                        />
                        {uploadedFile ? (
                          <div
                            className="assistant-file"
                            style={{
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span className="material-symbols-outlined">
                              csv
                            </span>
                          </div>
                        ) : (
                          <input
                            type="text"
                            placeholder="Ask me anything..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" && handleSendMessage()
                            }
                          />
                        )}
                      </div>
                      <div className="assistant-microphone">
                        <button
                          className="chat-submit-btn"
                          onClick={handleSendMessage}
                        >
                        <span className="search-icon">
                          <img src={Icons.search} alt="" />
                        </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="assistant-btns">
                    <button
                      className="filter1-btn btn-primary"
                      onClick={() => {}}
                    >
                      <img src={Icons.filter1} alt="" />
                    </button>
                  </div>
                </div>

              <div className="search-card-header">
                {/* TABLE VIEW (CSV Upload) */}
                {viewMode === "table" && (
                  <>
    {isLoading ? (
      <div className="chat-loader">
        <div className="spinner"></div>
      </div>
    ) : tableEmployees.length === 0 ? (
      <>Please upload CSV File to generate data...</>
    ) : (
      (() => {
        const totalPages = Math.ceil(
          tableEmployees.length / rowsPerPage
        );

        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;

        const paginatedEmployees =
          tableEmployees.slice(startIndex, endIndex);

        return (
          <div className="search-card">
            <div className="employee-table">

              <div className="employee-row header">
                <div>Name</div>
                <div>ID</div>
                <div>Designation</div>
                <div>Total Exp</div>
                <div>Tech Group</div>
                <div>Location</div>
                <div></div>
              </div>

              {paginatedEmployees.map((employee, index) => (
                <div key={index} className="employee-row">
                  <div className="name-cell">
                    <div className="employee-avatar">
                      {employee.display_name
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>
                    <span
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const popupHeight = 450;
                      const viewportHeight = window.innerHeight;

                      let calculatedTop = rect.top + window.scrollY;
                      let shiftAmount = 0;

                      if (rect.top + popupHeight > viewportHeight) {
                        shiftAmount =
                          rect.top + popupHeight - viewportHeight + 20;
                        calculatedTop -= shiftAmount;
                      }

                      setPopupPosition({
                        top: calculatedTop,
                        left: rect.right + 10,
                        arrowTop: rect.height / 2 + shiftAmount,
                      });

                      setHoveredIndex(index);
                    }}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {employee.display_name}
                  </span>
                  </div>

                  <div>{employee.employee_id}</div>
                  <div>{employee.designation}</div>
                  <div>{employee.total_exp}</div>
                  <div>{employee.tech_group}</div>
                  <div>{employee.emp_location}</div>
                  {hoveredIndex === index &&
                    createPortal(
                      <div
                        className="employee-hover-popup"
                        style={{
                          top: `${popupPosition.top}px`,
                          left: `1050px`,
                          "--arrow-top": `${popupPosition.arrowTop}px`,
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        <div className="popup-header">
                          <div className="employee-avatar">
                            {employee.display_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4>{employee.display_name}</h4>
                            <span>{employee.designation}</span>
                          </div>
                        </div>

                        <div className="popup-body">
                          <p><b>ID:</b> {employee.employee_id}</p>
                          <p><b>Department:</b> {employee.employee_department}</p>
                          <p><b>Tech:</b> {employee.tech_group}</p>
                          <p><b>Location:</b> {employee.emp_location}</p>
                          <p><b>Total Exp:</b> {employee.total_exp}</p>

                          <div className="skills-container">
                            {employee.skill_set?.split(",").map((skill, i) => (
                              <span key={i} className="skill-badge">
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>,
                      document.body
                    )}
                </div>
              ))}

            </div>

            <div className="pagination">
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.max(prev - 1, 1)
                  )
                }
                disabled={currentPage === 1}
              >
                Prev
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, totalPages)
                  )
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        );
      })()
    )}
  </>
  )}

  {/* CARD VIEW (Text Search) */}
  {viewMode === "card" && (
    <div className="employee-matches-container">
      <div className="employee-matches-wrapper">
        {/* Quick Filters */}
        <div className="quick-filters">
          <span className="filter-label">Filter by:</span>

          <div className="filter-dropdown-wrapper">
            <button className="filter-btn" onClick={() => setShowDeptDropdown(!showDeptDropdown)}>
              Department <i className="fas fa-chevron-down"></i>
            </button>
            {showDeptDropdown && (
              <div className="filter-dropdown">
                <label className="filter-option">
                  <input 
                    type="checkbox" 
                    checked={deptFilters.cloud}
                    onChange={(e) => {
                      setDeptFilters({...deptFilters, cloud: e.target.checked});
                      setTimeout(() => filterOnDepartment(), 0);
                    }}
                  />
                  Cloud and Mobile Apps
                </label>
                <label className="filter-option">
                  <input 
                    type="checkbox" 
                    checked={deptFilters.vision}
                    onChange={(e) => {
                      setDeptFilters({...deptFilters, vision: e.target.checked});
                      setTimeout(() => filterOnDepartment(), 0);
                    }}
                  />
                  Vision
                </label>
                <label className="filter-option">
                  <input 
                    type="checkbox" 
                    checked={deptFilters.others}
                    onChange={(e) => {
                      setDeptFilters({...deptFilters, others: e.target.checked});
                      setTimeout(() => filterOnDepartment(), 0);
                    }}
                  />
                  Others
                </label>
              </div>
            )}
          </div>

          <button className="filter-btn">
            Location <i className="fas fa-chevron-down"></i>
          </button>

          <button className="filter-btn">
            Experience <i className="fas fa-chevron-down"></i>
          </button>
        </div>

        {isLoading ? (
          <div className="chat-loader-new">
            <div className="spinner"></div>
          </div>
        ) : searchResult?.result?.length === 0 ? (
          <p>No employees found.</p>
        ) : (
          <div className="employee-cards-list">
            {searchResult?.result?.map((employee) => (
              <RequirementCard
                key={employee.employee_id}
                employee={employee}
                filterFunction={filterOnSearch}
                activeSkill={activeSkill}
                setActiveSkill={setActiveSkill}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )}
            
              </div>
            </>
          )}
        </div>
      ) : (
        <div
          className={`card assistant-card justify-btw ${!isExpanded ? "compact" : ""}`}
        >
          <div className="assistant-header">
            <span className="assistant-badge bubbles">
              {/* <span className="material-symbols-outlined">smart_toy</span> */}
              <img src="/bubbles.svg" alt="" srcSet="" />
            </span>

            {!isExpanded ? (
              <span className="expand-icon" onClick={onExpand}>
                <span className="material-symbols-outlined">open_in_full</span>
              </span>
            ) : (
              <span className="expand-icon" onClick={onClose}>
                ✕
              </span>
            )}
          </div>
          <div>
            <h3>
              Ready To Find the Right Resource for Your Project, Instantly?
            </h3>

            <div className="assistant-links">
              <span onClick={onExpand}>
                <span className="material-symbols-outlined">search</span>Find
                Matches
              </span>
              <span onClick={onExpand}>
                <span className="material-symbols-outlined">pie_chart</span>
                Insights
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchAssistant;
