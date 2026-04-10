import React, { useState, useEffect, useRef } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './WidgetPanel.css';
import { Icons } from '../../assets/icons';
import { getProjectDistributions, getEmployeeDirectory, getEmployeeCount, getDepartment, getSoonAvailableEmployees } from '../../services/api';
import Alert from '../common/Alert';
import DoughnutChart from './charts/DoughnutChart';
import BarChart from './charts/BarChart';
import CreateWidgetModal from './CreateWidgetModal';
import DynamicWidget from './DynamicWidget';
import AnimatedSearchInput from './AnimatedSearchInput';
import StatsWidget from './StatsWidget';
import useConfirmation from '../common/useConfirmation';
import CandidateProfileModal from '../CandidateProfileModal';
import { useCandidateProfileModal } from '../../hooks/useCandidateProfileModal';
import ProjectCarousel from './ProjectCarousel';


const SortableWidget = ({ id, children, isPinned, widgetSize }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const itemRef = useRef(null);

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    gridColumn: widgetSize?.cols ? `span ${widgetSize.cols}` : 'span 1',
    gridRow: widgetSize?.rows ? `span ${widgetSize.rows}` : 'auto',
  };

  return (
    <div ref={(node) => { setNodeRef(node); itemRef.current = node; }} style={style} {...attributes} {...listeners} className={`masonry-item ${isPinned ? 'pinned' : ''}`} data-widget-id={id}>
      {children}
    </div>
  );
};

