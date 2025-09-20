const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  name: { type: String, maxlength: 200 },
  gender: { type: String, enum: ['Male', 'Female', 'Others', 'Prefer not to disclose'] },
  nationality: { type: String },
  countryOfResidence: { type: String },
  age: { type: Number, min: 1, max: 99 },
  address: {
    houseNo: { type: String, maxlength: 50 },
    street: { type: String, maxlength: 100 },
    city: { type: String, maxlength: 50 },
    state: { type: String },
    country: { type: String },
    pinCode: { type: String },
    email: { type: String },
    contactNumber: { type: String }
  },
  category: { 
    type: String, 
    enum: ['Natural Person', 'Other than Natural Person', 'Educational Institution', 'Small Entity', 'Startup', 'Others'] 
  }
});

const inventorSchema = new mongoose.Schema({
  sameAsApplicant: { type: Boolean, default: false },
  name: { type: String, maxlength: 200 },
  gender: { type: String, enum: ['Male', 'Female', 'Others', 'Prefer not to disclose'] },
  nationality: { type: String },
  age: { type: Number, min: 1, max: 99 },
  countryOfResidence: { type: String },
  address: { type: String, maxlength: 500 }
});

const priorityClaimSchema = new mongoose.Schema({
  country: { type: String },
  applicationNumber: { type: String, maxlength: 30 },
  filingDate: { type: Date },
  applicantName: { type: String, maxlength: 200 },
  titleOfInvention: { type: String, maxlength: 500 },
  ipcClassification: { type: String }
});

const pctDetailsSchema = new mongoose.Schema({
  internationalApplicationNumber: { type: String },
  internationalFilingDate: { type: Date }
});

const divisionalApplicationSchema = new mongoose.Schema({
  originalApplicationNumber: { type: String },
  dateOfFilingOriginal: { type: Date }
});

const patentOfAdditionSchema = new mongoose.Schema({
  mainApplicationNumber: { type: String },
  dateOfFilingMainApplication: { type: Date }
});

const addressForServiceSchema = new mongoose.Schema({
  name: { type: String, maxlength: 100 },
  postalAddress: { type: String, maxlength: 300 },
  telephoneNo: { type: String },
  mobileNo: { type: String },
  faxNo: { type: String },
  emailId: { type: String }
});

const formDataSchema = new mongoose.Schema({
  // Basic Information
  applicationNo: { type: String },
  filingDate: { type: Date },
  cbrNo: { type: String },
  applicantReference: { type: String, maxlength: 50 },
  
  // Type of Application
  typeOfApplication: { 
    type: String, 
    enum: ['Ordinary', 'Convention', 'PCT-NP', 'PPH', 'Divisional', 'Patent of Addition'] 
  },
  
  // Applicants
  applicants: [applicantSchema],
  
  // Inventors
  inventors: [inventorSchema],
  
  // Title
  titleOfInvention: { type: String, maxlength: 500 },
  
  // Patent Agent
  patentAgent: {
    inPaNo: { type: String },
    agentName: { type: String, maxlength: 100 },
    mobileNo: { type: String }
  },
  
  // Address for Service
  addressForService: addressForServiceSchema,
  
  // Priority Details
  priorityClaims: [priorityClaimSchema],
  
  // PCT Details
  pctDetails: pctDetailsSchema,
  
  // Divisional Application
  divisionalApplication: divisionalApplicationSchema,
  
  // Patent of Addition
  patentOfAddition: patentOfAdditionSchema,
  
  // Declarations
  declarations: {
    date: { type: Date },
    signature: { type: String }
  }
});

const adminEditSchema = new mongoose.Schema({
  field: { type: String, required: true },
  oldValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed },
  editedBy: { type: String, required: true },
  editedAt: { type: Date, default: Date.now }
});

const formSubmissionSchema = new mongoose.Schema({
  token: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  email: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true
  },
  status: { 
    type: String, 
    enum: ['pending', 'draft', 'completed'], 
    default: 'pending' 
  },
  submittedAt: { type: Date },
  expiresAt: { 
    type: Date, 
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB TTL index
  },
  formData: formDataSchema,
  adminEdits: [adminEditSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for better performance
formSubmissionSchema.index({ email: 1, status: 1 });
formSubmissionSchema.index({ createdAt: -1 });

// Pre-save middleware to update updatedAt
formSubmissionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for checking if submission is expired
formSubmissionSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Method to mark as completed
formSubmissionSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.submittedAt = new Date();
  return this.save();
};

// Method to save draft
formSubmissionSchema.methods.saveDraft = function(formData) {
  this.formData = formData;
  this.status = 'draft';
  this.updatedAt = new Date();
  return this.save();
};

// Method to add admin edit
formSubmissionSchema.methods.addAdminEdit = function(field, oldValue, newValue, editedBy) {
  this.adminEdits.push({
    field,
    oldValue,
    newValue,
    editedBy,
    editedAt: new Date()
  });
  this.updatedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('FormSubmission', formSubmissionSchema);
