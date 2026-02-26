/**
 * useQueryCache - Lightweight query caching with TTL and stale-while-revalidate (C2).
 * Avoids redundant fetches, serves stale data while refreshing in background.
 *
 * @param {string} key - Unique cache key
 * @param {Function} fetcher - Async function that returns data
 * @param {Object} opts
 * @param {number} opts.ttl - Time-to-live in ms (default 60000)
 * @param {boolean} opts.staleWhileRevalidate - Serve stale data while fetching (default true)
 * @param {boolean} opts.enabled - Whether to fetch (default true)
 * @returns {{ data, error, isLoading, isStale, refetch }}
 */
import { useState, useEffect, useCallback, useRef } from 'react'

const cache = new Map()

function getCacheEntry(key) {
  return cache.get(key) || null
}

function setCacheEntry(key, data, ttl) {
  cache.set(key, { data, timestamp: Date.now(), ttl })
}

function isExpired(entry) {
  if (!entry) return true
  return Date.now() - entry.timestamp > entry.ttl
}

export default function useQueryCache(key, fetcher, { ttl = 60000, staleWhileRevalidate = true, enabled = true } = {}) {
  const [data, setData] = useState(() => getCacheEntry(key)?.data ?? null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isStale, setIsStale] = useState(false)
  const fetcherRef = useRef(fetcher)
  const mountedRef = useRef(true)

  fetcherRef.current = fetcher

  const doFetch = useCallback(async () => {
    if (!enabled) return
    const entry = getCacheEntry(key)

    if (entry && !isExpired(entry)) {
      setData(entry.data)
      setIsStale(false)
      return
    }

    if (entry && staleWhileRevalidate) {
      setData(entry.data)
      setIsStale(true)
    }

    setIsLoading(true)
    setError(null)
    try {
      const result = await fetcherRef.current()
      setCacheEntry(key, result, ttl)
      if (mountedRef.current) {
        setData(result)
        setIsStale(false)
      }
    } catch (err) {
      if (mountedRef.current) setError(err)
    } finally {
      if (mountedRef.current) setIsLoading(false)
    }
  }, [key, ttl, staleWhileRevalidate, enabled])

  useEffect(() => {
    mountedRef.current = true
    doFetch()
    return () => { mountedRef.current = false }
  }, [doFetch])

  const refetch = useCallback(() => {
    cache.delete(key)
    return doFetch()
  }, [key, doFetch])

  return { data, error, isLoading, isStale, refetch }
}

// Utility to invalidate cache externally
export function invalidateCache(keyPattern) {
  if (typeof keyPattern === 'string') {
    cache.delete(keyPattern)
  } else if (keyPattern instanceof RegExp) {
    for (const k of cache.keys()) {
      if (keyPattern.test(k)) cache.delete(k)
    }
  } else {
    cache.clear()
  }
}
