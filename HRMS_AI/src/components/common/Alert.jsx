import React from 'react';
import './Alert.css';

const Alert = ({ message, show, type = 'info' }) => {
  if (!show) return null;

  return (
    <div className={`custom-alert alert-${type}`}>
      <i className="fa-solid fa-circle-exclamation"></i>
      <span>{message}</span>
    </div>
  );
};

export default Alert;
