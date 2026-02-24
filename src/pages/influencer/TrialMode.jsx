import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Lock, Unlock, Crown, Zap, Clock, ArrowRight, Star,
  Search, BarChart3, Target, FileText, Shield, Globe, Settings
} from 'lucide-react'
import { getSubscription, isFeatureAvailable } from '../../stores/subscriptionStore'

const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }
const accent = '#6366f1'
const muted = '#94a3b8'

const features = [
  { name: 'Basic creator search', icon: Search, tier: 'free', description: 'Search creators by name, niche, platform' },
  { name: 'Basic analytics', icon: BarChart3, tier: 'free', description: 'View basic engagement metrics' },
  { name: 'Up to 10 creators', icon: Star, tier: 'free', description: 'Add up to 10 creators to your database' },
  { name: '2 campaigns', icon: Target, tier: 'free', description: 'Create and manage 2 campaigns' },
  { name: 'AI matching', icon: Zap, tier: 'pro', description: 'AI-powered creator-brand matching' },
  { name: 'Campaign builder', icon: Target, tier: 'pro', description: 'Advanced multi-creator campaign builder' },
  { name: 'Report builder', icon: FileText, tier: 'pro', description: 'Custom report generation and export' },
  { name: 'Advanced analytics', icon: BarChart3, tier: 'pro', description: 'Deep engagement and ROI analytics' },
  { name: 'API access', icon: Globe, tier: 'pro', description: 'REST API access (100 req/day)' },
  { name: 'Scheduled reports', icon: Clock, tier: 'pro', description: 'Auto-schedule and email reports' },
  { name: 'Bulk import', icon: FileText, tier: 'pro', description: 'Import creators from CSV' },
  { name: 'Custom integrations', icon: Settings, tier: 'enterprise', description: 'Custom API integrations' },
  { name: 'White-label reports', icon: FileText, tier: 'enterprise', description: 'Branded report generation' },
  { name: 'SSO/SAML', icon: Shield, tier: 'enterprise', description: 'Single sign-on with SAML' },
  { name: 'SLA guarantee', icon: Shield, tier: 'enterprise', description: '99.9% uptime SLA' },
  { name: 'Custom features', icon: Settings, tier: 'enterprise', description: 'Request custom feature builds' }
]

const tierColors = { free: '#6b7280', pro: '#6366f1', enterprise: '#f59e0b' }
const tierLabels = { free: 'Free', pro: 'Pro', enterprise: 'Enterprise' }

const sampleData = [
  { name: 'Creator A', followers: '520K', engagement: '8.7%', niche: 'Lifestyle' },
  { name: 'Creator B', followers: '1.2M', engagement: '15%', niche: 'Tech' },
  { name: 'Creator C', followers: '310K', engagement: '9%', niche: 'Fitness' }
]

