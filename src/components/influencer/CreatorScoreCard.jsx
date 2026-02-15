import { motion } from 'framer-motion'
import { Shield, ShieldCheck, ShieldAlert, Star, TrendingUp, Users, FileCheck } from 'lucide-react'
import { getCreatorTierLabel, getCreatorTierColor } from '../../stores/influencerStore'

function CreatorScoreCard({ creator, onVerify, compact = false }) {
    const { creatorScore, creatorTier, verificationStatus } = creator

    const verifyIcons = {
        verified: { icon: ShieldCheck, color: '#10b981', label: 'Verified' },
        pending: { icon: ShieldAlert, color: '#f59e0b', label: 'Pending' },
        unverified: { icon: Shield, color: '#6b7280', label: 'Unverified' },
    }
    const verify = verifyIcons[verificationStatus] || verifyIcons.unverified
    const tierColor = getCreatorTierColor(creatorTier)

    if (compact) {
        return (
            <div className="csc-compact">
                <div className="csc-score-mini" style={{ '--score-color': creatorScore.total >= 70 ? '#10b981' : creatorScore.total >= 40 ? '#f59e0b' : '#ef4444' }}>
                    {creatorScore.total}
                </div>
                <div className="csc-tier-badge" style={{ background: `${tierColor}20`, color: tierColor }}>
                    {creatorTier?.toUpperCase()}
                </div>
                <verify.icon size={14} style={{ color: verify.color }} />
                <style>{`
                    .csc-compact { display: flex; align-items: center; gap: 6px; }
                    .csc-score-mini {
                        font-size: 0.75rem; font-weight: 700; color: var(--score-color);
                        background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 6px;
                    }
                    .csc-tier-badge {
                        font-size: 0.6rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;
                        letter-spacing: 0.05em;
                    }
                `}</style>
            </div>
        )
    }

    return (
        <motion.div className="csc-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            {/* Score Gauge */}
            <div className="csc-score-section">
                <div className="csc-gauge">
                    <svg viewBox="0 0 120 120" width="100" height="100">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                        <circle cx="60" cy="60" r="52" fill="none"
                            stroke={creatorScore.total >= 70 ? '#10b981' : creatorScore.total >= 40 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="8" strokeLinecap="round"
                            strokeDasharray={`${(creatorScore.total / 100) * 327} 327`}
                            transform="rotate(-90 60 60)" style={{ transition: 'stroke-dasharray 0.8s ease' }}
                        />
                        <text x="60" y="55" textAnchor="middle" fill="white" fontSize="24" fontWeight="700">{creatorScore.total}</text>
                        <text x="60" y="72" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">/ 100</text>
                    </svg>
                </div>
                <div className="csc-tier" style={{ background: `${tierColor}20`, color: tierColor, borderColor: `${tierColor}40` }}>
                    <Star size={12} /> {getCreatorTierLabel(creatorTier)}
                </div>
            </div>

            {/* Breakdown */}
            <div className="csc-breakdown">
                {[
                    { label: 'Engagement', value: creatorScore.engagement, icon: TrendingUp, color: '#6366f1' },
                    { label: 'Audience', value: creatorScore.audienceQuality, icon: Users, color: '#10b981' },
                    { label: 'Reliability', value: creatorScore.reliability, icon: ShieldCheck, color: '#f59e0b' },
                    { label: 'Profile', value: creatorScore.completeness, icon: FileCheck, color: '#3b82f6' },
                ].map((item, i) => (
                    <div key={i} className="csc-metric">
                        <div className="csc-metric-header">
                            <item.icon size={12} style={{ color: item.color }} />
                            <span>{item.label}</span>
                            <span className="csc-metric-val">{item.value}%</span>
                        </div>
                        <div className="csc-bar-bg">
                            <motion.div className="csc-bar" style={{ background: item.color }}
                                initial={{ width: 0 }} animate={{ width: `${item.value}%` }}
                                transition={{ duration: 0.6, delay: i * 0.1 }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Verification */}
            <div className="csc-verify-section">
                <div className="csc-verify-status" style={{ color: verify.color }}>
                    <verify.icon size={16} /> {verify.label}
                </div>
                {onVerify && verificationStatus !== 'verified' && (
                    <button className="csc-verify-btn" onClick={() => onVerify(creator.id)}>
                        <ShieldCheck size={14} /> Verify
                    </button>
                )}
            </div>

            <style>{`
                .csc-card {
                    background: rgba(30,30,45,0.6); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 16px; padding: 20px;
                }
                .csc-score-section { display: flex; flex-direction: column; align-items: center; gap: 10px; margin-bottom: 16px; }
                .csc-gauge { position: relative; }
                .csc-tier {
                    display: flex; align-items: center; gap: 6px; padding: 4px 12px;
                    border-radius: 20px; font-size: 0.75rem; font-weight: 600; border: 1px solid;
                }
                .csc-breakdown { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
                .csc-metric-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font-size: 0.75rem; color: var(--text-secondary); }
                .csc-metric-val { margin-left: auto; font-weight: 600; color: var(--text-primary); }
                .csc-bar-bg { height: 4px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; }
                .csc-bar { height: 100%; border-radius: 4px; }
                .csc-verify-section { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); }
                .csc-verify-status { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 600; }
                .csc-verify-btn {
                    display: flex; align-items: center; gap: 4px; padding: 6px 12px;
                    background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3);
                    border-radius: 8px; color: #10b981; font-size: 0.75rem; font-weight: 600;
                    cursor: pointer; transition: all 0.15s;
                }
                .csc-verify-btn:hover { background: rgba(16,185,129,0.25); }
            `}</style>
        </motion.div>
    )
}

export default CreatorScoreCard
