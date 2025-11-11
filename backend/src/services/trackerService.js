const { v4: uuidv4 } = require('uuid');
const { parseISO, startOfDay, endOfDay, subDays } = require('date-fns');
const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const WorkEntry = require('../models/WorkEntry');
const TrackerSettings = require('../models/TrackerSettings');
const {
  sendTrackerReminderEmail,
  generateTrackerLink,
  generateFormToken
} = require('./emailService');

const normalizeDate = (value) => {
  if (!value) {
    return new Date();
  }
  if (value instanceof Date) {
    return value;
  }
  return startOfDay(parseISO(value));
};

const ensureTrackerToken = async (employee, expiresInHours = 48) => {
  const now = new Date();
  if (employee.trackerToken && employee.trackerToken.expiresAt > now) {
    return employee.trackerToken;
  }

  const token = generateFormToken(employee.email || uuidv4());
  const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);

  employee.trackerToken = { token, expiresAt, createdAt: now };
  await employee.save();

  return employee.trackerToken;
};

const listEmployees = async ({ status = 'active', search } = {}) => {
  const filter = {};
  if (status && status !== 'all') {
    filter.status = status;
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { 'metadata.employeeCode': { $regex: search, $options: 'i' } }
    ];
  }

  return Employee.find(filter).sort({ createdAt: -1 }).lean();
};

const createEmployee = async ({ name, email, designation, department, employeeCode }) => {
  const existing = await Employee.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw new Error('Employee with this email already exists');
  }

  const employee = await Employee.create({
    name,
    email,
    designation,
    metadata: {
      department,
      employeeCode
    }
  });

  return employee;
};

const updateEmployee = async (employeeId, updates) => {
  const allowList = ['name', 'email', 'designation', 'status', 'metadata'];
  const payload = {};

  Object.keys(updates).forEach((key) => {
    if (allowList.includes(key)) {
      payload[key] = updates[key];
    }
  });

  const employee = await Employee.findByIdAndUpdate(
    employeeId,
    { $set: payload },
    { new: true }
  );

  if (!employee) {
    throw new Error('Employee not found');
  }

  return employee;
};

const deleteEmployee = async (employeeId) => {
  const employee = await Employee.findByIdAndDelete(employeeId);
  if (!employee) {
    throw new Error('Employee not found');
  }
  return employee;
};

const sendManualReminders = async ({ triggeredByAdminId }) => {
  const employees = await Employee.find({ status: 'active' });
  if (!employees.length) {
    return {
      total: 0,
      success: 0,
      failed: 0,
      errors: []
    };
  }

  const results = {
    total: employees.length,
    successful: 0,
    failed: 0,
    errors: []
  };

  for (const employee of employees) {
    try {
      const tokenData = await ensureTrackerToken(employee);
      const formLink = generateTrackerLink(tokenData.token);

      await sendTrackerReminderEmail(
        employee.email,
        employee.name,
        formLink
      );

      employee.lastInvitationSentAt = new Date();
      await employee.save();
      results.successful += 1;
    } catch (error) {
      results.failed += 1;
      results.errors.push({
        employeeId: employee._id,
        email: employee.email,
        error: error.message
      });
    }
  }

  return results;
};

const upsertWorkEntry = async ({ employeeId, date, arrivalTime, weekday, entries, metadata }) => {
  const normalizedDate = normalizeDate(date);
  const submissionTimestamp = new Date();
  const totalHours = entries.reduce((acc, entry) => acc + Number(entry.hours || 0), 0);
  const computedWeekday =
    weekday ||
    normalizedDate.toLocaleDateString('en-IN', {
      weekday: 'long'
    });

  const updatePayload = {
    arrivalTime,
    weekday: computedWeekday,
    entries,
    totalHours,
    submittedAt: submissionTimestamp,
    updatedAt: submissionTimestamp
  };

  if (metadata) {
    updatePayload.metadata = metadata;
  }

  const workEntry = await WorkEntry.findOneAndUpdate(
    { employee: employeeId, date: normalizedDate },
    {
      $set: {
        ...updatePayload
      },
      $setOnInsert: {
        employee: employeeId,
        date: normalizedDate
      }
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );

  await Employee.findByIdAndUpdate(employeeId, { lastSubmissionAt: submissionTimestamp });
  return workEntry;
};

const getWorkEntries = async ({ startDate, endDate, employeeId }) => {
  const filter = {};

  if (startDate) {
    filter.date = { ...(filter.date || {}), $gte: startOfDay(parseISO(startDate)) };
  }

  if (endDate) {
    filter.date = { ...(filter.date || {}), $lte: endOfDay(parseISO(endDate)) };
  }

  if (employeeId) {
    filter.employee = employeeId;
  }

  return WorkEntry.find(filter)
    .populate('employee', 'name email metadata status')
    .sort({ date: -1 })
    .lean();
};

const aggregateMetrics = async ({ period = 'week', employeeId } = {}) => {
  const today = startOfDay(new Date());
  let startRange;

  switch (period) {
    case 'day':
      startRange = today;
      break;
    case 'month':
      startRange = subDays(today, 30);
      break;
    case 'week':
    default:
      startRange = subDays(today, 7);
      break;
  }

  const matchStage = { date: { $gte: startRange, $lte: endOfDay(today) } };

  if (employeeId && mongoose.Types.ObjectId.isValid(employeeId)) {
    matchStage.employee = new mongoose.Types.ObjectId(employeeId);
  }

  const [summary] = await WorkEntry.aggregate([
    { $match: matchStage },
    {
      $facet: {
        totalHoursByEmployee: [
          {
            $group: {
              _id: '$employee',
              totalHours: { $sum: '$totalHours' },
              daysLogged: { $sum: 1 }
            }
          },
          {
            $lookup: {
              from: 'employees',
              localField: '_id',
              foreignField: '_id',
              as: 'employee'
            }
          },
          { $unwind: '$employee' },
          {
            $project: {
              _id: 0,
              employeeId: '$employee._id',
              name: '$employee.name',
              email: '$employee.email',
              totalHours: 1,
              daysLogged: 1
            }
          },
          { $sort: { totalHours: -1 } }
        ],
        effortTypeBreakdown: [
          { $unwind: '$entries' },
          {
            $group: {
              _id: '$entries.effortType',
              totalHours: { $sum: '$entries.hours' }
            }
          },
          {
            $project: {
              _id: 0,
              effortType: '$_id',
              totalHours: 1
            }
          }
        ],
        dailyTotals: [
          {
            $group: {
              _id: '$date',
              totalHours: { $sum: '$totalHours' }
            }
          },
          {
            $project: {
              _id: 0,
              date: '$_id',
              totalHours: 1
            }
          },
          { $sort: { date: 1 } }
        ]
      }
    }
  ]);

  return summary || {
    totalHoursByEmployee: [],
    effortTypeBreakdown: [],
    dailyTotals: []
  };
};

const getTrackerSettings = async () => TrackerSettings.getActiveSettings();

const updateTrackerSettings = async (payload = {}, updatedBy) => {
  const settings = await TrackerSettings.getActiveSettings();

  Object.keys(payload).forEach((key) => {
    if (payload[key] !== undefined) {
      settings[key] = payload[key];
    }
  });

  if (updatedBy) {
    settings.updatedBy = updatedBy;
  }

  await settings.save();
  return settings;
};

module.exports = {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  ensureTrackerToken,
  sendManualReminders,
  upsertWorkEntry,
  getWorkEntries,
  aggregateMetrics,
  getTrackerSettings,
  updateTrackerSettings
};

