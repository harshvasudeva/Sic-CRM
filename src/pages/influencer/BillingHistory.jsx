import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Receipt, Download, CreditCard, Calendar, AlertTriangle,
  CheckCircle, Clock, XCircle, FileText, X
} from 'lucide-react'
import { getBillingHistory, getSubscription } from '../../stores/subscriptionStore'

const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }
const accent = '#6366f1'
const muted = '#94a3b8'

const statusColors = {
  paid: { bg: '#10b98122', color: '#10b981', icon: CheckCircle },
  pending: { bg: '#f59e0b22', color: '#f59e0b', icon: Clock },
  failed: { bg: '#ef444422', color: '#ef4444', icon: XCircle },
  refunded: { bg: '#6366f122', color: '#6366f1', icon: Receipt }
}

export default function BillingHistory() {
  const [history, setHistory] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState('')

  useEffect(() => {
    setHistory(getBillingHistory())
    setSubscription(getSubscription())
  }, [])

  const handleCancel = () => {
    if (cancelConfirm.toLowerCase() === 'cancel') {
      const { cancelSubscription } = require('../../stores/subscriptionStore')
      cancelSubscription()
      setSubscription(getSubscription())
      setShowCancelModal(false)
      setCancelConfirm('')
    }
  }

  const totalSpent = history.reduce((s, h) => s + (h.status === 'paid' ? h.amount : 0), 0)

  if (!subscription) return null

  return (
    <div style={{ padding: 24, color: '#fff', maxWidth: 1000, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Billing History</h1>
        <p style={{ color: muted, fontSize: 14, marginBottom: 24 }}>
          View your invoices, payment history, and manage your subscription
        </p>
      </motion.div>

      {/* Current Plan & Payment Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ ...card, padding: 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Receipt size={18} color={accent} />
            <span style={{ fontWeight: 600, fontSize: 15 }}>Current Plan</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{subscription.planName}</div>
          <div style={{ color: muted, fontSize: 13, marginBottom: 10 }}>
            ${subscription.planId === 'free' ? 0 : subscription.planId === 'pro' ? 49 : 199}/month
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Calendar size={13} color={muted} />
            <span style={{ color: muted, fontSize: 12 }}>Next billing: <strong style={{ color: '#fff' }}>{subscription.nextBillingDate || 'N/A'}</strong></span>
          </div>
          <div style={{
            display: 'inline-block', marginTop: 8,
            background: subscription.status === 'active' ? '#10b98122' : '#ef444422',
            color: subscription.status === 'active' ? '#10b981' : '#ef4444',
            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'capitalize'
          }}>
            {subscription.status}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ ...card, padding: 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <CreditCard size={18} color={accent} />
            <span style={{ fontWeight: 600, fontSize: 15 }}>Payment Method</span>
          </div>
          {subscription.paymentMethod ? (
            <>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                {subscription.paymentMethod.brand} ending in {subscription.paymentMethod.last4}
              </div>
              <div style={{ color: muted, fontSize: 13, marginBottom: 8 }}>
                Expires {subscription.paymentMethod.expiry}
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 14px',
                fontFamily: 'monospace', fontSize: 14, letterSpacing: 2, color: '#d1d5db'
              }}>
                **** **** **** {subscription.paymentMethod.last4}
              </div>
            </>
          ) : (
            <div style={{ color: muted, fontSize: 13 }}>No payment method on file</div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button style={{
              padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 12
            }}>
              Update Card
            </button>
            <button
              onClick={() => setShowCancelModal(true)}
              style={{
                padding: '6px 14px', borderRadius: 6, border: '1px solid #ef444444',
                background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: 12
              }}
            >
              Cancel Subscription
            </button>
          </div>
        </motion.div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Invoices', value: history.length, color: accent },
          { label: 'Total Spent', value: `$${totalSpent}`, color: '#10b981' },
          { label: 'Avg Monthly', value: `$${history.length ? Math.round(totalSpent / history.length) : 0}`, color: '#8b5cf6' }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            style={{ ...card, padding: 16, textAlign: 'center' }}
          >
            <div style={{ color: muted, fontSize: 11, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>{item.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Invoice Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ ...card, overflow: 'hidden' }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={16} color={accent} />
          <span style={{ fontWeight: 600, fontSize: 15 }}>Invoices</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Date', 'Invoice #', 'Plan', 'Amount', 'Status', 'Action'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, color: muted, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((inv, i) => {
              const st = statusColors[inv.status] || statusColors.pending
              const StIcon = st.icon
              return (
                <motion.tr
                  key={inv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{inv.date}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'monospace', color: accent }}>{inv.invoiceNumber}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{inv.planName}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>${inv.amount}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: st.bg, color: st.color, padding: '3px 10px',
                      borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: 'capitalize'
                    }}>
                      <StIcon size={12} /> {inv.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button style={{
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 6, padding: '4px 10px', color: '#fff', cursor: 'pointer',
                      fontSize: 12, display: 'flex', alignItems: 'center', gap: 4
                    }}>
                      <Download size={12} /> Download
                    </button>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
        {history.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: muted, fontSize: 14 }}>
            No billing history yet
          </div>
        )}
      </motion.div>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
            }}
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ ...card, padding: 28, width: 420, background: '#1e1e2e' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444' }}>
                  <AlertTriangle size={20} />
                  <span style={{ fontWeight: 700, fontSize: 16 }}>Cancel Subscription</span>
                </div>
                <button onClick={() => setShowCancelModal(false)} style={{ background: 'none', border: 'none', color: muted, cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>
              <p style={{ color: '#d1d5db', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
                Are you sure you want to cancel your <strong>{subscription.planName}</strong> subscription?
                You will lose access to premium features at the end of your billing period.
              </p>
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: muted, fontSize: 12, display: 'block', marginBottom: 6 }}>
                  Type "cancel" to confirm
                </label>
                <input
                  value={cancelConfirm}
                  onChange={e => setCancelConfirm(e.target.value)}
                  placeholder="cancel"
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)',
                    color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowCancelModal(false)}
                  style={{
                    padding: '8px 18px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)',
                    background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 13
                  }}
                >
                  Keep Plan
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelConfirm.toLowerCase() !== 'cancel'}
                  style={{
                    padding: '8px 18px', borderRadius: 6, border: 'none',
                    background: cancelConfirm.toLowerCase() === 'cancel' ? '#ef4444' : '#ef444444',
                    color: '#fff', cursor: cancelConfirm.toLowerCase() === 'cancel' ? 'pointer' : 'not-allowed',
                    fontSize: 13, fontWeight: 600
                  }}
                >
                  Cancel Subscription
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
