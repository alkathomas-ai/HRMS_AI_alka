import React, { useState } from 'react';
import './CreateWidgetModal.css';
import { generateStatsFromPrompt } from '../../services/api';

const AddStatsModal = ({ isOpen, onClose, onAdd }) => {
  const [label, setLabel] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('fa-solid fa-diagram-project');
  const [prompt, setPrompt] = useState('');
  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const iconOptions = [
    { value: 'fa-solid fa-users', label: 'Users' },
    { value: 'fa-solid fa-diagram-project', label: 'Projects' },
    { value: 'fa-solid fa-user-check', label: 'User Check' },
    { value: 'fa-solid fa-building', label: 'Building' },
    { value: 'fa-solid fa-briefcase', label: 'Briefcase' },
    { value: 'fa-solid fa-clock', label: 'Clock' },
    { value: 'fa-solid fa-star', label: 'Star' },
    { value: 'fa-solid fa-trophy', label: 'Trophy' },
    { value: 'fa-solid fa-eye', label: 'Trophy' },
    { value: 'fa-solid fa-tags', label: 'Tags' },
    { value: 'fa-solid fa-network-wired', label: 'Network' },
    { value: 'fa-solid fa-crosshairs', label: 'Target' },
    { value: 'fa-solid fa-arrows-down-to-people', label: 'Down-to-people' },
    { value: 'fa-solid fa-chart-line', label: 'Chart Line' },
    { value: 'fa-solid fa-chart-pie', label: 'Chart Pie' }
  ];

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!label.trim()) {
      setError('Label is required');
      return;
    }
    if (!prompt.trim()) {
      setError('User prompt is required to generate the stat value');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const response = await generateStatsFromPrompt({
        prompt: prompt.trim(),
        chartType: 'card'
      });


      console.log(response)

      // Extract the stat value from the API response
      let statValue = 0;
      if (response && typeof response === 'object') {
        // Try to extract a numeric value from the response
        if (response.value !== undefined) {
          statValue = response.value;
        } else if (response.count !== undefined) {
          statValue = response.count;
        } else if (response.total !== undefined) {
          statValue = response.total;
        }
      }

      const newStat = {
        id: Date.now(),
        label: label.trim(),
        value: statValue,
        icon: selectedIcon,
        prompt: prompt.trim()
      };

      onAdd(newStat);
      
      // Reset form
      setLabel('');
      setSelectedIcon('fa-solid fa-users');
      setPrompt('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to generate stat');
      console.error('Error generating stat:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Stat <i className="fa-solid fa-circle-info info-icon" title="Define and generate a key metric using AI. Supports only numeric values"></i>
          </h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>
                Label
                <i className="fa-solid fa-circle-info info-icon" title="Display name for the stat"></i>
              </label>
              <input
                type="text"
                placeholder="Enter stat label"
                value={label}
                onChange={(e) => { setLabel(e.target.value); setError(''); }}
                className={error && !label.trim() ? 'error' : ''}
              />
            </div>
            <div className="form-group" style={{ width: '150px' }}>
              <label>
                Icon
                <i className="fa-solid fa-circle-info info-icon" title="Choose an icon for your stat"></i>
              </label>
              <div className="chart-type-wrapper">
                <div className={`select-trigger ${isIconDropdownOpen ? 'open' : ''}`} onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)}>
                  <i className={selectedIcon}></i>
                  <span>{iconOptions.find(icon => icon.value === selectedIcon)?.label}</span>
                  <i className="fa-solid fa-chevron-down"></i>
                </div>
                {isIconDropdownOpen && (
                  <div className="dropdown-menu show">
                    {iconOptions.map(icon => (
                      <div key={icon.value} className="option" onClick={() => { setSelectedIcon(icon.value); setIsIconDropdownOpen(false); }}>
                        <i className={icon.value}></i>
                        <span>{icon.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label>
              User Prompt
              <i className="fa-solid fa-circle-info info-icon" title="Describe what data this stat should display and how to calculate it."></i>
            </label>
            <textarea
              placeholder="Describe what this stat should display and how to calculate the value..."
              value={prompt}
              onChange={(e) => { setPrompt(e.target.value.replace(/\s+/g, ' ').trimStart()); setError(''); }}
              rows={5}
              className={error && !prompt.trim() ? 'error' : ''}
            />
            {error && (
              <div className="error-message">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-generate" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStatsModal;