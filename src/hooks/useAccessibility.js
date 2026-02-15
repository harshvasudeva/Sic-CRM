import { useEffect, useCallback } from 'react'

/**
 * Hook for accessibility (a11y) enhancements.
 * - Skip-to-content link
 * - Focus management
 * - Announce changes to screen readers
 * - Reduced motion preference
 */
export function useAccessibility() {
  // Detect reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Create a live region for screen reader announcements
  useEffect(() => {
    if (document.getElementById('sr-announcer')) return

    const announcer = document.createElement('div')
    announcer.id = 'sr-announcer'
    announcer.setAttribute('role', 'status')
    announcer.setAttribute('aria-live', 'polite')
    announcer.setAttribute('aria-atomic', 'true')
    announcer.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0'
    document.body.appendChild(announcer)

    return () => {
      const el = document.getElementById('sr-announcer')
      if (el) el.remove()
    }
  }, [])

  // Announce a message to screen readers
  const announce = useCallback((message) => {
    const el = document.getElementById('sr-announcer')
    if (el) {
      el.textContent = ''
      requestAnimationFrame(() => { el.textContent = message })
    }
  }, [])

  // Focus trap for modals/dialogs
  const trapFocus = useCallback((containerEl) => {
    if (!containerEl) return () => {}

    const focusable = containerEl.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    const handleTab = (e) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    containerEl.addEventListener('keydown', handleTab)
    first?.focus()

    return () => containerEl.removeEventListener('keydown', handleTab)
  }, [])

  // Skip to main content
  useEffect(() => {
    if (document.getElementById('skip-to-content')) return

    const skip = document.createElement('a')
    skip.id = 'skip-to-content'
    skip.href = '#main-content'
    skip.textContent = 'Skip to main content'
    skip.style.cssText = `
      position: fixed; top: -100px; left: 16px; z-index: 100000;
      padding: 12px 24px; background: var(--accent-primary, #6366f1); color: white;
      border-radius: 0 0 8px 8px; font-weight: 600; font-size: 0.9rem;
      text-decoration: none; transition: top 0.2s;
    `
    skip.addEventListener('focus', () => { skip.style.top = '0' })
    skip.addEventListener('blur', () => { skip.style.top = '-100px' })
    document.body.prepend(skip)
  }, [])

  return {
    announce,
    trapFocus,
    prefersReducedMotion,
  }
}

/**
 * Hook for managing focus when navigating between pages.
 */
export function useFocusOnMount(ref) {
  useEffect(() => {
    if (ref?.current) {
      ref.current.focus({ preventScroll: true })
    }
  }, [ref])
}
