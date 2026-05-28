import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import './EditUser.css'
import { Icons } from '../../assets/icons'
import { getEmployeeDirectory, getEmployeesPaginated, updateEmployeeSkills } from '../../services/api'
import CandidateProfileModal from '../../components/CandidateProfileModal'
import { useCandidateProfileModal } from '../../hooks/useCandidateProfileModal'
import { useToast } from '../../context/ToastContext'
import useConfirmation from '../../components/common/useConfirmation'

const EditUser = () => {
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingSkills, setEditingSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [isRowsDropdownOpen, setIsRowsDropdownOpen] = useState(false);

  const { showSuccess, showError } = useToast();
  const { confirm, ConfirmationModal } = useConfirmation();
  const skipBlurRef = useRef(false);

  // Candidate Profile Modal
  const {
    isOpen: isModalOpen,
    employee: selectedEmployee,
    loading: modalLoading,
    error: modalError,
    openModal,
    closeModal
  } = useCandidateProfileModal();


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
    setOpenDropdownId(null); // Close dropdown when starting edit
  };

  const handleDropdownToggle = (employeeId, event) => {
    event.stopPropagation();
    setOpenDropdownId(openDropdownId === employeeId ? null : employeeId);
  };

  const handleDropdownAction = (action, employee, event) => {
    event.stopPropagation();
    setOpenDropdownId(null);
    
    switch (action) {
      case 'edit':
        handleStartEdit(employee);
        break;
      case 'view':
        openModal(employee.employee_id);
        break;
      default:
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };
    
    if (openDropdownId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdownId]);

  const handleSaveEdit = async (employee, skillsToSave, showToast = false, closeEditor = true) => {
    try {
      await updateEmployeeSkills(employee.employee_id, skillsToSave);
      const skillsString = skillsToSave.join(', ');
      if (isSearching) {
        setFilteredEmployees(prev => prev.map(emp =>
          emp.employee_id === employee.employee_id ? { ...emp, skill_set: skillsString } : emp
        ));
      } else {
        setEmployees(prev => prev.map(emp =>
          emp.employee_id === employee.employee_id ? { ...emp, skill_set: skillsString } : emp
        ));
      }
      setAllEmployees(prev => prev.map(emp =>
        emp.employee_id === employee.employee_id ? { ...emp, skill_set: skillsString } : emp
      ));
      if (closeEditor) {
        setEditingEmployee(null);
        setEditingSkills([]);
        setNewSkillInput('');
      }
      if (showToast) showSuccess('Skills updated successfully!');
    } catch (error) {
      showError(`Failed to update skills: ${error.message}`);
    }
  };

  const getVisibleSkillsCount = (employee) => 3;

  const SkillsCell = ({ skillSet, expanded, onToggle, onDoubleClick }) => {
    const containerRef = useRef(null);
    const [visibleCount, setVisibleCount] = useState(null);
    const skillsArray = skillSet ? skillSet.split(',').map(s => s.trim()).filter(s => s) : [];

    useLayoutEffect(() => {
      if (!containerRef.current) return;
      const measure = () => {
        if (expanded) { setVisibleCount(null); return; }
        const container = containerRef.current;
        const allChips = Array.from(container.querySelectorAll('.skill-chip[data-measure="true"]'));
        if (!allChips.length) return;
        const containerWidth = container.offsetWidth;
        const btnWidth = 52;
        const gap = 6;
        let used = 0, count = 0;
        for (const chip of allChips) {
          const w = chip.offsetWidth + gap;
          if (used + w + btnWidth > containerWidth) break;
          used += w;
          count++;
        }
        setVisibleCount(count || 1);
      };
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(containerRef.current);
      return () => ro.disconnect();
    }, [skillSet, expanded]);

    if (!skillsArray.length) return null;
    const count = visibleCount ?? 0;
    const remaining = skillsArray.length - count;

    return (
      <div
        ref={containerRef}
        className='skills-container'
        onDoubleClick={onDoubleClick}
        title="Double-click to edit"
        style={{ cursor: 'text', flexWrap: expanded ? 'wrap' : 'nowrap' }}
      >
        {/* hidden chips for measurement */}
        {!expanded && skillsArray.map((skill, i) => (
          <span key={`m-${i}`} data-measure="true" className='skill-chip' style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none' }}>{skill}</span>
        ))}
        {/* visible chips */}
        {(expanded ? skillsArray : skillsArray.slice(0, count)).map((skill, i) => (
          <span key={i} className='skill-chip'>{skill}</span>
        ))}
        {!expanded && (
          <button className="more-skills-btn" style={{ flexShrink: 0 }} onClick={(e) => { e.stopPropagation(); onToggle(); }}>
            {remaining > 0 ? `+${remaining}` : `+0`}
          </button>
        )}
        {expanded && (
          <button className="more-skills-btn" style={{ flexShrink: 0 }} onClick={(e) => { e.stopPropagation(); onToggle(); }}>Less</button>
        )}
      </div>
    );
  };

  const handleCancelEdit = async () => {
    const confirmed = await confirm({
      title: 'Discard Changes',
      message: 'Are you sure you want to discard your skill changes?',
    });
    if (!confirmed) return;
    setEditingEmployee(null);
    setEditingSkills([]);
    setNewSkillInput('');
  };

  const handleRemoveSkill = async (employee, skillIndex) => {
    skipBlurRef.current = true;
    const confirmed = await confirm({
      title: 'Remove Skill',
      message: `Remove "${editingSkills[skillIndex]}" from skills?`,
    });
    skipBlurRef.current = false;
    if (!confirmed) return;
    const updated = editingSkills.filter((_, i) => i !== skillIndex);
    setEditingSkills(updated);
    handleSaveEdit(employee, updated, true, false);
    const trimmedSkill = newSkillInput.trim();
    if (trimmedSkill && !editingSkills.includes(trimmedSkill)) {
      setEditingSkills(prev => [...prev, trimmedSkill]);
      setNewSkillInput('');
    }
  };

  const handleKeyPress = (e, employee) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newSkillInput.trim()) {
        const updated = [...editingSkills, newSkillInput.trim()];
        setEditingSkills(updated);
        setNewSkillInput('');
        handleSaveEdit(employee, updated, true, false);
      } else {
        handleSaveEdit(employee, editingSkills, true);
      }
    }
  };

  

  return (
    <>
    <div className='edit-user-container'>
      <div className='edit-user-not-overflow-container'>
          <div className='edit-user-header'>
            <h2>Edit Employee Skills</h2>
          </div>

          {isLoading ? (
            <div className="loader">
              <div className="justify-content-center jimu-primary-loading"></div>
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
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(isSearching ? filteredEmployees : employees).map((employee, index) => (
                        <tr key={index} className="table-row">
                          <td className="employee-cell">
                            <div className="edit-employee-info">
                              <div className="user-employee-avatar">
                                {employee.display_name?.charAt(0).toUpperCase()}
                              </div>
                              <span 
                                className="employee-name clickable-employee"
                                onClick={() => openModal(employee.employee_id)}
                                title="Click to view employee profile"
                              >
                                {employee.display_name}
                              </span>
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
                                        onClick={() => handleRemoveSkill(employee, index)}
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
                                    onKeyPress={(e) => handleKeyPress(e, employee)}
                                    onBlur={() => {
                                      setTimeout(() => {
                                        if (skipBlurRef.current) return;
                                        if (newSkillInput.trim()) {
                                          const updated = [...editingSkills, newSkillInput.trim()];
                                          handleSaveEdit(employee, updated, false);
                                        } else {
                                          handleSaveEdit(employee, editingSkills, false);
                                        }
                                      }, 150);
                                    }}
                                    className="add-skill-input"
                                    placeholder="Add new skill..."
                                    autoFocus
                                  />
                                </div>
                              </div>
                            ) : (
                              <SkillsCell
                                skillSet={employee.skill_set}
                                employeeId={employee.employee_id}
                                expanded={expandedEmployeeId === employee.employee_id}
                                onToggle={() => setExpandedEmployeeId(expandedEmployeeId === employee.employee_id ? null : employee.employee_id)}
                                onDoubleClick={() => handleStartEdit(employee)}
                              />
                            )}
                          </td>
                          <td className="actions-cell">
                            <div className="action-dropdown-container">
                              <button
                                className="action-menu-btn"
                                onClick={(e) => handleDropdownToggle(employee.employee_id, e)}
                                title="More actions"
                              >
                                <span className="material-symbols-outlined">more_vert</span>
                              </button>
                              {openDropdownId === employee.employee_id && (
                                <div className="action-dropdown-menu">
                                  <button
                                    className="dropdown-item"
                                    onClick={(e) => handleDropdownAction('edit', employee, e)}
                                  >
                                    Edit Skills
                                  </button>
                                  <button
                                    className="dropdown-item"
                                    onClick={(e) => handleDropdownAction('view', employee, e)}
                                  >
                                    View Profile
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="no-data">No employees found</div>
                )}
              </div>
              {!isSearching && (
                <div className='bottom-pagination'>
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
            </>
          )}

      </div>
    </div>

      <ConfirmationModal />
      <CandidateProfileModal
        isOpen={isModalOpen}
        onClose={closeModal}
        employee={selectedEmployee}
        loading={modalLoading}
        error={modalError}
      />
    </>
  )
}

export default EditUser
