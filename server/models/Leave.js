const mongoose = require('mongoose');
const validator = require('validator');

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee is required'],
    index: true
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  fromDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date();
      },
      message: 'Start date must be in the future'
    }
  },
  toDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value >= this.fromDate;
      },
      message: 'End date must be after start date'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  decisionAt: Date,
  decidedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Rejection reason cannot exceed 200 characters']
  }
});

// Indexes for query optimization
leaveSchema.index({ employee: 1, status: 1 });
leaveSchema.index({ fromDate: 1, toDate: 1 });
leaveSchema.index({ status: 1 });

// Add leave record to user's leaveRecords array
leaveSchema.post('save', async function(doc) {
  await mongoose.model('User').updateOne(
    { _id: doc.employee },
    { $push: { leaveRecords: doc._id } }
  );
});

// Validate leave dates don't overlap with existing approved leaves
leaveSchema.pre('save', async function(next) {
  if (this.status === 'approved') {
    const overlappingLeave = await mongoose.model('Leave').findOne({
      employee: this.employee,
      status: 'approved',
      $or: [
        { fromDate: { $lte: this.toDate }, toDate: { $gte: this.fromDate } }
      ],
      _id: { $ne: this._id }
    });

    if (overlappingLeave) {
      const err = new Error('Leave dates overlap with existing approved leave');
      err.name = 'ValidationError';
      return next(err);
    }
  }
  next();
});

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;