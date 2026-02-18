import { Icons } from '../../assets/icons';
import './Dashboard.css';
import './SearchAssistant.css';
import { useRef, useState } from 'react';
import { uploadAPI,searchAPI } from '../../services/api';
import { createPortal } from "react-dom";


const SearchAssistant = ({ isExpanded, onExpand, onClose }) => {
  
  const fileInputRef = useRef(null);
  const uploadModalFileInputRef = useRef(null);
  
  // const mediaRecorderRef = useRef(null);
  // const [isRecording, setIsRecording] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  // const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isfileSelect, setisfileSelect] = useState(false);
  const [inputText, setInputText] = useState('');
  // const [tablePage, setTablePage] = useState({});
  // const [rowsPerPage, setRowsPerPage] = useState({});
  // const [searchQuery, setSearchQuery] = useState({});
  // const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [mouseHover, setMouseHover] =  useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

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
    uploadModalFileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      console.log('CSV file selected:', file.name);
      setUploadedFile(file);
      setisfileSelect(true);
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
  const handleRemoveUploadFile = () => {
    setUploadedFile(null);
    if (uploadModalFileInputRef.current) {
      uploadModalFileInputRef.current.value = '';
    }
    setisfileSelect(false);
    setInputText('');
  };

  const handleSendMessage = async () => {
    setShowUploadModal(false);
    if (!inputText.trim() && !uploadedFile) return;

    setIsLoading(true);

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
console.log("ASSISTANT MESSAGE:", assistantMessage);

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
    setisfileSelect(false);
  };

  const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 8;

    
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
      {/* {isLoading && (
        <div className="chat-loader">
          <div className="spinner"></div>
        </div>
      )} */}

      {showUploadModal && (
        <div className="upload-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="upload-modal-header">
              <h3>Upload CSV File</h3>
              <button className="modal-close-btn" onClick={() => setShowUploadModal(false)}>✕</button>
            </div>
            <div className="upload-modal-body">
              {!uploadedFile ? (
                <>
                  <div className="upload-icon">
                    <span className="material-symbols-outlined">upload_file</span>
                  </div>
                  <p>Select a CSV file to upload and process employee data</p>
                  <input type="file" ref={uploadModalFileInputRef} onChange={handleFileChange} accept=".csv" style={{ display: 'none' }} />
                  <button className="choose-csv-btn btn-primary" onClick={handleModalFileSelect}>
                    <span className="material-symbols-outlined">folder_open</span>
                    Choose CSV
                  </button>
                </>
              ) : (
                <>
                  <div className="upload-icon success">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <div className="selected-file-info">
                    <span className="material-symbols-outlined">description</span>
                    <span className="file-name">{uploadedFile.name}</span>
                    <button className="remove-file-icon" onClick={handleRemoveUploadFile}>
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <button className="btn-primary upload-process-btn" onClick={handleSendMessage}>
                    <span className="material-symbols-outlined">upload</span>
                    Upload CSV
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {isExpanded ? (
        <div className="card assistant-card assistant-card-expanded">
          {messages.length === 0 ? (
            <div className="upload-prompt-container">
              <div className="upload-prompt-content">
                <span className="assistant-badge bubbles">
                  <img src="src/assets/icons/bubbles.svg" alt="" srcSet="" />
                </span>
                <h3>Ready To Find the Right Resource for Your Project, Instantly?</h3>
                <button className="choose-csv-btn btn-primary" onClick={handlePlusClick}>
                  <span className="material-symbols-outlined">upload</span>
                  Upload CSV
                </button>
              </div>
            </div>
          ) : (
            <>
          <div className="assistant-header">
            <span className="assistant-badge bubbles">
              <img src="src/assets/icons/bubbles.svg" alt="" srcSet="" />
            </span>
            {/* <span className="expand-icon" onClick={onClose}>✕</span> */}
            <h3>Ready To Find the Right Resource for Your Project, Instantly?</h3>
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
                        {/* <span>{uploadedFile.name}</span>
                        <button className="remove-file-btn" onClick={handleRemoveFile}>✕</button> */}
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
                    <div className="assistant-microphone">
                      <button className="chat-submit-btn" onClick={handleSendMessage}>
                        <img src={Icons.send} alt="" />
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

              <div className='assistant-btns'>
                <button className="choose-csv-btn primary-btn" onClick={()=> {}}>
                  <span className="material-symbols-outlined">filter</span>
                  Filter
                </button>
  
                <button className="choose-csv-btn primary-btn" onClick={handlePlusClick}>
                  <span className="material-symbols-outlined">upload</span>
                  Upload CSV
                </button>
              </div>
            </div>
          </div>
          {/* <div className="search-card-header">
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
                            <div className="employee-avatar">{employee.display_name.charAt(0).toUpperCase()}</div>

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
          </div> */}
          <div className="search-card-header">
  {isLoading ? (
    <div className="chat-loader">
      <div className="spinner"></div>
    </div>
  ) : (() => {

    const filteredMessages = messages.filter(
      item =>
        item.type === "assistant" &&
        item.data?.status === "success" &&
        item.data?.all_employees?.length > 0
    );

    const allEmployees = filteredMessages.flatMap(
      item => item.data.all_employees
    );

    if (allEmployees.length === 0) {
      return <>Please upload CSV File to generate datas...</>;
    }
    const totalPages = Math.ceil(allEmployees.length / rowsPerPage);

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const paginatedEmployees = allEmployees.slice(startIndex, endIndex);


    return (
      <div className="search-card">
        
        <div className="employee-table">

          {/* ✅ HEADER (Only Once) */}
          <div className="employee-row header">
            <div>Name</div>
            <div>ID</div>
            <div>Designation</div>
            <div>Total Exp</div>
            <div>Tech Group</div>
            <div>Location</div>
            <div></div>
          </div>

          {/* ✅ ROWS */}
          {paginatedEmployees.map((employee, index) => (
            <div
              key={index}
              className="employee-row"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const popupHeight = 450; // your popup approx height
                const viewportHeight = window.innerHeight;

                let calculatedTop = rect.top + window.scrollY;
                let shiftAmount = 0;

                // Check if popup will overflow bottom
                if (rect.top + popupHeight > viewportHeight) {
                  shiftAmount = (rect.top + popupHeight) - viewportHeight + 20;
                  calculatedTop -= shiftAmount;
                }

                setPopupPosition({
                  top: calculatedTop,
                  left: rect.right + 10,
                  arrowTop: rect.height / 2 + shiftAmount
                });

                setHoveredIndex(index);
              }}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="name-cell">
                <div className="employee-avatar">
                  {employee.display_name?.charAt(0).toUpperCase()}
                </div>
                <span>{employee.display_name}</span>
              </div>

              <div>{employee.employee_id}</div>
              <div>{employee.designation}</div>
              <div>{employee.total_exp}</div>
              <div>{employee.tech_group}</div>
              <div>{employee.emp_location}</div>

              {hoveredIndex === index && createPortal(
                  <div 
                    className="employee-hover-popup"
                    style={{
                      top: `${popupPosition.top}px`,
                      left: `1050px`,
                      '--arrow-top': `${popupPosition.arrowTop}px`
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                   <div className="popup-header">
                                <div className="employee-avatar">
                  {employee.display_name?.charAt(0).toUpperCase()}
                </div>
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
                                    {/* {employee.skill_set
                                      ?.split(',')
                                      .map((skill, index) => (
                                        <span key={index} className="skill-chip">
                                          {skill.trim()}
                                        </span>
                                      ))} */}
                                      <div className="skills-container">
                                          {employee.skill_set.split(',').slice(0, showAllSkills ? undefined : 5).map((skill, skillIndex) => (
                                            <span key={skillIndex} className="skill-badge">{skill.trim()}</span>
                                          ))}
                                          {employee.skill_set.split(',').length > 5 && (
                                            <button onClick={() => setShowAllSkills(!showAllSkills)} className="skill-more-btn">
                                              {showAllSkills ? 'Show Less' : `+${employee.skill_set.split(',').length - 5} More`}
                                            </button>
                                          )}
                                    </div>
                                    </div>
                                </div>
                              </div>
                </div>,
                document.body
              )}
            </div>
          ))}

        </div>
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
          <h3>Ready To Find the Right Resource for Your Project, Instantly?</h3>

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
