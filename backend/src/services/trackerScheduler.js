const cron = require('node-cron');
const TrackerSettings = require('../models/TrackerSettings');
const { sendManualReminders } = require('./trackerService');

const dayMap = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6
};

let trackerJob = null;

const buildCronExpression = (time, daysActive) => {
  const [hour = '18', minute = '0'] = (time || '18:00').split(':');
  const dayNumbers = (daysActive || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
    .map((day) => dayMap[day])
    .filter((value) => value !== undefined)
    .sort((a, b) => a - b);

  const daySegment = dayNumbers.length ? dayNumbers.join(',') : '1-5';
  return `${parseInt(minute, 10)} ${parseInt(hour, 10)} * * ${daySegment}`;
};

const stopExistingJob = () => {
  if (trackerJob) {
    trackerJob.stop();
    trackerJob = null;
  }
};

const scheduleTrackerJob = (settings) => {
  stopExistingJob();

  if (!settings || settings.cronStatus !== 'active') {
    console.log('🕒 Tracker scheduler is paused');
    return;
  }

  const cronExpression = buildCronExpression(settings.cronTime, settings.daysActive);
  const timezone = settings.timezone || 'Asia/Kolkata';

  console.log(`🕒 Scheduling tracker job: ${cronExpression} (${timezone})`);

  trackerJob = cron.schedule(cronExpression, async () => {
    console.log('📨 Tracker cron job running...');
    try {
      const results = await sendManualReminders({ triggeredByAdminId: null });
      console.log('✅ Tracker cron job completed', results);

      if (global.emitToAdmin) {
        global.emitToAdmin('tracker-cron-run', {
          source: 'cron',
          results
        });
      }
    } catch (error) {
      console.error('❌ Tracker cron job failed:', error);
    }
  }, {
    timezone
  });
};

const initTrackerScheduler = async () => {
  try {
    const settings = await TrackerSettings.getActiveSettings();
    scheduleTrackerJob(settings);
  } catch (error) {
    console.error('❌ Failed to initialize tracker scheduler:', error);
  }
};

const refreshTrackerScheduler = async () => {
  await initTrackerScheduler();
};

module.exports = {
  initTrackerScheduler,
  refreshTrackerScheduler
};

