const mongoose = require('mongoose');

const effortTypes = ['Search Report', 'Drafting', 'Drawing', 'Review'];

const effortEntrySchema = new mongoose.Schema({
  projectName: {
    type: String,
    trim: true,
    required: true,
    maxlength: 200
  },
  docketNumber: {
    type: String,
    trim: true,
    maxlength: 120
  },
  effortType: {
    type: String,
    enum: effortTypes,
    required: true
  },
  hours: {
    type: Number,
    required: true,
    min: 0,
    max: 24
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, { _id: false });

const workEntrySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true
  },
  arrivalTime: {
    type: String,
    trim: true,
    required: true,
    maxlength: 10
  },
  weekday: {
    type: String,
    trim: true,
    maxlength: 15
  },
  entries: {
    type: [effortEntrySchema],
    validate: {
      validator: function(value) {
        return Array.isArray(value) && value.length > 0;
      },
      message: 'At least one effort entry is required'
    }
  },
  totalHours: {
    type: Number,
    min: 0,
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  },
  metadata: {
    submissionSource: {
      type: String,
      trim: true,
      maxlength: 50,
      default: 'web-form'
    },
    ipAddress: {
      type: String,
      trim: true,
      maxlength: 45
    },
    userAgent: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

workEntrySchema.index({ employee: 1, date: 1 }, { unique: true });
workEntrySchema.index({ date: 1 });

workEntrySchema.pre('save', function(next) {
  if (this.isModified('entries')) {
    this.totalHours = this.entries.reduce((acc, entry) => acc + (entry.hours || 0), 0);
  }
  if (this.isModified('entries') || this.isModified('arrivalTime')) {
    this.updatedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('WorkEntry', workEntrySchema);

