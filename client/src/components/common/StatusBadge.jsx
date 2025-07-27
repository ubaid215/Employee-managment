import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const StatusBadge = ({ status, large = false }) => {
  const getStatusStyles = () => {
    const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
    const size = large ? 'px-3 py-1 text-sm' : '';
    
    switch(status) {
      case 'active':
        return `${base} ${size} bg-green-100 text-green-800`;
      case 'pending':
        return `${base} ${size} bg-yellow-100 text-yellow-800`;
      case 'suspended':
        return `${base} ${size} bg-red-100 text-red-800`;
      default:
        return `${base} ${size} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusIcon = () => {
    const size = large ? 16 : 14;
    switch(status) {
      case 'active':
        return <CheckCircle size={size} className="mr-1" />;
      case 'pending':
        return <Clock size={size} className="mr-1" />;
      case 'suspended':
        return <XCircle size={size} className="mr-1" />;
      default:
        return null;
    }
  };

  return (
    <span className={getStatusStyles()}>
      {getStatusIcon()}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;