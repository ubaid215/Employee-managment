import React, { useState, useEffect } from 'react';
import { Briefcase, X, Check, ChevronDown } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const DepartmentChangeModal = ({ 
  isOpen, 
  onClose, 
  employeeId, 
  currentDepartment 
}) => {
  const { 
    departments, 
    duties, 
    fetchDepartments, 
    fetchAllDuties,
    assignDepartment,
    loading,
    error
  } = useAdmin();

  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDuties, setSelectedDuties] = useState([]);
  const [reason, setReason] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Initialize form with current department if provided
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      fetchAllDuties();
      setSelectedDepartment(currentDepartment || '');
      setSelectedDuties([]);
      setReason('');
    }
  }, [isOpen, currentDepartment]);

  // Filter duties based on selected department
  const filteredDuties = selectedDepartment 
    ? duties.filter(duty => duty.department === selectedDepartment)
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignDepartment(
        employeeId, 
        selectedDepartment, 
        selectedDuties, 
        reason
      );
      onClose();
    } catch (err) {
      console.error('Assignment failed:', err);
    }
  };

  const toggleDutySelection = (dutyId) => {
    setSelectedDuties(prev => 
      prev.includes(dutyId)
        ? prev.filter(id => id !== dutyId)
        : [...prev, dutyId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase size={20} className="text-blue-500" />
            Change Department
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Department Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Duties Selection */}
          {selectedDepartment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign Duties
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex justify-between items-center border border-gray-300 rounded-lg px-3 py-2 text-left"
                >
                  <span>
                    {selectedDuties.length > 0 
                      ? `${selectedDuties.length} selected` 
                      : 'Select duties'}
                  </span>
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {filteredDuties.length > 0 ? (
                      filteredDuties.map(duty => (
                        <div 
                          key={duty._id} 
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                          onClick={() => toggleDutySelection(duty._id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedDuties.includes(duty._id)}
                            readOnly
                            className="mr-2"
                          />
                          {duty.name}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        No duties available for this department
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Change
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Optional notes about this change..."
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedDepartment}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-1"
            >
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <Check size={16} />
                  Confirm Change
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentChangeModal;