const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/authMiddleware');
const Employee = require('../models/Employee');
const {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  sendManualReminders,
  upsertWorkEntry,
  getWorkEntries,
  aggregateMetrics,
  getTrackerSettings,
  updateTrackerSettings
} = require('../services/trackerService');
const { refreshTrackerScheduler } = require('../services/trackerScheduler');

const router = express.Router();

const validateEffortEntries = [
  body('arrivalTime').notEmpty().withMessage('Arrival time is required'),
  body('entries').isArray({ min: 1 }).withMessage('At least one effort entry is required'),
  body('entries.*.projectName').notEmpty().withMessage('Project name is required'),
  body('entries.*.effortType').notEmpty().withMessage('Effort type is required'),
  body('entries.*.hours')
    .isFloat({ min: 0, max: 24 })
    .withMessage('Hours must be between 0 and 24')
];

const mapValidationErrors = (errors) => errors.array().map((err) => ({
  field: err.param,
  message: err.msg
}));

router.get('/form/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const employee = await Employee.findOne({ 'trackerToken.token': token });

    if (!employee || !employee.isTokenValid(token)) {
      return res.status(410).json({
        success: false,
        message: 'The tracker link is invalid or has expired.'
      });
    }

    const now = new Date();

    res.status(200).json({
      success: true,
      data: {
        employeeId: employee._id,
        name: employee.name,
        email: employee.email,
        currentDate: now.toISOString(),
        weekday: now.toLocaleDateString('en-IN', { weekday: 'long' })
      }
    });
  } catch (error) {
    console.error('Error fetching tracker form data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tracker form data',
      error: error.message
    });
  }
});

router.post('/form/:token', validateEffortEntries, async (req, res) => {
  try {
    const { token } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: mapValidationErrors(errors)
      });
    }

    const employee = await Employee.findOne({ 'trackerToken.token': token });

    if (!employee || !employee.isTokenValid(token)) {
      return res.status(410).json({
        success: false,
        message: 'The tracker link is invalid or has expired.'
      });
    }

    const { arrivalTime, weekday, date, entries } = req.body;

    // Validate duplicate effort type for same project
    const effortMap = new Map();
    for (const entry of entries) {
      const key = `${entry.projectName}|${entry.docketNumber || ''}|${entry.effortType}`;
      if (effortMap.has(key)) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate effort type for the same project/docket number is not allowed.'
        });
      }
      effortMap.set(key, true);
    }

    const workEntry = await upsertWorkEntry({
      employeeId: employee._id,
      date,
      arrivalTime,
      weekday,
      entries,
      metadata: {
        submissionSource: 'tracker-form',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    });

    res.status(200).json({
      success: true,
      message: 'Work entry submitted successfully',
      data: {
        entryId: workEntry._id,
        totalHours: workEntry.totalHours
      }
    });
  } catch (error) {
    console.error('Error submitting tracker form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit work entry',
      error: error.message
    });
  }
});

router.use(authMiddleware);

router.get('/employees', async (req, res) => {
  try {
    const { status, search } = req.query;
    const employees = await listEmployees({ status, search });

    res.status(200).json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error('Error listing employees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
      error: error.message
    });
  }
});

router.post('/employees', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('name').optional().isString().trim().isLength({ max: 120 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: mapValidationErrors(errors)
      });
    }

    const { name, email, designation, department, employeeCode } = req.body;
    const employee = await createEmployee({ name, email, designation, department, employeeCode });

    res.status(201).json({
      success: true,
      data: employee,
      message: 'Employee added successfully'
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create employee'
    });
  }
});

router.patch('/employees/:id', async (req, res) => {
  try {
    const employee = await updateEmployee(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update employee'
    });
  }
});

router.delete('/employees/:id', async (req, res) => {
  try {
    const employee = await deleteEmployee(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Employee removed successfully',
      data: employee
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete employee'
    });
  }
});

router.post('/trigger', async (req, res) => {
  try {
    const results = await sendManualReminders({ triggeredByAdminId: req.adminId });
    res.status(200).json({
      success: true,
      message: 'Manual trigger executed successfully',
      data: results
    });
  } catch (error) {
    console.error('Error triggering reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger reminders',
      error: error.message
    });
  }
});

router.get('/entries', async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    const entries = await getWorkEntries({ startDate, endDate, employeeId });
    res.status(200).json({
      success: true,
      data: entries
    });
  } catch (error) {
    console.error('Error fetching work entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch work entries',
      error: error.message
    });
  }
});

router.get('/metrics/summary', async (req, res) => {
  try {
    const { period } = req.query;
    const summary = await aggregateMetrics({ period });
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching tracker metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tracker metrics',
      error: error.message
    });
  }
});

router.get('/settings', async (_req, res) => {
  try {
    const settings = await getTrackerSettings();
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching tracker settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tracker settings',
      error: error.message
    });
  }
});

router.patch('/settings', async (req, res) => {
  try {
    const settings = await updateTrackerSettings(req.body, req.adminId);
    await refreshTrackerScheduler();
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating tracker settings:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update tracker settings'
    });
  }
});

router.get('/entries/export', async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    const entries = await getWorkEntries({ startDate, endDate, employeeId });

    const header = [
      'Employee Name',
      'Employee Email',
      'Date',
      'Arrival Time',
      'Project Name',
      'Docket Number',
      'Effort Type',
      'Hours',
      'Total Hours'
    ];

    const rows = entries.flatMap((entry) => {
      const base = [
        entry.employee?.name || '',
        entry.employee?.email || '',
        new Date(entry.date).toLocaleDateString('en-IN'),
        entry.arrivalTime,
        '',
        '',
        '',
        '',
        entry.totalHours
      ];

      if (!entry.entries || entry.entries.length === 0) {
        return [base];
      }

      return entry.entries.map((effort) => [
        entry.employee?.name || '',
        entry.employee?.email || '',
        new Date(entry.date).toLocaleDateString('en-IN'),
        entry.arrivalTime,
        effort.projectName,
        effort.docketNumber || '',
        effort.effortType,
        effort.hours,
        entry.totalHours
      ]);
    });

    const csvContent = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const filename = `tracker_export_${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting tracker data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export tracker data',
      error: error.message
    });
  }
});

module.exports = router;

