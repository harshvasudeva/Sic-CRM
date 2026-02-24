import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Search, Users, Megaphone, Download, AlertTriangle, Calendar, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getUsage, getSubscription, getRemainingQuota } from '../../stores/subscriptionStore'

const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }
const accent = '#6366f1'
const muted = '#94a3b8'

function UsageBar({ label, icon: Icon, used, total, color }) {
  const pct = total === -1 ? 0 : Math.min(Math.round((used / total) * 100), 100)
  const isWarning = pct > 80
  const displayTotal = total === -1 ? 'Unlimited' : total

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ ...card, padding: 20, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} color={color} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
            <div style={{ color: muted, fontSize: 12 }}>{used} / {displayTotal} used</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isWarning && <AlertTriangle size={14} color="#f59e0b" />}
          <span style={{ fontWeight: 700, fontSize: 18, color: isWarning ? '#f59e0b' : '#fff' }}>{pct}%</span>
        </div>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            height: '100%', borderRadius: 4,
            background: isWarning ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : `linear-gradient(90deg, ${color}, ${color}cc)`
          }}
        />
      </div>
      {isWarning && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertTriangle size={12} /> Usage is above 80%. Consider upgrading your plan.
        </div>
      )}
    </motion.div>
  )
}

export default function UsageAnalytics() {
  const [usage, setUsage] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [quota, setQuota] = useState(null)

  useEffect(() => {
    setUsage(getUsage())
    setSubscription(getSubscription())
    setQuota(getRemainingQuota())
  }, [])

  if (!usage || !subscription) return null

  const plan = subscription.planId
  const limits = {
    free: { searches: 50, creators: 10, campaigns: 2, exports: 5 },
    pro: { searches: 500, creators: -1, campaigns: 20, exports: 50 },
    enterprise: { searches: -1, creators: -1, campaigns: -1, exports: -1 }
  }[plan] || { searches: 50, creators: 10, campaigns: 2, exports: 5 }

  const resetDate = subscription.nextBillingDate || 'N/A'

  const usageBars = [
    { label: 'Searches', icon: Search, used: usage.searchesUsed, total: limits.searches, color: '#6366f1' },
    { label: 'Creators Added', icon: Users, used: usage.creatorsAdded, total: limits.creators, color: '#8b5cf6' },
    { label: 'Campaigns Created', icon: Megaphone, used: usage.campaignsCreated, total: limits.campaigns, color: '#06b6d4' },
    { label: 'Exports', icon: Download, used: usage.exportsUsed, total: limits.exports, color: '#10b981' }
  ]

  const customTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ ...card, padding: '8px 12px', fontSize: 12 }}>
        <div style={{ color: muted, marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color }}>
            {p.name}: {p.value}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ padding: 24, color: '#fff', maxWidth: 1000, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Usage Analytics</h1>
        <p style={{ color: muted, fontSize: 14, marginBottom: 24 }}>
          Monitor your resource usage for the current billing period
        </p>
      </motion.div>

      {/* Period & Reset */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ ...card, padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={16} color={accent} />
          <span style={{ fontSize: 14 }}>Current Period: <strong>{usage.period}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={16} color={muted} />
          <span style={{ fontSize: 13, color: muted }}>Resets on: <strong style={{ color: '#fff' }}>{resetDate}</strong></span>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Plan', value: subscription.planName, color: accent },
          { label: 'Searches Left', value: quota?.searches === Infinity ? 'Unlimited' : quota?.searches || 0, color: '#6366f1' },
          { label: 'Creators Left', value: quota?.creators === Infinity ? 'Unlimited' : quota?.creators || 0, color: '#8b5cf6' },
          { label: 'Campaigns Left', value: quota?.campaigns === Infinity ? 'Unlimited' : quota?.campaigns || 0, color: '#06b6d4' }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            style={{ ...card, padding: 16, textAlign: 'center' }}
          >
            <div style={{ color: muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>{item.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Usage Bars */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 size={18} color={accent} /> Resource Usage
        </h2>
        {usageBars.map((bar, i) => (
          <UsageBar key={i} {...bar} />
        ))}
      </div>

      {/* Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        style={{ ...card, padding: 20 }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={18} color={accent} /> Daily Usage Trend
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={usage.dailyUsage || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" tick={{ fill: muted, fontSize: 11 }} tickFormatter={(v) => v.split('-')[2]} />
            <YAxis tick={{ fill: muted, fontSize: 11 }} />
            <Tooltip content={customTooltip} />
            <Line type="monotone" dataKey="searches" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Searches" />
            <Line type="monotone" dataKey="exports" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Exports" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
