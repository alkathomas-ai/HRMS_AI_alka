import React from 'react';
import { useToast } from '../../context/ToastContext';
import Toast from './Toast';
import './ToastContainer.css';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  console.log('ToastContainer rendering with toasts:', toasts);

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;