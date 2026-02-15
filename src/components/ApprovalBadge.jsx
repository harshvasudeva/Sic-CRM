import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, ShieldAlert, Clock, Check, X, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'
import {
    requiresApproval, getApprovalForDocument, submitForApproval,
    approveAtLevel, rejectApproval, getFormattedThreshold, APPROVAL_STATUSES
} from '../stores/approvalStore'
import { formatCurrency } from '../stores/currencyStore'

const statusConfig = {
    [APPROVAL_STATUSES.PENDING]: { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)', icon: Clock, label: 'Not Submitted' },
    [APPROVAL_STATUSES.SUBMITTED]: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: Clock, label: 'Pending Approval' },
    [APPROVAL_STATUSES.MANAGER_APPROVED]: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', icon: ShieldCheck, label: 'Manager Approved' },
    [APPROVAL_STATUSES.FINANCE_APPROVED]: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: ShieldCheck, label: 'Finance Approved' },
    [APPROVAL_STATUSES.APPROVED]: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: Check, label: 'Approved' },
    [APPROVAL_STATUSES.REJECTED]: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: X, label: 'Rejected' },
}

/**
 * Inline approval status badge - shows current approval state.
 */
export function ApprovalStatusBadge({ documentId, documentType }) {
    const approval = getApprovalForDocument(documentId, documentType)
    if (!approval) return null

    const config = statusConfig[approval.status] || statusConfig[APPROVAL_STATUSES.PENDING]
    const Icon = config.icon

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 8px',
            borderRadius: 12,
            background: config.bg,
            color: config.color,
            fontSize: '0.75rem',
            fontWeight: 500,
        }}>
            <Icon size={12} />
            {config.label}
        </span>
    )
}

/**
 * Full approval panel - shows chain, actions, and history.
 */
export function ApprovalPanel({ documentId, documentType, amount, currency, onStatusChange }) {
    const [expanded, setExpanded] = useState(false)
    const [comment, setComment] = useState('')
    const [approval, setApproval] = useState(() => getApprovalForDocument(documentId, documentType))

    const needsApproval = requiresApproval(amount, currency)

    if (!needsApproval && !approval) return null

    const handleSubmit = () => {
        const result = submitForApproval({
            documentId,
            documentType,
            amount,
            currency,
            submittedBy: 'Admin',
            description: `${documentType} approval`,
        })
        setApproval(result)
        onStatusChange?.('submitted')
    }

    const handleApprove = (level) => {
        const result = approveAtLevel(approval.id, level, 'Admin', comment)
        setApproval({ ...result })
        setComment('')
        if (result.status === APPROVAL_STATUSES.APPROVED) {
            onStatusChange?.('approved')
        }
    }

    const handleReject = () => {
        const result = rejectApproval(approval.id, 'Admin', comment)
        setApproval({ ...result })
        setComment('')
        onStatusChange?.('rejected')
    }

    const thresholdText = getFormattedThreshold(currency)

    return (
        <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: 16,
            marginTop: 12,
        }}>
            {/* Header */}
            <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => setExpanded(!expanded)}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShieldAlert size={18} style={{ color: '#f59e0b' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                        Approval Required
                    </span>
                    {approval && (
                        <ApprovalStatusBadge documentId={documentId} documentType={documentType} />
                    )}
                </div>
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Amount exceeds threshold of {thresholdText}
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        {/* Approval Chain */}
                        <div style={{ marginTop: 16 }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>
                                Approval Chain
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {(approval?.approvalChain || [
                                    { role: 'manager', label: 'Manager', level: 1, status: 'pending' },
                                    { role: 'finance_head', label: 'Finance Head', level: 2, status: 'pending' },
                                ]).map((step, i) => {
                                    const stepColor = step.status === 'approved' ? '#10b981'
                                        : step.status === 'rejected' ? '#ef4444'
                                            : '#6b7280'
                                    return (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {i > 0 && <div style={{ width: 24, height: 2, background: stepColor === '#10b981' ? stepColor : 'var(--border-color)' }} />}
                                            <div style={{
                                                padding: '6px 12px',
                                                borderRadius: 16,
                                                background: step.status === 'approved'
                                                    ? 'rgba(16, 185, 129, 0.15)'
                                                    : step.status === 'rejected'
                                                        ? 'rgba(239, 68, 68, 0.15)'
                                                        : 'rgba(107, 114, 128, 0.1)',
                                                color: stepColor,
                                                fontSize: '0.8rem',
                                                fontWeight: 500,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 4,
                                            }}>
                                                {step.status === 'approved' ? <Check size={12} /> : step.status === 'rejected' ? <X size={12} /> : <Clock size={12} />}
                                                {step.label}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                            {!approval && (
                                <button
                                    onClick={handleSubmit}
                                    style={{
                                        padding: '8px 16px',
                                        background: 'var(--accent-gradient)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 8,
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                    }}
                                >
                                    <ShieldCheck size={14} />
                                    Submit for Approval
                                </button>
                            )}

                            {approval && approval.status !== APPROVAL_STATUSES.APPROVED && approval.status !== APPROVAL_STATUSES.REJECTED && (
                                <>
                                    <div style={{ flex: 1 }}>
                                        <input
                                            type="text"
                                            placeholder="Add a comment..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                background: 'var(--bg-primary)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: 8,
                                                color: 'var(--text-primary)',
                                                fontSize: '0.85rem',
                                            }}
                                        />
                                    </div>
                                    {approval.approvalChain.map(step => {
                                        if (step.status !== 'pending') return null
                                        // Only show approve for the next pending level
                                        const prevSteps = approval.approvalChain.filter(s => s.level < step.level)
                                        if (!prevSteps.every(s => s.status === 'approved')) return null
                                        return (
                                            <button
                                                key={step.level}
                                                onClick={() => handleApprove(step.level)}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: 'rgba(16, 185, 129, 0.15)',
                                                    color: '#10b981',
                                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                                    borderRadius: 8,
                                                    fontSize: '0.85rem',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                }}
                                            >
                                                <Check size={14} />
                                                Approve ({step.label})
                                            </button>
                                        )
                                    })}
                                    <button
                                        onClick={handleReject}
                                        style={{
                                            padding: '8px 16px',
                                            background: 'rgba(239, 68, 68, 0.15)',
                                            color: '#ef4444',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            borderRadius: 8,
                                            fontSize: '0.85rem',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                        }}
                                    >
                                        <X size={14} />
                                        Reject
                                    </button>
                                </>
                            )}
                        </div>

                        {/* History */}
                        {approval?.history?.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>
                                    History
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {approval.history.map((entry, i) => (
                                        <div key={i} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            fontSize: '0.75rem',
                                            color: 'var(--text-muted)',
                                        }}>
                                            <div style={{
                                                width: 6, height: 6, borderRadius: '50%',
                                                background: entry.action === 'approved' ? '#10b981'
                                                    : entry.action === 'rejected' ? '#ef4444' : '#f59e0b',
                                            }} />
                                            <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{entry.by}</span>
                                            <span>{entry.action}</span>
                                            {entry.comment && <span style={{ color: 'var(--text-secondary)' }}>- "{entry.comment}"</span>}
                                            <span style={{ marginLeft: 'auto' }}>{new Date(entry.at).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ApprovalPanel
