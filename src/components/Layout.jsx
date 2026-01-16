import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import QuickActions from './QuickActions'
import CommandPalette from './CommandPalette'
import { ShortcutHelp } from './ShortcutHelp'
import OnboardingTour from './OnboardingTour'

function Layout() {
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
    const [onboardingOpen, setOnboardingOpen] = useState(false)
    const [helpOpen, setHelpOpen] = useState(false)

    // Check if first visit for onboarding
    useEffect(() => {
        const onboardingStatus = localStorage.getItem('sic-crm-onboarding')
        if (!onboardingStatus) {
            // Show onboarding after a short delay
            setTimeout(() => setOnboardingOpen(true), 1000)
        }
    }, [])

    // Global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+K or Cmd+K to open command palette
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                setCommandPaletteOpen(true)
            }
            // ? to open help (when not in input)
            if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                e.preventDefault()
                setHelpOpen(true)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <div className="app-layout">
            <Sidebar onHelpOpen={() => setHelpOpen(true)} />
            <main className="main-content">
                <Header />
                <Outlet />
            </main>

            {/* Global Components */}
            <QuickActions />

            <CommandPalette
                isOpen={commandPaletteOpen}
                onClose={() => setCommandPaletteOpen(false)}
                onHelp={() => setHelpOpen(true)}
            />

            <ShortcutHelp isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

            <OnboardingTour
                isOpen={onboardingOpen}
                onClose={() => setOnboardingOpen(false)}
                onComplete={() => console.log('Onboarding completed!')}
            />
        </div>
    )
}

export default Layout
