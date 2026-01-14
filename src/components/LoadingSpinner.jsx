import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

function LoadingSpinner({ size = 'medium', text, fullScreen = false }) {
    const sizeMap = {
        small: { spinner: 24, container: 60 },
        medium: { spinner: 40, container: 100 },
        large: { spinner: 56, container: 140 }
    }

    const dimensions = sizeMap[size] || sizeMap.medium

    const content = (
        <motion.div
            className="loading-spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <motion.div
                className="spinner-icon"
                style={{ width: dimensions.container, height: dimensions.container }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
                <Loader2 size={dimensions.spinner} />
            </motion.div>
            {text && <p className="spinner-text">{text}</p>}

            <style>{`
        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .spinner-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary);
        }

        .spinner-text {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .loading-fullscreen {
          position: fixed;
          inset: 0;
          background: var(--bg-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
      `}</style>
        </motion.div>
    )

    if (fullScreen) {
        return <div className="loading-fullscreen">{content}</div>
    }

    return content
}

// Page loading component
export function PageLoader() {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh'
        }}>
            <LoadingSpinner size="large" text="Loading..." />
        </div>
    )
}

// Button loading state
export function ButtonLoader({ size = 18 }) {
    return (
        <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ display: 'inline-flex' }}
        >
            <Loader2 size={size} />
        </motion.span>
    )
}

export default LoadingSpinner
