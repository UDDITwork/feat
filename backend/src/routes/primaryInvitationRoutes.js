const express = require('express');
const { body, validationResult } = require('express-validator');
const PrimaryInvitation = require('../models/PrimaryInvitation');
const emailService = require('../services/emailService');
const { uploadBase64Document } = require('../services/cloudinaryService');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

const singleInvitationValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('adminName').optional().isLength({ min: 2, max: 100 }).withMessage('Admin name must be between 2 and 100 characters'),
];

const bulkInvitationValidation = [
  body('emails').isArray({ min: 1 }).withMessage('Emails must be an array'),
  body('emails.*').isEmail().normalizeEmail().withMessage('Each email must be valid'),
  body('adminName').optional().isLength({ min: 2, max: 100 }).withMessage('Admin name must be between 2 and 100 characters'),
];

const clientFormValidation = [
  body('companyInfo').optional().isObject(),
  body('companyInfo.name').optional().isLength({ min: 2, max: 200 }),
  body('companyInfo.address').optional().isLength({ min: 5, max: 500 }),
  body('companyInfo.pinCode').optional().isLength({ min: 3, max: 12 }),
  body('companyInfo.gstNumber').optional().isLength({ min: 3, max: 20 }),
  body('companyInfo.entityType').optional().isIn(['', 'LLP', 'LLC', 'Startup', 'Pvt Ltd', 'Other']),
  body('applicantInfo').optional().isObject(),
  body('applicantInfo.name').optional().isLength({ min: 2, max: 200 }),
  body('applicantInfo.address').optional().isLength({ min: 5, max: 500 }),
  body('applicantInfo.pinCode').optional().isLength({ min: 3, max: 12 }),
  body('applicantInfo.sameAsCompany').optional().isBoolean(),
  body('inventors').optional().isArray(),
  body('inventors.*.name').optional().isLength({ min: 2, max: 200 }),
  body('inventors.*.address').optional().isLength({ min: 5, max: 500 }),
  body('inventors.*.pinCode').optional().isLength({ min: 3, max: 12 }),
  body('inventors.*.nationality').optional().isLength({ min: 2, max: 100 }),
  body('comments').optional().isLength({ max: 2000 }),
];

const uploadValidation = [
  body('fieldName').isIn(['gstCertificate', 'entityCertificate']).withMessage('Unsupported upload field'),
  body('file').isObject().withMessage('File payload is required'),
  body('file.data').isString().withMessage('File data must be a base64 string'),
  body('file.name').optional().isString(),
  body('file.type').optional().isString(),
];

const INVITATION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const buildValidationError = (errors) => ({
  success: false,
  message: 'Validation failed',
  errors: errors.array(),
});

const buildDocumentPayload = (uploadResult) => ({
  publicId: uploadResult.public_id,
  url: uploadResult.url,
  secureUrl: uploadResult.secure_url,
  originalFilename: uploadResult.original_filename,
  bytes: uploadResult.bytes,
  format: uploadResult.format,
  uploadedAt: uploadResult.created_at ? new Date(uploadResult.created_at) : new Date(),
});

const sanitizeDraftPayload = (invitation, payload) => {
  const sanitized = { ...payload };
  const lockedFields = invitation?.autoPrefillMetadata?.lockedFields || [];

  if (lockedFields.includes('companyInfo')) {
    delete sanitized.companyInfo;
  }

  return sanitized;
};

const buildSubmissionError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  error.isSubmissionValidationError = true;
  return error;
};

