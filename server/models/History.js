const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee is required'],
    index: true
  },
  fromDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  toDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'New department is required']
  },
  fromDuties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Duty'
  }],
  toDuties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Duty',
    required: [true, 'New duties are required']
  }],
  changedAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin who made the change is required']
  },
  reason: {
    type: String,
    trim: true,
    maxlength: [200, 'Reason cannot exceed 200 characters']
  }
});

// Indexes for query optimization
historySchema.index({ employee: 1, changedAt: -1 });
historySchema.index({ changedBy: 1 });

// Add history record to user's history array
historySchema.post('save', async function(doc) {
  await mongoose.model('User').updateOne(
    { _id: doc.employee },
    { $push: { history: doc._id } }
  );
});

const History = mongoose.model('History', historySchema);

module.exports = History;