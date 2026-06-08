import { useState, useRef } from "react";
import {
  jdRankCandidatesByText,
  jdRankCandidatesByPdf,
} from "../../services/api";
import { useToast } from "../../context/ToastContext";
import "./JDMatch.css";

// const DUMMY_DATA = {
//   status: "success",
//   jd_parsed: {
//     role_title: "Senior Frontend Developer",
//     primary_skills: [
//       "React.js",
//       "Angular",
//       "TypeScript",
//       "JavaScript (ES6+)",
//       "HTML5",
//       "CSS3 / SCSS",
//       "Responsive Web Design",
//       "Material UI",
//       "Bootstrap",
//       "Redux",
//       "Context API",
//       "REST APIs",
//     ],
//     secondary_skills: [
//       "Tailwind CSS",
//       "NgRx",
//       "JWT",
//       "OAuth",
//       "Git",
//       "GitHub / GitLab",
//       "Jest",
//       "React Testing Library",
//     ],
//     min_experience_years: 5,
//     seniority_preference: "senior",
//     domain: "frontend",
//   },
//   total_candidates: 3,
//   ranked_candidates: [
//     {
//       employee_id: "VVDN/1571",
//       display_name: "Muhammed Aslam K V",
//       designation: "Principal Engineer (Software)",
//       tech_group: "Frontend - ReactJS",
//       domain: "react",
//       seniority: "lead",
//       total_exp: "12Y 6M",
//       availability_pct: 100,
//       projects: [{ project_name: "CLUD_FREE", occupancy: 100, role: "Member" }],
//       primary_skills: ["css", "javascript", "reactjs", "html"],
//       secondary_skills: [
//         "jquery",
//         "bootstrap",
//         "angularjs",
//         "interviewer training",
//       ],
//       ai_score: 87.9,
//       ai_tier: 1,
//       ai_reason:
//         "Strong React fundamentals with 12+ years experience. CSS, JavaScript, ReactJS, and HTML match core JD requirements. Domain aligned as Frontend.",
//       gaps: "Angular, TypeScript, Material UI, Redux, Context API, REST APIs",
//       ai_criteria: {
//         Skill: 85,
//         Experience: 100,
//         Availability: 100,
//         SecondarySkill: 37.5,
//       },
//     },
//     {
//       employee_id: "VVDN/32473",
//       display_name: "Chevuty Sree Akshithapriya",
//       designation: "Sr Engineer (Software)",
//       tech_group: "Frontend - Angular",
//       domain: "angular",
//       seniority: "senior",
//       total_exp: "6Y 1M",
//       availability_pct: 100,
//       projects: [{ project_name: "BPLU_DCMA", occupancy: 80, role: "Member" }],
//       primary_skills: ["html and css", "javascript", "angular"],
//       secondary_skills: ["agile methodology", "bootstrap5", "jest"],
//       ai_score: 77.9,
//       ai_tier: 2,
//       ai_reason:
//         "Angular domain aligns well with the frontend role. Matched 4 out of 12 primary skills including HTML, JavaScript, and Angular.",
//       gaps: "React.js, TypeScript, CSS3/SCSS, Responsive Web Design, Material UI, Tailwind CSS, Redux, Context API",
//       ai_criteria: {
//         Skill: 66.67,
//         Experience: 100,
//         Availability: 100,
//         SecondarySkill: 12.5,
//       },
//     },
//     {
//       employee_id: "VVDN/9921",
//       display_name: "Rahul Menon",
//       designation: "Engineer (Software)",
//       tech_group: "Frontend - ReactJS",
//       domain: "react",
//       seniority: "mid",
//       total_exp: "3Y 4M",
//       availability_pct: 50,
//       projects: [{ project_name: "NETG_UPV2", occupancy: 50, role: "Member" }],
//       primary_skills: ["reactjs", "javascript", "html", "css"],
//       secondary_skills: ["git", "jest", "rest apis"],
//       ai_score: 58.4,
//       ai_tier: 3,
//       ai_reason:
//         "Good skill match for React but limited experience (3Y) below the 5Y minimum. Partially available.",
//       gaps: "TypeScript, Angular, Material UI, Redux, Bootstrap, Responsive Web Design",
//       ai_criteria: {
//         Skill: 60,
//         Experience: 40,
//         Availability: 50,
//         SecondarySkill: 25,
//       },
//     },
//   ],
// };

// const tierLabel = (tier) =>
//   ({ 1: "Top Match", 2: "Good Match", 3: "Possible Match" })[tier] || "";
// const tierClass = (tier) =>
//   ({ 1: "tier-1", 2: "tier-2", 3: "tier-3" })[tier] || "";
const scoreClass = (s) => (s >= 75 ? "high" : s >= 55 ? "medium" : "low");

