import { motion } from 'framer-motion'

function MiniChart({ data, type = 'line', color = '#6366f1', height = 40 }) {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1

    if (type === 'bar') {
        return (
            <div className="mini-chart mini-chart-bar" style={{ height }}>
                {data.map((value, index) => (
                    <motion.div
                        key={index}
                        className="mini-bar"
                        initial={{ height: 0 }}
                        animate={{ height: `${((value - min) / range) * 100}%` }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        style={{
                            background: color,
                            minHeight: '4px'
                        }}
                    />
                ))}
                <style>{`
          .mini-chart-bar {
            display: flex;
            align-items: flex-end;
            gap: 3px;
          }
          .mini-bar {
            flex: 1;
            border-radius: 2px;
            opacity: 0.8;
          }
          .mini-bar:hover {
            opacity: 1;
          }
        `}</style>
            </div>
        )
    }

    // Line/Sparkline chart
    const width = 120
    const chartHeight = height
    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width
        const y = chartHeight - ((value - min) / range) * (chartHeight - 4) - 2
        return `${x},${y}`
    }).join(' ')

    const areaPoints = `0,${chartHeight} ${points} ${width},${chartHeight}`

    return (
        <div className="mini-chart mini-chart-line">
            <svg width={width} height={chartHeight} viewBox={`0 0 ${width} ${chartHeight}`}>
                {/* Area fill */}
                <motion.polygon
                    points={areaPoints}
                    fill={`url(#gradient-${color.replace('#', '')})`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    transition={{ duration: 0.5 }}
                />

                {/* Line */}
                <motion.polyline
                    points={points}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />

                {/* Gradient definition */}
                <defs>
                    <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>

            <style>{`
        .mini-chart-line {
          display: inline-block;
        }
        .mini-chart-line svg {
          display: block;
        }
      `}</style>
        </div>
    )
}

export default MiniChart
