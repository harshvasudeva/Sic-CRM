# Sic-CRM Quick Wins Sprint
## 5 Features in 2 Weeks (Ready to Code Now)

---

## Overview

These 5 features can be built in **10 working days** and will have **massive impact** on user experience and creator trust. All are UI-heavy, minimal backend changes.

**Effort Estimate:** ~80 developer hours (2 devs × 2 weeks × 20 hrs/week)

---

## Feature 1: Creator Verification Badge System

### What It Does
Adds a verification badge and trust score to creator profiles, helping brands quickly identify legitimate creators.

### Files to Create/Update

```
NEW FILES:
src/components/influencer/CreatorVerificationBadge.jsx
src/components/influencer/CreatorScoreGauge.jsx

UPDATE FILES:
src/pages/influencer/CreatorDatabase.jsx
src/stores/influencerStore.js
src/pages/influencer/CreatorDatabase.jsx  (list view)
```

### Implementation Steps

#### Step 1: Update influencerStore.js (30 min)
```javascript
// Add to influencer object schema
{
  id: 'creator-123',
  name: 'Emma Fashion',
  ...existing fields...,

  // NEW FIELDS:
  verificationStatus: 'unverified' | 'pending' | 'verified', // default: 'unverified'
  verificationDate: '2026-02-15',
  verificationNotes: 'Email verified, 100k followers confirmed',

  // Creator Score breakdown (0-100)
  creatorScore: 78,
  scoreBreakdown: {
    engagementRate: 40,        // 0-40 points
    audienceQuality: 30,       // 0-30 points
    profileCompleteness: 20,   // 0-20 points
    mediaKitQuality: 10        // 0-10 points
  }
}

// Add functions:
export function verifyCreator(creatorId, notes = '') {
  const store = getStore()
  const creator = store.find(c => c.id === creatorId)
  if (!creator) return null

  creator.verificationStatus = 'verified'
  creator.verificationDate = new Date().toISOString()
  creator.verificationNotes = notes
  save(store)
  return creator
}

export function calculateCreatorScore(creatorId) {
  const creator = store.find(c => c.id === creatorId)
  if (!creator) return 0

  const scoreBreakdown = {
    engagementRate: Math.min((creator.engagementRate || 0) * 500, 40), // 8% = 40 points
    audienceQuality: (creator.fakeFollowersPercent ? (100 - creator.fakeFollowersPercent) / 100 * 30 : 25),
    profileCompleteness: (creator.mediaKitUrl ? 10 : 0) + (creator.bio ? 5 : 0) + (creator.handles?.length > 2 ? 5 : 0),
    mediaKitQuality: (creator.mediaKitUrl && creator.previousCampaigns?.length > 0) ? 10 : 5
  }

  const total = Object.values(scoreBreakdown).reduce((a, b) => a + b, 0)
  creator.creatorScore = Math.round(total)
  creator.scoreBreakdown = scoreBreakdown
  save(store)
  return total
}

export function getCreatorTier(followerCount) {
  if (followerCount < 10000) return 'nano'
  if (followerCount < 100000) return 'micro'
  if (followerCount < 1000000) return 'macro'
  return 'mega'
}
```

#### Step 2: Create CreatorVerificationBadge.jsx (20 min)
```jsx
// src/components/influencer/CreatorVerificationBadge.jsx
import { Check, Clock, AlertCircle } from 'lucide-react'

export function VerificationBadge({ status, date }) {
  const config = {
    verified: {
      bg: 'rgba(16, 185, 129, 0.15)',
      color: '#10b981',
      icon: Check,
      label: 'Verified'
    },
    pending: {
      bg: 'rgba(245, 158, 11, 0.15)',
      color: '#f59e0b',
      icon: Clock,
      label: 'Pending'
    },
    unverified: {
      bg: 'rgba(107, 114, 128, 0.15)',
      color: '#6b7280',
      icon: AlertCircle,
      label: 'Unverified'
    }
  }

  const c = config[status] || config.unverified
  const Icon = c.icon

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 10px',
      borderRadius: 12,
      background: c.bg,
      color: c.color,
      fontSize: '0.75rem',
      fontWeight: 600
    }}>
      <Icon size={14} />
      {c.label}
      {date && <span style={{ marginLeft: 4, opacity: 0.7 }}>• {new Date(date).toLocaleDateString()}</span>}
    </span>
  )
}

export default VerificationBadge
```

