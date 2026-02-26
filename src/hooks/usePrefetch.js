/**
 * usePrefetch - Prefetch data on hover/focus for instant page transitions (C3).
 * Warms the query cache before navigation so the target page loads instantly.
 *
 * @param {string} cacheKey - The query cache key to warm
 * @param {Function} fetcher - Async fetcher function
 * @param {Object} opts
 * @param {number} opts.delay - Delay in ms before prefetching starts (default 200)
 * @param {number} opts.ttl - Cache TTL in ms (default 60000)
 * @returns {{ onMouseEnter, onFocus, prefetch }}
 */
import { useRef, useCallback } from 'react'

const prefetchCache = new Map()

function setPrefetchCache(key, data, ttl) {
  prefetchCache.set(key, { data, timestamp: Date.now(), ttl })
}

export function getPrefetchedData(key) {
  const entry = prefetchCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > entry.ttl) {
    prefetchCache.delete(key)
    return null
  }
  return entry.data
}

export default function usePrefetch(cacheKey, fetcher, { delay = 200, ttl = 60000 } = {}) {
  const timerRef = useRef(null)
  const fetchingRef = useRef(false)

  const prefetch = useCallback(async () => {
    if (fetchingRef.current) return
    const existing = prefetchCache.get(cacheKey)
    if (existing && Date.now() - existing.timestamp < existing.ttl) return

    fetchingRef.current = true
    try {
      const data = await fetcher()
      setPrefetchCache(cacheKey, data, ttl)
    } catch {
      // Silently fail - prefetch is best-effort
    } finally {
      fetchingRef.current = false
    }
  }, [cacheKey, fetcher, ttl])

  const startPrefetch = useCallback(() => {
    timerRef.current = setTimeout(prefetch, delay)
  }, [prefetch, delay])

  const cancelPrefetch = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  return {
    onMouseEnter: startPrefetch,
    onMouseLeave: cancelPrefetch,
    onFocus: startPrefetch,
    onBlur: cancelPrefetch,
    prefetch,
  }
}
