import { Icons } from '../../assets/icons';
import './Dashboard.css';
import './SearchAssistant.css';
import WidgetPanel from './WidgetPanel';
import { useRef, useState } from 'react';
import { uploadAPI,searchAPI } from '../../services/api';


const SearchAssistant = ({ isExpanded, onExpand, onClose }) => {
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [tablePage, setTablePage] = useState({});
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

  const handleSendMessage = async () => {
    if (!inputText.trim() && !uploadedFile) return;

    const textToSend = inputText;
    const fileToUpload = uploadedFile;

    // Reset UI immediately
    setInputText('');
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Add user message with loading state for file uploads
    const userMessage = {
      id: Date.now(),
      type: fileToUpload ? 'loading' : 'user',
      text: textToSend,
      file: fileToUpload
        ? { name: fileToUpload.name, type: fileToUpload.type }
        : null,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const startTime = Date.now();
      let response;

      if (fileToUpload) {
        // Use uploadAPI for file uploads
        const formData = new FormData();
        formData.append('file', fileToUpload);
        if (textToSend) formData.append('message', textToSend);
        response = await uploadAPI(formData);
        
        // Ensure minimum 2 seconds loader for file uploads
        const elapsed = Date.now() - startTime;
        if (elapsed < 2000) {
          await new Promise(resolve => setTimeout(resolve, 2000 - elapsed));
        }

        // Update loading message to user message
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, type: 'user' } : msg
        ));
      } else {
        // Use searchAPI for text queries
        response = await searchAPI(textToSend);
      }

      // Assistant success message
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        text: response?.message || response?.data || 
              (fileToUpload
                ? `File "${fileToUpload.name}" uploaded successfully.`
                : 'Request processed successfully.'),
        data: fileToUpload ? response : null,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);

      // Update loading message to user message on error
      if (fileToUpload) {
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, type: 'user' } : msg
        ));
      }

      // Assistant error message
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        text: fileToUpload ? '❌ Upload failed. Please try again.' : '❌ Search failed. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
            {messages.length === 0 ? (
              <div className="chat-welcome">
                <div className="chat-welcome-icon">
                  <img src="src/assets/icons/bubbles.svg" alt="" srcSet="" />
                </div>
                <h2>How can I help you today?</h2>
              </div>
            ) : (
              <div className="chat-messages-list">
                {messages.map(msg => (
                  <div key={msg.id} className={`chat-message ${msg.type === 'loading' ? 'user' : msg.type}`}>
                    {msg.type === 'loading' && (
                      <div className="message-content">
                        <div className="loading-spinner-container">
                          <div className="loading-spinner"></div>
                        </div>
                        <div className="message-file">
                          <span className="material-symbols-outlined">description</span>
                          <span>{msg.file.name}</span>
                        </div>
                      </div>
                    )}
                    {msg.type !== 'loading' && (
                      <>
                        {msg.type === 'assistant' && (
                          <div className="message-avatar">
                            <img src="src/assets/icons/bubbles.svg" alt="" />
                          </div>
                        )}
                        <div className="message-content">
                          {msg.file && (
                            <div className="message-file">
                              <span className="material-symbols-outlined">description</span>
                              <span>{msg.file.name}</span>
                            </div>
                          )}
                          {msg.text && <p>{msg.text}</p>}
                          {msg.data?.all_employees && (() => {
                            const pageSize = 10;
                            const currentPage = tablePage[msg.id] || 1;
                            const totalPages = Math.ceil(msg.data.all_employees.length / pageSize);
                            const startIdx = (currentPage - 1) * pageSize;
                            const endIdx = startIdx + pageSize;
                            const columns = msg.data.file_metadata?.columns_list || [];
                            
                            return (
                              <div className="response-table-container">
                                <div className="response-summary">
                                  <p><strong>Records:</strong> {msg.data.records_processed}</p>
                                  <p><strong>Database:</strong> {msg.data.database_records}</p>
                                </div>
                                <div className="table-wrapper">
                                  <table className="employee-table">
                                    <thead>
                                      <tr>
                                        {columns.map(col => (
                                          <th key={col}>{col.replace(/_/g, ' ').toUpperCase()}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {msg.data.all_employees.slice(startIdx, endIdx).map((emp, idx) => (
                                        <tr key={idx}>
                                          {columns.map(col => (
                                            <td key={col}>
                                              {col === 'projects' && Array.isArray(emp[col]) 
                                                ? emp[col].length 
                                                : emp[col] || '-'}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <div className="table-pagination">
                                  <button 
                                    onClick={() => setTablePage(prev => ({...prev, [msg.id]: Math.max(1, currentPage - 1)}))}
                                    disabled={currentPage === 1}
                                  >
                                    Previous
                                  </button>
                                  <span>Page {currentPage} of {totalPages}</span>
                                  <button 
                                    onClick={() => setTablePage(prev => ({...prev, [msg.id]: Math.min(totalPages, currentPage + 1)}))}
                                    disabled={currentPage === totalPages}
                                  >
                                    Next
                                  </button>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="chat-message assistant">
                    <div className="message-avatar">
                      <img src="src/assets/icons/bubbles.svg" alt="" />
                    </div>
                    <div className="message-content loading">
                      <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <span alt="Attach" onClick={handlePlusClick} className="material-symbols-outlined">
                upload_file
              </span>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" style={{ display: 'none' }} />
              {uploadedFile ? (
                <div className="chat-file" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
<span class="material-symbols-outlined">
csv
</span>                  <span>{uploadedFile.name}</span>
                  <button className="remove-file-btn" onClick={handleRemoveFile}>✕</button>
                </div>
              ) : (
                <input 
                  type="text" 
                  placeholder="Message Assistant..." 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
              )}
              <span 
                className="material-symbols-outlined" 
                onClick={!uploadedFile ? handleMicClick : undefined} 
                style={{ 
                  cursor: uploadedFile ? 'not-allowed' : 'pointer', 
                  opacity: uploadedFile ? 0.3 : (isRecording ? 0.5 : 1) 
                }}
              >
                mic
              </span>
              <button className="chat-submit-btn" onClick={handleSendMessage}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
          </div>
        </div>
      ) : (
      <div className={`card assistant-card justify-btw ${!isExpanded ? 'compact' : ''}`}>
        <div className="assistant-header">
          <span className="assistant-badge bubbles">
            {/* <span className="material-symbols-outlined">smart_toy</span> */}
            <img src="src/assets/icons/bubbles.svg" alt="" srcSet="" />
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
            <div className="assistant-box">
              <div className="assistant-input dflex">
                <span alt="Attach" onClick={handlePlusClick} className="material-symbols-outlined">
                  upload_file
                </span>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" style={{ display: 'none' }} />
                {uploadedFile ? (
                  <div className="assistant-file" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
<span class="material-symbols-outlined">
csv
</span>                    <span>{uploadedFile.name}</span>
                    <button className="remove-file-btn" onClick={handleRemoveFile}>✕</button>
                  </div>
                ) : (
                  <input type="text" placeholder="Ask me anything..." />
                )}
              </div>
              <div 
                className="assistant-microphone" 
                onClick={!uploadedFile ? handleMicClick : undefined} 
                style={{ 
                  cursor: uploadedFile ? 'not-allowed' : 'pointer' 
                }}
              >
                {/* <span 
                  className="material-symbols-outlined" 
                  style={{ 
                    opacity: uploadedFile ? 0.3 : (isRecording ? 0.5 : 1) 
                  }}
                >
                  mic
                </span> */}
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
      )}
    </>
  );
};

export default SearchAssistant;
