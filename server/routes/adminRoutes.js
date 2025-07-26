const express = require('express');
const router = express.Router();
const {
  createDepartment, 
  assignDepartmentAndDuties,
  changeStatus,
  createDuty,
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

// Department management
router.post('/departments', createDepartment);
router.post('/duties', createDuty);

// Employee management
router.get('/employees', getAllEmployees);
router.get('/employees/:id', getEmployee);
router.post('/assign-duty', assignDepartmentAndDuties);
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
router.get('/leaves/:id', getLeaveById);
router.patch('/leaves/:id', approveLeave);
router.get('/leaves/advanced-analytics', getAdminLeaveAnalytics);

// Salary management
router.get('/salaries', getAllSalaries);
router.post('/salaries', addSalary);
router.patch('/salaries/:id', updateSalary);

module.exports = router;