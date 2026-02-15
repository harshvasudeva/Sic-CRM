import { useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'

function CopyToClipboard({ text, children, showIcon = true, className = '', onCopy }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      onCopy?.(text)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      onCopy?.(text)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [text, onCopy])

  return (
    <span className={`copy-to-clipboard ${className}`} onClick={handleCopy} title={copied ? 'Copied!' : 'Click to copy'}>
      {children || text}
      {showIcon && (
        <span className="copy-icon">
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </span>
      )}

      <style>{`
        .copy-to-clipboard {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          border-radius: 6px;
          padding: 2px 6px;
          margin: -2px -6px;
          transition: background 0.15s;
        }
        .copy-to-clipboard:hover {
          background: rgba(255, 255, 255, 0.06);
        }
        .copy-icon {
          display: inline-flex;
          opacity: 0;
          transition: opacity 0.15s;
          color: var(--accent-primary);
        }
        .copy-to-clipboard:hover .copy-icon {
          opacity: 1;
        }
      `}</style>
    </span>
  )
}

export default CopyToClipboard
