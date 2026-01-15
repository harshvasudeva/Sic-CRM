import { useEffect, useCallback } from 'react'

const SHORTCUT_ACTIONS = {
    'Ctrl+K': 'command-palette',
    'Ctrl+A': 'accept',
    'Ctrl+S': 'save',
    'Ctrl+B': 'backup',
    'Ctrl+R': 'restore',
    'Ctrl+E': 'export',
    'Ctrl+I': 'import',
    'Ctrl+P': 'print',
    'Ctrl+F': 'find',
    'F4': 'create-contra',
    'F5': 'create-payment',
    'F6': 'create-receipt',
    'F7': 'create-journal',
    'F8': 'create-sales',
    'F9': 'create-purchase',
    'F10': 'create-memo',
    'Alt+F8': 'create-delivery',
    'Alt+F6': 'create-receipt-note',
    'Alt+F7': 'create-reversal',
    'Alt+F10': 'create-stock-journal',
    'Alt+P': 'create-physical-stock',
    'Ctrl+F8': 'create-credit-note',
    'Ctrl+F9': 'create-debit-note',
    'Escape': 'cancel',
    'Enter': 'confirm',
    'Tab': 'next-field',
    'Shift+Tab': 'prev-field',
    'Alt+I': 'voucher-register',
    'Alt+N': 'new-voucher',
    'Alt+D': 'delete-line',
    'Alt+U': 'duplicate-line',
    'Alt+G': 'goto-field',
    'Alt+R': 'repeat-narration',
    'Alt+T': 'calculator',
}

function KeyboardShortcuts({ children, onShortcut }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            let key = ''
            if (e.ctrlKey) key += 'Ctrl+'
            if (e.altKey) key += 'Alt+'
            if (e.shiftKey) key += 'Shift+'
            key += e.key

            if (SHORTCUT_ACTIONS[key]) {
                e.preventDefault()
                onShortcut && onShortcut(SHORTCUT_ACTIONS[key], e)
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [onShortcut])

    return children
}

export default KeyboardShortcuts
