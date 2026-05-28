import React, { useState, useEffect, useCallback } from "react";
import {
  getEmployeeDirectory,
  getAllDeployment,
  getAllTechgroup,
  getDeploymentResources,
} from "../../services/api";
import "./DeploymentTechGroupWidget.css";

const DeploymentTechGroupWidget = ({ openModal }) => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [allFetchedEmployees, setAllFetchedEmployees] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [techGroups, setTechGroups] = useState([]);
  const [selectedDeployment, setSelectedDeployment] = useState("all");
  const [selectedTechGroup, setSelectedTechGroup] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
      const employeeData = employeeResult?.employees || employeeResult?.data || [];
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

  const fetchAllDeploymentsData = useCallback(async (deploymentsList, techGroup) => {
    try {
      setIsLoading(true);
      let allEmployees = [];

      // Fetch data for each deployment
      for (const dep of deploymentsList) {
        try {
          const resourcesResult = await getDeploymentResources(dep.deployment, techGroup);
          const resourceData = resourcesResult?.data || [];
          allEmployees = [...allEmployees, ...resourceData];
        } catch (error) {
          console.error(`Error fetching data for deployment ${dep.deployment}:`, error);
        }
      }

      // Remove duplicates based on employee_id
      const uniqueEmployees = Array.from(
        new Map(allEmployees.map((emp) => [emp.employee_id, emp])).values()
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
  }, []);

  // Initialize data after deployments are loaded
  useEffect(() => {
    if (deployments.length > 0) {
      fetchAllDeploymentsData(deployments, "all");
    }
  }, [deployments, fetchAllDeploymentsData]);

  const fetchDeploymentResources = useCallback(async (deployment, techGroup) => {
    try {
      setIsLoading(true);
      const resourcesResult = await getDeploymentResources(deployment, techGroup);
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
  }, []);

  const handleDeploymentChange = (e) => {
    const value = e.target.value;
    setSelectedDeployment(value);
    setSearchTerm("");
    
    if (value === "all" && selectedTechGroup === "all") {
      fetchAllDeploymentsData(deployments, "all");
    } else if (value === "all") {
      fetchAllDeploymentsData(deployments, selectedTechGroup);
    } else {
      fetchDeploymentResources(value, selectedTechGroup);
    }
  };

  const handleTechGroupChange = (e) => {
    const value = e.target.value;
    setSelectedTechGroup(value);
    setSearchTerm("");
    
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
          emp.employee_id?.toLowerCase().includes(value.toLowerCase())
      );
    }
    
    setFilteredEmployees(filtered);
  };

  return (
    <div className="deployment-techgroup-widget">
      <div className="filter-section">
        <div className="filter-group">
          <label>Deployment</label>
          <select
            value={selectedDeployment}
            onChange={handleDeploymentChange}
            className="filter-select"
          >
            <option value="all">All Deployments ({deployments.length})</option>
            {deployments.map((dep) => (
              <option key={dep.deployment} value={dep.deployment}>
                {dep.deployment}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Tech Group</label>
          <select
            value={selectedTechGroup}
            onChange={handleTechGroupChange}
            className="filter-select"
          >
            <option value="all">All Tech Groups ({techGroups.length})</option>
            {techGroups.map((tg) => (
              <option key={tg.tech_group} value={tg.tech_group}>
                {tg.tech_group}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group search-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state">Loading...</div>
      ) : (
        <div className="employees-list">
          {filteredEmployees.length === 0 ? (
            <div className="no-data">
              No employees found with current filters
            </div>
          ) : (
            <>
              <div className="results-count">
                Showing {filteredEmployees.length} employees
              </div>
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
                      <div className="employee-name">{employee.display_name}</div>
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
                      {employee.employee_department && (
                        <span className="tag department-tag">
                          {employee.employee_department}
                        </span>
                      )}
                    </div>
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