const ensureRequiredForSubmission = (invitation, payload) => {
  const lockedFields = invitation?.autoPrefillMetadata?.lockedFields || [];
  const companyInfoLocked = lockedFields.includes('companyInfo');
  const companyInfo = companyInfoLocked ? invitation.companyInfo : payload.companyInfo;

  if (!companyInfo || !companyInfo.name?.trim()) {
    throw buildSubmissionError('Company name is required.');
  }

  if (!companyInfo.address?.trim()) {
    throw buildSubmissionError('Company address is required.');
  }

  if (!companyInfo.pinCode?.trim()) {
    throw buildSubmissionError('Company pin code is required.');
  }

  if (!companyInfo.gstNumber?.trim()) {
    throw buildSubmissionError('GST number is required.');
  }

  if (!companyInfo.gstCertificate?.secureUrl) {
    throw buildSubmissionError('GST certificate upload is required.');
  }

  if (!companyInfo.entityType?.trim()) {
    throw buildSubmissionError('Entity type is required.');
  }

  if (!companyInfo.entityCertificate?.secureUrl) {
    throw buildSubmissionError('Entity certificate upload is required.');
  }

  const inventors = Array.isArray(payload.inventors) && payload.inventors.length > 0
    ? payload.inventors
    : invitation.inventors;

  if (!inventors || inventors.length === 0) {
    throw buildSubmissionError('At least one inventor is required.');
  }

  inventors.forEach((inventor, index) => {
    if (!inventor?.name?.trim()) {
      throw buildSubmissionError(`Inventor name is required for inventor #${index + 1}.`);
    }
    if (!inventor.address?.trim()) {
      throw buildSubmissionError(`Inventor address is required for inventor #${index + 1}.`);
    }
    if (!inventor.pinCode?.trim()) {
      throw buildSubmissionError(`Inventor pin code is required for inventor #${index + 1}.`);
    }
    if (!inventor.nationality?.trim()) {
      throw buildSubmissionError(`Inventor nationality is required for inventor #${index + 1}.`);
    }
  });
};

const parsePaginationParams = (query) => {
  const limit = Math.min(Number(query.limit) || 25, 100);
  const page = Math.max(Number(query.page) || 1, 1);
  const skip = (page - 1) * limit;
  return { limit, page, skip };
};

const deepClone = (value) => {
  if (value === null || value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value));
};

const createPrimaryInvitationRecord = async (email, adminName) => {
  const normalizedEmail = email.toLowerCase();
  const previousInvitation = await PrimaryInvitation.findOne({ email: normalizedEmail }).sort({ updatedAt: -1 });

  const token = emailService.generateFormToken(normalizedEmail);
  const expiresAt = new Date(Date.now() + INVITATION_EXPIRY_MS);
  const invitedAt = new Date();

  const autoPrefillEnabled = Boolean(
    previousInvitation && previousInvitation.companyInfo && previousInvitation.companyInfo.name
  );

  const companyInfoClone = autoPrefillEnabled ? deepClone(previousInvitation.companyInfo) : {};
  const applicantInfoClone = autoPrefillEnabled ? deepClone(previousInvitation.applicantInfo) : {};
  const inventorsClone = autoPrefillEnabled ? deepClone(previousInvitation.inventors || []) : [];

  const invitationPayload = {
    token,
    email: normalizedEmail,
    adminName,
    status: 'pending',
    expiresAt,
    invitedAt,
    lastInvitationSent: invitedAt,
    companyInfo: companyInfoClone || {},
    applicantInfo: applicantInfoClone || {},
    inventors: inventorsClone,
    comments: autoPrefillEnabled && previousInvitation.comments ? previousInvitation.comments : '',
    autoPrefillMetadata: {
      enabled: autoPrefillEnabled,
      previousInvitationId: autoPrefillEnabled ? previousInvitation._id : undefined,
      lockedFields: autoPrefillEnabled ? ['companyInfo'] : [],
    },
    history: [
      {
        event: 'invitation_sent',
        context: {
          adminName,
          autoPrefill: autoPrefillEnabled,
        },
        createdAt: invitedAt,
      },
    ],
  };

  const invitation = await PrimaryInvitation.create(invitationPayload);
  const formLink = emailService.generatePrimaryInvitationLink(token);
  const emailResult = await emailService.sendPrimaryInvitationEmail(normalizedEmail, adminName, formLink);

  if (!emailResult.success) {
    await PrimaryInvitation.deleteOne({ _id: invitation._id });
    throw new Error('Failed to send primary invitation email');
  }

  return { invitation, formLink };
};

