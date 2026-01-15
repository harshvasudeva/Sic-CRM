import { motion } from 'framer-motion'
import { CommandPalette, SHORTCUTS, VOUCHER_SHORTCUTS, TALLY_FEATURES } from './ShortcutHelp'

function TallyHelp() {
    const categories = ['general', 'vouchers', 'inventory', 'accounting', 'payroll', 'reports']

    return (
        <div className="page p-6">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Tally</span> Shortcuts & Features</h1>
                    <p className="page-description">
                        Complete reference guide for Tally users transitioning to Sic CRM
                    </p>
                </div>
                <div className="flex gap-2">
                    <a href="#vouchers" className="btn-secondary">Vouchers</a>
                    <a href="#shortcuts" className="btn-secondary">Shortcuts</a>
                    <a href="#features" className="btn-secondary">Features</a>
                </div>
            </motion.div>

            <div className="space-y-12">
                <section id="vouchers" className="section">
                    <h2 className="section-title">🎯 Voucher Entry Shortcuts</h2>
                    <p className="text-gray-400 mb-4">Quick access to all voucher types like Tally</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(VOUCHER_SHORTCUTS).map(([key, value]) => (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="card"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <kbd className="shortcut-key">{value}</kbd>
                                    <span className="text-gray-400 text-sm">
                                        {Object.entries(SHORTCUTS).find(([k]) => k === key)?.[1] || ''}
                                    </span>
                                </div>
                                <div className="text-white font-medium">
                                    {key.replace('_', ' ').replace('note', 'Voucher')}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section id="shortcuts" className="section">
                    <h2 className="section-title">⌨️ General Keyboard Shortcuts</h2>
                    <p className="text-gray-400 mb-4">Navigate and work faster with these shortcuts</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(SHORTCUTS).map(([key, description]) => (
                            <div key={key} className="flex items-center gap-2 bg-gray-800 p-3 rounded-lg border border-gray-700">
                                <kbd className="text-xs bg-blue-600 px-2 py-1 rounded font-mono whitespace-nowrap">
                                    {key}
                                </kbd>
                                <span className="text-sm text-gray-300 flex-1">
                                    {description}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="features" className="section">
                    <h2 className="section-title">✨ Tally Features Available</h2>
                    <p className="text-gray-400 mb-4">All the features you know and love from Tally</p>
                    
                    {Object.entries(TALLY_FEATURES).map(([category, features]) => (
                        <div key={category} className="mb-8">
                            <h3 className="text-lg font-semibold mb-4 text-blue-400 capitalize">
                                {category.replace('_', ' ')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {features.map(feature => (
                                    <motion.div
                                        key={feature.key}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="card"
                                    >
                                        <div className="text-white font-medium mb-2">
                                            {feature.name}
                                        </div>
                                        <div className="text-gray-400 text-sm mb-2">
                                            {feature.description}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            {feature.shortcut && (
                                                <kbd className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded border border-purple-600/30">
                                                    {feature.shortcut}
                                                </kbd>
                                            )}
                                            {feature.route && (
                                                <span className="text-xs text-gray-500">
                                                    Route: /{feature.route.replace(/^\//, '')}
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>

                <div className="card bg-gradient-to-r from-blue-600 to-purple-600">
                    <h3 className="text-xl font-bold text-white mb-2">💡 Pro Tip</h3>
                    <p className="text-blue-100 text-sm">
                        Press <kbd className="bg-white/20 px-2 py-1 rounded mx-1">Ctrl + K</kbd> anywhere in the app to open the Command Palette for quick access to all vouchers, items, and reports!
                    </p>
                </div>
            </div>

            <style>{`
                .card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    padding: 20px;
                    transition: all 0.2s ease;
                }
                .card:hover {
                    border-color: var(--accent-primary);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
                }
                .shortcut-key {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-weight: 700;
                    font-size: 14px;
                    min-width: 80px;
                    text-align: center;
                }
                .section {
                    margin-bottom: 48px;
                }
                .section-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 16px;
                    padding-bottom: 12px;
                    border-bottom: 2px solid var(--border-color);
                }
            `}</style>
        </div>
    )
}

export default TallyHelp
