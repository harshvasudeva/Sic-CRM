import { useState } from 'react'
import { Star } from 'lucide-react'
import { getCustomFields, validateCustomField } from '../stores/customFieldStore'
import { getCurrency } from '../stores/settingsStore'

function CustomFieldRenderer({ module, values = {}, onChange, readOnly = false }) {
  const fields = getCustomFields(module)
  const [errors, setErrors] = useState({})

  if (fields.length === 0) return null

  const handleChange = (field, value) => {
    const error = validateCustomField(field, value)
    setErrors(prev => ({ ...prev, [field.id]: error }))
    onChange?.({ ...values, [field.key]: value })
  }

  const renderField = (field) => {
    const value = values[field.key] ?? ''
    const error = errors[field.id]

    const baseStyle = {
      width: '100%', padding: '8px 12px', borderRadius: '8px',
      background: readOnly ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
      border: error ? '1px solid var(--color-error)' : '1px solid var(--border-color)',
      color: 'var(--text-primary)', fontSize: '0.85rem',
    }

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <input
            type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
            value={value}
            onChange={e => handleChange(field, e.target.value)}
            readOnly={readOnly}
            placeholder={field.placeholder || `Enter ${field.label}...`}
            style={baseStyle}
          />
        )

      case 'number':
      case 'currency':
      case 'percentage':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {field.type === 'currency' && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{getCurrency().symbol}</span>}
            <input
              type="number"
              value={value}
              onChange={e => handleChange(field, e.target.value)}
              readOnly={readOnly}
              min={field.min}
              max={field.max}
              step={field.type === 'currency' ? '0.01' : '1'}
              style={{ ...baseStyle, flex: 1 }}
            />
            {field.type === 'percentage' && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>%</span>}
          </div>
        )

      case 'date':
      case 'datetime':
        return (
          <input
            type={field.type === 'datetime' ? 'datetime-local' : 'date'}
            value={value}
            onChange={e => handleChange(field, e.target.value)}
            readOnly={readOnly}
            style={baseStyle}
          />
        )

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={e => handleChange(field, e.target.value)}
            readOnly={readOnly}
            rows={3}
            placeholder={field.placeholder || `Enter ${field.label}...`}
            style={{ ...baseStyle, resize: 'vertical' }}
          />
        )

      case 'select':
        return (
          <select
            value={value}
            onChange={e => handleChange(field, e.target.value)}
            disabled={readOnly}
            style={baseStyle}
          >
            <option value="">Select...</option>
            {(field.options || []).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )

      case 'multiselect': {
        const selected = Array.isArray(value) ? value : value ? [value] : []
        return (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {(field.options || []).map(opt => (
              <button
                key={opt}
                onClick={() => {
                  if (readOnly) return
                  const newVal = selected.includes(opt)
                    ? selected.filter(s => s !== opt)
                    : [...selected, opt]
                  handleChange(field, newVal)
                }}
                style={{
                  padding: '4px 10px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 500,
                  background: selected.includes(opt) ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: selected.includes(opt) ? 'white' : 'var(--text-secondary)',
                  border: '1px solid ' + (selected.includes(opt) ? 'var(--accent-primary)' : 'var(--border-color)'),
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )
      }

      case 'checkbox':
        return (
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: readOnly ? 'default' : 'pointer' }}>
            <input
              type="checkbox"
              checked={!!value}
              onChange={e => handleChange(field, e.target.checked)}
              disabled={readOnly}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{field.label}</span>
          </label>
        )

      case 'rating': {
        const max = field.max || 5
        const rating = parseInt(value) || 0
        return (
          <div style={{ display: 'flex', gap: '4px' }}>
            {Array.from({ length: max }).map((_, i) => (
              <Star
                key={i}
                size={18}
                onClick={() => !readOnly && handleChange(field, i + 1)}
                style={{
                  cursor: readOnly ? 'default' : 'pointer',
                  fill: i < rating ? '#f59e0b' : 'transparent',
                  color: i < rating ? '#f59e0b' : 'var(--text-muted)',
                }}
              />
            ))}
          </div>
        )
      }

      default:
        return <input type="text" value={value} onChange={e => handleChange(field, e.target.value)} style={baseStyle} />
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
        Custom Fields
      </div>
      {fields.sort((a, b) => (a.order || 0) - (b.order || 0)).map(field => (
        <div key={field.id}>
          {field.type !== 'checkbox' && (
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              {field.label}
              {field.required && <span style={{ color: 'var(--color-error)', marginLeft: '2px' }}>*</span>}
            </label>
          )}
          {renderField(field)}
          {errors[field.id] && (
            <div style={{ fontSize: '0.7rem', color: 'var(--color-error)', marginTop: '2px' }}>
              {errors[field.id]}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default CustomFieldRenderer
