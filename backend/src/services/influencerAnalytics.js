const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

class InfluencerAnalyticsService {
  async computeGrowthMetrics(creatorId, days = 90) {
    const since = new Date(Date.now() - days * 86400000)

    const snapshots = await prisma.creatorAnalyticsSnapshot.findMany({
      where: { creatorId, date: { gte: since } },
      orderBy: { date: 'asc' },
    })

    if (snapshots.length < 2) {
      return {
        timeSeries: snapshots.map(s => ({
          date: s.date,
          platform: s.platform,
          followers: s.followers,
          avgViews: s.avgViews,
          engagementRate: s.engagementRate,
        })),
        summary: {
          dataPoints: snapshots.length,
          currentFollowers: snapshots[snapshots.length - 1]?.followers || 0,
          growth: 0,
          growthRate: 0,
          growthVelocity: 0,
          growthDirection: 'insufficient_data',
          projectedFollowers30d: snapshots[snapshots.length - 1]?.followers || 0,
        },
      }
    }

    const latest = snapshots[snapshots.length - 1]
    const earliest = snapshots[0]
    const totalGrowth = latest.followers - earliest.followers
    const totalGrowthRate = earliest.followers > 0 ? (totalGrowth / earliest.followers) * 100 : 0

    const dayDiff = (latest.date - earliest.date) / 86400000
    const growthVelocity = dayDiff > 0 ? totalGrowth / dayDiff : 0

    const recentSnapshots = snapshots.slice(-7)
    const olderSnapshots = snapshots.slice(-14, -7)
    let growthDirection = 'stable'
    if (recentSnapshots.length >= 2 && olderSnapshots.length >= 2) {
      const recentRate = (recentSnapshots[recentSnapshots.length - 1].followers - recentSnapshots[0].followers) / recentSnapshots.length
      const olderRate = (olderSnapshots[olderSnapshots.length - 1].followers - olderSnapshots[0].followers) / olderSnapshots.length
      if (recentRate > olderRate * 1.2) growthDirection = 'accelerating'
      else if (recentRate < olderRate * 0.8) growthDirection = 'decelerating'
      if (growthVelocity < -1) growthDirection = 'declining'
    }

    const projectedFollowers30d = Math.round(latest.followers + growthVelocity * 30)

    return {
      timeSeries: snapshots.map(s => ({
        date: s.date,
        platform: s.platform,
        followers: s.followers,
        avgViews: s.avgViews,
        engagementRate: s.engagementRate,
      })),
      summary: {
        dataPoints: snapshots.length,
        currentFollowers: latest.followers,
        earliestFollowers: earliest.followers,
        growth: totalGrowth,
        growthRate: Number(totalGrowthRate.toFixed(2)),
        growthVelocity: Number(growthVelocity.toFixed(1)),
        growthDirection,
        projectedFollowers30d: Math.max(0, projectedFollowers30d),
        bestGrowthDay: this._findBestGrowthDay(snapshots),
      },
    }
  }

  _findBestGrowthDay(snapshots) {
    let best = { date: null, gain: 0 }
    for (let i = 1; i < snapshots.length; i++) {
      const gain = snapshots[i].followers - snapshots[i - 1].followers
      if (gain > best.gain) {
        best = { date: snapshots[i].date, gain }
      }
    }
    return best
  }

