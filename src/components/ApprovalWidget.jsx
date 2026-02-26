/**
 * ApprovalWidget - Reusable approval workflow stepper.
 * @param {{ steps: Array, currentStep: number, status: string, history: Array }} approvalRequest
 * @param {Function} onApprove - Called with { comment }
 * @param {Function} onReject - Called with { comment }
 * @param {Function} onEscalate - Called with { comment }
 * @param {string} currentUserId
 */
import { useState } from 'react'
import { Check, X, AlertTriangle, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { motion } from 'framer-motion'

const STATUS_COLORS = { approved: '#10b981', rejected: '#ef4444', pending: '#f59e0b', escalated: '#8b5cf6' }

export default function ApprovalWidget({ approvalRequest, onApprove, onReject, onEscalate, currentUserId }) {
  const [comment, setComment] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  if (!approvalRequest) return null
  const { steps = [], currentStep = 0, status, history = [] } = approvalRequest
  const isPending = status === 'pending'
  const currentStepData = steps[currentStep]
  const isCurrentApprover = currentStepData?.approverId === currentUserId || currentStepData?.approverRole === 'any'

  const handleAction = (action) => {
    const payload = { comment: comment.trim() }
    if (action === 'approve') onApprove?.(payload)
    else if (action === 'reject') onReject?.(payload)
    else if (action === 'escalate') onEscalate?.(payload)
    setComment('')
  }

  const s = {
    container: { background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)', padding: 16 },
    stepper: { display: 'flex', alignItems: 'center', gap: 0, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 },
    step: (state) => ({
      display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80, position: 'relative',
    }),
    dot: (state) => ({
      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: state === 'approved' ? '#10b981' : state === 'rejected' ? '#ef4444' : state === 'current' ? '#f59e0b' : 'var(--bg-primary)',
      border: `2px solid ${state === 'approved' ? '#10b981' : state === 'rejected' ? '#ef4444' : state === 'current' ? '#f59e0b' : 'var(--border)'}`,
      color: state === 'future' ? 'var(--text-secondary)' : '#fff', fontSize: 12,
    }),
    line: (done) => ({ flex: 1, height: 2, minWidth: 20, background: done ? '#10b981' : 'var(--border)' }),
    stepLabel: { fontSize: 10, color: 'var(--text-secondary)', marginTop: 4, textAlign: 'center', maxWidth: 80, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    actions: { display: 'flex', gap: 8, marginTop: 12 },
    btn: (color) => ({ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: color, color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }),
    textarea: { width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', padding: '6px 8px', fontSize: 12, resize: 'none', fontFamily: 'inherit', marginTop: 8, boxSizing: 'border-box' },
    statusBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: (STATUS_COLORS[status] || '#6b7280') + '20', color: STATUS_COLORS[status] || '#6b7280' },
    historyToggle: { display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)', marginTop: 12, background: 'none', border: 'none', padding: 0 },
    historyList: { marginTop: 8, fontSize: 12 },
    historyItem: { display: 'flex', gap: 8, padding: '4px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' },
  }

  return (
    <div style={s.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Approval Workflow</span>
        <span style={s.statusBadge}>{status?.charAt(0).toUpperCase() + status?.slice(1)}</span>
      </div>

      {/* Stepper */}
      <div style={s.stepper}>
        {steps.map((step, i) => {
          const state = i < currentStep ? (history.find(h => h.step === i)?.action === 'rejected' ? 'rejected' : 'approved') : i === currentStep ? 'current' : 'future'
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
              <div style={s.step(state)}>
                <motion.div style={s.dot(state)} animate={state === 'current' ? { scale: [1, 1.15, 1] } : {}} transition={{ repeat: Infinity, duration: 2 }}>
                  {state === 'approved' ? <Check size={14} /> : state === 'rejected' ? <X size={14} /> : state === 'current' ? <Clock size={14} /> : <span>{i + 1}</span>}
                </motion.div>
                <div style={s.stepLabel}>{step.approverRole || step.approverId || `Step ${i + 1}`}</div>
              </div>
              {i < steps.length - 1 && <div style={s.line(i < currentStep)} />}
            </div>
          )
        })}
      </div>

      {/* Action area */}
      {isPending && isCurrentApprover && (
        <>
          <textarea style={s.textarea} placeholder="Add a comment (optional)..." value={comment} onChange={e => setComment(e.target.value)} rows={2} />
          <div style={s.actions}>
            <button style={s.btn('#10b981')} onClick={() => handleAction('approve')}><Check size={13} /> Approve</button>
            <button style={s.btn('#ef4444')} onClick={() => handleAction('reject')}><X size={13} /> Reject</button>
            <button style={s.btn('#8b5cf6')} onClick={() => handleAction('escalate')}><AlertTriangle size={13} /> Escalate</button>
          </div>
        </>
      )}

      {/* History */}
      {history.length > 0 && (
        <>
          <button style={s.historyToggle} onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />} History ({history.length})
          </button>
          {showHistory && (
            <div style={s.historyList}>
              {history.map((h, i) => (
                <div key={i} style={s.historyItem}>
                  <span style={{ color: STATUS_COLORS[h.action] || '#6b7280', fontWeight: 600, minWidth: 60 }}>{h.action}</span>
                  <span>{h.by}</span>
                  <span style={{ marginLeft: 'auto' }}>{h.at ? new Date(h.at).toLocaleDateString() : ''}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
