import React from 'react';
import { useSalary } from '../context/SalaryContext';
import SalaryCard from '../components/SalaryCard';
import PDFDownloadButton from '../components/PDFDownloadButton';
import { Download, Loader2 } from 'lucide-react';

const SalaryPage = () => {
  const { salaries, loading, error, downloadAllSalariesPDF } = useSalary();

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-main">Salary Records</h1>
          <p className="text-muted text-sm">
            {salaries.length} records found
          </p>
        </div>
        <PDFDownloadButton
          downloadFn={downloadAllSalariesPDF}
          label={
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download All
            </span>
          }
          disabled={loading || salaries.length === 0}
          className="btn-secondary"
        />
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
      )}

      {error && (
        <div className="bg-error/10 p-4 rounded-lg border border-error/20 mb-6">
          <p className="text-error text-center">{error}</p>
        </div>
      )}

      {salaries.length === 0 && !loading && (
        <div className="bg-surface rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-muted">No salary records found</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {salaries.map((salary) => (
          <SalaryCard key={salary._id} salary={salary} />
        ))}
      </div>
    </div>
  );
};

export default SalaryPage;