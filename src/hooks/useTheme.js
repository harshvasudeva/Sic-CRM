import { useState, useEffect, useCallback } from 'react'
import { getSettings, updateSettings, applyTheme, getEffectiveTheme } from '../stores/settingsStore'

export function useTheme() {
    const [theme, setTheme] = useState(getEffectiveTheme)
    const [density, setDensityState] = useState(() => getSettings().density || 'comfortable')

    useEffect(() => {
        applyTheme()
        // Listen for system theme changes
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const handler = () => {
            if (getSettings().theme === 'system') {
                const effective = getEffectiveTheme()
                setTheme(effective)
                applyTheme()
            }
        }
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [])

    const toggleTheme = useCallback(() => {
        const current = getSettings().theme
        const next = current === 'dark' ? 'light' : 'dark'
        updateSettings({ theme: next })
        setTheme(next)
        applyTheme()
        return next
    }, [])

    const setDensity = useCallback((d) => {
        updateSettings({ density: d })
        setDensityState(d)
        document.documentElement.setAttribute('data-density', d)
    }, [])

    return { theme, density, toggleTheme, setDensity }
}
