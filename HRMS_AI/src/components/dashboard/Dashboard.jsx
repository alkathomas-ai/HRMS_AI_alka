import React, { useState } from 'react';
import './Dashboard.css';
import { Icons } from '../../assets/icons';
import Panel from './Panel';
import WidgetPanel from './WidgetPanel';
import SearchAssistant from './SearchAssistant';
import Schedule from './Schedule';

const Dashboard = () => {
  const [expandedPanel, setExpandedPanel] = useState(null);

  return (
    <div className="dashboard">
      <div className="dashboard-grid">

        {/* LEFT COLUMN */}
        <div className="dashboard-left">
          {!expandedPanel && (
            <>
              <Panel
                title="Assistant"
                icon={Icons.expand}
                onExpand={() => setExpandedPanel('assistant')}
              >
                <SearchAssistant />
              </Panel>

              <Panel
                title="Schedule"
                onExpand={() => setExpandedPanel('schedule')}
              >
                <Schedule />
              </Panel>
            </>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="dashboard-right">
          {expandedPanel ? (
            <Panel
              title={expandedPanel}
              expanded
              onClose={() => setExpandedPanel(null)}
            >
              {expandedPanel === 'widgets' && <WidgetPanel />}
              {expandedPanel === 'assistant' && <SearchAssistant />}
              {expandedPanel === 'schedule' && <Schedule />}
            </Panel>
          ) : (
            <Panel
              title="Widgets"
              onExpand={() => setExpandedPanel('widgets')}
            >
              <WidgetPanel />
            </Panel>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
