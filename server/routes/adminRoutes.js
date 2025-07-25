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
  getAdminLeaveAnalytics
} = require('../controllers/adminController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

// All routes protected and admin-only
router.use(protect, isAdmin);

// Department management
router.post('/departments', createDepartment); 
router.post('/duties', createDuty);

// Employee management
router.post('/assign-duty', assignDepartmentAndDuties);
router.patch('/change-status', changeStatus);
router.get('/employees', getAllEmployees);

// Task management
router.get('/employee-tasks', viewEmployeeTasks);
router.patch('/tasks/:taskId/review', reviewTask);
router.get('/employees/:employeeId/task-stats', getEmployeeTaskStats);

// History tracking
router.get('/department-history/:id', viewDepartmentHistory);

// Add these routes
router.get('/leaves', getAllLeaves);
router.get('/leaves/analytics', getLeaveAnalytics);
router.get('/leaves/:id', getLeaveById);       // GET /api/admin/leaves/:id
router.patch('/leaves/approve', approveLeave); // PATCH /api/admin/leaves/approve
router.get('/leaves/advanced-analytics', getAdminLeaveAnalytics);

// Salary management
router.post('/add-salary', addSalary);

module.exports = router;