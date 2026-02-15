import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Hook for session timeout warning.
 * Shows a warning before session expires due to inactivity.
 *
 * @param {Object} options
 * @param {number} options.timeoutMs - Total inactivity timeout (default: 30 min)
 * @param {number} options.warningMs - Warning shown this many ms before timeout (default: 5 min)
 * @param {Function} options.onTimeout - Called when session times out
 * @param {Function} options.onWarning - Called when warning should show
 */
export function useSessionTimeout(options = {}) {
  const {
    timeoutMs = 30 * 60 * 1000,
    warningMs = 5 * 60 * 1000,
    onTimeout,
    onWarning,
  } = options

  const [showWarning, setShowWarning] = useState(false)
  const [remainingTime, setRemainingTime] = useState(timeoutMs)
  const lastActivityRef = useRef(Date.now())
  const warningTimerRef = useRef(null)
  const timeoutTimerRef = useRef(null)
  const countdownRef = useRef(null)

  const resetTimers = useCallback(() => {
    lastActivityRef.current = Date.now()
    setShowWarning(false)

    if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)

    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true)
      setRemainingTime(warningMs)
      onWarning?.()

      countdownRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1000) {
            clearInterval(countdownRef.current)
            return 0
          }
          return prev - 1000
        })
      }, 1000)
    }, timeoutMs - warningMs)

    timeoutTimerRef.current = setTimeout(() => {
      setShowWarning(false)
      onTimeout?.()
    }, timeoutMs)
  }, [timeoutMs, warningMs, onTimeout, onWarning])

  const extendSession = useCallback(() => {
    resetTimers()
  }, [resetTimers])

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']

    const handleActivity = () => {
      if (!showWarning) {
        lastActivityRef.current = Date.now()
        resetTimers()
      }
    }

    events.forEach(e => window.addEventListener(e, handleActivity, { passive: true }))
    resetTimers()

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity))
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [resetTimers, showWarning])

  const formatRemaining = useCallback((ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }, [])

  return {
    showWarning,
    remainingTime,
    formattedTime: formatRemaining(remainingTime),
    extendSession,
  }
}
