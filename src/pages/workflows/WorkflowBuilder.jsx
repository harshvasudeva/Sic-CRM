import { useState } from 'react'
import { Plus, Trash2, Save, ChevronDown, Zap } from 'lucide-react'
import { registerWorkflow, EVENT_TYPES } from '../../stores/workflowEngine'

export default function WorkflowBuilder() {
  const [name, setName] = useState('')
  const [trigger, setTrigger] = useState('')
  const [steps, setSteps] = useState([{ action: '', config: {} }])

  const addStep = () => setSteps([...steps, { action: '', config: {} }])
  const removeStep = (i) => setSteps(steps.filter((_, idx) => idx !== i))
  const updateStep = (i, field, value) => {
    const updated = [...steps]
    updated[i] = { ...updated[i], [field]: value }
    setSteps(updated)
  }

  const handleSave = () => {
    if (!name || !trigger) return
    createWorkflowDefinition({
      name,
      triggerEvent: trigger,
      steps,
      isActive: true,
    })
    setName('')
    setTrigger('')
    setSteps([{ action: '', config: {} }])
  }

  const s = {
    page: { padding: '20px 24px', maxWidth: 720 },
    title: { fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 },
    field: { marginBottom: 14 },
    label: { fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' },
    input: { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13 },
    select: { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13 },
    stepCard: { padding: 12, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center' },
    stepNum: { width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 },
    btn: (primary) => ({ padding: '8px 16px', borderRadius: 6, border: primary ? 'none' : '1px solid var(--border)', background: primary ? 'var(--accent)' : 'transparent', color: primary ? '#fff' : 'var(--text-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }),
    removeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 },
    footer: { display: 'flex', gap: 8, marginTop: 16 },
  }

  const eventTypes = Object.values(EVENT_TYPES || {}).flat?.() || ['LEAD_CREATED', 'DEAL_WON', 'INVOICE_SENT', 'PO_APPROVED', 'STOCK_LOW']
  const actionTypes = ['send_email', 'create_record', 'update_field', 'notify_user', 'webhook', 'wait', 'condition']

  return (
    <div style={s.page}>
      <h1 style={s.title}><Zap size={18} /> Workflow Builder</h1>
      <div style={s.field}>
        <label style={s.label}>Workflow Name</label>
        <input style={s.input} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Auto-create SO from won deal" />
      </div>
      <div style={s.field}>
        <label style={s.label}>Trigger Event</label>
        <select style={s.select} value={trigger} onChange={e => setTrigger(e.target.value)}>
          <option value="">Select trigger...</option>
          {(Array.isArray(eventTypes) ? eventTypes : []).map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div style={s.field}>
        <label style={s.label}>Steps</label>
        {steps.map((step, i) => (
          <div key={i} style={s.stepCard}>
            <div style={s.stepNum}>{i + 1}</div>
            <select style={{ ...s.select, flex: 1 }} value={step.action} onChange={e => updateStep(i, 'action', e.target.value)}>
              <option value="">Select action...</option>
              {actionTypes.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
            </select>
            {steps.length > 1 && (
              <button style={s.removeBtn} onClick={() => removeStep(i)}><Trash2 size={14} /></button>
            )}
          </div>
        ))}
        <button style={s.btn(false)} onClick={addStep}><Plus size={14} /> Add Step</button>
      </div>
      <div style={s.footer}>
        <button style={s.btn(true)} onClick={handleSave}><Save size={14} /> Save Workflow</button>
      </div>
    </div>
  )
}
