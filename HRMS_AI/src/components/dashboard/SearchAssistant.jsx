import { Icons } from '../../assets/icons';
import './Dashboard.css';

const SearchAssistant = () => {
  return (
    <>
     <div className="card assistant-card justify-btw">
                 <div className="assistant-header">
                   <span className="assistant-badge bubbles">
                     <img src={Icons.bubbles} alt="" className="bubbles-icon" srcSet=""/>
                   </span>
                   <span className="expand-icon">
                     <img src={Icons.expand} alt="" srcSet=""/>
                   </span>
             </div>
     
                 <h3>Ready To Find Top Candidates Or Revisit Your Pipeline?</h3>
     
                 <div className="assistant-links">
                   <span><img src={Icons.search} alt="" srcSet=""/>Find Matches</span>
                   <span><img src={Icons.briefcase} alt="" srcSet=""/>My Pipeline</span>
                   <span><img src={Icons.pie} alt="" srcSet=""/>Insights</span>
                 </div>
     
                 <div className="assistant-control">            
                 <div className="assistant-input dflex">
                   <img src={Icons.plus} alt="Search" className="input-icon"/>
                   <input type="text" placeholder="Ask me anything..."/>
                 </div>
                 <div className="assistant-microphone">
                   <img src={Icons.microphone} alt="Microphone" className="mic-icon"/>
                 </div>
               </div>
     
               </div>
    </>
  );
};

export default SearchAssistant;
