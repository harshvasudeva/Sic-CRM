import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import QuickActions from './QuickActions'
import CommandPalette from './CommandPalette'
import { ShortcutHelp } from './ShortcutHelp'
import OnboardingTour from './OnboardingTour'
import Calculator from './Calculator'
import { useGlobalTallyShortcuts } from '../hooks/useTallyShortcuts'

function Layout() {
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
    const [onboardingOpen, setOnboardingOpen] = useState(false)
    const [helpOpen, setHelpOpen] = useState(false)
    const [calculatorOpen, setCalculatorOpen] = useState(false)

    // Enable all Tally shortcuts globally (F-keys + sequences like DAL, DAS, etc.)
    useGlobalTallyShortcuts()

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
            // Don't trigger when typing in inputs
            const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) ||
                document.activeElement.isContentEditable

            // Ctrl+K or Cmd+K to open command palette
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                setCommandPaletteOpen(true)
                return
            }

            // Ctrl+N: Calculator (like Tally)
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault()
                setCalculatorOpen(true)
                return
            }

            // F1: Help
            if (e.key === 'F1') {
                e.preventDefault()
                setHelpOpen(true)
                return
            }

            // Alt+P: Print
            if (e.altKey && e.key.toLowerCase() === 'p') {
                e.preventDefault()
                window.print()
                return
            }

            // Alt+E: Export (show toast notification)
            if (e.altKey && e.key.toLowerCase() === 'e' && !isInput) {
                e.preventDefault()
                showExportToast()
                return
            }

            // ? to open help (when not in input)
            if (e.key === '?' && !isInput) {
                e.preventDefault()
                setHelpOpen(true)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Show export toast notification
    const showExportToast = () => {
        const toast = document.createElement('div')
        toast.innerHTML = `
            <div style="
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                padding: 12px 24px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 8px 32px rgba(16, 185, 129, 0.4);
                z-index: 10000;
                animation: slideUp 0.3s ease;
            ">
                📤 Export feature - Use the Export button on each page
            </div>
            <style>
                @keyframes slideUp {
                    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            </style>
        `
        document.body.appendChild(toast)
        setTimeout(() => toast.remove(), 2000)
    }

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

            <Calculator isOpen={calculatorOpen} onClose={() => setCalculatorOpen(false)} />

            <OnboardingTour
                isOpen={onboardingOpen}
                onClose={() => setOnboardingOpen(false)}
                onComplete={() => console.log('Onboarding completed!')}
            />
        </div>
    )
}

export default Layout

