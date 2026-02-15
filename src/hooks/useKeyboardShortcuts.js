import { useEffect, useCallback } from 'react'

// Map of global keyboard shortcuts for list pages
export function useKeyboardShortcuts(shortcuts = {}) {
    const handleKeyDown = useCallback((e) => {
        const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) ||
            document.activeElement.isContentEditable

        // Escape always works
        if (e.key === 'Escape' && shortcuts.onEscape) {
            e.preventDefault()
            shortcuts.onEscape()
            return
        }

        // Don't trigger letter shortcuts in inputs
        if (isInput) return

        // N = New record
        if (e.key === 'n' && !e.ctrlKey && !e.metaKey && shortcuts.onNew) {
            e.preventDefault()
            shortcuts.onNew()
        }

        // S = Save (also Ctrl+S)
        if (e.key === 's' && shortcuts.onSave) {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault()
                shortcuts.onSave()
            } else if (!isInput) {
                e.preventDefault()
                shortcuts.onSave()
            }
        }

        // J / K = Navigate lists
        if (e.key === 'j' && shortcuts.onNext) {
            e.preventDefault()
            shortcuts.onNext()
        }
        if (e.key === 'k' && shortcuts.onPrev) {
            e.preventDefault()
            shortcuts.onPrev()
        }

        // E = Edit
        if (e.key === 'e' && shortcuts.onEdit) {
            e.preventDefault()
            shortcuts.onEdit()
        }

        // D = Delete (with confirmation)
        if (e.key === 'd' && shortcuts.onDelete) {
            e.preventDefault()
            shortcuts.onDelete()
        }

        // / = Focus search
        if (e.key === '/' && shortcuts.onSearch) {
            e.preventDefault()
            shortcuts.onSearch()
        }
    }, [shortcuts])

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])
}
