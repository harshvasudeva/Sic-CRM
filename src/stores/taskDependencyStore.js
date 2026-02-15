/**
 * Task Dependencies Store - manage task relationships (depends on, blocks, etc.)
 */

const STORAGE_KEY = 'sic_crm_task_deps'

const DEP_TYPES = [
  { value: 'blocks', label: 'Blocks', inverse: 'blockedBy' },
  { value: 'blockedBy', label: 'Blocked by', inverse: 'blocks' },
  { value: 'relatedTo', label: 'Related to', inverse: 'relatedTo' },
  { value: 'dependsOn', label: 'Depends on', inverse: 'requiredFor' },
  { value: 'requiredFor', label: 'Required for', inverse: 'dependsOn' },
]

function getStore() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function addDependency(sourceId, targetId, type = 'dependsOn') {
  const store = getStore()
  const existing = store.find(d => d.sourceId === sourceId && d.targetId === targetId && d.type === type)
  if (existing) return existing

  const dep = {
    id: `dep_${Date.now()}`,
    sourceId,
    targetId,
    type,
    createdAt: new Date().toISOString(),
  }
  store.push(dep)
  save(store)
  return dep
}

export function removeDependency(depId) {
  save(getStore().filter(d => d.id !== depId))
}

export function getTaskDependencies(taskId) {
  const store = getStore()
  return {
    outgoing: store.filter(d => d.sourceId === taskId),
    incoming: store.filter(d => d.targetId === taskId),
    all: store.filter(d => d.sourceId === taskId || d.targetId === taskId),
  }
}

export function getBlockers(taskId) {
  const store = getStore()
  return store.filter(d =>
    (d.targetId === taskId && d.type === 'blocks') ||
    (d.sourceId === taskId && d.type === 'blockedBy') ||
    (d.sourceId === taskId && d.type === 'dependsOn')
  )
}

export function canStartTask(taskId, allTasks) {
  const blockers = getBlockers(taskId)
  if (blockers.length === 0) return { canStart: true, blockers: [] }

  const unresolved = blockers.filter(b => {
    const blockingTaskId = b.sourceId === taskId ? b.targetId : b.sourceId
    const blockingTask = allTasks.find(t => t.id === blockingTaskId)
    return blockingTask && blockingTask.status !== 'completed' && blockingTask.status !== 'done'
  })

  return { canStart: unresolved.length === 0, blockers: unresolved }
}

export function detectCircularDependency(sourceId, targetId) {
  const store = getStore()
  const visited = new Set()

  function dfs(current) {
    if (current === sourceId) return true
    if (visited.has(current)) return false
    visited.add(current)

    const deps = store.filter(d => d.sourceId === current && (d.type === 'dependsOn' || d.type === 'blockedBy'))
    return deps.some(d => dfs(d.targetId))
  }

  return dfs(targetId)
}

export { DEP_TYPES }
