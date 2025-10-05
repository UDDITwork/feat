const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  name: { type: String, maxlength: 200 },
  gender: { type: String, enum: ['', 'Male', 'Female', 'Others', 'Prefer not to disclose'], default: '' },
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
    enum: ['', 'Natural Person', 'Other than Natural Person', 'Educational Institution', 'Small Entity', 'Startup', 'Others'],
    default: ''
  }
});

const inventorSchema = new mongoose.Schema({
  sameAsApplicant: { type: Boolean, default: false },
  name: { type: String, maxlength: 200 },
  gender: { type: String, enum: ['', 'Male', 'Female', 'Others', 'Prefer not to disclose'], default: '' },
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
    enum: ['', 'Ordinary', 'Convention', 'PCT-NP', 'PPH', 'Divisional', 'Patent of Addition'],
    default: ''
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
  },

  // Form 2 - Complete Specification
  form2_invention_title: { type: String, maxlength: 500 },
  form2_applicant_name: { type: String, maxlength: 200 },
  form2_applicant_nationality: { type: String, maxlength: 100 },
  form2_applicant_address: { type: String, maxlength: 500 },
  form2_specification_type: { type: String, enum: ['', 'complete', 'provisional'], default: '' },
  form2_specification_description: { type: String },
  form2_specification_claims: { type: String },
  form2_specification_abstract: { type: String, maxlength: 1000 },

  // Form 3 - Statement and Undertaking
  form3_undertaking_checked: { type: Boolean },
  form3_date: { type: Date },
  form3_signature: { type: String },

  // Form 5 - Declaration as to Inventorship
  form5_inventors: [{
    name: { type: String },
    nationality: { type: String },
    address: { type: String }
  }],
  form5_declaration_text: { type: String },
  form5_date: { type: Date },
  form5_signature: { type: String },

  // Form 6 - Application for Recording of Change in Applicant
  form6_application_number: { type: String },
  form6_filing_date: { type: Date },
  form6_invention_title: { type: String },
  form6_change_reason: { type: String },
  form6_former_applicant_name: { type: String },
  form6_former_applicant_address: { type: String },
  form6_new_applicant_name: { type: String },
  form6_new_applicant_address: { type: String },
  form6_new_applicant_nationality: { type: String },
  form6_supporting_documents: { type: String },
  form6_date: { type: Date },
  form6_signature: { type: String },

  // Form 7A - Opposition to Grant of Patent
  form7A_application_number: { type: String },
  form7A_filing_date: { type: Date },
  form7A_publication_date: { type: Date },
  form7A_invention_title: { type: String },
  form7A_applicant_name: { type: String },
  form7A_opponent_name: { type: String },
  form7A_opponent_address: { type: String },
  form7A_opponent_nationality: { type: String },
  form7A_grounds: [{ type: String }],
  form7A_grounds_details: { type: String },
  form7A_supporting_documents: { type: String },
  form7A_date: { type: Date },
  form7A_signature: { type: String },

  // Form 8 - Request for Mention of Inventor
  form8_application_number: { type: String },
  form8_filing_date: { type: Date },
  form8_invention_title: { type: String },
  form8_requestor_name: { type: String },
  form8_requestor_address: { type: String },
  form8_requestor_capacity: { type: String },
  form8_inventors: [{
    name: { type: String },
    nationality: { type: String },
    address: { type: String }
  }],
  form8_statement_upload: { type: String },
  form8_noc_upload: { type: String },
  form8_revised_form1: { type: String },
  form8_revised_form5: { type: String },
  form8_service_address: { type: String },
  form8_date: { type: Date },
  form8_signature: { type: String },

  // Form 13 - Request for Amendment
  form13_application_number: { type: String },
  form13_filing_date: { type: Date },
  form13_invention_title: { type: String },
  form13_applicant_name: { type: String },
  form13_applicant_address: { type: String },
  form13_documents_to_amend: [{ type: String }],
  form13_amendment_reason_type: { type: String },
  form13_amendment_reason: { type: String },
  form13_marked_copy: { type: String },
  form13_clean_copy: { type: String },
  form13_declaration_section59: { type: Boolean },
  form13_declaration_no_litigation: { type: Boolean },
  form13_declaration_truth: { type: Boolean },
  form13_date: { type: Date },
  form13_signature: { type: String },

  // Form 16 - Application for Registration of Title
  form16_application_number: { type: String },
  form16_patent_number: { type: String },
  form16_filing_date: { type: Date },
  form16_grant_date: { type: Date },
  form16_invention_title: { type: String },
  form16_transaction_type: { type: String },
  form16_transferor_name: { type: String },
  form16_transferor_address: { type: String },
  form16_transferee_name: { type: String },
  form16_transferee_address: { type: String },
  form16_transferee_nationality: { type: String },
  form16_consideration: { type: String },
  form16_transaction_date: { type: Date },
  form16_supporting_documents: { type: String },
  form16_date: { type: Date },
  form16_signature: { type: String },

  // Form 26 - Authorization of Patent Agent
  form26_principal_name: { type: String },
  form26_principal_address: { type: String },
  form26_principal_capacity: { type: String },
  form26_agents: [{
    name: { type: String },
    inpa_number: { type: String }
  }],
  form26_authorization_mode: { type: String },
  form26_application_number: { type: String },
  form26_invention_title: { type: String },
  form26_powers_granted: { type: String },
  form26_communication_request: { type: Boolean },
  form26_date: { type: Date },
  form26_signature: { type: String },
  form26_company_signatory_name: { type: String },
  form26_company_signatory_designation: { type: String },
  form26_office_location: { type: String },

  // Form 28 - Entity Declaration
  form28_applicant_name: { type: String },
  form28_applicant_address: { type: String },
  form28_application_number: { type: String },
  form28_filing_date: { type: Date },
  form28_invention_title: { type: String },
  form28_entity_type: { type: String, enum: ['', 'small_entity', 'startup', 'educational'], default: '' },
  form28_supporting_docs_description: { type: String },
  form28_supporting_documents: { type: String },
  form28_declaration_correctness: { type: Boolean },
  form28_date: { type: Date },
  form28_signatory_name: { type: String },
  form28_signatory_designation: { type: String },
  form28_signatory_address: { type: String },
  form28_signature: { type: String },
  form28_office_location: { type: String }
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
  lastInvitationSent: { type: Date },
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
