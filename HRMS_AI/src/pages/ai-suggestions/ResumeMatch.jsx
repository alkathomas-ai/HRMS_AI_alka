import React, { useRef, useState } from "react";
import { uploadResumeForSimilarProfiles } from "../../services/api";
import "./ResumeMatch.css";

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
                  <span key={i} className="ai-suggestions-skill-badge primary-skill-badge">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="sp-skills-section">
              <div className="sp-skills-label">Secondary Skills</div>
              <div className="sp-skills-list">
                {similarProfiles.resume_profile.secondary_skills.map((s, i) => (
                  <span key={i} className="ai-suggestions-skill-badge">
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
          similarProfiles.similar_profiles.length === 0 ? (
            <div className="sp-empty-state">
              <span className="material-symbols-outlined">person_search</span>
              <p>No similar profiles found for this resume.</p>
            </div>
          ) : (
            <div className="sp-cards-container">
              {similarProfiles.similar_profiles.map((emp) => {
                const score = emp.ai_score || 0;
                const scoreClass = score >= 70 ? 'high' : score >= 50 ? 'medium' : 'low';
                const avail = emp.availability_pct;
                return (
                  <div key={emp.employee_id} className={`sp-profile-card sp-profile-card--${scoreClass}`}>
                    <div className="sp-card-top">
                      <div className="sp-card-avatar">{emp.display_name?.charAt(0).toUpperCase()}</div>
                      <div className="sp-card-identity">
                        <span className="sp-card-name">{emp.display_name}</span>
                        <span className="sp-card-id">{emp.employee_id}</span>
                      </div>
                      <div className={`sp-card-score sp-card-score--${scoreClass}`}>
                        <span className="sp-card-score-num">{score}</span>
                        <span className="sp-card-score-label">score</span>
                      </div>
                    </div>

                    <div className="sp-card-meta">
                      <div className="sp-card-meta-item">
                        <span className="material-symbols-outlined">work</span>
                        <span>{emp.designation || '—'}</span>
                      </div>
                      <div className="sp-card-meta-item">
                        <span className="material-symbols-outlined">laptop</span>
                        <span>{emp.tech_group || '—'}</span>
                      </div>
                      <div className="sp-card-meta-item">
                        <span className="material-symbols-outlined">schedule</span>
                        <span>{emp.total_exp || '—'}</span>
                      </div>
                      <div className="sp-card-meta-item">
                        <span className="material-symbols-outlined">circle</span>
                        <span className={avail > 0 ? 'sp-avail-free' : 'sp-avail-busy'}>
                          {avail > 0 ? `${avail}% free` : 'Engaged'}
                        </span>
                      </div>
                    </div>

                    {emp.primary_skills?.length > 0 && (
                      <div className="sp-card-skills">
                        {emp.primary_skills.slice(0, 5).map((s, i) => (
                          <span key={i} className="sp-card-skill">{s}</span>
                        ))}
                        {emp.primary_skills.length > 5 && (
                          <span className="sp-card-skill sp-card-skill--more">+{emp.primary_skills.length - 5}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ResumeMatch;
