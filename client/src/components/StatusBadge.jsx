import React from 'react';

const StatusBadge = ({ status }) => {
  const statusColors = {
    active: 'bg-accent/10 text-accent',
    pending: 'bg-warning/10 text-warning',
    suspended: 'bg-error/10 text-error',
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status] || 'bg-bg-light text-muted'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;