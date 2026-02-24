import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Crown, Zap, Building2, ToggleLeft, ToggleRight, ArrowRight, Star } from 'lucide-react'
import { getSubscription, getPlans, upgradePlan } from '../../stores/subscriptionStore'

const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }
const accent = '#6366f1'
const muted = '#94a3b8'

const allFeatures = [
  'Basic creator search', 'Up to 10 creators', '2 campaigns', 'Basic analytics',
  'Email support', 'Unlimited creator search', 'Unlimited creators', '20 campaigns',
  'Advanced analytics', 'AI matching', 'Campaign builder', 'Report builder',
  'Priority support', 'API access (100 req/day)', 'Everything in Pro',
  'Unlimited campaigns', 'Unlimited team members', 'Custom integrations',
  'Dedicated account manager', 'White-label reports', 'Full API access',
  'SSO/SAML', 'SLA guarantee', 'Custom features'
]

const planIcons = { free: Zap, pro: Crown, enterprise: Building2 }
const planColors = { free: '#6b7280', pro: '#6366f1', enterprise: '#f59e0b' }

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [annual, setAnnual] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [upgrading, setUpgrading] = useState(null)

  useEffect(() => {
    setPlans(getPlans())
    setSubscription(getSubscription())
  }, [])

  const handleUpgrade = (planId) => {
    setUpgrading(planId)
    setTimeout(() => {
      upgradePlan(planId)
      setSubscription(getSubscription())
      setUpgrading(null)
    }, 1200)
  }

  const getPrice = (price) => {
    if (price === 0) return 0
    return annual ? Math.round(price * 10) : price
  }

  const getPeriodLabel = () => annual ? '/year' : '/mo'

  if (!subscription) return null

  return (
    <div style={{ padding: 24, color: '#fff', maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Subscription Plans</h1>
        <p style={{ color: muted, fontSize: 14, marginBottom: 24 }}>
          Choose the plan that fits your influencer marketing needs
        </p>
      </motion.div>

      {/* Annual Toggle */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 32 }}
      >
        <span style={{ color: !annual ? '#fff' : muted, fontWeight: !annual ? 600 : 400, fontSize: 14 }}>Monthly</span>
        <button
          onClick={() => setAnnual(!annual)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: accent, display: 'flex', alignItems: 'center' }}
        >
          {annual
            ? <ToggleRight size={36} />
            : <ToggleLeft size={36} />}
        </button>
        <span style={{ color: annual ? '#fff' : muted, fontWeight: annual ? 600 : 400, fontSize: 14 }}>
          Annual <span style={{ background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, marginLeft: 4 }}>Save 17%</span>
        </span>
      </motion.div>

      {/* Plan Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        {plans.map((plan, i) => {
          const isCurrent = subscription.planId === plan.id
          const Icon = planIcons[plan.id] || Zap
          const color = planColors[plan.id] || accent
          const isPopular = plan.id === 'pro'

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                ...card,
                padding: 28,
                position: 'relative',
                border: isPopular ? `2px solid ${accent}` : card.border,
                overflow: 'hidden'
              }}
            >
              {isPopular && (
                <div style={{
                  position: 'absolute', top: 12, right: -30, background: accent,
                  color: '#fff', fontSize: 11, fontWeight: 600, padding: '4px 36px',
                  transform: 'rotate(45deg)'
                }}>
                  Popular
                </div>
              )}

              {isCurrent && (
                <div style={{
                  position: 'absolute', top: 12, left: 12,
                  background: '#10b981', color: '#fff', fontSize: 10, fontWeight: 700,
                  padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 0.5
                }}>
                  Current Plan
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: isCurrent ? 28 : 0, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={color} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{plan.name}</div>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 42, fontWeight: 800 }}>${getPrice(plan.price)}</span>
                {plan.price > 0 && <span style={{ color: muted, fontSize: 14 }}>{getPeriodLabel()}</span>}
              </div>

              <div style={{ marginBottom: 20 }}>
                {plan.features.map((feat, fi) => (
                  <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Check size={14} color="#10b981" />
                    <span style={{ fontSize: 13, color: '#d1d5db' }}>{feat}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => !isCurrent && handleUpgrade(plan.id)}
                disabled={isCurrent || upgrading === plan.id}
                style={{
                  width: '100%', padding: '10px 16px', borderRadius: 8,
                  border: isCurrent ? '1px solid rgba(255,255,255,0.2)' : 'none',
                  background: isCurrent ? 'transparent' : color,
                  color: '#fff', fontWeight: 600, fontSize: 14,
                  cursor: isCurrent ? 'default' : 'pointer',
                  opacity: isCurrent ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}
              >
                {upgrading === plan.id ? 'Upgrading...' : isCurrent ? 'Current Plan' : <>Upgrade <ArrowRight size={14} /></>}
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Comparison Toggle */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        style={{ textAlign: 'center', marginBottom: 20 }}
      >
        <button
          onClick={() => setShowComparison(!showComparison)}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '10px 24px', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500
          }}
        >
          {showComparison ? 'Hide' : 'Show'} Feature Comparison
        </button>
      </motion.div>

      {/* Feature Comparison Table */}
      <AnimatePresence>
        {showComparison && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ ...card, overflow: 'hidden' }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: muted }}>Feature</th>
                  {plans.map(p => (
                    <th key={p.id} style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allFeatures.map((feat, fi) => (
                  <tr key={fi} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px 16px', fontSize: 13, color: '#d1d5db' }}>{feat}</td>
                    {plans.map(p => {
                      const has = p.features.some(f => f.toLowerCase().includes(feat.toLowerCase().split(' ')[0]))
                        || (p.id === 'enterprise' && feat !== 'Up to 10 creators' && feat !== '2 campaigns')
                      return (
                        <td key={p.id} style={{ padding: '10px 16px', textAlign: 'center' }}>
                          {has
                            ? <Check size={16} color="#10b981" />
                            : <X size={16} color="#ef4444" style={{ opacity: 0.4 }} />}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Plan Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        style={{ ...card, padding: 20, marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Star size={20} color={accent} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>You are on the {subscription.planName} plan</div>
            <div style={{ color: muted, fontSize: 12 }}>
              Billing cycle: {subscription.billingCycle} | Next billing: {subscription.nextBillingDate}
            </div>
          </div>
        </div>
        <div style={{
          background: subscription.status === 'active' ? '#10b98122' : '#ef444422',
          color: subscription.status === 'active' ? '#10b981' : '#ef4444',
          padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'capitalize'
        }}>
          {subscription.status}
        </div>
      </motion.div>
    </div>
  )
}
