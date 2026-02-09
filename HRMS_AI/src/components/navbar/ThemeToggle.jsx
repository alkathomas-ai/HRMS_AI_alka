import React, { useState, useEffect } from 'react';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    const dark = saved === 'true';
    setIsDark(dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, []);

  const toggle = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', newMode);
  };

  return (
    <span
      className="material-symbols-outlined theme-toggle"
      onClick={toggle}
    >
      {isDark ? 'light_mode' : 'dark_mode'}
    </span>
  );
};

export default ThemeToggle;
