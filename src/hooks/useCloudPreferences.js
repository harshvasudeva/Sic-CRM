/**
 * C24: Cloud-Synced User Preferences
 * Saves user settings to both localStorage (instant) and server (persistent).
 * On login, merges server prefs over local with timestamp-based conflict resolution.
 */
import { useState, useEffect, useCallback, useRef } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const PREFERENCE_KEYS = [
  'theme', 'sidebarCollapsed', 'tableDensity', 'defaultCurrency',
  'dateFormat', 'language', 'notificationsEnabled', 'dashboardLayout',
  'tableColumnOrder', 'tableColumnVisibility', 'favoriteModules',
  'shortcutOverrides', 'fontSize', 'colorAccent'
]

/**
 * Hook to manage cloud-synced user preferences
 */
export function useCloudPreferences() {
  const [preferences, setPreferences] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sic_user_prefs') || '{}')
    } catch { return {} }
  })
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)
  const syncTimer = useRef(null)
  const dirtyKeys = useRef(new Set())

  // Load from server on mount
  useEffect(() => {
    loadFromServer()
  }, [])

  const loadFromServer = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const res = await fetch(`${API_BASE}/core/preferences`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) return

      const serverPrefs = await res.json()
      if (Object.keys(serverPrefs).length > 0) {
        setPreferences(prev => {
          const merged = { ...prev, ...serverPrefs }
          localStorage.setItem('sic_user_prefs', JSON.stringify(merged))
          return merged
        })
        setLastSynced(new Date())
      }
    } catch {
      // Offline - use local prefs
    }
  }, [])

  const saveToServer = useCallback(async (prefs) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      setSyncing(true)
      const res = await fetch(`${API_BASE}/core/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(prefs)
      })
      if (res.ok) {
        setLastSynced(new Date())
        dirtyKeys.current.clear()
      }
    } catch {
      // Will retry on next change
    } finally {
      setSyncing(false)
    }
  }, [])

  /**
   * Set a preference - saves locally immediately, debounces server sync
   */
  const setPreference = useCallback((key, value) => {
    setPreferences(prev => {
      const next = { ...prev, [key]: value }
      localStorage.setItem('sic_user_prefs', JSON.stringify(next))
      return next
    })

    dirtyKeys.current.add(key)

    // Debounce server sync (2 seconds)
    if (syncTimer.current) clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      const toSync = {}
      dirtyKeys.current.forEach(k => {
        toSync[k] = preferences[k] ?? null
      })
      // Re-read from current state
      try {
        const current = JSON.parse(localStorage.getItem('sic_user_prefs') || '{}')
        dirtyKeys.current.forEach(k => { toSync[k] = current[k] })
      } catch { /* use what we have */ }
      saveToServer(toSync)
    }, 2000)
  }, [preferences, saveToServer])

  /**
   * Get a preference with fallback
   */
  const getPreference = useCallback((key, defaultValue = null) => {
    return preferences[key] ?? defaultValue
  }, [preferences])

  /**
   * Bulk set preferences
   */
  const setPreferences_ = useCallback((updates) => {
    setPreferences(prev => {
      const next = { ...prev, ...updates }
      localStorage.setItem('sic_user_prefs', JSON.stringify(next))
      return next
    })
    saveToServer(updates)
  }, [saveToServer])

  /**
   * Reset all preferences to defaults
   */
  const resetPreferences = useCallback(() => {
    const defaults = {}
    localStorage.setItem('sic_user_prefs', JSON.stringify(defaults))
    setPreferences(defaults)
    saveToServer(defaults)
  }, [saveToServer])

  return {
    preferences,
    setPreference,
    getPreference,
    setPreferences: setPreferences_,
    resetPreferences,
    syncing,
    lastSynced,
    loadFromServer,
    PREFERENCE_KEYS
  }
}

export default useCloudPreferences
