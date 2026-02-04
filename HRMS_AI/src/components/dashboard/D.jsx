import React, { useState } from 'react'
// import "/components/dashboard/Dashboard.css";
import "./Dashboard.css";
import { Icons } from '../../assets/icons';


const D = () => {

const [dropdownOpen, setDropdownOpen] = useState(false)
const [selectedRoles, setSelectedRoles] = useState([])


const toggleDropdown = () => {
    setDropdownOpen(prev => !prev)
}

const selectOption = (value) => {
    setSelectedRoles(prev =>
      prev.includes(value)
        ? prev.filter(role => role !== value)
        : [...prev, value]
    )
}

const [layout, setLayout] = useState([
  { id: 'frontend' },
  { id: 'backend' }
])

const removeItem = (id) => {
  setLayout(prev => prev.filter(item => item.id !== id))
}

  const getWidgetData = (id) => ({
    title: `Widget ${id}`,
    content: 'Widget content here'
  })

 
const visibleLayout =
  selectedRoles.length === 0
    ? layout
    : layout.filter(item => selectedRoles.includes(item.id))


  return (
    <div className="dashboard">
      <div className="dashboard-grid">

        {/* LEFT COLUMN */}
        <div className="dashboard-left">
          <div className="card assistant-card justify-btw">
            <div className="assistant-header">
              <span className="assistant-badge bubbles">
                <img src={Icons.bubbles} alt="" className="bubbles-icon" srcSet=""/>
              </span>
              <span className="expand-icon">
                <img src={Icons.expand} alt="" srcSet=""/>
              </span>
        </div>

            <h3>Ready To Find Top Candidates Or Revisit Your Pipeline?</h3>

            <div className="assistant-links">
              <span><img src={Icons.search} alt="" srcSet=""/>Find Matches</span>
              <span><img src={Icons.briefcase} alt="" srcSet=""/>My Pipeline</span>
              <span><img src={Icons.pie} alt="" srcSet=""/>Insights</span>
            </div>

            <div className="assistant-control">            
            <div className="assistant-input dflex">
              <img src={Icons.plus} alt="Search" className="input-icon"/>
              <input type="text" placeholder="Ask me anything..."/>
            </div>
            <div className="assistant-microphone">
              <img src={Icons.microphone} alt="Microphone" className="mic-icon"/>
            </div>
          </div>

          </div>

          <div className="schedule-card">
            <div className="header">
              <h3>Schedule</h3>
              <div className="arrow">↗</div>
            </div>

            <div className="dates">
              <div><span>M</span><p>16</p></div>
              <div><span>T</span><p>17</p></div>
              <div><span>W</span><p>18</p></div>
              <div className="active"><span>T</span><p>19</p></div>
              <div><span>F</span><p>20</p></div>
              <div><span>S</span><p>21</p></div>
            </div>

            <div className="tabs">
              <span className="active">Screening</span>
              <span>Design Task</span>
              <span>Interview</span>
            </div>

            <div className="schedule-list">
              <div className="item">
                <span className="time">09:30</span>
                <span className="text">Interview with Habibur Rahman</span>
              </div>
              <div className="item">
                <span className="time">11:00</span>
                <span className="text">Design Task Review & QA</span>
              </div>
              <div className="item">
                <span className="time">12:30</span>
                <span className="text">Design Task Review</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="dashboard-right">

          {/* FILTER BAR */}
          <div className="filter-bar">
            <div className="filter-controls">

              <div className="multi-select">
                <div
                  className={`select-trigger ${dropdownOpen ? 'active' : ''}`}
                  onClick={toggleDropdown}
                >
                  <span className="placeholder">
                    {selectedRoles.length > 0
                      ? selectedRoles.join(', ')
                      : 'Select Widgets'}
                  </span>
                </div>

                {dropdownOpen && (
                  <div className="dropdown-menu">
                    {['frontend', 'backend', 'fullstack', 'mobile', 'devops'].map(role => (
                      <label key={role} className="option">
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role)}
                          onChange={() => selectOption(role)}
                        />
                        {role}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* GRID */}
          {visibleLayout.length > 0 && (
            <div className="grid-container">
              {layout.map(item => (
                <div key={item.id} className="grid-item-content">
                  <div className="grid-item-header">
                    <h4>{getWidgetData(item.id).title}</h4>
                    <button
                      className="close-btn"
                      onClick={() => removeItem(item.id)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="grid-item-body">
                    <p>{getWidgetData(item.id).content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default D