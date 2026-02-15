import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, Server, Database, Wifi, WifiOff, Clock,
  HardDrive, CheckCircle, AlertTriangle, XCircle, RefreshCw
} from 'lucide-react'

function HealthCheck() {
  const [checks, setChecks] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastCheck, setLastCheck] = useState(null)

  const runChecks = async () => {
    setLoading(true)
    const results = []

    // 1. API Server
    try {
      const start = performance.now()
      const res = await fetch('http://localhost:5000/api/health', { signal: AbortSignal.timeout(5000) })
      const latency = Math.round(performance.now() - start)
      results.push({
        name: 'API Server',
        icon: Server,
        status: res.ok ? 'healthy' : 'degraded',
        message: res.ok ? `Responding (${latency}ms)` : `Status ${res.status}`,
        latency,
      })
    } catch {
      results.push({
        name: 'API Server',
        icon: Server,
        status: 'down',
        message: 'Not reachable',
      })
    }

    // 2. Database (via API)
    try {
      const start = performance.now()
      const res = await fetch('http://localhost:5000/api/health/db', { signal: AbortSignal.timeout(5000) })
      const latency = Math.round(performance.now() - start)
      results.push({
        name: 'Database',
        icon: Database,
        status: res.ok ? 'healthy' : 'degraded',
        message: res.ok ? `Connected (${latency}ms)` : 'Connection issues',
        latency,
      })
    } catch {
      results.push({
        name: 'Database',
        icon: Database,
        status: 'unknown',
        message: 'Cannot verify (API down)',
      })
    }

    // 3. Network
    results.push({
      name: 'Network',
      icon: navigator.onLine ? Wifi : WifiOff,
      status: navigator.onLine ? 'healthy' : 'down',
      message: navigator.onLine ? 'Connected' : 'Offline',
    })

    // 4. Local Storage
    try {
      const testKey = '__health_check__'
      localStorage.setItem(testKey, '1')
      localStorage.removeItem(testKey)
      const used = JSON.stringify(localStorage).length
      const usedMB = (used / 1024 / 1024).toFixed(1)
      results.push({
        name: 'Local Storage',
        icon: HardDrive,
        status: used > 4 * 1024 * 1024 ? 'degraded' : 'healthy',
        message: `${usedMB} MB used`,
      })
    } catch {
      results.push({
        name: 'Local Storage',
        icon: HardDrive,
        status: 'degraded',
        message: 'Storage full or unavailable',
      })
    }

    // 5. Service Worker
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration().catch(() => null)
      results.push({
        name: 'Service Worker',
        icon: Activity,
        status: reg?.active ? 'healthy' : 'degraded',
        message: reg?.active ? 'Active' : 'Not installed',
      })
    }

    // 6. Memory (if available)
    if (performance.memory) {
      const mem = performance.memory
      const usedMB = Math.round(mem.usedJSHeapSize / 1024 / 1024)
      const totalMB = Math.round(mem.jsHeapSizeLimit / 1024 / 1024)
      const pct = Math.round((mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100)
      results.push({
        name: 'Memory',
        icon: Activity,
        status: pct > 80 ? 'degraded' : 'healthy',
        message: `${usedMB}MB / ${totalMB}MB (${pct}%)`,
      })
    }

    setChecks(results)
    setLastCheck(new Date())
    setLoading(false)
  }

  useEffect(() => {
    runChecks()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return '#10b981'
      case 'degraded': return '#f59e0b'
      case 'down': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return CheckCircle
      case 'degraded': return AlertTriangle
      case 'down': return XCircle
      default: return AlertTriangle
    }
  }

  const overallStatus = checks.some(c => c.status === 'down') ? 'down'
    : checks.some(c => c.status === 'degraded') ? 'degraded' : 'healthy'

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} />
            System Health
          </h3>
          {lastCheck && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <Clock size={12} />
              Last check: {lastCheck.toLocaleTimeString()}
            </span>
          )}
        </div>
        <button
          onClick={runChecks}
          disabled={loading}
          style={{
            padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem',
            background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          {loading ? 'Checking...' : 'Re-check'}
        </button>
      </div>

      {/* Overall status */}
      <div style={{
        padding: '14px 18px', borderRadius: '12px', marginBottom: '16px',
        background: getStatusColor(overallStatus) + '15',
        border: `1px solid ${getStatusColor(overallStatus)}30`,
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: getStatusColor(overallStatus),
          boxShadow: `0 0 8px ${getStatusColor(overallStatus)}60`,
        }} />
        <span style={{ fontWeight: 600, color: getStatusColor(overallStatus), fontSize: '0.9rem' }}>
          {overallStatus === 'healthy' ? 'All Systems Operational' :
           overallStatus === 'degraded' ? 'Some Services Degraded' : 'Service Disruption'}
        </span>
      </div>

      {/* Individual checks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {checks.map((check, idx) => {
          const StatusIcon = getStatusIcon(check.status)
          return (
            <motion.div
              key={check.name}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '10px',
                background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              }}
            >
              <check.icon size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <span style={{ flex: 1, fontWeight: 500, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {check.name}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {check.message}
              </span>
              <StatusIcon size={16} style={{ color: getStatusColor(check.status), flexShrink: 0 }} />
            </motion.div>
          )
        })}
      </div>

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default HealthCheck
