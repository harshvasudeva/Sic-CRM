import { forwardRef } from 'react'

const FormInput = forwardRef(({
    label,
    error,
    icon: Icon,
    type = 'text',
    className = '',
    ...props
}, ref) => {
    return (
        <div className={`form-field ${error ? 'has-error' : ''} ${className}`}>
            {label && <label className="form-label">{label}</label>}
            <div className="input-wrapper">
                {Icon && <Icon size={18} className="input-icon" />}
                <input
                    ref={ref}
                    type={type}
                    className={`form-input ${Icon ? 'has-icon' : ''}`}
                    {...props}
                />
            </div>
            {error && <span className="form-error">{error}</span>}

            <style>{`
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .form-input.has-icon {
          padding-left: 44px;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }

        .form-input::placeholder {
          color: var(--text-muted);
        }

        .form-field.has-error .form-input {
          border-color: var(--error);
        }

        .form-error {
          font-size: 0.8rem;
          color: var(--error);
        }
      `}</style>
        </div>
    )
})

FormInput.displayName = 'FormInput'

// Textarea variant
export const FormTextarea = forwardRef(({
    label,
    error,
    rows = 4,
    className = '',
    ...props
}, ref) => {
    return (
        <div className={`form-field ${error ? 'has-error' : ''} ${className}`}>
            {label && <label className="form-label">{label}</label>}
            <textarea
                ref={ref}
                rows={rows}
                className="form-input form-textarea"
                {...props}
            />
            {error && <span className="form-error">{error}</span>}

            <style>{`
        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }
      `}</style>
        </div>
    )
})

FormTextarea.displayName = 'FormTextarea'

// Select variant
export const FormSelect = forwardRef(({
    label,
    error,
    options = [],
    placeholder = 'Select...',
    className = '',
    ...props
}, ref) => {
    return (
        <div className={`form-field ${error ? 'has-error' : ''} ${className}`}>
            {label && <label className="form-label">{label}</label>}
            <select ref={ref} className="form-input form-select" {...props}>
                <option value="">{placeholder}</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {error && <span className="form-error">{error}</span>}

            <style>{`
        .form-select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 40px;
        }
      `}</style>
        </div>
    )
})

FormSelect.displayName = 'FormSelect'

export default FormInput
