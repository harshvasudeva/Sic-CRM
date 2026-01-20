import React, { Component, Suspense } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * SafeRender - A higher-order component that wraps any component
 * with error boundary and suspense fallback for crash-proof rendering.
 * 
 * Usage:
 *   <SafeRender name="HR Dashboard">
 *     <HRDashboard />
 *   </SafeRender>
 */
class SafeRender extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error(`[SafeRender] Error in ${this.props.name || 'Component'}:`, error)
        console.error('Error Info:', errorInfo)
        this.setState({ errorInfo })
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="safe-error-container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="safe-error-card"
                    >
                        <div className="safe-error-icon">
                            <AlertTriangle size={32} />
                        </div>
                        <h3>Something went wrong</h3>
                        <p className="safe-error-module">
                            Error in: <strong>{this.props.name || 'Unknown Component'}</strong>
                        </p>
                        <p className="safe-error-message">
                            This section encountered an issue and couldn't load properly.
                        </p>

                        {process.env.NODE_ENV !== 'production' && this.state.error && (
                            <details className="safe-error-details">
                                <summary>Technical Details</summary>
                                <pre>{this.state.error.toString()}</pre>
                                {this.state.errorInfo && (
                                    <pre>{this.state.errorInfo.componentStack}</pre>
                                )}
                            </details>
                        )}

                        <div className="safe-error-actions">
                            <button onClick={this.handleRetry} className="safe-btn-retry">
                                <RefreshCw size={16} /> Try Again
                            </button>
                            <Link to="/" className="safe-btn-home">
                                <Home size={16} /> Dashboard
                            </Link>
                        </div>
                    </motion.div>

                    <style>{`
                        .safe-error-container {
                            padding: 40px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 50vh;
                        }
                        .safe-error-card {
                            background: var(--bg-card, #1a1a2e);
                            border: 1px solid var(--border-color, #2a2a4a);
                            border-radius: 16px;
                            padding: 40px;
                            text-align: center;
                            max-width: 450px;
                            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                        }
                        .safe-error-icon {
                            background: rgba(239, 68, 68, 0.15);
                            color: #ef4444;
                            width: 72px;
                            height: 72px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 20px;
                        }
                        .safe-error-card h3 {
                            font-size: 1.25rem;
                            margin-bottom: 8px;
                            color: var(--text-primary, white);
                        }
                        .safe-error-module {
                            color: var(--accent-primary, #6366f1);
                            font-size: 0.9rem;
                            margin-bottom: 12px;
                        }
                        .safe-error-message {
                            color: var(--text-secondary, #888);
                            font-size: 0.9rem;
                            margin-bottom: 20px;
                        }
                        .safe-error-details {
                            text-align: left;
                            margin: 16px 0;
                            padding: 12px;
                            background: rgba(0,0,0,0.3);
                            border-radius: 8px;
                            font-size: 0.8rem;
                        }
                        .safe-error-details summary {
                            cursor: pointer;
                            color: var(--text-muted, #666);
                            margin-bottom: 8px;
                        }
                        .safe-error-details pre {
                            color: #f87171;
                            font-size: 0.75rem;
                            white-space: pre-wrap;
                            word-break: break-word;
                            max-height: 150px;
                            overflow: auto;
                        }
                        .safe-error-actions {
                            display: flex;
                            gap: 12px;
                            justify-content: center;
                            margin-top: 24px;
                        }
                        .safe-btn-retry {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            padding: 10px 20px;
                            background: var(--bg-tertiary, #2a2a4a);
                            border: 1px solid var(--border-color, #3a3a5a);
                            border-radius: 8px;
                            cursor: pointer;
                            color: var(--text-primary, white);
                            font-weight: 500;
                            transition: all 0.2s;
                        }
                        .safe-btn-retry:hover {
                            background: var(--bg-hover, #3a3a5a);
                            transform: translateY(-1px);
                        }
                        .safe-btn-home {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            padding: 10px 20px;
                            background: var(--accent-primary, #6366f1);
                            border-radius: 8px;
                            color: white;
                            text-decoration: none;
                            font-weight: 500;
                            transition: all 0.2s;
                        }
                        .safe-btn-home:hover {
                            opacity: 0.9;
                            transform: translateY(-1px);
                        }
                    `}</style>
                </div>
            )
        }

        // Wrap children in Suspense for lazy-loaded components
        return (
            <Suspense fallback={
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading {this.props.name || 'component'}...
                </div>
            }>
                {this.props.children}
            </Suspense>
        )
    }
}

/**
 * withSafeRender - HOC version for wrapping components
 * 
 * Usage:
 *   const SafeHRDashboard = withSafeRender(HRDashboard, 'HR Dashboard')
 */
export function withSafeRender(WrappedComponent, name) {
    return function SafeWrappedComponent(props) {
        return (
            <SafeRender name={name}>
                <WrappedComponent {...props} />
            </SafeRender>
        )
    }
}

export default SafeRender
