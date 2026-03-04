import React, { useState, useEffect, useMemo } from 'react';
import './Dashboard.css';
import Panel from './Panel';
import WidgetPanel from './WidgetPanel';
import SearchAssistant from './SearchAssistant';
import Schedule from './Schedule';
import { useLocation } from 'react-router-dom';

const Dashboard = ({ csvFile }) => {
  const location = useLocation();
  const [expandedPanel, setExpandedPanel] = useState(null);
  const [scheduleTab, setScheduleTab] = useState('schedule');

  useEffect(() => {
    if (location.state?.expandSchedule) {
      setExpandedPanel('schedule');
      setScheduleTab(location.state.scheduleTab || 'schedule');
    }
  }, [location.state?.timestamp]);

  const leftPanels = useMemo(() => {
    const panels = [
      { key: 'assistant', title: 'Assistant', Component: SearchAssistant, props: { csvFile } },
      { key: 'schedule', title: 'Schedule', Component: Schedule, props: {} },
      { key: 'widgets', title: 'Widgets', Component: WidgetPanel, props: {} }
    ];
    return panels.filter(p => p.key !== expandedPanel);
  }, [expandedPanel]);
  // const [notifications, setNotifications] = useState([
  //   { id: 1, title: 'Interview Reminder', text: 'Interview with Habibur Rahman at 09:30 AM', time: '2h ago', read: false },
  //   { id: 2, title: 'Schedule Updated', text: "Willem van Helden's interview rescheduled", time: '5h ago', read: false },
  //   { id: 3, title: 'Task Completed', text: 'Design Task Review completed', time: '1d ago', read: true },
  //   { id: 4, title: 'New Application', text: 'New application received for Chef position', time: '2d ago', read: false },
  //   { id: 5, title: 'Meeting Reminder', text: 'Team standup meeting in 30 minutes', time: '1h ago', read: false },
  //   { id: 6, title: 'Document Uploaded', text: 'Employee handbook updated by HR', time: '3h ago', read: false },
  //   { id: 7, title: 'Leave Request', text: 'John Doe submitted leave request for approval', time: '4h ago', read: true },
  //   { id: 8, title: 'Payroll Processed', text: 'Monthly payroll has been processed successfully', time: '1d ago', read: true },
  //   { id: 9, title: 'New Message', text: 'You have a new message from Sarah Johnson', time: '6h ago', read: false },
  //   { id: 10, title: 'Training Session', text: 'Mandatory safety training scheduled for tomorrow', time: '2d ago', read: true },
  //   { id: 11, title: 'Performance Review', text: 'Q4 performance reviews are now open', time: '3d ago', read: false },
  //   { id: 12, title: 'System Update', text: 'HRMS system will be updated tonight at 10 PM', time: '5h ago', read: true },
  // ]);

  // const handleNotificationClick = () => {
  //   setExpandedPanel('schedule');
  //   setScheduleTab('notification');
  // };

  // const handleMarkAllRead = () => {
  //   setNotifications(notifications.map(n => ({ ...n, read: true })));
  // };

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <div className="dashboard-left">
          {leftPanels.slice(0, 2).map(({ key, title, Component, props }) => (
            <Panel key={key} title={title}>
              <Component
                isExpanded={false}
                onExpand={() => setExpandedPanel(key)}
                {...props}
              />
            </Panel>
          ))}
        </div>

        <div className="dashboard-right">
          {expandedPanel ? (
            <Panel title={expandedPanel.charAt(0).toUpperCase() + expandedPanel.slice(1)} expanded onClose={() => setExpandedPanel(null)}>
              {expandedPanel === 'assistant' && <SearchAssistant isExpanded onClose={() => setExpandedPanel(null)} csvFile={csvFile} />}
              {expandedPanel === 'schedule' && <Schedule isExpanded onClose={() => setExpandedPanel(null)} activeTab={scheduleTab} onTabChange={setScheduleTab} />}
              {expandedPanel === 'widgets' && <WidgetPanel isExpanded onClose={() => setExpandedPanel(null)} />}
            </Panel>
          ) : (
            <Panel title="Widgets">
              <WidgetPanel isExpanded={null} onExpand={() => setExpandedPanel('widgets')} />
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);