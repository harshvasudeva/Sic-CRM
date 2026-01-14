import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Search } from 'lucide-react'

function NotFound() {
    const navigate = useNavigate()

    return (
        <div className="not-found">
            <motion.div
                className="not-found-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <motion.div
                    className="not-found-code"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                >
                    404
                </motion.div>

                <h1>Page Not Found</h1>
                <p>Oops! The page you're looking for doesn't exist or has been moved.</p>

                <div className="not-found-actions">
                    <button className="not-found-btn secondary" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                    <button className="not-found-btn primary" onClick={() => navigate('/')}>
                        <Home size={18} />
                        Dashboard
                    </button>
                </div>

                <div className="not-found-suggestions">
                    <h3>You might be looking for:</h3>
                    <div className="suggestion-links">
                        <a href="/sales">Sales</a>
                        <a href="/products">Products</a>
                        <a href="/crm">CRM</a>
                        <a href="/reports">Reports</a>
                        <a href="/settings">Settings</a>
                    </div>
                </div>
            </motion.div>

            <style>{`
        .not-found {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .not-found-content {
          text-align: center;
          max-width: 500px;
        }

        .not-found-code {
          font-size: 8rem;
          font-weight: 900;
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin-bottom: 16px;
        }

        .not-found-content h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .not-found-content p {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .not-found-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 48px;
        }

        .not-found-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .not-found-btn.primary {
          background: var(--accent-gradient);
          color: white;
        }

        .not-found-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
        }

        .not-found-btn.secondary {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
        }

        .not-found-btn.secondary:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        .not-found-suggestions {
          padding-top: 32px;
          border-top: 1px solid var(--border-color);
        }

        .not-found-suggestions h3 {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .suggestion-links {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }

        .suggestion-links a {
          padding: 8px 16px;
          background: var(--bg-glass);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          font-size: 0.85rem;
          color: var(--text-secondary);
          transition: all 0.2s;
        }

        .suggestion-links a:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }
      `}</style>
        </div>
    )
}

export default NotFound
