import { useState, useCallback, useRef } from 'react'

/**
 * Hook for conflict resolution when multiple edits occur.
 * Tracks local vs remote versions and detects conflicts.
 *
 * @param {string} recordId - The record identifier
 * @param {Object} options - { autoResolve: 'local' | 'remote' | 'manual' }
 */
export function useConflictResolution(recordId, options = {}) {
  const { autoResolve = 'manual' } = options
  const [conflict, setConflict] = useState(null)
  const localVersionRef = useRef(0)
  const lastSavedRef = useRef(null)

  const checkForConflict = useCallback((localData, remoteData, remoteVersion) => {
    if (remoteVersion > localVersionRef.current && lastSavedRef.current) {
      // Remote has newer version
      const changes = detectChanges(lastSavedRef.current, localData, remoteData)

      if (changes.hasConflict) {
        if (autoResolve === 'local') {
          return { resolved: true, data: localData }
        }
        if (autoResolve === 'remote') {
          localVersionRef.current = remoteVersion
          lastSavedRef.current = remoteData
          return { resolved: true, data: remoteData }
        }

        setConflict({
          localData,
          remoteData,
          localVersion: localVersionRef.current,
          remoteVersion,
          conflictingFields: changes.conflictingFields,
          timestamp: new Date().toISOString(),
        })
        return { resolved: false, conflict: changes }
      }
    }
    return { resolved: true, data: localData }
  }, [autoResolve])

  const resolveConflict = useCallback((resolution) => {
    if (!conflict) return

    let resolved
    if (resolution === 'keepLocal') {
      resolved = conflict.localData
    } else if (resolution === 'keepRemote') {
      resolved = conflict.remoteData
      localVersionRef.current = conflict.remoteVersion
    } else if (resolution === 'merge') {
      // Merge: take remote as base, apply local non-conflicting changes
      resolved = { ...conflict.remoteData }
      for (const [key, value] of Object.entries(conflict.localData)) {
        if (!conflict.conflictingFields.includes(key)) {
          resolved[key] = value
        }
      }
    } else if (typeof resolution === 'object') {
      // Custom merge
      resolved = resolution
    }

    lastSavedRef.current = resolved
    localVersionRef.current = conflict.remoteVersion + 1
    setConflict(null)
    return resolved
  }, [conflict])

  const markSaved = useCallback((data, version) => {
    lastSavedRef.current = data
    localVersionRef.current = version || localVersionRef.current + 1
  }, [])

  return {
    conflict,
    hasConflict: conflict !== null,
    checkForConflict,
    resolveConflict,
    markSaved,
  }
}

function detectChanges(base, local, remote) {
  const allKeys = new Set([
    ...Object.keys(base || {}),
    ...Object.keys(local || {}),
    ...Object.keys(remote || {}),
  ])

  const localChanges = []
  const remoteChanges = []
  const conflictingFields = []

  for (const key of allKeys) {
    const baseVal = JSON.stringify(base?.[key])
    const localVal = JSON.stringify(local?.[key])
    const remoteVal = JSON.stringify(remote?.[key])

    const localChanged = localVal !== baseVal
    const remoteChanged = remoteVal !== baseVal

    if (localChanged) localChanges.push(key)
    if (remoteChanged) remoteChanges.push(key)

    if (localChanged && remoteChanged && localVal !== remoteVal) {
      conflictingFields.push(key)
    }
  }

  return {
    localChanges,
    remoteChanges,
    conflictingFields,
    hasConflict: conflictingFields.length > 0,
  }
}