router.post('/send', authMiddleware, singleInvitationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(buildValidationError(errors));
    }

    const { email } = req.body;
    const adminName = req.body.adminName || req.admin?.name || 'Admin';

    const { invitation, formLink } = await createPrimaryInvitationRecord(email, adminName);

    res.status(201).json({
      success: true,
      message: 'Primary invitation sent successfully',
      data: {
        id: invitation._id,
        email: invitation.email,
        token: invitation.token,
        formLink,
        expiresAt: invitation.expiresAt,
        autoPrefill: invitation.autoPrefillMetadata,
        companyInfo: invitation.companyInfo,
      },
    });
  } catch (error) {
    console.error('Error sending primary invitation:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send primary invitation',
      error: error.message,
    });
  }
});

router.post('/send-bulk', authMiddleware, bulkInvitationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(buildValidationError(errors));
    }

    const { emails, adminName } = req.body;
    const failures = [];
    const successes = [];
    const resolvedAdminName = adminName || req.admin?.name || 'Admin';

    for (const email of emails) {
      try {
        const { invitation, formLink } = await createPrimaryInvitationRecord(email, resolvedAdminName);
        successes.push({
          email: invitation.email,
          token: invitation.token,
          formLink,
          expiresAt: invitation.expiresAt,
        });
      } catch (error) {
        failures.push({ email, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bulk primary invitations processed',
      data: {
        total: emails.length,
        successful: successes.length,
        failed: failures.length,
        successes,
        failures,
      },
    });
  } catch (error) {
    console.error('Error sending bulk primary invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk invitations',
      error: error.message,
    });
  }
});

router.post('/resend', authMiddleware, singleInvitationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(buildValidationError(errors));
    }

    const { email } = req.body;
    const adminName = req.body.adminName || req.admin?.name || 'Admin';
    const normalizedEmail = email.toLowerCase();

    const invitation = await PrimaryInvitation.findOne({ email: normalizedEmail }).sort({ updatedAt: -1 });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'No primary invitation found for this email',
      });
    }

    const token = emailService.generateFormToken(normalizedEmail);
    const expiresAt = new Date(Date.now() + INVITATION_EXPIRY_MS);

    invitation.token = token;
    invitation.status = 'pending';
    invitation.expiresAt = expiresAt;
    invitation.invitedAt = new Date();
    invitation.lastInvitationSent = new Date();
    invitation.history.push({
      event: 'invitation_resent',
      context: { adminName },
      createdAt: new Date(),
    });

    await invitation.save();

    const formLink = emailService.generatePrimaryInvitationLink(token);
    const emailResult = await emailService.sendPrimaryInvitationEmail(normalizedEmail, adminName, formLink);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to resend primary invitation email',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Primary invitation resent successfully',
      data: {
        token,
        formLink,
        expiresAt,
      },
    });
  } catch (error) {
    console.error('Error resending primary invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend primary invitation',
      error: error.message,
    });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { limit } = parsePaginationParams(req.query);
    const statusFilter = req.query.status ? { status: req.query.status } : {};
    const invitations = await PrimaryInvitation.find(statusFilter)
      .sort({ invitedAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    console.error('Error fetching primary invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch primary invitations',
      error: error.message,
    });
  }
});

router.get('/completed', authMiddleware, async (req, res) => {
  try {
    const { limit, page, skip } = parsePaginationParams(req.query);
    const search = (req.query.search || '').trim();

    const query = { status: 'completed' };

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'companyInfo.name': { $regex: search, $options: 'i' } },
        { 'companyInfo.gstNumber': { $regex: search, $options: 'i' } },
      ];
    }

    console.log('Fetching completed primary invitations', { page, limit, search: search || undefined });

    const [total, invitations] = await Promise.all([
      PrimaryInvitation.countDocuments(query),
      PrimaryInvitation.find(query)
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    res.status(200).json({
      success: true,
      data: {
        page,
        pageSize: invitations.length,
        total,
        hasMore: skip + invitations.length < total,
        results: invitations,
      },
    });
  } catch (error) {
    console.error('Error fetching completed primary invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch completed invitations',
      error: error.message,
    });
  }
});

router.get('/completed/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching completed primary invitation detail', { id });
    const invitation = await PrimaryInvitation.findOne({ _id: id, status: 'completed' });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Completed invitation not found',
      });
    }

    res.status(200).json({
      success: true,
      data: invitation,
    });
  } catch (error) {
    console.error('Error fetching completed primary invitation detail:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invitation details',
      error: error.message,
    });
  }
});

