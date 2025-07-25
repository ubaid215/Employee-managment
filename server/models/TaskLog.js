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
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  feedback: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
taskLogSchema.index({ employee: 1 });
taskLogSchema.index({ duty: 1 });
taskLogSchema.index({ submittedAt: -1 });
taskLogSchema.index({ status: 1 });

// Middleware to populate employee and duty when querying
taskLogSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'employee',
    select: 'name email profile.profileImage'
  }).populate({
    path: 'duty',
    select: 'title description'
  });
  next();
});

// Static method to get stats by employee
taskLogSchema.statics.getStatsByEmployee = async function(employeeId) {
  const stats = await this.aggregate([
    {
      $match: { employee: employeeId }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        lastSubmission: { $max: '$submittedAt' }
      }
    }
  ]);

  return stats;
};

// Instance method to approve/reject task
taskLogSchema.methods.updateStatus = async function(status, userId, feedback = '') {
  if (!['approved', 'rejected'].includes(status)) {
    throw new AppError('Invalid status. Must be either "approved" or "rejected"', 400);
  }

  this.status = status;
  this.reviewedBy = userId;
  this.reviewedAt = new Date();
  this.feedback = feedback;

  await this.save();
  return this;
};

const TaskLog = mongoose.model('TaskLog', taskLogSchema);

module.exports = TaskLog;