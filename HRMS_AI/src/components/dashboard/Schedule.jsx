import { useState, useMemo } from "react";
import { Icons } from "../../assets/icons";
import "./Dashboard.css"
import "./Schedule.css"
import WidgetPanel from './WidgetPanel';

const Schedule = ({isExpanded, onExpand, onClose}) => {
  const [activeTab, setActiveTab] = useState('Screening');
  const [selectedDateIndex, setSelectedDateIndex] = useState(null);

  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const isToday = date.toDateString() === today.toDateString();
      if (isToday && selectedDateIndex === null) {
        setSelectedDateIndex(i);
      }
      return {
        day: ['M', 'T', 'W', 'T', 'F', 'S'][i],
        date: date.getDate(),
        isToday
      };
    });
  }, []);

  const scheduleData = {
    Screening: [
      { time: '09:30', text: 'Interview with Habibur Rahman' },
      { time: '11:00', text: 'Design Task Review & QA' },
      { time: '12:30', text: 'Design Task Review' },
      { time: '14:00', text: 'Team Meeting' },
      { time: '15:30', text: 'Client Call - ABC Corp' }
    ],
    'Design Task': [
      { time: '10:00', text: 'UI/UX Design Review' },
      { time: '14:00', text: 'Prototype Presentation' }
    ],
    Interview: [
      { time: '09:00', text: 'Technical Interview - John Doe' },
      { time: '13:00', text: 'HR Interview - Jane Smith' },
      { time: '15:30', text: 'Final Round - Mike Johnson' }
    ]
  };

  return (
    <>
      <div className={`schedule-card ${!isExpanded ? 'compact' : ''}`}>
            <div className="header">
              <h3>Schedule</h3>
                {!isExpanded ? (
                    <span className="expand-icon" onClick={onExpand}>
                        <img src={Icons.expand} alt="" />
                    </span>
                    ) : (
                    <span className="expand-icon" onClick={onClose}>✕</span>
                )}
            </div>

            <div className="dates">
              {weekDays.map((day, idx) => (
                <div 
                  key={idx} 
                  className={`${selectedDateIndex === idx ? 'active' : ''} ${day.isToday ? 'today' : ''}`}
                  onClick={() => setSelectedDateIndex(idx)}
                  style={{ cursor: 'pointer' }}
                >
                  <span>{day.day}</span>
                  <p>{day.date}</p>
                </div>
              ))}
            </div>

            <div className="tabs">
              {Object.keys(scheduleData).map(tab => (
                <span 
                  key={tab}
                  className={activeTab === tab ? 'active' : ''}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </span>
              ))}
            </div>

            <div className="schedule-list">
              {scheduleData[activeTab].map((item, idx) => (
                <div key={idx} className="item">
                  <span className="time">{item.time}</span>
                  <span className="text">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
    </>
  );
};

export default Schedule;
