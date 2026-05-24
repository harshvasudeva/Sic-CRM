const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const orchestrator = require('../services/platforms/orchestrator')
const analyticsService = require('../services/influencerAnalytics')

class SyncQueue {
  constructor() {
    this.queue = []
    this.running = 0
    this.MAX_CONCURRENT = 3
    this.platformCalls = { youtube: 0, instagram: 0, tiktok: 0, twitter: 0 }
    this.PLATFORM_LIMITS = { youtube: 9000, instagram: 180, tiktok: 100, twitter: 50 }
    this.resetTimer = null
  }

  enqueue(job) {
    this.queue.push(job)
    this.process()
  }

  async process() {
    while (this.queue.length > 0 && this.running < this.MAX_CONCURRENT) {
      const job = this.queue.shift()
      this.running++
      job().finally(() => {
        this.running--
        this.process()
      })
    }
  }

  canCall(platform) {
    return (this.platformCalls[platform] || 0) < (this.PLATFORM_LIMITS[platform] || 100)
  }

  recordCall(platform) {
    this.platformCalls[platform] = (this.platformCalls[platform] || 0) + 1
    if (!this.resetTimer) {
      this.resetTimer = setTimeout(() => {
        this.platformCalls = { youtube: 0, instagram: 0, tiktok: 0, twitter: 0 }
        this.resetTimer = null
      }, 3600000)
    }
  }
}

const syncQueue = new SyncQueue()

async function dailyProfileSync() {
  console.log('[Scheduler] Starting daily profile sync...')
  const creators = await prisma.creator.findMany({
    where: { isActive: true, tracked: true },
    select: {
      id: true,
      name: true,
      socialAccounts: {
        select: { id: true, platform: true, handle: true, accessToken: true },
      },
    },
  })

  let synced = 0
  let errors = 0

  for (const creator of creators) {
    for (const sa of creator.socialAccounts) {
      if (!syncQueue.canCall(sa.platform)) {
        console.log(`[Scheduler] Rate limit reached for ${sa.platform}, skipping ${creator.name}`)
        continue
      }

      syncQueue.enqueue(async () => {
        try {
          syncQueue.recordCall(sa.platform)
          await orchestrator.syncProfile(sa.id)
          synced++
        } catch (err) {
          errors++
          console.error(`[Scheduler] Error syncing ${sa.platform}:${sa.handle}:`, err.message)
        }
      })
    }
  }

  const trackedIds = creators.map(c => c.id)
  for (const id of trackedIds) {
    syncQueue.enqueue(async () => {
      try {
        await analyticsService.computeRateCard(id)
        await orchestrator._updateCreatorScore(id)
      } catch (err) {
        console.error(`[Scheduler] Error computing rate card for ${id}:`, err.message)
      }
    })
  }

  console.log(`[Scheduler] Queued sync for ${creators.length} creators (${synced} synced, ${errors} errors)`)
  return { creators: creators.length, synced, errors }
}

async function weeklyContentSync() {
  console.log('[Scheduler] Starting weekly content sync...')
  const accounts = await prisma.socialAccount.findMany({
    where: { creator: { isActive: true, tracked: true } },
    select: { id: true, platform: true, handle: true },
  })

  let synced = 0
  let errors = 0

  for (const sa of accounts) {
    if (!syncQueue.canCall(sa.platform)) continue

    syncQueue.enqueue(async () => {
      try {
        syncQueue.recordCall(sa.platform)
        await orchestrator.syncContent(sa.id)
        synced++
      } catch (err) {
        errors++
        console.error(`[Scheduler] Error syncing content for ${sa.platform}:${sa.handle}:`, err.message)
      }
    })
  }

  console.log(`[Scheduler] Queued content sync for ${accounts.length} accounts`)
  return { accounts: accounts.length, synced, errors }
}

async function cleanupOldSnapshots() {
  const oneYearAgo = new Date(Date.now() - 365 * 86400000)
  try {
    const result = await prisma.creatorAnalyticsSnapshot.deleteMany({
      where: { date: { lt: oneYearAgo } },
    })
    console.log(`[Scheduler] Cleaned up ${result.count} snapshots older than 1 year`)
    return result.count
  } catch (err) {
    console.error('[Scheduler] Snapshot cleanup error:', err.message)
    return 0
  }
}

module.exports = {
  syncQueue,
  dailyProfileSync,
  weeklyContentSync,
  cleanupOldSnapshots,
}
