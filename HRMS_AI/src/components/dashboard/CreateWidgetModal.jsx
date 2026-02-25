import React, { useState, useRef, useEffect } from 'react';
import './CreateWidgetModal.css';
import { generateWidgetFromPrompt } from '../../services/api';
// import bubbles from '../../assets/icons/bubbles.svg';

const CreateWidgetModal = ({ isOpen, onClose, onGenerate, editingWidget }) => {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [chartType, setChartType] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (editingWidget) {
      setTitle(editingWidget.title || '');
      setPrompt(editingWidget.prompt || '');
      const type = editingWidget.chartType || 'auto';
      setChartType(['grouped_bar', 'multi_bar'].includes(type) ? 'bar' : type);
    } else {
      setTitle('');
      setPrompt('');
      setChartType('auto');
    }
    setError('');
  }, [editingWidget, isOpen]);

  const chartTypes = [
    { value: 'auto', label: 'Auto', icon: 'fa-wand-magic-sparkles' },
    { value: 'bar', label: 'Bar', icon: 'fa-chart-column' },
    { value: 'scatter', label: 'Scatter', icon: 'fa-arrow-up-right-dots' },
    { value: 'radar', label: 'Radar', icon: 'fa-hexagon-nodes' },
    { value: 'pie', label: 'Pie', icon: 'fa-chart-pie' },
    { value: 'line', label: 'Line', icon: 'fa-chart-line' },
    { value: 'table', label: 'Table', icon: 'fa-table' },
    { value: 'card', label: 'Card', icon: 'fa-square' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Prompt is required to generate a widget');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const response = await generateWidgetFromPrompt({
        title: title || 'Custom Widget',
        prompt,
        chartType: chartType === 'auto' ? "None" : chartType
      });

      onGenerate(response, prompt);
      setTitle('');
      setPrompt('');
      setChartType('auto');
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* {loading && (
          <div className="loading-overlay">
            <img src={bubbles} alt="Loading" style={{ width: '60px', height: '60px' }} />
            <p>Generating your widget...</p>
          </div>
        )} */}
        <div className="modal-header">
          <h3>{editingWidget ? 'Edit Widget' : 'Create a Widget'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>
                Title
                <i className="fa-solid fa-circle-info info-icon" title="Auto-generated if not provided"></i>
              </label>
              <input
                type="text"
                placeholder="Enter widget title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ width: '150px' }}>
              <label>
                Representation
                <i className="fa-solid fa-circle-info info-icon" title="Preferred representation may change if it doesn't match the data structure"></i>
              </label>
              <div className="chart-type-wrapper" ref={dropdownRef}>
                <div className="select-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <i className={`fa-solid ${chartTypes.find(t => t.value === chartType)?.icon}`}></i>
                  <span>{chartTypes.find(t => t.value === chartType)?.label}</span>
                  <i className="fa-solid fa-chevron-down"></i>
                </div>
                {isDropdownOpen && (
                  <div className="dropdown-menu show">
                    {chartTypes.map(type => (
                      <div key={type.value} className="option" onClick={() => { setChartType(type.value); setIsDropdownOpen(false); }}>
                        <i className={`fa-solid ${type.icon}`}></i>
                        <span>{type.label}</span>
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
              <i className="fa-solid fa-circle-info info-icon" title="Tell us what data you want to see."></i>
            </label>
            <textarea
              placeholder="Describe what you want this widget to display..."
              value={prompt}
              onChange={(e) => { setPrompt(e.target.value); setError(''); }}
              rows={5}
              className={error ? 'error' : ''}
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
          <button className="btn-generate" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating...' : editingWidget ? 'Update Widget' : 'Generate Widget'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWidgetModal;