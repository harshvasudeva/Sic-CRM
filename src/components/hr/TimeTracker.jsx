import { useState, useEffect } from 'react'
import { Play, Square, Clock, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { useToast } from '../Toast'

function TimeTracker() {
    const [isExpanded, setIsExpanded] = useState(false)
    const [activeEntry, setActiveEntry] = useState(null)
    const [description, setDescription] = useState('')
    const [elapsed, setElapsed] = useState(0)
    const toast = useToast()

    const employeeId = 'emp-001'

    useEffect(() => {
        let interval
        if (activeEntry) {
            interval = setInterval(() => {
                const start = new Date(activeEntry.startTime).getTime()
                setElapsed(Math.floor((Date.now() - start) / 1000))
            }, 1000)
        } else {
            setElapsed(0)
        }
        return () => clearInterval(interval)
    }, [activeEntry])

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    const startTimer = async () => {
        if (!description) return toast.error('Please enter a description')
        try {
            const res = await fetch('http://localhost:5000/api/hr/time-entries/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId, description })
            })
            const data = await res.json()
            setActiveEntry(data)
            toast.success('Timer started')
        } catch (err) {
            console.error(err)
            toast.error('Failed to start timer')
        }
    }

    const stopTimer = async () => {
        if (!activeEntry) return
        try {
            await fetch('http://localhost:5000/api/hr/time-entries/stop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: activeEntry.id })
            })
            setActiveEntry(null)
            setDescription('')
            setElapsed(0)
            toast.success('Timer stopped')
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <motion.div
            className="time-tracker-widget"
            animate={{ width: isExpanded ? 320 : 48, height: isExpanded ? 'auto' : 48 }}
            style={{
                position: 'fixed',
                bottom: 84,
                right: 24,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 24,
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                zIndex: 100,
                overflow: 'hidden'
            }}
        >
            {!isExpanded ? (
                <button
                    onClick={() => setIsExpanded(true)}
                    style={{
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-primary)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    {activeEntry ? (
                        <div style={{
                            width: 10,
                            height: 10,
                            background: 'var(--error)',
                            borderRadius: '50%',
                            animation: 'pulse 1.5s infinite'
                        }} />
                    ) : (
                        <Clock size={20} />
                    )}
                </button>
            ) : (
                <div style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Clock size={16} />
                            <span style={{ fontWeight: 500 }}>Time Tracker</span>
                        </div>
                        <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                            <ChevronDown size={16} />
                        </button>
                    </div>

                    <div>
                        {activeEntry ? (
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', textAlign: 'center', margin: '8px 0' }}>
                                    {formatTime(elapsed)}
                                </div>
                                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 12, fontSize: '0.9rem' }}>
                                    {activeEntry.description}
                                </div>
                                <button
                                    onClick={stopTimer}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        padding: 8,
                                        background: 'rgba(239, 68, 68, 0.15)',
                                        color: 'var(--error)',
                                        borderRadius: 8,
                                        fontWeight: 500,
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Square size={16} fill="currentColor" /> Stop
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                    type="text"
                                    placeholder="What are you working on?"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    style={{
                                        flex: 1,
                                        background: 'var(--bg-tertiary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 8,
                                        padding: '8px 12px',
                                        fontSize: '0.9rem',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                                <button
                                    onClick={startTimer}
                                    disabled={!description}
                                    style={{
                                        width: 36,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'var(--accent-gradient)',
                                        color: 'white',
                                        borderRadius: 8,
                                        border: 'none',
                                        cursor: 'pointer',
                                        opacity: description ? 1 : 0.5
                                    }}
                                >
                                    <Play size={16} fill="currentColor" />
                                </button>
                            </div>
                        )}
                        <div style={{ marginTop: 12, textAlign: 'center', fontSize: '0.8rem' }}>
                            <a href="/hr/timesheets" style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, textDecoration: 'none' }}>
                                View Timesheet →
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    )
}

export default TimeTracker
