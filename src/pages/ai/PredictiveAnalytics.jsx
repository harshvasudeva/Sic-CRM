import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Target, Brain, Map, BarChart3, Lightbulb, Calculator, Users, AlertTriangle, Award, Gauge, Sliders } from 'lucide-react'
import { calculateWinProbability, getNextBestActions, getForecastConfidence, gradeICPMatch, analyzeTopicClusters, getCoachingInsights, analyzeTerritory, calculateAttribution, runWhatIfSimulation } from '../../stores/predictiveStore'
import { formatCurrency } from '../../stores/settingsStore'

export default function PredictiveAnalytics() {
  const [activeSection, setActiveSection] = useState('overview')
  const [nextActions, setNextActions] = useState([])
  const [forecast, setForecast] = useState(null)
  const [topicClusters, setTopicClusters] = useState([])
  const [coaching, setCoaching] = useState(null)
  const [territories, setTerritories] = useState([])
  const [attribution, setAttribution] = useState(null)
  const [whatIf, setWhatIf] = useState({ closeRateChange: 0, avgDealSizeChange: 0 })
  const [whatIfResult, setWhatIfResult] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [actions, fc, topics, coach, terr, attr] = await Promise.all([
      getNextBestActions('current'),
      getForecastConfidence('Q1'),
      Promise.resolve(analyzeTopicClusters()),
      Promise.resolve(getCoachingInsights('current')),
      Promise.resolve(analyzeTerritory()),
      Promise.resolve(calculateAttribution('u-shaped'))
    ])
    setNextActions(actions)
    setForecast(fc)
    setTopicClusters(topics)
    setCoaching(coach)
    setTerritories(terr)
    setAttribution(attr)
  }

  const handleWhatIf = () => {
    const result = runWhatIfSimulation(whatIf)
    setWhatIfResult(result)
  }

  const formatAmount = (v) => formatCurrency(v || 0)
  const formatPct = (v) => `${Math.round(v || 0)}%`

  const sections = [
    { id: 'overview', label: 'Overview', icon: Gauge },
    { id: 'actions', label: 'Next Best Action', icon: Target },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'coaching', label: 'Coaching', icon: Award },
    { id: 'territory', label: 'Territory', icon: Map },
    { id: 'whatif', label: 'What-If', icon: Calculator },
  ]

  return (
    <div className="predictive-page">
      <div className="page-header">
        <div>
          <h1>Predictive Analytics</h1>
          <p className="subtitle">Don't tell me what happened, tell me what to do</p>
        </div>
        <div className="header-badge"><Brain size={16} /> AI-Powered Insights</div>
      </div>

      <div className="section-tabs">
        {sections.map(s => (
          <motion.button key={s.id} className={`section-tab ${activeSection === s.id ? 'active' : ''}`} onClick={() => setActiveSection(s.id)} whileTap={{ scale: 0.95 }}>
            <s.icon size={16} /> {s.label}
          </motion.button>
        ))}
      </div>

      {activeSection === 'overview' && (
        <div className="overview-grid">
          <div className="stat-card gradient-1">
            <TrendingUp size={28} />
            <div className="stat-value">{formatAmount(forecast?.repForecast)}</div>
            <div className="stat-label">Rep Forecast</div>
          </div>
          <div className="stat-card gradient-2">
            <Brain size={28} />
            <div className="stat-value">{formatAmount(forecast?.aiAdjusted)}</div>
            <div className="stat-label">AI Adjusted</div>
          </div>
          <div className="stat-card gradient-3">
            <AlertTriangle size={28} />
            <div className="stat-value">{formatAmount(forecast?.optimismGap)}</div>
            <div className="stat-label">Optimism Gap</div>
          </div>
          <div className="stat-card gradient-4">
            <Target size={28} />
            <div className="stat-value">{nextActions.length}</div>
            <div className="stat-label">Actions Pending</div>
          </div>

          {topicClusters.length > 0 && (
            <div className="cluster-card span-2">
              <h3><BarChart3 size={18} /> Lost Deal Analysis</h3>
              <div className="clusters">
                {topicClusters.map((c, i) => (
                  <div key={i} className="cluster-row">
                    <span className="cluster-topic">{c.topic}</span>
                    <div className="cluster-bar-bg">
                      <motion.div className="cluster-bar" initial={{ width: 0 }} animate={{ width: `${c.percentage}%` }} transition={{ delay: i * 0.1, duration: 0.5 }} />
                    </div>
                    <span className="cluster-pct">{c.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {attribution && (
            <div className="cluster-card span-2">
              <h3><Lightbulb size={18} /> Attribution ({attribution.model})</h3>
              <div className="clusters">
                {(attribution.sources || []).map((s, i) => (
                  <div key={i} className="cluster-row">
                    <span className="cluster-topic">{s.source}</span>
                    <span className="cluster-pct">{s.leads} leads / {formatAmount(s.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeSection === 'actions' && (
        <div className="actions-list">
          <h2>Next Best Actions</h2>
          {nextActions.length === 0 && <p className="empty-msg">No actions pending. Great job!</p>}
          {nextActions.map((a, i) => (
            <motion.div key={i} className="action-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <div className={`action-priority ${a.priority}`}>{a.priority}</div>
              <div className="action-body">
                <div className="action-type">{a.type === 'call' ? 'Call' : a.type === 'follow_up' ? 'Follow Up' : a.type}</div>
                <div className="action-target">{a.target}</div>
                <div className="action-reason">{a.reason}</div>
              </div>
              <motion.button className="action-do-btn" whileTap={{ scale: 0.9 }}>Do It</motion.button>
            </motion.div>
          ))}
        </div>
      )}

      {activeSection === 'forecast' && forecast && (
        <div className="forecast-section">
          <h2>Forecast Confidence</h2>
          <div className="forecast-visual">
            <div className="forecast-bar-container">
              <div className="forecast-label">Rep says</div>
              <div className="forecast-bar-bg"><motion.div className="forecast-bar rep" initial={{ width: 0 }} animate={{ width: '100%' }} /></div>
              <div className="forecast-amount">{formatCurrency(forecast.repForecast)}</div>
            </div>
            <div className="forecast-bar-container">
              <div className="forecast-label">AI says</div>
              <div className="forecast-bar-bg"><motion.div className="forecast-bar ai" initial={{ width: 0 }} animate={{ width: `${forecast.repForecast ? (forecast.aiAdjusted / forecast.repForecast) * 100 : 0}%` }} /></div>
              <div className="forecast-amount">{formatCurrency(forecast.aiAdjusted)}</div>
            </div>
          </div>
          <div className="gap-indicator">
            <AlertTriangle size={16} /> Optimism gap: {formatCurrency(forecast.optimismGap)}
          </div>
        </div>
      )}

      {activeSection === 'coaching' && coaching && (
        <div className="coaching-section">
          <h2><Award size={20} /> Performance Coaching</h2>
          <div className="coaching-grid">
            {Object.entries(coaching).filter(([k]) => k !== 'repId').map(([key, metric], i) => (
              <motion.div key={key} className="coaching-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="coaching-title">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</div>
                <div className="coaching-values">
                  <span className="your-value">{metric.value}{metric.unit === 'hours' ? 'h' : metric.unit === 'days' ? 'd' : '%'}</span>
                  <span className="vs">vs</span>
                  <span className="benchmark-value">{metric.benchmark}{metric.unit === 'hours' ? 'h' : metric.unit === 'days' ? 'd' : '%'}</span>
                </div>
                <div className={`coaching-indicator ${metric.value <= metric.benchmark ? 'good' : 'needs-work'}`}>
                  {metric.value <= metric.benchmark ? 'On track' : 'Needs improvement'}
                </div>
                <p className="coaching-tip">{metric.tip}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'territory' && (
        <div className="territory-section">
          <h2><Map size={20} /> Territory White Space</h2>
          <div className="territory-grid">
            {territories.map((t, i) => (
              <div key={i} className={`territory-card ${t.isWhiteSpace ? 'white-space' : ''}`}>
                <div className="territory-name">{t.region}</div>
                <div className="territory-stats">
                  <span>{t.contacts} contacts</span>
                  <span>{t.deals} deals</span>
                  <span>{formatCurrency(t.revenue)}</span>
                </div>
                {t.isWhiteSpace && <div className="white-space-badge">White Space - Opportunity!</div>}
              </div>
            ))}
            {territories.length === 0 && <p className="empty-msg">Add location data to contacts to see territory analysis.</p>}
          </div>
        </div>
      )}

      {activeSection === 'whatif' && (
        <div className="whatif-section">
          <h2><Calculator size={20} /> What-If Simulator</h2>
          <div className="whatif-controls">
            <label>
              Close Rate Change (%)
              <input type="range" min="-20" max="20" value={whatIf.closeRateChange} onChange={(e) => setWhatIf(prev => ({ ...prev, closeRateChange: parseInt(e.target.value) }))} />
              <span className="slider-value">{whatIf.closeRateChange > 0 ? '+' : ''}{whatIf.closeRateChange}%</span>
            </label>
            <label>
              Avg Deal Size Change (%)
              <input type="range" min="-30" max="30" value={whatIf.avgDealSizeChange} onChange={(e) => setWhatIf(prev => ({ ...prev, avgDealSizeChange: parseInt(e.target.value) }))} />
              <span className="slider-value">{whatIf.avgDealSizeChange > 0 ? '+' : ''}{whatIf.avgDealSizeChange}%</span>
            </label>
            <motion.button className="simulate-btn" onClick={handleWhatIf} whileTap={{ scale: 0.95 }}>
              <Sliders size={16} /> Simulate
            </motion.button>
          </div>
          {whatIfResult && (
            <motion.div className="whatif-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="whatif-comparison">
                <div className="whatif-card current">
                  <h4>Current</h4>
                  <div className="whatif-value">{formatCurrency(whatIfResult.current.revenue)}</div>
                  <div className="whatif-detail">Close rate: {formatPct(whatIfResult.current.closeRate * 100)}</div>
                </div>
                <div className="whatif-arrow">&rarr;</div>
                <div className="whatif-card projected">
                  <h4>Projected</h4>
                  <div className="whatif-value">{formatCurrency(whatIfResult.projected.revenue)}</div>
                  <div className="whatif-detail">Close rate: {formatPct(whatIfResult.projected.closeRate * 100)}</div>
                </div>
              </div>
              <div className={`impact-badge ${whatIfResult.impact.revenueChange >= 0 ? 'positive' : 'negative'}`}>
                Impact: {whatIfResult.impact.revenueChange >= 0 ? '+' : ''}{formatCurrency(whatIfResult.impact.revenueChange)} ({formatPct(whatIfResult.impact.percentChange)})
              </div>
            </motion.div>
          )}
        </div>
      )}

      <style>{`
        .predictive-page { padding: 0; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .page-header h1 { font-size: 1.8rem; font-weight: 700; color: var(--text-primary); margin: 0; }
        .subtitle { color: var(--text-muted); margin-top: 4px; font-size: 0.9rem; }
        .header-badge { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2)); border-radius: 20px; color: var(--accent-primary); font-size: 0.85rem; }
        .section-tabs { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
        .section-tab { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px; background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.85rem; cursor: pointer; }
        .section-tab.active { background: rgba(99,102,241,0.15); border-color: var(--accent-primary); color: var(--accent-primary); }
        .overview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
        .stat-card { padding: 24px; border-radius: 16px; color: white; }
        .stat-card .stat-value { font-size: 1.8rem; font-weight: 700; margin: 12px 0 4px; }
        .stat-card .stat-label { font-size: 0.85rem; opacity: 0.8; }
        .gradient-1 { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
        .gradient-2 { background: linear-gradient(135deg, #06b6d4, #0891b2); }
        .gradient-3 { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .gradient-4 { background: linear-gradient(135deg, #10b981, #059669); }
        .span-2 { grid-column: span 2; }
        @media (max-width: 700px) { .span-2 { grid-column: span 1; } }
        .cluster-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px; padding: 20px; }
        .cluster-card h3 { display: flex; align-items: center; gap: 8px; margin: 0 0 16px; color: var(--text-primary); font-size: 1rem; }
        .clusters { display: flex; flex-direction: column; gap: 10px; }
        .cluster-row { display: flex; align-items: center; gap: 12px; }
        .cluster-topic { min-width: 80px; color: var(--text-secondary); font-size: 0.85rem; }
        .cluster-bar-bg { flex: 1; height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden; }
        .cluster-bar { height: 100%; background: var(--accent-gradient); border-radius: 4px; }
        .cluster-pct { min-width: 50px; text-align: right; color: var(--text-primary); font-weight: 600; font-size: 0.85rem; }
        .empty-msg { color: var(--text-muted); text-align: center; padding: 40px; }
        .actions-list h2 { color: var(--text-primary); margin-bottom: 16px; }
        .action-card { display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 14px; margin-bottom: 10px; }
        .action-priority { padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
        .action-priority.high { background: #ef444420; color: #ef4444; }
        .action-priority.medium { background: #f59e0b20; color: #f59e0b; }
        .action-priority.low { background: #10b98120; color: #10b981; }
        .action-body { flex: 1; }
        .action-type { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
        .action-target { font-size: 1rem; color: var(--text-primary); font-weight: 600; }
        .action-reason { font-size: 0.85rem; color: var(--text-secondary); }
        .action-do-btn { padding: 8px 20px; background: var(--accent-gradient); border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer; font-size: 0.85rem; }
        .forecast-section h2, .coaching-section h2, .territory-section h2, .whatif-section h2 { display: flex; align-items: center; gap: 8px; color: var(--text-primary); margin-bottom: 20px; }
        .forecast-visual { display: flex; flex-direction: column; gap: 16px; }
        .forecast-bar-container { display: flex; align-items: center; gap: 12px; }
        .forecast-label { min-width: 70px; font-size: 0.85rem; color: var(--text-muted); }
        .forecast-bar-bg { flex: 1; height: 28px; background: var(--bg-tertiary); border-radius: 8px; overflow: hidden; }
        .forecast-bar { height: 100%; border-radius: 8px; }
        .forecast-bar.rep { background: linear-gradient(90deg, #6366f1, #8b5cf6); }
        .forecast-bar.ai { background: linear-gradient(90deg, #06b6d4, #0891b2); }
        .forecast-amount { min-width: 100px; text-align: right; font-weight: 700; color: var(--text-primary); }
        .gap-indicator { display: flex; align-items: center; gap: 8px; margin-top: 16px; padding: 12px 16px; background: #f59e0b15; border-radius: 10px; color: #f59e0b; font-weight: 500; }
        .coaching-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .coaching-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px; padding: 20px; }
        .coaching-title { font-size: 0.9rem; color: var(--text-primary); font-weight: 600; margin-bottom: 12px; }
        .coaching-values { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
        .your-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
        .vs { color: var(--text-muted); font-size: 0.8rem; }
        .benchmark-value { font-size: 1.2rem; color: var(--text-muted); }
        .coaching-indicator { padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; display: inline-block; margin-bottom: 8px; }
        .coaching-indicator.good { background: #10b98120; color: #10b981; }
        .coaching-indicator.needs-work { background: #f59e0b20; color: #f59e0b; }
        .coaching-tip { font-size: 0.85rem; color: var(--text-secondary); margin: 0; line-height: 1.4; }
        .territory-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
        .territory-card { padding: 16px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; }
        .territory-card.white-space { border-color: #22c55e; background: rgba(34,197,94,0.05); }
        .territory-name { font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
        .territory-stats { display: flex; gap: 12px; font-size: 0.8rem; color: var(--text-muted); }
        .white-space-badge { margin-top: 8px; padding: 4px 10px; background: #22c55e20; color: #22c55e; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
        .whatif-controls { display: flex; flex-direction: column; gap: 16px; max-width: 500px; }
        .whatif-controls label { display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; color: var(--text-secondary); }
        .whatif-controls input[type="range"] { width: 100%; accent-color: var(--accent-primary); }
        .slider-value { font-weight: 700; color: var(--text-primary); }
        .simulate-btn { display: flex; align-items: center; gap: 8px; padding: 12px 24px; background: var(--accent-gradient); border: none; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; align-self: flex-start; }
        .whatif-results { margin-top: 24px; }
        .whatif-comparison { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .whatif-card { padding: 20px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 14px; min-width: 180px; }
        .whatif-card h4 { margin: 0 0 8px; color: var(--text-muted); font-size: 0.85rem; }
        .whatif-card .whatif-value { font-size: 1.6rem; font-weight: 700; color: var(--text-primary); }
        .whatif-card .whatif-detail { font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; }
        .whatif-card.projected { border-color: var(--accent-primary); }
        .whatif-arrow { font-size: 1.5rem; color: var(--text-muted); }
        .impact-badge { margin-top: 16px; padding: 12px 20px; border-radius: 12px; font-weight: 600; font-size: 1rem; }
        .impact-badge.positive { background: #10b98120; color: #10b981; }
        .impact-badge.negative { background: #ef444420; color: #ef4444; }
      `}</style>
    </div>
  )
}