const express = require('express');
const router = express.Router();
const {
  // Department CRUD operations
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getDepartmentAnalytics,
  
  // Duty operations
  createDuty,
  getDutyFormSchema,
  getAllDuties,
   updateDuty,  
  deleteDuty, 
  
  
  // Other existing functions
  assignDepartmentAndDuties,
  changeStatus,
  viewEmployeeTasks,
  reviewTask,
  getEmployeeTaskStats,
  viewDepartmentHistory,
  getAllLeaves,
  getLeaveById,
  getLeaveAnalytics,
  approveLeave,
  getAllEmployees,
  addSalary,
  getAdminLeaveAnalytics,
  getAllSalaries,
  updateSalary,
  getEmployee
} = require('../controllers/adminController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

router.use(protect, isAdmin);

// Department management - Complete CRUD
router.route('/departments')
  .get(getAllDepartments)
  .post(createDepartment);

router.route('/departments/:id')
  .get(getDepartmentById)
  .patch(updateDepartment)
  .delete(deleteDepartment);

router.get('/departments/analytics/stats', getDepartmentAnalytics);

// Duty management
router.route('/duties')
  .post(createDuty)
  .get(getAllDuties) 

router.route('/duties/:id')
  .patch(updateDuty) 
  .delete(deleteDuty);

router.get('/duties/:id/form-schema', getDutyFormSchema);
router.post('/assign-duty', assignDepartmentAndDuties);
router.patch('/assign-duty', assignDepartmentAndDuties);

// Employee management
router.get('/employees', getAllEmployees);
router.get('/employees/:id', getEmployee);
router.patch('/change-status', changeStatus);

// Task management
router.get('/employee-tasks', viewEmployeeTasks);
router.patch('/tasks/:taskId/review', reviewTask);
router.get('/employees/:employeeId/task-stats', getEmployeeTaskStats);

// History tracking
router.get('/department-history/:id', viewDepartmentHistory);

// Leave management
router.get('/leaves', getAllLeaves);
router.get('/leaves/analytics', getLeaveAnalytics);
router.get('/leaves/advanced-analytics', getAdminLeaveAnalytics);
router.get('/leaves/:id', getLeaveById);
router.patch('/leaves/:id', approveLeave);

// Salary management
router.get('/salaries', getAllSalaries);
router.post('/salaries', addSalary);
router.patch('/salaries/:id', updateSalary);

module.exports = router;