import React, { useState, useEffect, useCallback } from 'react';
import { getEmployeeDirectory } from '../../services/api';
import './DeploymentTechGroupWidget.css';

const DeploymentTechGroupWidget = ({ openModal }) => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [techGroups, setTechGroups] = useState([]);
  const [selectedDeployment, setSelectedDeployment] = useState('all');
  const [selectedTechGroup, setSelectedTechGroup] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getEmployeeDirectory();
      const employeeData = response?.data || [];
      
      setEmployees(employeeData);
      
      // Extract unique deployments and tech groups
      const uniqueDeployments = [...new Set(employeeData.map(emp => emp.deployment).filter(Boolean))];
      const uniqueTechGroups = [...new Set(employeeData.map(emp => emp.tech_group).filter(Boolean))];
      
      setDeployments(uniqueDeployments.sort());
      setTechGroups(uniqueTechGroups.sort());
      
      filterEmployees(employeeData, 'all', 'all', '');
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filterEmployees = (data, deployment, techGroup, search) => {
    let filtered = data;

    if (deployment !== 'all') {
      filtered = filtered.filter(emp => emp.deployment === deployment);
    }

    if (techGroup !== 'all') {
      filtered = filtered.filter(emp => emp.tech_group === techGroup);
    }

    if (search.trim()) {
      filtered = filtered.filter(emp =>
        emp.display_name?.toLowerCase().includes(search.toLowerCase()) ||
        emp.employee_id?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredEmployees(filtered);
  };

  const handleDeploymentChange = (e) => {
    const value = e.target.value;
    setSelectedDeployment(value);
    filterEmployees(employees, value, selectedTechGroup, searchTerm);
  };

  const handleTechGroupChange = (e) => {
    const value = e.target.value;
    setSelectedTechGroup(value);
    filterEmployees(employees, selectedDeployment, value, searchTerm);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterEmployees(employees, selectedDeployment, selectedTechGroup, value);
  };

  return (
    <div className="deployment-techgroup-widget">
      <div className="filter-section">
        <div className="filter-group">
          <label>Deployment</label>
          <select value={selectedDeployment} onChange={handleDeploymentChange} className="filter-select">
            <option value="all">All Deployments</option>
            {deployments.map(dep => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Tech Group</label>
          <select value={selectedTechGroup} onChange={handleTechGroupChange} className="filter-select">
            <option value="all">All Tech Groups</option>
            {techGroups.map(tg => (
              <option key={tg} value={tg}>{tg}</option>
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
            <div className="no-data">No employees found with current filters</div>
          ) : (
            filteredEmployees.map((employee) => (
              <div
                key={employee.employee_id}
                className="employee-card"
                onClick={() => openModal && openModal(employee.employee_id)}
              >
                <div className="employee-avatar">
                  {employee.display_name?.charAt(0).toUpperCase()}
                </div>
                <div className="employee-details">
                  <div className="employee-name">{employee.display_name}</div>
                  <div className="employee-meta">
                    <span className="employee-id">{employee.employee_id}</span>
                    <span className="dot">•</span>
                    <span className="employee-designation">{employee.designation}</span>
                  </div>
                  <div className="employee-tags">
                    {employee.deployment && (
                      <span className="tag deployment-tag">{employee.deployment}</span>
                    )}
                    {employee.tech_group && (
                      <span className="tag techgroup-tag">{employee.tech_group}</span>
                    )}
                    {employee.employee_department && (
                      <span className="tag department-tag">{employee.employee_department}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DeploymentTechGroupWidget;
