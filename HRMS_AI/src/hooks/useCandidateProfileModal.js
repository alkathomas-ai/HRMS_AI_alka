import { useState } from 'react';
import { getEmployeeDetails } from '../services/api';

export const useCandidateProfileModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        setError('Failed to load candidate details');
      }
    } catch (err) {
      setError('Error loading candidate details');
      console.error(err);
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