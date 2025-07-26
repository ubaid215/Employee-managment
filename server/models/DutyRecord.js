const mongoose = require('mongoose');

const dutyRecordSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  duty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Duty',
    required: true
  },
  data: {
    type: Map,
    of: mongoose.Schema.Types.Mixed, // form values
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true // used for daily/monthly/yearly filtering
  }
}, {
  timestamps: true
});

dutyRecordSchema.index({ employee: 1, duty: 1, submittedAt: -1 });

const DutyRecord = mongoose.model('DutyRecord', dutyRecordSchema);

module.exports = DutyRecord;
