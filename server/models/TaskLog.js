const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const taskLogSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must belong to an employee']
  },
  duty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Duty',
    required: [true, 'Task must be associated with a duty']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Task must belong to a department']
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Task data is required']
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'needs_revision'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  feedback: String,
  allowUpdates: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
taskLogSchema.index({ employee: 1 });
taskLogSchema.index({ duty: 1 });
taskLogSchema.index({ department: 1 });
taskLogSchema.index({ submittedAt: -1 });
taskLogSchema.index({ status: 1 });
taskLogSchema.index({ allowUpdates: 1 });

// Compound index for finding updatable tasks
taskLogSchema.index({ 
  employee: 1,
  duty: 1,
  allowUpdates: 1,
  status: 1
});

// Middleware to populate employee and duty when querying
taskLogSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'employee',
    select: 'name email profile.profileImage'
  }).populate({
    path: 'duty',
    select: 'title description'
  }).populate({
    path: 'department',
    select: 'name'
  });
  next();
});

// Static method to get stats by employee
taskLogSchema.statics.getStatsByEmployee = async function(employeeId) {
  const stats = await this.aggregate([
    {
      $match: { employee: mongoose.Types.ObjectId(employeeId) }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        lastSubmission: { $max: '$submittedAt' },
        // Add average completion time for approved tasks
        avgCompletionTime: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'approved'] },
              { $subtract: ['$reviewedAt', '$submittedAt'] },
              null
            ]
          }
        }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        lastSubmission: 1,
        avgCompletionTime: 1,
        _id: 0
      }
    }
  ]);

  return stats;
};

// Instance method to approve/reject task
taskLogSchema.methods.updateStatus = async function(status, userId, feedback = '') {
  if (!['approved', 'rejected', 'needs_revision'].includes(status)) {
    throw new AppError('Invalid status. Must be either "approved", "rejected", or "needs_revision"', 400);
  }

  this.status = status;
  this.reviewedBy = userId;
  this.reviewedAt = new Date();
  this.feedback = feedback;
  
  // Lock task unless it needs revision
  this.allowUpdates = status === 'needs_revision';
  
  await this.save();
  return this;
};

// Static method to find updatable tasks
taskLogSchema.statics.findUpdatableTask = async function(employeeId, dutyId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return this.findOne({
    employee: employeeId,
    duty: dutyId,
    allowUpdates: true,
    status: 'pending',
    submittedAt: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });
};

const TaskLog = mongoose.model('TaskLog', taskLogSchema);

module.exports = TaskLog;