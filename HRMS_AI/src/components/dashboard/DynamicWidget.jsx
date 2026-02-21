import React, { useState, useRef, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip } from 'chart.js';
import GroupedBarChart from '../charts/GroupedBarChart';
import ScatterChart from '../charts/ScatterChart';
import RadarChart from '../charts/RadarChart';
import './DynamicWidget.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip);

const DynamicWidget = ({ widgetData }) => {
  const { chartType, xAxis, yAxis, title, data } = widgetData;
  const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ff6b6b'];
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const dataKeys = data[0] ? Object.keys(data[0]) : [];
  const xKey = xAxis || dataKeys.find(k => k.includes('name') || k.includes('project')) || dataKeys[0];
  const yKey = yAxis || dataKeys.find(k => k.includes('count') || k.includes('number')) || dataKeys[1];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderChart = () => {
    switch (chartType.toLowerCase()) {
      case 'bar': {
        const chartData = {
          labels: data.map(item => item[xKey]),
          datasets: [{ data: data.map(item => item[yKey]), backgroundColor: colors }]
        };
        return <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />;
      }
      
      case 'doughnut':
      case 'pie': {
        const chartData = {
          labels: data.map(item => item[xKey]),
          datasets: [{ data: data.map(item => item[yKey]), backgroundColor: colors }]
        };
        return <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />;
      }
      
      case 'line': {
        const chartData = {
          labels: data.map(item => item[xKey]),
          datasets: [{ data: data.map(item => item[yKey]), borderColor: '#667eea', backgroundColor: 'rgba(102, 126, 234, 0.1)', tension: 0.4 }]
        };
        return <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />;
      }
      
      case 'grouped_bar': {
        // Check if yAxis contains multiple values (comma-separated)
        if (yKey && yKey.includes(',')) {
          const yKeys = yKey.split(',').map(k => k.trim());
          const labels = data.map(item => item[xKey]);
          const datasets = yKeys.map((key, index) => ({
            label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            data: data.map(item => item[key] || 0),
            backgroundColor: colors[index % colors.length],
            maxBarThickness: 40,
          }));
          const chartData = { labels, datasets };
          const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8, font: { size: 10 } } },
              tooltip: { backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: 10 }
            },
            scales: {
              x: { grid: { display: false }, ticks: { font: { size: 9 } } },
              y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' }, ticks: { font: { size: 10 } } }
            }
          };
          return <Bar data={chartData} options={options} />;
        }
        // Regular grouped bar with groupBy field
        const allKeys = Object.keys(data[0] || {});
        const groupByKey = allKeys.find(key => key !== xKey && key !== yKey) || allKeys[2] || 'tech_group';
        return <GroupedBarChart data={data} xAxis={xKey} yAxis={yKey} groupBy={groupByKey} />;
      }
      
      case 'radar': {
        return <RadarChart data={data} xAxis={xKey} yAxis={yKey} />;
      }
      
      case 'scatter': {
        return <ScatterChart data={data} xAxis={xKey} yAxis={yKey} />;
      }
      
      case 'table': {
        const filteredData = data.filter(row => 
          dataKeys.some(key => 
            String(row[key] || '').toLowerCase().includes(search.toLowerCase())
          )
        );
        const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);

        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ paddingBottom: '5px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="text"
                className='dynamic-table-search'
                placeholder="Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                // style={{ flex: 1, padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px' }}
              />
              <div className="custom-select-wrapper" ref={dropdownRef}>
                <div className="select-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <span>{rowsPerPage} rows</span>
                  <i className="fa-solid fa-chevron-down"></i>
                </div>
                {isDropdownOpen && (
                  <div className="dropdown-menu show">
                    {[5, 10, 25, 50].map(num => (
                      <div key={num} className="option" onClick={() => { setRowsPerPage(num); setPage(0); setIsDropdownOpen(false); }}>
                        {num} rows
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={{ flex: 1, overflow: 'auto', maxHeight: '400px' }}>
              <table className='dynmaic-table' style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    {dataKeys.map(key => (
                      <th key={key} style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', whiteSpace: 'nowrap', background: 'var(--color-bg-muted)' }}>
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {dataKeys.map(key => (
                        <td key={key} style={{ padding: '12px', fontSize: '14px', color: 'var(--color-text-primary)' }}>{row[key] != null ? row[key] : '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                {filteredData.length} total | Page {page + 1} of {totalPages || 1}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: '6px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', background: page === 0 ? 'var(--color-bg-muted)' : 'var(--color-bg-card)', color: 'var(--color-text-primary)', cursor: page === 0 ? 'not-allowed' : 'pointer' }}>‹</button>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ padding: '6px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', background: page >= totalPages - 1 ? 'var(--color-bg-muted)' : 'var(--color-bg-card)', color: 'var(--color-text-primary)', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}>›</button>
              </div>
            </div>
          </div>
        );
      }

      case 'card': {
        const value = data[0] ? Object.values(data[0])[0] : 0;
        const label = dataKeys[0] ? dataKeys[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';
        return (
          <div className="stat-card">
            <div className="stat-card-icon">
              <i className="fa-solid fa-chart-simple"></i>
            </div>
            <div className="stat-card-content">
              <div className="stat-card-value">{value}</div>
              <div className="stat-card-label">{label || 'Total'}</div>
            </div>
          </div>
        );
      }
      
      default:
        return <div>Unsupported chart type: {chartType}</div>;
    }
  };

  return (
    <div className="dynamic-widget">
      <div className="chart-wrapper" style={{ height: chartType === 'table' ? '500px' : chartType === 'card' ? 'auto' : '250px', display: 'flex', flexDirection: 'column' }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default DynamicWidget;
