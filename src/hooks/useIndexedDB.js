/**
 * useIndexedDB - IndexedDB wrapper for offline-capable large data storage (C6).
 * Falls back gracefully to localStorage if IndexedDB is unavailable.
 *
 * @param {string} dbName - Database name
 * @param {string} storeName - Object store name
 * @returns {{ get, set, remove, getAll, clear, isReady }}
 */
import { useState, useEffect, useRef, useCallback } from 'react'

function openDB(dbName, storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function idbOperation(db, storeName, mode, operation) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode)
    const store = tx.objectStore(storeName)
    const request = operation(store)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export default function useIndexedDB(dbName = 'sic_crm', storeName = 'default') {
  const dbRef = useRef(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let mounted = true
    if (typeof indexedDB === 'undefined') {
      setIsReady(true) // Fall back to localStorage
      return
    }

    openDB(dbName, storeName)
      .then(db => {
        if (mounted) {
          dbRef.current = db
          setIsReady(true)
        }
      })
      .catch(() => {
        if (mounted) setIsReady(true) // Fallback
      })

    return () => {
      mounted = false
      dbRef.current?.close()
    }
  }, [dbName, storeName])

  const get = useCallback(async (key) => {
    if (dbRef.current) {
      return idbOperation(dbRef.current, storeName, 'readonly', store => store.get(key))
    }
    // Fallback to localStorage
    try {
      const val = localStorage.getItem(`${dbName}_${storeName}_${key}`)
      return val ? JSON.parse(val) : undefined
    } catch {
      return undefined
    }
  }, [dbName, storeName])

  const set = useCallback(async (key, value) => {
    if (dbRef.current) {
      return idbOperation(dbRef.current, storeName, 'readwrite', store => store.put(value, key))
    }
    // Fallback
    try {
      localStorage.setItem(`${dbName}_${storeName}_${key}`, JSON.stringify(value))
    } catch {
      // Storage full
    }
  }, [dbName, storeName])

  const remove = useCallback(async (key) => {
    if (dbRef.current) {
      return idbOperation(dbRef.current, storeName, 'readwrite', store => store.delete(key))
    }
    localStorage.removeItem(`${dbName}_${storeName}_${key}`)
  }, [dbName, storeName])

  const getAll = useCallback(async () => {
    if (dbRef.current) {
      return idbOperation(dbRef.current, storeName, 'readonly', store => store.getAll())
    }
    // Fallback: scan localStorage
    const prefix = `${dbName}_${storeName}_`
    const results = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(prefix)) {
        try {
          results.push(JSON.parse(localStorage.getItem(k)))
        } catch { /* skip */ }
      }
    }
    return results
  }, [dbName, storeName])

  const clear = useCallback(async () => {
    if (dbRef.current) {
      return idbOperation(dbRef.current, storeName, 'readwrite', store => store.clear())
    }
    const prefix = `${dbName}_${storeName}_`
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(prefix)) keysToRemove.push(k)
    }
    keysToRemove.forEach(k => localStorage.removeItem(k))
  }, [dbName, storeName])

  return { get, set, remove, getAll, clear, isReady }
}
