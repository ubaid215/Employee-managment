const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
  type: String,
  required: [true, 'Password is required'],
  minlength: [8, 'Password must be at least 8 characters'],
  select: false // password will not be returned in queries by default
},

passwordConfirm: {
  type: String,
  required: function () {
    return this.isNew || this.isModified('password');
  },
  validate: {
    validator: function (el) {
      return el === this.password;
    },
    message: 'Passwords do not match!'
  }
},

passwordChangedAt: Date,
passwordResetToken: String,
passwordResetExpires: Date,

  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee',
    index: true // ✅ Added for role-based queries
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'on_leave'],
    default: 'pending',
    index: true // ✅ Added for status filtering
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    index: true
  },
  duties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Duty'
  }],
  profile: {
    phone: {
      type: String,
      validate: {
        validator: function(v) {
          return /^[0-9]{10,15}$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      }
    },
    address: {
      type: String,
      maxlength: [200, 'Address cannot exceed 200 characters']
    },
    cnic: {
      type: String,
      unique: true,
      sparse: true,
      validate: {
        validator: function(v) {
          return /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/.test(v);
        },
        message: props => `${props.value} is not a valid CNIC!`
      }
    },
    joiningDate: {
      type: Date,
      default: Date.now,
      index: true // ✅ Added for date-based queries
    },
    emergencyContact: {
      name: String,
      relation: String,
      phone: String
    },
    profileImage: {
      type: String,
      default: 'default.jpg'
    }
  },
  salaryRecords: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Salary'
  }],
  leaveRecords: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Leave'
  }],
  history: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'History'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
    index: true // ✅ Added for date-based queries
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


// Compound indexes for common query patterns
userSchema.index({ department: 1, status: 1 }); // Get active employees by department
userSchema.index({ role: 1, status: 1 }); // Get active admins/employees
userSchema.index({ status: 1, 'profile.joiningDate': -1 }); // Get employees by status and join date
userSchema.index({ department: 1, 'profile.joiningDate': -1 }); // Department employees by join date

// Text search index for name-based searches
userSchema.index({ name: 'text', email: 'text' });

// Sparse index for optional fields that might be queried
userSchema.index({ passwordResetToken: 1 }, { sparse: true });

// TTL index for password reset tokens (auto-cleanup expired tokens)
userSchema.index({ passwordResetExpires: 1 }, { expireAfterSeconds: 0 });

// Middleware to hash password before saving
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// Update passwordChangedAt when password is modified
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // Ensure token is created after password change
  next();
});

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to create password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

const User = mongoose.model('User', userSchema);

module.exports = User;