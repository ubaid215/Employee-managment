import { useState, useEffect } from 'react';
import { useEmployee } from '../../context/EmployeeContext';
import { 
  Download, FileText, DollarSign, 
  Calendar, CheckCircle, Clock, 
  AlertCircle, Loader2, ChevronDown,
  ChevronUp, ArrowDown, ArrowUp
} from 'lucide-react';

const Salary = () => {
  const { 
    salaryRecords = [], 
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
    const aValue = a?.[sortConfig.key] || '';
    const bValue = b?.[sortConfig.key] || '';
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredRecords = sortedRecords.filter(record => {
    if (filter === 'all') return true;
    return record.status === filter;
  });

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";
    
    switch(status) {
      case 'paid':
        return `${baseClasses} bg-emerald-100 text-emerald-800`;
      case 'pending':
        return `${baseClasses} bg-amber-100 text-amber-800`;
      case 'partial':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-slate-100 text-slate-800`;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid':
        return <CheckCircle size={14} className="mr-1.5 text-emerald-500" />;
      case 'pending':
        return <Clock size={14} className="mr-1.5 text-amber-500" />;
      case 'partial':
        return <AlertCircle size={14} className="mr-1.5 text-blue-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <DollarSign size={24} className="text-white" />
            </div>
            Salary Records
          </h1>
          
          <div className="flex gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm hover:shadow-md transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 flex justify-center border border-slate-200/60 backdrop-blur-sm">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>
        ) : !filteredRecords?.length ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-slate-200/60 backdrop-blur-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">No salary records found</h3>
            <p className="text-slate-500">Your salary records will appear here once available</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200/60 backdrop-blur-sm">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => requestSort('month')}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        <span>Month</span>
                        {sortConfig.key === 'month' && (
                          sortConfig.direction === 'asc' ? 
                            <ChevronUp size={14} className="text-slate-500" /> : 
                            <ChevronDown size={14} className="text-slate-500" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => requestSort('paidOn')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Paid On</span>
                        {sortConfig.key === 'paidOn' && (
                          sortConfig.direction === 'asc' ? 
                            <ChevronUp size={14} className="text-slate-500" /> : 
                            <ChevronDown size={14} className="text-slate-500" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => requestSort('amount')}
                    >
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-slate-400" />
                        <span>Amount</span>
                        {sortConfig.key === 'amount' && (
                          sortConfig.direction === 'asc' ? 
                            <ChevronUp size={14} className="text-slate-500" /> : 
                            <ChevronDown size={14} className="text-slate-500" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-800">
                          {record.month || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">
                          {formatDate(record.paidOn)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-800">
                          ₨{(record.amount || 0).toLocaleString()}
                        </div>
                        {(record.advanceAmount || 0) > 0 && (
                          <div className="text-xs text-slate-500 mt-1">
                            (Advance: ₨{record.advanceAmount.toLocaleString()})
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          record.type === 'advance' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {record.type === 'advance' ? 'Advance' : 'Full'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(record.status)}>
                          {getStatusIcon(record.status)}
                          {record.status?.charAt(0).toUpperCase() + record.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDownloadPDF(record._id)}
                          className="text-blue-600 hover:text-blue-800 flex items-center justify-end gap-2 w-full px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Download size={16} />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-200">
              {filteredRecords.map((record) => (
                <div key={record._id} className="p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{record.month || 'N/A'}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Paid on {formatDate(record.paidOn)}
                      </p>
                    </div>
                    <span className={getStatusBadge(record.status)}>
                      {getStatusIcon(record.status)}
                      {record.status?.charAt(0).toUpperCase() + record.status?.slice(1)}
                    </span>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-slate-800">
                        ₨{(record.amount || 0).toLocaleString()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        record.type === 'advance' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {record.type === 'advance' ? 'Advance' : 'Full Payment'}
                      </span>
                    </div>
                    {(record.advanceAmount || 0) > 0 && (
                      <div className="text-xs text-slate-500 mt-1">
                        Advance: ₨{record.advanceAmount.toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleDownloadPDF(record._id)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Download size={16} />
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