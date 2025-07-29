import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Briefcase, 
  Clock, 
  ChevronRight, 
  BadgeCheck, 
  Clock4, 
  Ban, 
  Settings,
  ClipboardList,
  Edit3
} from 'lucide-react';
import DepartmentChangeModal from './DepartmentChangeModal';

const EmployeeCard = ({ employee }) => {
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

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

  const handleAssignmentClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAssignmentModalOpen(true);
  };

  const getDutiesDisplay = () => {
    if (!employee.duties || employee.duties.length === 0) {
      return 'No duties assigned';
    }
    
    // Handle case where duties might be objects or strings
    if (employee.duties.length === 1) {
      const duty = employee.duties[0];
      return typeof duty === 'object' ? duty.name || duty.title || 'Duty' : duty;
    }
    
    return `${employee.duties.length} duties assigned`;
  };

  return (
    <>
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
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusConfig.color} flex items-center gap-1`}>
                    {statusConfig.icon}
                    <span className="hidden sm:inline">{employee.status}</span>
                  </span>
                  
                  <button
                    onClick={handleAssignmentClick}
                    className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 flex items-center justify-center transition-all duration-200 hover:scale-105 group/edit"
                    title="Edit Department & Duties Assignment"
                  >
                    <Edit3 size={14} className="text-blue-600 group-hover/edit:text-blue-700" />
                  </button>
                </div>
              </div>
              
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                  <Briefcase size={14} className="text-slate-400" />
                  <span className="font-medium text-sm">
                    {employee.department ? 
                      (typeof employee.department === 'object' ? employee.department.name : employee.department) 
                      : 'No department assigned'}
                  </span>
                  {!employee.department && (
                    <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md">
                      Unassigned
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                  <ClipboardList size={14} className="text-slate-400" />
                  <span className="font-medium text-sm">
                    {getDutiesDisplay()}
                  </span>
                  {(!employee.duties || employee.duties.length === 0) && (
                    <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md">
                      No duties
                    </span>
                  )}
                </div>

                {employee.profile?.joiningDate && (
                  <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                    <Clock size={14} className="text-slate-400" />
                    <span className="font-medium text-sm">
                      Since {new Date(employee.profile.joiningDate).getFullYear()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  Dept: {employee.department ? 'Assigned' : 'Pending'}
                </span>
                <span className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${employee.duties?.length > 0 ? 'bg-green-400' : 'bg-amber-400'}`}></div>
                  Duties: {employee.duties?.length || 0}
                </span>
              </div>
              
              <button
                onClick={handleAssignmentClick}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <Settings size={12} />
                Manage
              </button>
            </div>
          </div>
        </div>
        
        <div className="px-5 pb-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <Link 
              to={`/admin/employees/${employee._id}`}
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 group-hover:underline"
            >
              View details
              <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            
            <div className="flex items-center gap-1 text-xs">
              {(!employee.department || !employee.duties?.length) && (
                <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md font-medium">
                  Incomplete Setup
                </span>
              )}
              {employee.department && employee.duties?.length > 0 && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md font-medium">
                  Fully Assigned
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <DepartmentChangeModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        employeeId={employee._id}
        employeeName={employee.name}
        currentDepartment={employee.department}
        currentDuties={employee.duties || []}
      />
    </>
  );
};

export default EmployeeCard;