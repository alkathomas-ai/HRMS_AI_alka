import { Icons } from "../../assets/icons";
import "./Dashboard.css"
import WidgetPanel from './WidgetPanel';

const Schedule = ({isExpanded, onExpand, onClose}) => {
  return (
    <>
      <div className="schedule-card">
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
              <div><span>M</span><p>16</p></div>
              <div><span>T</span><p>17</p></div>
              <div><span>W</span><p>18</p></div>
              <div className="active"><span>T</span><p>19</p></div>
              <div><span>F</span><p>20</p></div>
              <div><span>S</span><p>21</p></div>
            </div>

            <div className="tabs">
              <span className="active">Screening</span>
              <span>Design Task</span>
              <span>Interview</span>
            </div>

            <div className="schedule-list">
              <div className="item">
                <span className="time">09:30</span>
                <span className="text">Interview with Habibur Rahman</span>
              </div>
              <div className="item">
                <span className="time">11:00</span>
                <span className="text">Design Task Review & QA</span>
              </div>
              <div className="item">
                <span className="time">12:30</span>
                <span className="text">Design Task Review</span>
              </div>
            </div>
          </div>
    </>
  );
};

export default Schedule;