#### Step 3: Create CreatorScoreGauge.jsx (20 min)
```jsx
// src/components/influencer/CreatorScoreGauge.jsx
import { motion } from 'framer-motion'

export function CreatorScoreGauge({ score, breakdown }) {
  const getColor = (score) => {
    if (score >= 85) return '#10b981' // green
    if (score >= 70) return '#3b82f6' // blue
    if (score >= 50) return '#f59e0b' // amber
    return '#ef4444' // red
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      {/* Circular gauge */}
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <svg width={80} height={80} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={40} cy={40} r={35} fill="none" stroke="var(--bg-tertiary)" strokeWidth={4} />
          <motion.circle
            cx={40}
            cy={40}
            r={35}
            fill="none"
            stroke={getColor(score)}
            strokeWidth={4}
            strokeDasharray={`${(score / 100) * 220} 220`}
            initial={{ strokeDasharray: '0 220' }}
            animate={{ strokeDasharray: `${(score / 100) * 220} 220` }}
            transition={{ duration: 1 }}
            strokeLinecap="round"
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: getColor(score) }}>{score}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Score</div>
        </div>
      </div>

      {/* Breakdown bars */}
      {breakdown && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.entries(breakdown).map(([key, value]) => (
            <div key={key} style={{ fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                <span style={{ color: 'var(--text-muted)' }}>{Math.round(value)}</span>
              </div>
              <div style={{
                width: 100,
                height: 6,
                background: 'var(--bg-tertiary)',
                borderRadius: 3,
                overflow: 'hidden'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.5 }}
                  style={{
                    height: '100%',
                    background: getColor(score)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

#### Step 4: Update CreatorDatabase.jsx (20 min)
```jsx
// In CreatorDatabase.jsx, update the columns array:
{
  key: 'verification',
  label: 'Status',
  render: (_, row) => (
    <VerificationBadge status={row.verificationStatus} date={row.verificationDate} />
  )
},
{
  key: 'score',
  label: 'Score',
  render: (_, row) => (
    <span style={{
      padding: '4px 10px',
      borderRadius: 8,
      background: row.creatorScore >= 70 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
      color: row.creatorScore >= 70 ? '#10b981' : '#6b7280',
      fontWeight: 600,
      fontSize: '0.85rem'
    }}>
      {row.creatorScore}/100
    </span>
  )
},

// Add filter for verification status:
const [filterVerification, setFilterVerification] = useState('')

// In filters bar:
<select value={filterVerification} onChange={(e) => setFilterVerification(e.target.value)}>
  <option value="">All Verification Status</option>
  <option value="verified">Verified</option>
  <option value="pending">Pending</option>
  <option value="unverified">Unverified</option>
</select>

// Add verification button in actions:
{row.verificationStatus !== 'verified' && (
  <button
    className="action-btn verify"
    onClick={() => {
      const notes = prompt('Add verification notes:')
      verifyCreator(row.id, notes)
      loadCreators()
    }}
    title="Verify Creator"
  >
    <Check size={16} />
  </button>
)}
```

### Testing Checklist
- [ ] Score calculation formula works correctly (0-100)
- [ ] Verification badge shows in list and detail views
- [ ] Filter by verification status works
- [ ] Manual verification button works
- [ ] Score breakdown shows correct percentages

### Time Estimate: **2 days** (16 hours)

---

## Feature 2: Campaign Brief Templates

### What It Does
Pre-built templates for common campaign types (Product Launch, Brand Awareness, etc.) that auto-fill content specs.

### Files to Create/Update

```
NEW FILES:
src/data/campaignBriefTemplates.json
src/components/influencer/BriefTemplateSelector.jsx

