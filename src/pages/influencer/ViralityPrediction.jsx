import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Zap, TrendingUp, Target, Users, Eye, ChevronRight, Award, Lightbulb } from 'lucide-react'
import { getCreators } from '../../stores/influencerStore'

const VIRALITY_DATA = {
    'cr-001': {
        viralityScore: 72,
        potential: 'High',
        factors: {
            contentConsistency: 78,
            trendAlignment: 65,
            engagementVelocity: 80,
            audienceGrowth: 68,
            shareability: 74,
            hookStrength: 70,
        },
        predictedReach: 68000,
        confidence: 78,
        history: [
            { post: 'Jan W1', reach: 42000, predicted: 40000 },
            { post: 'Jan W2', reach: 55000, predicted: 48000 },
            { post: 'Jan W3', reach: 48000, predicted: 52000 },
            { post: 'Dec W4', reach: 62000, predicted: 58000 },
            { post: 'Dec W3', reach: 39000, predicted: 45000 },
            { post: 'Dec W2', reach: 51000, predicted: 50000 },
            { post: 'Dec W1', reach: 44000, predicted: 46000 },
            { post: 'Nov W4', reach: 58000, predicted: 55000 },
        ],
        tips: [
            'Post between 6-8 PM IST for maximum initial velocity',
            'Trending audio hooks increase shareability by ~35%',
            'Carousel posts perform 2x better on weekends',
            'Engage with top comments in first 30 minutes for algorithm boost',
        ],
    },
    'cr-002': {
        viralityScore: 88,
        potential: 'High',
        factors: {
            contentConsistency: 85,
            trendAlignment: 82,
            engagementVelocity: 92,
            audienceGrowth: 90,
            shareability: 88,
            hookStrength: 86,
        },
        predictedReach: 220000,
        confidence: 85,
        history: [
            { post: 'Jan W1', reach: 190000, predicted: 185000 },
            { post: 'Jan W2', reach: 210000, predicted: 200000 },
            { post: 'Jan W3', reach: 175000, predicted: 195000 },
            { post: 'Dec W4', reach: 230000, predicted: 210000 },
            { post: 'Dec W3', reach: 195000, predicted: 190000 },
            { post: 'Dec W2', reach: 200000, predicted: 205000 },
            { post: 'Dec W1', reach: 185000, predicted: 188000 },
            { post: 'Nov W4', reach: 215000, predicted: 200000 },
        ],
        tips: [
            'YouTube Shorts with tech comparisons drive 3x more shares',
            'Thumbnail A/B testing shows 40% CTR improvement',
            'Collaboration videos with other tech creators boost reach 2.5x',
            'First 8 seconds determine 80% of watch time retention',
        ],
    },
    'cr-003': {
        viralityScore: 48,
        potential: 'Low',
        factors: {
            contentConsistency: 42,
            trendAlignment: 38,
            engagementVelocity: 55,
            audienceGrowth: 40,
            shareability: 52,
            hookStrength: 45,
        },
        predictedReach: 31000,
        confidence: 62,
        history: [
            { post: 'Jan W1', reach: 25000, predicted: 28000 },
            { post: 'Jan W2', reach: 30000, predicted: 27000 },
            { post: 'Jan W3', reach: 22000, predicted: 26000 },
            { post: 'Dec W4', reach: 28000, predicted: 25000 },
            { post: 'Dec W3', reach: 26000, predicted: 27000 },
            { post: 'Dec W2', reach: 24000, predicted: 26000 },
            { post: 'Dec W1', reach: 31000, predicted: 28000 },
            { post: 'Nov W4', reach: 27000, predicted: 29000 },
        ],
        tips: [
            'Increase posting frequency to at least 4x per week',
            'Jump on fitness challenges trending on Instagram Reels',
            'Transformation content (before/after) has highest share potential',
            'Collaborate with nutrition creators for cross-audience reach',
        ],
    },
    'cr-004': {
        viralityScore: 76,
        potential: 'High',
        factors: {
            contentConsistency: 80,
            trendAlignment: 72,
            engagementVelocity: 78,
            audienceGrowth: 70,
            shareability: 82,
            hookStrength: 75,
        },
        predictedReach: 115000,
        confidence: 80,
        history: [
            { post: 'Jan W1', reach: 95000, predicted: 92000 },
            { post: 'Jan W2', reach: 108000, predicted: 100000 },
            { post: 'Jan W3', reach: 88000, predicted: 95000 },
            { post: 'Dec W4', reach: 112000, predicted: 105000 },
            { post: 'Dec W3', reach: 90000, predicted: 98000 },
            { post: 'Dec W2', reach: 98000, predicted: 96000 },
            { post: 'Dec W1', reach: 102000, predicted: 100000 },
            { post: 'Nov W4', reach: 96000, predicted: 94000 },
        ],
        tips: [
            'Food reveal moments in first 3 seconds hook viewers instantly',
            'Location-based food content performs 50% better when tagged',
            'ASMR eating sounds increase watch time by 25%',
            'Street food content has 3x higher shareability than restaurant reviews',
        ],
    },
    'cr-005': {
        viralityScore: 38,
        potential: 'Low',
        factors: {
            contentConsistency: 28,
            trendAlignment: 35,
            engagementVelocity: 42,
            audienceGrowth: 32,
            shareability: 45,
            hookStrength: 40,
        },
        predictedReach: 40000,
        confidence: 45,
        history: [
            { post: 'Jan W1', reach: 35000, predicted: 38000 },
            { post: 'Jan W2', reach: 28000, predicted: 36000 },
            { post: 'Jan W3', reach: 40000, predicted: 34000 },
            { post: 'Dec W4', reach: 32000, predicted: 35000 },
            { post: 'Dec W3', reach: 36000, predicted: 37000 },
            { post: 'Dec W2', reach: 42000, predicted: 38000 },
            { post: 'Dec W1', reach: 30000, predicted: 36000 },
            { post: 'Nov W4', reach: 38000, predicted: 35000 },
        ],
        tips: [
            'Resume consistent posting schedule (currently too irregular)',
            'Travel Reels with trending audio are most likely to go viral',
            'Drone shots and time-lapses get 60% more saves',
            'Build reliability with audience through scheduled posting days',
        ],
    },
    'cr-006': {
        viralityScore: 94,
        potential: 'High',
        factors: {
            contentConsistency: 90,
            trendAlignment: 95,
            engagementVelocity: 96,
            audienceGrowth: 88,
            shareability: 98,
            hookStrength: 92,
        },
        predictedReach: 180000,
        confidence: 90,
        history: [
            { post: 'Jan W1', reach: 150000, predicted: 145000 },
            { post: 'Jan W2', reach: 175000, predicted: 160000 },
            { post: 'Jan W3', reach: 130000, predicted: 155000 },
            { post: 'Dec W4', reach: 190000, predicted: 170000 },
            { post: 'Dec W3', reach: 160000, predicted: 165000 },
            { post: 'Dec W2', reach: 170000, predicted: 162000 },
            { post: 'Dec W1', reach: 145000, predicted: 155000 },
            { post: 'Nov W4', reach: 185000, predicted: 175000 },
        ],
        tips: [
            'Comedy skits about trending topics have near-guaranteed virality',
            'Duets/collabs with other comedy creators compound reach',
            'Keep videos under 30 seconds for maximum completion rate',
            'Post right after trending news for topical comedy advantage',
        ],
    },
}

