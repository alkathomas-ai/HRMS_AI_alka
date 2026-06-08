import React, { useRef, useState } from "react";
import { uploadResumeForSimilarProfiles } from "../../services/api";

const ResumeMatch = ({ showError }) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [similarProfiles, setSimilarProfiles] = useState(null);

  const handleResumeUpload = async () => {
    if (!resumeFile) return;

    setResumeUploading(true);
    setSimilarProfiles(null);

    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      const data = await uploadResumeForSimilarProfiles(formData);
      setSimilarProfiles(data);
    } catch (err) {
      showError?.("Failed to upload resume. Please try again.");
    } finally {
      setResumeUploading(false);
    }
  };
  const fileInputRef = useRef(null);

  const removeFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setResumeFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="similar-profiles-page">
      {/* LEFT PANEL */}
      <div className="similar-profiles-left">
        <div className="sp-upload-card">
          <div className="sp-upload-icon-wrap">
            <span className="material-symbols-outlined">upload_file</span>
          </div>
          <h4 className="sp-upload-title">Upload Resume</h4>
          <p className="sp-upload-hint">
            Find employees with similar skills and experience
          </p>
          <label className={`sp-file-label ${resumeFile ? "has-file" : ""}`}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18 }}
            >
              attach_file
            </span>
            <span>{resumeFile ? resumeFile.name : "Choose PDF file"}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              style={{ display: "none" }}
              onChange={(e) => setResumeFile(e.target.files[0])}
            />
            {resumeFile && (
              <span
                className="material-symbols-outlined remove-file"
                onClick={removeFile}
              >
                close
              </span>
            )}
          </label>
          <button
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={handleResumeUpload}
            disabled={!resumeFile || resumeUploading}
          >
            {resumeUploading ? (
              <>
                <div className="spinner-small"></div>Analyzing...
              </>
            ) : (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 16 }}
                >
                  manage_search
                </span>
                Find Similar Profiles
              </>
            )}
          </button>
        </div>

        {similarProfiles && !resumeUploading && (
          <div className="sp-summary-card">
            <div className="sp-summary-header">
              <div className="sp-summary-avatar">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div>
                <div className="sp-summary-designation">
                  {similarProfiles.resume_profile.designation}
                </div>
                <div className="sp-summary-chips">
                  <span className="resume-info-chip primary">
                    {similarProfiles.resume_profile.seniority}
                  </span>
                  <span className="resume-info-chip">
                    {similarProfiles.resume_profile.domain}
                  </span>
                  <span className="resume-info-chip">
                    {similarProfiles.resume_profile.total_experience_years} yrs
                  </span>
                </div>
              </div>
            </div>
            <div className="sp-skills-section">
              <div className="sp-skills-label">Primary Skills</div>
              <div className="sp-skills-list">
                {similarProfiles.resume_profile.primary_skills.map((s, i) => (
                  <span key={i} className="skill-badge primary-skill-badge">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="sp-skills-section">
              <div className="sp-skills-label">Secondary Skills</div>
              <div className="sp-skills-list">
                {similarProfiles.resume_profile.secondary_skills.map((s, i) => (
                  <span key={i} className="skill-badge">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {resumeUploading && (
          <div className="similar-profiles-loading">
            <div className="spinner"></div>
            <p>Analyzing resume...</p>
          </div>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="similar-profiles-right">
        {!similarProfiles && !resumeUploading && (
          <div className="sp-empty-state">
            <span className="material-symbols-outlined">manage_search</span>
            <p>Upload a resume to find similar profiles</p>
          </div>
        )}
        {resumeUploading && (
          <div className="sp-empty-state">
            <div className="spinner"></div>
            <p>Finding similar profiles...</p>
          </div>
        )}
        {similarProfiles && !resumeUploading && (
          <div className="projects-table-card">
            <div className="sp-matches-badge">
              <span className="material-symbols-outlined">group</span>
              {similarProfiles.total_matches} similar profiles found
            </div>
            <div className="table-wrapper">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Designation</th>
                    <th>Tech Group</th>
                    <th>Experience</th>
                    <th>Availability</th>
                    <th>AI Score</th>
                    <th>Primary Skills</th>
                  </tr>
                </thead>
                <tbody>
                  {similarProfiles.similar_profiles.map((emp) => {
                    const scoreClass =
                      emp.ai_score >= 70
                        ? "high"
                        : emp.ai_score >= 50
                          ? "medium"
                          : "low";
                    return (
                      <tr key={emp.employee_id} className="project-row">
                        <td>
                          <div className="project-name-cell">
                            <div className="sp-emp-avatar">
                              {emp.display_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>
                                {emp.display_name}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "var(--color-text-secondary)",
                                }}
                              >
                                {emp.employee_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{emp.designation}</td>
                        <td>{emp.tech_group}</td>
                        <td>{emp.total_exp}</td>
                        <td>
                          <span
                            className={`status-badge ${emp.availability_pct > 0 ? "started" : "cancelled"}`}
                          >
                            {emp.availability_pct > 0
                              ? `${emp.availability_pct}% free`
                              : "Engaged"}
                          </span>
                        </td>
                        <td>
                          <span className={`similar-score-badge ${scoreClass}`}>
                            {emp.ai_score}
                          </span>
                        </td>
                        <td>
                          <div className="table-skills">
                            {emp.primary_skills.slice(0, 3).map((s, i) => (
                              <span key={i} className="skill-badge">
                                {s}
                              </span>
                            ))}
                            {emp.primary_skills.length > 3 && (
                              <span className="skill-badge">
                                +{emp.primary_skills.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeMatch;
