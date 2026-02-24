import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Megaphone, Sparkles, Wrench, Bug, CheckCircle, Bell } from 'lucide-react'

const STORAGE_KEY = 'sic-changelog'

const changelog = [
  {
    version: 'v2.5.0', date: '2026-02-20', title: 'Analytics & Creator Intelligence',
    items: [
      { type: 'feature', text: 'Audience demographics breakdown with age, gender, and location charts' },
      { type: 'feature', text: 'Fake follower / bot detection scoring system' },
      { type: 'feature', text: 'Audience quality score with weighted metrics' },
      { type: 'feature', text: 'Creator niche overlap map for multi-creator campaigns' },
      { type: 'feature', text: 'Content sentiment analysis with keyword clouds' },
      { type: 'improvement', text: 'Enhanced virality prediction with confidence scores' },
      { type: 'improvement', text: 'Seasonal performance trends with heat map visualization' }
    ]
  },
  {
    version: 'v2.4.0', date: '2026-02-10', title: 'Campaign Management Suite',
    items: [
      { type: 'feature', text: 'Full campaign builder with multi-step wizard' },
      { type: 'feature', text: 'AI brief generator with tone customization' },
      { type: 'feature', text: 'Deliverables tracker with approval workflow' },
      { type: 'feature', text: 'Campaign calendar with drag-and-drop scheduling' },
      { type: 'feature', text: 'Budget allocator with AI recommendations' },
      { type: 'improvement', text: 'Improved campaign performance dashboards' },
      { type: 'fix', text: 'Fixed ROI calculation for multi-creator campaigns' }
    ]
  },
  {
    version: 'v2.3.0', date: '2026-01-25', title: 'AI Matching & Discovery',
    items: [
      { type: 'feature', text: 'Natural language search for creators' },
      { type: 'feature', text: 'Lookalike creator discovery using similarity matching' },
      { type: 'feature', text: 'Brand-creator fit score explainer with detailed breakdowns' },
      { type: 'feature', text: 'Collaborative filtering - "Brands like yours" suggestions' },
      { type: 'improvement', text: 'Improved creator tier classification accuracy' },
      { type: 'fix', text: 'Fixed search results not updating after filter changes' }
    ]
  },
  {
    version: 'v2.2.0', date: '2026-01-10', title: 'Team & Platform Features',
    items: [
      { type: 'feature', text: 'Multi-user workspaces with role-based access' },
      { type: 'feature', text: 'Shared favorites lists for team collaboration' },
      { type: 'feature', text: 'TikTok and YouTube creator support' },
      { type: 'feature', text: 'Subscription tiers with usage tracking' },
      { type: 'improvement', text: 'Better keyboard shortcuts across the platform' },
      { type: 'improvement', text: 'API access for Enterprise users' },
      { type: 'fix', text: 'Fixed session timeout not refreshing tokens' },
      { type: 'fix', text: 'Fixed CSV export encoding issues' }
    ]
  }
]

const typeConfig = {
  feature: { icon: Sparkles, color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: 'New Feature' },
  improvement: { icon: Wrench, color: '#6366f1', bg: 'rgba(99,102,241,0.15)', label: 'Improvement' },
  fix: { icon: Bug, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Bug Fix' }
}

const s = {
  page: { padding: '24px', maxWidth: 800, margin: '0 auto' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 4 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24 },
  btn: { padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' },
  release: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 24, marginBottom: 16 },
  version: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: 'rgba(99,102,241,0.2)', color: '#818cf8', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace' },
  item: { display: 'flex', alignItems: 'start', gap: 10, padding: '8px 0' },
  badge: (type) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 500, background: typeConfig[type].bg, color: typeConfig[type].color }),
  newDot: { width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block', marginLeft: 6 }
}

export default function WhatsNew() {
  const [readVersions, setReadVersions] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY + '-read')
    return stored ? JSON.parse(stored) : []
  })

  const markAllRead = () => {
    const versions = changelog.map(c => c.version)
    localStorage.setItem(STORAGE_KEY + '-read', JSON.stringify(versions))
    setReadVersions(versions)
  }

  const isNew = (version) => !readVersions.includes(version)
  const unreadCount = changelog.filter(c => isNew(c.version)).length

  return (
    <div style={s.page}>
      <motion.div style={s.header} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 style={s.title}>
            <Megaphone size={22} style={{ color: '#6366f1', marginRight: 8, verticalAlign: 'middle' }} />What's New
            {unreadCount > 0 && <span style={{ ...s.badge('feature'), marginLeft: 8 }}>{unreadCount} new</span>}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Latest features, improvements, and bug fixes</p>
        </div>
        {unreadCount > 0 && <button style={s.btn} onClick={markAllRead}><CheckCircle size={14} /> Mark All Read</button>}
      </motion.div>

      {changelog.map((release, ri) => (
        <motion.div key={release.version} style={{ ...s.release, borderColor: isNew(release.version) ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.1)' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ri * 0.1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={s.version}>{release.version}</span>
              <span style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>{release.title}</span>
              {isNew(release.version) && <span style={s.newDot} title="New" />}
            </div>
            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{release.date}</span>
          </div>
          <div>
            {release.items.map((item, i) => {
              const Icon = typeConfig[item.type].icon
              return (
                <div key={i} style={s.item}>
                  <span style={s.badge(item.type)}><Icon size={10} />{typeConfig[item.type].label}</span>
                  <span style={{ color: '#e2e8f0', fontSize: '0.85rem', flex: 1 }}>{item.text}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
