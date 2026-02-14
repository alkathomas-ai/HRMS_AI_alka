import BarChart from './charts/BarChart';
import DoughnutChart from './charts/DoughnutChart';

const DynamicWidget = ({ widget }) => {
  const { chartType, data, xAxis, yAxis, title } = widget;

  if (!data || !data.length) return <div>No data available</div>;

  const formattedData = data.map(item => ({
    label: item[xAxis],
    value: item[yAxis]
  }));

  switch (chartType) {
    case 'bar':
      return (
        <>
          <div className="grid-item-header">
            <h4>{title}</h4>
          </div>
          <BarChart data={formattedData} />
        </>
      );

    case 'doughnut':
        return (
          <>
            <div className="grid-item-header">
              <h4>{title}</h4>
            </div>
            <DoughnutChart data={formattedData} />
          </>
        );

    case 'table':
      return (
        <>
          <div className="grid-item-header">
            <h4>{title}</h4>
          </div>
          <table className="dynamic-table">
            <thead>
              <tr>
                {Object.keys(data[0]).map(key => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((val, i) => (
                    <td key={i}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );

    default:
      return <div>Unsupported widget type</div>;
  }
};

export default DynamicWidget;
