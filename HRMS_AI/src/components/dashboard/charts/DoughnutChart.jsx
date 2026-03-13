import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ data, total }) => {
  const colors = [
    'rgba(102, 126, 234, 0.8)',
    'rgba(240, 147, 251, 0.8)',
    'rgba(79, 172, 254, 0.8)',
    'rgba(67, 233, 123, 0.8)',
    'rgba(250, 112, 154, 0.8)'
  ];

  const chartData = {
    labels: data.map(item => item.project),
    datasets: [{
      data: data.map(item => item.employee_count),
      backgroundColor: colors,
      borderWidth: 0,
      cutout: '60%'
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed} employees`
        }
      }
    },

  };

  return <Doughnut data={chartData} options={options} />;
};

export default DoughnutChart;
