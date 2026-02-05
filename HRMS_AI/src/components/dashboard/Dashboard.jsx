import React, { useState } from 'react';
import './Dashboard.css';
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
          {expandedPanel === 'assistant' && (
            <>
              <Panel title="Widgets">
                <WidgetPanel
                  isExpanded={false}
                  onExpand={() => setExpandedPanel('widgets')}
                />
              </Panel>
              <Panel title="Schedule">
                <Schedule
                  isExpanded={false}
                  onExpand={() => setExpandedPanel('schedule')}
                />
              </Panel>
            </>
          )}
          
          {expandedPanel === 'schedule' && (
            <>
              <Panel title="Assistant">
                <SearchAssistant
                  isExpanded={false}
                  onExpand={() => setExpandedPanel('assistant')}
                />
              </Panel>
              <Panel title="Widgets">
                <WidgetPanel
                  isExpanded={false}
                  onExpand={() => setExpandedPanel('widgets')}
                />
              </Panel>
            </>
          )}
          
          {expandedPanel === 'widgets' && (
            <>
              <Panel title="Assistant">
                <SearchAssistant
                  isExpanded={false}
                  onExpand={() => setExpandedPanel('assistant')}
                />
              </Panel>

              <Panel title="Schedule">
                <Schedule
                  isExpanded={false}
                  onExpand={() => setExpandedPanel('schedule')}
                />
              </Panel>
            </>
          )}
          
          {!expandedPanel && (
            <>
              <Panel title="Assistant">
                <SearchAssistant
                  isExpanded={false}
                  onExpand={() => setExpandedPanel('assistant')}
                />
              </Panel>

              <Panel title="Schedule">
                <Schedule
                  isExpanded={false}
                  onExpand={() => setExpandedPanel('schedule')}
                />
              </Panel>
            </>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="dashboard-right">
          {expandedPanel === 'widgets' && (
            <Panel
              title="Widgets"
              expanded
              onClose={() => setExpandedPanel(null)}
            >
              <WidgetPanel
                isExpanded={true}
                onExpand={() => setExpandedPanel('widgets')}
                onClose={() => setExpandedPanel(null)}
              />
            </Panel>
          )}

          {expandedPanel === 'assistant' && (
            <Panel
              title="Assistant"
              expanded
              onClose={() => setExpandedPanel(null)}
            >
              <SearchAssistant
                isExpanded
                onClose={() => setExpandedPanel(null)}
              />
            </Panel>
          )}

          {expandedPanel === 'schedule' && (
            <Panel
              title="Schedule"
              expanded
              onClose={() => setExpandedPanel(null)}
            >
              <Schedule
                isExpanded
                onClose={() => setExpandedPanel(null)}
              />
            </Panel>
          )}
          
          {!expandedPanel && (
            <Panel title="Widgets">
              <WidgetPanel
                isExpanded={null}
                onExpand={() => setExpandedPanel('widgets')}
              />
            </Panel>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
