import { useState } from 'react';
import { getEmployeeDetails } from '../services/api';

export const useEmployeeDetailsModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const openModal = async (employeeId) => {
    setLoading(true);
    setError(null);
    setIsOpen(true);
    
    try {
      const response = await getEmployeeDetails(employeeId);
      if (response?.status === 'success' && response?.employee) {
        setEmployee(response.employee);
      } else {
        setError('Failed to load employee details');
      }
    } catch (err) {
      setError('Error loading employee details');
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