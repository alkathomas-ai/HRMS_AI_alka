import { useRef, useState } from "react";
import { Icons } from "../../assets/icons";

const UploadCSVModal = ({ show, onClose, onUpload }) => {
  const uploadModalFileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleModalFileSelect = () => {
    uploadModalFileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") {
      setUploadedFile(file);
    } else if (file) {
      alert("Please select a CSV file");
    }
  };

  const handleRemoveUploadFile = () => {
    setUploadedFile(null);
    if (uploadModalFileInputRef.current) {
      uploadModalFileInputRef.current.value = "";
    }
  };

  const handleUpload = () => {
    if (uploadedFile) {
      onUpload(uploadedFile);
      setUploadedFile(null);
      if (uploadModalFileInputRef.current) {
        uploadModalFileInputRef.current.value = "";
      }
    }
  };

  if (!show) return null;

  return (
    <div className="upload-modal-overlay" onClick={onClose}>
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="upload-modal-header">
          <h3>Upload CSV File</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="upload-modal-body">
          {!uploadedFile ? (
            <>
              <div className="upload-icon">
                <span className="material-symbols-outlined">upload_file</span>
              </div>
              <p>Select a CSV file to upload and process employee data</p>
              <input
                type="file"
                ref={uploadModalFileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                style={{ display: "none" }}
              />
              <button
                className="choose-csv-btn btn-primary"
                onClick={handleModalFileSelect}
              >
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
                <button
                  className="remove-file-icon"
                  onClick={handleRemoveUploadFile}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <button
                className="btn-primary upload-process-btn"
                onClick={handleUpload}
              >
                <span className="material-symbols-outlined">upload</span>
                Upload CSV
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadCSVModal;
