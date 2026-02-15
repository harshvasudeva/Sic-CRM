import { useState, useCallback } from 'react'
import { motion, Reorder } from 'framer-motion'
import { Plus, Trash2, GripVertical, Palette, Save, RotateCcw, Settings } from 'lucide-react'

const DEFAULT_STAGES = [
  { id: 's1', name: 'New Lead', color: '#6366f1', probability: 10 },
  { id: 's2', name: 'Contacted', color: '#3b82f6', probability: 20 },
  { id: 's3', name: 'Qualified', color: '#06b6d4', probability: 40 },
  { id: 's4', name: 'Proposal', color: '#f59e0b', probability: 60 },
  { id: 's5', name: 'Negotiation', color: '#f97316', probability: 80 },
  { id: 's6', name: 'Won', color: '#10b981', probability: 100 },
  { id: 's7', name: 'Lost', color: '#ef4444', probability: 0 },
]

const STAGE_COLORS = [
  '#6366f1', '#3b82f6', '#06b6d4', '#14b8a6', '#10b981',
  '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444',
  '#ec4899', '#a855f7', '#6b7280',
]

const STORAGE_KEY = 'sic-pipeline-config'

function loadPipelines() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
    return [{ id: 'default', name: 'Sales Pipeline', stages: DEFAULT_STAGES, isDefault: true }]
  } catch {
    return [{ id: 'default', name: 'Sales Pipeline', stages: DEFAULT_STAGES, isDefault: true }]
  }
}

function savePipelines(pipelines) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pipelines))
}

export function getPipelineStages(pipelineId = 'default') {
  const pipelines = loadPipelines()
  const pipeline = pipelines.find(p => p.id === pipelineId)
  return pipeline?.stages || DEFAULT_STAGES
}

export function getAllPipelines() {
  return loadPipelines()
}

