const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateEmail
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes (no authentication required)
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// Protected routes (require authentication)
router.use(protect);

// All routes below this point require authentication
router.patch('/updatePassword', updatePassword);
router.patch('/updateEmail', updateEmail);

module.exports = router;