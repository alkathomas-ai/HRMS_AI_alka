import { Icons } from '../../assets/icons';
import './Dashboard.css';
import './SearchAssistant.css';
import WidgetPanel from './WidgetPanel';
import { useRef, useState } from 'react';

const SearchAssistant = ({ isExpanded, onExpand, onClose }) => {
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatHistory] = useState([
    { id: 1, title: 'Top Candidates Search' },
    { id: 2, title: 'Pipeline Review' },
    { id: 3, title: 'Recruitment Insights' },
    { id: 4, title: 'Interview Scheduling' },
    { id: 5, title: 'Candidate Evaluation' },
  ]);

  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      console.log('CSV file selected:', file.name);
      setUploadedFile(file);
    } else if (file) {
      alert('Please select a CSV file');
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMicClick = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];

        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          console.log('Audio recorded:', blob);
          // Add your audio processing logic here
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        alert('Microphone access denied');
      }
    }
  };

  return (
    <>
      {isExpanded ? (
        <div className="chat-container">
          {sidebarCollapsed && (
            <button className="sidebar-expand-btn" onClick={() => setSidebarCollapsed(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
            </button>
          )}
          
          <div className={`chat-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-content">
              <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="9" y1="3" x2="9" y2="21"/>
                </svg>
              </button>
              
              {!sidebarCollapsed && (
                <>
                  <button className="new-chat-btn">
                    <span className="material-symbols-outlined">
                      chat_add_on
                    </span>
                    <span>New chat</span>
                  </button>
                  
                  <div className="sidebar-search">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input type="text" placeholder="Search" />
                  </div>
                  
                  <div className="chat-history">
                    {chatHistory.map(chat => (
                      <div key={chat.id} className={`chat-history-item ${chat.id === 1 ? 'active' : ''}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span>{chat.title}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="chat-main">
            <div className="chat-messages">
            <div className="chat-welcome">
              <div className="chat-welcome-icon">
                <span className="material-symbols-outlined">smart_toy</span>
              </div>
              <h2>How can I help you today?</h2>
            </div>
          </div>
          
          <div className="chat-input-container">
            <div className="assistant-filename-container">
            {uploadedFile && (
              <div className="chat-file">
                <span className="material-symbols-outlined file-icon">description</span>
                <span>{uploadedFile.name}</span>
                <button className="remove-file-btn" onClick={handleRemoveFile}>✕</button>
              </div>
            )}
            <div className="chat-input-wrapper">
              {/* <img src={Icons.plus} alt="Attach" onClick={handlePlusClick} style={{ cursor: 'pointer' }} /> */}
              <span alt="Attach" onClick={handlePlusClick} className="material-symbols-outlined">
                upload_file
              </span>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" style={{ display: 'none' }} />
              <input type="text" placeholder="Message Assistant..." />
              <span className="material-symbols-outlined" onClick={handleMicClick} style={{ cursor: 'pointer', opacity: isRecording ? 0.5 : 1 }}>mic</span>
              <button className="chat-submit-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            </div>
          </div>
          </div>
        </div>
      ) : (
      <div className={`card assistant-card justify-btw ${!isExpanded ? 'compact' : ''}`}>
        <div className="assistant-header">
          <span className="assistant-badge bubbles">
            <span className="material-symbols-outlined">smart_toy</span>
          </span>

          {!isExpanded ? (
            <span className="expand-icon" onClick={onExpand}>
              <span className="material-symbols-outlined">open_in_full</span>
            </span>
          ) : (
            <span className="expand-icon" onClick={onClose}>✕</span>
          )}

        </div>
        <div>
          <h3>Ready To Find Top Candidates Or Revisit Your Pipeline?</h3>

          <div className="assistant-links">
            <span><span className="material-symbols-outlined">search</span>Find Matches</span>
            <span><span className="material-symbols-outlined">work</span>My Pipeline</span>
            <span><span className="material-symbols-outlined">pie_chart</span>Insights</span>
          </div>

          <div className="assistant-control">
            {uploadedFile && (
              <div className="assistant-file">
                <span className="material-symbols-outlined file-icon">description</span>
                <span>{uploadedFile.name}</span>
                <button className="remove-file-btn" onClick={handleRemoveFile}>✕</button>
              </div>
            )}
            <div className="assistant-box">
              <div className="assistant-input dflex">
                {/* <img src={Icons.plus} alt="Search" className="input-icon" onClick={handlePlusClick} style={{ cursor: 'pointer' }} /> */}
                <span alt="Attach" onClick={handlePlusClick} className="material-symbols-outlined">
                  upload_file
                </span>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" style={{ display: 'none' }} />
                <input type="text" placeholder="Ask me anything..." />
              </div>
              <div className="assistant-microphone" onClick={handleMicClick} style={{ cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ opacity: isRecording ? 0.5 : 1 }}>mic</span>
              </div>
            </div>
          </div>
        </div>

      </div>
      )}
    </>
  );
};

export default SearchAssistant;
