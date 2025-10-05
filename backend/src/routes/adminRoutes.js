const express = require('express');
const { body, validationResult } = require('express-validator');
const FormSubmission = require('../models/FormSubmission');
const Admin = require('../models/Admin');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(authMiddleware);

// Validation middleware
const validateSubmissionEdit = [
  body('field').notEmpty().withMessage('Field is required'),
  body('newValue').notEmpty().withMessage('New value is required'),
  body('editedBy').notEmpty().withMessage('Editor name is required')
];

// Get all form submissions with pagination and filtering
router.get('/submissions', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'formData.titleOfInvention': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get submissions with pagination
    const submissions = await FormSubmission.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-formData -adminEdits')
      .lean();

    // Get total count for pagination
    const total = await FormSubmission.countDocuments(filter);

    // Get status counts
    const statusCounts = await FormSubmission.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusSummary = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        submissions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        statusSummary,
        filters: {
          status,
          search,
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error) {
    console.error('Error getting submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve submissions',
      error: error.message
    });
  }
});

// Get single submission details
router.get('/submission/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await FormSubmission.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: submission
    });

  } catch (error) {
    console.error('Error getting submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve submission',
      error: error.message
    });
  }
});

// Edit submission field
router.put('/submission/:id/edit', validateSubmissionEdit, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { field, newValue, editedBy } = req.body;

    const submission = await FormSubmission.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Get old value using dot notation for nested fields (supports arrays)
    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    const setNestedValue = (obj, path, value) => {
      const keys = path.split('.');
      const lastKey = keys.pop();
      const target = keys.reduce((current, key) => {
        // Check if key is a number (array index)
        const isArrayIndex = /^\d+$/.test(key);

        if (isArrayIndex) {
          const index = parseInt(key, 10);
          if (!Array.isArray(current)) {
            throw new Error(`Expected array at path but found ${typeof current}`);
          }
          if (!current[index]) {
            current[index] = {};
          }
          return current[index];
        } else {
          if (!current[key]) {
            // Check if next key is a number to decide if we need an array or object
            const nextKeyIndex = keys.indexOf(key) + 1;
            const nextKey = keys[nextKeyIndex];
            current[key] = /^\d+$/.test(nextKey) ? [] : {};
          }
          return current[key];
        }
      }, obj);

      // Set the final value (handle array index in lastKey)
      if (/^\d+$/.test(lastKey)) {
        const index = parseInt(lastKey, 10);
        target[index] = value;
      } else {
        target[lastKey] = value;
      }
    };

    const oldValue = getNestedValue(submission.formData, field);

    // Update the field value
    setNestedValue(submission.formData, field, newValue);

    // Add admin edit record
    await submission.addAdminEdit(field, oldValue, newValue, editedBy);

    res.status(200).json({
      success: true,
      message: 'Field updated successfully',
      data: {
        field,
        oldValue,
        newValue,
        editedBy,
        editedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error editing submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to edit submission',
      error: error.message
    });
  }
});

// Bulk edit submissions
router.put('/submissions/bulk-edit', async (req, res) => {
  try {
    const { submissionIds, field, newValue, editedBy } = req.body;

    if (!submissionIds || !Array.isArray(submissionIds) || submissionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Submission IDs array is required'
      });
    }

    if (!field || newValue === undefined || !editedBy) {
      return res.status(400).json({
        success: false,
        message: 'Field, newValue, and editedBy are required'
      });
    }

    const results = [];
    const errors = [];

    for (const submissionId of submissionIds) {
      try {
        const submission = await FormSubmission.findById(submissionId);
        
        if (!submission) {
          errors.push({ submissionId, error: 'Submission not found' });
          continue;
        }

        // Get old value (supports arrays)
        const getNestedValue = (obj, path) => {
          return path.split('.').reduce((current, key) => current?.[key], obj);
        };

        const setNestedValue = (obj, path, value) => {
          const keys = path.split('.');
          const lastKey = keys.pop();
          const target = keys.reduce((current, key) => {
            const isArrayIndex = /^\d+$/.test(key);
            if (isArrayIndex) {
              const index = parseInt(key, 10);
              if (!Array.isArray(current)) return current;
              if (!current[index]) current[index] = {};
              return current[index];
            } else {
              const nextKeyIndex = keys.indexOf(key) + 1;
              const nextKey = keys[nextKeyIndex];
              if (!current[key]) current[key] = /^\d+$/.test(nextKey) ? [] : {};
              return current[key];
            }
          }, obj);

          if (/^\d+$/.test(lastKey)) {
            target[parseInt(lastKey, 10)] = value;
          } else {
            target[lastKey] = value;
          }
        };

        const oldValue = getNestedValue(submission.formData, field);
        setNestedValue(submission.formData, field, newValue);

        await submission.addAdminEdit(field, oldValue, newValue, editedBy);
        
        results.push({ submissionId, success: true });
      } catch (error) {
        errors.push({ submissionId, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bulk edit completed',
      data: {
        results,
        errors,
        summary: {
          total: submissionIds.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });

  } catch (error) {
    console.error('Error in bulk edit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk edit',
      error: error.message
    });
  }
});

// Get admin edit history for a submission
router.get('/submission/:id/edit-history', async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await FormSubmission.findById(id).select('adminEdits email');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        email: submission.email,
        editHistory: submission.adminEdits.sort((a, b) => b.editedAt - a.editedAt)
      }
    });

  } catch (error) {
    console.error('Error getting edit history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve edit history',
      error: error.message
    });
  }
});

// Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get basic counts
    const totalSubmissions = await FormSubmission.countDocuments();
    const pendingSubmissions = await FormSubmission.countDocuments({ status: 'pending' });
    const completedSubmissions = await FormSubmission.countDocuments({ status: 'completed' });
    const draftSubmissions = await FormSubmission.countDocuments({ status: 'draft' });

    // Get recent submissions (last 30 days)
    const recentSubmissions = await FormSubmission.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get submissions by status over time
    const submissionsByStatus = await FormSubmission.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get submissions by day (last 7 days)
    const submissionsByDay = await FormSubmission.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get expired submissions
    const expiredSubmissions = await FormSubmission.countDocuments({
      expiresAt: { $lt: now },
      status: { $in: ['pending', 'draft'] }
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalSubmissions,
          pendingSubmissions,
          completedSubmissions,
          draftSubmissions,
          recentSubmissions,
          expiredSubmissions
        },
        submissionsByStatus,
        submissionsByDay,
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics',
      error: error.message
    });
  }
});

// Get notifications (new submissions)
router.get('/notifications', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get recent completed submissions
    const notifications = await FormSubmission.find({ status: 'completed' })
      .sort({ submittedAt: -1 })
      .limit(parseInt(limit))
      .select('email submittedAt formData.titleOfInvention')
      .lean();

    res.status(200).json({
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications',
      error: error.message
    });
  }
});

// Delete submission
router.delete('/submission/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await FormSubmission.findByIdAndDelete(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Submission deleted successfully',
      data: {
        deletedId: id,
        email: submission.email
      }
    });

  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete submission',
      error: error.message
    });
  }
});

// Get clients data extracted from form submissions
router.get('/clients', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, status } = req.query;

    // Build filter object
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'formData.applicantDetails.applicants.0.name': { $regex: search, $options: 'i' } },
        { 'formData.basicInformation.titleOfInvention': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get submissions and extract client data
    const submissions = await FormSubmission.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('email status createdAt submittedAt formData.applicantDetails formData.basicInformation formData.addressForService')
      .lean();

    // Transform submissions into client data
    const clients = submissions.map(submission => {
      const applicant = submission.formData?.applicantDetails?.applicants?.[0];
      const address = submission.formData?.addressForService;
      const inventionTitle = submission.formData?.basicInformation?.titleOfInvention;
      
      return {
        id: submission._id.toString(),
        name: applicant?.name || 'Unknown',
        email: submission.email,
        phone: applicant?.address?.contactNumber || '',
        company: applicant?.category?.type || 'Individual',
        address: address ? `${address.address || ''} ${address.city || ''} ${address.state || ''} ${address.country || ''}`.trim() : '',
        status: submission.status === 'completed' ? 'active' : 
                submission.status === 'draft' ? 'prospect' : 'inactive',
        submissions: 1, // Each submission represents one client submission
        lastContact: submission.submittedAt || submission.createdAt,
        notes: inventionTitle || 'No invention title provided'
      };
    });

    // Get total count
    const total = await FormSubmission.countDocuments(filter);

    // Get status counts for clients
    const statusCounts = await FormSubmission.aggregate([
      { $group: { 
          _id: { 
            $cond: [
              { $eq: ['$status', 'completed'] }, 
              'active',
              { $cond: [
                { $eq: ['$status', 'draft'] },
                'prospect',
                'inactive'
              ]}
            ]
          }, 
          count: { $sum: 1 } 
        } 
      }
    ]);

    const statusSummary = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        clients,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        statusSummary,
        filters: {
          status,
          search
        }
      }
    });

  } catch (error) {
    console.error('Error getting clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve clients',
      error: error.message
    });
  }
});

// Export submission as JSON (uses authentication middleware)
router.get('/submission/:id/export', async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await FormSubmission.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    const exportData = {
      submissionId: submission._id,
      email: submission.email,
      status: submission.status,
      submittedAt: submission.submittedAt,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
      formData: submission.formData,
      adminEdits: submission.adminEdits
    };

    // Set headers for file download
    const filename = `submission_${submission.email.replace('@', '_at_')}_${Date.now()}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.status(200).send(JSON.stringify(exportData, null, 2));

  } catch (error) {
    console.error('Error exporting submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export submission',
      error: error.message
    });
  }
});

module.exports = router;
