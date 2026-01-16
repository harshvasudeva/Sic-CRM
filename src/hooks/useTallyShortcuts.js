import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Hook to handle Tally-like keyboard shortcuts
 * @param {Object} actions - Map of actions to trigger
 * @param {Function} actions.create - Function to trigger "Create" (Alt+C)
 * @param {Function} actions.save - Function to trigger "Save" (Ctrl+A or Enter in some contexts)
 * @param {Function} actions.back - Function to trigger "Back" (Esc)
 * @param {boolean} enableNavigation - Whether to enable F-key navigation (F5, F7, etc.)
 */
export function useTallyShortcuts({ create, save, back } = {}, enableNavigation = true) {
    const navigate = useNavigate()

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Alt + C: Create / Add
            if (e.altKey && e.key.toLowerCase() === 'c') {
                e.preventDefault()
                if (create) create()
            }

            // Ctrl + A: Save / Accept (Common Tally shortcut)
            if (e.ctrlKey && e.key.toLowerCase() === 'a') {
                e.preventDefault()
                if (save) save()
            }

            // Esc: Back / Cancel
            if (e.key === 'Escape') {
                // If a specific back action is provided, use it
                if (back) {
                    e.preventDefault()
                    back()
                }
                // Otherwise only navigate back if we are not in a modal-heavy context (optional logic)
            }

            // Navigation Shortcuts (F-Keys)
            if (enableNavigation) {
                switch (e.key) {
                    case 'F5': // Tally: Payment -> CRM: Expenses/Payments
                        e.preventDefault()
                        navigate('/accounting/expenses')
                        break
                    case 'F6': // Tally: Receipt -> CRM: Bank/Cash Receipt
                        e.preventDefault()
                        navigate('/accounting/bank') // or receivable
                        break
                    case 'F7': // Tally: Journal -> CRM: Journal Entries
                        e.preventDefault()
                        navigate('/accounting/journal')
                        break
                    case 'F8': // Tally: Sales -> CRM: Invoices (if linked) or Revenue
                        // navigate('/sales/invoices') 
                        break
                    case 'F9': // Tally: Purchase -> CRM: Bills
                        // navigate('/purchases/bills')
                        break
                    default:
                        break
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [create, save, back, enableNavigation, navigate])
}
