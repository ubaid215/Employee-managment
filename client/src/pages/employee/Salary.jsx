import { useState, useEffect } from 'react';
import { useEmployee } from '../../context/EmployeeContext';
import { 
  Download, FileText, DollarSign, 
  Calendar, CheckCircle, Clock, 
  AlertCircle, Loader2 
} from 'lucide-react';

const Salary = () => {
  const { 
    salaryRecords, 
    fetchSalaryRecords, 
    downloadSalaryPDF,
    loading 
  } = useEmployee();
  
  const [filter, setFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'paidOn', direction: 'desc' });

  useEffect(() => {
    fetchSalaryRecords();
  }, [fetchSalaryRecords]);

  const handleDownloadPDF = async (salaryId) => {
    try {
      await downloadSalaryPDF(salaryId);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedRecords = [...salaryRecords].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredRecords = sortedRecords.filter(record => {
    if (filter === 'all') return true;
    return record.status === filter;
  });

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch(status) {
      case 'paid':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'partial':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid':
        return <CheckCircle size={14} className="mr-1" />;
      case 'pending':
        return <Clock size={14} className="mr-1" />;
      case 'partial':
        return <AlertCircle size={14} className="mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign size={24} className="text-green-500" />
            Salary Records
          </h1>
          
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
            </select>
          </div>
        </div>

        {loading && !salaryRecords.length ? (
          <div className="bg-white rounded-xl shadow-sm p-8 flex justify-center border border-gray-100">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>
        ) : salaryRecords.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No salary records found</h3>
            <p className="mt-1 text-gray-500">Your salary records will appear here once available</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('month')}
                    >
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-2" />
                        Month
                        {sortConfig.key === 'month' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('paidOn')}
                    >
                      <div className="flex items-center">
                        Paid On
                        {sortConfig.key === 'paidOn' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('amount')}
                    >
                      <div className="flex items-center">
                        <DollarSign size={14} className="mr-2" />
                        Amount
                        {sortConfig.key === 'amount' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{record.month}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(record.paidOn).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${record.amount.toLocaleString()}
                        </div>
                        {record.advanceAmount > 0 && (
                          <div className="text-xs text-gray-500">
                            (Advance: ${record.advanceAmount.toLocaleString()})
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {record.type === 'advance' ? 'Advance' : 'Full'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(record.status)}>
                          {getStatusIcon(record.status)}
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDownloadPDF(record._id)}
                          className="text-blue-600 hover:text-blue-900 flex items-center justify-end gap-1 w-full"
                        >
                          <Download size={16} />
                          <span className="hidden md:inline">PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
              {filteredRecords.map((record) => (
                <div key={record._id} className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{record.month}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Paid on {new Date(record.paidOn).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={getStatusBadge(record.status)}>
                      {getStatusIcon(record.status)}
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">
                        ${record.amount.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {record.type === 'advance' ? 'Advance' : 'Full Payment'}
                      </span>
                    </div>
                    {record.advanceAmount > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Advance: ${record.advanceAmount.toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleDownloadPDF(record._id)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1 text-sm"
                    >
                      <Download size={14} />
                      Download PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Salary;