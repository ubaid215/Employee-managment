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
  getMyLeaveAnalytics
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

// Leave management
router.post('/apply-leave', applyLeave);
router.get('/my-leaves', getMyLeaves);
router.get('/my-leaves/analytics', getMyLeaveAnalytics);

// Salary routes - Fixed order and structure
router.get('/salary', getSalary);

// Option 1: Make ID optional with query parameter
router.get('/salary/pdf/:salaryId', downloadSalaryPDF);

router.get('/departments', getAllDepartments);
router.get('/duties', getAllDuties);



module.exports = router;