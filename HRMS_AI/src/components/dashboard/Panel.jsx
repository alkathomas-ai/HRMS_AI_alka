import "./Panel.css"

const Panel = ({ children, expanded, title, onClose }) => {
  return (
    <div className={`panel ${expanded ? "expanded" : ""}`}>
      {/* {expanded && onClose && (
        <div className="panel-header">
          <h3>{title}</h3>
          <button className="panel-close" onClick={onClose}>✕</button>
        </div>
      )} */}
      {children}
    </div>
  );
};

export default Panel;
