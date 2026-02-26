import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Youtube, Users, Eye, Clock, DollarSign, TrendingUp, Search,
  Play, BarChart3, MousePointerClick, ArrowUpDown, RefreshCw, Plus, Loader2
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getCreators, lookupPlatformProfile, importFromPlatform, syncCreator, getCreatorAnalytics } from '../../stores/influencerStore'

const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }
const accent = '#6366f1'
const muted = '#94a3b8'
const ytRed = '#ff0000'

const fmt = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return String(n)
}

const customTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ ...card, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ color: muted, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? fmt(p.value) : p.value}</div>
      ))}
    </div>
  )
}

export default function YouTubeCreators() {
  const [creators, setCreators] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [sortBy, setSortBy] = useState('followers')
  const [syncingIds, setSyncingIds] = useState(new Set())
  const [analyticsCache, setAnalyticsCache] = useState({})

  // Lookup state
  const [lookupHandle, setLookupHandle] = useState('')
  const [lookupResult, setLookupResult] = useState(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState('')
  const [importStatus, setImportStatus] = useState({})

  const loadCreators = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCreators({ platform: 'YouTube' })
      setCreators(data)
    } catch (err) {
      console.error('Failed to load YouTube creators:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadCreators() }, [loadCreators])

  const filtered = creators
    .filter(c =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.handle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.niche?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0))

  // Look up a YouTube channel via API
  const handleLookup = async () => {
    if (!lookupHandle.trim()) return
    setLookupLoading(true)
    setLookupError('')
    setLookupResult(null)
    try {
      const handle = lookupHandle.replace(/^@/, '')
      const result = await lookupPlatformProfile('youtube', handle)
      setLookupResult(result)
    } catch (err) {
      setLookupError(err.message || 'Channel not found or API not configured')
    } finally {
      setLookupLoading(false)
    }
  }

  // Import from lookup
  const handleImportFromLookup = async () => {
    if (!lookupResult) return
    setImportStatus(prev => ({ ...prev, lookup: 'importing' }))
    try {
      await importFromPlatform({
        platform: 'youtube',
        handle: lookupResult.handle || lookupHandle,
        name: lookupResult.name || lookupResult.channelTitle,
        ...lookupResult
      })
      setImportStatus(prev => ({ ...prev, lookup: 'imported' }))
      setLookupResult(null)
      setLookupHandle('')
      loadCreators()
    } catch (err) {
      setImportStatus(prev => ({ ...prev, lookup: 'error' }))
    }
  }

  // Sync a creator's data from YouTube API
  const handleSync = async (id) => {
    setSyncingIds(prev => new Set(prev).add(id))
    try {
      await syncCreator(id)
      loadCreators()
    } catch (err) {
      console.error('Sync failed:', err)
    } finally {
      setSyncingIds(prev => { const n = new Set(prev); n.delete(id); return n })
    }
  }

  // Load analytics when expanding a creator
  const handleExpand = async (id) => {
    if (expandedId === id) { setExpandedId(null); return }
    setExpandedId(id)
    if (!analyticsCache[id]) {
      try {
        const data = await getCreatorAnalytics(id)
        setAnalyticsCache(prev => ({ ...prev, [id]: data }))
      } catch (err) {
        console.error('Failed to load analytics:', err)
      }
    }
  }

  return (
    <div style={{ padding: 24, color: '#fff', maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Youtube size={28} color={ytRed} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>YouTube Creators</h1>
        </div>
        <p style={{ color: muted, fontSize: 14, marginBottom: 24 }}>
          Browse YouTube channels — data fetched from YouTube Data API v3
        </p>
      </motion.div>

      {/* Channel Lookup */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
        style={{ ...card, padding: 16, marginBottom: 20 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Search size={14} color={ytRed} /> Look Up YouTube Channel
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={lookupHandle}
            onChange={e => setLookupHandle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLookup()}
            placeholder="Enter YouTube handle (e.g. @MrBeast) or channel ID"
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
              color: '#fff', fontSize: 13, outline: 'none'
            }}
          />
          <button
            onClick={handleLookup}
            disabled={lookupLoading}
            style={{
              padding: '8px 16px', borderRadius: 6, border: 'none',
              background: ytRed, color: '#fff', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4
            }}
          >
            {lookupLoading ? <><Loader2 size={12} className="spin" /> Looking up...</> : <><Search size={12} /> Lookup</>}
          </button>
        </div>
        {lookupError && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 6 }}>{lookupError}</div>}
        {lookupResult && (
          <div style={{ marginTop: 12, padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {lookupResult.profilePicUrl && (
                <img src={lookupResult.profilePicUrl} alt="" style={{ width: 40, height: 40, borderRadius: 8 }} />
              )}
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{lookupResult.name || lookupResult.channelTitle}</div>
                <div style={{ color: muted, fontSize: 12 }}>
                  {fmt(lookupResult.followers || lookupResult.subscriberCount || 0)} subscribers | {fmt(lookupResult.videoCount || 0)} videos
                </div>
              </div>
            </div>
            <button
              onClick={handleImportFromLookup}
              disabled={importStatus.lookup === 'imported'}
              style={{
                padding: '6px 14px', borderRadius: 6, border: 'none',
                background: importStatus.lookup === 'imported' ? '#10b981' : accent,
                color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600
              }}
            >
              {importStatus.lookup === 'importing' ? 'Importing...' : importStatus.lookup === 'imported' ? 'Imported!' : <><Plus size={12} /> Import to CRM</>}
            </button>
          </div>
        )}
      </motion.div>

      {/* Search & Sort */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} color={muted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, handle, or niche..."
            style={{
              width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
              color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
          padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 13, outline: 'none', cursor: 'pointer'
        }}>
          <option value="followers">Subscribers</option>
          <option value="avgViews">Avg Views</option>
          <option value="engagementRate">Engagement Rate</option>
        </select>
        <button
          onClick={loadCreators}
          style={{
            padding: '10px 14px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
            color: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </motion.div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Channels', value: creators.length, icon: Youtube, color: ytRed },
          { label: 'Avg Subs', value: creators.length ? fmt(Math.round(creators.reduce((s, c) => s + (c.followers || 0), 0) / creators.length)) : '0', icon: Users, color: '#8b5cf6' },
          { label: 'Avg Views', value: creators.length ? fmt(Math.round(creators.reduce((s, c) => s + (c.avgViews || 0), 0) / creators.length)) : '0', icon: Eye, color: '#06b6d4' },
          { label: 'Avg Engagement', value: creators.length ? `${(creators.reduce((s, c) => s + (c.engagementRate || 0), 0) / creators.length).toFixed(1)}%` : '0%', icon: TrendingUp, color: '#10b981' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
            style={{ ...card, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `${stat.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={16} color={stat.color} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: muted, textTransform: 'uppercase' }}>{stat.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 40, color: muted }}>
          <Loader2 size={24} className="spin" style={{ marginBottom: 8 }} />
          <div>Loading YouTube creators...</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div style={{ ...card, padding: 40, textAlign: 'center' }}>
          <Youtube size={40} color={muted} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No YouTube Creators</div>
          <div style={{ color: muted, fontSize: 13 }}>
            Use the lookup above to search for YouTube channels and import them into your CRM.
          </div>
        </div>
      )}

      {/* Creator Cards */}
      {filtered.map((creator, ci) => (
        <motion.div
          key={creator.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + ci * 0.08 }}
          style={{ ...card, padding: 20, marginBottom: 16 }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 12,
                background: creator.profilePicUrl
                  ? `url(${creator.profilePicUrl}) center/cover`
                  : `linear-gradient(135deg, ${ytRed}, #ff6666)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 20, overflow: 'hidden'
              }}>
                {!creator.profilePicUrl && creator.name?.charAt(0)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{creator.name}</span>
                  {creator.verificationStatus === 'verified' && (
                    <span style={{ background: '#ef444422', color: ytRed, fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>Verified</span>
                  )}
                  {creator.lastSyncedAt && (
                    <span style={{ fontSize: 10, color: muted }}>
                      Synced {new Date(creator.lastSyncedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div style={{ color: muted, fontSize: 13 }}>{creator.handle} | {creator.niche || 'N/A'} | {creator.city || 'N/A'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
              {[
                { label: 'Subscribers', value: fmt(creator.followers || 0) },
                { label: 'Avg Views', value: fmt(creator.avgViews || 0) },
                { label: 'Engagement', value: `${(creator.engagementRate || 0).toFixed(1)}%` },
              ].map((m, mi) => (
                <div key={mi} style={{ textAlign: 'center', minWidth: 65 }}>
                  <div style={{ color: muted, fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{
            marginTop: 14, display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center'
          }}>
            <button
              onClick={() => handleSync(creator.id)}
              disabled={syncingIds.has(creator.id)}
              style={{
                padding: '6px 14px', borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
                color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4
              }}
            >
              {syncingIds.has(creator.id) ? <><Loader2 size={12} className="spin" /> Syncing...</> : <><RefreshCw size={12} /> Sync Data</>}
            </button>
            <button
              onClick={() => handleExpand(creator.id)}
              style={{
                padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 12,
                display: 'flex', alignItems: 'center', gap: 4
              }}
            >
              <BarChart3 size={12} /> {expandedId === creator.id ? 'Collapse' : 'Analytics & Details'}
            </button>
          </div>

          {/* Expanded Section */}
          {expandedId === creator.id && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 16 }}>
              {/* Creator Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 10, color: muted, marginBottom: 4 }}>Status</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{creator.status}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 10, color: muted, marginBottom: 4 }}>Tier</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{creator.creatorTier || 'N/A'}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 10, color: muted, marginBottom: 4 }}>Creator Score</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{creator.creatorScore || 'N/A'}</div>
                </div>
              </div>

              {creator.bio && (
                <div style={{ marginBottom: 16, padding: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: muted, marginBottom: 4 }}>Channel Description</div>
                  <div style={{ fontSize: 12, lineHeight: 1.5 }}>{creator.bio}</div>
                </div>
              )}

              {/* Analytics Snapshots */}
              {analyticsCache[creator.id]?.length > 0 && (
                <>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Follower Growth</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={analyticsCache[creator.id].map(s => ({
                      date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      followers: s.followers
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="date" tick={{ fill: muted, fontSize: 11 }} />
                      <YAxis tick={{ fill: muted, fontSize: 11 }} tickFormatter={fmt} />
                      <Tooltip content={customTooltip} />
                      <Line type="monotone" dataKey="followers" stroke={ytRed} strokeWidth={2} dot={{ r: 3, fill: ytRed }} name="Subscribers" />
                    </LineChart>
                  </ResponsiveContainer>
                </>
              )}

              {/* Connected Accounts */}
              {creator.socialAccounts?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, color: muted, marginBottom: 6 }}>Connected Accounts</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {creator.socialAccounts.map((sa, si) => (
                      <span key={si} style={{
                        background: 'rgba(99,102,241,0.15)', padding: '3px 8px', borderRadius: 4,
                        fontSize: 11, color: '#a5b4fc'
                      }}>
                        {sa.platform}: @{sa.handle}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
