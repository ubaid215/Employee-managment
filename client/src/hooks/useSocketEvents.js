import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useUser } from '../context/UserContext';

/**
 * Manages WebSocket event listeners for real-time notifications.
 * @param {Function} onNotification - Callback to handle new notifications.
 * @returns {Array} notifications - List of active notifications.
 */
const useSocketEvents = (onNotification) => {
  const { socket } = useSocket();
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (socket && user) {
      const events = [
        {
          name: 'duty-reassignment',
          handler: (data) => {
            if (data.employee === user._id) {
              const notification = {
                type: 'duty-reassignment',
                data,
                message: 'Your department or duties have been updated.',
              };
              setNotifications((prev) => [...prev, notification]);
              onNotification?.(notification);
            }
          },
        },
        {
          name: 'status-change',
          handler: (data) => {
            if (data.employee === user._id) {
              const notification = {
                type: 'status-change',
                data,
                message: `Your status changed to ${data.newStatus}.`,
              };
              setNotifications((prev) => [...prev, notification]);
              onNotification?.(notification);
            }
          },
        },
        {
          name: 'task-status-updated',
          handler: (data) => {
            if (data.employee === user._id) {
              const notification = {
                type: 'task-status-updated',
                data,
                message: `Task status updated to ${data.status}.`,
              };
              setNotifications((prev) => [...prev, notification]);
              onNotification?.(notification);
            }
          },
        },
        {
          name: 'leave-status-updated',
          handler: (data) => {
            if (data.employee === user._id) {
              const notification = {
                type: 'leave-status-updated',
                data,
                message: `Leave request ${data.status}.`,
              };
              setNotifications((prev) => [...prev, notification]);
              onNotification?.(notification);
            }
          },
        },
        {
          name: 'salary-added',
          handler: (data) => {
            if (data.employee === user._id) {
              const notification = {
                type: 'salary-added',
                data,
                message: `New salary record added for ${data.month}.`,
              };
              setNotifications((prev) => [...prev, notification]);
              onNotification?.(notification);
            }
          },
        },
        {
          name: 'leave-requested',
          handler: (data) => {
            if (user.role === 'admin') {
              const notification = {
                type: 'leave-requested',
                data,
                message: `New leave request from employee ID ${data.employeeId}.`,
              };
              setNotifications((prev) => [...prev, notification]);
              onNotification?.(notification);
            }
          },
        },
        {
          name: 'new-duty',
          handler: (data) => {
            if (user.role === 'admin') {
              const notification = {
                type: 'new-duty',
                data,
                message: `New task submitted by ${data.employee.name}.`,
              };
              setNotifications((prev) => [...prev, notification]);
              onNotification?.(notification);
            }
          },
        },
      ];

      events.forEach(({ name, handler }) => {
        socket.on(name, handler);
      });

      return () => {
        events.forEach(({ name }) => {
          socket.off(name);
        });
      };
    }
  }, [socket, user, onNotification]);

  const clearNotification = (index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return [notifications, clearNotification];
};

export default useSocketEvents;