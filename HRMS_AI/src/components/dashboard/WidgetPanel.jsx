import React, { useState, useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./WidgetPanel.css";
import { Icons } from "../../assets/icons";
import {
  getProjectDistributions,
  getEmployeeDirectory,
  getEmployeeCount,
  getDepartment,
  getSoonAvailableEmployees,
  getFreepoolProjectSuggestions,
} from "../../services/api";
import Alert from "../common/Alert";
import { useToast } from "../../context/ToastContext";
import DoughnutChart from "./charts/DoughnutChart";
import BarChart from "./charts/BarChart";
import CreateWidgetModal from "./CreateWidgetModal";
import AddStatsModal from "./AddStatsModal";
import DynamicWidget from "./DynamicWidget";
import AnimatedSearchInput from "./AnimatedSearchInput";
import StatsWidget from "./StatsWidget";
import useConfirmation from "../common/useConfirmation";
import CandidateProfileModal from "../CandidateProfileModal";
import { useCandidateProfileModal } from "../../hooks/useCandidateProfileModal";
import ProjectCarousel from "./ProjectCarousel";
import WorldMapWidget from "./WorldMapWidget";
import LowOccupancyWidget from "./LowOccupancyWidget";
import DeploymentCountWidget from "./DeploymentCountWidget";
import DeploymentTechGroupWidget from "./DeploymentTechGroupWidget";
import "./LowOccupancyWidget.css";

const SortableWidget = ({ id, children, isPinned, widgetSize }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const itemRef = useRef(null);

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : "auto",
    gridColumn: widgetSize?.cols ? `span ${widgetSize.cols}` : "span 1",
    gridRow: widgetSize?.rows ? `span ${widgetSize.rows}` : "auto",
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        itemRef.current = node;
      }}
      style={style}
      {...attributes}
      {...listeners}
      className={`masonry-item ${isPinned ? "pinned" : ""}`}
      data-widget-id={id}
    >
      {children}
    </div>
  );
};