function PipelineBuilder({ onSave, onClose }) {
  const [pipelines, setPipelines] = useState(loadPipelines)
  const [activePipeline, setActivePipeline] = useState(0)
  const [editingStage, setEditingStage] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)

  const pipeline = pipelines[activePipeline]

  const updateStages = useCallback((newStages) => {
    setPipelines(prev => {
      const updated = [...prev]
      updated[activePipeline] = { ...updated[activePipeline], stages: newStages }
      return updated
    })
    setHasChanges(true)
  }, [activePipeline])

  const addStage = () => {
    const newStage = {
      id: `s_${Date.now()}`,
      name: 'New Stage',
      color: STAGE_COLORS[pipeline.stages.length % STAGE_COLORS.length],
      probability: 50,
    }
    updateStages([...pipeline.stages, newStage])
    setEditingStage(newStage.id)
  }

  const removeStage = (id) => {
    updateStages(pipeline.stages.filter(s => s.id !== id))
  }

  const updateStage = (id, updates) => {
    updateStages(pipeline.stages.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const addPipeline = () => {
    const newPipeline = {
      id: `pipeline_${Date.now()}`,
      name: 'New Pipeline',
      stages: [
        { id: `s_${Date.now()}_1`, name: 'Stage 1', color: '#6366f1', probability: 25 },
        { id: `s_${Date.now()}_2`, name: 'Stage 2', color: '#3b82f6', probability: 50 },
        { id: `s_${Date.now()}_3`, name: 'Won', color: '#10b981', probability: 100 },
        { id: `s_${Date.now()}_4`, name: 'Lost', color: '#ef4444', probability: 0 },
      ],
    }
    setPipelines(prev => [...prev, newPipeline])
    setActivePipeline(pipelines.length)
    setHasChanges(true)
  }

  const handleSave = () => {
    savePipelines(pipelines)
    setHasChanges(false)
    onSave?.(pipelines)
  }

  const handleReset = () => {
    const restored = loadPipelines()
    setPipelines(restored)
    setHasChanges(false)
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
          <Settings size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          Pipeline Builder
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {hasChanges && (
            <button
              onClick={handleReset}
              style={{
                padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem',
                background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              <RotateCcw size={14} /> Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            style={{
              padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem',
              background: hasChanges ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              border: 'none', color: hasChanges ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600,
            }}
          >
            <Save size={14} /> Save Pipeline
          </button>
        </div>
      </div>

      {/* Pipeline tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {pipelines.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => setActivePipeline(idx)}
            style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500,
              background: idx === activePipeline ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: idx === activePipeline ? 'white' : 'var(--text-secondary)',
              border: idx === activePipeline ? 'none' : '1px solid var(--border-color)',
            }}
          >
            {p.name}
          </button>
        ))}
        <button
          onClick={addPipeline}
          style={{
            padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem',
            background: 'transparent', border: '1px dashed var(--border-color)',
            color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px',
          }}
        >
          <Plus size={14} /> New Pipeline
        </button>
      </div>

      {/* Pipeline name */}
      <input
        value={pipeline.name}
        onChange={e => {
          setPipelines(prev => {
            const updated = [...prev]
            updated[activePipeline] = { ...updated[activePipeline], name: e.target.value }
            return updated
          })
          setHasChanges(true)
        }}
        style={{
          width: '100%', padding: '10px 14px', marginBottom: '16px',
          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
          borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.9rem',
        }}
        placeholder="Pipeline name..."
      />

      {/* Visual pipeline preview */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '20px', overflowX: 'auto', padding: '12px 0',
      }}>
        {pipeline.stages.map((stage, idx) => (
          <div
            key={stage.id}
            style={{
              flex: '1 0 80px', padding: '10px', borderRadius: '8px',
              background: stage.color + '20', borderTop: `3px solid ${stage.color}`,
              textAlign: 'center', minWidth: '80px',
            }}
          >
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: stage.color }}>{stage.name}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>{stage.probability}%</div>
          </div>
        ))}
      </div>

      {/* Stages list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {pipeline.stages.map((stage, idx) => (
          <motion.div
            key={stage.id}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', borderRadius: '10px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
            }}
          >
            <GripVertical size={16} style={{ color: 'var(--text-muted)', cursor: 'grab', flexShrink: 0 }} />

            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: stage.color, flexShrink: 0 }} />

            {editingStage === stage.id ? (
              <input
                autoFocus
                value={stage.name}
                onChange={e => updateStage(stage.id, { name: e.target.value })}
                onBlur={() => setEditingStage(null)}
                onKeyDown={e => e.key === 'Enter' && setEditingStage(null)}
                style={{
                  flex: 1, padding: '4px 8px', background: 'var(--bg-primary)',
                  border: '1px solid var(--accent-primary)', borderRadius: '6px',
                  color: 'var(--text-primary)', fontSize: '0.85rem',
                }}
              />
            ) : (
              <span
                onClick={() => setEditingStage(stage.id)}
                style={{ flex: 1, cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500 }}
              >
                {stage.name}
              </span>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <input
                type="range"
                min="0"
                max="100"
                value={stage.probability}
                onChange={e => updateStage(stage.id, { probability: parseInt(e.target.value) })}
                style={{ width: '60px' }}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: '32px' }}>{stage.probability}%</span>
            </div>

            {/* Color picker */}
            <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
              {STAGE_COLORS.slice(0, 6).map(c => (
                <div
                  key={c}
                  onClick={() => updateStage(stage.id, { color: c })}
                  style={{
                    width: 14, height: 14, borderRadius: '50%', background: c, cursor: 'pointer',
                    border: c === stage.color ? '2px solid white' : '2px solid transparent',
                    boxShadow: c === stage.color ? `0 0 0 1px ${c}` : 'none',
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => removeStage(stage.id)}
              style={{
                padding: '4px', borderRadius: '6px', color: 'var(--text-muted)',
                opacity: pipeline.stages.length <= 2 ? 0.3 : 1,
              }}
              disabled={pipeline.stages.length <= 2}
              title="Remove stage"
            >
              <Trash2 size={14} />
            </button>
          </motion.div>
        ))}
      </div>

      <button
        onClick={addStage}
        style={{
          width: '100%', marginTop: '12px', padding: '10px',
          borderRadius: '10px', border: '1px dashed var(--border-color)',
          background: 'transparent', color: 'var(--text-muted)',
          fontSize: '0.8rem', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '6px',
        }}
      >
        <Plus size={14} /> Add Stage
      </button>
    </div>
  )
}

export default PipelineBuilder
