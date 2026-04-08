import React, { useState } from 'react';
import { X, Users, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import './ProjectCarousel.css';

const ProjectCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const projectsData = [
    {
      "tech_stack": ["python", "aiml", "aws", "devops", "qa_auto", "qa_manual"],
      "description": "Develop an intelligent assistant that analyzes code for potential bugs, style violations, and security vulnerabilities, providing real-time feedback to developers. This leverages AI for code comprehension and analysis.",
      "project_title": "AI-Powered Code Review Assistant",
      "business_value": "Improves code quality, reduces bugs, accelerates development cycles, and enhances security by automating parts of the code review process.",
      "required_roles": ["Backend Engineer (AI/ML Integration)", "Backend Engineer (Rule Engine & Logic)", "AI/ML Specialist", "QA Automation Engineer", "DevOps Engineer", "QA Lead"],
      "team_assignments": [
        {
          "domain": "python",
          "reason": "Primary skills in python and django make them suitable for backend development. Foundation course on AIML indicates potential for AI/ML integration.",
          "seniority": "senior",
          "skill_type": "primary",
          "tech_group": "Backend - Python",
          "designation": "Sr Engineer (Software)",
          "employee_id": "VVDN/4331",
          "display_name": "Shwetank Tripathi",
          "assigned_role": "Backend Engineer (AI/ML Integration)",
          "primary_skills": ["django", "c", "python"],
          "seniority_used": "senior",
          "secondary_skills": ["client data security training", "foundation course on aiml - introduction to numpy", "foundation course on aiml - introduction to numpy - 2", "html", "c++"]
        },
        {
          "domain": "python",
          "reason": "Primary skills in python and django are perfect for developing the core logic and rule engine of the assistant. They are fully available.",
          "seniority": "senior",
          "skill_type": "primary",
          "tech_group": "Backend - Python",
          "designation": "Sr Engineer (Software)",
          "employee_id": "VVDN/13347",
          "display_name": "Goswami Jaydeep Laxmanbhai",
          "assigned_role": "Backend Engineer (Rule Engine & Logic)",
          "primary_skills": ["python", "django"],
          "seniority_used": "senior",
          "secondary_skills": ["client data security training", "train the trainer", "reactjs", "javascript"]
        },
        {
          "domain": "embedded",
          "reason": "Possesses advanced AIML foundation courses in pandas and numpy, along with experience in writing state machines, making them ideal for handling data processing and potentially model training or integration.",
          "seniority": "senior",
          "skill_type": "secondary",
          "tech_group": "Embedded SW",
          "designation": "Sr Engineer (Software)",
          "employee_id": "VVDN/6578",
          "display_name": "Himanshu Vishwakarma",
          "assigned_role": "AI/ML Specialist (Data Analysis & Model Training)",
          "primary_skills": ["client data security training", "foundation course on aiml - advanced pandas concepts and visualization", "foundation course on aiml - data aggregation and grouping in pandas", "foundation course on aiml - data cleaning and manipulation with pandas", "foundation course on aiml - introduction to numpy - 2", "foundation course on aiml - numpy operations and functions", "networking l3: container networking part-2 part 2", "writing state machine in c", "effective time management-2", "device driver", "user space", "kernel space", "linux", "c", "linux and bash basics", "shell scripting - basics"],
          "seniority_used": "senior",
          "secondary_skills": ["networking l2", "networking l3: networking booting p1", "interviewer training", "problem solving# 2: lateral thinking", "json", "python", "java", "mqtt", "statements & loops"]
        },
        {
          "domain": "qa_auto",
          "reason": "Primary skills in python, selenium, and pytest are excellent for building robust automated tests for the AI assistant's functionality and output.",
          "seniority": "senior",
          "skill_type": "primary",
          "tech_group": "Automation",
          "designation": "Sr Engineer (QA)",
          "employee_id": "VVDN/13302",
          "display_name": "Luv Kumar Singh",
          "assigned_role": "QA Automation Engineer (Testing Framework)",
          "primary_skills": ["python level 3 : selenium basics", "waits using python without pytest", "python level 3 : install pytest and one small project structure creation with pytest framework", "selenium", "robot framework", "load testing", "selenium basics- introduction to pytest and framework creation"],
          "seniority_used": "senior",
          "secondary_skills": ["client data security training", "python level 1", "locators", "python level 3 : what are fixtures and how to create and use them (why use conftest.py file)", "ethernet header", "speed/duplex", "eth tool wireshark introduction unicast", "multicast and broadcast", "p conflict", "how to assign ip", "subnet", "gateway subnetting", "supernetting router", "routing", "automation testing", "python", "networking commands ifconfig nmcli nmtui nmap nslookup route traceroute iwconfig telnet", "wireless devices - accesspoint", "wireless cleint", "repeater and router ap - sta association and authentication proces", "introduction to derivatives", "fintech series", "loop/range functions typecasting", "go lang basic", "api automation"]
        },
        {
          "domain": "devops",
          "reason": "Secondary skills in AWS and Django, coupled with their primary DevOps domain, make them ideal for setting up the CI/CD pipeline and deploying the assistant on AWS.",
          "seniority": "senior",
          "skill_type": "secondary",
          "tech_group": "Ops - MultiOps",
          "designation": "Sr Engineer (Software)",
          "employee_id": "VVDN/7076",
          "display_name": "Archana V",
          "assigned_role": "DevOps Engineer (CI/CD & Cloud Deployment)",
          "primary_skills": [],
          "seniority_used": "senior",
          "secondary_skills": ["aws solutions architect associate (aws-saa)", "aws solutions architect associate (aws-saa)", "train the trainer", "django", "devops"]
        },
        {
          "domain": "qa_manual",
          "reason": "As a lead in QA, their primary skill in Jira and agile methodology makes them suitable for overseeing the testing process and ensuring adherence to agile practices. Their python secondary skill also provides some automation potential.",
          "seniority": "lead",
          "skill_type": "primary",
          "tech_group": "Manual",
          "designation": "Tech Lead (QA)",
          "employee_id": "VVDN/12520",
          "display_name": "Sangeethapriya J J",
          "assigned_role": "QA Lead (Manual Testing & Process Oversight)",
          "primary_skills": ["jira and agile methodology"],
          "seniority_used": "lead",
          "secondary_skills": ["python level 1: loops", "client data security training", "firmware/networking - session 1.router basics", "dns", "mobile application testing", "api testing (postman swagger)", "firmware/networking - session 3.telnet to configure router", "rm feedback refresher session4", "security for netgear upv2", "qa automation session for netgear upv2", "sql", "xray", "python", "python level 1 : strings", "python level 1: tuple datatype", "python level 1: dictionary datatype", "python level 1: dictionary methods & sets", "python level 1: sets & conditional statements", "software testing", "java with selenium"]
        }
      ],
      "estimated_duration": "6-8 weeks"
    },
    {
      "tech_stack": ["python", "node", "aws", "aiml", "qa_auto", "qa_manual"],
      "description": "Build a sophisticated chatbot capable of understanding user queries, providing instant support, and analyzing customer sentiment to flag urgent issues or opportunities for improvement. This project incorporates NLP and sentiment analysis.",
      "project_title": "Intelligent Customer Support Chatbot with Sentiment Analysis",
      "business_value": "Enhances customer satisfaction, reduces support costs, provides valuable insights into customer sentiment, and improves response times.",
      "required_roles": ["Backend Engineer (Chatbot Logic)", "Backend Engineer (AI/ML Integration)", "AI/ML Specialist", "QA Automation Engineer", "QA Lead", "DevOps Engineer"],
      "team_assignments": [
        {
          "domain": "python",
          "reason": "Primary skills in python and django are well-suited for developing the core logic and integrations for the chatbot. They are fully available.",
          "seniority": "senior",
          "skill_type": "primary",
          "tech_group": "Backend - Python",
          "designation": "Sr Engineer (Software)",
          "employee_id": "VVDN/13347",
          "display_name": "Goswami Jaydeep Laxmanbhai",
          "assigned_role": "Backend Engineer (Chatbot Logic)",
          "primary_skills": ["python", "django"],
          "seniority_used": "senior",
          "secondary_skills": ["client data security training", "train the trainer", "reactjs", "javascript"]
        },
        {
          "domain": "python",
          "reason": "Primary skills in python and django, combined with their AIML foundation course, make them a strong candidate for integrating sentiment analysis and NLP models into the chatbot.",
          "seniority": "senior",
          "skill_type": "primary",
          "tech_group": "Backend - Python",
          "designation": "Sr Engineer (Software)",
          "employee_id": "VVDN/4331",
          "display_name": "Shwetank Tripathi",
          "assigned_role": "Backend Engineer (AI/ML Integration)",
          "primary_skills": ["django", "c", "python"],
          "seniority_used": "senior",
          "secondary_skills": ["client data security training", "foundation course on aiml - introduction to numpy", "foundation course on aiml - introduction to numpy - 2", "html", "c++"]
        }
      ],
      "estimated_duration": "5-7 weeks"
    },
    {
      "tech_stack": ["python", "aws", "azure", "gcp", "devops", "qa_auto"],
      "description": "Develop a tool that analyzes cloud resource utilization (AWS/Azure/GCP) and provides recommendations or automatically implements optimizations to reduce costs and improve performance. This focuses on cloud cost management and automation.",
      "project_title": "Automated Cloud Infrastructure Optimization Tool",
      "business_value": "Significant cost savings on cloud spend, improved resource efficiency, and reduced manual effort in cloud management.",
      "required_roles": ["Lead DevOps Engineer", "Backend Engineer (Data Analysis & API Integration)", "Backend Engineer (Scripting & Cloud Integration)", "QA Automation Engineer", "Backend Engineer (Rule Engine & Reporting)", "Junior Backend Engineer"],
      "team_assignments": [
        {
          "domain": "devops",
          "reason": "Possesses AWS certifications and a DevOps domain, making them ideal for architecting and implementing cloud automation strategies and optimization. They have high availability.",
          "seniority": "senior",
          "skill_type": "secondary",
          "tech_group": "Ops - MultiOps",
          "designation": "Sr Engineer (Software)",
          "employee_id": "VVDN/7076",
          "display_name": "Archana V",
          "assigned_role": "Lead DevOps Engineer (Cloud Strategy & Automation)",
          "primary_skills": [],
          "seniority_used": "senior",
          "secondary_skills": ["aws solutions architect associate (aws-saa)", "aws solutions architect associate (aws-saa)", "train the trainer", "django", "devops"]
        }
      ],
      "estimated_duration": "7-9 weeks"
    }
  ];

  const getProjectImage = (title) => {
    const encodedTitle = encodeURIComponent(title);
    return `https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=${encodedTitle}`;
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % projectsData.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + projectsData.length) % projectsData.length);
  };

  return (
    <div className="project-carousel">
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
                              <div className="employee-name">{employee.display_name}</div>
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
          <ChevronRight size={20} />
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