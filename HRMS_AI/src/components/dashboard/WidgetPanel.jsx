import React, { useState } from 'react';

const WidgetPanel = () => {
  const [widgets, setWidgets] = useState([
    { id: 'frontend' },
    { id: 'backend' },
    { id: 'devops' }
  ]);

  const removeWidget = (id) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div className="grid-container">
      {widgets.map(widget => (
        <div key={widget.id} className="grid-item-content">
          <div className="grid-item-header">
            <h4>{widget.id}</h4>
            <button onClick={() => removeWidget(widget.id)}>×</button>
          </div>
          <p>Widget content here</p>
        </div>
      ))}
    </div>
  );
};

export default WidgetPanel;
