import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

const LineChart = ({ data, xKey, yKey }) => {
  const chartData = {
    labels: data.map(item => item[xKey]),
    datasets: [{
      data: data.map(item => item[yKey]),
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      tension: 0.4,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y}`
        }
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { display: true } },
      x: { grid: { display: false } }
    }
  };

  return <Line data={chartData} options={options} />;
};

export default LineChart;
