import { useState, useEffect, useCallback, useRef } from 'react'

export function useFormDirty(initialValues = {}) {
    const [isDirty, setIsDirty] = useState(false)
    const [formValues, setFormValues] = useState(initialValues)
    const initialRef = useRef(initialValues)

    // Warn before leaving if form is dirty
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault()
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
                return e.returnValue
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [isDirty])

    const updateField = useCallback((key, value) => {
        setFormValues(prev => {
            const updated = { ...prev, [key]: value }
            const dirty = JSON.stringify(updated) !== JSON.stringify(initialRef.current)
            setIsDirty(dirty)
            return updated
        })
    }, [])

    const resetForm = useCallback((newValues) => {
        const vals = newValues || initialRef.current
        initialRef.current = vals
        setFormValues(vals)
        setIsDirty(false)
    }, [])

    const markClean = useCallback(() => {
        initialRef.current = formValues
        setIsDirty(false)
    }, [formValues])

    return {
        isDirty,
        formValues,
        updateField,
        resetForm,
        markClean,
        setFormValues: (vals) => {
            setFormValues(vals)
            setIsDirty(JSON.stringify(vals) !== JSON.stringify(initialRef.current))
        }
    }
}
