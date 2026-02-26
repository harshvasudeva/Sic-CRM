/**
 * useBroadcastSync - Cross-tab state synchronization using BroadcastChannel (C5).
 * When one tab updates data, all other tabs receive the update in real time.
 *
 * @param {string} channelName - Name of the broadcast channel
 * @param {Function} onMessage - Called when another tab sends a message
 * @returns {{ postMessage: Function }}
 */
import { useEffect, useRef, useCallback } from 'react'

export default function useBroadcastSync(channelName, onMessage) {
  const channelRef = useRef(null)
  const callbackRef = useRef(onMessage)
  callbackRef.current = onMessage

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return

    const channel = new BroadcastChannel(channelName)
    channelRef.current = channel

    channel.onmessage = (event) => {
      callbackRef.current?.(event.data)
    }

    return () => {
      channel.close()
      channelRef.current = null
    }
  }, [channelName])

  const postMessage = useCallback((data) => {
    if (channelRef.current) {
      try {
        channelRef.current.postMessage(data)
      } catch {
        // Channel may be closed
      }
    }
  }, [])

  return { postMessage }
}

/**
 * useSyncedStore - Automatically sync a localStorage-based store across tabs.
 * Listens for storage events and BroadcastChannel messages.
 *
 * @param {string} storeKey - localStorage key to watch
 * @param {Function} onUpdate - Called with parsed data when another tab updates it
 */
export function useSyncedStore(storeKey, onUpdate) {
  const callbackRef = useRef(onUpdate)
  callbackRef.current = onUpdate

  useEffect(() => {
    const handler = (e) => {
      if (e.key === storeKey && e.newValue) {
        try {
          const data = JSON.parse(e.newValue)
          callbackRef.current?.(data)
        } catch {
          // Invalid JSON
        }
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [storeKey])

  // Also use BroadcastChannel for same-origin tabs
  useBroadcastSync(`sync_${storeKey}`, (data) => {
    if (data?.type === 'store_update' && data.key === storeKey) {
      callbackRef.current?.(data.value)
    }
  })
}

/**
 * Notify other tabs that a store was updated.
 * Call this after saving to localStorage.
 */
export function broadcastStoreUpdate(storeKey, value) {
  if (typeof BroadcastChannel === 'undefined') return
  try {
    const ch = new BroadcastChannel(`sync_${storeKey}`)
    ch.postMessage({ type: 'store_update', key: storeKey, value })
    ch.close()
  } catch {
    // Ignore errors
  }
}
