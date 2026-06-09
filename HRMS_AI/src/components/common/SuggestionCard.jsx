import { useState } from 'react';

const SuggestionCard = ({ employee, activeSkill, setActiveSkill, onSkillClick }) => {
  const [expanded, setExpanded] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);

  const { display_name, designation, employee_id, emp_location, tech_group, ai_score, skill_set, ai_reason } = employee;
  const scoreClass = ai_score >= 70 ? 'high' : ai_score >= 50 ? 'medium' : 'low';

  return (
    <div className={`ai-resource-suggestion-card ${scoreClass}-score ${expanded ? 'expanded' : ''}`}>
      <div className="ai-resource-suggestion-row" onClick={() => setExpanded(!expanded)}>
        <div className={`ai-resource-suggestion-score-circle ${expanded ? 'expanded' : ''}`}>
          <svg className="ai-resource-score-progress" viewBox="0 0 36 36">
            <path className="ai-resource-score-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path className={`ai-resource-score-fill ${scoreClass}`} strokeDasharray={`${ai_score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <div className="ai-resource-score-center">
            <span className={`ai-resource-score-text ${scoreClass}`}>{ai_score}</span>
            {expanded && <span className="ai-resource-score-label">Total score</span>}
          </div>
        </div>

        <div className={`ai-resource-suggestion-content ${expanded ? 'expanded' : ''}`}>
          <div className="ai-resource-suggestion-header">
            <div className="ai-resource-suggestion-name-section">
              <span className="ai-resource-suggestion-name">{display_name}</span>
              <span className="ai-resource-suggestion-meta-inline">
                {designation} • {emp_location} • {tech_group}
              </span>
            </div>
          </div>

          {!expanded && (
            <div className="ai-resource-suggestion-skills-preview">
              {skill_set?.split(',').slice(0, 3).map((s, i) => (
                <span key={i} className="ai-resource-skill-badge-preview">{s.trim()}</span>
              ))}
              {skill_set?.split(',').length > 3 && (
                <span className="ai-resource-skill-badge-preview more">+{skill_set.split(',').length - 3}</span>
              )}
            </div>
          )}

          {expanded && employee.ai_criteria && (
            <div className="ai-resource-criteria-breakdown">
              {Object.entries(employee.ai_criteria).map(([criteria, score]) => {
                const cls = score >= 70 ? 'high' : score >= 50 ? 'medium' : 'low';
                return (
                  <div key={criteria} className="ai-resource-criteria-row">
                    <span className="ai-resource-criteria-name">{criteria}</span>
                    <div className="ai-resource-criteria-bar-container">
                      <div className="ai-resource-criteria-bar-bg">
                        <div className={`ai-resource-criteria-bar-fill ${cls}`} style={{ width: `${score}%` }} />
                      </div>
                      <span className={`ai-resource-criteria-score ${cls}`}>
                        {criteria === 'Confidence'
                          ? `${score >= 70 ? 'High' : score >= 50 ? 'Medium' : 'Low'} (${score}%)`
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
        <div className="ai-resource-expanded-content">
          {skill_set && (
            <div className="ai-resource-skills-section">
              <div className="ai-resource-skills-container">
                {skill_set.split(',').slice(0, showAllSkills ? undefined : 6).map((skill, i) => {
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
                      className={isActive ? 'ai-resource-skill-badge active-skill-badge' : 'ai-resource-skill-badge'}
                    >
                      {trimmed}
                    </span>
                  );
                })}
                {skill_set.split(',').length > 6 && (
                  <button onClick={(e) => { e.stopPropagation(); setShowAllSkills(!showAllSkills); }} className="ai-resource-skill-more-btn">
                    {showAllSkills ? 'Show Less' : `+${skill_set.split(',').length - 6} More`}
                  </button>
                )}
              </div>
            </div>
          )}
          {ai_reason && (
            <div className="ai-resource-reason-section">
              <p className="ai-resource-reason-text">{ai_reason}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuggestionCard;
