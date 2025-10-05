const express = require('express');
const { body, validationResult } = require('express-validator');
const emailService = require('../services/emailService');
const FormSubmission = require('../models/FormSubmission');
const router = express.Router();

// Validation middleware
const validateEmail = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('adminName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Admin name must be between 2 and 100 characters')
];

const validateBulkEmails = [
  body('emails')
    .isArray({ min: 1 })
    .withMessage('Emails must be an array with at least one email'),
  body('emails.*')
    .isEmail()
    .normalizeEmail()
    .withMessage('Each email must be valid'),
  body('adminName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Admin name must be between 2 and 100 characters')
];

// Send single form invitation
router.post('/send-invitation', validateEmail, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, adminName } = req.body;

    // Allow multiple invitations - just update existing or create new
    const existingSubmission = await FormSubmission.findOne({ email });

    // Send email invitation
    const emailResult = await emailService.sendFormInvitation(email, adminName);

    // Create or update form submission record
    if (existingSubmission) {
      // Update existing submission with new token and expiration
      existingSubmission.token = emailResult.token;
      existingSubmission.expiresAt = emailResult.expiresAt;
      existingSubmission.status = 'pending';
      existingSubmission.lastInvitationSent = new Date();
      await existingSubmission.save();
    } else {
      // Create new submission
      const formSubmission = new FormSubmission({
        token: emailResult.token,
        email: email,
        expiresAt: emailResult.expiresAt,
        formData: {},
        status: 'pending',
        lastInvitationSent: new Date()
      });
      await formSubmission.save();
    }

    res.status(200).json({
      success: true,
      message: existingSubmission ? 'Form invitation resent successfully' : 'Form invitation sent successfully',
      data: {
        email: email,
        token: emailResult.token,
        formLink: emailResult.formLink,
        expiresAt: emailResult.expiresAt,
        messageId: emailResult.messageId
      }
    });

  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send form invitation',
      error: error.message
    });
  }
});

// Send bulk form invitations
router.post('/send-bulk-invitations', validateBulkEmails, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { emails, adminName } = req.body;

    // Check for existing submissions
    const existingSubmissions = await FormSubmission.find({
      email: { $in: emails },
      status: { $in: ['pending', 'draft'] }
    });

    const existingEmails = existingSubmissions.map(sub => sub.email);
    const newEmails = emails.filter(email => !existingEmails.includes(email));

    if (newEmails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All emails already have pending form invitations',
        existingEmails
      });
    }

    // Send bulk invitations
    const bulkResult = await emailService.sendBulkInvitations(newEmails, adminName);

    // Create form submission records for successful emails
    const formSubmissions = bulkResult.results.map(result => ({
      token: result.token,
      email: result.email,
      expiresAt: result.expiresAt,
      formData: {},
      status: 'pending'
    }));

    if (formSubmissions.length > 0) {
      await FormSubmission.insertMany(formSubmissions);
    }

    res.status(200).json({
      success: true,
      message: 'Bulk invitations processed',
      data: {
        summary: bulkResult.summary,
        results: bulkResult.results,
        errors: bulkResult.errors,
        existingEmails
      }
    });

  } catch (error) {
    console.error('Error sending bulk invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk invitations',
      error: error.message
    });
  }
});

// Verify form token
router.get('/verify-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Find form submission by token
    const formSubmission = await FormSubmission.findOne({ token });

    if (!formSubmission) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired form link'
      });
    }

    // Check if token is expired
    if (formSubmission.isExpired) {
      return res.status(410).json({
        success: false,
        message: 'Form link has expired. Please request a new invitation.',
        expiredAt: formSubmission.expiresAt
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        email: formSubmission.email,
        status: formSubmission.status,
        expiresAt: formSubmission.expiresAt,
        submittedAt: formSubmission.submittedAt,
        createdAt: formSubmission.createdAt
      }
    });

  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify token',
      error: error.message
    });
  }
});

// Resend invitation
router.post('/resend-invitation', validateEmail, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, adminName } = req.body;

    // Find existing submission
    const existingSubmission = await FormSubmission.findOne({ email });

    if (!existingSubmission) {
      return res.status(404).json({
        success: false,
        message: 'No existing form found for this email address'
      });
    }

    // Generate new token and link
    const newToken = emailService.generateFormToken(email);
    const newFormLink = emailService.generateFormLink(newToken);
    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Update submission with new token
    existingSubmission.token = newToken;
    existingSubmission.expiresAt = newExpiresAt;
    existingSubmission.status = 'pending';
    await existingSubmission.save();

    // Send new invitation
    const emailResult = await emailService.sendFormInvitation(email, adminName);

    res.status(200).json({
      success: true,
      message: 'Form invitation resent successfully',
      data: {
        email: email,
        token: newToken,
        formLink: newFormLink,
        expiresAt: newExpiresAt,
        messageId: emailResult.messageId
      }
    });

  } catch (error) {
    console.error('Error resending invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend invitation',
      error: error.message
    });
  }
});

// Get invitation status
router.get('/invitation-status/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const formSubmission = await FormSubmission.findOne({ email });

    if (!formSubmission) {
      return res.status(404).json({
        success: false,
        message: 'No form invitation found for this email'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        email: formSubmission.email,
        status: formSubmission.status,
        createdAt: formSubmission.createdAt,
        expiresAt: formSubmission.expiresAt,
        submittedAt: formSubmission.submittedAt,
        isExpired: formSubmission.isExpired
      }
    });

  } catch (error) {
    console.error('Error getting invitation status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get invitation status',
      error: error.message
    });
  }
});

module.exports = router;
