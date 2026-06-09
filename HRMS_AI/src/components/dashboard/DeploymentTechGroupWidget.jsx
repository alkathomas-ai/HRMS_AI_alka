import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  getEmployeeDirectory,
  getAllDeployment,
  getAllTechgroup,
  getDeploymentResources,
} from "../../services/api";
import "./DeploymentTechGroupWidget.css";

const DeploymentTechGroupWidget = ({ openModal }) => {
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [allFetchedEmployees, setAllFetchedEmployees] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [techGroups, setTechGroups] = useState([]);
  const [selectedDeployment, setSelectedDeployment] = useState("all");
  const [selectedTechGroup, setSelectedTechGroup] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeploymentDropdownOpen, setIsDeploymentDropdownOpen] = useState(false);
  const [isTechGroupDropdownOpen, setIsTechGroupDropdownOpen] = useState(false);
  const deploymentDropdownRef = useRef(null);
  const techGroupDropdownRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch all deployments
      const deploymentsResult = await getAllDeployment();
      const deploymentList = deploymentsResult?.data || [];
      setDeployments(Array.isArray(deploymentList) ? deploymentList : []);

      // Fetch all tech groups
      const techGroupsResult = await getAllTechgroup();
      const techGroupList = techGroupsResult?.data || [];
      setTechGroups(Array.isArray(techGroupList) ? techGroupList : []);

      // Fetch all employees initially
      const employeeResult = await getEmployeeDirectory();
      const employeeData =
        employeeResult?.employees || employeeResult?.data || [];
      setEmployees(Array.isArray(employeeData) ? employeeData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setEmployees([]);
      setDeployments([]);
      setTechGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deploymentDropdownRef.current && !deploymentDropdownRef.current.contains(event.target)) {
        setIsDeploymentDropdownOpen(false);
      }
      if (techGroupDropdownRef.current && !techGroupDropdownRef.current.contains(event.target)) {
        setIsTechGroupDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAllDeploymentsData = useCallback(
    async (deploymentsList, techGroup) => {
      try {
        setIsLoading(true);
        let allEmployees = [];

        // Fetch data for each deployment
        for (const dep of deploymentsList) {
          try {
            const resourcesResult = await getDeploymentResources(
              dep.deployment,
              techGroup,
            );
            const resourceData = resourcesResult?.data || [];
            allEmployees = [...allEmployees, ...resourceData];
          } catch (error) {
            console.error(
              `Error fetching data for deployment ${dep.deployment}:`,
              error,
            );
          }
        }

        // Remove duplicates based on employee_id
        const uniqueEmployees = Array.from(
          new Map(allEmployees.map((emp) => [emp.employee_id, emp])).values(),
        );

        console.log("All deployments data count:", uniqueEmployees.length);
        console.log("First employee from all deployments:", uniqueEmployees[0]);
        setAllFetchedEmployees(uniqueEmployees);
        setFilteredEmployees(uniqueEmployees);
      } catch (error) {
        console.error("Error fetching all deployments data:", error);
        setAllFetchedEmployees([]);
        setFilteredEmployees([]);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Initialize data after deployments are loaded
  useEffect(() => {
    if (deployments.length > 0) {
      fetchAllDeploymentsData(deployments, "all");
    }
  }, [deployments, fetchAllDeploymentsData]);

  const fetchDeploymentResources = useCallback(
    async (deployment, techGroup) => {
      try {
        setIsLoading(true);
        const resourcesResult = await getDeploymentResources(
          deployment,
          techGroup,
        );
        const resourceData = resourcesResult?.data || [];
        console.log("Fetched resources count:", resourceData.length);
        console.log("First resource sample:", resourceData[0]);
        setAllFetchedEmployees(Array.isArray(resourceData) ? resourceData : []);
        setFilteredEmployees(Array.isArray(resourceData) ? resourceData : []);
      } catch (error) {
        console.error("Error fetching deployment resources:", error);
        setAllFetchedEmployees([]);
        setFilteredEmployees([]);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const handleDeploymentChange = (value) => {
    setSelectedDeployment(value);
    setSearchTerm("");
    setIsDeploymentDropdownOpen(false);

    if (value === "all" && selectedTechGroup === "all") {
      fetchAllDeploymentsData(deployments, "all");
    } else if (value === "all") {
      fetchAllDeploymentsData(deployments, selectedTechGroup);
    } else {
      fetchDeploymentResources(value, selectedTechGroup);
    }
  };

  const handleTechGroupChange = (value) => {
    setSelectedTechGroup(value);
    setSearchTerm("");
    setIsTechGroupDropdownOpen(false);

    if (selectedDeployment === "all" && value === "all") {
      fetchAllDeploymentsData(deployments, "all");
    } else if (selectedDeployment === "all") {
      fetchAllDeploymentsData(deployments, value);
    } else {
      fetchDeploymentResources(selectedDeployment, value);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    let filtered = allFetchedEmployees;

    if (value.trim()) {
      filtered = filtered.filter(
        (emp) =>
          emp.display_name?.toLowerCase().includes(value.toLowerCase()) ||
          emp.employee_id?.toLowerCase().includes(value.toLowerCase()),
      );
    }

    setFilteredEmployees(filtered);
  };

  return (
    <div className="deployment-techgroup-widget">
      {/* <div className="search-section">
        <div className="filter-group search-group">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="dynamic-table-search"
            />
            <i className="fa-solid fa-search"></i>
          </div>
        </div>
      </div> */}
      
      <div className="filter-section">
        <div className="filter-group">
          <label>Deployment</label>
          <div className="custom-select-wrapper" ref={deploymentDropdownRef}>
            <div 
              className={`select-trigger ${isDeploymentDropdownOpen ? 'open' : ''}`} 
              onClick={() => setIsDeploymentDropdownOpen(!isDeploymentDropdownOpen)}
            >
              <span>
                {selectedDeployment === "all" 
                  ? `All Deployments (${deployments.length})` 
                  : selectedDeployment
                }
              </span>
              <i className="fa-solid fa-chevron-down"></i>
            </div>
            {isDeploymentDropdownOpen && (
              <div className="dropdown-menu show">
                <div 
                  className="option" 
                  onClick={() => handleDeploymentChange("all")}
                >
                  All Deployments ({deployments.length})
                </div>
                {deployments.map((dep) => (
                  <div 
                    key={dep.deployment} 
                    className="option" 
                    onClick={() => handleDeploymentChange(dep.deployment)}
                  >
                    {dep.deployment}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="filter-group">
          <label>Tech Group</label>
          <div className="custom-select-wrapper" ref={techGroupDropdownRef}>
            <div 
              className={`select-trigger ${isTechGroupDropdownOpen ? 'open' : ''}`} 
              onClick={() => setIsTechGroupDropdownOpen(!isTechGroupDropdownOpen)}
            >
              <span>
                {selectedTechGroup === "all" 
                  ? `All Tech Groups (${techGroups.length})` 
                  : selectedTechGroup
                }
              </span>
              <i className="fa-solid fa-chevron-down"></i>
            </div>
            {isTechGroupDropdownOpen && (
              <div className="dropdown-menu show">
                <div 
                  className="option" 
                  onClick={() => handleTechGroupChange("all")}
                >
                  All Tech Groups ({techGroups.length})
                </div>
                {techGroups.map((tg) => (
                  <div 
                    key={tg.tech_group} 
                    className="option" 
                    onClick={() => handleTechGroupChange(tg.tech_group)}
                  >
                    {tg.tech_group}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state">Loading...</div>
      ) : (
        <div className="deployment-employees-list">
          {filteredEmployees.length === 0 ? (
            <div className="no-data">
              No employees found with current filters
            </div>
          ) : (
            <>
              {/* <div className="results-count">
                Showing {filteredEmployees.length} employees
              </div> */}
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.employee_id}
                  className="employee-card"
                  onClick={() => openModal && openModal(employee.employee_id)}
                >
                  <div className="employee-avatar">
                    {employee.display_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="employee-details">
                    <div className="deployment-emp-details-head">
                      <div className="employee-name">
                        {employee.display_name}
                      </div>
                      <span className="deployment-employee-id">
                        {employee.employee_id}
                      </span>
                    </div>
                    <div className="employee-meta">
                      <span className="deployment-employee-dept">
                        {employee.employee_department}
                      </span>
                      <span className="dot">•</span>
                      <span className="employee-designation">
                        {employee.designation}
                      </span>
                    </div>
                    <div className="employee-tags">
                      {employee.deployment && (
                        <span className="tag deployment-tag">
                          {employee.deployment}
                        </span>
                      )}
                      {employee.tech_group && (
                        <span className="tag techgroup-tag">
                          {employee.tech_group}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    {employee.aging_days !== undefined && (
                      <div className="aging-badge">{employee.aging_days}d</div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DeploymentTechGroupWidget;
