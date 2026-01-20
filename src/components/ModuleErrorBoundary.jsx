import React, { Component } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, ArrowLeft, Bug, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

/**
 * ModuleErrorBoundary - Wraps each module to prevent crashes from propagating.
 * Errors in one module (e.g., HR) won't break other modules (e.g., Sales).
 * 
 * Features:
 * - Catches JavaScript errors anywhere in children
 * - Shows friendly error UI instead of crashing
 * - Provides retry mechanism
 * - Logs errors for debugging
 * - Resets when navigating away and back
 */
class ModuleErrorBoundaryInner extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        // Log the error for debugging
        console.error(`[${this.props.moduleName || 'Module'} Error]:`, error)
        console.error('Component Stack:', errorInfo?.componentStack)
        this.setState({ errorInfo })

        // In production, you could send this to an error tracking service
        // e.g., Sentry.captureException(error, { extra: errorInfo })
    }

    componentDidUpdate(prevProps) {
        // Reset error state when location changes (user navigates away and back)
        if (this.state.hasError && prevProps.location?.pathname !== this.props.location?.pathname) {
            this.setState({ hasError: false, error: null, errorInfo: null })
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
    }

    render() {
        if (this.state.hasError) {
            const isDev = process.env.NODE_ENV !== 'production'

            return (
                <div className="module-error-boundary">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="error-boundary-card"
                    >
                        <div className="error-boundary-icon">
                            <AlertTriangle size={36} />
                        </div>

                        <h3 className="error-boundary-title">
                            {this.props.moduleName || 'Module'} Error
                        </h3>

                        <p className="error-boundary-message">
                            This section encountered an issue and couldn't load properly.
                            <br />
                            <span className="error-boundary-hint">
                                Other parts of the application are unaffected.
                            </span>
                        </p>

                        {isDev && this.state.error && (
                            <details className="error-boundary-details">
                                <summary>
                                    <Bug size={14} /> Debug Information
                                </summary>
                                <div className="error-boundary-stack">
                                    <strong>Error:</strong>
                                    <pre>{this.state.error.toString()}</pre>
                                    {this.state.error.stack && (
                                        <>
                                            <strong>Stack:</strong>
                                            <pre>{this.state.error.stack}</pre>
                                        </>
                                    )}
                                </div>
                            </details>
                        )}

                        <div className="error-boundary-actions">
                            <button onClick={this.handleReset} className="error-btn error-btn-retry">
                                <RefreshCw size={16} /> Try Again
                            </button>
                            <Link to="/" className="error-btn error-btn-home">
                                <Home size={16} /> Dashboard
                            </Link>
                        </div>
                    </motion.div>

                    <style>{`
                        .module-error-boundary {
                            padding: 60px 20px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 400px;
                        }
                        .error-boundary-card {
                            background: var(--bg-card, #1a1a2e);
                            border: 1px solid rgba(239, 68, 68, 0.3);
                            border-radius: 16px;
                            padding: 40px;
                            text-align: center;
                            max-width: 480px;
                            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
                        }
                        .error-boundary-icon {
                            background: rgba(239, 68, 68, 0.12);
                            color: #ef4444;
                            width: 80px;
                            height: 80px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 20px;
                        }
                        .error-boundary-title {
                            font-size: 1.35rem;
                            font-weight: 600;
                            margin-bottom: 12px;
                            color: var(--text-primary, white);
                        }
                        .error-boundary-message {
                            color: var(--text-secondary, #a0a0a0);
                            font-size: 0.95rem;
                            line-height: 1.6;
                            margin-bottom: 24px;
                        }
                        .error-boundary-hint {
                            display: block;
                            margin-top: 8px;
                            font-size: 0.85rem;
                            color: var(--text-muted, #666);
                        }
                        .error-boundary-details {
                            text-align: left;
                            margin: 20px 0;
                            padding: 16px;
                            background: rgba(0, 0, 0, 0.3);
                            border-radius: 8px;
                            border: 1px solid rgba(255, 255, 255, 0.05);
                        }
                        .error-boundary-details summary {
                            cursor: pointer;
                            color: var(--text-muted, #888);
                            font-size: 0.85rem;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            user-select: none;
                        }
                        .error-boundary-details[open] summary {
                            margin-bottom: 12px;
                        }
                        .error-boundary-stack {
                            font-size: 0.75rem;
                        }
                        .error-boundary-stack strong {
                            display: block;
                            color: var(--text-secondary, #aaa);
                            margin-top: 8px;
                            margin-bottom: 4px;
                        }
                        .error-boundary-stack pre {
                            color: #f87171;
                            white-space: pre-wrap;
                            word-break: break-word;
                            max-height: 120px;
                            overflow: auto;
                            margin: 0;
                            padding: 8px;
                            background: rgba(0, 0, 0, 0.2);
                            border-radius: 4px;
                        }
                        .error-boundary-actions {
                            display: flex;
                            gap: 12px;
                            justify-content: center;
                        }
                        .error-btn {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            padding: 12px 24px;
                            border-radius: 10px;
                            font-weight: 500;
                            font-size: 0.9rem;
                            cursor: pointer;
                            transition: all 0.2s;
                            text-decoration: none;
                        }
                        .error-btn-retry {
                            background: var(--bg-tertiary, #2a2a4a);
                            border: 1px solid var(--border-color, #3a3a5a);
                            color: var(--text-primary, white);
                        }
                        .error-btn-retry:hover {
                            background: var(--bg-hover, #3a3a5a);
                            transform: translateY(-2px);
                        }
                        .error-btn-home {
                            background: var(--accent-primary, #6366f1);
                            border: none;
                            color: white;
                        }
                        .error-btn-home:hover {
                            opacity: 0.9;
                            transform: translateY(-2px);
                        }
                    `}</style>
                </div>
            )
        }

        return this.props.children
    }
}

// Wrapper to inject location for route change detection
function ModuleErrorBoundary({ moduleName, children }) {
    let location
    try {
        location = useLocation()
    } catch (e) {
        // useLocation might fail outside Router context
        location = null
    }

    return (
        <ModuleErrorBoundaryInner moduleName={moduleName} location={location}>
            {children}
        </ModuleErrorBoundaryInner>
    )
}

export default ModuleErrorBoundary
