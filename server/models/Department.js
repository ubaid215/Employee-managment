const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true, 
    trim: true,
    maxlength: [50, 'Department name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Department description cannot exceed 500 characters'],
    default: ''
  },
  duties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Duty'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp whenever department is modified
departmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Cascade delete all duties when department is deleted
departmentSchema.pre('remove', async function(next) {
  await this.model('Duty').deleteMany({ department: this._id });
  next();
});

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;