/**
 * C17: WebSocket Service for Live Metrics
 * Provides real-time updates for dashboard stats, notifications, and cross-module events.
 * Falls back to polling if WebSocket connection fails.
 */

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000/ws'

class WebSocketService {
  constructor() {
    this.ws = null
    this.listeners = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 10
    this.reconnectDelay = 1000
    this.isConnected = false
    this.messageQueue = []
    this.pollingFallback = null
    this.heartbeatInterval = null
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return

    try {
      const token = localStorage.getItem('token')
      this.ws = new WebSocket(`${WS_URL}?token=${token || ''}`)

      this.ws.onopen = () => {
        console.log('[WS] Connected')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.reconnectDelay = 1000

        // Flush queued messages
        while (this.messageQueue.length > 0) {
          const msg = this.messageQueue.shift()
          this.ws.send(JSON.stringify(msg))
        }

        // Stop polling fallback
        if (this.pollingFallback) {
          clearInterval(this.pollingFallback)
          this.pollingFallback = null
        }

        // Start heartbeat
        this.heartbeatInterval = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'ping' }))
          }
        }, 30000)

        this._emit('connection', { status: 'connected' })
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'pong') return // heartbeat response

          // Emit to type-specific listeners
          this._emit(data.type, data.payload || data)
          // Emit to global listeners
          this._emit('*', data)
        } catch (err) {
          console.warn('[WS] Failed to parse message:', err)
        }
      }

      this.ws.onclose = (event) => {
        console.log('[WS] Disconnected:', event.code)
        this.isConnected = false
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval)
        this._emit('connection', { status: 'disconnected' })

        // Auto-reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000)
          console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)
          setTimeout(() => this.connect(), delay)
        } else {
          console.warn('[WS] Max reconnect attempts reached, falling back to polling')
          this._startPollingFallback()
        }
      }

      this.ws.onerror = (error) => {
        console.error('[WS] Error:', error)
        this._emit('error', { error })
      }
    } catch (err) {
      console.error('[WS] Connection failed:', err)
      this._startPollingFallback()
    }
  }

  /**
   * Subscribe to a message type
   * @param {string} type - Message type (e.g., 'dashboard_update', 'notification', '*')
   * @param {function} callback
   * @returns {function} Unsubscribe function
   */
  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type).add(callback)

    // Auto-connect on first subscription
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.connect()
    }

    return () => {
      this.listeners.get(type)?.delete(callback)
    }
  }

  /**
   * Send a message to the server
   */
  send(type, payload) {
    const msg = { type, payload, timestamp: Date.now() }
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg))
    } else {
      this.messageQueue.push(msg)
    }
  }

  /**
   * Subscribe to specific channels (e.g., 'sales', 'inventory', 'notifications')
   */
  subscribe(channels) {
    this.send('subscribe', { channels: Array.isArray(channels) ? channels : [channels] })
  }

  /**
   * Disconnect and cleanup
   */
  disconnect() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval)
    if (this.pollingFallback) clearInterval(this.pollingFallback)
    this.reconnectAttempts = this.maxReconnectAttempts // prevent reconnect
    this.ws?.close()
    this.listeners.clear()
  }

  // --- Internal ---

  _emit(type, data) {
    const handlers = this.listeners.get(type)
    if (handlers) {
      handlers.forEach(fn => {
        try { fn(data) } catch (err) { console.error('[WS] Handler error:', err) }
      })
    }
  }

  _startPollingFallback() {
    if (this.pollingFallback) return
    console.log('[WS] Starting polling fallback (5s interval)')
    this.pollingFallback = setInterval(async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:5000/api/stats/dashboard', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        if (res.ok) {
          const data = await res.json()
          this._emit('dashboard_update', data)
        }
      } catch {
        // Silent failure for polling
      }
    }, 5000)
  }
}

// Singleton instance
export const wsService = new WebSocketService()

/**
 * React hook for WebSocket subscriptions
 */
import { useEffect, useRef, useState } from 'react'

export function useWebSocket(messageType, callback) {
  const [lastMessage, setLastMessage] = useState(null)
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const unsub = wsService.on(messageType, (data) => {
      setLastMessage(data)
      callbackRef.current?.(data)
    })
    return unsub
  }, [messageType])

  return { lastMessage, isConnected: wsService.isConnected, send: wsService.send.bind(wsService) }
}

export default wsService
