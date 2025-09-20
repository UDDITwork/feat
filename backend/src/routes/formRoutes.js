const express = require('express');
const { body, validationResult } = require('express-validator');
const FormSubmission = require('../models/FormSubmission');
const emailService = require('../services/emailService');
const router = express.Router();

// Validation middleware for form data
const validateFormData = [
  body('formData').isObject().withMessage('Form data must be an object'),
  body('formData.titleOfInvention')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Title of invention must not exceed 500 characters'),
  body('formData.applicants')
    .optional()
    .isArray()
    .withMessage('Applicants must be an array'),
  body('formData.inventors')
    .optional()
    .isArray()
    .withMessage('Inventors must be an array')
];

// Get form by token
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const formSubmission = await FormSubmission.findOne({ token });

    if (!formSubmission) {
      return res.status(404).json({
        success: false,
        message: 'Form not found or invalid token'
      });
    }

    if (formSubmission.isExpired) {
      return res.status(410).json({
        success: false,
        message: 'Form link has expired. Please request a new invitation.',
        expiredAt: formSubmission.expiresAt
      });
    }

    res.status(200).json({
      success: true,
      data: {
        email: formSubmission.email,
        status: formSubmission.status,
        formData: formSubmission.formData,
        expiresAt: formSubmission.expiresAt,
        submittedAt: formSubmission.submittedAt,
        createdAt: formSubmission.createdAt
      }
    });

  } catch (error) {
    console.error('Error getting form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve form',
      error: error.message
    });
  }
});

// Save form draft
router.post('/save-draft', validateFormData, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token, formData } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const formSubmission = await FormSubmission.findOne({ token });

    if (!formSubmission) {
      return res.status(404).json({
        success: false,
        message: 'Form not found or invalid token'
      });
    }

    if (formSubmission.isExpired) {
      return res.status(410).json({
        success: false,
        message: 'Form link has expired'
      });
    }

    // Save draft
    await formSubmission.saveDraft(formData);

    res.status(200).json({
      success: true,
      message: 'Draft saved successfully',
      data: {
        status: formSubmission.status,
        updatedAt: formSubmission.updatedAt
      }
    });

  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save draft',
      error: error.message
    });
  }
});

// Submit form
router.post('/submit', validateFormData, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token, formData } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const formSubmission = await FormSubmission.findOne({ token });

    if (!formSubmission) {
      return res.status(404).json({
        success: false,
        message: 'Form not found or invalid token'
      });
    }

    if (formSubmission.isExpired) {
      return res.status(410).json({
        success: false,
        message: 'Form link has expired'
      });
    }

    if (formSubmission.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Form has already been submitted'
      });
    }

    // Update form data and mark as completed
    formSubmission.formData = formData;
    await formSubmission.markAsCompleted();

    // Send notification email to admin
    try {
      await emailService.sendNotificationEmail(
        process.env.ADMIN_EMAIL || 'udditkantsinha@gmail.com',
        {
          email: formSubmission.email,
          submittedAt: formSubmission.submittedAt,
          status: formSubmission.status
        }
      );
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // Don't fail the submission if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Form submitted successfully',
      data: {
        submissionId: formSubmission._id,
        email: formSubmission.email,
        submittedAt: formSubmission.submittedAt,
        status: formSubmission.status
      }
    });

  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit form',
      error: error.message
    });
  }
});

// Get form submission status
router.get('/status/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const formSubmission = await FormSubmission.findOne({ token });

    if (!formSubmission) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        email: formSubmission.email,
        status: formSubmission.status,
        submittedAt: formSubmission.submittedAt,
        expiresAt: formSubmission.expiresAt,
        isExpired: formSubmission.isExpired,
        createdAt: formSubmission.createdAt,
        updatedAt: formSubmission.updatedAt
      }
    });

  } catch (error) {
    console.error('Error getting form status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get form status',
      error: error.message
    });
  }
});

// Validate specific field
router.post('/validate-field', async (req, res) => {
  try {
    const { field, value, fieldType } = req.body;

    if (!field || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Field and value are required'
      });
    }

    let isValid = true;
    let errorMessage = '';

    // Field-specific validation
    switch (fieldType) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = emailRegex.test(value);
        errorMessage = isValid ? '' : 'Please enter a valid email address';
        break;

      case 'mobile':
        const mobileRegex = /^[6-9]\d{9}$/;
        isValid = mobileRegex.test(value);
        errorMessage = isValid ? '' : 'Please enter a valid 10-digit mobile number starting with 6-9';
        break;

      case 'pinCode':
        const pinCodeRegex = /^\d{6}$/;
        isValid = pinCodeRegex.test(value);
        errorMessage = isValid ? '' : 'Please enter a valid 6-digit PIN code';
        break;

      case 'date':
        const date = new Date(value);
        const today = new Date();
        isValid = date <= today;
        errorMessage = isValid ? '' : 'Date cannot be in the future';
        break;

      case 'required':
        isValid = value && value.toString().trim().length > 0;
        errorMessage = isValid ? '' : 'This field is required';
        break;

      default:
        isValid = true;
    }

    res.status(200).json({
      success: true,
      data: {
        field,
        value,
        isValid,
        errorMessage
      }
    });

  } catch (error) {
    console.error('Error validating field:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate field',
      error: error.message
    });
  }
});

module.exports = router;
