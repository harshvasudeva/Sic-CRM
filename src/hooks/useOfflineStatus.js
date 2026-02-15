import { useState, useEffect, useCallback } from 'react'

export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const goOffline = () => {
      setIsOffline(true)
      setWasOffline(true)
    }
    const goOnline = () => {
      setIsOffline(false)
      // Keep wasOffline true briefly to show "back online" toast
      setTimeout(() => setWasOffline(false), 3000)
    }

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  const retry = useCallback(async (fn) => {
    if (isOffline) {
      throw new Error('You are offline. Changes will sync when connection is restored.')
    }
    return fn()
  }, [isOffline])

  return { isOffline, wasOffline, retry }
}
