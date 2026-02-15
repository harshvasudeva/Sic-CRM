import { useMemo } from 'react'

function calculateStrength(password) {
  if (!password) return { score: 0, label: '', color: '#6b7280', suggestions: [] }

  let score = 0
  const suggestions = []

  if (password.length >= 8) score += 1
  else suggestions.push('Use at least 8 characters')

  if (password.length >= 12) score += 1

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  else suggestions.push('Mix uppercase and lowercase letters')

  if (/\d/.test(password)) score += 1
  else suggestions.push('Add a number')

  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  else suggestions.push('Add a special character')

  // Penalty for common patterns
  if (/^[a-z]+$/i.test(password) || /^\d+$/.test(password)) {
    score = Math.max(0, score - 1)
    suggestions.push('Avoid using only letters or only numbers')
  }

  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981']

  const level = Math.min(score, 4)
  return {
    score: level,
    label: labels[level],
    color: colors[level],
    percentage: (level + 1) * 20,
    suggestions,
  }
}

function PasswordStrength({ password, showSuggestions = true }) {
  const strength = useMemo(() => calculateStrength(password), [password])

  if (!password) return null

  return (
    <div className="password-strength">
      <div className="strength-bar-bg">
        <div
          className="strength-bar-fill"
          style={{ width: `${strength.percentage}%`, background: strength.color }}
        />
      </div>
      <div className="strength-label" style={{ color: strength.color }}>
        {strength.label}
      </div>
      {showSuggestions && strength.suggestions.length > 0 && (
        <ul className="strength-suggestions">
          {strength.suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}

      <style>{`
        .password-strength {
          margin-top: 8px;
        }
        .strength-bar-bg {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }
        [data-theme="light"] .strength-bar-bg {
          background: rgba(0, 0, 0, 0.08);
        }
        .strength-bar-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.3s, background 0.3s;
        }
        .strength-label {
          font-size: 0.75rem;
          font-weight: 500;
          margin-top: 4px;
        }
        .strength-suggestions {
          list-style: none;
          padding: 0;
          margin: 6px 0 0 0;
        }
        .strength-suggestions li {
          font-size: 0.75rem;
          color: var(--text-muted);
          padding: 2px 0;
        }
        .strength-suggestions li::before {
          content: '\u2022 ';
          color: var(--text-muted);
        }
      `}</style>
    </div>
  )
}

export { calculateStrength }
export default PasswordStrength
