import React, { useState, useEffect, useCallback } from 'react';
import { getLowOccupancyEmployees } from '../../services/api';
import './LowOccupancyWidget.css';

const LowOccupancyWidget = ({ openModal }) => {
  const [lowOccupancyEmployees, setLowOccupancyEmployees] = useState([]);
  const [occupancyThreshold, setOccupancyThreshold] = useState(50);
  const [longTermThreshold, setLongTermThreshold] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLowOccupancyEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getLowOccupancyEmployees(occupancyThreshold, longTermThreshold);
      setLowOccupancyEmployees(response?.data || []);
    } catch (error) {
      console.error('Error fetching low occupancy employees:', error);
      setLowOccupancyEmployees([]);
    } finally {
      setIsLoading(false);
    }
  }, [occupancyThreshold, longTermThreshold]);

  // Debounced effect for API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchLowOccupancyEmployees();
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [fetchLowOccupancyEmployees]);

  return (
    <div className="low-occupancy-widget">
      <div className="threshold-controls">
        <div className="threshold-control">
          <label>Occupancy</label>
          <div className="input-control">
            <input
              type="number"
              value={occupancyThreshold}
               onChange={(e) => {
                  const val = e.target.value;

                  // allow empty while typing
                  if (val === "") {
                    setOccupancyThreshold("");
                    return;
                  }

                  const num = Number(val);

                  if (!isNaN(num)) {
                    setOccupancyThreshold(Math.min(100, Math.max(1, num)));
                  }
                }}
              min="1"
              max="100"
            />
          </div>
          <span className="unit">%</span>
        </div>
        <div className="threshold-control">
          <label>Duration</label>
          <div className="input-control">
            <input
              type="number"
              value={longTermThreshold}
              onChange={(e) => {
                const val = e.target.value;

                if (val === "") {
                  setLongTermThreshold("");
                  return;
                }

                const num = Number(val);

                if (!isNaN(num)) {
                  setLongTermThreshold(Math.min(9999, Math.max(1, num)));
                }
              }}
              min="1"
              max="10000"
            />
          </div>
          <span className="unit">months</span>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state">Loading...</div>
      ) : (
        <div className="employees-list">
          {lowOccupancyEmployees.length === 0 ? (
            <div className="no-data">No employees found with current criteria</div>
          ) : (
            lowOccupancyEmployees.map((employee) => (
              <div 
                key={employee.employee_id} 
                className="loc-employee-card"
                onClick={() => openModal(employee.employee_id)}
              >
                {/* <div className="employee-avatar">
                  {employee.display_name?.charAt(0).toUpperCase()}
                </div> */}
                <div className="employee-info">
                  <div className="employee-name">{employee.display_name}</div>
                  <div className="employee-meta">
                    <span>{employee.employee_department}</span>
                    <span className="dot">•</span>
                    <span>{employee.designation}</span>
                  </div>
                  <div className="project-occupancy-item">
                    { employee.projects?.map((p, i)=>(
                        <div key={i} className="occupancy-info">
                          <div className='d-flex gap-5'>
                            <span>{p.project_name}</span>
                            <span className="occupancy-badge">
                              {p.occupancy}%
                            </span>
                          </div>
                          <span className="duration-badge">
                            {p.project_joined_date}m
                          </span>
                        </div>
                    ))}
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

export default LowOccupancyWidget;