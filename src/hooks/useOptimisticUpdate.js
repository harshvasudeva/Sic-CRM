import { useState, useCallback } from 'react'

/**
 * Hook for optimistic UI updates.
 * Updates the UI immediately while the actual operation runs in the background.
 * Rolls back on failure.
 *
 * @param {Function} asyncFn - The async function to execute
 * @param {Object} options - { onError, onSuccess, rollbackDelay }
 */
export function useOptimisticUpdate(asyncFn, options = {}) {
  const { onError, onSuccess, rollbackDelay = 0 } = options
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (optimisticData, updateFn, rollbackFn) => {
    setIsPending(true)
    setError(null)

    // Apply optimistic update immediately
    updateFn(optimisticData)

    try {
      const result = await asyncFn(optimisticData)
      setIsPending(false)
      onSuccess?.(result)
      return result
    } catch (err) {
      // Rollback
      if (rollbackDelay > 0) {
        setTimeout(() => rollbackFn(), rollbackDelay)
      } else {
        rollbackFn()
      }
      setError(err)
      setIsPending(false)
      onError?.(err)
      throw err
    }
  }, [asyncFn, onError, onSuccess, rollbackDelay])

  return { execute, isPending, error }
}

/**
 * Simple optimistic list operations.
 */
export function useOptimisticList(initialList = []) {
  const [list, setList] = useState(initialList)
  const [pending, setPending] = useState(new Set())

  const optimisticAdd = useCallback((item, asyncFn) => {
    const tempId = `temp_${Date.now()}`
    const tempItem = { ...item, id: tempId, _pending: true }
    setList(prev => [...prev, tempItem])
    setPending(prev => new Set([...prev, tempId]))

    asyncFn(item)
      .then(result => {
        setList(prev => prev.map(i => i.id === tempId ? { ...result, _pending: false } : i))
        setPending(prev => { const next = new Set(prev); next.delete(tempId); return next })
      })
      .catch(() => {
        setList(prev => prev.filter(i => i.id !== tempId))
        setPending(prev => { const next = new Set(prev); next.delete(tempId); return next })
      })
  }, [])

  const optimisticRemove = useCallback((id, asyncFn) => {
    const removed = list.find(i => i.id === id)
    setList(prev => prev.filter(i => i.id !== id))

    asyncFn(id).catch(() => {
      if (removed) setList(prev => [...prev, removed])
    })
  }, [list])

  const optimisticUpdate = useCallback((id, updates, asyncFn) => {
    const original = list.find(i => i.id === id)
    setList(prev => prev.map(i => i.id === id ? { ...i, ...updates, _pending: true } : i))

    asyncFn(id, updates)
      .then(() => {
        setList(prev => prev.map(i => i.id === id ? { ...i, _pending: false } : i))
      })
      .catch(() => {
        if (original) setList(prev => prev.map(i => i.id === id ? original : i))
      })
  }, [list])

  return {
    list,
    setList,
    pending,
    hasPending: pending.size > 0,
    optimisticAdd,
    optimisticRemove,
    optimisticUpdate,
  }
}
