import { Component } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo })
        // Log to error reporting service in production
        console.error('Error caught by boundary:', error, errorInfo)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <motion.div
                        className="error-content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="error-icon">
                            <AlertTriangle size={48} />
                        </div>
                        <h1>Something went wrong</h1>
                        <p>We're sorry, but something unexpected happened. Please try refreshing the page or go back to the dashboard.</p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="error-details">
                                <code>{this.state.error.toString()}</code>
                            </div>
                        )}

                        <div className="error-actions">
                            <button className="error-btn secondary" onClick={this.handleReset}>
                                <RefreshCw size={18} />
                                Try Again
                            </button>
                            <a href="/" className="error-btn primary">
                                <Home size={18} />
                                Go to Dashboard
                            </a>
                        </div>
                    </motion.div>

                    <style>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 40px;
              background: var(--bg-primary);
            }

            .error-content {
              text-align: center;
              max-width: 500px;
            }

            .error-icon {
              width: 96px;
              height: 96px;
              margin: 0 auto 24px;
              border-radius: 24px;
              background: rgba(239, 68, 68, 0.15);
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--error);
            }

            .error-content h1 {
              font-size: 1.75rem;
              font-weight: 700;
              margin-bottom: 12px;
            }

            .error-content p {
              color: var(--text-secondary);
              line-height: 1.6;
              margin-bottom: 24px;
            }

            .error-details {
              background: var(--bg-tertiary);
              border: 1px solid var(--border-color);
              border-radius: var(--radius-md);
              padding: 16px;
              margin-bottom: 24px;
              text-align: left;
              overflow-x: auto;
            }

            .error-details code {
              font-size: 0.85rem;
              color: var(--error);
            }

            .error-actions {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
            }

            .error-btn {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 12px 24px;
              border-radius: var(--radius-md);
              font-size: 0.9rem;
              font-weight: 500;
              transition: all 0.2s;
            }

            .error-btn.primary {
              background: var(--accent-gradient);
              color: white;
            }

            .error-btn.primary:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
            }

            .error-btn.secondary {
              background: var(--bg-tertiary);
              border: 1px solid var(--border-color);
              color: var(--text-secondary);
            }

            .error-btn.secondary:hover {
              border-color: var(--accent-primary);
              color: var(--accent-primary);
            }
          `}</style>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