UPDATE FILES:
src/pages/influencer/CampaignGenerator.jsx
src/stores/campaignStore.js
```

### Implementation Steps

#### Step 1: Create campaignBriefTemplates.json (15 min)
```json
{
  "product_launch": {
    "name": "Product Launch",
    "description": "Launch a new product with authentic creator endorsements",
    "contentSpecs": {
      "postType": "carousel",
      "platforms": ["instagram", "tiktok"],
      "hashtags": ["#newproduct", "#launch", "#exclusive"],
      "mentions": ["@brand"],
      "messaging": "Share your honest first impression. Show product in action. Highlight key features.",
      "requirements": [
        "Unboxing or first impression footage",
        "Product in natural setting",
        "Creator's genuine reaction",
        "Include discount code (if provided)"
      ]
    },
    "kpis": {
      "targetViews": 100000,
      "targetEngagement": 5000,
      "targetConversions": 50,
      "targetReach": 150000
    },
    "timeline": {
      "briefDaysInAdvance": 14,
      "postingDaysFromLaunch": 1,
      "campaignDurationDays": 30
    },
    "exclusivity": {
      "duration": 90,
      "competitorsBlocked": ["competitor1", "competitor2"]
    }
  },

  "brand_awareness": {
    "name": "Brand Awareness Campaign",
    "description": "Build brand recognition through authentic creator content",
    "contentSpecs": {
      "postType": "story,feed,reel",
      "platforms": ["instagram", "tiktok", "youtube"],
      "hashtags": ["#brandassets", "#awareness"],
      "mentions": ["@brand"],
      "messaging": "Tell your audience WHY you love this brand. Make it personal.",
      "requirements": [
        "Authentic personal story or review",
        "Your daily use of product",
        "Brand values alignment"
      ]
    },
    "kpis": {
      "targetViews": 200000,
      "targetEngagement": 8000,
      "targetReach": 300000
    },
    "timeline": {
      "briefDaysInAdvance": 10,
      "postingFrequencyDays": 3,
      "campaignDurationDays": 60
    }
  },

  "sales_promotion": {
    "name": "Sales/Promo Campaign",
    "description": "Drive immediate sales with limited-time offers",
    "contentSpecs": {
      "postType": "reel,carousel",
      "platforms": ["instagram", "tiktok"],
      "hashtags": ["#sale", "#limited", "#discount"],
      "mentions": ["@brand"],
      "messaging": "Create urgency! Show the product, highlight the discount, include link.",
      "requirements": [
        "Clear CTA (buy now, limited time)",
        "Discount code prominent",
        "Direct link to purchase"
      ]
    },
    "kpis": {
      "targetViews": 150000,
      "targetEngagement": 6000,
      "targetConversions": 150,
      "targetRevenue": 50000
    },
    "timeline": {
      "briefDaysInAdvance": 5,
      "postingFrequencyDays": 2,
      "campaignDurationDays": 14
    }
  },

  "event_sponsorship": {
    "name": "Event Sponsorship",
    "description": "Promote a brand event or webinar through creators",
    "contentSpecs": {
      "postType": "carousel,story",
      "platforms": ["instagram", "tiktok"],
      "hashtags": ["#event", "#livetoday", "#register"],
      "mentions": ["@brand"],
      "messaging": "You're attending! Show excitement, share key details, encourage followers to join.",
      "requirements": [
        "Event date/time clearly stated",
        "Registration link",
        "What to expect at event"
      ]
    },
    "kpis": {
      "targetViews": 100000,
      "targetEngagement": 4000,
      "targetRegistrations": 500
    }
  }
}
```

#### Step 2: Create BriefTemplateSelector.jsx (20 min)
```jsx
// src/components/influencer/BriefTemplateSelector.jsx
import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import templates from '../../data/campaignBriefTemplates.json'

export function BriefTemplateSelector({ onSelect }) {
  const [selected, setSelected] = useState(null)

  const handleApply = (templateId) => {
    const template = templates[templateId]
    onSelect({
      templateId,
      ...template.contentSpecs,
      ...template.kpis,
      ...template.timeline
    })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
      {Object.entries(templates).map(([key, template]) => (
        <motion.div
          key={key}
          onClick={() => setSelected(key)}
          style={{
            padding: 16,
            border: selected === key ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            background: selected === key ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-card)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          whileHover={{ scale: 1.02 }}
        >
          <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>
            {template.name}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
            {template.description}
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginBottom: 12,
            fontSize: '0.75rem'
          }}>
            {template.contentSpecs.platforms.map(p => (
              <span key={p} style={{
                padding: '2px 8px',
                background: 'var(--bg-tertiary)',
                borderRadius: 6
              }}>
                {p}
              </span>
            ))}
          </div>
          <button
            onClick={() => handleApply(key)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: selected === key ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
              color: selected === key ? 'white' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            {selected === key ? <Check size={14} /> : <Copy size={14} />}
            {selected === key ? 'Applied' : 'Apply Template'}
          </button>
        </motion.div>
      ))}
    </div>
  )
}

