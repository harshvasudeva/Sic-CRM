import { useMemo } from 'react'

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
]

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

function Avatar({ name, src, size = 36, className = '', style = {}, status }) {
  const initials = useMemo(() => getInitials(name), [name])
  const bgColor = useMemo(() => COLORS[hashCode(name || '') % COLORS.length], [name])

  return (
    <div
      className={`avatar-component ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: 600,
        color: '#fff',
        background: src ? 'transparent' : bgColor,
        position: 'relative',
        overflow: 'visible',
        ...style,
      }}
      title={name}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
        />
      ) : null}
      <span style={{
        display: src ? 'none' : 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: bgColor,
        userSelect: 'none',
      }}>
        {initials}
      </span>

      {status && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: Math.max(8, size * 0.25),
            height: Math.max(8, size * 0.25),
            borderRadius: '50%',
            border: '2px solid var(--bg-primary, #0c0c12)',
            background: status === 'online' ? '#22c55e'
              : status === 'away' ? '#eab308'
              : status === 'busy' ? '#ef4444'
              : '#6b7280',
          }}
        />
      )}
    </div>
  )
}

function AvatarGroup({ items = [], max = 4, size = 32 }) {
  const visible = items.slice(0, max)
  const remaining = items.length - max

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {visible.map((item, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 0 : -10, zIndex: max - i }}>
          <Avatar name={item.name} src={item.src} size={size} style={{ border: '2px solid var(--bg-primary, #0c0c12)' }} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          style={{
            marginLeft: -10,
            width: size,
            height: size,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            border: '2px solid var(--bg-primary, #0c0c12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.32,
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
          title={`${remaining} more`}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}

export { AvatarGroup }
export default Avatar
