const Panel = ({ title, children, expanded, onExpand, onClose }) => {
  return (
    <div className={`panel ${expanded ? 'expanded' : ''}`}>
      <div className="panel-header">
        <h3>{title}</h3>

        {!expanded ? (
          <button className="expand-btn" onClick={onExpand}>⤢</button>
        ) : (
          <button className="close-btn" onClick={onClose}>✕</button>
        )}
      </div>

      <div className="panel-body">
        {children}
      </div>
    </div>
  );
};

export default Panel;