export default BriefTemplateSelector
```

#### Step 3: Update CampaignGenerator.jsx (15 min)
```jsx
// In CampaignGenerator.jsx, add after campaign name input:
<div style={{ marginTop: 20, padding: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
  <h3 style={{ marginBottom: 12 }}>Select Brief Template (Optional)</h3>
  <BriefTemplateSelector
    onSelect={(templateData) => {
      setFormData({
        ...formData,
        contentSpecs: {
          ...formData.contentSpecs,
          ...templateData
        },
        briefTemplate: templateData.templateId
      })
    }}
  />
</div>

// OR allow users to skip and create custom:
<div style={{ marginTop: 12, textAlign: 'center' }}>
  <button onClick={() => setShowTemplate(false)} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>
    Create Custom Brief Instead
  </button>
</div>
```

### Testing Checklist
- [ ] All 4 templates load correctly
- [ ] Template selection highlights the card
- [ ] Applying template fills form fields
- [ ] Custom brief option works
- [ ] All template fields are preserved in campaign

### Time Estimate: **2 days** (12 hours)

---

## Feature 3: Content Compliance Checker

### What It Does
Flags problematic content (profanity, competitor mentions, brand guideline violations) before posting.

### Files to Create/Update

```
NEW FILES:
src/utils/complianceChecker.js
src/components/influencer/ComplianceCheckPanel.jsx

UPDATE FILES:
src/pages/influencer/ContentScheduling.jsx
```

### Implementation Steps

#### Step 1: Create complianceChecker.js (15 min)
```javascript
// src/utils/complianceChecker.js

const PROFANITY_LIST = [
  'badword1', 'badword2', 'badword3' // Use a real profanity list
]

const checkProfanity = (text) => {
  const lowerText = text.toLowerCase()
  const found = PROFANITY_LIST.filter(word => lowerText.includes(word))
  return found.length > 0 ? { passed: false, issues: found } : { passed: true }
}

const checkCompetitorMention = (text, competitors = []) => {
  const lowerText = text.toLowerCase()
  const mentioned = competitors.filter(comp =>
    lowerText.includes(comp.toLowerCase())
  )
  return mentioned.length > 0
    ? { passed: false, issues: mentioned }
    : { passed: true }
}

const checkBrandMentions = (text, requiredMentions = []) => {
  const missing = requiredMentions.filter(mention =>
    !text.includes(`@${mention}`) && !text.includes(mention)
  )
  return missing.length === 0
    ? { passed: true }
    : { passed: false, issues: missing }
}

const checkHashtagQuality = (text) => {
  const hashtags = (text.match(/#\w+/g) || [])
  const issues = []

  if (hashtags.length === 0) issues.push('No hashtags found')
  if (hashtags.length > 30) issues.push(`Too many hashtags (${hashtags.length})`)
  if (new Set(hashtags).size !== hashtags.length) issues.push('Duplicate hashtags')

  return issues.length === 0 ? { passed: true } : { passed: false, issues }
}

const checkCTAPresence = (text, requiredCTA = '') => {
  if (!requiredCTA) return { passed: true }

  const hasCTA = text.toLowerCase().includes(requiredCTA.toLowerCase())
  return hasCTA
    ? { passed: true }
    : { passed: false, issues: [`Missing CTA: "${requiredCTA}"`] }
}

export function runComplianceCheck(post, brandGuidelines = {}) {
  const results = {
    passed: true,
    checks: [],
    warnings: [],
    errors: []
  }

  // Profanity check
  const profanityCheck = checkProfanity(post.caption || '')
  if (!profanityCheck.passed) {
    results.passed = false
    results.errors.push({
      type: 'PROFANITY',
      message: `Contains flagged words: ${profanityCheck.issues.join(', ')}`,
      severity: 'error'
    })
  }

  // Competitor mention check
  if (brandGuidelines.competitors?.length > 0) {
    const competitorCheck = checkCompetitorMention(
      post.caption || '',
      brandGuidelines.competitors
    )
    if (!competitorCheck.passed) {
      results.passed = false
      results.errors.push({
        type: 'COMPETITOR',
        message: `Mentions competitors: ${competitorCheck.issues.join(', ')}`,
        severity: 'error'
      })
    }
  }

  // Brand mention check (warning if missing)
  if (brandGuidelines.requiredMentions?.length > 0) {
    const brandCheck = checkBrandMentions(
      post.caption || '',
      brandGuidelines.requiredMentions
    )
    if (!brandCheck.passed) {
      results.warnings.push({
        type: 'MISSING_BRAND_MENTION',
        message: `Missing mentions: ${brandCheck.issues.join(', ')}`,
        severity: 'warning'
      })
    }
  }

  // Hashtag quality
  const hashtagCheck = checkHashtagQuality(post.caption || '')
  if (!hashtagCheck.passed) {
    results.warnings.push({
      type: 'HASHTAG_QUALITY',
      message: hashtagCheck.issues.join('; '),
      severity: 'warning'
    })
  }

  // CTA presence
  if (brandGuidelines.requiredCTA) {
    const ctaCheck = checkCTAPresence(post.caption, brandGuidelines.requiredCTA)
    if (!ctaCheck.passed) {
      results.warnings.push({
        type: 'MISSING_CTA',
        message: ctaCheck.issues[0],
        severity: 'warning'
      })
    }
  }

  results.checks = [...results.errors, ...results.warnings]
  return results
}
```

#### Step 2: Create ComplianceCheckPanel.jsx (20 min)
```jsx
// src/components/influencer/ComplianceCheckPanel.jsx
import { AlertCircle, CheckCircle, AlertTriangle, Zap } from 'lucide-react'
import { runComplianceCheck } from '../../utils/complianceChecker'

export function ComplianceCheckPanel({ post, brandGuidelines, onApprove }) {
  const [results, setResults] = useState(null)
  const [checked, setChecked] = useState(false)

  const handleCheck = () => {
    const checkResults = runComplianceCheck(post, brandGuidelines)
    setResults(checkResults)
    setChecked(true)
  }

  if (!checked) {
    return (
      <button
        onClick={handleCheck}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'var(--accent-gradient)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}
      >
        <Zap size={16} />
        Check Compliance
      </button>
    )
  }

  return (
    <div style={{
      padding: 16,
      background: results.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      border: `1px solid ${results.passed ? '#10b981' : '#ef4444'}`,
      borderRadius: 'var(--radius-md)',
      marginTop: 12
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        color: results.passed ? '#10b981' : '#ef4444',
        fontWeight: 600
      }}>
        {results.passed ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
        {results.passed ? 'Compliance Check Passed ✓' : 'Compliance Issues Found'}
      </div>

      {results.errors.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: 6, color: '#ef4444' }}>
            Errors:
          </div>
          {results.errors.map((err, i) => (
            <div key={i} style={{
              padding: '8px 12px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderLeft: '3px solid #ef4444',
              marginBottom: 6,
              borderRadius: 4,
              fontSize: '0.8rem',
              color: '#ef4444'
            }}>
              {err.message}
            </div>
          ))}
        </div>
      )}

      {results.warnings.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: 6, color: '#f59e0b' }}>
            Warnings:
          </div>
          {results.warnings.map((warn, i) => (
            <div key={i} style={{
              padding: '8px 12px',
              background: 'rgba(245, 158, 11, 0.1)',
              borderLeft: '3px solid #f59e0b',
              marginBottom: 6,
              borderRadius: 4,
              fontSize: '0.8rem',
              color: '#f59e0b'
            }}>
              {warn.message}
            </div>
          ))}
        </div>
      )}

      {results.passed && (
        <button
          onClick={() => onApprove?.()}
          style={{
            width: '100%',
            padding: '10px 16px',
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#10b981',
            border: '1px solid #10b981',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontWeight: 500,
            marginTop: 8
          }}
        >
          Approve & Schedule Post
        </button>
      )}

      {!results.passed && (
        <button
          onClick={() => setChecked(false)}
          style={{
            width: '100%',
            padding: '10px 16px',
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            border: '1px solid #ef4444',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontWeight: 500,
            marginTop: 8
          }}
        >
          Edit Post
        </button>
      )}
    </div>
  )
}

