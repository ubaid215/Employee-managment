const mongoose = require('mongoose');

// Define field schema for form fields
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
      'text',       // Single line text input
      'textarea',   // Multi-line text input
      'number',     // Number input
      'date',       // Date picker
      'datetime',   // Date and time picker
      'time',       // Time picker
      'select',     // Dropdown selection
      'radio',      // Radio buttons
      'checkbox',   // Checkboxes
      'url',        // URL input with validation
      'email',      // Email input with validation
      'tel',        // Phone number input
      'password',   // Password input
      'file',       // File upload
      'range',      // Slider/range input
      'color',      // Color picker
      'search'      // Search input
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
  }], // For select, radio, checkbox fields
  validation: {
    minLength: { type: Number, min: 0 },
    maxLength: { type: Number, min: 0 },
    min: { type: Number },
    max: { type: Number },
    pattern: { type: String }, // Regex pattern
    customMessage: { type: String } // Custom validation message
  },
  defaultValue: mongoose.Schema.Types.Mixed,
  helpText: {
    type: String,
    maxlength: [300, 'Help text cannot exceed 300 characters']
  },
  conditional: {
    dependsOn: { type: String }, // Field name this depends on
    showWhen: mongoose.Schema.Types.Mixed, // Value that shows this field
    hideWhen: mongoose.Schema.Types.Mixed  // Value that hides this field
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
      default: null // null means unlimited
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  estimatedTime: {
    type: Number, // in minutes
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
  timestamps: true, // Automatically manages createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure unique title per department
dutySchema.index({ title: 1, department: 1 }, { unique: true });

// Index for active duties
dutySchema.index({ isActive: 1, department: 1 });

// Index for priority and department
dutySchema.index({ priority: 1, department: 1 });

// Virtual for form field count
dutySchema.virtual('fieldCount').get(function() {
  return this.formSchema.fields ? this.formSchema.fields.length : 0;
});

// Virtual to populate department name
dutySchema.virtual('departmentName', {
  ref: 'Department',
  localField: 'department',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to validate form schema
dutySchema.pre('save', function(next) {
  // Validate that select/radio/checkbox fields have options
  if (this.formSchema && this.formSchema.fields) {
    for (let field of this.formSchema.fields) {
      if (['select', 'radio', 'checkbox'].includes(field.type)) {
        if (!field.options || field.options.length === 0) {
          return next(new Error(`Field "${field.name}" of type "${field.type}" must have options`));
        }
      }
      
      // Validate field names are unique within the form
      const fieldNames = this.formSchema.fields.map(f => f.name);
      const uniqueNames = [...new Set(fieldNames)];
      if (fieldNames.length !== uniqueNames.length) {
        return next(new Error('Field names must be unique within a form'));
      }
    }
  }
  
  next();
});

// Static method to get duties by department
dutySchema.statics.getByDepartment = function(departmentId, activeOnly = true) {
  const filter = { department: departmentId };
  if (activeOnly) filter.isActive = true;
  
  return this.find(filter)
    .populate('department', 'name')
    .populate('createdBy', 'name email')
    .sort({ priority: -1, createdAt: -1 });
};

// Static method to get duty with full form schema
dutySchema.statics.getWithFormSchema = function(dutyId) {
  return this.findById(dutyId)
    .populate('department', 'name')
    .populate('createdBy', 'name email');
};

// Instance method to validate submitted form data
dutySchema.methods.validateSubmission = function(submissionData) {
  const errors = [];
  
  if (!this.formSchema || !this.formSchema.fields) {
    return { isValid: true, errors: [] };
  }
  
  for (let field of this.formSchema.fields) {
    const value = submissionData[field.name];
    
    // Check required fields
    if (field.required && (!value || value === '')) {
      errors.push(`${field.label} is required`);
      continue;
    }
    
    // Skip validation if field is not required and empty
    if (!field.required && (!value || value === '')) {
      continue;
    }
    
    // Type-specific validation
    switch (field.type) {
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

const Duty = mongoose.model('Duty', dutySchema);

module.exports = Duty;