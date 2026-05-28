import { useState } from 'react';
import { getEmployeeDetails } from '../services/api';
import { useToast } from '../context/ToastContext';

export const useCandidateProfileModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useToast();

  const openModal = async (employeeId) => {
    setLoading(true);
    setError(null);
    setEmployee(null); // Clear previous employee data
    setIsOpen(true);
    
    try {
      const response = await getEmployeeDetails(employeeId);
      if (response?.status === 'success' && response?.employee) {
        setEmployee(response.employee);
      } else {
        const errorMessage = response?.message || 'Failed to load employee details';
        setError(errorMessage);
        showError(errorMessage);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error loading employee details';
      setError(errorMessage);
      showError(errorMessage);
      console.error('Employee details API error:', err);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setEmployee(null);
    setError(null);
  };

  return {
    isOpen,
    employee,
    loading,
    error,
    openModal,
    closeModal
  };
};