export default ComplianceCheckPanel
```

#### Step 3: Update ContentScheduling.jsx (15 min)
```jsx
// In the content approval modal, add:
<ComplianceCheckPanel
  post={{
    caption: post.caption,
    hashtags: post.hashtags,
    mentions: post.mentions
  }}
  brandGuidelines={campaign?.brandGuidelines}
  onApprove={() => {
    schedulePost(post.id)
    toast.success('Post scheduled!')
  }}
/>
```

### Testing Checklist
- [ ] Profanity detection works
- [ ] Competitor mention detection works
- [ ] Missing brand mention shows warning
- [ ] Hashtag quality check works
- [ ] UI shows errors vs warnings correctly
- [ ] Approve button only shows when passed

### Time Estimate: **2 days** (14 hours)

---

## Feature 4: Contract Auto-Generation

### What It Does
Generates a legal contract from campaign terms, ready for e-signature.

### Files to Create/Update

```
NEW FILES:
src/utils/contractTemplates.js
src/components/influencer/ContractGenerator.jsx

UPDATE FILES:
src/pages/influencer/SalesCRM.jsx (Deals/Negotiations)
src/pages/influencer/PaymentInvoicing.jsx
```

### Implementation Steps

#### Step 1: Create contractTemplates.js (20 min)
```javascript
// src/utils/contractTemplates.js

