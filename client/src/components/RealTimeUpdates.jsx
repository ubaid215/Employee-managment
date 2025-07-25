import React from 'react';
import { useSocket } from '../context/SocketContext';

const RealTimeUpdates = () => {
  const { notifications, clearNotification } = useSocket();

  const getNotificationConfig = (type, data) => {
    const configs = {
      'duty-reassignment': {
        message: 'Your department or duties have been updated.',
        color: 'text-primary',
        icon: '🔄'
      },
      'status-change': {
        message: `Your status changed to ${data.newStatus}.`,
        color: data.newStatus === 'active' ? 'text-accent' : 
               data.newStatus === 'pending' ? 'text-warning' : 'text-error',
        icon: data.newStatus === 'active' ? '✅' : '🔄'
      },
      'task-status-updated': {
        message: `Task status updated to ${data.status}.`,
        color: data.status === 'approved' ? 'text-accent' : 
               data.status === 'pending' ? 'text-warning' : 'text-error',
        icon: data.status === 'approved' ? '✔️' : '❌'
      },
      'leave-status-updated': {
        message: `Leave request ${data.status}.`,
        color: data.status === 'approved' ? 'text-accent' : 'text-error',
        icon: data.status === 'approved' ? '👍' : '👎'
      },
      'salary-added': {
        message: `New salary record added for ${data.month}.`,
        color: 'text-accent',
        icon: '💰'
      },
      'leave-requested': {
        message: `New leave request from employee ID ${data.employeeId}.`,
        color: 'text-warning',
        icon: '✈️'
      },
      'new-duty': {
        message: `New task submitted by ${data.employee.name}.`,
        color: 'text-warning',
        icon: '📝'
      },
      default: {
        message: 'New notification received.',
        color: 'text-text-muted',
        icon: '🔔'
      }
    };

    return configs[type] || configs.default;
  };

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-xs w-full">
      {notifications.map((notification, index) => {
        const { type, data } = notification;
        const { message, color, icon } = getNotificationConfig(type, data);

        return (
          <div
            key={index}
            className="bg-surface p-3 rounded-lg shadow-md border border-gray-200 flex items-start gap-3 animate-fade-in"
          >
            <span className={`text-lg ${color}`}>{icon}</span>
            <div className="flex-1">
              <p className={`text-sm ${color} font-secondary`}>{message}</p>
              <p className="text-xs text-muted mt-1">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => clearNotification(index)}
              className="text-muted hover:text-error transition-colors"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default RealTimeUpdates;