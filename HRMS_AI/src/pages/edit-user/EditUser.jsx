import React, { useEffect, useState } from 'react'
import './EditUser.css'
import { Icons } from '../../assets/icons'
import { getEmployeeDirectory, getEmployeesPaginated } from '../../services/api'

const EditUser = () => {
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const itemsPerPage = 6;


  useEffect(() => {
    fetchAllEmployees();
  }, []);

  useEffect(() => {
    if (!isSearching) {
      fetchEmployees();
    }
  }, [currentPage, isSearching]);

  const fetchAllEmployees = async () => {
    try {
      const firstPageData = await getEmployeesPaginated(1, itemsPerPage);
      const total = firstPageData.total_employees || 0;
      setTotalEmployees(total);
      
      const allData = await getEmployeesPaginated(1, total);
      setAllEmployees(allData.employees || []);
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

  const handleEditSkills = (employee) => {
    setSelectedEmployee(employee);
    setSkillInput(employee.skill_set || '');
    setIsModalOpen(true);
  };

  const handleUpdateSkills = async () => {
    // TODO: Add API call to update skills
    console.log('Updating skills for:', selectedEmployee.employee_id, 'with:', skillInput);
    setIsModalOpen(false);
    setSelectedEmployee(null);
    setSkillInput('');
  };

  

  return (
    <>
      <div className='edit-user-container'>
        <div className='edit-user-header'>
          <h2>Edit Employee Skills</h2>
          <div className='search-box'>
            <span className="material-symbols-outlined">search</span>
            <input 
              type="text" 
              placeholder="Search by name, ID, or designation..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="loader-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <div className='edit-employee-list'>
              {Array.isArray(isSearching ? filteredEmployees : employees) && (isSearching ? filteredEmployees : employees).length > 0 ? (
                (isSearching ? filteredEmployees : employees).map((employee, index) => (
              <div key={index} className='edit-employee-card'>
                <div className='edit-employee-info'>
                  <div className='employee-avatar'>
                    {employee.display_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className='employee-details'>
                    <h4>{employee.display_name}</h4>
                    <p>{employee.designation}</p>
                    <span className='employee-id'>ID: {employee.employee_id}</span>
                  </div>
                </div>
                <div className='employee-skills'>
                  <strong>Skills:</strong>
                  <div className='skills-tags'>
                    {employee.skill_set &&
                      employee.skill_set
                        .split(',')
                        .slice(
                          0,
                          expandedEmployeeId === employee.employee_id
                            ? undefined   // show all
                            : 3           // show first 3
                        )
                        .map((skill, i) => (
                          <span key={i} className='skill-tag'>
                            {skill.trim()}
                          </span>
                        ))}

                    {employee.skill_set?.split(',').length > 3 && (
                      <button
                        onClick={() =>
                          setExpandedEmployeeId(
                            expandedEmployeeId === employee.employee_id
                              ? null
                              : employee.employee_id
                          )
                        }
                        className="skill-more-btn"
                      >
                        {expandedEmployeeId === employee.employee_id
                          ? 'Show Less'
                          : `+${employee.skill_set.split(',').length - 3} More`}
                      </button>
                    )}
                  </div>
                </div>

                
                {/* <div className='employee-skill-description'>
                    {employees.skill_set && (
                      <div className="employee-skills-section">
                        <span className="skills-label">Skills:</span>
                        <div className="skills-container">
                          {employees.skill_set.split(',').slice(0, showAllSkills ? undefined : 5).map((skill, skillIndex) => (
                            <span key={skillIndex} className="skill-badge">{skill.trim()}</span>
                          ))}
                          {employees.skill_set.split(',').length > 5 && (
                            <button onClick={() => setShowAllSkills(!showAllSkills)} className="skill-more-btn">
                              {showAllSkills ? 'Show Less' : `+${employees.skill_set.split(',').length - 5} More`}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
  
                </div> */}


                <button className='edit-btn btn-primary' onClick={() => handleEditSkills(employee)}>
                  <img src={Icons.pencil} alt="" />
                  Edit Skills
                </button>
              </div>
            ))
            ) : (
              <div className="no-data">No employees found</div>
            )}
            </div>
            {!isSearching && (
              <div className='pagination'>
                <button
                  // onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  // disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}

                >
                  Prev
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  // onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  // disabled={currentPage === totalPages}

                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {isModalOpen && (
        <div className='modal-overlay' onClick={() => setIsModalOpen(false)}>
          <div className='modal-content' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h3>Edit Skills - {selectedEmployee?.display_name}</h3>
              <button className='close-btn' onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className='modal-body'>
              <label>Skills (comma-separated)</label>
              <textarea 
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="e.g., React, JavaScript, Python"
                rows={6}
              />
            </div>
            <div className='modal-footer'>
              <button className='btn-secondary' onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className='edit-btn btn-primary' onClick={handleUpdateSkills}>
                <img src={Icons.pencil} alt="" />
                Update Skills
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default EditUser