  async computeEngagementQuality(creatorId) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)

    const posts = await prisma.contentPost.findMany({
      where: {
        socialAccount: { creatorId },
        publishedAt: { gte: thirtyDaysAgo },
      },
      select: {
        views: true,
        likes: true,
        comments: true,
        shares: true,
        saves: true,
        engagementRate: true,
        type: true,
      },
    })

    const accounts = await prisma.socialAccount.findMany({
      where: { creatorId },
      select: { platform: true, followers: true, engagementRate: true, avgViews: true },
    })

    if (posts.length === 0 && accounts.length === 0) {
      return {
        metrics: {
          trueEngagementRate: 0,
          engagementToViewRatio: 0,
          saveRate: 0,
          commentToLikeRatio: 0,
          viralityCoefficient: 0,
          totalFollowers: 0,
          avgViews: 0,
          postCount: 0,
        },
        flags: [],
      }
    }

    const totalFollowers = accounts.reduce((s, a) => s + (a.followers || 0), 0)
    const avgViews = accounts.reduce((s, a) => s + (a.avgViews || 0), 0) / (accounts.length || 1)

    const totalLikes = posts.reduce((s, p) => s + (p.likes || 0), 0)
    const totalComments = posts.reduce((s, p) => s + (p.comments || 0), 0)
    const totalShares = posts.reduce((s, p) => s + (p.shares || 0), 0)
    const totalSaves = posts.reduce((s, p) => s + (p.saves || 0), 0)
    const totalViews = posts.reduce((s, p) => s + (p.views || 0), 0)
    const totalEngagement = totalLikes + totalComments + totalShares

    const trueEngagementRate = totalFollowers > 0 ? (totalEngagement / totalFollowers) * 100 : 0
    const engagementToViewRatio = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0
    const saveRate = totalViews > 0 ? (totalSaves / totalViews) * 100 : 0
    const commentToLikeRatio = totalLikes > 0 ? (totalComments / totalLikes) * 100 : 0
    const viralityCoefficient = totalFollowers > 0 ? (totalShares / totalFollowers) * 100 : 0

    const flags = []
    if (trueEngagementRate > 10) flags.push({ type: 'warning', message: 'Engagement rate above 10% may indicate purchased engagement' })
    if (trueEngagementRate < 0.5 && totalFollowers > 1000) flags.push({ type: 'warning', message: 'Engagement rate below 0.5% is unusually low for this follower count' })
    if (commentToLikeRatio < 1 && totalLikes > 1000) flags.push({ type: 'info', message: 'Low comment-to-like ratio suggests passive audience' })
    if (saveRate > 5) flags.push({ type: 'positive', message: 'High save rate indicates content provides lasting value' })

    const postTypeBreakdown = {}
    for (const p of posts) {
      const t = p.type || 'unknown'
      if (!postTypeBreakdown[t]) postTypeBreakdown[t] = { count: 0, totalViews: 0, totalEngagement: 0 }
      postTypeBreakdown[t].count++
      postTypeBreakdown[t].totalViews += p.views || 0
      postTypeBreakdown[t].totalEngagement += (p.likes || 0) + (p.comments || 0) + (p.shares || 0)
    }

    return {
      metrics: {
        trueEngagementRate: Number(trueEngagementRate.toFixed(2)),
        engagementToViewRatio: Number(engagementToViewRatio.toFixed(2)),
        saveRate: Number(saveRate.toFixed(2)),
        commentToLikeRatio: Number(commentToLikeRatio.toFixed(2)),
        viralityCoefficient: Number(viralityCoefficient.toFixed(2)),
        totalFollowers,
        avgViews: Math.round(avgViews),
        postCount: posts.length,
        perPlatform: accounts.map(a => ({
          platform: a.platform,
          followers: a.followers,
          engagementRate: a.engagementRate,
          avgViews: a.avgViews,
        })),
        postTypeBreakdown,
      },
      flags,
    }
  }

  async computeRateCard(creatorId) {
    const creator = await prisma.creator.findUnique({
      where: { id: creatorId },
      include: {
        socialAccounts: {
          select: { platform: true, followers: true, avgViews: true, engagementRate: true },
        },
      },
    })

    if (!creator) throw new Error('Creator not found')

    const rates = {}
    let totalFollowers = 0
    let totalAvgViews = 0
    let totalEngagementRate = 0

    for (const sa of creator.socialAccounts) {
      totalFollowers += sa.followers || 0
      totalAvgViews += sa.avgViews || 0
      totalEngagementRate += sa.engagementRate || 0

      const cpv = this._computeCPV(sa.platform, sa.avgViews, sa.engagementRate, sa.followers)
      const cpm = this._computeCPM(sa.platform, sa.followers, sa.engagementRate)
      rates[sa.platform] = {
        suggestedCPV: cpv,
        suggestedCPM: cpm,
        suggestedFlatRate: this._computeFlatRate(sa.platform, sa.avgViews, cpv),
      }
    }

    const n = creator.socialAccounts.length || 1
    const avgViews = totalAvgViews / n
    const avgEngagement = totalEngagementRate / n

    const overallCPV = this._computeCPV('overall', avgViews, avgEngagement, totalFollowers)
    const overallCPM = this._computeCPM('overall', totalFollowers, avgEngagement)

    const rateCard = {
      overall: {
        suggestedCPV: overallCPV,
        suggestedCPM: overallCPM,
        suggestedFlatRate: this._computeFlatRate('overall', avgViews, overallCPV),
        totalFollowers,
        avgViews: Math.round(avgViews),
        avgEngagementRate: Number(avgEngagement.toFixed(2)),
      },
      perPlatform: rates,
      currency: 'INR',
      lastComputed: new Date().toISOString(),
      methodology: 'CPV based on avg views * platform multiplier; CPM based on followers * engagement bonus; flat rate = CPV * avgViews * deliverables',
    }

    await prisma.creator.update({
      where: { id: creatorId },
      data: { rateCard },
    })

    return rateCard
  }

  _computeCPV(platform, avgViews, engagementRate, followers) {
    const baseCPV = { instagram: 0.15, youtube: 0.20, tiktok: 0.05, twitter: 0.08, overall: 0.12 }
    let cpv = baseCPV[platform] || baseCPV.overall

    if (engagementRate > 5) cpv *= 1.5
    else if (engagementRate > 3) cpv *= 1.2
    else if (engagementRate < 1) cpv *= 0.8

    if (avgViews > 1000000) cpv *= 0.7
    else if (avgViews > 500000) cpv *= 0.8
    else if (avgViews > 100000) cpv *= 0.9

    cpv *= 83

    return Number(Math.max(50, cpv).toFixed(0))
  }

  _computeCPM(platform, followers, engagementRate) {
    const baseCPM = { instagram: 800, youtube: 1200, tiktok: 400, twitter: 500, overall: 700 }
    let cpm = baseCPM[platform] || baseCPM.overall

    if (engagementRate > 5) cpm *= 1.4
    else if (engagementRate > 3) cpm *= 1.15
    else if (engagementRate < 1) cpm *= 0.75

    return Number(cpm.toFixed(0))
  }

  _computeFlatRate(platform, avgViews, cpv) {
    const deliverableMultiplier = { instagram: 1.3, youtube: 1.5, tiktok: 1.2, twitter: 1.1, overall: 1.3 }
    const mult = deliverableMultiplier[platform] || deliverableMultiplier.overall
    return Number((cpv * (avgViews || 1000) * mult).toFixed(0))
  }

  async compareCreators(creatorIds) {
    if (!creatorIds || creatorIds.length < 2) {
      throw new Error('Need at least 2 creator IDs for comparison')
    }

    const creators = await prisma.creator.findMany({
      where: { id: { in: creatorIds }, isActive: true },
      include: {
        socialAccounts: {
          select: { platform: true, followers: true, avgViews: true, engagementRate: true, isVerified: true },
        },
        analytics: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    })

    const comparison = creators.map(c => {
      const totalFollowers = c.socialAccounts.reduce((s, a) => s + (a.followers || 0), 0)
      const avgEngagement = c.socialAccounts.length > 0
        ? c.socialAccounts.reduce((s, a) => s + (a.engagementRate || 0), 0) / c.socialAccounts.length
        : 0
      const avgViews = c.socialAccounts.length > 0
        ? c.socialAccounts.reduce((s, a) => s + (a.avgViews || 0), 0) / c.socialAccounts.length
        : 0

      const recentSnapshots = c.analytics.filter(a => a.date >= new Date(Date.now() - 30 * 86400000))
      const growth30d = recentSnapshots.length >= 2
        ? recentSnapshots[recentSnapshots.length - 1].followers - recentSnapshots[0].followers
        : 0

      return {
        id: c.id,
        name: c.name,
        niche: c.niche,
        creatorScore: c.creatorScore,
        creatorTier: c.creatorTier,
        totalFollowers,
        avgEngagementRate: Number(avgEngagement.toFixed(2)),
        avgViews: Math.round(avgViews),
        growth30d,
        platforms: c.socialAccounts.map(sa => sa.platform),
        isVerified: c.socialAccounts.some(sa => sa.isVerified),
        rateCard: c.rateCard,
      }
    })

    const maxFollowers = Math.max(...comparison.map(c => c.totalFollowers), 1)
    const maxViews = Math.max(...comparison.map(c => c.avgViews), 1)
    const maxEngagement = Math.max(...comparison.map(c => c.avgEngagementRate), 0.01)
    const maxScore = Math.max(...comparison.map(c => c.creatorScore || 0), 1)
    const maxGrowth = Math.max(...comparison.map(c => Math.abs(c.growth30d)), 1)

    const normalized = comparison.map(c => ({
      ...c,
      normalized: {
        followers: Number(((c.totalFollowers / maxFollowers) * 100).toFixed(1)),
        views: Number(((c.avgViews / maxViews) * 100).toFixed(1)),
        engagement: Number(((c.avgEngagementRate / maxEngagement) * 100).toFixed(1)),
        score: Number((((c.creatorScore || 0) / maxScore) * 100).toFixed(1)),
        growth: Number(((Math.abs(c.growth30d) / maxGrowth) * 100).toFixed(1)),
      },
      rankings: {},
    }))

    const metrics = ['totalFollowers', 'avgViews', 'avgEngagementRate', 'creatorScore', 'growth30d']
    const metricLabels = { totalFollowers: 'followers', avgViews: 'views', avgEngagementRate: 'engagement', creatorScore: 'score', growth30d: 'growth' }

    for (const metric of metrics) {
      const sorted = [...normalized].sort((a, b) => (b[metric] || 0) - (a[metric] || 0))
      sorted.forEach((c, i) => {
        c.rankings[metricLabels[metric]] = i + 1
      })
    }

    return { creators: normalized, totalCompared: normalized.length }
  }

  async detectAnomalies(creatorId) {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000)

    const snapshots = await prisma.creatorAnalyticsSnapshot.findMany({
      where: { creatorId, date: { gte: ninetyDaysAgo } },
      orderBy: { date: 'asc' },
    })

    const anomalies = []

    if (snapshots.length < 7) {
      return {
        anomalies: [],
        status: 'insufficient_data',
        message: `Only ${snapshots.length} data points. Need at least 7 days of tracking.`,
      }
    }

    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1]
      const curr = snapshots[i]
      const followerDiff = curr.followers - prev.followers
      const growthPct = prev.followers > 0 ? (followerDiff / prev.followers) * 100 : 0

      if (growthPct > 5 && followerDiff > 1000) {
        anomalies.push({
          type: 'follower_spike',
          severity: growthPct > 20 ? 'high' : growthPct > 10 ? 'medium' : 'low',
          date: curr.date,
          platform: curr.platform,
          detail: `+${followerDiff.toLocaleString()} followers (${growthPct.toFixed(1)}%) in one day`,
          possibleCause: followerDiff > 10000 ? 'Possible purchased followers' : 'May be viral content or feature',
        })
      }

      if (growthPct < -3 && followerDiff < -1000) {
        anomalies.push({
          type: 'follower_drop',
          severity: growthPct < -10 ? 'high' : 'medium',
          date: curr.date,
          platform: curr.platform,
          detail: `${followerDiff.toLocaleString()} followers (${growthPct.toFixed(1)}%) lost in one day`,
          possibleCause: 'Possible bot cleanup by platform or content controversy',
        })
      }

      if (curr.engagementRate && prev.engagementRate) {
        const engChange = ((curr.engagementRate - prev.engagementRate) / prev.engagementRate) * 100
        if (engChange < -50 && prev.engagementRate > 1) {
          anomalies.push({
            type: 'engagement_drop',
            severity: 'high',
            date: curr.date,
            platform: curr.platform,
            detail: `Engagement rate dropped ${Math.abs(engChange).toFixed(0)}% (${prev.engagementRate.toFixed(2)}% → ${curr.engagementRate.toFixed(2)}%)`,
            possibleCause: 'Algorithm change, content shift, or audience quality issue',
          })
        }
        if (engChange > 100 && prev.engagementRate > 1) {
          anomalies.push({
            type: 'engagement_spike',
            severity: 'medium',
            date: curr.date,
            platform: curr.platform,
            detail: `Engagement rate jumped ${engChange.toFixed(0)}% (${prev.engagementRate.toFixed(2)}% → ${curr.engagementRate.toFixed(2)}%)`,
            possibleCause: 'Viral content or possible engagement manipulation',
          })
        }
      }
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
    const recentPosts = await prisma.contentPost.findMany({
      where: { socialAccount: { creatorId }, publishedAt: { gte: thirtyDaysAgo } },
    })

    if (recentPosts.length === 0) {
      const accounts = await prisma.socialAccount.findMany({ where: { creatorId } })
      if (accounts.length > 0) {
        anomalies.push({
          type: 'inactivity',
          severity: 'low',
          date: new Date(),
          platform: 'all',
          detail: 'No content posted in the last 30 days',
          possibleCause: 'Creator may be inactive or on break',
        })
      }
    }

    return {
      anomalies: anomalies.sort((a, b) => {
        const sev = { high: 3, medium: 2, low: 1 }
        return (sev[b.severity] || 0) - (sev[a.severity] || 0)
      }),
      status: anomalies.filter(a => a.severity === 'high').length > 0 ? 'alert' : anomalies.length > 0 ? 'warning' : 'healthy',
      totalAnomalies: anomalies.length,
      highSeverityCount: anomalies.filter(a => a.severity === 'high').length,
    }
  }

  async getPerformanceSummary(creatorId) {
    const [creator, growth, engagement, rateCard, anomalyReport] = await Promise.all([
      prisma.creator.findUnique({
        where: { id: creatorId },
        include: {
          socialAccounts: {
            select: {
              id: true,
              platform: true,
              handle: true,
              followers: true,
              avgViews: true,
              engagementRate: true,
              profilePicUrl: true,
              isVerified: true,
              lastSyncedAt: true,
            },
          },
        },
      }),
      this.computeGrowthMetrics(creatorId, 90),
      this.computeEngagementQuality(creatorId),
      this.computeRateCard(creatorId),
      this.detectAnomalies(creatorId),
    ])

    if (!creator) throw new Error('Creator not found')

    return {
      creator: {
        id: creator.id,
        name: creator.name,
        niche: creator.niche,
        city: creator.city,
        status: creator.status,
        creatorScore: creator.creatorScore,
        creatorTier: creator.creatorTier,
        tracked: creator.tracked,
        verificationStatus: creator.verificationStatus,
      },
      growth,
      engagement,
      rateCard,
      anomalyReport,
    }
  }
}

module.exports = new InfluencerAnalyticsService()
