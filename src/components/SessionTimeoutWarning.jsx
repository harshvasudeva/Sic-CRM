import { motion, AnimatePresence } from 'framer-motion'
import { Clock, RefreshCw } from 'lucide-react'

function SessionTimeoutWarning({ show, formattedTime, onExtend }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="session-timeout-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="session-timeout-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="timeout-icon">
              <Clock size={32} />
            </div>
            <h3>Session Expiring</h3>
            <p>Your session will expire due to inactivity.</p>
            <div className="timeout-countdown">{formattedTime}</div>
            <button className="timeout-extend-btn" onClick={onExtend}>
              <RefreshCw size={16} />
              Continue Session
            </button>
          </motion.div>

          <style>{`
            .session-timeout-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.7);
              backdrop-filter: blur(8px);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 10000;
            }
            .session-timeout-modal {
              background: var(--card-bg, #1a1a2e);
              border: 1px solid var(--border-color);
              border-radius: 20px;
              padding: 40px;
              text-align: center;
              max-width: 380px;
              width: 90%;
            }
            .timeout-icon {
              width: 64px;
              height: 64px;
              border-radius: 50%;
              background: rgba(245, 158, 11, 0.15);
              color: #f59e0b;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
            }
            .session-timeout-modal h3 {
              font-size: 1.3rem;
              font-weight: 600;
              margin-bottom: 8px;
            }
            .session-timeout-modal p {
              color: var(--text-secondary);
              font-size: 0.9rem;
              margin-bottom: 20px;
            }
            .timeout-countdown {
              font-size: 2.5rem;
              font-weight: 700;
              font-variant-numeric: tabular-nums;
              color: #f59e0b;
              margin-bottom: 24px;
            }
            .timeout-extend-btn {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 12px 28px;
              background: var(--accent-gradient);
              color: white;
              border: none;
              border-radius: 12px;
              font-size: 0.95rem;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
            }
            .timeout-extend-btn:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SessionTimeoutWarning
