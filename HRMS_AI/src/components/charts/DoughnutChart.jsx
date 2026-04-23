import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ data, xAxis, yAxis }) => {
  const colors = [
    '#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ff6b6b',
    '#a8e6cf', '#ffd3b6', '#ffaaa5', '#ff8b94', '#c7ceea', '#b4f8c8'
  ];

  const chartData = {
    labels: data.map(item => item[xAxis]),
    datasets: [{
      data: data.map(item => item[yAxis]),
      backgroundColor: colors.slice(0, data.length),
      borderWidth: 2,
      borderColor: '#fff'
    }]
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
    }
  };

  return <Doughnut data={chartData} options={options} />;
};

export default DoughnutChart;