import React, { useState } from 'react';
import './CreateWidgetModal.css';
import { generateWidgetFromPrompt } from '../../services/api';

const CreateWidgetModal = ({ isOpen, onClose, onGenerate }) => {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      const response = await generateWidgetFromPrompt({
        title: title || 'Custom Widget',
        prompt
      });

      onGenerate(response);
      setTitle('');
      setPrompt('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create a Widget</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              placeholder="Enter widget title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>User Prompt</label>
            <textarea
              placeholder="Describe what you want this widget to display..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
            />
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-generate" onClick={handleGenerate}>
            Generate Widget
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWidgetModal;