const CriteriaBar = ({ label, value }) => {
  const cls = scoreClass(value);
  return (
    <div className="jdm-criteria-item">
      <div className="jdm-criteria-header">
        <span>{label}</span>
        <span className={`jdm-criteria-val ${cls}`}>{value}%</span>
      </div>
      <div className="jdm-bar-bg">
        <div className={`jdm-bar-fill ${cls}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
};

const CandidateCard = ({ emp, index }) => {
  const [expanded, setExpanded] = useState(false);
  const cls = scoreClass(emp.ai_score);

  return (
    <div
      className={`jdm-card ${expanded ? "expanded" : ""}`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="jdm-card-row" onClick={() => setExpanded(!expanded)}>
        {/* Rank */}
        {/* <div className="jdm-rank">#{index + 1}</div> */}

        {/* Avatar */}
        <div className="jdm-avatar">{emp.display_name.charAt(0)}</div>

        {/* Info */}
        <div className="jdm-info">
          <div className="jdm-name-row">
            <span className="jdm-name">{emp.display_name}</span>
            {/* <span className={`jdm-tier-badge ${tierClass(emp.ai_tier)}`}>
              {tierLabel(emp.ai_tier)}
            </span> */}
          </div>
          <span className="jdm-designation">{emp.designation}</span>
          <div className="jdm-meta-row">
            <span>
              <span className="material-symbols-outlined">laptop</span>
              {emp.tech_group}
            </span>
            <span>
              <span className="material-symbols-outlined">schedule</span>
              {emp.total_exp}
            </span>
            {/* <span>
              <span className="material-symbols-outlined">
                workspace_premium
              </span>
              {emp.seniority}
            </span> */}
            {/* <span
              className={`jdm-avail ${emp.availability_pct === 100 ? "full" : "partial"}`}
            >
              <span className="material-symbols-outlined">circle</span>
              {emp.availability_pct}% available
            </span> */}
          </div>
        </div>

        {/* Score */}
        <div className="jdm-score-block">
          <div className="jdm-score-ring">
            <svg className="jdm-score-progress" viewBox="0 0 36 36">
              <path
                className="jdm-score-bg"
                d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
              />

              <path
                className={`jdm-score-fill ${cls}`}
                strokeDasharray={`${emp.ai_score}, 100`}
                d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>

            <div className="jdm-score-center">
              <span className={`jdm-score-num ${cls}`}>
                {Math.round(emp.ai_score) || 0}%
              </span>

              {/* <span className="jdm-score-label">Match</span> */}
            </div>
          </div>
        </div>

        <span className="material-symbols-outlined jdm-chevron">
          {expanded ? "expand_less" : "expand_more"}
        </span>
      </div>

      {expanded && (
        <div className="jdm-card-body">
          {/* Skills */}
          <div className="jdm-body-col">
            {emp.primary_skills?.length > 0 && (
              <div className="jdm-skill-group">
                <span className="jdm-skill-label">Matched Primary Skills</span>
                <div className="jdm-chips">
                  {emp.primary_skills.map((s, i) => (
                    <span key={i} className="jdm-chip primary">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {emp.secondary_skills?.length > 0 && (
              <div className="jdm-skill-group">
                <span className="jdm-skill-label">Secondary Skills</span>
                <div className="jdm-chips">
                  {emp.secondary_skills.map((s, i) => (
                    <span key={i} className="jdm-chip secondary">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {emp.gaps && (
              <div className="jdm-skill-group">
                <span className="jdm-skill-label gap-label">Skill Gaps</span>
                <p className="jdm-gaps-text">{emp.gaps}</p>
              </div>
            )}
            {emp.ai_reason && (
              <div className="jdm-reason">
                <span className="material-symbols-outlined">auto_awesome</span>
                <p>{emp.ai_reason}</p>
              </div>
            )}
          </div>

          {/* Criteria */}
          {emp.ai_criteria && (
            <div className="jdm-criteria-col">
              <span className="jdm-skill-label">AI Evaluation</span>
              {Object.entries(emp.ai_criteria).map(([k, v]) => (
                <CriteriaBar key={k} label={k} value={v} />
              ))}
              {emp.projects?.length > 0 && (
                <div className="jdm-projects">
                  <span className="jdm-skill-label">Current Projects</span>
                  {emp.projects.map((p, i) => (
                    <div key={i} className="jdm-project-item">
                      <span className="material-symbols-outlined">folder</span>
                      <span>{p.project_name}</span>
                      <span className="jdm-occupancy">{p.occupancy}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const JDMatch = () => {
  const [mode, setMode] = useState("text");
  const [jdText, setJdText] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const fileInputRef = useRef(null);
  const { showError } = useToast();

  const handleSubmit = async () => {
    if (mode === "text" && !jdText.trim()) {
      showError("Please enter a job description.");
      return;
    }
    if (mode === "pdf" && !pdfFile) {
      showError("Please upload a PDF file.");
      return;
    }
    setLoading(true);
    setResponse(null);
    try {
      let data;
      if (mode === "text") data = await jdRankCandidatesByText(jdText.trim());
      else data = await jdRankCandidatesByPdf(pdfFile);
      setResponse(data);
    } catch {
      showError("Failed to match job description. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // const useDummy = () => setResponse(DUMMY_DATA);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file?.type === "application/pdf") setPdfFile(file);
    else {
      showError("Please upload a valid PDF file.");
      e.target.value = "";
    }
  };

  const results = response?.ranked_candidates || [];
  const parsed = response?.jd_parsed;

  return (
    <div className="jdm-container">
      {/* ── Left Panel ── */}
      <div className="jdm-left">
        <div className="jdm-panel-header">
          <span className="material-symbols-outlined jdm-header-icon">
            description
          </span>
          <div>
            <h2 className="jdm-title">Job Description Match</h2>
            <p className="jdm-subtitle">
              Find employees matching your job description
            </p>
          </div>
        </div>

        <div className="jdm-mode-toggle">
          <button
            className={mode === "text" ? "active" : ""}
            onClick={() => setMode("text")}
          >
            <span className="material-symbols-outlined">edit_note</span>Paste
            Text
          </button>
          <button
            className={mode === "pdf" ? "active" : ""}
            onClick={() => setMode("pdf")}
          >
            <span className="material-symbols-outlined">picture_as_pdf</span>
            Upload PDF
          </button>
        </div>

        {mode === "text" ? (
          <textarea
            className="jdm-textarea"
            placeholder="Paste your job description here...&#10;&#10;Include role title, required skills, experience, and responsibilities for best results."
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
          />
        ) : (
          <div
            className={`jdm-dropzone ${pdfFile ? "has-file" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              f?.type === "application/pdf"
                ? setPdfFile(f)
                : showError("Please drop a valid PDF file.");
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              hidden
            />
            {pdfFile ? (
              <>
                <span className="material-symbols-outlined jdm-pdf-icon">
                  picture_as_pdf
                </span>
                <span className="jdm-filename">{pdfFile.name}</span>
                <button
                  className="jdm-remove-file"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPdfFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined jdm-upload-icon">
                  upload_file
                </span>
                <p className="jdm-drop-text">
                  Drop PDF here or <strong>click to browse</strong>
                </p>
                <p className="jdm-drop-hint">PDF files only · Max 10MB</p>
              </>
            )}
          </div>
        )}

        <button
          className="jdm-submit-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined rotating">
                progress_activity
              </span>
              Analysing...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">auto_awesome</span>
              Find Matches
            </>
          )}
        </button>

        {/* <button className="jdm-dummy-btn" onClick={useDummy}>
          <span className="material-symbols-outlined">science</span>Try with
          demo data
        </button> */}
      </div>

      {/* ── Right Panel ── */}
      <div className="jdm-right">
        {!response && !loading && (
          <div className="jdm-empty-state">
            <span className="material-symbols-outlined">manage_search</span>
            <h3>No results yet</h3>
            <p>
              Paste a job description or upload a PDF to find matching employees
              ranked by AI score
            </p>
            {/* <button className="jdm-dummy-btn-center" onClick={useDummy}>
              <span className="material-symbols-outlined">science</span>Try demo
            </button> */}
          </div>
        )}

        {loading && (
          <div className="jdm-empty-state">
            <div className="jdm-spinner"></div>
            <h3>Analysing job description...</h3>
            <p>AI is matching skills, experience, and availability</p>
          </div>
        )}

        {response && (
          <>
            {/* JD Summary bar */}
            {parsed && (
              <div className="jdm-jd-summary">
                <span className="jd-summary-head">
                  Requirements for the Job Description Given
                </span>
                <div className="jd-summary-content">
                  <div className="jdm-jd-role">
                    <span className="material-symbols-outlined">work</span>
                    <strong>{parsed.role_title}</strong>
                    <span className="jdm-jd-meta">
                      {parsed.min_experience_years}+ yrs ·{" "}
                      {parsed.seniority_preference} · {parsed.domain}
                    </span>
                  </div>
                  <div className="jdm-jd-skills">
                    {parsed.primary_skills?.slice(0, 6).map((s, i) => (
                      <span key={i} className="jdm-jd-skill">
                        {s}
                      </span>
                    ))}
                    {parsed.primary_skills?.length > 6 && (
                      <span className="jdm-jd-skill more">
                        +{parsed.primary_skills.length - 6}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Results header */}
            <div className="jdm-results-header">
              <div className="jdm-results-count">
                <span className="jdm-count-num">{results.length}</span>
                <span className="jdm-count-label">candidates matched</span>
              </div>
              {/* <div className="jdm-tier-legend">
                <span className="jdm-tier-badge tier-1">Top Match</span>
                <span className="jdm-tier-badge tier-2">Good Match</span>
                <span className="jdm-tier-badge tier-3">Possible Match</span>
              </div> */}
            </div>

            {/* Cards */}
            <div className="jdm-cards-list">
              {results.length === 0 ? (
                <div className="jdm-empty-state">
                  <span className="material-symbols-outlined">person_off</span>
                  <p>No matching employees found.</p>
                </div>
              ) : (
                results.map((emp, i) => (
                  <CandidateCard key={emp.employee_id} emp={emp} index={i} />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JDMatch;
