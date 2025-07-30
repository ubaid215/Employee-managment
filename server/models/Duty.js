const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Field name is required'],
    trim: true,
    maxlength: [50, 'Field name cannot exceed 50 characters']
  },
  type: {
    type: String,
    enum: [
      'text', 'textarea', 'number', 'date', 'datetime', 'time',
      'select', 'radio', 'checkbox', 'url', 'email', 'tel',
      'password', 'file', 'range', 'color', 'search'
    ],
    required: [true, 'Field type is required'],
    default: 'text'
  },
  label: {
    type: String,
    required: [true, 'Field label is required'],
    trim: true,
    maxlength: [100, 'Field label cannot exceed 100 characters']
  },
  placeholder: {
    type: String,
    trim: true,
    maxlength: [200, 'Placeholder cannot exceed 200 characters']
  },
  required: { 
    type: Boolean, 
    default: false 
  },
  options: [{
    label: { type: String, required: true },
    value: { type: String, required: true }
  }],
  validation: {
    minLength: { type: Number, min: 0 },
    maxLength: { type: Number, min: 0 },
    min: { type: Number },
    max: { type: Number },
    pattern: { type: String },
    customMessage: { type: String },
    allowedFileTypes: [{ // New: for file fields
      type: String,
      enum: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
      default: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    }],
    maxFileSize: { // New: max file size in bytes
      type: Number,
      min: 0,
      max: 10 * 1024 * 1024, // 10MB max
      default: 5 * 1024 * 1024 // 5MB default
    },
    maxFiles: { // New: max number of files for multi-file uploads
      type: Number,
      min: 1,
      max: 5,
      default: 1
    }
  },
  defaultValue: mongoose.Schema.Types.Mixed,
  helpText: {
    type: String,
    maxlength: [300, 'Help text cannot exceed 300 characters']
  },
  conditional: {
    dependsOn: { type: String },
    showWhen: mongoose.Schema.Types.Mixed,
    hideWhen: mongoose.Schema.Types.Mixed
  }
}, { _id: true });

const dutySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Duty title is required'],
    trim: true,
    maxlength: [100, 'Duty title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required'],
    index: true
  },
  formSchema: {
    title: {
      type: String,
      default: 'Task Submission Form',
      maxlength: [100, 'Form title cannot exceed 100 characters']
    },
    description: {
      type: String,
      maxlength: [300, 'Form description cannot exceed 300 characters']
    },
    fields: [fieldSchema],
    submitButtonText: {
      type: String,
      default: 'Submit Task',
      maxlength: [50, 'Submit button text cannot exceed 50 characters']
    },
    allowMultipleSubmissions: {
      type: Boolean,
      default: true
    },
    submissionLimit: {
      type: Number,
      min: 1,
      default: null
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  estimatedTime: {
    type: Number,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
dutySchema.index({ title: 1, department: 1 }, { unique: true });
dutySchema.index({ isActive: 1, department: 1 });
dutySchema.index({ priority: 1, department: 1 });

// Virtuals
dutySchema.virtual('fieldCount').get(function () {
  return this.formSchema.fields ? this.formSchema.fields.length : 0;
});

dutySchema.virtual('departmentName', {
  ref: 'Department',
  localField: 'department',
  foreignField: '_id',
  justOne: true
});

// Pre-save validation
dutySchema.pre('save', function (next) {
  if (this.formSchema && this.formSchema.fields) {
    const fieldNames = this.formSchema.fields.map(f => f.name);
    const uniqueNames = [...new Set(fieldNames)];
    if (fieldNames.length !== uniqueNames.length) {
      return next(new Error('Field names must be unique within a form'));
    }

    for (let field of this.formSchema.fields) {
      if (['select', 'radio', 'checkbox'].includes(field.type)) {
        if (!field.options || field.options.length === 0) {
          return next(new Error(`Field "${field.name}" of type "${field.type}" must have options`));
        }
      }
      if (field.type === 'file') {
        if (!field.validation?.allowedFileTypes || field.validation.allowedFileTypes.length === 0) {
          return next(new Error(`File field "${field.name}" must specify allowed file types`));
        }
        if (!field.validation?.maxFileSize || field.validation.maxFileSize <= 0) {
          return next(new Error(`File field "${field.name}" must specify a valid max file size`));
        }
      }
    }
  }
  next();
});

// Validate form submission
dutySchema.methods.validateSubmission = function (submissionData) {
  const errors = [];
  if (!this.formSchema || !this.formSchema.fields) {
    return { isValid: true, errors: [] };
  }

  for (let field of this.formSchema.fields) {
    const value = submissionData[field.name];

    if (field.required && (!value || value === '' || (field.type === 'file' && !value?.length))) {
      errors.push(`${field.label} is required`);
      continue;
    }

    if (!field.required && (!value || value === '' || (field.type === 'file' && !value?.length))) {
      continue;
    }

    switch (field.type) {
      case 'file':
        if (Array.isArray(value)) {
          if (field.validation?.maxFiles && value.length > field.validation.maxFiles) {
            errors.push(`${field.label} exceeds maximum file count (${field.validation.maxFiles})`);
          }
          for (const file of value) {
            if (!file.filename || !file.path || !file.mimetype || !file.size) {
              errors.push(`${field.label} must include valid file metadata (filename, path, mimetype, size)`);
              continue;
            }
            if (field.validation?.allowedFileTypes && !field.validation.allowedFileTypes.includes(file.mimetype)) {
              errors.push(`${field.label} includes invalid file type: ${file.mimetype}`);
            }
            if (field.validation?.maxFileSize && file.size > field.validation.maxFileSize) {
              errors.push(`${field.label} file size exceeds ${field.validation.maxFileSize / 1024 / 1024}MB`);
            }
          }
        } else {
          errors.push(`${field.label} must be an array of file metadata`);
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push(`${field.label} must be a valid email address`);
        }
        break;
      case 'url':
        try {
          new URL(value);
        } catch {
          errors.push(`${field.label} must be a valid URL`);
        }
        break;
      case 'number':
        if (isNaN(value)) {
          errors.push(`${field.label} must be a number`);
        } else {
          const numValue = Number(value);
          if (field.validation?.min !== undefined && numValue < field.validation.min) {
            errors.push(`${field.label} must be at least ${field.validation.min}`);
          }
          if (field.validation?.max !== undefined && numValue > field.validation.max) {
            errors.push(`${field.label} must be at most ${field.validation.max}`);
          }
        }
        break;
      case 'text':
      case 'textarea':
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          errors.push(`${field.label} must be at least ${field.validation.minLength} characters`);
        }
        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          errors.push(`${field.label} must be at most ${field.validation.maxLength} characters`);
        }
        if (field.validation?.pattern) {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            errors.push(field.validation.customMessage || `${field.label} format is invalid`);
          }
        }
        break;
      case 'select':
      case 'radio':
        const validOptions = field.options.map(opt => opt.value);
        if (!validOptions.includes(value)) {
          errors.push(`${field.label} must be one of: ${validOptions.join(', ')}`);
        }
        break;
      case 'checkbox':
        if (!Array.isArray(value)) {
          errors.push(`${field.label} must be an array`);
        } else {
          const validOptions = field.options.map(opt => opt.value);
          const invalidValues = value.filter(v => !validOptions.includes(v));
          if (invalidValues.length > 0) {
            errors.push(`${field.label} contains invalid options: ${invalidValues.join(', ')}`);
          }
        }
        break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Static methods
dutySchema.statics.getByDepartment = function (departmentId, activeOnly = true) {
  const filter = { department: departmentId };
  if (activeOnly) filter.isActive = true;
  return this.find(filter)
    .populate('department', 'name')
    .populate('createdBy', 'name email')
    .sort({ priority: -1, createdAt: -1 });
};

dutySchema.statics.getWithFormSchema = function (dutyId) {
  return this.findById(dutyId)
    .populate('department', 'name')
    .populate('createdBy', 'name email');
};

const Duty = mongoose.model('Duty', dutySchema);
module.exports = Duty;