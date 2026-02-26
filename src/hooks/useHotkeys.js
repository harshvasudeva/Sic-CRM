/**
 * useHotkeys - Global keyboard shortcut handler (C7).
 * Supports modifier keys (ctrl, shift, alt, meta) and key combinations.
 *
 * @param {Object} keyMap - { 'ctrl+k': handler, 'ctrl+s': handler, 'escape': handler }
 * @param {Object} opts
 * @param {boolean} opts.enabled - Whether hotkeys are active (default true)
 * @param {boolean} opts.preventDefault - Whether to prevent default browser behavior (default true)
 * @param {HTMLElement} opts.target - Element to attach listener to (default document)
 */
import { useEffect, useRef } from 'react'

function parseCombo(combo) {
  const parts = combo.toLowerCase().split('+').map(p => p.trim())
  return {
    ctrl: parts.includes('ctrl') || parts.includes('control'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
    meta: parts.includes('meta') || parts.includes('cmd') || parts.includes('command'),
    key: parts.filter(p => !['ctrl', 'control', 'shift', 'alt', 'meta', 'cmd', 'command'].includes(p))[0] || '',
  }
}

function matchesCombo(event, combo) {
  const c = parseCombo(combo)
  if (c.ctrl !== event.ctrlKey) return false
  if (c.shift !== event.shiftKey) return false
  if (c.alt !== event.altKey) return false
  if (c.meta !== event.metaKey) return false

  const eventKey = event.key.toLowerCase()
  const comboKey = c.key.toLowerCase()

  // Handle special key names
  if (comboKey === 'escape' && eventKey === 'escape') return true
  if (comboKey === 'enter' && eventKey === 'enter') return true
  if (comboKey === 'space' && (eventKey === ' ' || eventKey === 'spacebar')) return true
  if (comboKey === 'backspace' && eventKey === 'backspace') return true
  if (comboKey === 'delete' && eventKey === 'delete') return true
  if (comboKey === 'tab' && eventKey === 'tab') return true
  if (comboKey === 'up' && eventKey === 'arrowup') return true
  if (comboKey === 'down' && eventKey === 'arrowdown') return true
  if (comboKey === 'left' && eventKey === 'arrowleft') return true
  if (comboKey === 'right' && eventKey === 'arrowright') return true

  return eventKey === comboKey
}

function isInputElement(el) {
  const tag = el?.tagName?.toLowerCase()
  return tag === 'input' || tag === 'textarea' || tag === 'select' || el?.isContentEditable
}

export default function useHotkeys(keyMap, { enabled = true, preventDefault = true, target = null, ignoreInputs = true } = {}) {
  const keyMapRef = useRef(keyMap)
  keyMapRef.current = keyMap

  useEffect(() => {
    if (!enabled) return

    const handler = (event) => {
      // Skip if focused on an input element (unless explicitly allowed)
      if (ignoreInputs && isInputElement(event.target)) return

      const currentMap = keyMapRef.current
      for (const combo of Object.keys(currentMap)) {
        if (matchesCombo(event, combo)) {
          if (preventDefault) event.preventDefault()
          currentMap[combo](event)
          return
        }
      }
    }

    const el = target || document
    el.addEventListener('keydown', handler)
    return () => el.removeEventListener('keydown', handler)
  }, [enabled, preventDefault, target, ignoreInputs])
}

/**
 * Pre-built shortcut descriptions for help dialog.
 */
export const DEFAULT_SHORTCUTS = [
  { combo: 'ctrl+k', label: 'Open command palette / search' },
  { combo: 'ctrl+s', label: 'Save current record' },
  { combo: 'ctrl+n', label: 'Create new record' },
  { combo: 'escape', label: 'Close modal / cancel' },
  { combo: 'ctrl+/', label: 'Show keyboard shortcuts' },
  { combo: 'ctrl+shift+p', label: 'Open quick actions' },
]