router.get('/token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const invitation = await PrimaryInvitation.findOne({ token });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired invitation link',
      });
    }

    if (invitation.isExpired) {
      return res.status(410).json({
        success: false,
        message: 'Invitation link has expired',
        expiredAt: invitation.expiresAt,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        email: invitation.email,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        submittedAt: invitation.submittedAt,
        companyInfo: invitation.companyInfo,
        applicantInfo: invitation.applicantInfo,
        inventors: invitation.inventors,
        comments: invitation.comments,
        autoPrefill: invitation.autoPrefillMetadata,
        isCompanyInfoLocked: Boolean(invitation.autoPrefillMetadata?.lockedFields?.includes('companyInfo')),
      },
    });
  } catch (error) {
    console.error('Error verifying invitation token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify invitation',
      error: error.message,
    });
  }
});

router.post('/token/:token/save-draft', clientFormValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(buildValidationError(errors));
    }

    const { token } = req.params;
    const invitation = await PrimaryInvitation.findOne({ token });

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    if (invitation.isExpired) {
      return res.status(410).json({ success: false, message: 'Invitation link has expired' });
    }

    const sanitizedPayload = sanitizeDraftPayload(invitation, req.body || {});
    await invitation.saveDraft(sanitizedPayload);
    invitation.history.push({
      event: 'draft_saved',
      context: { fields: Object.keys(sanitizedPayload) },
      createdAt: new Date(),
    });
    await invitation.save();

    res.status(200).json({
      success: true,
      message: 'Draft saved successfully',
      data: {
        status: invitation.status,
        updatedAt: invitation.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error saving primary invitation draft:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save draft',
      error: error.message,
    });
  }
});

router.post('/token/:token/submit', clientFormValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(buildValidationError(errors));
    }

    const { token } = req.params;
    const invitation = await PrimaryInvitation.findOne({ token });

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    if (invitation.isExpired) {
      return res.status(410).json({ success: false, message: 'Invitation link has expired' });
    }

    if (invitation.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Invitation already completed' });
    }

    const sanitizedPayload = sanitizeDraftPayload(invitation, req.body || {});
    ensureRequiredForSubmission(invitation, sanitizedPayload);
    await invitation.markSubmitted(sanitizedPayload);
    invitation.history.push({
      event: 'form_submitted',
      context: { submittedAt: invitation.submittedAt },
      createdAt: invitation.submittedAt,
    });
    await invitation.save();

    res.status(200).json({
      success: true,
      message: 'Primary invitation submitted successfully',
      data: {
        status: invitation.status,
        submittedAt: invitation.submittedAt,
      },
    });
  } catch (error) {
    console.error('Error submitting primary invitation:', {
      token: req.params?.token,
      error: error.message,
      stack: error.stack,
    });
    const statusCode = error.statusCode || (error.isSubmissionValidationError ? 400 : 500);
    res.status(statusCode).json({
      success: false,
      message: statusCode === 400 ? error.message : 'Failed to submit invitation',
      error: error.message,
    });
  }
});

router.post('/token/:token/upload', uploadValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(buildValidationError(errors));
    }

    const { token } = req.params;
    const { fieldName, file } = req.body;
    const invitation = await PrimaryInvitation.findOne({ token });

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    if (invitation.isExpired) {
      return res.status(410).json({ success: false, message: 'Invitation link has expired' });
    }

    const uploadResult = await uploadBase64Document(
      file.data,
      `primary-invitations/${invitation.email}`,
      'auto'
    );

    const documentPayload = buildDocumentPayload(uploadResult);

    invitation.companyInfo = invitation.companyInfo || {};
    invitation.companyInfo[fieldName] = documentPayload;
    invitation.status = invitation.status === 'pending' ? 'draft' : invitation.status;
    invitation.history.push({
      event: 'document_uploaded',
      context: { fieldName, publicId: documentPayload.publicId },
      createdAt: new Date(),
    });

    await invitation.save();

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        fieldName,
        document: documentPayload,
      },
    });
  } catch (error) {
    console.error('Error uploading primary invitation document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message,
    });
  }
});

module.exports = router;

