import { useState } from 'react';

const useConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});

  const confirm = ({ title, message, onConfirm, onCancel }) => {
    return new Promise((resolve) => {
      setConfig({
        title: title || 'Confirm Action',
        message: message || 'Are you sure?',
        onConfirm: () => {
          onConfirm?.();
          resolve(true);
          setIsOpen(false);
        },
        onCancel: () => {
          onCancel?.();
          resolve(false);
          setIsOpen(false);
        }
      });
      setIsOpen(true);
    });
  };

  const ConfirmationModal = () => {
    if (!isOpen) return null;

    return (
      <div className="modal-overlay" onClick={config.onCancel}>
        <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{config.title}</h3>
            <button className="modal-close" onClick={config.onCancel}>×</button>
          </div>
          <div className="modal-body">
            <p>{config.message}</p>
          </div>
          <div className="modal-footer">
            {/* <button className="btn-cancel" onClick={config.onCancel}>
              Cancel
            </button> */}
            <button className="btn-confirm" onClick={config.onConfirm}>
              Ok
            </button>
          </div>
        </div>
      </div>
    );
  };

  return { confirm, ConfirmationModal };
};

export default useConfirmation;