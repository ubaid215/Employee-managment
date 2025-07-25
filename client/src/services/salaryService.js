import api from './api';

// Fetch salary records (for both employee and admin)
export const getSalaries = async (filters = {}) => {
  try {
    const endpoint = filters.employeeId ? '/api/admin/salaries' : '/api/employee/salaries';
    const response = await api.get(endpoint, { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching salary records');
  }
};

// Add salary record (admin only)
export const addSalary = async (salaryData) => {
  try {
    const response = await api.post('/api/admin/salaries', {
      employeeId: salaryData.employeeId,
      amount: salaryData.amount,
      type: salaryData.type,
      month: salaryData.month,
      note: salaryData.note,
      advanceAmount: salaryData.advanceAmount,
      fullPayment: salaryData.fullPayment
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error adding salary record');
  }
};

// Update salary record (admin only)
export const updateSalary = async (salaryId, updates) => {
  try {
    const response = await api.patch(`/api/admin/salaries/${salaryId}`, updates);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating salary record');
  }
};

// Download individual salary slip as PDF
export const downloadSalaryPDF = async (salaryId) => {
  try {
    const response = await api.get(`/api/salaries/${salaryId}/pdf`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `salary-slip-${salaryId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    return { success: true, filename: `salary-slip-${salaryId}.pdf` };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error downloading salary slip');
  }
};

// Download all salaries as PDF (admin only)
export const downloadAllSalariesPDF = async (filters = {}) => {
  try {
    const response = await api.get('/api/admin/salaries/pdf', {
      params: filters,
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'salary-records.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();

    return { success: true, filename: 'salary-records.pdf' };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error downloading salary records');
  }
};