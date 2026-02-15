import { calculateLeadScore } from '../../stores/leadScoringStore'
import { Flame, Thermometer, Snowflake } from 'lucide-react'

const GRADE_ICONS = {
  Hot: Flame,
  Warm: Thermometer,
  Cold: Snowflake,
}

function LeadScoreBadge({ lead, showDetails = false, size = 'default' }) {
  if (!lead) return null

  const { score, grade, color, matchedRules } = calculateLeadScore(lead)
  const Icon = GRADE_ICONS[grade] || Thermometer

  const isSmall = size === 'small'

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      {/* Score circle */}
      <div style={{
        width: isSmall ? 28 : 36,
        height: isSmall ? 28 : 36,
        borderRadius: '50%',
        background: `conic-gradient(${color} ${score * 3.6}deg, var(--bg-tertiary) ${score * 3.6}deg)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          width: isSmall ? 22 : 28,
          height: isSmall ? 22 : 28,
          borderRadius: '50%',
          background: 'var(--bg-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isSmall ? '0.6rem' : '0.7rem',
          fontWeight: 700,
          color,
        }}>
          {score}
        </div>
      </div>

      {/* Grade badge */}
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        padding: isSmall ? '2px 6px' : '3px 8px',
        borderRadius: '6px',
        fontSize: isSmall ? '0.65rem' : '0.7rem',
        fontWeight: 600,
        background: color + '20',
        color,
      }}>
        <Icon size={isSmall ? 10 : 12} />
        {grade}
      </span>

      {/* Details tooltip */}
      {showDetails && matchedRules.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '8px',
          padding: '8px 12px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          zIndex: 100,
          minWidth: '200px',
        }}>
          {matchedRules.map(rule => (
            <div key={rule.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '2px 0',
              fontSize: '0.7rem',
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>{rule.label}</span>
              <span style={{ color: rule.points > 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                {rule.points > 0 ? '+' : ''}{rule.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LeadScoreBadge