export const INFLUENCER_AGREEMENT_TEMPLATE = (data) => `
INFLUENCER PARTNERSHIP AGREEMENT

This Influencer Partnership Agreement ("Agreement") is entered into as of ${data.date} between:

BRAND: ${data.brandName}
ADDRESS: ${data.brandAddress}
("Brand")

AND

INFLUENCER: ${data.creatorName}
SOCIAL HANDLE(S): ${data.creatorHandles}
("Influencer")

WHEREAS, the Brand desires to engage the Influencer to create and publish promotional content on social media platforms, and the Influencer agrees to provide such services;

NOW, THEREFORE, in consideration of the mutual covenants herein, the parties agree as follows:

1. SERVICES

The Influencer agrees to create and publish content promoting the Brand's products/services:

- Number of Posts: ${data.numberOfPosts}
- Platforms: ${data.platforms.join(', ')}
- Content Type: ${data.contentType}
- Campaign Duration: ${data.startDate} to ${data.endDate}

2. COMPENSATION

The Brand agrees to compensate the Influencer as follows:

- Total Fee: ${data.currency} ${data.totalAmount}
- Payment Schedule:
  - Initial Payment (${data.upfrontPercentage}%): ${data.currency} ${data.upfrontAmount} upon contract execution
  - Final Payment (${100 - data.upfrontPercentage}%): ${data.currency} ${data.finalAmount} upon completion of deliverables

3. CONTENT REQUIREMENTS

The Influencer agrees to create content that:
- Includes the following hashtags: ${data.hashtags.join(', ')}
- Mentions the Brand: ${data.mentions.join(', ')}
- Includes brand messaging: "${data.messaging}"
- Follows brand guidelines (provided separately)

4. POSTING SCHEDULE

The Influencer agrees to post content on the following dates:
${data.postingDates.map(d => `- ${d}`).join('\n')}

5. EXCLUSIVITY

${data.exclusivity === 'yes'
  ? `The Influencer agrees not to promote competing products/brands for a period of ${data.exclusivityDays} days from the campaign end date.`
  : 'This campaign is non-exclusive. The Influencer may promote other brands during the campaign period.'}

6. USAGE RIGHTS

- The Brand has the right to repost Influencer content on Brand's official channels
- Usage period: ${data.usageRightsDuration}
- Attribution required: Yes

7. INDEMNIFICATION

Each party indemnifies the other against any claims, damages, or liabilities arising from breach of this Agreement.

8. TERMINATION

Either party may terminate this Agreement with written notice if the other party materially breaches this Agreement and fails to remedy within 7 days.

9. GOVERNING LAW

This Agreement shall be governed by the laws of ${data.jurisdiction}.

10. ENTIRE AGREEMENT

This Agreement constitutes the entire agreement between the parties and supersedes all prior agreements.

---

SIGNATURES:

Brand Authorized Representative:

Name: ___________________________
Title: ___________________________
Date: ____________________________
Signature: ___________________________


Influencer:

Name: ___________________________
Date: ____________________________
Signature: ___________________________
`
```

#### Step 2: Create ContractGenerator.jsx (25 min)
```jsx
// src/components/influencer/ContractGenerator.jsx
import { useState } from 'react'
import { Download, Send, Copy, Check } from 'lucide-react'
import { INFLUENCER_AGREEMENT_TEMPLATE } from '../../utils/contractTemplates'

