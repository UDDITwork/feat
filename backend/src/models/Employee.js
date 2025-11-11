const mongoose = require('mongoose');

const trackerTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: 120
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  designation: {
    type: String,
    trim: true,
    maxlength: 120
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  trackerToken: trackerTokenSchema,
  lastInvitationSentAt: Date,
  lastSubmissionAt: Date,
  metadata: {
    department: {
      type: String,
      trim: true,
      maxlength: 120
    },
    employeeCode: {
      type: String,
      trim: true,
      maxlength: 60
    }
  }
}, {
  timestamps: true
});

employeeSchema.index({ email: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ 'metadata.employeeCode': 1 }, { sparse: true });

employeeSchema.methods.isTokenValid = function(token) {
  if (!this.trackerToken || this.trackerToken.token !== token) {
    return false;
  }
  return this.trackerToken.expiresAt > new Date();
};

employeeSchema.methods.setTrackerToken = function(token, expiresAt) {
  this.trackerToken = {
    token,
    expiresAt
  };
  return this.save();
};

module.exports = mongoose.model('Employee', employeeSchema);

