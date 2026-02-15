import { useState } from 'react'
import { HelpCircle } from 'lucide-react'

function HelpTooltip({ text, position = 'top', size = 14, className = '' }) {
  const [show, setShow] = useState(false)

  const posStyles = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8 },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 8 },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 8 },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 8 },
  }

  return (
    <span
      className={`help-tooltip-wrapper ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      style={{ position: 'relative', display: 'inline-flex', cursor: 'help' }}
    >
      <HelpCircle size={size} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
      {show && (
        <div className="help-tooltip-popup" style={{ ...posStyles[position] }}>
          {text}
        </div>
      )}

      <style>{`
        .help-tooltip-wrapper:hover svg {
          opacity: 1 !important;
          color: var(--accent-primary) !important;
        }
        .help-tooltip-popup {
          position: absolute;
          z-index: 1000;
          padding: 8px 12px;
          background: var(--card-bg, #1e1e2e);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
          white-space: nowrap;
          max-width: 280px;
          white-space: normal;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          pointer-events: none;
        }
        [data-theme="light"] .help-tooltip-popup {
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
      `}</style>
    </span>
  )
}

export default HelpTooltip