function getPotentialColor(potential) {
    if (potential === 'High') return { color: '#10b981', bg: 'rgba(16,185,129,0.15)' }
    if (potential === 'Medium') return { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' }
    return { color: '#ef4444', bg: 'rgba(239,68,68,0.15)' }
}

function getScoreColor(score) {
    if (score >= 75) return '#10b981'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
}

const formatNum = (n) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return String(n)
}

const tooltipStyle = {
    background: '#1e1e2d',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    fontSize: 12,
    color: '#fff',
}

export default function ViralityPrediction() {
    const [creators, setCreators] = useState([])
    const [selectedId, setSelectedId] = useState(null)

    useEffect(() => {
        const all = getCreators()
        setCreators(all)
        if (all.length > 0) setSelectedId(all[0].id)
    }, [])

    const data = selectedId ? VIRALITY_DATA[selectedId] : null
    const selectedCreator = creators.find(c => c.id === selectedId)

    const radarData = data ? [
        { factor: 'Consistency', value: data.factors.contentConsistency, fullMark: 100 },
        { factor: 'Trend Align', value: data.factors.trendAlignment, fullMark: 100 },
        { factor: 'Eng. Velocity', value: data.factors.engagementVelocity, fullMark: 100 },
        { factor: 'Aud. Growth', value: data.factors.audienceGrowth, fullMark: 100 },
        { factor: 'Shareability', value: data.factors.shareability, fullMark: 100 },
        { factor: 'Hook Strength', value: data.factors.hookStrength, fullMark: 100 },
    ] : []

    return (
        <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
            <motion.div style={{ marginBottom: 28 }} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                    <span style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Virality</span> Prediction
                </h1>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Predict content virality potential and optimize for maximum reach</p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
                {/* Creator List with Virality Scores */}
                <motion.div
                    style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 16, padding: 20, position: 'sticky', top: 20, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
                    }}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                >
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                        Creator Virality Scores
                    </h3>
                    {creators.map((c, i) => {
                        const vd = VIRALITY_DATA[c.id]
                        if (!vd) return null
                        const pc = getPotentialColor(vd.potential)
                        return (
                            <motion.button
                                key={c.id}
                                style={{
                                    display: 'flex', flexDirection: 'column', gap: 8, width: '100%',
                                    padding: 14, borderRadius: 12, border: 'none',
                                    background: selectedId === c.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                                    cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                                    marginBottom: 6,
                                }}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                onClick={() => setSelectedId(c.id)}
                                onMouseOver={e => { if (selectedId !== c.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                                onMouseOut={e => { if (selectedId !== c.id) e.currentTarget.style.background = 'transparent' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: selectedId === c.id ? '#fff' : '#e2e8f0' }}>{c.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{c.platform} | {c.niche}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 600,
                                            background: pc.bg, color: pc.color,
                                        }}>
                                            {vd.potential}
                                        </span>
                                        <ChevronRight size={14} color="#94a3b8" />
                                    </div>
                                </div>
                                {/* Progress Bar */}
                                <div style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Virality Score</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: getScoreColor(vd.viralityScore) }}>{vd.viralityScore}</span>
                                    </div>
                                    <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                                        <motion.div
                                            style={{ height: '100%', borderRadius: 3, background: getScoreColor(vd.viralityScore) }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${vd.viralityScore}%` }}
                                            transition={{ duration: 0.8, delay: i * 0.05 }}
                                        />
                                    </div>
                                </div>
                            </motion.button>
                        )
                    })}
                </motion.div>

                {/* Detail View */}
                <div>
                    {!data || !selectedCreator ? (
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            padding: 80, color: '#94a3b8', gap: 12,
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 16,
                        }}>
                            <Zap size={48} />
                            <p>Select a creator to view virality prediction</p>
                        </div>
                    ) : (
                        <>
                            {/* Top Summary */}
                            <motion.div
                                style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            >
                                {[
                                    { icon: Zap, label: 'Virality Score', value: `${data.viralityScore}/100`, color: getScoreColor(data.viralityScore) },
                                    { icon: Eye, label: 'Predicted Reach', value: formatNum(data.predictedReach), color: '#6366f1' },
                                    { icon: Target, label: 'Confidence', value: `${data.confidence}%`, color: '#3b82f6' },
                                    { icon: Award, label: 'Viral Potential', value: data.potential, color: getPotentialColor(data.potential).color },
                                ].map((card, i) => (
                                    <motion.div
                                        key={i}
                                        style={{
                                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 16, padding: '20px 16px', textAlign: 'center',
                                        }}
                                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }}
                                    >
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            margin: '0 auto 10px', background: `${card.color}20`, color: card.color,
                                        }}>
                                            <card.icon size={20} />
                                        </div>
                                        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>{card.value}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>{card.label}</div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Radar + History */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                                {/* Radar Chart */}
                                <motion.div
                                    style={{
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 16, padding: 24,
                                    }}
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                                >
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Target size={16} /> Virality Factors
                                    </h3>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <RadarChart data={radarData}>
                                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                            <PolarAngleAxis dataKey="factor" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                                            <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </motion.div>

                                {/* Historical Performance */}
                                <motion.div
                                    style={{
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 16, padding: 24,
                                    }}
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                >
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <TrendingUp size={16} /> Actual vs Predicted Reach
                                    </h3>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <LineChart data={data.history}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="post" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={formatNum} />
                                            <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatNum(v)} />
                                            <Line type="monotone" dataKey="reach" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} name="Actual Reach" />
                                            <Line type="monotone" dataKey="predicted" stroke="#6366f1" strokeWidth={2} strokeDasharray="6 3" dot={{ fill: '#6366f1', r: 3 }} name="Predicted" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            </div>

                            {/* Factor Breakdown + Tips */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                {/* Factor Bars */}
                                <motion.div
                                    style={{
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 16, padding: 24,
                                    }}
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                                >
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Users size={16} /> Factor Breakdown
                                    </h3>
                                    {Object.entries(data.factors).map(([key, val], i) => {
                                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
                                        return (
                                            <div key={key} style={{ marginBottom: 16 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>{label}</span>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: getScoreColor(val) }}>{val}%</span>
                                                </div>
                                                <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                                                    <motion.div
                                                        style={{ height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${getScoreColor(val)}, ${getScoreColor(val)}88)` }}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${val}%` }}
                                                        transition={{ duration: 0.8, delay: 0.3 + i * 0.06 }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </motion.div>

                                {/* Tips */}
                                <motion.div
                                    style={{
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 16, padding: 24,
                                    }}
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                >
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Lightbulb size={16} color="#f59e0b" /> Optimization Tips
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {data.tips.map((tip, i) => (
                                            <motion.div
                                                key={i}
                                                style={{
                                                    display: 'flex', alignItems: 'flex-start', gap: 12,
                                                    padding: 14, borderRadius: 12,
                                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                                }}
                                                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.06 }}
                                            >
                                                <div style={{
                                                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                                                    background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.75rem', fontWeight: 700,
                                                }}>
                                                    {i + 1}
                                                </div>
                                                <span style={{ fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.5 }}>{tip}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