const WidgetPanel = ({ isExpanded, onExpand, onClose }) => {
  const { confirm, ConfirmationModal } = useConfirmation();
  const { isOpen, employee, loading, error, openModal, closeModal } = useCandidateProfileModal();
  const [selectedWidgets, setSelectedWidgets] = useState(() => {
    const saved = localStorage.getItem('selectedWidgets');
    return saved ? JSON.parse(saved) : ['project-carousel', 'project-distribution', 'department-overview', 'employee-directory', 'available-employees', 'upskill-suggestions'];
  });
  const [pinnedWidgets, setPinnedWidgets] = useState(() => {
    const saved = localStorage.getItem('pinnedWidgets');
    return saved ? JSON.parse(saved) : [];
  });
  const [dynamicWidgets, setDynamicWidgets] = useState(() => {
    const saved = localStorage.getItem('dynamicWidgets');
    return saved ? JSON.parse(saved) : [];
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);
  const [isLoading, setIsLoading] = useState(true)
  const dropdownRef = useRef(null);

  const [projectDistribution, setProjectDistribution] = useState({ projects: [], total_employees: 0 });
  const [departmentData, setDepartmentData] = useState({ departments: [] });
  const [employeeDirectory, setEmployeeDirectory] = useState({ employees: [] });
  const [employeeCount, setEmployeeCount] = useState({ employeeCount: 0, freepoolCount: 0, projectCount: 0 });
  const [employeePage, setEmployeePage] = useState(0);
  const [soonAvailableEmployees, setSoonAvailableEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [widgetSearch, setWidgetSearch] = useState('');
  const [containerWidth, setContainerWidth] = useState(1200);
  const [activeReleaseDate, setActiveReleaseDate] = useState(null);
  const [gridColumns, setGridColumns] = useState(() => {
    const saved = localStorage.getItem('gridColumns');
    return saved ? parseInt(saved) : 3;
  });
  const [widgetSizes, setWidgetSizes] = useState(() => {
    const saved = localStorage.getItem('widgetSizes');
    return saved ? JSON.parse(saved) : {};
  });
  const [openSizePopup, setOpenSizePopup] = useState(null);
  const timelineRef = useRef(null);
  const containerRef = useRef(null);
  const employeesPerPage = 10;

  // Static upskill suggestions data
  const upskillData =  [
                {
                    "domain": "dotnet",
                    "seniority": "senior",
                    "tech_group": "Backend - Dot Net",
                    "designation": "Sr Engineer (Software)",
                    "employee_id": "VVDN/13288",
                    "display_name": "Neeraj Jain",
                    "primary_skills": [
                        "sql",
                        "dotnet",
                        "c#"
                    ],
                    "secondary_skills": [
                        "agile scrum on jira",
                        "client data security training",
                        "jira certification level 1: jira basics",
                        "jira certification level 2",
                        "golang level 1",
                        "associate cloud engineer",
                        "what is golang? why go? environment setup project structure basic syntax",
                        "data types",
                        "variables",
                        "constants",
                        "go lang series",
                        "strings",
                        "go lang series",
                        "arrays",
                        "go lang series",
                        "pointers and structures",
                        "go lang series",
                        "error handling recover",
                        "defer",
                        "and panic",
                        "go lang series",
                        "basic recap",
                        "golang level 2",
                        "structs in go",
                        "golang level 2",
                        "functions",
                        "methods and pointers",
                        "golang level 2 (intermediate level)",
                        "interfaces and error handling",
                        "golang level 2 (intermediate level)",
                        "pointers with interfaces",
                        "golang level 2 (intermediate level)",
                        "concurrency in go",
                        "golang level 2",
                        "golang basics",
                        "associate cloud engineer",
                        "html and css",
                        "javascript",
                        "wpf",
                        "bootstrap",
                        "oops concepts",
                        "web api",
                        "mvvm"
                    ],
                    "upskill_suggestions": [
                        {
                            "skill": "Advanced SQL Performance Tuning and Optimization",
                            "reason": "Deepens expertise in a primary skill (SQL) at a senior level, crucial for efficient database operations in cloud/web projects.",
                            "learning_path": "Online courses on SQL tuning, performance analysis tools, hands-on exercises with large datasets, studying indexing strategies and query execution plans.",
                            "estimated_weeks": 6,
                            "relevance_to_company": "Essential for optimizing database performance in all cloud and web projects, reducing latency and operational costs."
                        },
                        {
                            "skill": "Cloud-Native Database Services (e.g., AWS RDS, Azure SQL Database, Google Cloud SQL)",
                            "reason": "Extends primary domain (SQL, .NET) into cloud infrastructure, a key area for product engineering companies.",
                            "learning_path": "Certifications or guided learning paths for cloud provider database services, understanding managed database features, scaling, and security.",
                            "estimated_weeks": 7,
                            "relevance_to_company": "Enables engineers to design and implement more robust and scalable database solutions on cloud platforms."
                        },
                        {
                            "skill": "Microservices Architecture with .NET Core",
                            "reason": "Leverages primary skills (.NET, C#) for a modern architectural pattern highly relevant to cloud-native applications.",
                            "learning_path": "Courses on microservices design patterns, .NET Core for building services, containerization (Docker), and API Gateway implementation.",
                            "estimated_weeks": 8,
                            "relevance_to_company": "Facilitates the development of scalable, maintainable, and independently deployable services, aligning with current cloud-native development trends."
                        }
                    ]
                },
                {
                    "domain": "android",
                    "seniority": "mid",
                    "tech_group": "Android",
                    "designation": "Engineer (Software)",
                    "employee_id": "VVDN/13041",
                    "display_name": "Gopika E",
                    "primary_skills": [
                        "android studio"
                    ],
                    "secondary_skills": [
                        "client data security training",
                        "setup flutter and required tools",
                        "flutter series",
                        "flutter basics (stateless widget + stateful widget)",
                        "platform specific widgets(material + cupertino)",
                        "flutter series",
                        "networking &quot",
                        "localization and animation",
                        "flutter series",
                        "state management (bloc)",
                        "flutter series",
                        "vs code",
                        "local storage",
                        "flutter series",
                        "unit test cases",
                        "flutter series",
                        "java",
                        "c/c++",
                        "flutter"
                    ],
                    "upskill_suggestions": [
                        {
                            "skill": "Advanced Android Jetpack Compose",
                            "reason": "Builds depth in the primary domain (Android) with a modern, declarative UI toolkit, enhancing efficiency and developer experience.",
                            "learning_path": "Official Jetpack Compose documentation, hands-on projects building complex UIs, tutorials on state management and custom components.",
                            "estimated_weeks": 5,
                            "relevance_to_company": "Improves the quality and maintainability of native Android applications, a key offering for web and cloud projects with mobile frontends."
                        },
                        {
                            "skill": "Kotlin for Android Development",
                            "reason": "Complements Android development by introducing a modern, concise, and interoperable language that is the preferred choice for Android.",
                            "learning_path": "Kotlin language courses, official Android documentation on Kotlin integration, refactoring existing Java/Kotlin codebases.",
                            "estimated_weeks": 6,
                            "relevance_to_company": "Modernizes Android codebase, improves developer productivity, and aligns with industry best practices for Android development."
                        },
                        {
                            "skill": "RESTful API Design and Integration for Mobile Apps",
                            "reason": "Provides adjacent skill in connecting Android apps to backend services, crucial for full-stack mobile development.",
                            "learning_path": "Understanding HTTP methods, designing efficient APIs, using libraries like Retrofit, handling JSON data, and error management.",
                            "estimated_weeks": 4,
                            "relevance_to_company": "Enables engineers to effectively integrate mobile applications with cloud-based backend services, a common requirement."
                        }
                    ]
                },
                {
                    "domain": "angular",
                    "seniority": "senior",
                    "tech_group": "Frontend - Angular",
                    "designation": "Sr Engineer (Software)",
                    "employee_id": "VVDN/21574",
                    "display_name": "Mayur Balkrishna Amritkar",
                    "primary_skills": [
                        "angular"
                    ],
                    "secondary_skills": [
                        "client data security training",
                        "python"
                    ],
                    "upskill_suggestions": [
                        {
                            "skill": "Angular Advanced State Management (NgRx)",
                            "reason": "Deepens primary skill (Angular) by mastering a robust solution for managing complex application state, essential for large-scale web applications.",
                            "learning_path": "NgRx official documentation, tutorials on Redux patterns, implementing stores, actions, and reducers, building complex features with NgRx.",
                            "estimated_weeks": 6,
                            "relevance_to_company": "Critical for building scalable and maintainable enterprise-level Angular applications, improving user experience and code organization."
                        },
                        {
                            "skill": "Progressive Web Apps (PWAs) with Angular",
                            "reason": "Extends Angular expertise into building modern web experiences that offer native app-like features, relevant to current web trends.",
                            "learning_path": "Service workers, manifest files, offline capabilities, push notifications, and best practices for PWA development with Angular CLI.",
                            "estimated_weeks": 5,
                            "relevance_to_company": "Allows for the creation of highly performant and engaging web applications that can work offline and offer richer user experiences."
                        },
                        {
                            "skill": "Server-Side Rendering (SSR) with Angular Universal",
                            "reason": "Enhances Angular skills with a technique vital for SEO and initial load performance in web projects.",
                            "learning_path": "Angular Universal documentation, setting up SSR environments, pre-rendering strategies, and understanding performance implications.",
                            "estimated_weeks": 5,
                            "relevance_to_company": "Improves SEO and initial page load times for web applications, directly impacting user engagement and search engine visibility."
                        }
                    ]
                },
                {
                    "domain": "react",
                    "seniority": "lead",
                    "tech_group": "Frontend - ReactJS",
                    "designation": "Principal Engineer (Software)",
                    "employee_id": "VVDN/1571",
                    "display_name": "Muhammed Aslam K V",
                    "primary_skills": [
                        "css",
                        "javascript",
                        "reactjs",
                        "html"
                    ],
                    "secondary_skills": [
                        "lua scripting 3",
                        "client data security training",
                        "rm excellence",
                        "jquery",
                        "presentation skills",
                        "rm feedback refresher session",
                        "lua scripting- 1",
                        "lua scripting-2",
                        "agile certification #1 - agile and jira basics",
                        "agile certification #3 - kanban with jira",
                        "agile certification #4 - dashboards and jql",
                        "interviewer training",
                        "bootstrap",
                        "angularjs",
                        "openwrt framework"
                    ],
                    "upskill_suggestions": [
                        {
                            "skill": "React Architectural Patterns and Best Practices",
                            "reason": "Leverages lead seniority and primary React skills to focus on scalable and maintainable application architecture.",
                            "learning_path": "Courses and books on React patterns (e.g., Render Props, Higher-Order Components, Hooks), context API, and performance optimization techniques.",
                            "estimated_weeks": 7,
                            "relevance_to_company": "Ensures the development of robust, scalable, and performant React-based web applications, crucial for complex projects."
                        },
                        {
                            "skill": "GraphQL with React",
                            "reason": "Introduces a modern data fetching paradigm that significantly improves efficiency and developer experience for web applications.",
                            "learning_path": "Learning GraphQL query language, Apollo Client or Relay for React integration, setting up a GraphQL schema, and understanding mutations.",
                            "estimated_weeks": 6,
                            "relevance_to_company": "Enables more efficient data fetching and management in web applications, leading to faster UIs and reduced network overhead."
                        },
                        {
                            "skill": "CI/CD Pipeline Design and Implementation (e.g., GitHub Actions, GitLab CI)",
                            "reason": "Expands expertise to encompass the full lifecycle of web project development, a key area for cloud and web projects.",
                            "learning_path": "Learning YAML configurations for CI/CD, automating builds, testing, and deployments for React applications. Hands-on implementation in a project.",
                            "estimated_weeks": 5,
                            "relevance_to_company": "Streamlines the development process, improves code quality through automated testing, and accelerates delivery of features."
                        }
                    ]
                },
                {
                    "domain": "angular",
                    "seniority": "senior",
                    "tech_group": "Frontend - Angular",
                    "designation": "Sr Engineer (Software)",
                    "employee_id": "VVDN/32473",
                    "display_name": "Chevuty Sree Akshithapriya",
                    "primary_skills": [
                        "html and css",
                        "javascript",
                        "angular"
                    ],
                    "secondary_skills": [
                        "agile methodology",
                        "bootstrap5",
                        "jest"
                    ],
                    "upskill_suggestions": [
                        {
                            "skill": "Angular Component Design and Reusability Patterns",
                            "reason": "Deepens primary skills in HTML, CSS, JS, and Angular by focusing on building highly reusable and maintainable UI components.",
                            "learning_path": "Advanced Angular component patterns, content projection, dynamic component loading, and best practices for creating design systems.",
                            "estimated_weeks": 5,
                            "relevance_to_company": "Improves consistency, maintainability, and development speed for Angular applications through well-designed reusable components."
                        },
                        {
                            "skill": "RxJS Advanced Usage and Patterns",
                            "reason": "Enhances primary JavaScript and Angular skills by mastering reactive programming, crucial for complex asynchronous operations in web apps.",
                            "learning_path": "Deep dive into RxJS operators, advanced observables, error handling strategies, and integrating RxJS with Angular services.",
                            "estimated_weeks": 6,
                            "relevance_to_company": "Enables more efficient and robust handling of asynchronous events and data streams in Angular applications, leading to better performance and fewer bugs."
                        },
                        {
                            "skill": "Angular Performance Optimization Techniques",
                            "reason": "Focuses on optimizing Angular applications for speed and efficiency, a critical aspect of modern web development.",
                            "learning_path": "Lazy loading modules, change detection strategies, AOT compilation, bundle analysis, and optimizing template rendering.",
                            "estimated_weeks": 5,
                            "relevance_to_company": "Ensures that Angular applications deliver a fast and responsive user experience, crucial for user retention and satisfaction."
                        }
                    ]
                },
                {
                    "domain": "angular",
                    "seniority": "mid",
                    "tech_group": "Frontend - Angular",
                    "designation": "Engineer (Software)",
                    "employee_id": "VVDN/30443",
                    "display_name": "Alka Mariam Thomas",
                    "primary_skills": [
                        "angularjs"
                    ],
                    "secondary_skills": [
                        "communication : tenses",
                        "react",
                        "python"
                    ],
                    "upskill_suggestions": [
                        {
                            "skill": "Angular (Modern) - Component Development",
                            "reason": "Transitions from AngularJS to modern Angular, focusing on core component development which is a primary skill advancement.",
                            "learning_path": "Official Angular documentation for components, building single-page applications, learning component lifecycle hooks and data binding.",
                            "estimated_weeks": 5,
                            "relevance_to_company": "Updates skills to the current Angular framework, enabling contributions to modern web projects."
                        },
                        {
                            "skill": "TypeScript Fundamentals for Web Development",
                            "reason": "Introduces a strongly typed superset of JavaScript, enhancing code quality and maintainability, an adjacent skill to frontend development.",
                            "learning_path": "Basic TypeScript syntax, types, interfaces, classes, and integrating TypeScript into an Angular project.",
                            "estimated_weeks": 4,
                            "relevance_to_company": "Improves code robustness and developer productivity for web projects, aligning with modern JavaScript development practices."
                        },
                        {
                            "skill": "Introduction to Node.js for Full-Stack Development",
                            "reason": "Provides an adjacent skill in backend JavaScript, offering a foundational understanding for full-stack web projects.",
                            "learning_path": "Basic Node.js concepts, creating simple web servers with Express.js, and understanding asynchronous programming.",
                            "estimated_weeks": 6,
                            "relevance_to_company": "Opens up possibilities for full-stack roles and understanding backend interactions within web projects."
                        }
                    ]
                },
                {
                    "domain": "android",
                    "seniority": "senior",
                    "tech_group": "Android",
                    "designation": "Sr Engineer (Software)",
                    "employee_id": "VVDN/34948",
                    "display_name": "Rajalekshmi R",
                    "primary_skills": [],
                    "secondary_skills": [
                        "flutter & dart - the complete guide[2024 edition]",
                        "javascript"
                    ],
                    "upskill_suggestions": [
                        {
                            "skill": "Native Android Performance Optimization",
                            "reason": "Builds on the Android domain, focusing on advanced techniques to improve app speed and efficiency, suitable for a senior engineer.",
                            "learning_path": "Android profiling tools (CPU, memory, network), optimizing rendering, background task management, and memory leak detection.",
                            "estimated_weeks": 7,
                            "relevance_to_company": "Ensures high-performing and stable native Android applications, critical for user satisfaction and retention."
                        },
                        {
                            "skill": "Android Jetpack Architecture Components (ViewModel, LiveData, Room)",
                            "reason": "Deepens Android expertise with industry-standard components for building robust and maintainable applications.",
                            "learning_path": "Official Android documentation, hands-on implementation of ViewModel, LiveData, and Room Persistence Library in sample apps.",
                            "estimated_weeks": 5,
                            "relevance_to_company": "Standardizes Android development practices within the company, leading to more maintainable and scalable applications."
                        },
                        {
                            "skill": "Cross-Platform Mobile Development Fundamentals (React Native or Flutter)",
                            "reason": "Introduces a complementary skill that leverages web development (JavaScript) or builds on Flutter knowledge for wider project applicability.",
                            "learning_path": "Foundational courses on React Native or Flutter development, building simple cross-platform apps, understanding platform-specific considerations.",
                            "estimated_weeks": 8,
                            "relevance_to_company": "Expands the engineer's skillset to contribute to cross-platform mobile projects, increasing project flexibility."
                        }
                    ]
                },
                {
                    "domain": "java",
                    "seniority": "lead",
                    "tech_group": "Backend - Java",
                    "designation": "Tech Lead (Software)",
                    "employee_id": "VVDN/35630",
                    "display_name": "Shashikant Nishad",
                    "primary_skills": [
                        "java (cloud - backend)"
                    ],
                    "secondary_skills": [
                        "data engineer"
                    ],
                    "upskill_suggestions": [
                        {
                            "skill": "Java Microservices Design Patterns (e.g., CQRS, Saga)",
                            "reason": "Leverages lead seniority and primary Java (cloud - backend) skills to master advanced architectural patterns for distributed systems.",
                            "learning_path": "Online courses and books focusing on microservices patterns, implementing them with Java frameworks (Spring Boot), and understanding their trade-offs.",
                            "estimated_weeks": 7,
                            "relevance_to_company": "Enables the design and development of highly scalable, resilient, and maintainable backend services for cloud-native applications."
                        },
                        {
                            "skill": "Cloud-Native Java Development (Spring Cloud, Docker, Kubernetes)",
                            "reason": "Extends primary Java skills into the cloud environment, a core competency for cloud projects.",
                            "learning_path": "Courses on Spring Cloud ecosystem, Docker for containerization, and basic Kubernetes concepts for deploying and managing Java applications.",
                            "estimated_weeks": 8,
                            "relevance_to_company": "Directly supports the company's cloud project delivery by providing expertise in deploying and managing Java applications in cloud environments."
                        },
                        {
                            "skill": "Event-Driven Architecture with Java (e.g., Kafka, RabbitMQ)",
                            "reason": "Introduces a powerful paradigm for building loosely coupled and scalable backend systems, relevant to modern cloud architectures.",
                            "learning_path": "Learning messaging queues, Kafka or RabbitMQ concepts, implementing producers and consumers in Java, and understanding event streaming.",
                            "estimated_weeks": 6,
                            "relevance_to_company": "Facilitates the development of reactive and highly scalable backend systems, enabling real-time data processing and asynchronous communication."
                        }
                    ]
                },
                {
                    "domain": "qa_manual",
                    "seniority": "senior",
                    "tech_group": "Manual",
                    "designation": "Sr Engineer (QA)",
                    "employee_id": "VVDN/38359",
                    "display_name": "Ashish Kumar Verma",
                    "primary_skills": [],
                    "secondary_skills": [
                        "python (automation)",
                        "api testing"
                    ],
                    "upskill_suggestions": [
                        {
                            "skill": "API Automation Testing Frameworks (e.g., Postman Newman, RestAssured)",
                            "reason": "Builds on primary QA skills and secondary Python by specializing in automated API testing, a critical part of web projects.",
                            "learning_path": "Learning Postman Newman for CLI execution, RestAssured for Java/Python integration, designing robust API test suites, and integrating with CI/CD.",
                            "estimated_weeks": 5,
                            "relevance_to_company": "Automates critical API testing, ensuring the quality and reliability of backend services for all web and cloud projects."
                        },
                        {
                            "skill": "Performance Testing for Web APIs",
                            "reason": "Extends QA skills to performance testing, a crucial aspect for ensuring web application scalability and stability.",
                            "learning_path": "Tools like JMeter or k6, understanding load, stress, and soak testing, analyzing performance metrics, and identifying bottlenecks.",
                            "estimated_weeks": 7,
                            "relevance_to_company": "Ensures that web APIs can handle expected loads and perform reliably under pressure, preventing production issues."
                        },
                        {
                            "skill": "Contract Testing for Microservices",
                            "reason": "Introduces a specialized testing technique for microservices, enhancing confidence in distributed system integrations.",
                            "learning_path": "Understanding consumer-driven contract testing principles, tools like Pact, and implementing contract tests for APIs.",
                            "estimated_weeks": 6,
                            "relevance_to_company": "Improves the reliability of integrations between microservices, reducing the risk of integration failures in complex cloud projects."
                        }
                    ]
                },
                {
                    "domain": "java",
                    "seniority": "mid",
                    "tech_group": "Backend - Java",
                    "designation": "Engineer (Software)",
                    "employee_id": "VVDN/30433",
                    "display_name": "Upasana Samikutty",
                    "primary_skills": [],
                    "secondary_skills": [
                        "communication : tenses",
                        "inheritance & polymorphism",
                        "c programming",
                        "python"
                    ],
                    "upskill_suggestions": [
                        {
                            "skill": "Java - Object-Oriented Design Principles and Patterns",
                            "reason": "Deepens understanding of core Java concepts, providing a strong foundation for more complex Java development, building on primary skill area.",
                            "learning_path": "Courses on SOLID principles, design patterns (e.g., Factory, Singleton, Observer), and practicing their application in Java code.",
                            "estimated_weeks": 5,
                            "relevance_to_company": "Enhances code quality, maintainability, and scalability of Java-based projects, contributing to better software engineering practices."
                        },
                        {
                            "skill": "Python for Data Analysis (Pandas, NumPy)",
                            "reason": "Develops a valuable adjacent skill in data analysis using Python, applicable to various cloud and web project needs.",
                            "learning_path": "Tutorials and hands-on exercises using Pandas and NumPy libraries for data manipulation, cleaning, and analysis.",
                            "estimated_weeks": 6,
                            "relevance_to_company": "Enables engineers to assist with data-related tasks, reporting, or simple data processing within projects."
                        },
                        {
                            "skill": "Basic Cloud Computing Concepts (AWS/Azure/GCP Fundamentals)",
                            "reason": "Introduces foundational knowledge of cloud platforms, relevant for engineers working on cloud projects.",
                            "learning_path": "Introductory courses on core cloud services (compute, storage, networking) for a major cloud provider (AWS, Azure, or GCP).",
                            "estimated_weeks": 4,
                            "relevance_to_company": "Provides a basic understanding of the cloud infrastructure on which projects are deployed, fostering better collaboration."
                        }
                    ]
                },
                {
                    "domain": "qa_manual",
                    "seniority": "junior",
                    "tech_group": "Manual",
                    "designation": "Trainee (QA)",
                    "employee_id": "VVDN/39328",
                    "display_name": "Jyotsna Gautam",
                    "primary_skills": [],
                    "secondary_skills": [
                        "java (android)",
                        "c++"
                    ],
                    "upskill_suggestions": [
                        {
                            "skill": "Automated UI Testing with Selenium/Cypress",
                            "reason": "Builds on junior QA skills by introducing automation tools for web UI testing, a key trend in web projects.",
                            "learning_path": "Learning Selenium WebDriver or Cypress, writing end-to-end test scripts, understanding locators, and basic assertion techniques.",
                            "estimated_weeks": 6,
                            "relevance_to_company": "Enables the creation of automated tests for web applications, improving efficiency and quality of releases."
                        },
                        {
                            "skill": "Introduction to Web Development Fundamentals (HTML, CSS, JavaScript Basics)",
                            "reason": "Provides foundational web development skills, essential for understanding the context of web projects, even for QA.",
                            "learning_path": "Online courses covering basic HTML structure, CSS styling, and fundamental JavaScript concepts (variables, functions, DOM manipulation).",
                            "estimated_weeks": 5,
                            "relevance_to_company": "Improves understanding of web application structure and behavior, facilitating better test case design and communication with developers."
                        },
                        {
                            "skill": "Git Version Control Essentials",
                            "reason": "Introduces a fundamental tool for collaborative development, essential for any engineer in a product engineering company.",
                            "learning_path": "Learning Git commands (clone, add, commit, push, pull, branch, merge), branching strategies, and working with remote repositories.",
                            "estimated_weeks": 3,
                            "relevance_to_company": "Ensures basic proficiency in collaborative code management, a prerequisite for almost all development tasks."
                        }
                    ]
                },
                {
                    "domain": "frontend",
                    "seniority": "junior",
                    "tech_group": "Cloud - Frontend",
                    "designation": "Trainee (Software)",
                    "employee_id": "VVDN/39443",
                    "display_name": "Sidhartha Mohapatra",
                    "primary_skills": [
                        "java"
                    ],
                    "secondary_skills": [
                        "cloud"
                    ],
                    "upskill_suggestions": [
                        {
                            "skill": "Java Fundamentals for Backend Development",
                            "reason": "Builds on junior frontend skills by introducing Java, a primary language for cloud backend development.",
                            "learning_path": "Core Java programming concepts, data types, control flow, methods, and object-oriented programming fundamentals.",
                            "estimated_weeks": 6,
                            "relevance_to_company": "Provides a foundational skill for contributing to Java-based backend services in cloud projects."
                        },
                        {
                            "skill": "Basic Cloud Concepts (Compute, Storage, Networking)",
                            "reason": "Introduces fundamental cloud concepts, directly relevant to the 'cloud' secondary skill.",
                            "learning_path": "Introductory materials on IaaS, PaaS, SaaS, virtual machines, object storage, and basic networking concepts on a major cloud platform.",
                            "estimated_weeks": 4,
                            "relevance_to_company": "Offers a basic understanding of cloud infrastructure, beneficial for understanding how web projects are deployed and managed."
                        },
                        {
                            "skill": "Introduction to RESTful APIs",
                            "reason": "Connects frontend understanding to backend communication, crucial for web projects.",
                            "learning_path": "Learning what APIs are, HTTP methods (GET, POST, PUT, DELETE), status codes, and JSON data format.",
                            "estimated_weeks": 3,
                            "relevance_to_company": "Enables a better understanding of how frontend applications interact with backend services in web projects."
                        }
                    ]
                },
                {
                    "domain": "android",
                    "seniority": "lead",
                    "tech_group": "Android",
                    "designation": "Sr Tech Lead (Software)",
                    "employee_id": "VVDN/39365",
                    "display_name": "Ganeshmoorthy D",
                    "primary_skills": [
                        "java (android)"
                    ],
                    "secondary_skills": [
                        "swift"
                    ],
                    "upskill_suggestions": [
                        {
                            "skill": "Advanced Android Architecture Patterns (MVVM, MVI)",
                            "reason": "Leverages lead seniority and primary Java (Android) skills to master modern architectural patterns for scalable Android apps.",
                            "learning_path": "In-depth study of MVVM and MVI patterns, implementation with Android Architecture Components, and comparison of their benefits.",
                            "estimated_weeks": 7,
                            "relevance_to_company": "Ensures the development of robust, maintainable, and scalable Android applications, aligning with best practices for complex projects."
                        },
                        {
                            "skill": "Kotlin Coroutines for Asynchronous Android Programming",
                            "reason": "Enhances Android development by introducing a modern, efficient way to handle asynchronous operations, building on Java/Android expertise.",
                            "learning_path": "Learning Kotlin coroutine basics, suspending functions, scopes, dispatchers, and applying them to network calls and database operations.",
                            "estimated_weeks": 5,
                            "relevance_to_company": "Improves the performance and responsiveness of Android applications by providing a more elegant and efficient way to manage background tasks."
                        },
                        {
                            "skill": "Cross-Platform Mobile Development Fundamentals (Flutter or React Native)",
                            "reason": "Expands expertise into cross-platform development, offering versatility across different mobile projects.",
                            "learning_path": "Foundational courses on Flutter or React Native development, building simple cross-platform apps, understanding platform-specific considerations.",
                            "estimated_weeks": 8,
                            "relevance_to_company": "Increases the engineer's ability to contribute to a wider range of mobile projects, including those requiring cross-platform solutions."
                        }
                    ]
                }
            ];

  const availableWidgets = [
    { id: 'stats-overview', label: 'Stats Overview' },
    { id: 'project-carousel', label: 'Freepool Project Recommendations' },
    { id: 'project-distribution', label: 'Project Distribution' },
    { id: 'department-overview', label: 'Department Overview' },
    { id: 'employee-directory', label: 'Employee Directory' },
    { id: 'available-employees', label: 'Available Employees' },
    { id: 'upskill-suggestions', label: 'Upskill Suggestions' },
  ];

  
  useEffect(() => {
    const initializeWidgetSizes = () => {
      const updatedSizes = { ...widgetSizes };
      let hasChanges = false;
      
      availableWidgets.forEach(widget => {
        if (!updatedSizes[widget.id]) {
          let defaultRows = 2;
          let defaultCols = 1;
          if (widget.id === 'stats-overview') defaultRows = 1;
          if (widget.id === 'project-carousel') {defaultRows = 3; defaultCols = 2;}
          if (widget.id === 'employee-directory' || widget.id === 'available-employees' || widget.id === 'upskill-suggestions') defaultRows = 3;
          
          updatedSizes[widget.id] = { cols: defaultCols, rows: defaultRows };
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        setWidgetSizes(updatedSizes);
      }
    };
    
    initializeWidgetSizes();
  }, []);
  
  useEffect(() => {
    localStorage.setItem('selectedWidgets', JSON.stringify(selectedWidgets));
  }, [selectedWidgets]);

  useEffect(() => {
    localStorage.setItem('dynamicWidgets', JSON.stringify(dynamicWidgets));
  }, [dynamicWidgets]);

  useEffect(() => {
    localStorage.setItem('pinnedWidgets', JSON.stringify(pinnedWidgets));
  }, [pinnedWidgets]);

  useEffect(() => {
    localStorage.setItem('gridColumns', gridColumns.toString());
  }, [gridColumns]);

  useEffect(() => {
    localStorage.setItem('widgetSizes', JSON.stringify(widgetSizes));
  }, [widgetSizes]);

  const setWidgetSize = (widgetId, cols, rows) => {
    setWidgetSizes(prev => ({ ...prev, [widgetId]: { cols, rows } }));
    setTimeout(() => {
      const widgetElement = document.querySelector(`[data-widget-id="${widgetId}"]`);
      if (widgetElement) {
        widgetElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [projects, departments, employees, counts, availableEmployees] = await Promise.all([
          getProjectDistributions(),
          getDepartment(),
          getEmployeeDirectory(),
          getEmployeeCount(),
          getSoonAvailableEmployees()
        ]);
        setIsLoading(false);
        setProjectDistribution({ projects: projects.projects, total_employees: projects.total_employees });
        setDepartmentData({ departments: departments.departments });
        setEmployeeDirectory({ employees: employees.employees });
        setSoonAvailableEmployees(availableEmployees?.data || []);
        setEmployeeCount({
          employeeCount: counts.employee_count || 0,
          projectCount: counts.project_count || 0,
          freepoolCount: counts.freepool_count || 0
        });
        if (availableEmployees?.data?.length) {
          const sorted = [...availableEmployees.data]
            .filter(emp => emp.committed_relieving_date)
            .sort((a, b) =>
              new Date(a.committed_relieving_date) -
              new Date(b.committed_relieving_date)
            );

          setActiveReleaseDate(sorted[0]?.committed_relieving_date);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    // Fetch data when expanded or on initial mount if not explicitly minimized
    if (isExpanded || isExpanded === null) {
      fetchData();
    }

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    
    if (isExpanded || isExpanded === null) {
      updateWidth();
      window.addEventListener('resize', updateWidth);
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (!event.target.closest('.size-grid-popup') && !event.target.closest('.widget-size-btn')) {
        setOpenSizePopup(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updateWidth);
    };
  }, [isExpanded]);

  const toggleWidget = (widgetId) => {
    if (selectedWidgets.includes(widgetId)) {
      setSelectedWidgets(prev => prev.filter(id => id !== widgetId));
    } else {
      setSelectedWidgets(prev => [widgetId, ...prev]);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSelectedWidgets((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newItems = [...items];
        newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, active.id);
        return newItems;
      });
    }
  };

  const removeWidget = async (id) => {
    // Check if it's a dynamic widget
    if (id.startsWith('dynamic-')) {
      const confirmed = await confirm({
        title: 'Remove Widget',
        message: 'Are you sure you want to remove this widget? This action cannot be undone.'
      });
      
      if (!confirmed) return;
    }
    
    setSelectedWidgets(prev => prev.filter(widgetId => widgetId !== id));
    setPinnedWidgets(prev => prev.filter(widgetId => widgetId !== id));
    if (id.startsWith('dynamic-')) {
      setDynamicWidgets(prev => prev.filter(w => w.id !== id));
    }
  };

  const togglePin = (id) => {
    setPinnedWidgets(prev => {
      if (prev.includes(id)) {
        return prev.filter(widgetId => widgetId !== id);
      } else if (prev.length >= 5) {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        return prev;
      } else {
        // Auto-center the widget when pinned
        setTimeout(() => {
          const widgetElement = document.querySelector(`[data-widget-id="${id}"]`);
          if (widgetElement) {
            widgetElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'center'
            });
          }
        }, 100);
        return [...prev, id];
      }
    });
  };



  const renderWidget = (widgetId) => {
    const dynamicWidget = dynamicWidgets.find(w => w.id === widgetId);
    const defaultRows = dynamicWidget?.chartType === 'card' || widgetId === 'stats-overview' ? 1 : 2;
    const widgetSize = widgetSizes[widgetId] || { cols: 1, rows: defaultRows };
    
    const SizeSelector = () => {
      const isCardType = dynamicWidget?.chartType === 'card' || widgetId === 'stats-overview';
      const minRows = isCardType ? 1 : 2;
      
      return (
        <div style={{ position: 'relative' }}>
          <button 
            className={`widget-size-btn ${openSizePopup === widgetId ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setOpenSizePopup(openSizePopup === widgetId ? null : widgetId); }}
            onPointerDown={(e) => e.stopPropagation()}
            title="Adjust size"
          >
            <span className="material-symbols-outlined">auto_awesome_mosaic</span>
          </button>
          {openSizePopup === widgetId && (
            <div className="size-grid-popup" onPointerDown={(e) => e.stopPropagation()}>
              <div className="size-grid">
                {[1, 2, 3].map(row => 
                  [1, 2, 3].map(col => {
                    const isDisabled = row < minRows;
                    return (
                      <div
                        key={`${row}-${col}`}
                        className={`size-grid-cell ${widgetSize.cols >= col && widgetSize.rows >= row ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                        onClick={() => { if (!isDisabled) { setWidgetSize(widgetId, col, row); setOpenSizePopup(null); } }}
                        style={{ cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.3 : 1 }}
                      />
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      );
    };

    if (dynamicWidget) {
      return (
        <>
          <div className="grid-item-header">
            <h4 title={dynamicWidget.title}>{dynamicWidget.title}</h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <SizeSelector />
              <button
                onClick={(e) => { e.stopPropagation(); setEditingWidget(dynamicWidget); setIsModalOpen(true); }}
                className="edit-widget-btn"
                title="Edit widget"
              >
                {/* <i className="fa-solid fa-pen"></i> */}
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); togglePin(widgetId); }}
                className={`pin-btn ${pinnedWidgets.includes(widgetId) ? 'pinned' : ''}`}
              >
                <img src={Icons.pin} alt="" />
              </button>
              <span className='widget-close-btn' onClick={() => removeWidget(widgetId)}>×</span>
            </div>
          </div>
          <DynamicWidget widgetData={dynamicWidget} />
        </>
      );
    }

    switch (widgetId) {
      case 'project-carousel':
        return (
          <>
            <div className="grid-item-header">
              <h4 title="Project Recommendations">Freepool Project Recommendations</h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                <SizeSelector />
                <button
                  onClick={(e) => { e.stopPropagation(); togglePin(widgetId); }}
                  className={`pin-btn ${pinnedWidgets.includes(widgetId) ? 'pinned' : ''}`}
                >
                  <img src={Icons.pin} alt="" />
                </button>
                <span className='widget-close-btn' onClick={() => removeWidget(widgetId)}>×</span>
              </div>
            </div>
            <div style={{ height: 'calc(100% - 60px)', overflow: 'none', position: 'relative' }}>
              <ProjectCarousel openModal={openModal} />
            </div>
          </>
        );

      case 'stats-overview':
        return (
          <>
            <div className="grid-item-header">
              <h4 title="Stats Overview">Stats Overview</h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <SizeSelector />
                <button
                  onClick={(e) => { e.stopPropagation(); togglePin(widgetId); }}
                  className={`pin-btn ${pinnedWidgets.includes(widgetId) ? 'pinned' : ''}`}
                >
                  <img src={Icons.pin} alt="" />
                </button>
                <span className='widget-close-btn' onClick={() => removeWidget(widgetId)}>×</span>
              </div>
            </div>
            <StatsWidget
              employeeCount={employeeCount.employeeCount}
              projectCount={employeeCount.projectCount}
              freepoolCount={employeeCount.freepoolCount}
            />
          </>
        );

      case 'project-distribution':
        return (
          <>
            <div className="grid-item-header">
              <h4 title="Project Distribution">Project Distribution</h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <SizeSelector />
                <button
                  onClick={(e) => { e.stopPropagation(); togglePin(widgetId); }}
                  className={`pin-btn ${pinnedWidgets.includes(widgetId) ? 'pinned' : ''}`}
                >
                  <img src={Icons.pin} alt="" />
                </button>
                <span className='widget-close-btn' onClick={() => removeWidget(widgetId)}>×</span>
              </div>
            </div>
            {/* <span className="widget-subtitle">{projectDistribution.total_employees} Total employees</span> */}
            <div className="pie-chart-container">
              <div style={{ height: 'calc( 100% - 70px )', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <DoughnutChart data={projectDistribution.projects} total={projectDistribution.total_employees} />
              </div>
              <div className="chart-legend">
                {projectDistribution.projects.map((project, index) => {
                  const percentage = Math.round((project.employee_count / projectDistribution.total_employees) * 100);
                  const gradientColors = [
                    { start: '#667eea', end: '#764ba2' },
                    { start: '#f093fb', end: '#f5576c' },
                    { start: '#4facfe', end: '#00f2fe' },
                    { start: '#43e97b', end: '#38f9d7' },
                    { start: '#fa709a', end: '#fee140' }
                  ];
                  return (
                    <div key={project.project} className="modern-legend-item">
                      <div className="modern-legend-color" style={{ backgroundColor: gradientColors[index % gradientColors.length].start }} />
                      <span className="legend-text">{project.project}</span>
                      <span className="legend-percentage">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        );

      case 'department-overview':
        return (
          <>
            <div className="grid-item-header">
              <h4 title="Department Overview">Department Overview</h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <SizeSelector />
                <button
                  onClick={(e) => { e.stopPropagation(); togglePin(widgetId); }}
                  className={`pin-btn ${pinnedWidgets.includes(widgetId) ? 'pinned' : ''}`}
                >
                  <img src={Icons.pin} alt="" />
                </button>
                <span className='widget-close-btn' onClick={() => removeWidget(widgetId)}>×</span>
              </div>
            </div>
            <div className="widget-subtitle">
              <div className="subtitle-number">{departmentData.departments.reduce((sum, d) => sum + d.employee_count, 0)}</div>
              <div className="subtitle-text">Total employees</div>
            </div>
            <div className="progress-container" style={{ height: '250px' }}>
              <BarChart data={departmentData.departments.slice(0, 6)} />
            </div>
          </>
        );

      case 'employee-directory':
        const filteredEmployees = employeeDirectory.employees.filter(emp =>
          emp.display_name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
          emp.employee_department.toLowerCase().includes(employeeSearch.toLowerCase()) ||
          emp.designation.toLowerCase().includes(employeeSearch.toLowerCase()) ||
          emp.employee_id.toLowerCase().includes(employeeSearch.toLowerCase())
        );
        const startIndex = employeePage * employeesPerPage;
        const currentEmployees = filteredEmployees.slice(startIndex, startIndex + employeesPerPage);
        const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

        return (
          <>
            <div className="grid-item-header">
              <h4 title="Employee Directory">Employee Directory</h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <SizeSelector />
                <button
                  onClick={(e) => { e.stopPropagation(); togglePin(widgetId); }}
                  className={`pin-btn ${pinnedWidgets.includes(widgetId) ? 'pinned' : ''}`}
                >
                  <img src={Icons.pin} alt="" />
                </button>
                <span className='widget-close-btn' onClick={() => removeWidget(widgetId)}>×</span>
              </div>
            </div>
            <div className='d-flex align-center' style={{ marginBottom: '12px', gap: '8px' }}>
              <div className="search-input">
                {/* <AnimatedSearchInput */}
                <input
                  value={employeeSearch}
                  onChange={(e) => { setEmployeeSearch(e.target.value.replace(/\s+/g, ' ').trimStart()); setEmployeePage(0); }}
                  onClick={(e) => e.stopPropagation()}
                  className="employee-search-input"
                  />
                <i className="fa-solid fa-search"></i>
                {/* /> */}
              </div>
              {totalPages > 1 && (
                <div className="widget-pagination">
                  <button onClick={() => setEmployeePage(prev => Math.max(0, prev - 1))} disabled={employeePage === 0} className="widget-page-btn">‹</button>
                  <span className="page-info">{employeePage + 1}/{totalPages}</span>
                  <button onClick={() => setEmployeePage(prev => Math.min(totalPages - 1, prev + 1))} disabled={employeePage >= totalPages - 1} className="widget-page-btn">›</button>
                </div>
              )}
            </div>
            {/* <span className="widget-subtitle">{filteredEmployees.length} Employees</span> */}
            <div className="employee-directory-container">
              {currentEmployees.map((employee) => (
                <div 
                  key={employee.employee_id} 
                  className="employee-item"
                  onClick={() => openModal(employee.employee_id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="employee-avatar">{employee.display_name.charAt(0).toUpperCase()}</div>
                  <div className="employee-info">
                    <div className="employee-name">{employee.display_name}</div>
                    <div className="employee-meta">
                      <span className="employee-dept">{employee.employee_department}</span>
                      <span className="employee-dot">•</span>
                      <span className="employee-designation">{employee.designation}</span>
                    </div>
                    <div className="employee-location">
                      <i className="fa-solid fa-location-dot"></i>
                      {employee.emp_location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        );

      case 'available-employees': {

        // 1️⃣ Split Employees
        const freeEmployees = soonAvailableEmployees.filter(emp =>
          !emp.committed_relieving_date &&
          emp.projects?.some(p => p.project_name === "CLUD_FREE")
        );

        const releasingEmployees = soonAvailableEmployees
          .filter(emp => emp.committed_relieving_date)
          .sort((a, b) =>
            new Date(a.committed_relieving_date) -
            new Date(b.committed_relieving_date)
          );

        const dateGroups = [
          ...new Set(releasingEmployees.map(emp => emp.committed_relieving_date))
        ];

        // 2️⃣ Build Timeline Items (FREE first)
        const timelineItems = [
          ...(freeEmployees.length ? ["FREE"] : []),
          ...dateGroups
        ];

        // 3️⃣ Determine Employees for Selected Item
        let filteredEmployees = [];

        if (activeReleaseDate === "FREE") {
          filteredEmployees = freeEmployees;
        } else {
          filteredEmployees = releasingEmployees.filter(
            emp => emp.committed_relieving_date === activeReleaseDate
          );
        }

        return (
          <>
            <div className="grid-item-header">
              <h4 title="Available Timeline">Available Timeline</h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <SizeSelector />
                <button
                  onClick={(e) => { e.stopPropagation(); togglePin(widgetId); }}
                  className={`pin-btn ${pinnedWidgets.includes(widgetId) ? 'pinned' : ''}`}
                >
                  <img src={Icons.pin} alt="" />
                </button>
                <span className='widget-close-btn' onClick={() => removeWidget(widgetId)}>×</span>
              </div>
            </div>

            <div className="timeline-wrapper">

              {/* LEFT SIDE — CHRONOLOGICAL BAR */}
              <div className="timeline-bar" ref={timelineRef}>
                {timelineItems.map(item => {

                  const itemCount =
                    item === "FREE"
                      ? freeEmployees.length
                      : releasingEmployees.filter(
                        emp => emp.committed_relieving_date === item
                      ).length;

                  return (
                    <div
                      key={item}
                      className={`timeline-date-item ${activeReleaseDate === item ? 'active' : ''
                        }`}
                      onClick={() => setActiveReleaseDate(item)}
                    >
                      <span>
                        {item === "FREE"
                          ? "Free"
                          : new Date(item).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}
              </div>


              {/* RIGHT SIDE — EMPLOYEES */}
              <div className="timeline-content">
                {filteredEmployees.map(emp => {
                  const releaseDate = emp.committed_relieving_date
                    ? new Date(emp.committed_relieving_date)
                    : null;

                  const today = new Date();
                  const daysLeft = releaseDate
                    ? Math.ceil((releaseDate - today) / (1000 * 60 * 60 * 24))
                    : null;

                  return (
                    <div key={emp.employee_id} className="timeline-employee-card" onClick={() => openModal(emp.employee_id)} style={{ cursor: 'pointer' }}>
                      <div className="timeline-employee-name">
                        {emp.display_name}
                      </div>
                      <div className="timeline-employee-meta">
                        {emp.tech_group} • {emp.emp_location}
                      </div>
                      <div className="timeline-employee-projects">

                        {emp.projects.map(p => (
                          <span
                            key={p.project_id || p.project_name}
                            className="timeline-employee-project"
                          >
                            {p.project_name}
                          </span>
                        ))}
                      </div>

                      <div
                        className="timeline-employee-badge"
                        style={
                          activeReleaseDate === "FREE"
                            ? { background: "#dcfce7", color: "#166534" }
                            : {}
                        }
                      >
                        {activeReleaseDate === "FREE"
                          ? "Available Now"
                          : `${daysLeft} days remaining`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        );
      }

      case 'upskill-suggestions':
        return (
          <>
            <div className="grid-item-header">
              <h4 title="Upskill Suggestions">Upskill Suggestions</h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <SizeSelector />
                <button
                  onClick={(e) => { e.stopPropagation(); togglePin(widgetId); }}
                  className={`pin-btn ${pinnedWidgets.includes(widgetId) ? 'pinned' : ''}`}
                >
                  <img src={Icons.pin} alt="" />
                </button>
                <span className='widget-close-btn' onClick={() => removeWidget(widgetId)}>×</span>
              </div>
            </div>
            <div className="upskill-container">
              {upskillData.map((employee) => (
                <div key={employee.employee_id} className="upskill-employee-card">
                  <div className="upskill-employee-header" onClick={() => openModal(employee.employee_id)}>
                    <div className="upskill-employee-avatar">
                      {employee.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="upskill-employee-info">
                      <div className="upskill-employee-name">{employee.display_name}</div>
                      <div className="upskill-employee-meta">
                        <span className="upskill-tech-group">{employee.tech_group}</span>
                        <span className="upskill-dot">•</span>
                        <span className="upskill-seniority">{employee.seniority}</span>
                      </div>
                    </div>
                  </div>
                  <div className="upskill-suggestions">
                    {employee.upskill_suggestions.map((suggestion, index) => (
                      <div key={index} className="upskill-suggestion-item">
                        <div className="d-flex align-start justify-btwn">
                          <div className="upskill-skill-name">{suggestion.skill}</div>
                          <div className="upskill-duration">{suggestion.estimated_weeks} w</div>
                        </div>
                        <div className="upskill-reason">{suggestion.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        );







      default:
        return null;
    }
  };

  // Minimized view - Modern & Minimalistic Design
  if (!isExpanded && isExpanded !== null) {
    return (
      <div className="widget-panel-minimized">
        <div className="minimized-header">
          <h3>Dashboard</h3>
          <span className="expand-icon" onClick={onExpand}>
            <img src={Icons.expand} alt="Expand" />
          </span>
        </div>

        {/* <div className="minimized-stats-grid">
          <div className="mini-stat-card">
            <div className="stat-icon employees">
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{employeeCount.employeeCount || 0}</div>
              <div className="stat-label">Total Employees</div>
            </div>
          </div>
          
          <div className="mini-stat-card">
            <div className="stat-icon active">
              <i className="fa-solid fa-briefcase"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{employeeCount.projectCount || 0}</div>
              <div className="stat-label">Active Projects</div>
            </div>
          </div>
          
          <div className="mini-stat-card">
            <div className="stat-icon freepool">
              <i className="fa-solid fa-user-clock"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{employeeCount.freepoolCount || 0}</div>
              <div className="stat-label">In Freepool</div>
            </div>
          </div>
        </div> */}

        <div className="minimized-quick-actions">
          <h4>Quick Overview</h4>
          <div className="action-cards">
            <div className="action-card" onClick={onExpand}>
              <div className="action-icon">
                <i className="fa-solid fa-chart-pie"></i>
              </div>
              <div className="action-text">
                <div className="action-title">Projects</div>
                <div className="action-subtitle">View distribution</div>
              </div>
              <i className="fa-solid fa-chevron-right action-arrow"></i>
            </div>

            <div className="action-card" onClick={onExpand}>
              <div className="action-icon">
                <i className="fa-solid fa-building"></i>
              </div>
              <div className="action-text">
                <div className="action-title">Departments</div>
                <div className="action-subtitle">See overview</div>
              </div>
              <i className="fa-solid fa-chevron-right action-arrow"></i>
            </div>

            <div className="action-card" onClick={onExpand}>
              <div className="action-icon">
                <i className="fa-solid fa-address-book"></i>
              </div>
              <div className="action-text">
                <div className="action-title">Directory</div>
                <div className="action-subtitle">Browse employees</div>
              </div>
              <i className="fa-solid fa-chevron-right action-arrow"></i>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid-container`} data-expanded={isExpanded}>
      <Alert message="Maximum 5 widgets can be pinned" show={showAlert} type="warning" />
      {isLoading ? 
      (    
        <div className="loader" id="theme-loader">
        <div className="justify-content-center jimu-primary-loading"></div>
      </div>
      ) : (
       <>
        <div className="dashboard-header">
          <div className='welcome'>
            <div className='d-flex justify-btwn align-center'>
              <h2>Welcome back!</h2>
            </div>
            <p>Great talent awaits. Let's hire smart!</p>
          </div>

          <div className="stats">
            <div className="stat">
              <h3>{employeeCount.employeeCount || 0}</h3>
              <span>
                {/* <i className="fa-regular fa-user"></i> */}
                Total Employees
              </span>
            </div>
            <div className="stat">
              <h3>{employeeCount.projectCount || 0}</h3>
              <span>
                {/* <i className="fa-regular fa-eye"></i>  */}
                Projects
              </span>
            </div>
            <div className="stat">
              <h3>{employeeCount.freepoolCount || 0}</h3>
              <span>
                {/* <i className="fa-regular fa-circle-check"></i> */}
                Freepool
              </span>
            </div>
          </div>
        </div>
          
        <div className="dashboard-content" ref={containerRef}>
          <div className="filter-bar">
            <div className="filter-controls">
              <div className="search-input">
                <input
                  type="text"
                  placeholder="Search widgets..."
                  value={widgetSearch}
                  onChange={(e) => setWidgetSearch(e.target.value.replace(/\s+/g, ' ').trimStart())}
                />
                <i className="fa-solid fa-search"></i>
              </div>

              <div className="multi-select" ref={dropdownRef}>
                <div className="select-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <span className="placeholder">Select Widgets</span>
                  <i className="fa-solid fa-chevron-down"></i>
                </div>

                {isDropdownOpen && (
                  <div className="dropdown-menu show">
                    {availableWidgets.map(widget => (
                      <div key={widget.id} className="option">
                        <input
                          type="checkbox"
                          id={widget.id}
                          checked={selectedWidgets.includes(widget.id)}
                          onChange={() => toggleWidget(widget.id)}
                        />
                        <label htmlFor={widget.id}>{widget.label}</label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="actions">
              <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
                <span className='btn-content'>Create a Widget</span>                 
                <i className="fa-solid fa-wand-magic-sparkles"></i>            
              </button>
            </div>
          </div>
          
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={selectedWidgets} strategy={rectSortingStrategy}>
              {selectedWidgets.length === 0 ? (
                <div className="no-widgets-message">
                  <i className="fa-solid fa-chart-line"></i>
                  <h3>No Widgets Selected</h3>
                  <p>Select widgets from the dropdown above or create a new custom widget to get started</p>
                </div>
              ) : (
                <>
                  {/* Pinned Widgets Row */}
                  {pinnedWidgets.length > 0 && (
                    <div className="widgets-grid">
                      {selectedWidgets
                        .filter(widgetId => {
                          const widget = availableWidgets.find(w => w.id === widgetId);
                          const dynamicWidget = dynamicWidgets.find(w => w.id === widgetId);
                          const label = widget?.label || dynamicWidget?.title || '';
                          return pinnedWidgets.includes(widgetId) && label.toLowerCase().includes(widgetSearch.toLowerCase());
                        })
                        .map(widgetId => (
                          <SortableWidget key={widgetId} id={widgetId} isPinned={true} widgetSize={widgetSizes[widgetId]}>
                            {renderWidget(widgetId)}
                          </SortableWidget>
                        ))}
                    </div>
                  )}

                  {/* Unpinned Widgets Grid */}
                  <div className="widgets-grid">
                    {selectedWidgets
                      .filter(widgetId => {
                        const widget = availableWidgets.find(w => w.id === widgetId);
                        const dynamicWidget = dynamicWidgets.find(w => w.id === widgetId);
                        const label = widget?.label || dynamicWidget?.title || '';
                        return !pinnedWidgets.includes(widgetId) && label.toLowerCase().includes(widgetSearch.toLowerCase());
                      })
                      .map(widgetId => (
                        <SortableWidget key={widgetId} id={widgetId} isPinned={false} widgetSize={widgetSizes[widgetId]}>
                          {renderWidget(widgetId)}
                        </SortableWidget>
                      ))}
                  </div>
                </>
              )}
            </SortableContext>
          </DndContext>
        </div>
       </>
      )
    }

      <CreateWidgetModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingWidget(null); }}
        editingWidget={editingWidget}
        onGenerate={(widgetData, prompt) => {
          if (editingWidget) {
            setDynamicWidgets(prev => prev.map(w => w.id === editingWidget.id ? { ...w, ...widgetData, prompt } : w));
            // Center the edited widget
            setTimeout(() => {
              const widgetElement = document.querySelector(`[data-widget-id="${editingWidget.id}"]`);
              if (widgetElement) {
                widgetElement.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'center',
                  inline: 'center'
                });
              }
            }, 200);
          } else {
            const newWidget = { id: `dynamic-${Date.now()}`, ...widgetData, prompt };
            const defaultRows = widgetData.chartType === 'card' ? 1 : 2;
            setDynamicWidgets(prev => [newWidget, ...prev]);
            setSelectedWidgets(prev => [newWidget.id, ...prev]);
            setWidgetSizes(prev => ({ ...prev, [newWidget.id]: { cols: 1, rows: defaultRows } }));
            
            // Auto-center the newly created widget
            setTimeout(() => {
              const widgetElement = document.querySelector(`[data-widget-id="${newWidget.id}"]`);
              if (widgetElement) {
                widgetElement.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'center',
                  inline: 'center'
                });
              }
            }, 200);
          }
          setIsModalOpen(false);
          setEditingWidget(null);
        }}
      />

      <ConfirmationModal />
      
      <CandidateProfileModal
        isOpen={isOpen}
        onClose={closeModal}
        employee={employee}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default WidgetPanel;