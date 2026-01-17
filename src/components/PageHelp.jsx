import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, X, Keyboard, PlayCircle, BookOpen, MessageCircle } from 'lucide-react'

const PageHelp = ({
    title,
    description,
    shortcuts = [],
    walkthroughSteps = [],
    videoUrl,
    faqs = []
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('shortcuts')

    // Keyboard shortcut to open help (?)
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === '?' && !e.target.matches('input, textarea')) {
                setIsOpen(prev => !prev)
            }
        }
        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [])

    const tabs = [
        { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
        { id: 'walkthrough', label: 'Walkthrough', icon: BookOpen },
        { id: 'video', label: 'Tutorial', icon: PlayCircle },
        { id: 'faq', label: 'FAQ', icon: MessageCircle }
    ]

    return (
        <>
            <button
                className="page-help-trigger"
                onClick={() => setIsOpen(true)}
                title="Page Help (?)"
            >
                <HelpCircle size={20} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="help-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            className="help-modal"
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="help-header">
                                <div>
                                    <h3>{title} Help</h3>
                                    <p>{description}</p>
                                </div>
                                <button className="close-btn" onClick={() => setIsOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="help-tabs">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        <tab.icon size={16} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="help-content">
                                {activeTab === 'shortcuts' && (
                                    <div className="shortcuts-grid">
                                        {shortcuts.length > 0 ? shortcuts.map((s, i) => (
                                            <div key={i} className="shortcut-item">
                                                <span className="key-combo">
                                                    {s.keys.map((k, j) => (
                                                        <kbd key={j}>{k}</kbd>
                                                    ))}
                                                </span>
                                                <span className="action-label">{s.action}</span>
                                            </div>
                                        )) : (
                                            <p className="empty-state">No specific keyboard shortcuts for this page.</p>
                                        )}
                                        <div className="shortcut-item global">
                                            <span className="key-combo"><kbd>?</kbd></span>
                                            <span className="action-label">Toggle this help menu</span>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'walkthrough' && (
                                    <div className="walkthrough-list">
                                        {walkthroughSteps.length > 0 ? walkthroughSteps.map((step, i) => (
                                            <div key={i} className="walkthrough-step">
                                                <div className="step-number">{i + 1}</div>
                                                <div className="step-content">
                                                    <h4>{step.title}</h4>
                                                    <p>{step.description}</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <p className="empty-state">No walkthrough available.</p>
                                        )}
                                        {walkthroughSteps.length > 0 && (
                                            <button className="btn-primary start-tour-btn">Start Interactive Tour</button>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'video' && (
                                    <div className="video-container">
                                        {videoUrl ? (
                                            <div className="video-placeholder">
                                                <PlayCircle size={48} />
                                                <p>Video Tutorial Loading...</p>
                                                {/* <iframe src={videoUrl} ... /> */}
                                            </div>
                                        ) : (
                                            <p className="empty-state">No video tutorial available for this section.</p>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'faq' && (
                                    <div className="faq-list">
                                        {faqs.length > 0 ? faqs.map((faq, i) => (
                                            <div key={i} className="faq-item">
                                                <h4>{faq.question}</h4>
                                                <p>{faq.answer}</p>
                                            </div>
                                        )) : (
                                            <p className="empty-state">No FAQs available.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .page-help-trigger {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: var(--accent-primary);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    cursor: pointer;
                    z-index: 100;
                    transition: transform 0.2s;
                }
                .page-help-trigger:hover {
                    transform: scale(1.1);
                }
                .help-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.4);
                    backdrop-filter: blur(4px);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                }
                .help-modal {
                    background: var(--bg-card);
                    width: 100%;
                    max-width: 600px;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border-color);
                    box-shadow: 0 12px 36px rgba(0,0,0,0.2);
                    display: flex;
                    flex-direction: column;
                    max-height: 80vh;
                }
                .help-header {
                    padding: 20px;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                .help-header h3 { margin: 0 0 4px; font-size: 1.25rem; }
                .help-header p { margin: 0; color: var(--text-secondary); font-size: 0.9rem; }
                .close-btn { color: var(--text-muted); padding: 4px; border-radius: 4px; }
                .close-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
                
                .help-tabs {
                    display: flex;
                    padding: 0 20px;
                    border-bottom: 1px solid var(--border-color);
                    background: var(--bg-tertiary);
                }
                .tab-btn {
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--text-secondary);
                    border-bottom: 2px solid transparent;
                    font-size: 0.9rem;
                    font-weight: 500;
                }
                .tab-btn:hover { color: var(--text-primary); }
                .tab-btn.active { color: var(--accent-primary); border-bottom-color: var(--accent-primary); background: var(--bg-card); }
                
                .help-content {
                    padding: 24px;
                    overflow-y: auto;
                    min-height: 300px;
                }
                .shortcuts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 12px;
                }
                .shortcut-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px;
                    background: var(--bg-tertiary);
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                }
                .key-combo { display: flex; gap: 4px; }
                kbd {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-bottom-width: 2px;
                    border-radius: 4px;
                    padding: 2px 6px;
                    font-family: monospace;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }
                .action-label { font-size: 0.9rem; color: var(--text-secondary); }
                
                .walkthrough-step {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 20px;
                }
                .step-number {
                    width: 28px;
                    height: 28px;
                    background: var(--accent-primary);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    flex-shrink: 0;
                }
                .step-content h4 { margin: 0 0 4px; font-size: 1rem; }
                .step-content p { margin: 0; color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; }
                
                .empty-state {
                    text-align: center;
                    color: var(--text-muted);
                    padding: 40px 0;
                    font-style: italic;
                }
                
                .btn-primary.start-tour-btn {
                    width: 100%;
                    margin-top: 16px;
                    justify-content: center;
                }
            `}</style>
        </>
    )
}

export default PageHelp