export function ContractGenerator({ campaign, creator, onGenerate }) {
  const [contractHTML, setContractHTML] = useState('')
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleGenerate = () => {
    const contractText = INFLUENCER_AGREEMENT_TEMPLATE({
      date: new Date().toLocaleDateString(),
      brandName: campaign.brandName,
      brandAddress: campaign.brandAddress,
      creatorName: creator.name,
      creatorHandles: Object.values(creator.handles).filter(h => h).join(', '),
      numberOfPosts: campaign.numberOfPosts,
      platforms: campaign.platforms,
      contentType: campaign.contentType,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      currency: campaign.currency || 'USD',
      totalAmount: campaign.totalAmount,
      upfrontPercentage: 50,
      upfrontAmount: campaign.totalAmount * 0.5,
      finalAmount: campaign.totalAmount * 0.5,
      hashtags: campaign.hashtags,
      mentions: campaign.mentions,
      messaging: campaign.messaging,
      postingDates: campaign.postingDates,
      exclusivity: campaign.exclusivity === 'yes' ? 'yes' : 'no',
      exclusivityDays: campaign.exclusivityDays || 90,
      usageRightsDuration: campaign.usageRightsDuration || '1 year',
      jurisdiction: campaign.jurisdiction || 'California, USA'
    })
    setContractHTML(contractText)
    onGenerate?.(contractText)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(contractHTML)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([contractHTML], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `contract-${creator.name}-${new Date().getTime()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (!contractHTML) {
    return (
      <button
        onClick={handleGenerate}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'var(--accent-gradient)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          fontWeight: 500,
          fontSize: '0.95rem'
        }}
      >
        Generate Contract
      </button>
    )
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 12
      }}>
        <button
          onClick={() => setShowPreview(!showPreview)}
          style={{
            flex: 1,
            padding: '10px 12px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 500
          }}
        >
          {showPreview ? 'Hide Preview' : 'Preview Contract'}
        </button>
        <button
          onClick={handleCopy}
          style={{
            flex: 1,
            padding: '10px 12px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={handleDownload}
          style={{
            flex: 1,
            padding: '10px 12px',
            background: 'var(--accent-gradient)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4
          }}
        >
          <Download size={14} />
          Download
        </button>
      </div>

      {showPreview && (
        <div style={{
          maxHeight: 400,
          overflow: 'auto',
          padding: 16,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          marginBottom: 12
        }}>
          {contractHTML}
        </div>
      )}

      <button
        onClick={() => {
          // TODO: Integrate with DocuSign/HelloSign for e-signature
          alert('E-signature integration coming soon')
        }}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'rgba(99, 102, 241, 0.15)',
          color: 'var(--accent-primary)',
          border: '1px solid var(--accent-primary)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          fontWeight: 500,
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}
      >
        <Send size={16} />
        Send for E-Signature (Coming Soon)
      </button>
    </div>
  )
}

export default ContractGenerator
```

#### Step 3: Update SalesCRM.jsx / Negotiations (10 min)
```jsx
// Add to deal detail view:
<ContractGenerator
  campaign={deal}
  creator={creator}
  onGenerate={(contract) => {
    // Save contract to deal
    updateDeal(deal.id, { contract })
    toast.success('Contract generated!')
  }}
/>
```

### Testing Checklist
- [ ] Contract generates with correct data
- [ ] All deal terms appear in contract
- [ ] Copy to clipboard works
- [ ] Download as .txt file works
- [ ] Preview shows full contract

### Time Estimate: **2 days** (16 hours)

---

## Feature 5: Creator Scorecard UI Enhancement

### What It Does
Shows a comprehensive creator scorecard with verification status, tier, score, and key metrics.

### Files to Create/Update

```
NEW FILES:
src/components/influencer/CreatorScorecard.jsx

UPDATE FILES:
src/pages/influencer/CreatorDatabase.jsx (Detail view)
```

### Implementation

This is basically combining Features 1 & 2 UX into a detail-view scorecard component.

```jsx
// src/components/influencer/CreatorScorecard.jsx
import { VerificationBadge } from './CreatorVerificationBadge'
import { CreatorScoreGauge } from './CreatorScoreGauge'
import { Shield, TrendingUp, Users, Eye } from 'lucide-react'

export function CreatorScorecard({ creator }) {
  const getTierColor = (tier) => {
    const colors = {
      nano: '#ec4899',
      micro: '#06b6d4',
      macro: '#3b82f6',
      mega: '#8b5cf6'
    }
    return colors[tier] || '#6b7280'
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 24,
      padding: 24,
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)'
    }}>
      {/* Left: Score Gauge */}
      <div>
        <h3 style={{ marginBottom: 16, fontSize: '1rem', fontWeight: 600 }}>Creator Score</h3>
        <CreatorScoreGauge score={creator.creatorScore} breakdown={creator.scoreBreakdown} />
      </div>

      {/* Right: Key Metrics */}
      <div>
        <h3 style={{ marginBottom: 16, fontSize: '1rem', fontWeight: 600 }}>Metrics & Status</h3>

        {/* Verification */}
        <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6 }}>Verification</div>
          <VerificationBadge status={creator.verificationStatus} date={creator.verificationDate} />
        </div>

        {/* Tier */}
        <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6 }}>Creator Tier</div>
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: getTierColor(creator.tier),
            color: 'white',
            borderRadius: 12,
            fontSize: '0.9rem',
            fontWeight: 600,
            textTransform: 'capitalize'
          }}>
            {creator.tier}
          </span>
        </div>

        {/* Key Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <MetricCard icon={Users} label="Followers" value={creator.followerCount} />
          <MetricCard icon={TrendingUp} label="Engagement" value={`${creator.engagementRate?.toFixed(1)}%`} />
          <MetricCard icon={Eye} label="Avg Views" value={(creator.avgViews || 0).toLocaleString()} />
          <MetricCard icon={Shield} label="Reliability" value={`${(creator.reliabilityScore * 100).toFixed(0)}%`} />
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <div style={{
      padding: 12,
      background: 'var(--bg-tertiary)',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }}>
      <Icon size={20} style={{ color: 'var(--accent-primary)' }} />
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
      </div>
    </div>
  )
}

export default CreatorScorecard
```

### Time Estimate: **1 day** (8 hours)

---

## Sprint Summary

| Feature | Effort | Days | Priority |
|---------|--------|------|----------|
| 1. Creator Verification Badge | 16 hrs | 2 | 🔴 HIGH |
| 2. Campaign Brief Templates | 12 hrs | 2 | 🔴 HIGH |
| 3. Content Compliance Checker | 14 hrs | 2 | 🟡 MEDIUM |
| 4. Contract Auto-Generation | 16 hrs | 2 | 🟡 MEDIUM |
| 5. Creator Scorecard UI | 8 hrs | 1 | 🟢 LOW |

**Total:** ~66 hours (2 developers × 2 weeks × 18 hrs/week) ✅

---

## Implementation Checklist

### Week 1 (Mon-Fri)
- [ ] Monday: Start Feature 1 (Verification Badge)
- [ ] Wednesday: Finish Feature 1 + Start Feature 2 (Brief Templates)
- [ ] Friday: Finish Feature 2 + Start Feature 3 (Compliance Checker)

### Week 2 (Mon-Fri)
- [ ] Monday: Finish Feature 3 + Start Feature 4 (Contract Generation)
- [ ] Wednesday: Finish Feature 4 + Start Feature 5 (Scorecard UI)
- [ ] Friday: Finish Feature 5 + Testing & Bug Fixes

### Deployment
- All QA on Friday (Week 2)
- Deploy to staging: Monday morning
- Final testing + deploy to production: Wednesday

---

## Next Steps After Quick Wins

Once these 5 features are live:

1. **Gather User Feedback** (1 week)
   - Creator feedback on verification process
   - Brand feedback on compliance checker
   - Creator feedback on brief templates

2. **Build Month 2 Features** (starting Week 3)
   - Creator Analytics Dashboard
   - Campaign Comparison View
   - Outreach Automation
   - Earnings Reports

---

## Questions?

Refer back to INFLUENCER_IMPLEMENTATION_GUIDE.md for full context.

---

**Ready to code?** Start with Feature 1 - it has the highest impact and is the most straightforward to implement.

Good luck! 🚀
