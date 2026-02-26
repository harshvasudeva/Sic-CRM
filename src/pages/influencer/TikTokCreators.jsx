import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Music2, Users, Eye, Heart, Repeat2, Search, Filter, ArrowUpDown,
  ExternalLink, TrendingUp, Play, BarChart3, RefreshCw, Plus, Loader2
} from 'lucide-react'
import { getCreators, lookupPlatformProfile, importFromPlatform, syncCreator } from '../../stores/influencerStore'

const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }
const accent = '#6366f1'
const muted = '#94a3b8'
const tiktokPink = '#ff0050'

const fmt = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return String(n)
}

export default function TikTokCreators() {
  const [creators, setCreators] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCreator, setSelectedCreator] = useState(null)
  const [sortBy, setSortBy] = useState('followers')
  const [importStatus, setImportStatus] = useState({})
  const [syncingIds, setSyncingIds] = useState(new Set())

  // Lookup state
  const [lookupHandle, setLookupHandle] = useState('')
  const [lookupResult, setLookupResult] = useState(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState('')

  const loadCreators = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCreators({ platform: 'TikTok' })
      setCreators(data)
    } catch (err) {
      console.error('Failed to load TikTok creators:', err)
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

  // Look up a TikTok handle via the platform API
  const handleLookup = async () => {
    if (!lookupHandle.trim()) return
    setLookupLoading(true)
    setLookupError('')
    setLookupResult(null)
    try {
      const handle = lookupHandle.replace(/^@/, '')
      const result = await lookupPlatformProfile('tiktok', handle)
      setLookupResult(result)
    } catch (err) {
      setLookupError(err.message || 'Profile not found or API not configured')
    } finally {
      setLookupLoading(false)
    }
  }

  // Import a looked-up profile into the CRM
  const handleImportFromLookup = async () => {
    if (!lookupResult) return
    setImportStatus(prev => ({ ...prev, lookup: 'importing' }))
    try {
      await importFromPlatform({
        platform: 'tiktok',
        handle: lookupResult.handle || lookupHandle,
        name: lookupResult.name || lookupResult.displayName,
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

  // Sync a creator's data from TikTok API
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

  // Import an existing CRM creator (backward compat placeholder)
  const handleImport = async (id) => {
    setImportStatus(prev => ({ ...prev, [id]: 'importing' }))
    try {
      await syncCreator(id)
      setImportStatus(prev => ({ ...prev, [id]: 'imported' }))
    } catch {
      setImportStatus(prev => ({ ...prev, [id]: 'imported' }))
    }
  }

  return (
    <div style={{ padding: 24, color: '#fff', maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Music2 size={28} color={tiktokPink} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>TikTok Creators</h1>
        </div>
        <p style={{ color: muted, fontSize: 14, marginBottom: 24 }}>
          Discover and import TikTok creators for your campaigns — data fetched from TikTok API
        </p>
      </motion.div>

      {/* Profile Lookup */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
        style={{ ...card, padding: 16, marginBottom: 20 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Search size={14} color={tiktokPink} /> Look Up TikTok Profile
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={lookupHandle}
            onChange={e => setLookupHandle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLookup()}
            placeholder="Enter TikTok username (e.g. @username)"
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
              background: tiktokPink, color: '#fff', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4
            }}
          >
            {lookupLoading ? <><Loader2 size={12} className="spin" /> Looking up...</> : <><Search size={12} /> Lookup</>}
          </button>
        </div>
        {lookupError && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 6 }}>{lookupError}</div>}
        {lookupResult && (
          <div style={{ marginTop: 12, padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{lookupResult.name || lookupResult.displayName}</div>
              <div style={{ color: muted, fontSize: 12 }}>
                @{lookupResult.handle || lookupHandle} | {fmt(lookupResult.followers || 0)} followers | {fmt(lookupResult.avgViews || 0)} avg views
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

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', gap: 10, marginBottom: 24 }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} color={muted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, handle, or niche..."
            style={{
              width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
              color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{
            padding: '10px 14px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
            color: '#fff', fontSize: 13, outline: 'none', cursor: 'pointer'
          }}
        >
          <option value="followers">Sort: Followers</option>
          <option value="avgViews">Sort: Avg Views</option>
          <option value="engagementRate">Sort: Engagement Rate</option>
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

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Creators', value: creators.length, icon: Users, color: tiktokPink },
          { label: 'Avg Followers', value: creators.length ? fmt(Math.round(creators.reduce((s, c) => s + (c.followers || 0), 0) / creators.length)) : '0', icon: Users, color: '#8b5cf6' },
          { label: 'Avg Views', value: creators.length ? fmt(Math.round(creators.reduce((s, c) => s + (c.avgViews || 0), 0) / creators.length)) : '0', icon: Eye, color: '#06b6d4' },
          { label: 'Avg Engagement', value: creators.length ? `${(creators.reduce((s, c) => s + (c.engagementRate || 0), 0) / creators.length).toFixed(1)}%` : '0%', icon: Heart, color: '#ef4444' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            style={{ ...card, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <div style={{ width: 38, height: 38, borderRadius: 8, background: `${stat.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={18} color={stat.color} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: muted, textTransform: 'uppercase' }}>{stat.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 40, color: muted }}>
          <Loader2 size={24} className="spin" style={{ marginBottom: 8 }} />
          <div>Loading TikTok creators...</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div style={{ ...card, padding: 40, textAlign: 'center' }}>
          <Music2 size={40} color={muted} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No TikTok Creators</div>
          <div style={{ color: muted, fontSize: 13 }}>
            Use the lookup above to search for TikTok profiles and import them into your CRM.
          </div>
        </div>
      )}

      {/* Creator Cards */}
      <div style={{ display: 'grid', gap: 16 }}>
        {filtered.map((creator, i) => (
          <motion.div
            key={creator.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            style={{ ...card, padding: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 14, flex: 1 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 12,
                  background: creator.profilePicUrl
                    ? `url(${creator.profilePicUrl}) center/cover`
                    : `linear-gradient(135deg, ${tiktokPink}, #00f2ea)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 20, overflow: 'hidden'
                }}>
                  {!creator.profilePicUrl && creator.name?.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{creator.name}</span>
                    {creator.verificationStatus === 'verified' && (
                      <span style={{ background: '#00f2ea22', color: '#00f2ea', fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                        Verified
                      </span>
                    )}
                    {creator.lastSyncedAt && (
                      <span style={{ fontSize: 10, color: muted }}>
                        Synced {new Date(creator.lastSyncedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div style={{ color: muted, fontSize: 13, marginBottom: 6 }}>{creator.handle} | {creator.city || 'Unknown'}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {creator.niche && (
                      <span style={{
                        background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 4,
                        fontSize: 11, color: '#d1d5db'
                      }}>
                        {creator.niche}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                {[
                  { label: 'Followers', value: fmt(creator.followers || 0), icon: Users },
                  { label: 'Avg Views', value: fmt(creator.avgViews || 0), icon: Eye },
                  { label: 'Engagement', value: `${(creator.engagementRate || 0).toFixed(1)}%`, icon: Heart },
                ].map((m, mi) => (
                  <div key={mi} style={{ textAlign: 'center', minWidth: 70 }}>
                    <div style={{ color: muted, fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>{m.label}</div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
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
                onClick={() => setSelectedCreator(selectedCreator === creator.id ? null : creator.id)}
                style={{
                  padding: '6px 14px', borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
                  color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4
                }}
              >
                <BarChart3 size={12} /> Details
              </button>
            </div>

            {/* Expanded detail view */}
            {selectedCreator === creator.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
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
                  <div style={{ marginTop: 10, padding: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: muted, marginBottom: 4 }}>Bio</div>
                    <div style={{ fontSize: 12 }}>{creator.bio}</div>
                  </div>
                )}
                {creator.socialAccounts?.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 11, color: muted, marginBottom: 4 }}>Connected Accounts</div>
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
    </div>
  )
}
