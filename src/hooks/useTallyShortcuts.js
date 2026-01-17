import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getShortcuts } from '../stores/settingsStore'

/**
 * Default Tally-like key sequences (DAL, DAS, etc.)
 * These only work on Accounting pages
 */
export const DEFAULT_SEQUENCES = [
    { sequence: 'dal', path: '/accounting/general-ledger', label: 'General Ledger', description: 'Display All Ledgers' },
    { sequence: 'das', path: '/sales', label: 'Sales Ledger', description: 'Display All Sales' },
    { sequence: 'dap', path: '/purchase', label: 'Purchase Ledger', description: 'Display All Purchases' },
    { sequence: 'dsor', path: '/accounting/receivable', label: 'Accounts Receivable', description: 'Display Statement of Receivables' },
    { sequence: 'dsop', path: '/accounting/payable', label: 'Accounts Payable', description: 'Display Statement of Payables' },
    { sequence: 'dsog', path: '/accounting/chart', label: 'Chart of Accounts', description: 'Display Statement of Groups' },
]

/**
 * F-key and modifier shortcuts (Tally-style) - these work GLOBALLY
 */
export const FKEY_SHORTCUTS = [
    // Voucher shortcuts
    { key: 'F4', path: '/accounting/bank', label: 'Contra', modifiers: [] },
    { key: 'F5', path: '/accounting/expenses', label: 'Payment', modifiers: [] },
    { key: 'F6', path: '/accounting/receivable', label: 'Receipt', modifiers: [] },
    { key: 'F7', path: '/accounting/journal', label: 'Journal', modifiers: [] },
    { key: 'F8', path: '/sales/invoices', label: 'Sales', modifiers: [] },
    { key: 'F9', path: '/purchase/bills', label: 'Purchase', modifiers: [] },
    { key: 'F10', path: '/accounting', label: 'Voucher Types', modifiers: [] },

    // Alt + F combinations
    { key: 'F7', path: '/inventory/stock-journal', label: 'Stock Journal', modifiers: ['alt'] },
    { key: 'F8', path: '/sales/delivery-notes', label: 'Delivery Note', modifiers: ['alt'] },
    { key: 'F9', path: '/purchase/grn', label: 'Receipt Note (GRN)', modifiers: ['alt'] },
    { key: 'F6', path: '/accounting/credit-notes', label: 'Credit Note', modifiers: ['alt'] },
    { key: 'F5', path: '/accounting/debit-notes', label: 'Debit Note', modifiers: ['alt'] },

    // Ctrl + F combinations
    { key: 'F7', path: '/inventory', label: 'Physical Stock', modifiers: ['ctrl'] },
    { key: 'F8', path: '/sales/orders', label: 'Sales Order', modifiers: ['ctrl'] },
    { key: 'F9', path: '/purchase/orders', label: 'Purchase Order', modifiers: ['ctrl'] },
    { key: 'F4', path: '/hr/payroll', label: 'Payroll', modifiers: ['ctrl'] },
    { key: 'F6', path: '/inventory/rejections-in', label: 'Rejections In', modifiers: ['ctrl'] },
    { key: 'F5', path: '/inventory/rejections-out', label: 'Rejections Out', modifiers: ['ctrl'] },

    // Company shortcuts
    { key: 'F3', path: '/settings', label: 'Change Company', modifiers: [] },
    { key: 'F11', path: '/settings', label: 'Company Features', modifiers: [] },
    { key: 'F12', path: '/settings', label: 'Configuration', modifiers: [] },
]

// Create a toast notification for shortcut feedback
function showShortcutToast(message) {
    // Remove existing toast
    const existing = document.getElementById('shortcut-toast')
    if (existing) existing.remove()

    const toast = document.createElement('div')
    toast.id = 'shortcut-toast'
    toast.innerHTML = `
        <div style="
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 8px 32px rgba(99, 102, 241, 0.4);
            z-index: 10000;
            animation: slideUp 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        ">
            <span style="font-family: monospace; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 6px;">${message}</span>
        </div>
        <style>
            @keyframes slideUp {
                from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        </style>
    `
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 1500)
}

// Show sequence buffer indicator (what user is typing)
function showSequenceIndicator(buffer) {
    // Remove existing indicator first
    const existing = document.getElementById('tally-sequence-indicator')
    if (existing) existing.remove()

    if (!buffer) {
        return
    }

    console.log('[Tally] Showing indicator:', buffer.toUpperCase())

    const indicator = document.createElement('div')
    indicator.id = 'tally-sequence-indicator'
    indicator.style.cssText = `
        position: fixed;
        top: 80px;
        right: 24px;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(139, 92, 246, 0.95));
        border: 2px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-size: 24px;
        font-weight: 700;
        font-family: 'Fira Code', 'Consolas', monospace;
        box-shadow: 0 8px 32px rgba(99, 102, 241, 0.5);
        z-index: 99999;
        letter-spacing: 6px;
        text-transform: uppercase;
        animation: pulse 0.3s ease;
    `
    indicator.textContent = buffer.toUpperCase() + '_'

    // Add animation style
    const style = document.createElement('style')
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
    `
    indicator.appendChild(style)
    document.body.appendChild(indicator)
}

/**
 * Global Tally Shortcuts Hook - use in Layout component
 * Handles BOTH F-keys AND sequence shortcuts (DAL, DAS, etc.) globally
 */
export function useGlobalTallyShortcuts() {
    const navigate = useNavigate()
    const sequenceBuffer = useRef('')
    const sequenceTimeout = useRef(null)
    const lastKeyTime = useRef(0)

    const clearSequence = useCallback(() => {
        sequenceBuffer.current = ''
        showSequenceIndicator(null)
        if (sequenceTimeout.current) {
            clearTimeout(sequenceTimeout.current)
            sequenceTimeout.current = null
        }
    }, [])

    useEffect(() => {
        const shortcuts = getShortcuts()

        const handleKeyDown = (e) => {
            // Don't trigger when typing in inputs
            const target = e.target
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return
            }

            // Check for F-key shortcuts first
            if (e.key.startsWith('F') && e.key.length <= 3) {
                const hasCtrl = e.ctrlKey
                const hasAlt = e.altKey

                // Find matching F-key shortcut
                const match = FKEY_SHORTCUTS.find(s => {
                    if (s.key !== e.key) return false
                    const needsCtrl = s.modifiers.includes('ctrl')
                    const needsAlt = s.modifiers.includes('alt')
                    return needsCtrl === hasCtrl && needsAlt === hasAlt
                })

                if (match) {
                    e.preventDefault()
                    clearSequence()
                    showShortcutToast(`${hasCtrl ? 'Ctrl+' : ''}${hasAlt ? 'Alt+' : ''}${e.key} → ${match.label}`)
                    navigate(match.path)
                    return
                }
            }

            // Escape: Clear sequence buffer
            if (e.key === 'Escape') {
                clearSequence()
                return
            }

            // Key Sequence Detection (DAL, DAS, DSOR, etc.)
            // Only single alphanumeric keys without modifiers
            if (e.key.length === 1 && /^[a-zA-Z0-9]$/.test(e.key) && !e.ctrlKey && !e.altKey && !e.metaKey) {
                const now = Date.now()

                // If more than 3 seconds since last key, start fresh
                if (now - lastKeyTime.current > 3000) {
                    sequenceBuffer.current = ''
                }
                lastKeyTime.current = now

                // Reset timeout
                if (sequenceTimeout.current) {
                    clearTimeout(sequenceTimeout.current)
                }

                // Add key to buffer
                sequenceBuffer.current += e.key.toLowerCase()

                // Show visual indicator of what user is typing
                showSequenceIndicator(sequenceBuffer.current)

                // Check for exact match
                const matchedShortcut = shortcuts.find(s =>
                    s.sequence.toLowerCase() === sequenceBuffer.current.toLowerCase()
                )

                if (matchedShortcut) {
                    e.preventDefault()
                    showShortcutToast(`${sequenceBuffer.current.toUpperCase()} → ${matchedShortcut.label}`)
                    clearSequence()
                    navigate(matchedShortcut.path)
                    return
                }

                // Check if buffer could still match any sequence (prefix check)
                const couldMatch = shortcuts.some(s =>
                    s.sequence.toLowerCase().startsWith(sequenceBuffer.current.toLowerCase())
                )

                if (!couldMatch) {
                    // No possible match, clear buffer
                    clearSequence()
                } else {
                    // Set timeout to clear buffer after 3 seconds
                    sequenceTimeout.current = setTimeout(() => {
                        clearSequence()
                    }, 3000)
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            if (sequenceTimeout.current) {
                clearTimeout(sequenceTimeout.current)
            }
            // Clean up indicator
            const indicator = document.getElementById('tally-sequence-indicator')
            if (indicator) indicator.remove()
        }
    }, [navigate, clearSequence])
}

/**
 * Legacy F-Key only hook (kept for backwards compatibility)
 */
export function useGlobalFKeyShortcuts() {
    const navigate = useNavigate()

    useEffect(() => {
        const handleKeyDown = (e) => {
            const target = e.target
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return
            }

            if (e.key.startsWith('F') && e.key.length <= 3) {
                const hasCtrl = e.ctrlKey
                const hasAlt = e.altKey

                const match = FKEY_SHORTCUTS.find(s => {
                    if (s.key !== e.key) return false
                    const needsCtrl = s.modifiers.includes('ctrl')
                    const needsAlt = s.modifiers.includes('alt')
                    return needsCtrl === hasCtrl && needsAlt === hasAlt
                })

                if (match) {
                    e.preventDefault()
                    showShortcutToast(`${hasCtrl ? 'Ctrl+' : ''}${hasAlt ? 'Alt+' : ''}${e.key} → ${match.label}`)
                    navigate(match.path)
                    return
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [navigate])
}

/**
 * Accounting Page Sequence Shortcuts Hook
 * Use this on Accounting pages for DAL, DAS, DSOR etc. sequences
 */
export function useTallyShortcuts({ create, save, back } = {}) {
    const navigate = useNavigate()
    const sequenceBuffer = useRef('')
    const sequenceTimeout = useRef(null)
    const lastKeyTime = useRef(0)

    const clearSequence = useCallback(() => {
        sequenceBuffer.current = ''
        showSequenceIndicator(null)
        if (sequenceTimeout.current) {
            clearTimeout(sequenceTimeout.current)
            sequenceTimeout.current = null
        }
    }, [])

    useEffect(() => {
        const shortcuts = getShortcuts()

        const handleKeyDown = (e) => {
            // Don't trigger when typing in inputs
            const target = e.target
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return
            }

            // Alt + C: Create / Add
            if (e.altKey && e.key.toLowerCase() === 'c') {
                e.preventDefault()
                if (create) {
                    showShortcutToast('Alt+C → Create')
                    create()
                }
                return
            }

            // Ctrl + A: Save / Accept
            if (e.ctrlKey && e.key.toLowerCase() === 'a') {
                e.preventDefault()
                if (save) {
                    showShortcutToast('Ctrl+A → Save')
                    save()
                }
                return
            }

            // Escape: Back / Cancel and clear buffer
            if (e.key === 'Escape') {
                clearSequence()
                if (back) {
                    e.preventDefault()
                    back()
                }
                return
            }

            // Key Sequence Detection (DAL, DAS, DSOR, etc.)
            // Only single alphanumeric keys without modifiers
            if (e.key.length === 1 && /^[a-zA-Z0-9]$/.test(e.key) && !e.ctrlKey && !e.altKey && !e.metaKey) {
                const now = Date.now()

                // If more than 3 seconds since last key, start fresh
                if (now - lastKeyTime.current > 3000) {
                    sequenceBuffer.current = ''
                }
                lastKeyTime.current = now

                // Reset timeout
                if (sequenceTimeout.current) {
                    clearTimeout(sequenceTimeout.current)
                }

                // Add key to buffer
                sequenceBuffer.current += e.key.toLowerCase()

                // Show visual indicator of what user is typing
                showSequenceIndicator(sequenceBuffer.current)

                // Check for exact match
                const matchedShortcut = shortcuts.find(s =>
                    s.sequence.toLowerCase() === sequenceBuffer.current.toLowerCase()
                )

                if (matchedShortcut) {
                    e.preventDefault()
                    showShortcutToast(`${sequenceBuffer.current.toUpperCase()} → ${matchedShortcut.label}`)
                    clearSequence()
                    navigate(matchedShortcut.path)
                    return
                }

                // Check if buffer could still match any sequence (prefix check)
                const couldMatch = shortcuts.some(s =>
                    s.sequence.toLowerCase().startsWith(sequenceBuffer.current.toLowerCase())
                )

                if (!couldMatch) {
                    // No possible match, clear buffer
                    clearSequence()
                } else {
                    // Set timeout to clear buffer after 3 seconds
                    sequenceTimeout.current = setTimeout(() => {
                        clearSequence()
                    }, 3000)
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            if (sequenceTimeout.current) {
                clearTimeout(sequenceTimeout.current)
            }
            // Clean up indicator
            const indicator = document.getElementById('tally-sequence-indicator')
            if (indicator) indicator.remove()
        }
    }, [navigate, clearSequence, create, save, back])
}
