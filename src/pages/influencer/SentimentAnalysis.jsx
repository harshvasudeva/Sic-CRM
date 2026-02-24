import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { MessageCircle, ThumbsUp, ThumbsDown, Minus, TrendingUp } from 'lucide-react'
import { getCreators } from '../../stores/influencerStore'

const SENTIMENT_DATA = {
    'cr-001': {
        overall: 78,
        positive: 62,
        neutral: 24,
        negative: 14,
        topKeyword: 'authentic',
        trend: [
            { post: 'Post 1', positive: 58, neutral: 28, negative: 14, score: 72 },
            { post: 'Post 2', positive: 65, neutral: 22, negative: 13, score: 76 },
            { post: 'Post 3', positive: 60, neutral: 25, negative: 15, score: 73 },
            { post: 'Post 4', positive: 70, neutral: 20, negative: 10, score: 80 },
            { post: 'Post 5', positive: 55, neutral: 30, negative: 15, score: 70 },
            { post: 'Post 6', positive: 68, neutral: 22, negative: 10, score: 79 },
            { post: 'Post 7', positive: 62, neutral: 24, negative: 14, score: 74 },
            { post: 'Post 8', positive: 72, neutral: 18, negative: 10, score: 82 },
            { post: 'Post 9', positive: 58, neutral: 27, negative: 15, score: 72 },
            { post: 'Post 10', positive: 66, neutral: 22, negative: 12, score: 77 },
            { post: 'Post 11', positive: 64, neutral: 24, negative: 12, score: 76 },
            { post: 'Post 12', positive: 70, neutral: 20, negative: 10, score: 80 },
        ],
        positiveKeywords: ['authentic', 'relatable', 'love this', 'stunning', 'helpful', 'gorgeous'],
        negativeKeywords: ['sponsored', 'fake', 'overpriced', 'boring'],
        posts: [
            { id: 1, title: 'Morning Routine with Nykaa', date: '2026-01-15', score: 82, sentiment: 'positive', comments: 320 },
            { id: 2, title: 'Weekend Skincare Haul', date: '2026-01-10', score: 76, sentiment: 'positive', comments: 245 },
            { id: 3, title: 'Honest Review: Sugar Cosmetics', date: '2026-01-05', score: 68, sentiment: 'positive', comments: 198 },
            { id: 4, title: 'Winter Skin Tips', date: '2025-12-28', score: 73, sentiment: 'positive', comments: 412 },
            { id: 5, title: 'Sponsored: Mamaearth Serum', date: '2025-12-20', score: 45, sentiment: 'negative', comments: 567 },
            { id: 6, title: 'Get Ready With Me', date: '2025-12-15', score: 80, sentiment: 'positive', comments: 289 },
        ],
    },
    'cr-002': {
        overall: 85,
        positive: 71,
        neutral: 20,
        negative: 9,
        topKeyword: 'detailed',
        trend: [
            { post: 'Post 1', positive: 70, neutral: 20, negative: 10, score: 80 },
            { post: 'Post 2', positive: 75, neutral: 18, negative: 7, score: 84 },
            { post: 'Post 3', positive: 68, neutral: 22, negative: 10, score: 79 },
            { post: 'Post 4', positive: 78, neutral: 15, negative: 7, score: 86 },
            { post: 'Post 5', positive: 72, neutral: 19, negative: 9, score: 82 },
            { post: 'Post 6', positive: 70, neutral: 21, negative: 9, score: 81 },
            { post: 'Post 7', positive: 74, neutral: 18, negative: 8, score: 83 },
            { post: 'Post 8', positive: 68, neutral: 22, negative: 10, score: 79 },
            { post: 'Post 9', positive: 76, neutral: 16, negative: 8, score: 84 },
            { post: 'Post 10', positive: 71, neutral: 20, negative: 9, score: 81 },
            { post: 'Post 11', positive: 73, neutral: 19, negative: 8, score: 83 },
            { post: 'Post 12', positive: 80, neutral: 14, negative: 6, score: 87 },
        ],
        positiveKeywords: ['detailed', 'honest', 'best review', 'informative', 'unbiased', 'thorough'],
        negativeKeywords: ['too long', 'biased', 'paid'],
        posts: [
            { id: 1, title: 'Samsung S26 Ultra Review', date: '2026-01-18', score: 87, sentiment: 'positive', comments: 890 },
            { id: 2, title: 'Budget Phone Under 15K', date: '2026-01-12', score: 84, sentiment: 'positive', comments: 1200 },
            { id: 3, title: 'OnePlus 13 Camera Test', date: '2026-01-05', score: 79, sentiment: 'positive', comments: 756 },
            { id: 4, title: 'Boat Headphones Honest Review', date: '2025-12-28', score: 82, sentiment: 'positive', comments: 645 },
            { id: 5, title: 'Top 5 Gadgets of 2025', date: '2025-12-20', score: 86, sentiment: 'positive', comments: 1540 },
            { id: 6, title: 'iPhone vs Android 2026', date: '2025-12-14', score: 81, sentiment: 'positive', comments: 2100 },
        ],
    },
    'cr-003': {
        overall: 65,
        positive: 50,
        neutral: 30,
        negative: 20,
        topKeyword: 'motivating',
        trend: [
            { post: 'Post 1', positive: 48, neutral: 32, negative: 20, score: 64 },
            { post: 'Post 2', positive: 52, neutral: 28, negative: 20, score: 66 },
            { post: 'Post 3', positive: 45, neutral: 35, negative: 20, score: 63 },
            { post: 'Post 4', positive: 55, neutral: 28, negative: 17, score: 69 },
            { post: 'Post 5', positive: 50, neutral: 30, negative: 20, score: 65 },
            { post: 'Post 6', positive: 48, neutral: 32, negative: 20, score: 64 },
            { post: 'Post 7', positive: 53, neutral: 29, negative: 18, score: 68 },
            { post: 'Post 8', positive: 46, neutral: 34, negative: 20, score: 63 },
            { post: 'Post 9', positive: 54, neutral: 27, negative: 19, score: 68 },
            { post: 'Post 10', positive: 50, neutral: 30, negative: 20, score: 65 },
            { post: 'Post 11', positive: 51, neutral: 29, negative: 20, score: 66 },
            { post: 'Post 12', positive: 55, neutral: 27, negative: 18, score: 69 },
        ],
        positiveKeywords: ['motivating', 'inspiring', 'great form', 'goals'],
        negativeKeywords: ['unrealistic', 'too intense', 'dangerous', 'clickbait', 'misleading'],
        posts: [
            { id: 1, title: '30-Day Ab Challenge', date: '2026-01-14', score: 69, sentiment: 'positive', comments: 178 },
            { id: 2, title: 'My Protein Shake Recipe', date: '2026-01-08', score: 62, sentiment: 'neutral', comments: 134 },
            { id: 3, title: 'HealthKart Supplements Review', date: '2025-12-30', score: 45, sentiment: 'negative', comments: 289 },
            { id: 4, title: 'HIIT Workout at Home', date: '2025-12-22', score: 72, sentiment: 'positive', comments: 210 },
            { id: 5, title: 'Post-Workout Meal Prep', date: '2025-12-15', score: 66, sentiment: 'positive', comments: 156 },
            { id: 6, title: 'MuscleBlaze Whey Unboxing', date: '2025-12-10', score: 58, sentiment: 'neutral', comments: 198 },
        ],
    },
    'cr-004': {
        overall: 82,
        positive: 68,
        neutral: 22,
        negative: 10,
        topKeyword: 'mouthwatering',
        trend: [
            { post: 'Post 1', positive: 66, neutral: 24, negative: 10, score: 78 },
            { post: 'Post 2', positive: 70, neutral: 20, negative: 10, score: 80 },
            { post: 'Post 3', positive: 65, neutral: 25, negative: 10, score: 78 },
            { post: 'Post 4', positive: 72, neutral: 19, negative: 9, score: 82 },
            { post: 'Post 5', positive: 68, neutral: 22, negative: 10, score: 79 },
            { post: 'Post 6', positive: 74, neutral: 18, negative: 8, score: 83 },
            { post: 'Post 7', positive: 66, neutral: 24, negative: 10, score: 78 },
            { post: 'Post 8', positive: 70, neutral: 20, negative: 10, score: 80 },
            { post: 'Post 9', positive: 68, neutral: 22, negative: 10, score: 79 },
            { post: 'Post 10', positive: 71, neutral: 20, negative: 9, score: 81 },
            { post: 'Post 11', positive: 69, neutral: 21, negative: 10, score: 80 },
            { post: 'Post 12', positive: 75, neutral: 17, negative: 8, score: 84 },
        ],
        positiveKeywords: ['mouthwatering', 'drooling', 'must try', 'best food', 'delicious', 'craving'],
        negativeKeywords: ['overrated', 'expensive', 'not worth it'],
        posts: [
            { id: 1, title: 'Best Biriyani in Chennai', date: '2026-01-16', score: 88, sentiment: 'positive', comments: 945 },
            { id: 2, title: 'Swiggy Midnight Delivery Test', date: '2026-01-10', score: 75, sentiment: 'positive', comments: 567 },
            { id: 3, title: 'Street Food Tour Mumbai', date: '2026-01-03', score: 84, sentiment: 'positive', comments: 1230 },
            { id: 4, title: 'ITC Hotel Buffet Review', date: '2025-12-26', score: 80, sentiment: 'positive', comments: 678 },
            { id: 5, title: 'Zomato vs Swiggy Comparison', date: '2025-12-18', score: 82, sentiment: 'positive', comments: 1890 },
            { id: 6, title: 'Worst Food I Ever Ate', date: '2025-12-12', score: 70, sentiment: 'neutral', comments: 2340 },
        ],
    },
    'cr-005': {
        overall: 55,
        positive: 42,
        neutral: 30,
        negative: 28,
        topKeyword: 'beautiful',
        trend: [
            { post: 'Post 1', positive: 45, neutral: 30, negative: 25, score: 60 },
            { post: 'Post 2', positive: 40, neutral: 32, negative: 28, score: 56 },
            { post: 'Post 3', positive: 48, neutral: 28, negative: 24, score: 62 },
            { post: 'Post 4', positive: 35, neutral: 30, negative: 35, score: 50 },
            { post: 'Post 5', positive: 42, neutral: 30, negative: 28, score: 57 },
            { post: 'Post 6', positive: 44, neutral: 30, negative: 26, score: 59 },
            { post: 'Post 7', positive: 40, neutral: 32, negative: 28, score: 56 },
            { post: 'Post 8', positive: 46, neutral: 28, negative: 26, score: 60 },
            { post: 'Post 9', positive: 38, neutral: 32, negative: 30, score: 54 },
            { post: 'Post 10', positive: 43, neutral: 30, negative: 27, score: 58 },
            { post: 'Post 11', positive: 41, neutral: 31, negative: 28, score: 57 },
            { post: 'Post 12', positive: 44, neutral: 29, negative: 27, score: 59 },
        ],
        positiveKeywords: ['beautiful', 'wanderlust', 'dreamy'],
        negativeKeywords: ['ghosted', 'unreliable', 'incomplete', 'misleading', 'waste of time', 'scam'],
        posts: [
            { id: 1, title: 'Goa Beach Vlog', date: '2026-01-12', score: 62, sentiment: 'positive', comments: 234 },
            { id: 2, title: 'MakeMyTrip Hotel Review', date: '2025-12-28', score: 38, sentiment: 'negative', comments: 456 },
            { id: 3, title: 'Jaipur Heritage Walk', date: '2025-12-20', score: 65, sentiment: 'positive', comments: 189 },
            { id: 4, title: 'Airbnb Experience Review', date: '2025-12-12', score: 42, sentiment: 'negative', comments: 312 },
            { id: 5, title: 'Kerala Backwaters', date: '2025-12-05', score: 70, sentiment: 'positive', comments: 278 },
            { id: 6, title: 'Budget Travel Guide', date: '2025-11-28', score: 55, sentiment: 'neutral', comments: 167 },
        ],
    },
    'cr-006': {
        overall: 90,
        positive: 78,
        neutral: 16,
        negative: 6,
        topKeyword: 'hilarious',
        trend: [
            { post: 'Post 1', positive: 76, neutral: 18, negative: 6, score: 85 },
            { post: 'Post 2', positive: 80, neutral: 14, negative: 6, score: 87 },
            { post: 'Post 3', positive: 75, neutral: 19, negative: 6, score: 85 },
            { post: 'Post 4', positive: 82, neutral: 13, negative: 5, score: 89 },
            { post: 'Post 5', positive: 78, neutral: 16, negative: 6, score: 86 },
            { post: 'Post 6', positive: 80, neutral: 14, negative: 6, score: 87 },
            { post: 'Post 7', positive: 76, neutral: 18, negative: 6, score: 85 },
            { post: 'Post 8', positive: 84, neutral: 12, negative: 4, score: 90 },
            { post: 'Post 9', positive: 77, neutral: 17, negative: 6, score: 86 },
            { post: 'Post 10', positive: 79, neutral: 15, negative: 6, score: 87 },
            { post: 'Post 11', positive: 81, neutral: 14, negative: 5, score: 88 },
            { post: 'Post 12', positive: 85, neutral: 11, negative: 4, score: 91 },
        ],
        positiveKeywords: ['hilarious', 'legendary', 'dead', 'genius', 'crying laughing', 'relatable af'],
        negativeKeywords: ['cringe', 'forced'],
        posts: [
            { id: 1, title: 'Cred Payment Day Skit', date: '2026-01-20', score: 92, sentiment: 'positive', comments: 2340 },
            { id: 2, title: 'Indian Parents vs WiFi', date: '2026-01-14', score: 91, sentiment: 'positive', comments: 3200 },
            { id: 3, title: 'Dunzo Delivery Guy Life', date: '2026-01-08', score: 88, sentiment: 'positive', comments: 1890 },
            { id: 4, title: 'Office Meeting Parody', date: '2025-12-30', score: 90, sentiment: 'positive', comments: 2780 },
            { id: 5, title: 'Zepto 10-Min Delivery Roast', date: '2025-12-22', score: 87, sentiment: 'positive', comments: 1560 },
            { id: 6, title: 'New Year Resolutions Fail', date: '2025-12-16', score: 85, sentiment: 'positive', comments: 1890 },
        ],
    },
}

