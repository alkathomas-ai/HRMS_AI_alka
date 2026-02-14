import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip);

const DynamicWidget = ({ widgetData }) => {
  const { chartType, xAxis, yAxis, title, data } = widgetData;
  const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ff6b6b'];
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const dataKeys = data[0] ? Object.keys(data[0]) : [];
  const xKey = dataKeys[0] || xAxis;
  const yKey = dataKeys[1] || yAxis;

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
            <div style={{ paddingBottom: '5px', borderBottom: '1px solid #e0e0e0', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px' }}
              />
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
                style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px' }}
              >
                <option value={5}>5 rows</option>
                <option value={10}>10 rows</option>
                <option value={25}>25 rows</option>
                <option value={50}>50 rows</option>
              </select>
            </div>
            <div style={{ flex: 1, overflow: 'auto', maxHeight: '400px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f5f5f5', zIndex: 1 }}>
                  <tr>
                    {dataKeys.map(key => (
                      <th key={key} style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '14px', color: '#424242', borderBottom: '2px solid #e0e0e0', whiteSpace: 'nowrap' }}>
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      {dataKeys.map(key => (
                        <td key={key} style={{ padding: '12px', fontSize: '14px', color: '#616161' }}>{row[key] || '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px', borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#757575' }}>
                {filteredData.length} total | Page {page + 1} of {totalPages || 1}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: '6px 12px', border: '1px solid #e0e0e0', borderRadius: '4px', background: page === 0 ? '#f5f5f5' : '#fff', cursor: page === 0 ? 'not-allowed' : 'pointer' }}>‹</button>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ padding: '6px 12px', border: '1px solid #e0e0e0', borderRadius: '4px', background: page >= totalPages - 1 ? '#f5f5f5' : '#fff', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}>›</button>
              </div>
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
      <div className="chart-wrapper" style={{ height: chartType === 'table' ? '500px' : '250px', display: 'flex', flexDirection: 'column' }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default DynamicWidget;