const WidgetPanel = ({ isExpanded, onExpand, onClose }) => {
  const { confirm, ConfirmationModal } = useConfirmation();
  const { isOpen, employee, loading, error, openModal, closeModal } =
    useCandidateProfileModal();
  const { showWarning } = useToast();
  const [selectedWidgets, setSelectedWidgets] = useState(() => {
    const saved = localStorage.getItem("selectedWidgets");
    return saved
      ? JSON.parse(saved)
      : [
          "project-carousel",
          "project-distribution",
          "department-overview",
          "employee-directory",
          "available-employees",
          "world-map",
        ];
  });
  const [previousSelectedWidgets, setPreviousSelectedWidgets] = useState([]);
  const [pinnedWidgets, setPinnedWidgets] = useState(() => {
    const saved = localStorage.getItem("pinnedWidgets");
    return saved ? JSON.parse(saved) : [];
  });
  const [dynamicWidgets, setDynamicWidgets] = useState(() => {
    const saved = localStorage.getItem("dynamicWidgets");
    return saved ? JSON.parse(saved) : [];
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);

  const [projectDistribution, setProjectDistribution] = useState({
    projects: [],
    total_employees: 0,
  });
  const [departmentData, setDepartmentData] = useState({ departments: [] });
  const [employeeDirectory, setEmployeeDirectory] = useState({ employees: [] });
  const [employeeCount, setEmployeeCount] = useState({
    employeeCount: 0,
    freepoolCount: 0,
    projectCount: 0,
  });
  const [employeePage, setEmployeePage] = useState(0);
  const [soonAvailableEmployees, setSoonAvailableEmployees] = useState([]);
  const [freepoolProjectSuggestions, setFreepoolProjectSuggestions] = useState(
    [],
  );
  const [upSkillProjectSuggestions, setFreepoolUpSkillProjectSuggestions] =
    useState([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [widgetSearch, setWidgetSearch] = useState("");
  const [containerWidth, setContainerWidth] = useState(1200);
  const [activeReleaseDate, setActiveReleaseDate] = useState(null);
  const [customStats, setCustomStats] = useState(() => {
    const saved = localStorage.getItem("customStats");
    return saved ? JSON.parse(saved) : [];
  });
  const [gridColumns, setGridColumns] = useState(() => {
    const saved = localStorage.getItem("gridColumns");
    return saved ? parseInt(saved) : 3;
  });
  const [widgetSizes, setWidgetSizes] = useState(() => {
    const saved = localStorage.getItem("widgetSizes");
    return saved ? JSON.parse(saved) : {};
  });
  const [openSizePopup, setOpenSizePopup] = useState(null);
  const timelineRef = useRef(null);
  const containerRef = useRef(null);
  const upskillScrollRef = useRef(null);
  const upskillIntervalRef = useRef(null);
  const [isUpskillHovered, setIsUpskillHovered] = useState(false);
  const employeesPerPage = 10;

  const availableWidgets = [
    { id: "stats-overview", label: "Stats Overview" },
    { id: "deployment-count", label: "Deployment Overview" },
    { id: "project-carousel", label: "Freepool Project Recommendations" },
    { id: "project-distribution", label: "Project Distribution" },
    { id: "department-overview", label: "Department Overview" },
    { id: "employee-directory", label: "Employee Directory" },
    { id: "available-employees", label: "Available Employees" },
    { id: "upskill-suggestions", label: "Upskill Suggestions" },
    { id: "world-map", label: "Global Employee Distribution" },
    {
      id: "low-occupancy-employees",
      label: "Low Occupancy Long-term Employees",
    },
    {
      id: "deployment-techgroup-employees",
      label: "Resource by Deployment & Tech Group",
    },
  ];

  useEffect(() => {
    const startAutoScroll = () => {
      if (
        upskillScrollRef.current &&
        !isUpskillHovered &&
        selectedWidgets.includes("upskill-suggestions")
      ) {
        const container = upskillScrollRef.current;
        const cards = container.querySelectorAll(".upskill-employee-card");

        if (cards.length > 0) {
          const currentScroll = container.scrollTop;
          const containerHeight = container.clientHeight;
          const scrollHeight = container.scrollHeight;

          console.log("Scroll info:", {
            currentScroll,
            containerHeight,
            scrollHeight,
            canScroll: scrollHeight > containerHeight,
          });

          // If we can't scroll (content fits in container), don't do anything
          if (scrollHeight <= containerHeight) {
            console.log("Content fits in container, no scrolling needed");
            return;
          }

          // Check if we've reached the bottom, scroll to top
          if (currentScroll + containerHeight >= scrollHeight - 10) {
            console.log("Reached bottom, scrolling to top");
            container.scrollTo({ top: 0, behavior: "smooth" });
            return;
          }

          // Find the next card to scroll to
          let nextCard = null;
          const containerCenter = currentScroll + containerHeight / 2;

          for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const cardTop = card.offsetTop;
            const cardBottom = cardTop + card.offsetHeight;
            const cardCenter = cardTop + card.offsetHeight / 2;

            // If this card's center is below the current viewport center, scroll to it
            if (cardCenter > containerCenter + 50) {
              // 50px threshold
              nextCard = card;
              break;
            }
          }

          // If no next card found, we're at the end, scroll to top
          if (!nextCard) {
            console.log("No next card found, scrolling to top");
            container.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            // Scroll to center the next card
            const cardTop = nextCard.offsetTop;
            const cardHeight = nextCard.offsetHeight;
            const targetScroll = cardTop + cardHeight / 2 - containerHeight / 2;
            console.log("Scrolling to next card:", { cardTop, targetScroll });
            container.scrollTo({
              top: Math.max(0, targetScroll),
              behavior: "smooth",
            });
          }
        }
      }
    };

    let intervalId = null;
    if (selectedWidgets.includes("upskill-suggestions")) {
      console.log("Setting up auto-scroll interval");
      intervalId = setInterval(startAutoScroll, 5000);
      upskillIntervalRef.current = intervalId;
    }

    return () => {
      if (intervalId) {
        console.log("Clearing auto-scroll interval");
        clearInterval(intervalId);
      }
      if (upskillIntervalRef.current) {
        clearInterval(upskillIntervalRef.current);
        upskillIntervalRef.current = null;
      }
    };
  }, [isUpskillHovered, selectedWidgets]);

  useEffect(() => {
    const initializeWidgetSizes = () => {
      const updatedSizes = { ...widgetSizes };
      let hasChanges = false;

      availableWidgets.forEach((widget) => {
        if (!updatedSizes[widget.id]) {
          let defaultRows = 2;
          let defaultCols = 1;
          if (
            widget.id === "stats-overview" ||
            widget.id === "deployment-count"
          )
            defaultRows = 1;
          if (widget.id === "project-carousel") {
            defaultRows = 3;
            defaultCols = 2;
          }
          if (
            widget.id === "employee-directory" ||
            widget.id === "available-employees" ||
            widget.id === "upskill-suggestions" ||
            widget.id === "low-occupancy-employees"
          )
            defaultRows = 3;
          if (widget.id === "world-map") {
            defaultRows = 2;
            defaultCols = 1;
          }

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
    localStorage.setItem("selectedWidgets", JSON.stringify(selectedWidgets));
  }, [selectedWidgets]);

  useEffect(() => {
    localStorage.setItem("dynamicWidgets", JSON.stringify(dynamicWidgets));
  }, [dynamicWidgets]);

  useEffect(() => {
    localStorage.setItem("pinnedWidgets", JSON.stringify(pinnedWidgets));
  }, [pinnedWidgets]);

  useEffect(() => {
    localStorage.setItem("gridColumns", gridColumns.toString());
  }, [gridColumns]);

  useEffect(() => {
    localStorage.setItem("widgetSizes", JSON.stringify(widgetSizes));
  }, [widgetSizes]);

  useEffect(() => {
    localStorage.setItem("customStats", JSON.stringify(customStats));
  }, [customStats]);

  const handleAddStat = (newStat) => {
    setCustomStats(() => {
      const existingStat = localStorage.getItem("customStats");
      const parsedStats = existingStat ? JSON.parse(existingStat) : [];
      const updated = [...parsedStats, newStat];
      localStorage.setItem("customStats", JSON.stringify(updated));
      // Trigger custom event to refresh StatsWidget
      window.dispatchEvent(new Event("statsUpdated"));
      return updated;
    });
  };

  const setWidgetSize = (widgetId, cols, rows) => {
    setWidgetSizes((prev) => ({ ...prev, [widgetId]: { cols, rows } }));
    setTimeout(() => {
      const widgetElement = document.querySelector(
        `[data-widget-id="${widgetId}"]`,
      );
      if (widgetElement) {
        widgetElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 100);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const apiCalls = [];

        // Only call APIs for widgets that are actually selected
        if (selectedWidgets.includes("project-distribution")) {
          apiCalls.push(
            getProjectDistributions().then((data) => ({
              type: "projects",
              data,
            })),
          );
        }
        if (selectedWidgets.includes("department-overview")) {
          apiCalls.push(
            getDepartment().then((data) => ({ type: "departments", data })),
          );
        }
        if (selectedWidgets.includes("employee-directory")) {
          apiCalls.push(
            getEmployeeDirectory().then((data) => ({
              type: "employees",
              data,
            })),
          );
        }
        if (selectedWidgets.includes("available-employees")) {
          apiCalls.push(
            getSoonAvailableEmployees().then((data) => ({
              type: "availableEmployees",
              data,
            })),
          );
        }
        if (
          selectedWidgets.includes("project-carousel") ||
          selectedWidgets.includes("upskill-suggestions")
        ) {
          apiCalls.push(
            getFreepoolProjectSuggestions().then((data) => ({
              type: "aiSuggestions",
              data,
            })),
          );
        }

        // Always fetch counts for header stats
        apiCalls.push(
          getEmployeeCount().then((data) => ({ type: "counts", data })),
        );

        const results = await Promise.all(apiCalls);
        setIsLoading(false);

        // Process results
        results.forEach((result) => {
          switch (result.type) {
            case "projects":
              setProjectDistribution({
                projects: result.data.projects,
                total_employees: result.data.total_employees,
              });
              break;
            case "departments":
              setDepartmentData({ departments: result.data.departments });
              break;
            case "employees":
              setEmployeeDirectory({ employees: result.data.employees });
              break;
            case "availableEmployees":
              setSoonAvailableEmployees(result.data?.data || []);
              if (result.data?.data?.length) {
                const sorted = [...result.data.data]
                  .filter((emp) => emp.committed_relieving_date)
                  .sort(
                    (a, b) =>
                      new Date(a.committed_relieving_date) -
                      new Date(b.committed_relieving_date),
                  );
                setActiveReleaseDate(sorted[0]?.committed_relieving_date);
              }
              break;
            case "aiSuggestions":
              setFreepoolUpSkillProjectSuggestions(
                result.data.upskill_suggestions,
              );
              setFreepoolProjectSuggestions(result.data.project_suggestions);
              break;
            case "counts":
              setEmployeeCount({
                employeeCount: result.data.employee_count || 0,
                projectCount: result.data.project_count || 0,
                freepoolCount: result.data.freepool_count || 0,
              });
              break;
          }
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    // Initial load - fetch all selected widgets
    if (
      (isExpanded || isExpanded === null) &&
      previousSelectedWidgets.length === 0
    ) {
      fetchData();
      setPreviousSelectedWidgets(selectedWidgets);
    }

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    if (isExpanded || isExpanded === null) {
      updateWidth();
      window.addEventListener("resize", updateWidth);
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        !event.target.closest(".size-grid-popup") &&
        !event.target.closest(".widget-size-btn")
      ) {
        setOpenSizePopup(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", updateWidth);
      // Cleanup upskill auto-scroll interval
      if (upskillIntervalRef.current) {
        clearInterval(upskillIntervalRef.current);
      }
    };
  }, [isExpanded]);

  // Separate effect to handle widget changes
  useEffect(() => {
    const fetchNewWidgetData = async (newWidgetId) => {
      try {
        let apiCall = null;

        switch (newWidgetId) {
          case "project-distribution":
            apiCall = getProjectDistributions().then((data) => {
              setProjectDistribution({
                projects: data.projects,
                total_employees: data.total_employees,
              });
            });
            break;
          case "department-overview":
            apiCall = getDepartment().then((data) => {
              setDepartmentData({ departments: data.departments });
            });
            break;
          case "employee-directory":
            apiCall = getEmployeeDirectory().then((data) => {
              setEmployeeDirectory({ employees: data.employees });
            });
            break;
          case "available-employees":
            apiCall = getSoonAvailableEmployees().then((data) => {
              setSoonAvailableEmployees(data?.data || []);
              if (data?.data?.length) {
                const sorted = [...data.data]
                  .filter((emp) => emp.committed_relieving_date)
                  .sort(
                    (a, b) =>
                      new Date(a.committed_relieving_date) -
                      new Date(b.committed_relieving_date),
                  );
                setActiveReleaseDate(sorted[0]?.committed_relieving_date);
              }
            });
            break;
          case "project-carousel":
          case "upskill-suggestions":
            // Only call if we don't already have the data
            if (
              freepoolProjectSuggestions.length === 0 &&
              upSkillProjectSuggestions.length === 0
            ) {
              apiCall = getFreepoolProjectSuggestions().then((data) => {
                setFreepoolUpSkillProjectSuggestions(data.upskill_suggestions);
                setFreepoolProjectSuggestions(data.project_suggestions);
              });
            }
            break;
        }

        if (apiCall) {
          await apiCall;
        }
      } catch (error) {
        console.error(`Error fetching data for widget ${newWidgetId}:`, error);
      }
    };

    // Detect newly added widgets
    if (previousSelectedWidgets.length > 0) {
      const addedWidgets = selectedWidgets.filter(
        (widget) => !previousSelectedWidgets.includes(widget),
      );

      if (addedWidgets.length > 0) {
        addedWidgets.forEach((widgetId) => {
          fetchNewWidgetData(widgetId);
        });
      }
    }

    setPreviousSelectedWidgets(selectedWidgets);
  }, [selectedWidgets]);

  const toggleWidget = (widgetId) => {
    if (selectedWidgets.includes(widgetId)) {
      setSelectedWidgets((prev) => prev.filter((id) => id !== widgetId));
    } else {
      setSelectedWidgets((prev) => [widgetId, ...prev]);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
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
    if (id.startsWith("dynamic-")) {
      const confirmed = await confirm({
        title: "Remove Widget",
        message:
          "Are you sure you want to remove this widget? This action cannot be undone.",
      });

      if (!confirmed) return;
    }

    setSelectedWidgets((prev) => prev.filter((widgetId) => widgetId !== id));
    setPinnedWidgets((prev) => prev.filter((widgetId) => widgetId !== id));
    if (id.startsWith("dynamic-")) {
      setDynamicWidgets((prev) => prev.filter((w) => w.id !== id));
    }
  };

  const togglePin = (id) => {
    setPinnedWidgets((prev) => {
      if (prev.includes(id)) {
        return prev.filter((widgetId) => widgetId !== id);
      } else if (prev.length >= 3) {
        showWarning("Maximum 3 widgets can be pinned.");
        return prev;
      } else {
        // Auto-center the widget when pinned
        setTimeout(() => {
          const widgetElement = document.querySelector(
            `[data-widget-id="${id}"]`,
          );
          if (widgetElement) {
            widgetElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "center",
            });
          }
        }, 100);
        return [...prev, id];
      }
    });
  };

  const renderWidget = (widgetId) => {
    const dynamicWidget = dynamicWidgets.find((w) => w.id === widgetId);
    const defaultRows =
      dynamicWidget?.chartType === "card" || widgetId === "stats-overview"
        ? 1
        : 2;
    const widgetSize = widgetSizes[widgetId] || { cols: 1, rows: defaultRows };

    const SizeSelector = () => {
      const isCardType =
        dynamicWidget?.chartType === "card" || widgetId === "stats-overview";
      const minRows = isCardType ? 1 : 2;

      return (
        <div style={{ position: "relative" }}>
          <button
            className={`widget-size-btn ${openSizePopup === widgetId ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpenSizePopup(openSizePopup === widgetId ? null : widgetId);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            title="Adjust size"
          >
            <span className="material-symbols-outlined">
              auto_awesome_mosaic
            </span>
          </button>
          {openSizePopup === widgetId && (
            <div
              className="size-grid-popup"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="size-grid">
                {[1, 2, 3].map((row) =>
                  [1, 2, 3].map((col) => {
                    const isDisabled = row < minRows;
                    return (
                      <div
                        key={`${row}-${col}`}
                        className={`size-grid-cell ${widgetSize.cols >= col && widgetSize.rows >= row ? "selected" : ""} ${isDisabled ? "disabled" : ""}`}
                        onClick={() => {
                          if (!isDisabled) {
                            setWidgetSize(widgetId, col, row);
                            setOpenSizePopup(null);
                          }
                        }}
                        style={{
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          opacity: isDisabled ? 0.3 : 1,
                        }}
                      />
                    );
                  }),
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
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <SizeSelector />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingWidget(dynamicWidget);
                  setIsModalOpen(true);
                }}
                className="edit-widget-btn"
                title="Edit widget"
              >
                {/* <i className="fa-solid fa-pen"></i> */}
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePin(widgetId);
                }}
                className={`pin-btn ${pinnedWidgets.includes(widgetId) ? "pinned" : ""}`}
              >
                <img src={Icons.pin} alt="" />
              </button>
              <span
                className="widget-close-btn"
                onClick={() => removeWidget(widgetId)}
              >
                ×
              </span>
            </div>
          </div>
          <DynamicWidget widgetData={dynamicWidget} />
        </>
      );
    }

    switch (widgetId) {
      case "project-carousel":
        return (
          <>
            <div className="grid-item-header">
              <h4 title="Project Recommendations">
                Freepool Project Recommendations
              </h4>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SizeSelector />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(widgetId);
                  }}
                  className={`pin-btn ${pinnedWidgets.includes(widgetId) ? "pinned" : ""}`}
                >
                  <img src={Icons.pin} alt="" />
                </button>
                <span
                  className="widget-close-btn"
                  onClick={() => removeWidget(widgetId)}
                >
                  ×
                </span>
              </div>
            </div>
            <div
              style={{
                height: "calc(100% - 60px)",
                overflow: "none",
                position: "relative",
              }}
            >
              <ProjectCarousel
                openModal={openModal}
                projectsData={freepoolProjectSuggestions || []}
              />
            </div>
          </>
        );

      case "stats-overview":
        return (
          <>
            <div className="grid-item-header">
              <h4 title="Stats Overview">Stats Overview</h4>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <SizeSelector />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(widgetId);
                  }}
                  className={`pin-btn ${pinnedWidgets.includes(widgetId) ? "pinned" : ""}`}
                >
                  <img src={Icons.pin} alt="" />
                </button>
                <span
                  className="widget-close-btn"
                  onClick={() => removeWidget(widgetId)}
                >
                  ×
                </span>
              </div>
            </div>
            <StatsWidget
              employeeCount={employeeCount.employeeCount}
              projectCount={employeeCount.projectCount}
              freepoolCount={employeeCount.freepoolCount}
              onOpenAddModal={() => setIsStatsModalOpen(true)}
            />
          </>
        );

      case "project-distribution":
        return (
          <>
            <div className="grid-item-header">
              <h4 title="Project Distribution">Project Distribution</h4>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <SizeSelector />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(widgetId);
                  }}
                  className={`pin-btn ${pinnedWidgets.includes(widgetId) ? "pinned" : ""}`}
                >
                  <img src={Icons.pin} alt="" />
                </button>
                <span
                  className="widget-close-btn"
                  onClick={() => removeWidget(widgetId)}
                >
                  ×
                </span>
              </div>
            </div>
            {/* <span className="widget-subtitle">{projectDistribution.total_employees} Total employees</span> */}
            <div className="pie-chart-container">
              <div
                style={{
                  height: "calc( 100% - 70px )",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <DoughnutChart
                  data={projectDistribution.projects}
                  total={projectDistribution.total_employees}
                />
              </div>
              <div className="chart-legend">
                {projectDistribution.projects.map((project, index) => {
                  const percentage = Math.round(
                    (project.employee_count /
                      projectDistribution.total_employees) *
                      100,
                  );
                  const gradientColors = [
                    { start: "#667eea", end: "#764ba2" },
                    { start: "#f093fb", end: "#f5576c" },
                    { start: "#4facfe", end: "#00f2fe" },
                    { start: "#43e97b", end: "#38f9d7" },
                    { start: "#fa709a", end: "#fee140" },
                  ];
                  return (
                    <div key={project.project} className="modern-legend-item">
                      <div
                        className="modern-legend-color"
                        style={{
                          backgroundColor:
                            gradientColors[index % gradientColors.length].start,
                        }}
                      />
                      <span className="legend-text">{project.project}</span>
                      <span className="legend-percentage">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        );

      case "department-overview":
        return (
          <>
            <div className="grid-item-header">
              <h4 title="Department Overview">Department Overview</h4>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <SizeSelector />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(widgetId);
                  }}
                  className={`pin-btn ${pinnedWidgets.includes(widgetId) ? "pinned" : ""}`}
                >
                  <img src={Icons.pin} alt="" />
                </button>
                <span
                  className="widget-close-btn"
                  onClick={() => removeWidget(widgetId)}
                >
                  ×
                </span>
              </div>
            </div>
            <div className="widget-subtitle">
              <div className="subtitle-number">
                {departmentData.departments.reduce(
                  (sum, d) => sum + d.employee_count,
                  0,
                )}
              </div>
              <div className="subtitle-text">Total employees</div>
            </div>
            <div className="progress-container" style={{ height: "250px" }}>
              <BarChart data={departmentData.departments.slice(0, 6)} />
            </div>
          </>
        );

      case "employee-directory":
        const filteredEmployees = employeeDirectory.employees.filter(
          (emp) =>
            emp.display_name
              .toLowerCase()
              .includes(employeeSearch.toLowerCase()) ||
            emp.employee_department
              .toLowerCase()
              .includes(employeeSearch.toLowerCase()) ||
            emp.designation
              .toLowerCase()
              .includes(employeeSearch.toLowerCase()) ||
            emp.employee_id
              .toLowerCase()
              .includes(employeeSearch.toLowerCase()),
        );
        const startIndex = employeePage * employeesPerPage;
        const currentEmployees = filteredEmployees.slice(
          startIndex,
          startIndex + employeesPerPage,
        );
        const totalPages = Math.ceil(
          filteredEmployees.length / employeesPerPage,
        );

        return (
          <>
            <div className="grid-item-header">
              <h4 title="Employee Directory">Employee Directory</h4>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <SizeSelector />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(widgetId);
                  }}
                  className={`pin-btn ${pinnedWidgets.includes(widgetId) ? "pinned" : ""}`}
                >
                  <img src={Icons.pin} alt="" />
                </button>
                <span
                  className="widget-close-btn"
                  onClick={() => removeWidget(widgetId)}
                >
                  ×
                </span>
              </div>
            </div>
            <div
              className="d-flex align-center"
              style={{ marginBottom: "12px", gap: "8px" }}
            >
              <div className="search-input">
                {/* <AnimatedSearchInput */}
                <i className="fa-solid fa-search"></i>
                <input
                  value={employeeSearch}
                  onChange={(e) => {
                    setEmployeeSearch(
                      e.target.value.replace(/\s+/g, " ").trimStart(),
                    );
                    setEmployeePage(0);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="employee-search-input"
                />
                {/* /> */}
              </div>
              {totalPages > 1 && (
                <div className="widget-pagination">
                  <button
                    onClick={() =>
                      setEmployeePage((prev) => Math.max(0, prev - 1))
                    }
                    disabled={employeePage === 0}
                    className="widget-page-btn"
                  >
                    ‹
                  </button>
                  <span className="page-info">
                    {employeePage + 1}/{totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setEmployeePage((prev) =>
                        Math.min(totalPages - 1, prev + 1),
                      )
                    }
                    disabled={employeePage >= totalPages - 1}
                    className="widget-page-btn"
                  >
                    ›
                  </button>
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
                  style={{ cursor: "pointer" }}
                >
                  <div className="employee-avatar">
                    {employee.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="employee-info">
                    <div className="employee-name">{employee.display_name}</div>
                    <div className="employee-meta">
                      <span className="employee-dept">
                        {employee.employee_department}
                      </span>
                      <span className="employee-dot">•</span>
                      <span className="employee-designation">
                        {employee.designation}
                      </span>
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

      case "available-employees": {
        // 1️⃣ Split Employees
        const freeEmployees = soonAvailableEmployees.filter(
          (emp) =>
            !emp.committed_relieving_date &&
            emp.projects?.some((p) => p.project_name === "CLUD_FREE"),
        );

        const releasingEmployees = soonAvailableEmployees
          .filter((emp) => emp.committed_relieving_date)
          .sort(
            (a, b) =>
              new Date(a.committed_relieving_date) -
              new Date(b.committed_relieving_date),
          );

        const dateGroups = [
          ...new Set(
            releasingEmployees.map((emp) => emp.committed_relieving_date),
          ),
        ];

        // 2️⃣ Build Timeline Items (FREE first)
        const timelineItems = [
          ...(freeEmployees.length ? ["FREE"] : []),
          ...dateGroups,
        ];

        // 3️⃣ Determine Employees for Selected Item
        let filteredEmployees = [];

        if (activeReleaseDate === "FREE") {
          filteredEmployees = freeEmployees;
        } else {
          filteredEmployees = releasingEmployees.filter(
            (emp) => emp.committed_relieving_date === activeReleaseDate,
          );
        }

        return (
          <>
            <div className="grid-item-header">
              <h4 title="Available Timeline">Available Timeline</h4>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <SizeSelector />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(widgetId);
                  }}
                  className={`pin-btn ${pinnedWidgets.includes(widgetId) ? "pinned" : ""}`}
                >
                  <img src={Icons.pin} alt="" />
                </button>
                <span
                  className="widget-close-btn"
                  onClick={() => removeWidget(widgetId)}
                >
                  ×
                </span>
              </div>
            </div>

            <div className="timeline-wrapper">
              {/* LEFT SIDE — CHRONOLOGICAL BAR */}
              <div className="timeline-bar" ref={timelineRef}>
                {timelineItems.map((item) => {
                  const itemCount =
                    item === "FREE"
                      ? freeEmployees.length
                      : releasingEmployees.filter(
                          (emp) => emp.committed_relieving_date === item,
                        ).length;

                  return (
                    <div
                      key={item}
                      className={`timeline-date-item ${
                        activeReleaseDate === item ? "active" : ""
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
                {filteredEmployees.map((emp) => {
                  const releaseDate = emp.committed_relieving_date
                    ? new Date(emp.committed_relieving_date)
                    : null;

                  const today = new Date();
                  const daysLeft = releaseDate
                    ? Math.ceil((releaseDate - today) / (1000 * 60 * 60 * 24))
                    : null;

                  return (
                    <div
                      key={emp.employee_id}
                      className="timeline-employee-card"
                      onClick={() => openModal(emp.employee_id)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="timeline-employee-name">
                        {emp.display_name}
                      </div>
                      <div className="timeline-employee-meta">
                        {emp.tech_group} • {emp.emp_location}
                      </div>
                      <div className="timeline-employee-projects">
                        {emp.projects.map((p) => (
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

      case "upskill-suggestions":
        return (
          <>
            <div className="grid-item-header">
              <h4 title="Upskill Suggestions">Upskill Suggestions</h4>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <SizeSelector />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(widgetId);
                  }}
                  className={`pin-btn ${pinnedWidgets.includes(widgetId) ? "pinned" : ""}`}
                >
                  <img src={Icons.pin} alt="" />
                </button>
                <span
                  className="widget-close-btn"
                  onClick={() => removeWidget(widgetId)}
                >
                  ×
                </span>
              </div>
            </div>
            <div
              className="upskill-container"
              ref={upskillScrollRef}
              onMouseEnter={() => setIsUpskillHovered(true)}
              onMouseLeave={() => setIsUpskillHovered(false)}
            >
              {upSkillProjectSuggestions &&
                upSkillProjectSuggestions.map((employee) => (
                  <div
                    key={employee.employee_id}
                    className="upskill-employee-card"
                  >
                    <div
                      className="upskill-employee-header"
                      onClick={() => openModal(employee.employee_id)}
                    >
                      <div className="upskill-employee-avatar">
                        {employee.display_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="upskill-employee-info">
                        <div className="upskill-employee-name">
                          {employee.display_name}
                        </div>
                        <div className="upskill-employee-meta">
                          <span className="upskill-tech-group">
                            {employee.tech_group}
                          </span>
                          <span className="upskill-seniority">
                            {employee.designation}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="upskill-suggestions">
                      {employee.upskill_suggestions.map((suggestion, index) => (
                        <div key={index} className="upskill-suggestion-item">
                          <div className="d-flex align-start justify-btwn">
                            <div className="upskill-skill-name">
                              {suggestion.skill}
                            </div>
                            <div className="upskill-duration">
                              {suggestion.estimated_weeks} w
                            </div>
                          </div>
                          <div className="upskill-reason">
                            {suggestion.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </>
        );

      case "world-map":
        return (
          <>
            <div className="grid-item-header">
              <h4 title="Global Employee Distribution">
                Global Employee Distribution
              </h4>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <SizeSelector />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(widgetId);
                  }}
                  className={`pin-btn ${pinnedWidgets.includes(widgetId) ? "pinned" : ""}`}
                >
                  <img src={Icons.pin} alt="" />
                </button>
                <span
                  className="widget-close-btn"
                  onClick={() => removeWidget(widgetId)}
                >
                  ×
                </span>
              </div>
            </div>
            <div
              style={{
                height: "calc(100% - 45px)",
                overflow: "hidden",
                backgroundColor: "var(--color-bg-dashboard)",
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <WorldMapWidget />
            </div>
          </>
        );

      case "low-occupancy-employees":
        return (
          <>
            <div className="grid-item-header">
              <h4 title="Low Occupancy Long-term Employees">
                Low Occupancy Long-term Employees
              </h4>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <SizeSelector />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(widgetId);
                  }}
                  className={`pin-btn ${pinnedWidgets.includes(widgetId) ? "pinned" : ""}`}
                >
                  <img src={Icons.pin} alt="" />
                </button>
                <span
                  className="widget-close-btn"
                  onClick={() => removeWidget(widgetId)}
                >
                  ×
                </span>
              </div>
            </div>
            <div style={{ height: "calc(100% - 45px)", overflow: "hidden" }}>
              <LowOccupancyWidget openModal={openModal} />
            </div>
          </>
        );

      case "deployment-count":
        return (
          <>
            <div className="grid-item-header">
              <h4 title="Deployment Overview">Deployment Overview</h4>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <SizeSelector />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(widgetId);
                  }}
                  className={`pin-btn ${pinnedWidgets.includes(widgetId) ? "pinned" : ""}`}
                >
                  <img src={Icons.pin} alt="" />
                </button>
                <span
                  className="widget-close-btn"
                  onClick={() => removeWidget(widgetId)}
                >
                  ×
                </span>
              </div>
            </div>
            <div style={{ height: "calc(100% - 45px)", overflow: "hidden" }}>
              <DeploymentCountWidget />
            </div>
          </>
        );

      default:

      case "deployment-techgroup-employees":
        return (
          <>
            <div className="grid-item-header">
              <h4 title="Resource by Deployment & Tech Group">
                Resource by Deployment & Tech Group
              </h4>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <SizeSelector />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(widgetId);
                  }}
                  className={`pin-btn ${pinnedWidgets.includes(widgetId) ? "pinned" : ""}`}
                >
                  <img src={Icons.pin} alt="" />
                </button>
                <span
                  className="widget-close-btn"
                  onClick={() => removeWidget(widgetId)}
                >
                  ×
                </span>
              </div>
            </div>
            <div style={{ height: "calc(100% - 45px)", overflow: "hidden" }}>
              <DeploymentTechGroupWidget openModal={openModal} />
            </div>
          </>
        );
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
      {isLoading ? (
        <div className="loader" id="theme-loader">
          <div className="justify-content-center jimu-primary-loading"></div>
        </div>
      ) : (
        <>
          <div className="dashboard-header">
            <div className="welcome">
              <div className="d-flex justify-btwn align-center">
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
                    onChange={(e) =>
                      setWidgetSearch(
                        e.target.value.replace(/\s+/g, " ").trimStart(),
                      )
                    }
                  />
                  <i className="fa-solid fa-search"></i>
                </div>

                <div className="multi-select" ref={dropdownRef}>
                  <div
                    className="select-trigger"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span className="placeholder">Select Widgets</span>
                    <i className="fa-solid fa-chevron-down"></i>
                  </div>

                  {isDropdownOpen && (
                    <div className="dropdown-menu show">
                      {availableWidgets.map((widget) => (
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
                <button
                  className="primary-btn"
                  onClick={() => setIsModalOpen(true)}
                >
                  <span className="btn-content">Create a Widget</span>
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                </button>
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={selectedWidgets}
                strategy={rectSortingStrategy}
              >
                {selectedWidgets.length === 0 ? (
                  <div className="no-widgets-message">
                    <i className="fa-solid fa-chart-line"></i>
                    <h3>No Widgets Selected</h3>
                    <p>
                      Select widgets from the dropdown above or create a new
                      custom widget to get started
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Pinned Widgets Row */}
                    {pinnedWidgets.length > 0 && (
                      <div className="widgets-grid">
                        {selectedWidgets
                          .filter((widgetId) => {
                            const widget = availableWidgets.find(
                              (w) => w.id === widgetId,
                            );
                            const dynamicWidget = dynamicWidgets.find(
                              (w) => w.id === widgetId,
                            );
                            const label =
                              widget?.label || dynamicWidget?.title || "";
                            return (
                              pinnedWidgets.includes(widgetId) &&
                              label
                                .toLowerCase()
                                .includes(widgetSearch.toLowerCase())
                            );
                          })
                          .map((widgetId) => (
                            <SortableWidget
                              key={widgetId}
                              id={widgetId}
                              isPinned={true}
                              widgetSize={widgetSizes[widgetId]}
                            >
                              {renderWidget(widgetId)}
                            </SortableWidget>
                          ))}
                      </div>
                    )}

                    {/* Unpinned Widgets Grid */}
                    <div className="widgets-grid">
                      {selectedWidgets
                        .filter((widgetId) => {
                          const widget = availableWidgets.find(
                            (w) => w.id === widgetId,
                          );
                          const dynamicWidget = dynamicWidgets.find(
                            (w) => w.id === widgetId,
                          );
                          const label =
                            widget?.label || dynamicWidget?.title || "";
                          return (
                            !pinnedWidgets.includes(widgetId) &&
                            label
                              .toLowerCase()
                              .includes(widgetSearch.toLowerCase())
                          );
                        })
                        .map((widgetId) => (
                          <SortableWidget
                            key={widgetId}
                            id={widgetId}
                            isPinned={false}
                            widgetSize={widgetSizes[widgetId]}
                          >
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
      )}

      <CreateWidgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWidget(null);
        }}
        editingWidget={editingWidget}
        onGenerate={(widgetData, prompt) => {
          if (editingWidget) {
            setDynamicWidgets((prev) =>
              prev.map((w) =>
                w.id === editingWidget.id ? { ...w, ...widgetData, prompt } : w,
              ),
            );
            // Center the edited widget
            setTimeout(() => {
              const widgetElement = document.querySelector(
                `[data-widget-id="${editingWidget.id}"]`,
              );
              if (widgetElement) {
                widgetElement.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                  inline: "center",
                });
              }
            }, 200);
          } else {
            const newWidget = {
              id: `dynamic-${Date.now()}`,
              ...widgetData,
              prompt,
            };
            const defaultRows = widgetData.chartType === "card" ? 1 : 2;
            setDynamicWidgets((prev) => [newWidget, ...prev]);
            setSelectedWidgets((prev) => [newWidget.id, ...prev]);
            setWidgetSizes((prev) => ({
              ...prev,
              [newWidget.id]: { cols: 1, rows: defaultRows },
            }));

            // Auto-center the newly created widget
            setTimeout(() => {
              const widgetElement = document.querySelector(
                `[data-widget-id="${newWidget.id}"]`,
              );
              if (widgetElement) {
                widgetElement.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                  inline: "center",
                });
              }
            }, 200);
          }
          setIsModalOpen(false);
          setEditingWidget(null);
        }}
      />

      <AddStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        onAdd={handleAddStat}
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
