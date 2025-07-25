import React from 'react';
import { useSalary } from '../context/SalaryContext';

const SalaryCard = ({ salary }) => {
  const { downloadSalaryPDF, loading } = useSalary();

  const handleDownload = async () => {
    try {
      await downloadSalaryPDF(salary._id);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const formattedDate = new Date(salary.paidOn).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const statusConfig = {
    paid: { color: 'text-accent', icon: '✅' },
    pending: { color: 'text-warning', icon: '🔄' },
    rejected: { color: 'text-error', icon: '❌' },
  };

  const { color, icon } = statusConfig[salary.status] || { color: 'text-muted', icon: '❓' };

  return (
    <div className="bg-surface rounded-lg shadow-sm p-4 mb-4 border border-gray-200 transition-all hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-text-main">{salary.month}</h3>
          <p className="text-muted text-sm">{formattedDate}</p>
        </div>
        <span className={`${color} flex items-center gap-1`}>
          {icon} {salary.status.charAt(0).toUpperCase() + salary.status.slice(1)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div>
          <p className="text-muted text-sm">Amount</p>
          <p className="font-medium">{salary.amount} PKR</p>
        </div>
        <div>
          <p className="text-muted text-sm">Advance</p>
          <p className="font-medium">{salary.advanceAmount || 0} PKR</p>
        </div>
        <div>
          <p className="text-muted text-sm">Full Payment</p>
          <p className="font-medium">{salary.fullPayment || 0} PKR</p>
        </div>
      </div>

      {salary.note && (
        <div className="mt-3 p-3 bg-bg-light rounded">
          <p className="text-muted text-sm">Note</p>
          <p className="text-sm">{salary.note}</p>
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={loading}
        className="btn-primary w-full mt-4 disabled:opacity-60"
      >
        {loading ? 'Downloading...' : 'Download PDF'}
      </button>
    </div>
  );
};

export default SalaryCard;