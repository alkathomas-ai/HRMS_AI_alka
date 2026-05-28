import React, { useState, useEffect } from 'react';
import './DeploymentCountWidget.css';
import { getDeploymentCount } from '../../services/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const DeploymentCountWidget = () => {
  const [deploymentData, setDeploymentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeploymentCount = async () => {
      try {
        setLoading(true);
        const result = await getDeploymentCount();
        
        if (result.status === 200 && result.data) {
          setDeploymentData(result.data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching deployment count:', err);
        setError('Failed to load deployment data');
        setLoading(false);
      }
    };

    fetchDeploymentCount();
  }, []);

  if (loading) {
    return (
      <div className="deployment-widget">
        <div className="loader">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="deployment-widget">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const totalResources = deploymentData.reduce((sum, item) => sum + item.total_resources, 0);
  const colors = [
    'rgba(102, 126, 234, 0.8)',
    'rgba(240, 147, 251, 0.8)',
    'rgba(79, 172, 254, 0.8)',
    'rgba(67, 233, 123, 0.8)',
    'rgba(250, 112, 154, 0.8)',
    'rgba(255, 107, 107, 0.8)',
    'rgba(78, 205, 196, 0.8)',
    'rgba(69, 183, 209, 0.8)'
  ];

  const barData = {
    labels: deploymentData.map(item => item.deployment),
    datasets: [{
      label: 'Resources',
      data: deploymentData.map(item => item.total_resources),
      backgroundColor: colors.slice(0, deploymentData.length),
      borderRadius: 6,
      borderSkipped: false,
      barThickness: 'flex',
      maxBarThickness: 50
    }]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'var(--color-primary)',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y} resources`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: 'var(--color-text-secondary)',
          font: { size: 12 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'var(--color-text-secondary)',
          font: { size: 12 }
        }
      }
    }
  };

  return (
    <div className="deployment-widget">
      <div className="deployment-header">
        <div className="header-content">
          <p className="deployment-subtitle">Total Resources: <span className="total-count">{totalResources}</span></p>
        </div>
      </div>

      {/* <div className="chart-container">
        <Bar data={barData} options={barChartOptions} />
      </div> */}

      <div className="deployment-stats-list">
        {deploymentData.map((item, index) => {
          const percentage = Math.round((item.total_resources / totalResources) * 100);
          return (
            <div key={item.deployment} className="stat-card">
              <div className="stat-left">
                <div className="stat-color-indicator" style={{ backgroundColor: colors[index % colors.length] }}></div>
                <div className="stat-info">
                  <div className="stat-deployment-name">{item.deployment}</div>
                  <div className="stat-percentage-bar">
                    <div className="percentage-fill" style={{ width: `${percentage}%`, backgroundColor: colors[index % colors.length] }}></div>
                  </div>
                </div>
              </div>
              <div className="stat-right">
                <span className="stat-count">{item.total_resources}</span>
                <span className="stat-percent">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeploymentCountWidget;
