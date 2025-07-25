import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useUser } from './UserContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const { user } = useUser();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isAuthenticated && token && user) {
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: { token },
      });

      setSocket(newSocket);

      // Join user-specific room
      newSocket.emit('join', `user-${user._id}`);

      // Admin joins admin-room
      if (user.role === 'admin') {
        newSocket.emit('join', 'admin-room');
      }

      // Handle real-time events
      newSocket.on('duty-reassignment', (data) => {
        setNotifications((prev) => [...prev, { type: 'duty-reassignment', data }]);
      });

      newSocket.on('status-change', (data) => {
        setNotifications((prev) => [...prev, { type: 'status-change', data }]);
      });

      newSocket.on('task-status-updated', (data) => {
        setNotifications((prev) => [...prev, { type: 'task-status-updated', data }]);
      });

      newSocket.on('leave-status-updated', (data) => {
        setNotifications((prev) => [...prev, { type: 'leave-status-updated', data }]);
      });

      newSocket.on('salary-added', (data) => {
        setNotifications((prev) => [...prev, { type: 'salary-added', data }]);
      });

      newSocket.on('leave-requested', (data) => {
        if (user.role === 'admin') {
          setNotifications((prev) => [...prev, { type: 'leave-requested', data }]);
        }
      });

      newSocket.on('new-duty', (data) => {
        if (user.role === 'admin') {
          setNotifications((prev) => [...prev, { type: 'new-duty', data }]);
        }
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, token, user]);

  const clearNotification = (index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, clearNotification }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);