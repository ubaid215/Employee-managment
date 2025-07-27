import React from 'react';
import { Link } from 'react-router-dom';
import { User, Briefcase, Clock, ChevronRight, BadgeCheck, Clock4, Ban } from 'lucide-react';

const EmployeeCard = ({ employee }) => {
  const getStatusConfig = (status) => {
    switch(status) {
      case 'active':
        return {
          color: 'bg-emerald-100 text-emerald-800',
          icon: <BadgeCheck size={14} className="text-emerald-500" />
        };
      case 'pending':
        return {
          color: 'bg-amber-100 text-amber-800',
          icon: <Clock4 size={14} className="text-amber-500" />
        };
      case 'suspended':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <Ban size={14} className="text-red-500" />
        };
      default:
        return {
          color: 'bg-slate-100 text-slate-800',
          icon: null
        };
    }
  };

  const statusConfig = getStatusConfig(employee.status);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm overflow-hidden group h-full flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
              <User size={20} className="text-white" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${statusConfig.color}`}>
              {statusConfig.icon}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-800 truncate">{employee.name}</h3>
                <p className="text-sm text-slate-500 truncate" title={employee.email}>
                  {employee.email}
                </p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusConfig.color} flex items-center gap-1 flex-shrink-0`}>
                {statusConfig.icon}
                <span className="hidden sm:inline">{employee.status}</span>
              </span>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              {employee.department && (
                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                  <Briefcase size={14} className="text-slate-400" />
                  <span className="font-medium">{employee.department.name}</span>
                </div>
              )}
              
              {employee.profile?.joiningDate && (
                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                  <Clock size={14} className="text-slate-400" />
                  <span className="font-medium">
                    Since {new Date(employee.profile.joiningDate).getFullYear()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-5 pb-4 pt-3 border-t border-slate-100">
        <Link 
          to={`/admin/employees/${employee._id}`}
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 group-hover:underline justify-end w-full"
        >
          View details
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
};

export default EmployeeCard;