import { useState } from "react";
import "./SuggestionCard.css";

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
    emp_location,
    tech_group,
    ai_score,
    skill_set,
    projects,
    ai_reason,
  } = employee;
  const scoreClass =
    ai_score >= 70 ? "high" : ai_score >= 50 ? "medium" : "low";

  return (
    <div
      className={`suggestion-card ${scoreClass}-score ${expanded ? "expanded" : ""}`}
    >
      <div className="suggestion-row" onClick={() => setExpanded(!expanded)}>
        <div
          className={`suggestion-score-circle ${expanded ? "expanded" : ""}`}
        >
          <svg className="score-progress" viewBox="0 0 36 36">
            <path
              className="score-bg"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={`score-fill ${scoreClass}`}
              strokeDasharray={`${ai_score}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="score-center">
            <span className={`score-text ${scoreClass}`}>{ai_score}</span>
            {expanded && <span className="score-label">Total score</span>}
          </div>
        </div>

        <div className={`suggestion-content ${expanded ? "expanded" : ""}`}>
          <div className="suggestion-header">
            <div className="suggestion-name-section">
              <span>
                <span className="suggestion-name">{display_name}</span>
                <span className="suggestion-emp-id">{employee_id}</span>
              </span>
              <span className="suggestion-meta-inline">
                {designation} • {emp_location} • {tech_group}
              </span>
            </div>
          </div>

          {!expanded && (
            <div className="suggestion-skills-preview">
              {skill_set
                ?.split(",")
                .slice(0, 3)
                .map((s, i) => (
                  <span key={i} className="skill-badge-preview">
                    {s.trim()}
                  </span>
                ))}
              {skill_set?.split(",").length > 3 && (
                <span className="skill-badge-preview more">
                  +{skill_set.split(",").length - 3}
                </span>
              )}
            </div>
          )}
          {expanded &&projects?.length > 0 && (
            <div className="sc-projects">
              {projects.map((p, i) => (
                <span key={i} className="sc-project-chip">
                  <span className="material-symbols-outlined">folder</span>
                  {p.project_name}
                  {p.occupancy != null && (
                    <span className="sc-occupancy">{p.occupancy}%</span>
                  )}
                </span>
              ))}
            </div>
          )}
          {expanded && employee.ai_criteria && (
            <div className="criteria-breakdown">
              {Object.entries(employee.ai_criteria).map(([criteria, score]) => {
                const cls =
                  score >= 70 ? "high" : score >= 50 ? "medium" : "low";
                return (
                  <div key={criteria} className="criteria-row">
                    <span className="criteria-name">{criteria}</span>
                    <div className="criteria-bar-container">
                      <div className="criteria-bar-bg">
                        <div
                          className={`criteria-bar-fill ${cls}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className={`criteria-score ${cls}`}>
                        {criteria === "Confidence"
                          ? `${score >= 70 ? "High" : score >= 50 ? "Medium" : "Low"} (${score}%)`
                          : score}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="expanded-content">
          {skill_set && (
            <div className="skills-section">
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
                          setActiveSkill?.(next);
                          onSkillClick?.(next);
                        }}
                        className={
                          isActive
                            ? "skill-badge-preview active-skill-badge-preview"
                            : "skill-badge-preview"
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
                    className="skill-more-btn-preview"
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
            <div className="ai-reason-section">
              <p className="reason-text">{ai_reason}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuggestionCard;
