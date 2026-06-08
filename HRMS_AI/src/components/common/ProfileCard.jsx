import { useState } from "react";

export default function ProfileCard({
  employee,
  activeSkill,
  setActiveSkill,
  onSkillClick,
}) {
  const [expanded, setExpanded] = useState(false);

  const {
    display_name,
    designation,
    tech_group,
    employee_id,
    ai_score,
    availability_pct,
    primary_skills = [],
  } = employee;

  const scoreClass =
    ai_score >= 70 ? "high" : ai_score >= 50 ? "medium" : "low";

  return (
    <div
      className={`suggestion-card ${scoreClass}-score ${
        expanded ? "expanded" : ""
      }`}
    >
      <div className="suggestion-row" onClick={() => setExpanded(!expanded)}>
        <div
          className={`suggestion-score-circle ${
            expanded ? "expanded" : ""
          }`}
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
            <span className={`score-text ${scoreClass}`}>
              {ai_score}
            </span>
          </div>
        </div>

        <div className="suggestion-content">
          <div className="project-name-cell">
            <div className="sp-emp-avatar">
              {display_name?.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="suggestion-name">
                {display_name}
              </div>

              <div className="suggestion-meta-inline">
                {designation} • {tech_group}
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "#64748b",
                  marginTop: 4,
                }}
              >
                {employee_id}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <span
              className={`status-badge ${
                availability_pct > 0 ? "started" : "cancelled"
              }`}
            >
              {availability_pct > 0
                ? `${availability_pct}% free`
                : "Engaged"}
            </span>
          </div>

          {expanded && (
            <div className="skills-container" style={{ marginTop: 12 }}>
              {primary_skills.map((skill, i) => (
                <span
                  key={i}
                  className="skill-badge-preview"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}