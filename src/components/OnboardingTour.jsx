import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    LayoutDashboard,
    Navigation,
    Search,
    Bell,
    HelpCircle
} from 'lucide-react'

const tourSteps = [
    {
        id: 'welcome',
        title: 'Welcome to Sic CRM! 🎉',
        description: 'Let\'s take a quick tour to help you get started with the platform.',
        icon: Sparkles,
        position: 'center'
    },
    {
        id: 'sidebar',
        title: 'Navigation Sidebar',
        description: 'Use the sidebar to navigate between modules. Each module contains specific features for different business operations.',
        icon: Navigation,
        position: 'right',
        highlight: '.sidebar'
    },
    {
        id: 'dashboard',
        title: 'Dashboard Overview',
        description: 'The dashboard gives you a bird\'s eye view of your business with key metrics and quick access to all modules.',
        icon: LayoutDashboard,
        position: 'center'
    },
    {
        id: 'search',
        title: 'Quick Search',
        description: 'Press Ctrl+K anytime to open the command palette for quick navigation and actions.',
        icon: Search,
        position: 'top-right'
    },
    {
        id: 'notifications',
        title: 'Stay Updated',
        description: 'The notification bell keeps you informed about important updates, orders, and alerts.',
        icon: Bell,
        position: 'top-right'
    },
    {
        id: 'help',
        title: 'Need Help?',
        description: 'Click the "Help & Guide" button in the sidebar footer anytime to access the full documentation.',
        icon: HelpCircle,
        position: 'bottom-left'
    }
]

function OnboardingTour({ isOpen, onClose, onComplete }) {
    const [currentStep, setCurrentStep] = useState(0)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true)
            setCurrentStep(0)
        }
    }, [isOpen])

    const handleNext = () => {
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            handleComplete()
        }
    }

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleComplete = () => {
        setIsVisible(false)
        localStorage.setItem('sic-crm-onboarding', 'completed')
        onComplete?.()
        setTimeout(onClose, 300)
    }

    const handleSkip = () => {
        setIsVisible(false)
        localStorage.setItem('sic-crm-onboarding', 'skipped')
        setTimeout(onClose, 300)
    }

    const step = tourSteps[currentStep]
    const isLastStep = currentStep === tourSteps.length - 1
    const isFirstStep = currentStep === 0

    const getPositionStyles = () => {
        switch (step.position) {
            case 'right':
                return { left: '320px', top: '50%', transform: 'translateY(-50%)' }
            case 'top-right':
                return { right: '100px', top: '100px' }
            case 'bottom-left':
                return { left: '320px', bottom: '100px' }
            case 'center':
            default:
                return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="onboarding-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isVisible ? 1 : 0 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Spotlight effect for highlighted elements */}
                    {step.highlight && (
                        <motion.div
                            className="onboarding-spotlight"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        />
                    )}

                    {/* Tour Card */}
                    <motion.div
                        className="onboarding-card"
                        style={getPositionStyles()}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        key={currentStep}
                    >
                        {/* Close button */}
                        <button className="onboarding-close" onClick={handleSkip}>
                            <X size={18} />
                        </button>

                        {/* Icon */}
                        <div className="onboarding-icon">
                            <step.icon size={32} />
                        </div>

                        {/* Content */}
                        <h2 className="onboarding-title">{step.title}</h2>
                        <p className="onboarding-description">{step.description}</p>

                        {/* Progress dots */}
                        <div className="onboarding-progress">
                            {tourSteps.map((_, index) => (
                                <button
                                    key={index}
                                    className={`onboarding-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                                    onClick={() => setCurrentStep(index)}
                                />
                            ))}
                        </div>

                        {/* Navigation */}
                        <div className="onboarding-nav">
                            {!isFirstStep && (
                                <button className="onboarding-btn secondary" onClick={handlePrev}>
                                    <ChevronLeft size={18} />
                                    Back
                                </button>
                            )}
                            {isFirstStep && (
                                <button className="onboarding-btn secondary" onClick={handleSkip}>
                                    Skip Tour
                                </button>
                            )}
                            <button className="onboarding-btn primary" onClick={handleNext}>
                                {isLastStep ? 'Get Started' : 'Next'}
                                {!isLastStep && <ChevronRight size={18} />}
                            </button>
                        </div>
                    </motion.div>

                    <style>{`
            .onboarding-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.85);
              z-index: 4000;
            }

            .onboarding-spotlight {
              position: absolute;
              pointer-events: none;
            }

            .onboarding-card {
              position: absolute;
              width: 400px;
              max-width: calc(100vw - 40px);
              background: var(--bg-secondary);
              border: 1px solid var(--border-color);
              border-radius: var(--radius-xl);
              padding: 32px;
              text-align: center;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }

            .onboarding-close {
              position: absolute;
              top: 16px;
              right: 16px;
              width: 32px;
              height: 32px;
              border-radius: 8px;
              background: rgba(255, 255, 255, 0.05);
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--text-muted);
              transition: all 0.2s;
            }

            .onboarding-close:hover {
              background: rgba(255, 255, 255, 0.1);
              color: white;
            }

            .onboarding-icon {
              width: 72px;
              height: 72px;
              margin: 0 auto 20px;
              border-radius: 20px;
              background: var(--accent-gradient);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
            }

            .onboarding-title {
              font-size: 1.5rem;
              font-weight: 700;
              margin-bottom: 12px;
            }

            .onboarding-description {
              font-size: 0.95rem;
              color: var(--text-secondary);
              line-height: 1.6;
              margin-bottom: 24px;
            }

            .onboarding-progress {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              margin-bottom: 24px;
            }

            .onboarding-dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.2);
              transition: all 0.3s;
            }

            .onboarding-dot.active {
              width: 24px;
              border-radius: 4px;
              background: var(--accent-primary);
            }

            .onboarding-dot.completed {
              background: var(--accent-primary);
              opacity: 0.5;
            }

            .onboarding-nav {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
            }

            .onboarding-btn {
              display: flex;
              align-items: center;
              gap: 6px;
              padding: 12px 24px;
              border-radius: var(--radius-md);
              font-size: 0.9rem;
              font-weight: 500;
              transition: all 0.2s;
            }

            .onboarding-btn.primary {
              background: var(--accent-gradient);
              color: white;
            }

            .onboarding-btn.primary:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
            }

            .onboarding-btn.secondary {
              background: rgba(255, 255, 255, 0.05);
              color: var(--text-secondary);
              border: 1px solid var(--border-color);
            }

            .onboarding-btn.secondary:hover {
              background: rgba(255, 255, 255, 0.1);
              color: white;
            }
          `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default OnboardingTour
