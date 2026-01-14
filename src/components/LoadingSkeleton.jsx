import { motion } from 'framer-motion'

function LoadingSkeleton({ variant = 'text', width, height, count = 1, className = '' }) {
    const skeletons = Array(count).fill(null)

    const getStyles = () => {
        switch (variant) {
            case 'circle':
                return {
                    width: width || 40,
                    height: height || 40,
                    borderRadius: '50%'
                }
            case 'card':
                return {
                    width: width || '100%',
                    height: height || 120,
                    borderRadius: 'var(--radius-lg)'
                }
            case 'title':
                return {
                    width: width || '60%',
                    height: height || 28,
                    borderRadius: 'var(--radius-sm)'
                }
            case 'avatar':
                return {
                    width: width || 48,
                    height: height || 48,
                    borderRadius: 'var(--radius-md)'
                }
            case 'button':
                return {
                    width: width || 100,
                    height: height || 40,
                    borderRadius: 'var(--radius-md)'
                }
            case 'text':
            default:
                return {
                    width: width || '100%',
                    height: height || 16,
                    borderRadius: 'var(--radius-sm)'
                }
        }
    }

    return (
        <>
            {skeletons.map((_, index) => (
                <motion.div
                    key={index}
                    className={`skeleton ${className}`}
                    style={getStyles()}
                    animate={{
                        opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: index * 0.1
                    }}
                />
            ))}
            <style>{`
        .skeleton {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.05) 100%
          );
          background-size: 200% 100%;
        }
      `}</style>
        </>
    )
}

// Preset skeleton layouts
export function CardSkeleton() {
    return (
        <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <LoadingSkeleton variant="avatar" />
                <div style={{ flex: 1 }}>
                    <LoadingSkeleton variant="title" width="50%" />
                    <div style={{ marginTop: 8 }}>
                        <LoadingSkeleton width="30%" />
                    </div>
                </div>
            </div>
            <LoadingSkeleton count={3} />
        </div>
    )
}

export function TableRowSkeleton({ columns = 5 }) {
    return (
        <tr>
            {Array(columns).fill(null).map((_, i) => (
                <td key={i} style={{ padding: '14px 16px' }}>
                    <LoadingSkeleton width={i === 0 ? '80%' : '60%'} />
                </td>
            ))}
        </tr>
    )
}

export function StatSkeleton() {
    return (
        <div className="stat-card">
            <LoadingSkeleton variant="avatar" width={56} height={56} />
            <div style={{ flex: 1 }}>
                <LoadingSkeleton variant="title" width="40%" />
                <div style={{ marginTop: 8 }}>
                    <LoadingSkeleton width="60%" />
                </div>
            </div>
        </div>
    )
}

export default LoadingSkeleton
