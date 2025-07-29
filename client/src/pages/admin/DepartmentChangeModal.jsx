import React, { useState, useEffect } from 'react';
import { Briefcase, X, Check, ChevronDown, Users, ClipboardList, AlertCircle, Loader2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const DepartmentChangeModal = ({ 
  isOpen, 
  onClose, 
  employeeId, 
  currentDepartment,
  currentDuties = [],
  employeeName = 'Employee',
  onSuccess
}) => {
  const { 
    departments, 
    duties,
    fetchDepartments, 
    fetchDuties, 
    assignEmployeeDuties,
    loading,
    error
  } = useAdmin();

  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDuties, setSelectedDuties] = useState([]);
  const [reason, setReason] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isDepartmentChanged, setIsDepartmentChanged] = useState(false);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      fetchDuties();
      
      // Set initial values
      const currentDeptId = currentDepartment?._id || currentDepartment || '';
      setSelectedDepartment(currentDeptId);
      setSelectedDuties(currentDuties.map(duty => duty._id || duty) || []);
      setReason('');
      setFormErrors({});
      setIsDropdownOpen(false);
    }
  }, [isOpen, currentDepartment, currentDuties, fetchDepartments, fetchDuties]);

  // Track if department has changed
  useEffect(() => {
    setIsDepartmentChanged(selectedDepartment !== (currentDepartment?._id || currentDepartment || ''));
  }, [selectedDepartment, currentDepartment]);

  // Filter duties based on selected department
  const filteredDuties = selectedDepartment 
    ? (Array.isArray(duties) ? duties : []).filter(duty => {
        if (!duty) return false;
        const dutyDeptId = typeof duty.department === 'object' 
          ? duty.department?._id 
          : duty.department;
        return dutyDeptId === selectedDepartment;
      })
    : [];

  const getCurrentDutyNames = () => {
    if (!currentDuties || currentDuties.length === 0) return 'No duties assigned';
    return currentDuties.map(duty => {
      if (typeof duty === 'object') return duty.name || duty.title || 'Duty';
      return duty;
    }).join(', ');
  };

  const getSelectedDutyNames = () => {
    if (selectedDuties.length === 0) return 'No duties selected';
    return filteredDuties
      .filter(duty => selectedDuties.includes(duty._id))
      .map(duty => duty.name || duty.title)
      .join(', ');
  };

  const validateForm = () => {
    const errors = {};
    
    if (!selectedDepartment) {
      errors.department = 'Please select a department';
    }
    
    if (selectedDuties.length === 0) {
      errors.duties = 'Please assign at least one duty';
    }

    if (isDepartmentChanged && !reason.trim()) {
      errors.reason = 'Please provide a reason for department change';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await assignEmployeeDuties(
        employeeId, 
        selectedDepartment, 
        selectedDuties, 
        reason.trim() || (isDepartmentChanged ? 'Department change' : 'Duty assignment update')
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Assignment failed:', err);
    }
  };

  const toggleDutySelection = (dutyId) => {
    setSelectedDuties(prev => {
      const newSelection = prev.includes(dutyId)
        ? prev.filter(id => id !== dutyId)
        : [...prev, dutyId];
      
      if (newSelection.length > 0 && formErrors.duties) {
        setFormErrors(prev => ({ ...prev, duties: null }));
      }
      
      return newSelection;
    });
  };

  const handleDepartmentChange = (e) => {
    const newDepartment = e.target.value;
    setSelectedDepartment(newDepartment);
    
    if (formErrors.department) {
      setFormErrors(prev => ({ ...prev, department: null }));
    }
    
    // Clear duties when department changes
    if (newDepartment !== (currentDepartment?._id || currentDepartment || '')) {
      setSelectedDuties([]);
    }
  };

  const selectAllDuties = () => {
    setSelectedDuties(filteredDuties.map(duty => duty._id));
  };

  const clearAllDuties = () => {
    setSelectedDuties([]);
  };

  if (!isOpen) return null;

  const hasChanges = isDepartmentChanged || 
    JSON.stringify(selectedDuties.sort()) !== JSON.stringify((currentDuties.map(d => d._id || d) || []).sort());

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <Briefcase size={24} className="text-blue-600" />
              Assign Department & Duties
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Update assignment for {employeeName}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Current Assignment Info */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-1 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <Users size={16} className="text-gray-500 mt-0.5" />
              <div>
                <span className="font-medium text-gray-700">Current Department:</span>
                <p className="text-gray-900">
                  {typeof currentDepartment === 'object' 
                    ? currentDepartment?.name 
                    : departments.find(d => d._id === currentDepartment)?.name || 'Not assigned'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ClipboardList size={16} className="text-gray-500 mt-0.5" />
              <div>
                <span className="font-medium text-gray-700">Current Duties:</span>
                <p className="text-gray-900">{getCurrentDutyNames()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Department Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Department *
            </label>
            <select
              value={selectedDepartment}
              onChange={handleDepartmentChange}
              className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                formErrors.department ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                  {dept._id === (currentDepartment?._id || currentDepartment) ? ' (Current)' : ''}
                </option>
              ))}
            </select>
            {formErrors.department && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {formErrors.department}
              </p>
            )}
          </div>

          {/* Duties Selection */}
          {selectedDepartment && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Assign Duties *
                </label>
                {filteredDuties.length > 0 && (
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={selectAllDuties}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Select All
                    </button>
                    <span className="text-gray-400">|</span>
                    <button
                      type="button"
                      onClick={clearAllDuties}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full flex justify-between items-center border rounded-lg px-4 py-3 text-left transition-colors ${
                    formErrors.duties ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="listbox"
                >
                  <span className={selectedDuties.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                    {selectedDuties.length > 0 
                      ? `${selectedDuties.length} ${selectedDuties.length === 1 ? 'duty' : 'duties'} selected` 
                      : 'Select duties'}
                  </span>
                  <ChevronDown 
                    size={20} 
                    className={`transition-transform text-gray-400 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {loading ? (
                      <div className="px-4 py-3 text-gray-500 text-sm flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        Loading duties...
                      </div>
                    ) : filteredDuties.length > 0 ? (
                      <>
                        <div className="px-4 py-2 bg-gray-50 border-b text-xs text-gray-600 font-medium">
                          {filteredDuties.length} {filteredDuties.length === 1 ? 'duty' : 'duties'} available
                        </div>
                        {filteredDuties.map(duty => (
                          <div 
                            key={duty._id} 
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center transition-colors border-b border-gray-100 last:border-b-0"
                            onClick={() => toggleDutySelection(duty._id)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedDuties.includes(duty._id)}
                              readOnly
                              className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{duty.name || duty.title}</div>
                              {duty.description && (
                                <div className="text-xs text-gray-500 mt-1 line-clamp-2">{duty.description}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-sm">
                        No duties available for this department
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {formErrors.duties && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {formErrors.duties}
                </p>
              )}
              
              {selectedDuties.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Selected:</span> {getSelectedDutyNames()}
                </div>
              )}
            </div>
          )}

          {/* Reason */}
          {isDepartmentChanged && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for Department Change *
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (formErrors.reason) {
                    setFormErrors(prev => ({ ...prev, reason: null }));
                  }
                }}
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                  formErrors.reason ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                rows={3}
                placeholder="Please provide a reason for the department change..."
                required={isDepartmentChanged}
              />
              {formErrors.reason && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {formErrors.reason}
                </p>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Change Summary */}
          {hasChanges && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Summary of Changes:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {isDepartmentChanged && (
                  <li>• Department: {typeof currentDepartment === 'object' 
                    ? currentDepartment?.name 
                    : departments.find(d => d._id === currentDepartment)?.name || 'None'} 
                    → {departments.find(d => d._id === selectedDepartment)?.name}</li>
                )}
                <li>• Duties: {selectedDuties.length} {selectedDuties.length === 1 ? 'duty' : 'duties'} will be assigned</li>
              </ul>
            </div>
          )}
        </form>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !hasChanges}
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={16} />
                {isDepartmentChanged ? 'Assign Department' : 'Update Duties'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentChangeModal;