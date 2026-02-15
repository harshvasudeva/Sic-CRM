/**
 * Quote Versioning Store - track and manage quote revisions.
 * Each quote can have multiple versions with change history.
 */

const STORAGE_KEY = 'sic_crm_quote_versions'

function getStore() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/**
 * Create a new version of a quote.
 */
export function createVersion(quoteId, quoteData, changeNote = '') {
  const store = getStore()
  if (!store[quoteId]) {
    store[quoteId] = { versions: [], currentVersion: 0 }
  }

  const versionNum = store[quoteId].versions.length + 1
  const version = {
    id: `v_${Date.now()}`,
    version: versionNum,
    data: { ...quoteData },
    changeNote,
    createdAt: new Date().toISOString(),
    status: 'draft',
  }

  store[quoteId].versions.push(version)
  store[quoteId].currentVersion = versionNum
  save(store)
  return version
}

/**
 * Get all versions of a quote.
 */
export function getVersions(quoteId) {
  const store = getStore()
  return store[quoteId]?.versions || []
}

/**
 * Get a specific version.
 */
export function getVersion(quoteId, versionNum) {
  const versions = getVersions(quoteId)
  return versions.find(v => v.version === versionNum)
}

/**
 * Get the current (latest) version.
 */
export function getCurrentVersion(quoteId) {
  const store = getStore()
  const entry = store[quoteId]
  if (!entry) return null
  return entry.versions[entry.versions.length - 1]
}

/**
 * Compare two versions and return the differences.
 */
export function compareVersions(quoteId, v1Num, v2Num) {
  const v1 = getVersion(quoteId, v1Num)
  const v2 = getVersion(quoteId, v2Num)
  if (!v1 || !v2) return null

  const changes = []
  const allKeys = new Set([...Object.keys(v1.data), ...Object.keys(v2.data)])

  for (const key of allKeys) {
    const old = JSON.stringify(v1.data[key])
    const curr = JSON.stringify(v2.data[key])
    if (old !== curr) {
      changes.push({
        field: key,
        oldValue: v1.data[key],
        newValue: v2.data[key],
      })
    }
  }

  return {
    from: v1Num,
    to: v2Num,
    changes,
    changedFields: changes.length,
  }
}

/**
 * Mark a version as sent to customer.
 */
export function markVersionSent(quoteId, versionNum) {
  const store = getStore()
  const entry = store[quoteId]
  if (!entry) return

  const version = entry.versions.find(v => v.version === versionNum)
  if (version) {
    version.status = 'sent'
    version.sentAt = new Date().toISOString()
    save(store)
  }
}

/**
 * Mark a version as accepted.
 */
export function markVersionAccepted(quoteId, versionNum) {
  const store = getStore()
  const entry = store[quoteId]
  if (!entry) return

  const version = entry.versions.find(v => v.version === versionNum)
  if (version) {
    version.status = 'accepted'
    version.acceptedAt = new Date().toISOString()
    save(store)
  }
}

/**
 * Restore a previous version as the current one.
 */
export function restoreVersion(quoteId, versionNum) {
  const version = getVersion(quoteId, versionNum)
  if (!version) return null
  return createVersion(quoteId, version.data, `Restored from version ${versionNum}`)
}
