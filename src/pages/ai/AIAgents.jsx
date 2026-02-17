import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Zap, Mail, Users, TrendingDown, Shield, Calendar, Coffee, Trash2, Star, Settings, Play, Pause, Bell, ChevronRight, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { runNudgeAgent, generateMeetingPrep, findLookalikeCompanies, runChurnDetection, checkCompetitorMentions, findMeetingSlot, setOutOfOffice, generatePostCallTasks, runPipelineSanitation, scanForReviews, getAgentTasks, getAgentConfig, updateAgentConfig, dismissAgentTask } from '../../stores/agentStore'

const AGENTS = [
  { id: 'nudge', name: 'Nudge Agent', icon: Mail, description: 'Monitors stalled deals and drafts follow-up emails', color: '#6366f1' },
  { id: 'meeting-prep', name: 'Meeting Prep', icon: Coffee, description: 'Generates cheat sheets before calls', color: '#8b5cf6' },
  { id: 'lookalike', name: 'Lookalike Finder', icon: Users, description: 'Finds companies similar to your best clients', color: '#06b6d4' },
  { id: 'churn', name: 'Churn Prevention', icon: TrendingDown, description: 'Alerts when usage drops or churn signals appear', color: '#ef4444' },
  { id: 'competitor', name: 'Competitor Watchdog', icon: Shield, description: 'Auto-posts kill sheets when competitors are mentioned', color: '#f59e0b' },
  { id: 'scheduler', name: 'Scheduling Agent', icon: Calendar, description: 'Finds meeting slots across multiple calendars', color: '#10b981' },
  { id: 'ooo', name: 'OOO Handler', icon: Clock, description: 'Auto-assigns leads when reps are on leave', color: '#64748b' },
  { id: 'post-call', name: 'Post-Call Cleanup', icon: CheckCircle, description: 'Extracts action items from meeting notes', color: '#22c55e' },
  { id: 'pipeline', name: 'Pipeline Sanitation', icon: Trash2, description: 'Monthly cleanup of stale deals', color: '#f43f5e' },
  { id: 'reviews', name: 'Review Miner', icon: Star, description: 'Scans G2/Capterra for client reviews', color: '#eab308' },
]

