import { Icons } from '../../assets/icons';
import './Dashboard.css';
import './SearchAssistant.css';
import { useRef, useState } from 'react';
import { uploadAPI,searchAPI } from '../../services/api';


const SearchAssistant = ({ isExpanded, onExpand, onClose }) => {
  const fileInputRef = useRef(null);
  // const mediaRecorderRef = useRef(null);
  // const [isRecording, setIsRecording] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  // const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  // const [tablePage, setTablePage] = useState({});
  // const [rowsPerPage, setRowsPerPage] = useState({});
  // const [searchQuery, setSearchQuery] = useState({});
  // const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [mouseHover, setMouseHover] =  useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const [chatHistory] = useState([
    { id: 1, title: 'Top Candidates Search' },
    { id: 2, title: 'Pipeline Review' },
    { id: 3, title: 'Recruitment Insights' },
    { id: 4, title: 'Interview Scheduling' },
    { id: 5, title: 'Candidate Evaluation' },
  ]);

  const handlePlusClick = () => {
    setShowUploadModal(true);
  };

  const handleModalFileSelect = () => {
    fileInputRef.current?.click();
    setShowUploadModal(false);
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

  // const handleMicClick = async () => {
  //   if (isRecording) {
  //     mediaRecorderRef.current?.stop();
  //     setIsRecording(false);
  //   } else {
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  //       const mediaRecorder = new MediaRecorder(stream);
  //       const chunks = [];

  //       mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
  //       mediaRecorder.onstop = () => {
  //         const blob = new Blob(chunks, { type: 'audio/webm' });
  //         console.log('Audio recorded:', blob);
  //         // Add your audio processing logic here
  //         stream.getTracks().forEach(track => track.stop());
  //       };

  //       mediaRecorderRef.current = mediaRecorder;
  //       mediaRecorder.start();
  //       setIsRecording(true);
  //     } catch (err) {
  //       alert('Microphone access denied');
  //     }
  //   }
  // };

  // console.log(messages);
  
  return (
    <>
      {showUploadModal && (
        <div className="upload-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="upload-modal-header">
              <h3>Upload CSV File</h3>
              <button className="modal-close-btn" onClick={() => setShowUploadModal(false)}>✕</button>
            </div>
            <div className="upload-modal-body">
              <div className="upload-icon">
                <span className="material-symbols-outlined">upload_file</span>
              </div>
              <p>Select a CSV file to upload and process</p>
              <button className="choose-csv-btn" onClick={handleModalFileSelect}>
                <span className="material-symbols-outlined">folder_open</span>
                Choose CSV
              </button>
            </div>
          </div>
        </div>
      )}
      {isExpanded ? (
        <div className="card assistant-card assistant-card-expanded">
          <div className="assistant-header">
            <span className="assistant-badge bubbles">
              <img src="src/assets/icons/bubbles.svg" alt="" srcSet="" />
            </span>
            {/* <span className="expand-icon" onClick={onClose}>✕</span> */}
            <h3>Ready To Find Top Candidates Or Revisit Your Pipeline?</h3>
          </div>
          <div>

            {/* <div className="assistant-links">
              <span><span className="material-symbols-outlined">search</span>Find Matches</span>
              <span><span className="material-symbols-outlined">work</span>My Pipeline</span>
              <span><span className="material-symbols-outlined">pie_chart</span>Insights</span>
            </div> */}

            <div className='search-header'>
              <div className="assistant-control">
                <div className="assistant-box">
                  <div className="assistant-input">
                    <span className='search-icon'><img src={Icons.search} alt="" /></span>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" style={{ display: 'none' }} />
                    {uploadedFile ? (
                      <div className="assistant-file" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-symbols-outlined">csv</span>
                        <span>{uploadedFile.name}</span>
                        <button className="remove-file-btn" onClick={handleRemoveFile}>✕</button>
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        placeholder="Ask me anything..." 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                    )}
                  </div>
                  <div className="assistant-microphone" style={{ cursor: uploadedFile ? 'not-allowed' : 'pointer' }}>
                    <button className="chat-submit-btn" onClick={handleSendMessage}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              {/* <button alt="Attach" onClick={handlePlusClick} className="choose-csv-btn upload-btn">
                  <img src={Icons.upload} alt="" />
                  Filter
              </button>
              <button alt="Attach" onClick={handlePlusClick} className="choose-csv-btn upload-btn">
                  <img src={Icons.uploadImg} alt="" />
                  Upload
              </button> */}

              <button className="choose-csv-btn" onClick={()=> {}} style={{width: "10%"}}>
                <span className="material-symbols-outlined">filter</span>
                Filter
              </button>

              <button className="choose-csv-btn" onClick={handlePlusClick} style={{width: "12%"}}>
                <span className="material-symbols-outlined">upload</span>
                Upload CSV
              </button>
            </div>
          </div>
          <div className="search-card-header">
            {messages.filter(
                item =>
                  item.type === "assistant" &&
                  item.data?.status === "success" &&
                  item.data?.all_employees?.length > 0
              ).length > 0 ? (
                <div className='search-card'>
                  {messages.filter(
                      item =>
                        item.type === "assistant" &&
                        item.data?.status === "success" &&
                        item.data?.all_employees?.length > 0
                    ).flatMap(item => item.data.all_employees).map((employee, index) => (
                      
                      <div className='search-card-layout' key={index} 
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        <div className="search-card-layout-container">
                          <div className="search-card-avatar">
                            {/* <img className='search-card-avatar-img' src={Icons.avatar} alt="" /> */}
                            <i class="fa-solid fa-circle-user search-card-avatar-img"></i>
                            <div className="name-header">
                              <span style={{fontSize: 16, fontWeight: 500}}>{employee.display_name}</span>
                            </div>
                          </div>

                          <div className="search-card-avatar">
                            <div className="name-header">
                              <span>{employee.designation}</span>
                            </div>
                          </div>

                          <div className="search-card-avatar">
                            <div className="name-header">
                              <span>{employee.total_exp}</span>
                            </div>
                          </div>


                          <div className="search-card-avatar">
                            <div className="name-header">
                              <span>{employee.tech_group}</span>
                            </div>
                          </div>

                          <div className="search-card-avatar">
                            <div className="name-header">
                              <span>{employee.emp_location}</span>
                            </div>
                          </div>
                          {hoveredIndex === index && (
                            <div className="employee-hover-popup">
                              <div className="popup-header">
                                <img className="popup-avatar" src={Icons.avatar} alt="" />
                                <div>
                                  <h4>{employee.display_name}</h4>
                                  <span>{employee.designation}</span>
                                </div>
                              </div>

                              <div className="popup-body">
                                <div className="popup-fist-container">
                                  <div className="popup-container-left">
                                    <p><b>VVDN ID:</b> <br/>  {employee.employee_id}</p>
                                    <p><b>Tech:</b> <br/>  {employee.tech_group}</p>
                                    <p><b>Location:</b> <br/>  {employee.emp_location}</p>
                                  </div>
                                  <div className="popup-container-right">
                                    <p><b>Department: <br/> </b> {employee.employee_department}</p>
                                    <p><b>Total Experience: <br/> </b> {employee.total_exp}</p>
                                    <p><b>VVDN Experience:</b> <br/>  {employee.vvdn_exp}</p>
                                  </div>
                                </div>
                                <div className="">
                                    <p><b>Reporting Manger: <br/> </b> {employee.rm_name}</p>
                                </div>
                                <div className="">
                                    <p><b>Skills:</b></p>
                                    <div className="skills-container">
                                    {employee.skill_set
                                      ?.split(',')
                                      .map((skill, index) => (
                                        <span key={index} className="skill-chip">
                                          {skill.trim()}
                                        </span>
                                      ))}
                                    </div>
                                </div>
                              </div>
                            </div>
                          )}
                          

                        </div>

                        
                        
                      </div>
                    ))}
                </div>
              ) : (
                <>Please upload CSV File to generate datas...</>
              )}
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
                  </span>                    
                  <span>{uploadedFile.name}</span>
                    <button className="remove-file-btn" onClick={handleRemoveFile}>✕</button>
                  </div>
                ) : (
                  <input type="text" placeholder="Ask me anything..." />
                )}
              </div>
              <div 
                className="assistant-microphone" 
                // onClick={!uploadedFile ? handleMicClick : undefined} 
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

      </div>
      )}
    </>
  );
};

export default SearchAssistant;
