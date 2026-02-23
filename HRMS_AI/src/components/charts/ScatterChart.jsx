import React from 'react';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const ScatterChart = ({ data, xAxis, yAxis }) => {
  const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ff6b6b'];
  
  // Find size field (occupancy or any other numeric field not x or y)
  const allKeys = Object.keys(data[0] || {});
  const sizeKey = allKeys.find(key => 
    key !== xAxis && key !== yAxis && 
    typeof data[0][key] === 'number' &&
    !key.includes('id')
  );

  const scatterData = data.map((item, index) => ({
    x: item[xAxis],
    y: item[yAxis],
    r: sizeKey ? Math.max(3, item[sizeKey] / 10) : 5,
    label: item.display_name || item.employee_id || `Point ${index + 1}`
  }));

  const chartData = {
    datasets: [{
      label: 'Data Points',
      data: scatterData,
      backgroundColor: colors.map((c, i) => 
        scatterData.map((_, idx) => colors[idx % colors.length])
      ).flat(),
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        callbacks: {
          label: (context) => {
            const point = scatterData[context.dataIndex];
            return [
              point.label,
              `${xAxis}: ${point.x}`,
              `${yAxis}: ${point.y}`,
              sizeKey ? `${sizeKey}: ${data[context.dataIndex][sizeKey]}` : ''
            ].filter(Boolean);
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: xAxis.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          font: { size: 11 }
        },
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 10 } }
      },
      y: {
        title: {
          display: true,
          text: yAxis.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          font: { size: 11 }
        },
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 10 } }
      }
    }
  };

  return <Scatter data={chartData} options={options} />;
};

export default ScatterChart;
