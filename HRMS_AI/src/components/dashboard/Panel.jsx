const Panel = ({ children, expanded }) => {
  return (
    <div className={`panel ${expanded ? "expanded" : ""}`}>
      {children}
    </div>
  );
};

export default Panel;
