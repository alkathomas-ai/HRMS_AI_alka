import { useState } from "react";
import { createPortal } from "react-dom";
import "./UploadResultsModal.css";
import "./Dashboard.css";

const UploadResultsModal = ({ show, onClose, employees, isLoading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0, arrowTop: 0 });
  const rowsPerPage = 10;

  if (!show) return null;

  const totalPages = Math.ceil(employees.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedEmployees = employees.slice(startIndex, endIndex);

  return (
    <div className={`upload-results-panel ${show ? '' : 'closing'}`}>
      <div className="upload-results-header">
        <h3>Uploaded Employee Data ({employees.length} records)</h3>
        <button className="close-btn" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="upload-results-content">
        {isLoading ? (
          <div className="chat-loader">
            <div className="spinner"></div>
          </div>
        ) : employees.length === 0 ? (
          <p>No data available</p>
        ) : (
          <>
            <div className="employee-table">
              <div className="employee-row header">
                <div>Name</div>
                <div>ID</div>
                <div>Designation</div>
                <div>Total Exp</div>
                <div>Tech Group</div>
                <div>Location</div>
              </div>

              {paginatedEmployees.map((employee, index) => (
                <div key={index} className="employee-row">
                  <div className="name-cell">
                    <div className="employee-avatar">
                      {employee.display_name?.charAt(0).toUpperCase()}
                    </div>
                    <span
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const popupHeight = 450;
                        const viewportHeight = window.innerHeight;
                        let calculatedTop = rect.top + window.scrollY;
                        let shiftAmount = 0;

                        if (rect.top + popupHeight > viewportHeight) {
                          shiftAmount = rect.top + popupHeight - viewportHeight + 20;
                          calculatedTop -= shiftAmount;
                        }

                        setPopupPosition({
                          top: calculatedTop + 10,
                          left: rect.right + 20,
                          arrowTop: rect.height / 2 + shiftAmount + 20,
                        });
                        setHoveredIndex(index);
                      }}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {employee.display_name}
                    </span>
                  </div>

                  <div>{employee.employee_id}</div>
                  <div>{employee.designation}</div>
                  <div>{employee.total_exp}</div>
                  <div>{employee.tech_group}</div>
                  <div>{employee.emp_location}</div>

                  {hoveredIndex === index &&
                    createPortal(
                      <div
                        className="employee-hover-popup"
                        style={{
                          top: `${popupPosition.top - 20}px`,
                          left: `950px`,
                          "--arrow-top": `${popupPosition.arrowTop}px`,
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        <div className="popup-header">
                          <div className="employee-avatar">
                            {employee.display_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4>{employee.display_name}</h4>
                            <span>{employee.designation}</span>
                          </div>
                        </div>

                        <div className="popup-body">
                          <p><b>ID:</b> {employee.employee_id}</p>
                          <p><b>Department:</b> {employee.employee_department}</p>
                          <p><b>Tech:</b> {employee.tech_group}</p>
                          <p><b>Location:</b> {employee.emp_location}</p>
                          <p><b>Total Exp:</b> {employee.total_exp}</p>

                          <div className="skills-container">
                            {employee.skill_set?.split(",").map((skill, i) => (
                              <span key={i} className="skill-badge">
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>,
                      document.body
                    )}
                </div>
              ))}
            </div>

            <div className="pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadResultsModal;
