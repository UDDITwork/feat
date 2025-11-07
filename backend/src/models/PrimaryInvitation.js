const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    publicId: { type: String },
    url: { type: String },
    secureUrl: { type: String },
    originalFilename: { type: String },
    bytes: { type: Number },
    format: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const companyInfoSchema = new mongoose.Schema(
  {
    name: { type: String, maxlength: 200 },
    address: { type: String, maxlength: 500 },
    pinCode: { type: String, maxlength: 12 },
    gstNumber: { type: String, maxlength: 20 },
    gstCertificate: documentSchema,
    entityType: {
      type: String,
      enum: ['', 'LLP', 'LLC', 'Startup', 'Pvt Ltd', 'Other'],
      default: '',
    },
    entityCertificate: documentSchema,
  },
  { _id: false }
);

const applicantInfoSchema = new mongoose.Schema(
  {
    name: { type: String, maxlength: 200 },
    address: { type: String, maxlength: 500 },
    pinCode: { type: String, maxlength: 12 },
    sameAsCompany: { type: Boolean, default: false },
  },
  { _id: false }
);

const inventorSchema = new mongoose.Schema(
  {
    name: { type: String, maxlength: 200 },
    address: { type: String, maxlength: 500 },
    pinCode: { type: String, maxlength: 12 },
    nationality: { type: String, maxlength: 100 },
  },
  { _id: false }
);

const auditEntrySchema = new mongoose.Schema(
  {
    event: { type: String },
    context: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const primaryInvitationSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    adminName: { type: String, maxlength: 200 },
    status: {
      type: String,
      enum: ['pending', 'draft', 'completed'],
      default: 'pending',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    invitedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    companyInfo: companyInfoSchema,
    applicantInfo: applicantInfoSchema,
    inventors: { type: [inventorSchema], default: [] },
    comments: { type: String, maxlength: 2000 },
    autoPrefillMetadata: {
      enabled: { type: Boolean, default: false },
      previousInvitationId: { type: mongoose.Schema.Types.ObjectId, ref: 'PrimaryInvitation' },
      lockedFields: { type: [String], default: [] },
    },
    history: {
      type: [auditEntrySchema],
      default: [],
    },
    lastInvitationSent: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

primaryInvitationSchema.virtual('isExpired').get(function isExpired() {
  return this.expiresAt ? new Date() > this.expiresAt : false;
});

primaryInvitationSchema.methods.addHistory = function addHistory(event, context = {}) {
  this.history.push({ event, context, createdAt: new Date() });
  this.updatedAt = new Date();
  return this.save();
};

primaryInvitationSchema.methods.markSubmitted = function markSubmitted(formData = {}) {
  if (formData.companyInfo) {
    this.companyInfo = formData.companyInfo;
  }

  if (formData.applicantInfo) {
    this.applicantInfo = formData.applicantInfo;
  }

  if (Array.isArray(formData.inventors)) {
    this.inventors = formData.inventors;
  }

  if (formData.comments !== undefined) {
    this.comments = formData.comments;
  }

  this.status = 'completed';
  this.submittedAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

primaryInvitationSchema.methods.saveDraft = function saveDraft(formData = {}) {
  if (formData.companyInfo) {
    this.companyInfo = formData.companyInfo;
  }

  if (formData.applicantInfo) {
    this.applicantInfo = formData.applicantInfo;
  }

  if (Array.isArray(formData.inventors)) {
    this.inventors = formData.inventors;
  }

  if (formData.comments !== undefined) {
    this.comments = formData.comments;
  }

  this.status = 'draft';
  this.updatedAt = new Date();
  return this.save();
};

primaryInvitationSchema.index({ email: 1, status: 1 });
primaryInvitationSchema.index({ invitedAt: -1 });

module.exports = mongoose.model('PrimaryInvitation', primaryInvitationSchema);

