import React, { useState, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps';
import { useRef, useEffect } from 'react';
import './WorldMapWidget.css';

let cachedGeoData = null;
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const employeeLocations = [
  { name: "Tokyo", coordinates: [139.6917, 35.6895], count: 245, country: "Japan" },
  { name: "Chennai", coordinates: [80.2707, 13.0827], count: 189, country: "India" },
  { name: "Kochi", coordinates: [76.2673, 9.9312], count: 156, country: "India" },
  { name: "Gurgaon", coordinates: [77.0266, 28.4595], count: 298, country: "India" },
  { name: "Ho Chi Minh City", coordinates: [106.6297, 10.8231], count: 134, country: "Vietnam" },
  { name: "Hanoi", coordinates: [105.8542, 21.0285], count: 87, country: "Vietnam" },
  { name: "Mumbai", coordinates: [72.8777, 19.0760], count: 312, country: "India" },
  { name: "Bangalore", coordinates: [77.5946, 12.9716], count: 267, country: "India" }
];

const countryCoordinates = {
  "India": [78.9629, 20.5937],
  "Japan": [138.2529, 36.2048],
  "Vietnam": [108.2772, 14.0583]
};

const WorldMapWidget = ({ isSelected = true }) => {
  const [geoData, setGeoData] = useState(cachedGeoData);
  const [showCities, setShowCities] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState([80, 20]);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('All countries');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [colorKey, setColorKey] = useState(0); // Force re-render when colors change
  const dropdownRef = useRef(null);
  const ZOOM_THRESHOLD = 2.5;

  useEffect(() => {
    if (!isSelected || cachedGeoData) return;
    fetch(geoUrl)
      .then(res => res.json())
      .then(data => {
        cachedGeoData = data;
        setGeoData(data);
      });
  }, [isSelected]);

  // Listen for theme/color changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setColorKey(prev => prev + 1); // Force re-render when theme changes
    });
    
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['style', 'data-theme'] 
    });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const filteredLocations = useMemo(() => {
    if (selectedCountry === 'All countries') return employeeLocations;
    return employeeLocations.filter(location => location.country === selectedCountry);
  }, [selectedCountry]);

  const handleMoveEnd = (position) => {
    setCenter(position.coordinates);
    setZoom(position.zoom);
    if (position.zoom >= ZOOM_THRESHOLD && !showCities) {
      setShowCities(true);
    } else if (position.zoom < ZOOM_THRESHOLD && showCities) {
      setShowCities(false);
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.5, 8);
    setZoom(newZoom);
    if (newZoom >= ZOOM_THRESHOLD && !showCities) {
      setShowCities(true);
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.5, 1);
    setZoom(newZoom);
    if (newZoom < ZOOM_THRESHOLD && showCities) {
      setShowCities(false);
    }
  };

  const handleReset = () => {
    setZoom(1);
    setCenter([80, 20]);
    setShowCities(false);
  };

  const getMarkerSize = (count) => {
    if (count > 500) return 16;
    if (count > 250) return 12;
    if (count > 150) return 10;
    return 8;
  };

  const getMarkerColor = (count) => {
    const widget = document.querySelector('.world-map-widget');
    if (!widget) return '#dc2626'; // Fallback color
    
    const computedStyles = getComputedStyle(widget);
    
    if (count > 500) return computedStyles.getPropertyValue('--marker-color-very-high').trim() || '#7c2d12';
    if (count > 250) return computedStyles.getPropertyValue('--marker-color-high').trim() || '#dc2626';
    if (count > 150) return computedStyles.getPropertyValue('--marker-color-medium').trim() || '#ea580c';
    return computedStyles.getPropertyValue('--marker-color-low').trim() || '#16a34a';
  };

  const getCountryTotals = () => {
    const countryTotals = {};
    filteredLocations.forEach(location => {
      if (!countryTotals[location.country]) {
        countryTotals[location.country] = {
          count: 0,
          coordinates: countryCoordinates[location.country]
        };
      }
      countryTotals[location.country].count += location.count;
    });
    return countryTotals;
  };

  const countryTotals = getCountryTotals();
  const totalEmployees = filteredLocations.reduce((sum, location) => sum + location.count, 0);
  const maxCount = Math.max(...filteredLocations.map(loc => loc.count));
  const countries = ['All countries', ...new Set(employeeLocations.map(loc => loc.country))];

  if (!isSelected || !geoData) {
    return (
      <div className="world-map-widget">
        <div className="widget-header">
          <div className="total-employees">
            <span className="map-total-count">{totalEmployees}</span>
            <span className="total-label">Total Employees</span>
          </div>
        </div>
        <div className="map-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--color-text-secondary)' }}>
            {!isSelected ? 'Select widget to view map' : 'Loading map data...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="world-map-widget">
      <div className="widget-header">
        <div className="total-employees">
          <span className="map-total-count">{totalEmployees}</span>
          <span className="total-label">Total Employees</span>
        </div>
        <div className="country-selector" ref={dropdownRef}>
          <div className="custom-dropdown">
            <div 
              className="worldmap-dropdown-trigger"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
            >
              <span>{selectedCountry}</span>
              <svg 
                className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
                width="12" 
                height="12" 
                viewBox="0 0 12 12"
              >
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            {isDropdownOpen && (
              <div className="worldmap-dropdown-menu">
                {countries.map(country => (
                  <div 
                    key={country} 
                    className={`dropdown-item ${selectedCountry === country ? 'selected' : ''}`}
                    onClick={() => handleCountrySelect(country)}
                  >
                    {country}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="map-content">
        <div className="map-container">
          <div className="map-controls">
            <button className="control-btn" onClick={handleZoomIn} title="Zoom In">
              +
            </button>
            <button className="control-btn" onClick={handleZoomOut} title="Zoom Out">
              −
            </button>
            <button className="control-btn reset-btn" onClick={handleReset} title="Reset View">
              ⌂
            </button>
          </div>
          <ComposableMap
            projection="geoMercator"
            width={800}
            height={400}
          >
            <ZoomableGroup
              zoom={zoom}
              center={center}
              onMoveEnd={handleMoveEnd}
              minZoom={1}
              maxZoom={8}
            >
              <Geographies geography={geoData}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#e5e7eb"
                      stroke="#d1d5db"
                      strokeWidth={0.5}
                    />
                  ))
                }
              </Geographies>
              
              {showCities ? (
                filteredLocations.map(({ name, coordinates, count }) => (
                  <Marker key={name} coordinates={coordinates}>
                    <circle
                      key={`${name}-${colorKey}`}
                      r={getMarkerSize(count) / zoom}
                      fill={getMarkerColor(count)}
                      stroke="#fff"
                      strokeWidth={2 / zoom}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => setHoveredMarker(name)}
                      onMouseLeave={() => setHoveredMarker(null)}
                    />
                    <text
                      textAnchor="middle"
                      y={(getMarkerSize(count) + 20) / zoom}
                      style={{
                        fontFamily: "system-ui",
                        fontSize: `${12 / zoom}px`,
                        fill: "#374151",
                        fontWeight: "600",
                        pointerEvents: "none"
                      }}
                    >
                      {name}
                    </text>
                  </Marker>
                ))
              ) : (
                Object.entries(countryTotals).map(([country, data]) => (
                  <Marker key={country} coordinates={data.coordinates}>
                    <circle
                      key={`${country}-${colorKey}`}
                      r={getMarkerSize(data.count) / zoom}
                      fill={getMarkerColor(data.count)}
                      stroke="#fff"
                      strokeWidth={2 / zoom}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => setHoveredMarker(country)}
                      onMouseLeave={() => setHoveredMarker(null)}
                    />
                    <text
                      textAnchor="middle"
                      y={(getMarkerSize(data.count) + 20) / zoom}
                      style={{
                        fontFamily: "system-ui",
                        fontSize: `${14 / zoom}px`,
                        fill: "#374151",
                        fontWeight: "600",
                        pointerEvents: "none"
                      }}
                    >
                      {country}
                    </text>
                  </Marker>
                ))
              )}
              
              {hoveredMarker && showCities && (
                filteredLocations
                  .filter(({ name }) => name === hoveredMarker)
                  .map(({ name, coordinates, count }) => (
                    <Marker key={`tooltip-${name}`} coordinates={coordinates}>
                      <g>
                        <rect
                          x={-70 / zoom}
                          y={(-70) / zoom}
                          width={140 / zoom}
                          height={55 / zoom}
                          fill="#ffffff"
                          stroke="#cccccc"
                          strokeWidth={1 / zoom}
                          rx={4 / zoom}
                          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                        />
                        <text
                          textAnchor="middle"
                          y={(-50) / zoom}
                          style={{
                            fontFamily: "system-ui",
                            fontSize: `${16 / zoom}px`,
                            fill: "#000000",
                            fontWeight: "600",
                            pointerEvents: "none"
                          }}
                        >
                          {name}
                        </text>
                        <text
                          textAnchor="middle"
                          y={(-30) / zoom}
                          style={{
                            fontFamily: "system-ui",
                            fontSize: `${14 / zoom}px`,
                            fill: "#666666",
                            fontWeight: "400",
                            pointerEvents: "none"
                          }}
                        >
                          Employees: {count}
                        </text>
                      </g>
                    </Marker>
                  ))
              )}
              
              {hoveredMarker && !showCities && (
                Object.entries(countryTotals)
                  .filter(([country]) => country === hoveredMarker)
                  .map(([country, data]) => (
                    <Marker key={`tooltip-${country}`} coordinates={data.coordinates}>
                      <g>
                        <rect
                          x={-75 / zoom}
                          y={(-70) / zoom}
                          width={150 / zoom}
                          height={55 / zoom}
                          fill="#ffffff"
                          stroke="#cccccc"
                          strokeWidth={1 / zoom}
                          rx={4 / zoom}
                          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                        />
                        <text
                          textAnchor="middle"
                          y={(-50) / zoom}
                          style={{
                            fontFamily: "system-ui",
                            fontSize: `${16 / zoom}px`,
                            fill: "#000000",
                            fontWeight: "600",
                            pointerEvents: "none"
                          }}
                        >
                          {country}
                        </text>
                        <text
                          textAnchor="middle"
                          y={(-30) / zoom}
                          style={{
                            fontFamily: "system-ui",
                            fontSize: `${14 / zoom}px`,
                            fill: "#666666",
                            fontWeight: "400",
                            pointerEvents: "none"
                          }}
                        >
                          Total: {data.count}
                        </text>
                      </g>
                    </Marker>
                  ))
              )}
            </ZoomableGroup>
          </ComposableMap>
        </div>
        {/* <div className="heat-map-bar">
          <div className="bar-header">Employee Distribution</div>
          <div className="single-bar-chart">
            <div className="heat-bar">
              {filteredLocations.map(({ name, count }) => {
                const percentage = (count / maxCount) * 100;
                return (
                  <div 
                    key={name}
                    className="heat-segment"
                    style={{ 
                      height: `${percentage}%`,
                      backgroundColor: getMarkerColor(count)
                    }}
                    title={`${name}: ${count} employees`}
                  ></div>
                );
              })}
            </div>
            <div className="heat-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#16a34a' }}></div>
                <span>0-150</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#ea580c' }}></div>
                <span>151-250</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#dc2626' }}></div>
                <span>251-500</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#7c2d12' }}></div>
                <span>500+</span>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default WorldMapWidget;