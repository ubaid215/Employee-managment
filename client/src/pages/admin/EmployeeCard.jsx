import React from 'react';
import { Link } from 'react-router-dom';
import { User, Briefcase, Clock, ChevronRight } from 'lucide-react';

const EmployeeCard = ({ employee }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <User size={20} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{employee.name}</h3>
                <p className="text-sm text-gray-500">{employee.email}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(employee.status)}`}>
                {employee.status}
              </span>
            </div>
            
            <div className="mt-3 flex items-center gap-4 text-sm">
              {employee.department && (
                <div className="flex items-center gap-1 text-gray-600">
                  <Briefcase size={14} />
                  <span>{employee.department.name}</span>
                </div>
              )}
              {employee.profile?.joiningDate && (
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock size={14} />
                  <span>{new Date(employee.profile.joiningDate).getFullYear()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Link 
            to={`/admin/employees/${employee._id}`}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
          >
            View details <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;