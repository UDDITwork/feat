const express = require('express');
const router = express.Router();
const FormSubmission = require('../models/FormSubmission');

// Simple file upload handler (stores as base64 in database)
router.post('/upload', async (req, res) => {
  try {
    const { token, fieldName, file } = req.body;

    if (!token || !fieldName || !file) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: token, fieldName, or file'
      });
    }

    // Find the form submission
    const submission = await FormSubmission.findOne({ token });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Form submission not found'
      });
    }

    // Store file data (base64) in formData
    if (!submission.formData) {
      submission.formData = {};
    }

    submission.formData[fieldName] = {
      data: file.data,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date()
    };

    submission.status = 'draft';
    await submission.save();

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fieldName,
        fileName: file.name,
        fileSize: file.size
      }
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
});

// Get uploaded file
router.get('/file/:token/:fieldName', async (req, res) => {
  try {
    const { token, fieldName } = req.params;

    const submission = await FormSubmission.findOne({ token });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Form submission not found'
      });
    }

    const fileData = submission.formData?.[fieldName];

    if (!fileData || !fileData.data) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Send file as base64
    res.status(200).json({
      success: true,
      data: fileData
    });

  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve file',
      error: error.message
    });
  }
});

module.exports = router;
