import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const GroupedBarChart = ({ data, xAxis, yAxis, groupBy }) => {
  const colors = [
    '#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ff6b6b',
    '#a8e6cf', '#ffd3b6', '#ffaaa5', '#ff8b94', '#c7ceea', '#b4f8c8'
  ];
  
  // Extract unique x-axis values and groups
  const xValues = [...new Set(data.map(item => item[xAxis]))];
  const groups = [...new Set(data.map(item => item[groupBy]))];
  
  // Create datasets for each group
  const datasets = groups.map((group, index) => {
    const groupData = xValues.map(xValue => {
      const item = data.find(d => d[xAxis] === xValue && d[groupBy] === group);
      return item ? item[yAxis] : 0;
    });
    
    return {
      label: group,
      data: groupData,
      backgroundColor: colors[index % colors.length],
      maxBarThickness: 40,
    };
  });

  const chartData = {
    labels: xValues,
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 8,
          font: { size: 10 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        titleFont: { size: 11 },
        bodyFont: { size: 10 }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 9 },
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 10 } }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

export default GroupedBarChart;
