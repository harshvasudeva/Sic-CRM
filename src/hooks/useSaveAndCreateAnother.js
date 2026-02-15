import { useState, useCallback } from 'react'

/**
 * Hook for "Save & Create Another" pattern.
 * Allows saving a record and immediately resetting the form for another entry.
 *
 * @param {Function} onSave - Save function that returns a promise
 * @param {Object} defaultValues - Default form values for reset
 * @param {Object} options - { preserveFields: [] } fields to keep between entries
 */
export function useSaveAndCreateAnother(onSave, defaultValues = {}, options = {}) {
  const { preserveFields = [] } = options
  const [isSaving, setIsSaving] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const [lastSaved, setLastSaved] = useState(null)

  const getResetValues = useCallback((currentData) => {
    const reset = { ...defaultValues }
    for (const field of preserveFields) {
      if (currentData[field] !== undefined) {
        reset[field] = currentData[field]
      }
    }
    return reset
  }, [defaultValues, preserveFields])

  const saveAndCreateAnother = useCallback(async (formData, setFormData) => {
    setIsSaving(true)
    try {
      const result = await onSave(formData)
      setSavedCount(prev => prev + 1)
      setLastSaved({ data: formData, result, timestamp: Date.now() })
      setFormData(getResetValues(formData))
      return result
    } finally {
      setIsSaving(false)
    }
  }, [onSave, getResetValues])

  const resetCount = useCallback(() => {
    setSavedCount(0)
    setLastSaved(null)
  }, [])

  return {
    saveAndCreateAnother,
    isSaving,
    savedCount,
    lastSaved,
    resetCount,
    getResetValues,
  }
}
