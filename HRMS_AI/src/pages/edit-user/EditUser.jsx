import React, { useEffect, useState } from 'react'
import './EditUser.css'
import { Icons } from '../../assets/icons'
import { getEmployeeDirectory } from '../../services/api'

const EditUser = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await getEmployeeDirectory();
      console.log('API Response:', data);
      // Handle if data is an object with employees array inside
      const employeeList = Array.isArray(data) ? data : (data?.employees || data?.data || []);
      setEmployees(employeeList);
      setFilteredEmployees(employeeList);
    } catch (error) {
      console.log(error);
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    const filtered = employees.filter(emp => 
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

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

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
            <div className='employee-list'>
              {Array.isArray(paginatedEmployees) && paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((employee, index) => (
              <div key={index} className='employee-card'>
                <div className='employee-info'>
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
                    {employee.skill_set?.split(',').slice(0, 3).map((skill, i) => (
                      <span key={i} className='skill-tag'>{skill.trim()}</span>
                    ))}
                    {employee.skill_set?.split(',').length > 3 && (
                      <span className='skill-more'>+{employee.skill_set.split(',').length - 3} more</span>
                    )}
                  </div>
                </div>
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
            {totalPages > 1 && (
              <div className='pagination'>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
              <button className='btn-primary' onClick={handleUpdateSkills}>
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
