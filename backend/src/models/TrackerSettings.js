const mongoose = require('mongoose');

const trackerSettingsSchema = new mongoose.Schema({
  cronStatus: {
    type: String,
    enum: ['active', 'paused'],
    default: 'active'
  },
  cronTime: {
    type: String,
    default: '18:00',
    match: /^([01]\d|2[0-3]):([0-5]\d)$/
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  daysActive: {
    type: [String],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    validate: {
      validator: function(value) {
        return value.length > 0;
      },
      message: 'At least one active day is required'
    }
  },
  emailTemplateId: {
    type: String,
    trim: true
  },
  emailSubject: {
    type: String,
    trim: true,
    default: 'Daily Work Tracker Reminder'
  },
  additionalRecipients: {
    type: [String],
    default: []
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

trackerSettingsSchema.statics.getActiveSettings = async function() {
  const settings = await this.findOne();
  if (settings) {
    return settings;
  }
  return this.create({});
};

module.exports = mongoose.model('TrackerSettings', trackerSettingsSchema);

