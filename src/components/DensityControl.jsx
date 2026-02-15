import { useState, useEffect } from 'react'
import { AlignJustify, AlignCenter, AlignLeft } from 'lucide-react'

const densities = [
    { value: 'compact', label: 'Compact', icon: AlignLeft },
    { value: 'default', label: 'Comfortable', icon: AlignCenter },
    { value: 'spacious', label: 'Spacious', icon: AlignJustify },
]

function DensityControl({ style }) {
    const [density, setDensity] = useState(() =>
        localStorage.getItem('sic-density') || 'default'
    )

    useEffect(() => {
        if (density === 'default') {
            document.documentElement.removeAttribute('data-density')
        } else {
            document.documentElement.setAttribute('data-density', density)
        }
        localStorage.setItem('sic-density', density)
    }, [density])

    return (
        <div className="density-control" style={style}>
            {densities.map(d => (
                <button
                    key={d.value}
                    onClick={() => setDensity(d.value)}
                    className={`density-btn ${density === d.value ? 'active' : ''}`}
                    title={d.label}
                >
                    <d.icon size={14} />
                </button>
            ))}

            <style>{`
                .density-control {
                    display: flex;
                    gap: 2px;
                    padding: 2px;
                    background: var(--bg-tertiary);
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                }
                .density-btn {
                    padding: 6px 10px;
                    border-radius: 6px;
                    color: var(--text-muted);
                    transition: all 0.15s;
                    display: flex;
                    align-items: center;
                }
                .density-btn:hover {
                    color: var(--text-secondary);
                }
                .density-btn.active {
                    background: var(--accent-primary);
                    color: white;
                    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
                }
            `}</style>
        </div>
    )
}

export default DensityControl
