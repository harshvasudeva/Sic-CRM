import React, { Component } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

class ModuleErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error(`Error in ${this.props.moduleName || 'Module'}:`, error, errorInfo)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
        // Optional: Attempt to recover by clearing specific local storage or query cache if needed
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="module-error-state">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="error-card"
                    >
                        <div className="error-icon">
                            <AlertTriangle size={32} />
                        </div>
                        <h3>{this.props.moduleName || 'Module'} Error</h3>
                        <p>We encountered an issue loading this section.</p>

                        {process.env.NODE_ENV === 'development' && (
                            <div className="debug-info">
                                {this.state.error?.toString()}
                            </div>
                        )}

                        <div className="actions">
                            <button onClick={this.handleReset} className="btn-retry">
                                <RefreshCw size={16} /> Try Again
                            </button>
                            <Link to="/" className="btn-dashboard">
                                <ArrowLeft size={16} /> Dashboard
                            </Link>
                        </div>
                    </motion.div>

                    <style>{`
                        .module-error-state {
                            padding: 40px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 400px;
                        }
                        .error-card {
                            background: var(--bg-card);
                            border: 1px solid var(--border-color);
                            border-radius: 12px;
                            padding: 32px;
                            text-align: center;
                            max-width: 400px;
                            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        }
                        .error-icon {
                            background: rgba(239, 68, 68, 0.1);
                            color: var(--error);
                            width: 64px;
                            height: 64px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 16px;
                        }
                        .debug-info {
                            margin: 16px 0;
                            padding: 8px;
                            background: #1e1e1e;
                            color: #f87171;
                            font-family: monospace;
                            font-size: 12px;
                            border-radius: 4px;
                            text-align: left;
                            overflow: hidden;
                        }
                        .actions {
                            display: flex;
                            gap: 12px;
                            justify-content: center;
                            margin-top: 24px;
                        }
                        .btn-retry {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            padding: 8px 16px;
                            background: var(--bg-tertiary);
                            border: 1px solid var(--border-color);
                            border-radius: 6px;
                            cursor: pointer;
                            color: var(--text-primary);
                            font-weight: 500;
                        }
                        .btn-retry:hover {
                            background: var(--bg-hover);
                        }
                        .btn-dashboard {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            padding: 8px 16px;
                            background: var(--accent-primary);
                            border-radius: 6px;
                            color: white;
                            text-decoration: none;
                            font-weight: 500;
                        }
                    `}</style>
                </div>
            )
        }

        return this.props.children
    }
}

export default ModuleErrorBoundary
