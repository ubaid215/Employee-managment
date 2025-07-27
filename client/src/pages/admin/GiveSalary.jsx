import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { 
  DollarSign, Calendar, User, FileText, 
  Plus, ChevronLeft, ChevronRight, Loader2 
} from 'lucide-react';

const GiveSalary = () => {
  const { 
    employees = [], // Default to empty array to prevent undefined errors
    fetchEmployees, 
    fetchSalaries, 
    addSalary, 
    salaries = [], // Default to empty array to prevent undefined errors
    loading 
  } = useAdmin();

  // Form state
  const [formData, setFormData] = useState({
    employee: '',
    amount: '',
    type: 'full',
    month: '',
    note: '',
    advanceAmount: '',
    fullPayment: '',
    status: 'paid'
  });

  // Table state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterMonth, setFilterMonth] = useState('');

  useEffect(() => {
    fetchEmployees();
    fetchSalaries();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addSalary({
        ...formData,
        amount: formData.type === 'full' ? formData.fullPayment : formData.advanceAmount,
        month: `${formData.month} ${new Date().getFullYear()}`
      });
      setFormData({
        employee: '',
        amount: '',
        type: 'full',
        month: '',
        note: '',
        advanceAmount: '',
        fullPayment: '',
        status: 'paid'
      });
    } catch (err) {
      console.error('Failed to add salary:', err);
    }
  };

  // Filter salaries by month
  const filteredSalaries = filterMonth 
    ? salaries.filter(s => s.month && s.month.includes(filterMonth))
    : salaries;

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSalaries = filteredSalaries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSalaries.length / itemsPerPage);

  // Month options for select
  const months = [
    'January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August', 
    'September', 'October', 'November', 'December'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Salary Management
          </h1>
          <p className="text-slate-600">Manage employee salary payments and records</p>
        </div>
        
        {/* Add Salary Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8 mb-8 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
              <Plus size={20} className="text-white" />
            </div>
            <span className="text-slate-800">Add Salary Record</span>
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Employee <span className="text-rose-500">*</span>
              </label>
              <select
                name="employee"
                value={formData.employee}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-slate-400"
                required
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>

            {/* Salary Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Salary Type <span className="text-rose-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-slate-400"
                required
              >
                <option value="full">Full Payment</option>
                <option value="advance">Advance Payment</option>
              </select>
            </div>

            {/* Amount Fields (Conditional based on type) */}
            {formData.type === 'full' ? (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Amount <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-500 font-medium">$</span>
                  <input
                    type="number"
                    name="fullPayment"
                    value={formData.fullPayment}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-slate-400"
                    placeholder="0.00"
                    required
                    min="0"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Advance Amount <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-500 font-medium">$</span>
                  <input
                    type="number"
                    name="advanceAmount"
                    value={formData.advanceAmount}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-slate-400"
                    placeholder="0.00"
                    required
                    min="0"
                  />
                </div>
              </div>
            )}

            {/* Month Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Month <span className="text-rose-500">*</span>
              </label>
              <select
                name="month"
                value={formData.month}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-slate-400"
                required
              >
                <option value="">Select Month</option>
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-slate-400"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
              </select>
            </div>

            {/* Note */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Notes
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-slate-400 resize-none"
                rows={3}
                placeholder="Any additional notes about this salary payment..."
                maxLength={200}
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Add Salary Record
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Salary History Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h2 className="text-xl font-semibold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <FileText size={20} className="text-white" />
              </div>
              <span className="text-slate-800">Salary History</span>
            </h2>
            
            {/* Month Filter */}
            <div className="mt-4 md:mt-0">
              <label className="text-sm font-semibold text-slate-700 mr-3">Filter by Month:</label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-slate-400"
              >
                <option value="">All Months</option>
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Paid On</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {currentSalaries.length > 0 ? (
                  currentSalaries.map((salary, index) => (
                    <tr key={salary._id} className={`hover:bg-slate-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                            <User size={18} className="text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-slate-900">
                              {employees.find(e => e._id === salary.employee)?.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-slate-500">
                              {employees.find(e => e._id === salary.employee)?.employeeId || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          salary.type === 'full' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {salary.type === 'full' ? 'Full Payment' : 'Advance'}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-slate-900">
                        ${salary.amount?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600 font-medium">
                        {salary.month}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          salary.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                          salary.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {salary.status?.charAt(0).toUpperCase() + salary.status?.slice(1) || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600">
                        {salary.paidOn ? new Date(salary.paidOn).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <FileText size={48} className="mb-4 opacity-50" />
                        <p className="text-lg font-medium">No salary records found</p>
                        <p className="text-sm">Add your first salary record using the form above</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredSalaries.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-semibold text-slate-900">
                  {Math.min(indexOfLastItem, filteredSalaries.length)}
                </span> of{' '}
                <span className="font-semibold text-slate-900">{filteredSalaries.length}</span> records
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-slate-300 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors duration-150 text-slate-700 font-medium"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-slate-300 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors duration-150 text-slate-700 font-medium"
                >
                  Next
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiveSalary;