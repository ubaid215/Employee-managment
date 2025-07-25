import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getEmployeeTasks } from '../../services/taskService';

const TaskCard = ({ task }) => (
  <div className="bg-surface rounded-lg shadow-sm p-4 mb-3 border-l-4 border-accent">
    <h3 className="font-bold text-text-main">{task.title}</h3>
    <p className="text-sm text-text-muted mt-1">{task.description}</p>
    <div className="flex justify-between items-center mt-3">
      <span className={`text-xs px-2 py-1 rounded-full ${
        task.status === 'completed' ? 'bg-accent/10 text-accent' : 
        task.status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-secondary/10 text-secondary'
      }`}>
        {task.status}
      </span>
      <span className="text-xs text-text-muted">{new Date(task.dueDate).toLocaleDateString()}</span>
    </div>
  </div>
);

const EmployeeTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getEmployeeTasks(user.id);
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user.id]);

  return (
    <div className="min-h-screen bg-bg-light p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-6">My Tasks</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-surface rounded-lg shadow-sm p-6 text-center">
            <p className="text-text-muted">No tasks assigned yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeTasksPage;