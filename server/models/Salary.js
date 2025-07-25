const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee is required'],
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  type: {
    type: String,
    enum: ['full', 'advance'],
    default: 'full'
  },
  month: {
    type: String,
    required: [true, 'Month is required'],
    match: [/^(January|February|March|April|May|June|July|August|September|October|November|December)\s\d{4}$/, 'Month format should be "Month YYYY"']
  },
  paidOn: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    trim: true,
    maxlength: [200, 'Note cannot exceed 200 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  // New fields
  advanceAmount: {
    type: Number,
    min: [0, 'Advance amount cannot be negative'],
    default: 0
  },
  fullPayment: {
    type: Number,
    min: [0, 'Full payment cannot be negative'],
    default: 0
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'partial'],
    default: 'paid'
  }
});



// Add salary record to user's salaryRecords array
salarySchema.post('save', async function(doc) {
  await mongoose.model('User').updateOne(
    { _id: doc.employee },
    { $push: { salaryRecords: doc._id } }
  );
});

const Salary = mongoose.model('Salary', salarySchema);

module.exports = Salary;

