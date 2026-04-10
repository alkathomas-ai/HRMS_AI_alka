import React, { useState, useEffect, useRef } from 'react';
import { X, Users, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import './ProjectCarousel.css';

const ProjectCarousel = ({ openModal, projectsData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % projectsData.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + projectsData.length) % projectsData.length);
  };

  // Auto-slide functionality
  useEffect(() => {
    if (projectsData && projectsData.length > 1 && !isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % projectsData.length);
      }, 8000); // 5 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [projectsData, isHovered]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Don't render if no data
  if (!projectsData || projectsData.length === 0) {
    return (
      <div className="project-carousel">
        <div className="carousel-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>No project recommendations available</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="project-carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="carousel-container">
        <button onClick={prevSlide} className="carousel-nav-btn prev-btn">
          <ChevronLeft size={20} />
        </button>
        
        <div className="carousel-wrapper">
          <div 
            className="carousel-track"
            style={{ transform: `translateX(-${currentIndex * 85}%)` }}
          >
            {projectsData.map((project, index) => (
              <div key={index} className="project-card">
                <div className="card-content-split">
                  {/* Left Side - Project Details */}
                  <div className="project-details-side">
                    <div className="card-image">
                      <img 
                        src={"src/assets/carousel" + (index%3 + 1) + ".jpg"}
                        alt={project.project_title}
                      />
                      <div className="card-overlay">
                        <div className="tech-stack-overlay">
                          {project.tech_stack.map((tech, idx) => (
                            <span key={idx} className="tech-badge">{tech}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="project-info">
                      <h3>{project.project_title}</h3>
                      
                      <div className="project-meta">
                        <span className="duration">
                          <Clock size={14} />
                          {project.estimated_duration}
                        </span>
                        <span className="team-size">
                          <Users size={14} />
                          {project.team_assignments.length} members
                        </span>
                      </div>
                      
                      <p className="card-description">{project.description}</p>
                      
                      <div className="required-roles-section">
                        <h4 className="roles-title">Required Roles:</h4>
                        <div className="required-roles">
                          {project.required_roles.map((role, roleIdx) => (
                            <span key={roleIdx} className="role-tag">{role}</span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="business-value">
                        <strong>Business Value:</strong>
                        <p>{project.business_value}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Side - Suggested Employees */}
                  <div className="suggested-employees-side">
                    <div className="employees-header">
                      <h4>
                        <Users size={14} />
                        Suggested Team Members
                      </h4>
                    </div>
                    
                    <div className="employees-list">
                      {project.team_assignments.map((employee, idx) => (
                        <div key={idx} className="carousel-employee-item">
                          <div className="d-flex">
                            <div className="employee-avatar">
                              {employee.display_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="carousel-employee-header">
                              <div 
                                className="carousel-employee-name clickable-employee-name" 
                                onClick={() => openModal && openModal(employee.employee_id)}
                                style={{ cursor: openModal ? 'pointer' : 'default' }}
                              >
                                {employee.display_name}
                              </div>
                              <div className="carousel-employee-id">{employee.employee_id}</div>
                            </div>
                          </div>
                          <div className="employee-details">
                            <div className="carousel-employee-designation">{employee.designation}</div>
                            <div className="employee-role">{employee.assigned_role}</div>
                            <div className="employee-tech-group">
                              <span className="tech-group-badge">{employee.tech_group}</span>
                              <span className="seniority-badge">{employee.seniority}</span>
                            </div>
                            {/* <div className="employee-skills">
                              <div className="skills-section">
                                <span className="skills-label">Primary:</span>
                                <div className="skills-tags">
                                  {employee.primary_skills.slice(0, 3).map((skill, skillIdx) => (
                                    <span key={skillIdx} className="skill-tag primary">{skill}</span>
                                  ))}
                                  {employee.primary_skills.length > 3 && (
                                    <span className="skill-more">+{employee.primary_skills.length - 3}</span>
                                  )}
                                </div>
                              </div>
                              {employee.secondary_skills.length > 0 && (
                                <div className="skills-section">
                                  <span className="skills-label">Secondary:</span>
                                  <div className="skills-tags">
                                    {employee.secondary_skills.slice(0, 2).map((skill, skillIdx) => (
                                      <span key={skillIdx} className="skill-tag secondary">{skill}</span>
                                    ))}
                                    {employee.secondary_skills.length > 2 && (
                                      <span className="skill-more">+{employee.secondary_skills.length - 2}</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div> */}
                            <div className="employee-reason">
                              <span className="reason-label">Why selected:</span>
                              <p className="reason-text">{employee.reason}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <button onClick={nextSlide} className="carousel-nav-btn next-btn">
          <ChevronRight size={16} />
        </button>
      </div>
      
      <div className="carousel-project-indicators">
        {projectsData.map((_, index) => (
          <button
            key={index}
            className={`c-project-indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectCarousel;