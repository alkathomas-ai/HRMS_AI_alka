import React, { useEffect, useState } from 'react'
import './EditUser.css'
import { Icons } from '../../assets/icons'
import { getEmployeeDirectory, getEmployeesPaginated, updateEmployeeSkills } from '../../services/api'

const EditUser = () => {
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingSkills, setEditingSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isRowsDropdownOpen, setIsRowsDropdownOpen] = useState(false);


  useEffect(() => {
    fetchAllEmployees();
  }, []);

  useEffect(() => {
    if (!isSearching) {
      fetchEmployees();
    }
  }, [currentPage, isSearching, itemsPerPage]);

  const fetchAllEmployees = async () => {
    try {
      const firstPageData = await getEmployeesPaginated(1, itemsPerPage);
      const total = firstPageData.total_employees || 0;
      setTotalEmployees(total);
      
      const allData = await getEmployeesPaginated(1, total);
      setAllEmployees(allData.employees || []);   // comment when using dummy data
      // setAllEmployees(allData.total_employees) // uncomment when using dummy data
    } catch (error) {
      console.log(error);
      setAllEmployees([]);
    }
  };



  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await getEmployeesPaginated(currentPage, itemsPerPage );
      console.log('API Response:', data);
      // Handle if data is an object with employees array inside
      // const employeeList = Array.isArray(data) ? data : (data?.employees || data?.data || []);
      setEmployees(data.employees);

       // 👇 calculate total pages using total_employees
    const totalPagesCalculated = Math.ceil(
      data.total_employees / itemsPerPage
    );
    
    setTotalPages(totalPagesCalculated);
      // setFilteredEmployees(employeeList);
    } catch (error) {
      console.log(error);
      setEmployees([]);
      // setFilteredEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    
    if (!query.trim()) {
      setIsSearching(false);
      setFilteredEmployees([]);
      return;
    }
    
    setIsSearching(true);
    const filtered = allEmployees.filter(emp => 
      emp.display_name?.toLowerCase().includes(query.toLowerCase()) ||
      emp.employee_id?.toLowerCase().includes(query.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredEmployees(filtered);
  };

  const handleStartEdit = (employee) => {
    setEditingEmployee(employee.employee_id);
    const skillsArray = employee.skill_set ? employee.skill_set.split(',').map(s => s.trim()).filter(s => s) : [];
    setEditingSkills(skillsArray);
    setNewSkillInput('');
  };

  const handleSaveEdit = async (employee) => {
    try {
      await updateEmployeeSkills(employee.employee_id, editingSkills);
      
      const skillsString = editingSkills.join(', ');
      // Update local state
      if (isSearching) {
        setFilteredEmployees(prev => prev.map(emp => 
          emp.employee_id === employee.employee_id 
            ? { ...emp, skill_set: skillsString } 
            : emp
        ));
      } else {
        setEmployees(prev => prev.map(emp => 
          emp.employee_id === employee.employee_id 
            ? { ...emp, skill_set: skillsString } 
            : emp
        ));
      }
      setAllEmployees(prev => prev.map(emp => 
        emp.employee_id === employee.employee_id 
          ? { ...emp, skill_set: skillsString } 
          : emp
      ));
      
      setEditingEmployee(null);
      setEditingSkills([]);
      setNewSkillInput('');
    } catch (error) {
      alert(`Failed to update skills: ${error.message}`);
    }
  };

  const getVisibleSkillsCount = (skills) => {
    if (!skills) return 0;
    const skillsArray = skills.split(',');
    // Estimate based on average skill length and available space
    // Show more skills but cap at a reasonable number for table display
    return Math.min(skillsArray.length, 5);
  };

  const handleCancelEdit = () => {
    setEditingEmployee(null);
    setEditingSkills([]);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillIndex) => {
    setEditingSkills(prev => prev.filter((_, index) => index !== skillIndex));
  };

  const handleAddSkill = () => {
    const trimmedSkill = newSkillInput.trim();
    if (trimmedSkill && !editingSkills.includes(trimmedSkill)) {
      setEditingSkills(prev => [...prev, trimmedSkill]);
      setNewSkillInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  

  return (
    <>
      <div className='edit-user-container'>
        <div className="edit-user-not-overflow-container">
          <div className='edit-user-header'>
            <h2>Edit Employee Skills</h2>
          </div>

          {isLoading ? (
            <div className="loader-container">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              <div className='toolbar-row'>
                <div className='search-box'>
                  <span className="material-symbols-outlined">search</span>
                  <input 
                    type="text" 
                    placeholder="Search by name, ID, or designation..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value.replace(/\s+/g, ' ').trimStart())}
                  />
                </div>
                {!isSearching && (
                  <div className='search-results-pagination'>
                    <div className="rows-selector">
                      <span>Rows per page:</span>
                      <div className="custom-select-wrapper">
                        <div 
                          className="select-trigger"
                          onClick={() => setIsRowsDropdownOpen(!isRowsDropdownOpen)}
                        >
                          <span>{itemsPerPage}</span>
                          <span className="material-symbols-outlined">
                            {isRowsDropdownOpen ? 'expand_less' : 'expand_more'}
                          </span>
                        </div>
                        {isRowsDropdownOpen && (
                          <div className="dropdown-menu">
                            {[10, 15, 25].map(value => (
                              <div 
                                key={value}
                                className="option"
                                onClick={() => {
                                  setItemsPerPage(value);
                                  setCurrentPage(1);
                                  setIsRowsDropdownOpen(false);
                                }}
                              >
                                {value}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="pagination-info">
                      Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalEmployees)} of {totalEmployees} employees
                    </div>
                    <div className="pagination-controls">
                      <button
                        className="page-btn"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <span className="material-symbols-outlined">chevron_left</span>
                      </button>
                      <button
                        className="page-btn"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <span className="material-symbols-outlined">chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className='material-table-container'>
                {Array.isArray(isSearching ? filteredEmployees : employees) && (isSearching ? filteredEmployees : employees).length > 0 ? (
                  <table className="material-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>ID</th>
                        <th>Designation</th>
                        <th>Skills <i className="fa-solid fa-circle-info info-icon" title="Double-click to edit skills"></i></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(isSearching ? filteredEmployees : employees).map((employee, index) => (
                        <tr key={index} className="table-row">
                          <td className="employee-cell">
                            <div className="edit-employee-info">
                              <div className="employee-avatar">
                                {employee.display_name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="employee-name">{employee.display_name}</span>
                            </div>
                          </td>
                          <td className="id-cell">{employee.employee_id}</td>
                          <td className="designation-cell">{employee.designation}</td>
                          <td className="skills-cell">
                            {editingEmployee === employee.employee_id ? (
                              <div className="skills-edit-container">
                                <div className="skills-badges-container">
                                  {editingSkills.map((skill, index) => (
                                    <div key={index} className="skill-badge-edit">
                                      <span>{skill}</span>
                                      <button
                                        type="button"
                                        className="remove-skill-btn"
                                        onClick={() => handleRemoveSkill(index)}
                                        title="Remove skill"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                  <input
                                    type="text"
                                    value={newSkillInput}
                                    onChange={(e) => setNewSkillInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    onBlur={(e) => {
                                      // Only save if clicking outside the skills container
                                      if (!e.relatedTarget || !e.relatedTarget.closest('.skills-edit-container')) {
                                        handleSaveEdit(employee);
                                      }
                                    }}
                                    className="add-skill-input"
                                    placeholder="Add new skill..."
                                    autoFocus
                                  />
                                </div>
                                {/* <div className="skills-edit-actions">
                                  <button
                                    type="button"
                                    className="save-skills-btn"
                                    onClick={() => handleSaveEdit(employee)}
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    className="cancel-skills-btn"
                                    onClick={handleCancelEdit}
                                  >
                                    Cancel
                                  </button>
                                </div> */}
                              </div>
                            ) : (
                              <div 
                                className='skills-container'
                                onDoubleClick={() => handleStartEdit(employee)}
                                style={{ cursor: 'text' }}
                                title="Double-click to edit"
                              >
                                {employee.skill_set && (() => {
                                  const skillsArray = employee.skill_set.split(',');
                                  const visibleCount = expandedEmployeeId === employee.employee_id ? skillsArray.length : getVisibleSkillsCount(employee.skill_set);
                                  
                                  return (
                                    <>
                                      {skillsArray.slice(0, visibleCount).map((skill, i) => (
                                        <span key={i} className='skill-chip'>
                                          {skill.trim()}
                                        </span>
                                      ))}
                                      {skillsArray.length > visibleCount && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setExpandedEmployeeId(
                                              expandedEmployeeId === employee.employee_id
                                                ? null
                                                : employee.employee_id
                                            );
                                          }}
                                          className="more-skills-btn"
                                        >
                                          {expandedEmployeeId === employee.employee_id
                                            ? 'Less'
                                            : `+${skillsArray.length - visibleCount}`}
                                        </button>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="no-data">No employees found</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default EditUser
