const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true, 
    trim: true,
    maxlength: [50, 'Department name cannot exceed 50 characters']
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


// Update timestamp on save
departmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Cascade delete duties when department is deleted
departmentSchema.pre('remove', async function(next) {
  await this.model('Duty').deleteMany({ department: this._id });
  next();
});

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;