const comparisonRows = [
  { feature: 'Creator Search', free: '50/month', pro: '500/month', enterprise: 'Unlimited' },
  { feature: 'Creators', free: '10', pro: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Campaigns', free: '2', pro: '20', enterprise: 'Unlimited' },
  { feature: 'Team Members', free: '1', pro: '5', enterprise: 'Unlimited' },
  { feature: 'Analytics', free: 'Basic', pro: 'Advanced', enterprise: 'Advanced + Custom' },
  { feature: 'API Access', free: 'No', pro: '100 req/day', enterprise: 'Unlimited' },
  { feature: 'Reports', free: 'No', pro: 'Yes', enterprise: 'White-label' },
  { feature: 'Support', free: 'Email', pro: 'Priority', enterprise: 'Dedicated Manager' }
]

export default function TrialMode() {
  const [subscription, setSubscription] = useState(null)

  useEffect(() => {
    setSubscription(getSubscription())
  }, [])

  if (!subscription) return null

  const isTrial = subscription.status === 'trial'
  const trialDaysLeft = isTrial && subscription.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt) - new Date()) / 86400000))
    : 0

  return (
    <div style={{ padding: 24, color: '#fff', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
          {isTrial ? 'Trial Mode' : 'Feature Access'}
        </h1>
        <p style={{ color: muted, fontSize: 14, marginBottom: 24 }}>
          {isTrial
            ? `You have ${trialDaysLeft} days left in your trial. Upgrade to keep access.`
            : 'See which features are available on your current plan'}
        </p>
      </motion.div>

      {/* Trial Countdown */}
      {isTrial && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{
            ...card, padding: 28, textAlign: 'center', marginBottom: 28,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(239,68,68,0.1))',
            border: '1px solid rgba(99,102,241,0.3)'
          }}
        >
          <Clock size={32} color={accent} style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 48, fontWeight: 900, color: trialDaysLeft <= 3 ? '#ef4444' : accent }}>
            {trialDaysLeft}
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Days Remaining</div>
          <div style={{ color: muted, fontSize: 13, marginBottom: 16 }}>
            Your trial of {subscription.planName} expires on {subscription.trialEndsAt}
          </div>
          <button style={{
            padding: '10px 28px', borderRadius: 8, border: 'none',
            background: accent, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6
          }}>
            <Crown size={16} /> Upgrade Now <ArrowRight size={14} />
          </button>
        </motion.div>
      )}

      {/* Feature Grid */}
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Feature Access</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
        {features.map((feat, i) => {
          const available = isFeatureAvailable(feat.name)
          const Icon = feat.icon
          const tierColor = tierColors[feat.tier]

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{
                ...card, padding: 16, position: 'relative',
                opacity: available ? 1 : 0.55
              }}
            >
              <div style={{ position: 'absolute', top: 10, right: 10 }}>
                {available
                  ? <Unlock size={14} color="#10b981" />
                  : <Lock size={14} color="#ef4444" />}
              </div>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: available ? `${tierColor}22` : 'rgba(255,255,255,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10
              }}>
                <Icon size={16} color={available ? tierColor : muted} />
              </div>
              <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 2 }}>{feat.name}</div>
              <div style={{ color: muted, fontSize: 11, marginBottom: 6, lineHeight: 1.4 }}>{feat.description}</div>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                background: `${tierColor}22`, color: tierColor, textTransform: 'uppercase'
              }}>
                {tierLabels[feat.tier]}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Blurred Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ ...card, padding: 20, marginBottom: 28, position: 'relative', overflow: 'hidden' }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Pro Feature Preview</h2>
        <div style={{ filter: 'blur(3px)', pointerEvents: 'none' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {['Creator', 'Followers', 'Engagement', 'Niche', 'AI Score'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleData.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px 12px', fontSize: 13 }}>{row.name}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13 }}>{row.followers}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13, color: '#10b981' }}>{row.engagement}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13 }}>{row.niche}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13, color: accent }}>{85 + i * 3}/100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.3)', flexDirection: 'column', gap: 8
        }}>
          <Lock size={28} color={accent} />
          <div style={{ fontWeight: 700, fontSize: 16 }}>Upgrade to unlock AI Creator Scores</div>
          <button style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            background: accent, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Crown size={14} /> Upgrade to Pro
          </button>
        </div>
      </motion.div>

      {/* Free vs Pro Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        style={{ ...card, overflow: 'hidden' }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Plan Comparison</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, color: muted }}>Feature</th>
              <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12, color: tierColors.free, fontWeight: 600 }}>Free</th>
              <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12, color: tierColors.pro, fontWeight: 600 }}>Pro</th>
              <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12, color: tierColors.enterprise, fontWeight: 600 }}>Enterprise</th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '10px 16px', fontSize: 13, color: '#d1d5db' }}>{row.feature}</td>
                <td style={{ padding: '10px 16px', fontSize: 12, textAlign: 'center', color: muted }}>{row.free}</td>
                <td style={{ padding: '10px 16px', fontSize: 12, textAlign: 'center', color: '#d1d5db' }}>{row.pro}</td>
                <td style={{ padding: '10px 16px', fontSize: 12, textAlign: 'center', color: '#d1d5db' }}>{row.enterprise}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Upgrade Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        style={{
          ...card, padding: 24, marginTop: 24, textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))'
        }}
      >
        <Crown size={28} color={accent} style={{ marginBottom: 8 }} />
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Unlock the Full Power of Sic CRM</div>
        <div style={{ color: muted, fontSize: 13, marginBottom: 16, maxWidth: 500, margin: '0 auto 16px' }}>
          Upgrade to Pro and get unlimited creator search, AI matching, advanced analytics,
          campaign builder, report builder, and priority support.
        </div>
        <button style={{
          padding: '12px 32px', borderRadius: 8, border: 'none',
          background: accent, color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 8
        }}>
          Upgrade Now - $49/mo <ArrowRight size={16} />
        </button>
      </motion.div>
    </div>
  )
}
