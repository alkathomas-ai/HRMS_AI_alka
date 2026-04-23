import React from 'react';
import './SearchLoadingAnimation.css';

const SearchLoadingAnimation = () => {
  return (
    <div className="search-loading-container">
      <div className="search-icon-container" style={{marginRight: '8px'}}>
        <svg className="magnifying-glass" width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      
      <div className="loading-text">
        <span>Searching </span>
        <div className="dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      </div>
    </div>
  );
};

export default SearchLoadingAnimation;