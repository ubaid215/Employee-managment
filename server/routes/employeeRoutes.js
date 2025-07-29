const express = require('express');
const { uploadUserPhoto, resizeUserPhoto } = require('../middlewares/upload');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  submitTask,
  applyLeave,
  getSalary,
  downloadSalaryPDF,
  getMyLeaves,
  getAllDepartments,
  getAllDuties,
  updateProfileImage,
  deleteProfileImage,
  getMyLeaveAnalytics,
  MyDuties,
  getMyDutyHistory
} = require('../controllers/employeeController');
const { protect } = require('../middlewares/authMiddleware');


// All routes protected
router.use(protect);

// Profile and duties
router.get('/me', getProfile);
router.patch('/me', updateProfile);

// Profile image routes
router.patch('/me/photo', uploadUserPhoto, resizeUserPhoto, updateProfileImage);
router.delete('/me/photo', deleteProfileImage);


// Task submission
router.post('/submit-task', submitTask);
router.put('/tasks/:id', submitTask);

// Leave management
router.post('/apply-leave', applyLeave);
router.get('/my-leaves', getMyLeaves);
router.get('/my-leaves/analytics', getMyLeaveAnalytics);

// Salary routes - Fixed order and structure
router.get('/salary', getSalary);

// Option 1: Make ID optional with query parameter
router.get('/salary/pdf/:id', downloadSalaryPDF);

router.get('/departments', getAllDepartments);
router.get('/my-duties', MyDuties); 
router.get('/duties', getAllDuties);
router.get('/duty-history', getMyDutyHistory);



module.exports = router;