/**
 * useIdempotency - Prevents duplicate form submissions and API calls (C8).
 * Generates unique idempotency keys and tracks in-flight requests.
 *
 * @returns {{ generateKey, isInFlight, wrapSubmit, reset }}
 */
import { useState, useRef, useCallback } from 'react'

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export default function useIdempotency() {
  const [inFlightKeys, setInFlightKeys] = useState(new Set())
  const completedKeys = useRef(new Set())

  const generateKey = useCallback((prefix = 'idem') => {
    return `${prefix}_${generateUUID()}_${Date.now()}`
  }, [])

  const isInFlight = useCallback((key) => {
    return inFlightKeys.has(key)
  }, [inFlightKeys])

  const isCompleted = useCallback((key) => {
    return completedKeys.current.has(key)
  }, [])

  /**
   * Wrap an async function to prevent duplicate execution.
   * Returns a function that only executes if not already in-flight for the given key.
   *
   * @param {string} key - Idempotency key
   * @param {Function} asyncFn - Async function to wrap
   * @returns {Function} Wrapped function
   */
  const wrapSubmit = useCallback((key, asyncFn) => {
    return async (...args) => {
      // Already in flight or completed with this key
      if (inFlightKeys.has(key) || completedKeys.current.has(key)) {
        return { skipped: true, reason: inFlightKeys.has(key) ? 'in_flight' : 'already_completed' }
      }

      setInFlightKeys(prev => new Set([...prev, key]))
      try {
        const result = await asyncFn(...args)
        completedKeys.current.add(key)
        return result
      } catch (err) {
        // On error, allow retry by not marking as completed
        throw err
      } finally {
        setInFlightKeys(prev => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
      }
    }
  }, [inFlightKeys])

  const reset = useCallback((key) => {
    if (key) {
      completedKeys.current.delete(key)
      setInFlightKeys(prev => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    } else {
      completedKeys.current.clear()
      setInFlightKeys(new Set())
    }
  }, [])

  const hasAnyInFlight = inFlightKeys.size > 0

  return { generateKey, isInFlight, isCompleted, wrapSubmit, reset, hasAnyInFlight }
}

/**
 * Simple duplicate-click guard for buttons.
 * Usage: <button onClick={guardClick(handleSubmit)} disabled={isGuarded}>Submit</button>
 */
export function useClickGuard(delay = 2000) {
  const [isGuarded, setIsGuarded] = useState(false)
  const timerRef = useRef(null)

  const guardClick = useCallback((handler) => {
    return async (...args) => {
      if (isGuarded) return
      setIsGuarded(true)
      try {
        await handler(...args)
      } finally {
        timerRef.current = setTimeout(() => setIsGuarded(false), delay)
      }
    }
  }, [isGuarded, delay])

  const resetGuard = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsGuarded(false)
  }, [])

  return { isGuarded, guardClick, resetGuard }
}
