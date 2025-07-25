import { useState, useEffect } from 'react';
import { getAllEmployees } from '../../services/adminService';

const EmployeeCard = ({ employee }) => (
  <div className="bg-surface rounded-lg shadow-sm p-4 mb-3 flex items-center">
    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-4">
      {employee.name.charAt(0)}
    </div>
    <div className="flex-1">
      <h3 className="font-bold text-text-main">{employee.name}</h3>
      <p className="text-sm text-text-muted">{employee.email}</p>
      <div className="flex mt-1">
        <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full mr-2">
          {employee.department || 'No department'}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${
          employee.status === 'active' ? 'bg-accent/10 text-accent' : 'bg-error/10 text-error'
        }`}>
          {employee.status}
        </span>
      </div>
    </div>
    <button className="text-primary hover:text-primary-hover">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
      </svg>
    </button>
  </div>
);

const EmployeeManagementPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getAllEmployees();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-bg-light p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary">Employee Management</h1>
          <button className="bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded-md text-sm">
            Add Employee
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-focus bg-surface"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="bg-surface rounded-lg shadow-sm p-6 text-center">
            <p className="text-text-muted">No employees found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEmployees.map(employee => (
              <EmployeeCard key={employee.id} employee={employee} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagementPage;