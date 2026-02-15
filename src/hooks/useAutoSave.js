import { useEffect, useRef, useCallback } from 'react'
import { saveDraft, getDraft, clearDraft } from '../stores/settingsStore'

export function useAutoSave(formId, formData, { interval = 5000, enabled = true } = {}) {
    const timerRef = useRef(null)
    const lastSavedRef = useRef(null)

    // Auto-save on interval
    useEffect(() => {
        if (!enabled || !formId) return
        timerRef.current = setInterval(() => {
            const dataStr = JSON.stringify(formData)
            if (dataStr !== lastSavedRef.current) {
                saveDraft(formId, formData)
                lastSavedRef.current = dataStr
            }
        }, interval)
        return () => clearInterval(timerRef.current)
    }, [formId, formData, interval, enabled])

    const restore = useCallback(() => {
        const draft = getDraft(formId)
        return draft ? draft.data : null
    }, [formId])

    const clear = useCallback(() => {
        clearDraft(formId)
        lastSavedRef.current = null
    }, [formId])

    const hasDraft = useCallback(() => {
        return getDraft(formId) !== null
    }, [formId])

    return { restore, clear, hasDraft }
}

// Hook to warn about unsaved changes
export function useUnsavedChanges(isDirty) {
    useEffect(() => {
        const handler = (e) => {
            if (isDirty) {
                e.preventDefault()
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
                return e.returnValue
            }
        }
        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
    }, [isDirty])
}
