import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const RadarChart = ({ data, xAxis, yAxis }) => {
  const colors = [
    { bg: 'rgba(102, 126, 234, 0.2)', border: '#667eea' },
    { bg: 'rgba(240, 147, 251, 0.2)', border: '#f093fb' },
    { bg: 'rgba(79, 172, 254, 0.2)', border: '#4facfe' },
    { bg: 'rgba(67, 233, 123, 0.2)', border: '#43e97b' },
    { bg: 'rgba(250, 112, 154, 0.2)', border: '#fa709a' }
  ];

  // Check if data has grouping field (like project_name)
  const allKeys = Object.keys(data[0] || {});
  const groupKey = allKeys.find(key => key !== xAxis && key !== yAxis);
  
  let datasets;
  let labels;

  if (groupKey) {
    // Multiple groups - create dataset for each group
    const groups = [...new Set(data.map(item => item[groupKey]))];
    const allLabels = [...new Set(data.map(item => item[xAxis]))];
    labels = allLabels;

    datasets = groups.map((group, index) => {
      const groupData = allLabels.map(label => {
        const item = data.find(d => d[xAxis] === label && d[groupKey] === group);
        return item ? item[yAxis] : 0;
      });

      return {
        label: group,
        data: groupData,
        backgroundColor: colors[index % colors.length].bg,
        borderColor: colors[index % colors.length].border,
        borderWidth: 2,
        pointBackgroundColor: colors[index % colors.length].border,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: colors[index % colors.length].border
      };
    });
  } else {
    // Single dataset
    labels = data.map(item => item[xAxis]);
    datasets = [{
      label: yAxis.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      data: data.map(item => item[yAxis]),
      backgroundColor: colors[0].bg,
      borderColor: colors[0].border,
      borderWidth: 2,
      pointBackgroundColor: colors[0].border,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: colors[0].border
    }];
  }

  const chartData = { labels, datasets };

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
      r: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
        pointLabels: {
          font: { size: 9 },
          callback: function(label) {
            return label.length > 15 ? label.substr(0, 15) + '...' : label;
          }
        },
        ticks: { font: { size: 9 } }
      }
    }
  };

  return <Radar data={chartData} options={options} />;
};

export default RadarChart;
