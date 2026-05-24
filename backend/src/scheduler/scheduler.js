const cron = require('node-cron')
const { dailyProfileSync, weeklyContentSync, cleanupOldSnapshots } = require('./syncQueue')

function startScheduler() {
  console.log('[Scheduler] Starting sync scheduler...')

  cron.schedule('0 2 * * *', async () => {
    console.log('[Scheduler] Running daily profile sync (2:00 AM)')
    try {
      await dailyProfileSync()
    } catch (err) {
      console.error('[Scheduler] Daily sync failed:', err.message)
    }
  })

  cron.schedule('0 3 * * 0', async () => {
    console.log('[Scheduler] Running weekly content sync (Sunday 3:00 AM)')
    try {
      await weeklyContentSync()
    } catch (err) {
      console.error('[Scheduler] Weekly sync failed:', err.message)
    }
  })

  cron.schedule('0 4 1 * *', async () => {
    console.log('[Scheduler] Running monthly snapshot cleanup (1st of month, 4:00 AM)')
    try {
      await cleanupOldSnapshots()
    } catch (err) {
      console.error('[Scheduler] Snapshot cleanup failed:', err.message)
    }
  })

  console.log('[Scheduler] Schedules registered:')
  console.log('  - Daily profile sync: 2:00 AM')
  console.log('  - Weekly content sync: Sunday 3:00 AM')
  console.log('  - Monthly snapshot cleanup: 1st of month 4:00 AM')
}

module.exports = { startScheduler }