export default function AIAgents() {
  const [activeAgent, setActiveAgent] = useState(null)
  const [agentResults, setAgentResults] = useState({})
  const [tasks, setTasks] = useState(getAgentTasks())
  const [config, setConfig] = useState(getAgentConfig())
  const [running, setRunning] = useState({})
  const [showConfig, setShowConfig] = useState(false)

  const runAgent = async (agentId) => {
    setRunning(prev => ({ ...prev, [agentId]: true }))
    let result
    switch (agentId) {
      case 'nudge': result = await runNudgeAgent(); break
      case 'meeting-prep': result = await generateMeetingPrep('demo', new Date().toISOString()); break
      case 'lookalike': result = await findLookalikeCompanies('demo'); break
      case 'churn': result = await runChurnDetection(); break
      case 'competitor': result = await checkCompetitorMentions('demo'); break
      case 'scheduler': result = await findMeetingSlot(['user1', 'user2']); break
      case 'ooo': result = await setOutOfOffice('user1', new Date().toISOString(), new Date(Date.now() + 7 * 86400000).toISOString(), 'user2'); break
      case 'post-call': result = await generatePostCallTasks('meeting1', 'Will send the proposal by Friday. Need to schedule a demo with their tech team.'); break
      case 'pipeline': result = await runPipelineSanitation(); break
      case 'reviews': result = await scanForReviews(); break
    }
    setAgentResults(prev => ({ ...prev, [agentId]: result }))
    setTasks(getAgentTasks())
    setRunning(prev => ({ ...prev, [agentId]: false }))
  }

  const handleConfigChange = (key, value) => {
    const updated = { ...config, [key]: value }
    setConfig(updated)
    updateAgentConfig(updated)
  }

  return (
    <div className="agents-page">
      <div className="page-header">
        <div>
          <h1>AI Agents</h1>
          <p className="subtitle">Autonomous agents that do the work, not just assist</p>
        </div>
        <div className="header-actions">
          <motion.button className="config-btn" onClick={() => setShowConfig(!showConfig)} whileTap={{ scale: 0.95 }}>
            <Settings size={18} /> Configure
          </motion.button>
          <div className="task-count">
            <Bell size={16} />
            <span>{tasks.length} pending tasks</span>
          </div>
        </div>
      </div>

      {showConfig && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="config-panel">
          <h3>Agent Configuration</h3>
          <div className="config-grid">
            <label>Stalled Deal Threshold (days)<input type="number" value={config.stalledDays} onChange={(e) => handleConfigChange('stalledDays', parseInt(e.target.value))} /></label>
            <label>Churn Detection Threshold (%)<input type="number" value={config.churnThreshold} onChange={(e) => handleConfigChange('churnThreshold', parseInt(e.target.value))} /></label>
            <label>Pipeline Cleanup (days)<input type="number" value={config.pipelineCleanupDays} onChange={(e) => handleConfigChange('pipelineCleanupDays', parseInt(e.target.value))} /></label>
            <label className="checkbox-label"><input type="checkbox" checked={config.autoAssign} onChange={(e) => handleConfigChange('autoAssign', e.target.checked)} /> Auto-assign leads on OOO</label>
          </div>
        </motion.div>
      )}

      <div className="agents-grid">
        {AGENTS.map((agent, i) => (
          <motion.div
            key={agent.id}
            className={`agent-card ${activeAgent === agent.id ? 'active' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setActiveAgent(activeAgent === agent.id ? null : agent.id)}
          >
            <div className="agent-header">
              <div className="agent-icon" style={{ background: `${agent.color}20`, color: agent.color }}>
                <agent.icon size={22} />
              </div>
              <div className="agent-info">
                <h3>{agent.name}</h3>
                <p>{agent.description}</p>
              </div>
              <motion.button
                className="run-btn"
                onClick={(e) => { e.stopPropagation(); runAgent(agent.id) }}
                disabled={running[agent.id]}
                whileTap={{ scale: 0.9 }}
              >
                {running[agent.id] ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}><Zap size={16} /></motion.div> : <Play size={16} />}
              </motion.button>
            </div>

            <AnimatePresence>
              {activeAgent === agent.id && agentResults[agent.id] && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="agent-results">
                  <pre className="result-json">{JSON.stringify(agentResults[agent.id], null, 2)}</pre>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {tasks.length > 0 && (
        <div className="tasks-section">
          <h2><Bell size={20} /> Agent Tasks</h2>
          <div className="tasks-list">
            {tasks.slice(0, 10).map((task) => (
              <motion.div key={task.id} className="task-item" layout>
                <div className="task-type" style={{ background: task.type === 'nudge' ? '#6366f120' : '#10b98120', color: task.type === 'nudge' ? '#6366f1' : '#10b981' }}>
                  {task.type}
                </div>
                <div className="task-info">
                  <span className="task-name">{task.dealName || task.type}</span>
                  {task.draftEmail && <p className="task-preview">{task.draftEmail.slice(0, 80)}...</p>}
                </div>
                <button className="dismiss-task" onClick={() => { dismissAgentTask(task.id); setTasks(getAgentTasks()) }}>
                  <CheckCircle size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .agents-page { padding: 0; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .page-header h1 { font-size: 1.8rem; font-weight: 700; color: var(--text-primary); margin: 0; }
        .subtitle { color: var(--text-muted); margin-top: 4px; font-size: 0.9rem; }
        .header-actions { display: flex; gap: 12px; align-items: center; }
        .config-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 10px; color: var(--text-secondary); cursor: pointer; font-size: 0.85rem; }
        .task-count { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: rgba(99,102,241,0.15); border-radius: 20px; color: var(--accent-primary); font-size: 0.85rem; }
        .config-panel { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px; padding: 20px; margin-bottom: 24px; }
        .config-panel h3 { margin: 0 0 16px; color: var(--text-primary); }
        .config-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
        .config-grid label { display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem; color: var(--text-muted); }
        .config-grid input[type="number"] { padding: 8px 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); }
        .checkbox-label { flex-direction: row !important; align-items: center; }
        .checkbox-label input { width: auto; }
        .agents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .agent-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px; padding: 20px; cursor: pointer; transition: all 0.2s; }
        .agent-card:hover { border-color: var(--accent-primary); }
        .agent-card.active { border-color: var(--accent-primary); background: rgba(99,102,241,0.05); }
        .agent-header { display: flex; align-items: center; gap: 14px; }
        .agent-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .agent-info { flex: 1; }
        .agent-info h3 { margin: 0; font-size: 0.95rem; color: var(--text-primary); }
        .agent-info p { margin: 2px 0 0; font-size: 0.8rem; color: var(--text-muted); }
        .run-btn { width: 36px; height: 36px; border-radius: 50%; background: var(--accent-gradient); border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .run-btn:disabled { opacity: 0.6; }
        .agent-results { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color); overflow: hidden; }
        .result-json { font-size: 0.75rem; color: var(--text-secondary); background: var(--bg-tertiary); padding: 12px; border-radius: 8px; overflow-x: auto; white-space: pre-wrap; word-break: break-all; max-height: 200px; overflow-y: auto; }
        .tasks-section { margin-top: 8px; }
        .tasks-section h2 { display: flex; align-items: center; gap: 8px; font-size: 1.2rem; color: var(--text-primary); margin-bottom: 16px; }
        .tasks-list { display: flex; flex-direction: column; gap: 8px; }
        .task-item { display: flex; align-items: center; gap: 12px; padding: 14px 18px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; }
        .task-type { padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
        .task-info { flex: 1; }
        .task-name { color: var(--text-primary); font-size: 0.9rem; font-weight: 500; }
        .task-preview { color: var(--text-muted); font-size: 0.8rem; margin: 2px 0 0; }
        .dismiss-task { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; }
        .dismiss-task:hover { color: #22c55e; }
      `}</style>
    </div>
  )
}