const PIE_COLORS = ['#10b981', '#6b7280', '#ef4444']

const tooltipStyle = {
    background: '#1e1e2d',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    fontSize: 12,
    color: '#fff',
}

function getSentimentColor(score) {
    if (score >= 70) return '#10b981'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
}

function getSentimentLabel(sentiment) {
    if (sentiment === 'positive') return { color: '#10b981', bg: 'rgba(16,185,129,0.15)' }
    if (sentiment === 'negative') return { color: '#ef4444', bg: 'rgba(239,68,68,0.15)' }
    return { color: '#6b7280', bg: 'rgba(107,114,128,0.15)' }
}

export default function SentimentAnalysis() {
    const [creators, setCreators] = useState([])
    const [selectedId, setSelectedId] = useState(null)

    useEffect(() => {
        const all = getCreators()
        setCreators(all)
        if (all.length > 0) setSelectedId(all[0].id)
    }, [])

    const data = selectedId ? SENTIMENT_DATA[selectedId] : null
    const selectedCreator = creators.find(c => c.id === selectedId)

    const pieData = data ? [
        { name: 'Positive', value: data.positive },
        { name: 'Neutral', value: data.neutral },
        { name: 'Negative', value: data.negative },
    ] : []

    return (
        <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
            <motion.div style={{ marginBottom: 28 }} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                    <span style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sentiment</span> Analysis
                </h1>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Analyze audience sentiment across creator posts and content</p>
            </motion.div>

            {/* Creator Selector */}
            <motion.div
                style={{
                    display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, padding: '12px 16px',
                }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            >
                <MessageCircle size={16} color="#94a3b8" />
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', flexShrink: 0 }}>Select Creator:</span>
                <select
                    style={{
                        padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.8rem', outline: 'none', cursor: 'pointer',
                    }}
                    value={selectedId || ''}
                    onChange={e => setSelectedId(e.target.value)}
                >
                    {creators.map(c => (
                        <option key={c.id} value={c.id} style={{ background: '#1e1e2d' }}>{c.name} ({c.handle})</option>
                    ))}
                </select>
                {selectedCreator && (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {selectedCreator.platform} | {selectedCreator.niche} | {(selectedCreator.followers / 1000).toFixed(0)}K followers
                    </span>
                )}
            </motion.div>

            {!data ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, color: '#94a3b8', gap: 12 }}>
                    <MessageCircle size={48} />
                    <p>No sentiment data available for this creator</p>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <motion.div
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    >
                        {[
                            { icon: TrendingUp, label: 'Overall Sentiment', value: `${data.overall}/100`, color: getSentimentColor(data.overall) },
                            { icon: ThumbsUp, label: 'Positive %', value: `${data.positive}%`, color: '#10b981' },
                            { icon: ThumbsDown, label: 'Negative %', value: `${data.negative}%`, color: '#ef4444' },
                            { icon: MessageCircle, label: 'Top Keyword', value: `"${data.topKeyword}"`, color: '#6366f1' },
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
                                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>{card.value}</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>{card.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Charts Row: Pie + Line */}
                    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, marginBottom: 24 }}>
                        {/* Sentiment Pie */}
                        <motion.div
                            style={{
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 16, padding: 24,
                            }}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        >
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <MessageCircle size={16} /> Sentiment Distribution
                            </h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        innerRadius={45}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}%`}
                                        labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                                    >
                                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={tooltipStyle} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                                {pieData.map((entry, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#94a3b8' }}>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[i] }} />
                                        {entry.name}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Sentiment Trend Line */}
                        <motion.div
                            style={{
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 16, padding: 24,
                            }}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        >
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <TrendingUp size={16} /> Sentiment Trend (Last 12 Posts)
                            </h3>
                            <ResponsiveContainer width="100%" height={240}>
                                <LineChart data={data.trend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="post" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 100]} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} name="Sentiment Score" />
                                    <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Positive %" />
                                    <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Negative %" />
                                </LineChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>

                    {/* Keywords Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                        {/* Positive Keywords */}
                        <motion.div
                            style={{
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 16, padding: 24,
                            }}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                        >
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ThumbsUp size={16} color="#10b981" /> Top Positive Keywords
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {data.positiveKeywords.map((kw, i) => (
                                    <motion.span
                                        key={i}
                                        style={{
                                            padding: '6px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500,
                                            background: 'rgba(16,185,129,0.1)', color: '#10b981',
                                            border: '1px solid rgba(16,185,129,0.2)',
                                        }}
                                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.04 }}
                                    >
                                        {kw}
                                    </motion.span>
                                ))}
                            </div>
                        </motion.div>

                        {/* Negative Keywords */}
                        <motion.div
                            style={{
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 16, padding: 24,
                            }}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        >
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ThumbsDown size={16} color="#ef4444" /> Top Negative Keywords
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {data.negativeKeywords.map((kw, i) => (
                                    <motion.span
                                        key={i}
                                        style={{
                                            padding: '6px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500,
                                            background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                                            border: '1px solid rgba(239,68,68,0.2)',
                                        }}
                                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 + i * 0.04 }}
                                    >
                                        {kw}
                                    </motion.span>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Post-by-Post Table */}
                    <motion.div
                        style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 16, padding: 24,
                        }}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    >
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Minus size={16} /> Post-by-Post Sentiment
                        </h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {['Post Title', 'Date', 'Score', 'Sentiment', 'Comments'].map(h => (
                                            <th key={h} style={{
                                                padding: '10px 14px', textAlign: 'left', fontSize: '0.75rem',
                                                color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)',
                                                textTransform: 'uppercase', letterSpacing: '0.05em',
                                            }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.posts.map((post, i) => {
                                        const sl = getSentimentLabel(post.sentiment)
                                        return (
                                            <motion.tr
                                                key={post.id}
                                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.04 }}
                                                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                                            >
                                                <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>
                                                    {post.title}
                                                </td>
                                                <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: '#94a3b8' }}>
                                                    {post.date}
                                                </td>
                                                <td style={{ padding: '12px 14px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{
                                                            width: 60, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden',
                                                        }}>
                                                            <motion.div
                                                                style={{ height: '100%', borderRadius: 3, background: getSentimentColor(post.score) }}
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${post.score}%` }}
                                                                transition={{ duration: 0.6, delay: 0.4 + i * 0.04 }}
                                                            />
                                                        </div>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: getSentimentColor(post.score) }}>
                                                            {post.score}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 14px' }}>
                                                    <span style={{
                                                        display: 'inline-block', padding: '3px 10px', borderRadius: 8,
                                                        fontSize: '0.7rem', fontWeight: 600, background: sl.bg, color: sl.color,
                                                        textTransform: 'capitalize',
                                                    }}>
                                                        {post.sentiment}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: '#94a3b8' }}>
                                                    {post.comments.toLocaleString()}
                                                </td>
                                            </motion.tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    )
}
