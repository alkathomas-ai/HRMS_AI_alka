import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: 'home', label: 'Home', path: '/' },
    { icon: 'group', label: 'Users', path: '/user' },
    // { icon: 'work', label: 'Projects', path: '/projects' },
    { icon: 'event', label: 'Schedule', path: '/schedule' },
    { icon: 'auto_awesome', label: 'AI Suggestions', path: '/ai-suggestions' },
    // { icon: 'stacks', label: 'Documents', path: '/d' },
    // { icon: 'pie_chart', label: 'Reports', path: '#' },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => {
              if (onNavigate) onNavigate();
              navigate(item.path);
            }}
            className={`sidebar-btn ${location.pathname === item.path ? 'active' : ''}`}
            aria-label={item.label}
            title={item.label}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {/* <span className="sidebar-label">{item.label}</span> */}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
