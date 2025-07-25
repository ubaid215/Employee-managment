const User = require('../models/User');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const crypto = require('crypto');
const sendEmail = require('../utils/email');
const { promisify } = require('util');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// Create initial admin user (run once)
exports.createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const admin = await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'admin123',
        passwordConfirm: 'admin123',
        role: 'admin',
        status: 'active'
      });
      console.log('Admin user created:', admin.email);
    }
  } catch (err) {
    console.error('Error creating admin user:', err);
  }
};

// Register new employee
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm, phone, cnic } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already exists', 400));
    }

    // Create new user with pending status
    const newUser = await User.create({
      name,
      email,
      password,
      passwordConfirm,
      profile: { phone, cnic },
      status: 'pending'
    });

    // Notify admin about new registration
    req.io.to('admin-room').emit('new-registration', {
      userId: newUser._id,
      name: newUser.name,
      email: newUser.email
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    next(err);
  }
};

// Login user
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // 2) Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password +status');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // 3) Check if account is active
    if (user.status !== 'active') {
      return next(new AppError('Your account is not active', 403));
    }

    // 4) If everything ok, send token to client
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// Logout user
exports.logoutUser = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('There is no user with that email address', 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/auth/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!'
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError('There was an error sending the email. Try again later!'),
        500
      );
    }
  } catch (err) {
    next(err);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user
    // This is handled by the pre-save middleware in the User model

    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// Update password (for logged-in users)
exports.updatePassword = async (req, res, next) => {
  try {
    // 1) Validate user authentication
    if (!req.user || !req.user.id) {
      return next(new AppError('User not authenticated', 401));
    }

    // 2) Validate required fields
    const { currentPassword, password, passwordConfirm } = req.body;
    
    if (!currentPassword || !password || !passwordConfirm) {
      return next(new AppError('Please provide current password, new password, and password confirmation', 400));
    }

    // 3) Get user from collection with password
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // 4) Check if POSTed current password is correct
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return next(new AppError('Your current password is wrong', 401));
    }

    // 5) Validate new passwords match
    if (password !== passwordConfirm) {
      return next(new AppError('New password and confirmation do not match', 400));
    }

    // 6) Update password
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();

    // 7) Log user in with new token, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    console.error('Update password error:', err);
    next(err);
  }
};

// Update email (for logged-in users)
exports.updateEmail = async (req, res, next) => {
  try {
    // 1) Check if new email already exists
    const existingUser = await User.findOne({ email: req.body.newEmail });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    // 2) Verify current password
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.correctPassword(req.body.password, user.password))) {
      return next(new AppError('Password is incorrect', 401));
    }

    // 3) Update email
    user.email = req.body.newEmail;
    await user.save({ validateBeforeSave: true });

    res.status(200).json({
      status: 'success',
      message: 'Email updated successfully',
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

