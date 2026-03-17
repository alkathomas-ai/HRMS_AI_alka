import React, { useState, useEffect, useRef, useContext } from "react";
import "./Navbar.css";
import { useNavigate, useLocation } from "react-router-dom";
import { Icons } from "../../assets/icons";
import ColorPalette from "./ColorPalette";
import ThemeToggle from "./ThemeToggle";
import AnimatedSearchInput from "../dashboard/AnimatedSearchInput";
import UploadCSVModal from "../dashboard/UploadCSVModal";
import NavbarSearchResults from "./NavbarSearchResults";
import SearchLoadingAnimation from "./SearchLoadingAnimation";
import { searchAPI } from "../../services/api";
import { EmployeeContext } from "../../context/employeeContext";
import { useScheduleNotification } from "../../context/scheduleNotificationContext";

const Navbar = ({ onCSVUpload, onCloseSearchResults }) => {
  const { notifications, markAllAsRead } = useScheduleNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearchResults, setHasSearchResults] = useState(false);
  const [username, setUsername] = useState('');
  const notifRef = useRef(null);
  const avatarRef = useRef(null);
  const { setSearchResult } = useContext(EmployeeContext);

  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
    setUsername(storedUsername || 'User');
  }, []);

  const getAvatarUrl = () => {
    if (!username) return 'https://i.pravatar.cc/32';
    return `https://i.pravatar.cc/32?name=${encodeURIComponent(username)}`;
  };

  const handleCloseSearch = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowSearchResults(false);
      setIsClosing(false);
    }, 300);
  };

  // Expose close function to parent
  React.useEffect(() => {
    if (onCloseSearchResults) {
      onCloseSearchResults.current = handleCloseSearch;
    }
  }, [onCloseSearchResults]);

  const handleReopenSearch = () => {
    if (hasSearchResults) {
      setShowSearchResults(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('username');
    navigate('/login');
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    
    setIsSearching(true);
    setShowSearchResults(true);
    
    try {
      const response = await searchAPI(searchValue);
      const employees = response?.data || response?.employee || [];
      setSearchResult({ result: employees, viewModeCard: "card" });
      setHasSearchResults(employees.length > 0);
    } catch (error) {
      console.error(error);
      setSearchResult({ result: [], viewModeCard: "card" });
      setHasSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setShowAvatarDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const today = new Date();

  const day = today.getDate();
  const weekday = today.toLocaleDateString("en-US", { weekday: "short" });
  const month = today.toLocaleDateString("en-US", { month: "long" });

  const todayNotifications = notifications.filter(
    (n) => !n.read && n.time.includes("h ago"),
  );
  const hasUnread = todayNotifications.length > 0;

  return (
    <header className="topbar">
      {/* Left section  */}
      <div className="topbar-left">
        <div className="logo">
          {/* <img src={Icons.logo} className="logo-icon" /> */}
          <span className="logo-text">HRMS.<span className="logo-ai">AI</span></span>
        </div>
      </div>

      {/* Center icons */}
      <div className="topbar-center">
          {/* {hasSearchResults && !showSearchResults && ( */}
            <button
              className="icon-btn history-btn"
              aria-label="View Search Results"
              onClick={handleReopenSearch}
              title="View search previous results"
              style={{ visibility: hasSearchResults && !showSearchResults ? "visible" : "hidden" }}
            >
              <span className="material-symbols-outlined">history</span>
            </button>
          {/* )} */}
        <div className="search-bar">
          <div className="search-icon-wrapper">
            <span className="material-symbols-outlined search-icon">search</span>
            <span className="material-symbols-outlined spark-icon">auto_awesome</span>
          </div>
          <AnimatedSearchInput
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchValue.trim()) {
                handleSearch();
              }
            }}
            className="search-input"
            prompts={[
              "Ask me anything...",
              "Search employees...",
              "Find projects...",
              "Explore departments..."
            ]}
          />
        </div>
          <button
            className="icon-btn"
            aria-label="Upload CSV"
            title="Upload CSV"
            onClick={() => setShowUploadModal(true)}
          >
            <span className="material-symbols-outlined">upload</span>
          </button>
      </div>

      {/* Right section */}
      <div className="topbar-right">
        <ThemeToggle />
        <ColorPalette />
        <div className="date">
          <span className="day">{day}</span>
          <div className="date-meta">
            <span className="weekday">{weekday}</span>
            <span className="month">{month}</span>
          </div>
        </div>

        <div className="notif-wrapper" ref={notifRef}>
          <button
            className={`icon-btn ${showNotifDropdown ? "active" : ""}`}
            aria-label="Notifications"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
          >
            <span className="material-symbols-outlined">notifications</span>
            {hasUnread && <span className="notif-badge"></span>}
          </button>
          {showNotifDropdown && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                <h4>Notifications</h4>
                {todayNotifications.length > 0 && (
                  <button
                    className="mark-all-read"
                    onClick={() => markAllAsRead()}
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="notif-dropdown-list">
                {todayNotifications.length > 0 ? (
                  todayNotifications.map((notif) => (
                    <div key={notif.id} className="notif-dropdown-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                      </svg>
                      <div>
                        <h5>{notif.title}</h5>
                        <p>{notif.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="notif-empty">No new notifications</div>
                )}
              </div>
              <button
                className="notif-show-all"
                onClick={() => {
                  setShowNotifDropdown(false);
                  navigate('schedule', { state: { expandSchedule: true, scheduleTab: 'notification', timestamp: Date.now() } });
                }}
              >
                Show all notifications
              </button>
            </div>
          )}
        </div>

        <div className="avatar-wrapper" ref={avatarRef}>
          <button
            className="avatar"
            onClick={() => setShowAvatarDropdown(!showAvatarDropdown)}
            aria-label="User menu"
          >
            <img src={getAvatarUrl()} alt="User avatar" />
          </button>
          {showAvatarDropdown && (
            <div className="avatar-dropdown">
              <button className="avatar-dropdown-item logout-btn" onClick={handleLogout}>
                <span className="material-symbols-outlined">logout</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Results Panel */}
      {showSearchResults && (
        <div className={`search-results-panel ${isClosing ? 'closing' : ''}`}>
          <div className="search-results-header">
            {!isSearching && (<h3>Search Results</h3>)}
            {/* <button className="search-results-close-btn" onClick={handleCloseSearch}>
              <span class="material-symbols-outlined">
              keyboard_return
              </span>
            </button> */}
          </div>
          <div className="search-results-content">
            {isSearching ? (
              <SearchLoadingAnimation />
            ) : (
              <NavbarSearchResults searchQuery={searchValue} />
            )}
          </div>
        </div>
      )}

      <UploadCSVModal 
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={(file) => {
          setShowUploadModal(false);
          onCSVUpload?.(file);
        }}
      />
    </header>
  );
};

export default Navbar;
