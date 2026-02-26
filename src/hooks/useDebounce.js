/**
 * useDebounce - Debounce values and callbacks (C4).
 * Prevents excessive re-renders and API calls on fast-changing inputs.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchTerm, 300)
 *   const debouncedFn = useDebouncedCallback(handleSearch, 300)
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

/**
 * Debounce a value - returns the value after it hasn't changed for `delay` ms.
 */
export default function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

/**
 * Debounce a callback function.
 * Returns a stable function ref that delays invocation.
 */
export function useDebouncedCallback(callback, delay = 300) {
  const callbackRef = useRef(callback)
  const timerRef = useRef(null)

  callbackRef.current = callback

  const debounced = useCallback((...args) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      callbackRef.current(...args)
    }, delay)
  }, [delay])

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const flush = useCallback((...args) => {
    cancel()
    callbackRef.current(...args)
  }, [cancel])

  // Cleanup on unmount
  useEffect(() => cancel, [cancel])

  return useMemo(() => Object.assign(debounced, { cancel, flush }), [debounced, cancel, flush])
}

/**
 * Throttle a callback - invoke at most once per `interval` ms.
 */
export function useThrottledCallback(callback, interval = 300) {
  const callbackRef = useRef(callback)
  const lastCallRef = useRef(0)
  const timerRef = useRef(null)

  callbackRef.current = callback

  const throttled = useCallback((...args) => {
    const now = Date.now()
    const remaining = interval - (now - lastCallRef.current)

    if (remaining <= 0) {
      lastCallRef.current = now
      callbackRef.current(...args)
    } else if (!timerRef.current) {
      timerRef.current = setTimeout(() => {
        lastCallRef.current = Date.now()
        timerRef.current = null
        callbackRef.current(...args)
      }, remaining)
    }
  }, [interval])

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  return throttled
}
