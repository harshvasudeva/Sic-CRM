import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, MapPin, Globe, ChevronDown } from 'lucide-react'
import { getCreators } from '../../stores/influencerStore'
import { getAudienceDemographics } from '../../stores/analyticsStore'

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6']

const styles = {
    page: { padding: '24px', maxWidth: 1400, margin: '0 auto' },
    header: { marginBottom: 28 },
    title: { fontSize: '1.6rem', fontWeight: 700, color: '#fff', marginBottom: 4 },
    gradient: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    subtitle: { fontSize: '0.85rem', color: '#94a3b8' },
    selectorWrap: { marginBottom: 24, position: 'relative', maxWidth: 340 },
    selectorBtn: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
        padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.85rem', cursor: 'pointer',
    },
    dropdown: {
        position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, zIndex: 50,
        background: '#1e1e2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
        maxHeight: 260, overflowY: 'auto', boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
    },
    dropItem: {
        padding: '10px 16px', cursor: 'pointer', fontSize: '0.85rem', color: '#94a3b8',
        borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s',
    },
    dropItemActive: { background: 'rgba(99,102,241,0.15)', color: '#fff' },
    summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 },
    summaryCard: {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: '20px 16px', textAlign: 'center',
    },
    summaryIcon: { width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' },
    summaryValue: { fontSize: '1.4rem', fontWeight: 700, color: '#fff' },
    summaryLabel: { fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 },
    chartsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 },
    card: {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: 24,
    },
    cardTitle: { fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
    locationRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
    locationName: { width: 90, fontSize: '0.8rem', color: '#94a3b8', flexShrink: 0 },
    locationBarBg: { flex: 1, height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' },
    locationBar: { height: '100%', borderRadius: 4, transition: 'width 0.6s ease' },
    locationPct: { width: 40, fontSize: '0.8rem', fontWeight: 600, color: '#fff', textAlign: 'right' },
    empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: '#94a3b8', gap: 12, fontSize: '0.9rem' },
}

const tooltipStyle = { background: '#1e1e2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }

function formatNum(n) {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return String(n)
}

export default function AudienceDemographics() {
    const [creators, setCreators] = useState([])
    const [selectedId, setSelectedId] = useState(null)
    const [demographics, setDemographics] = useState(null)
    const [dropOpen, setDropOpen] = useState(false)

    useEffect(() => {
        const all = getCreators()
        setCreators(all)
        if (all.length) {
            setSelectedId(all[0].id)
        }
    }, [])

    useEffect(() => {
        if (selectedId) {
            const d = getAudienceDemographics(selectedId)
            setDemographics(d)
        }
    }, [selectedId])

    const selectedCreator = creators.find(c => c.id === selectedId)

    const ageData = demographics ? Object.entries(demographics.age).map(([name, value]) => ({ name, value })) : []
    const genderData = demographics ? Object.entries(demographics.gender).map(([name, value]) => ({ name, value })) : []
    const locationEntries = demographics ? Object.entries(demographics.location).filter(([k]) => k !== 'Other').sort((a, b) => b[1] - a[1]).slice(0, 5) : []
    const countryEntries = demographics?.countries ? Object.entries(demographics.countries).filter(([k]) => k !== 'Other').sort((a, b) => b[1] - a[1]) : []

    // Summary calculations
    const totalAudience = selectedCreator ? selectedCreator.followers : 0
    const primaryAge = ageData.length ? ageData.reduce((max, d) => d.value > max.value ? d : max, ageData[0]).name : '--'
    const genderMajority = genderData.length ? genderData.reduce((max, d) => d.value > max.value ? d : max, genderData[0]) : null
    const topCity = locationEntries.length ? locationEntries[0][0] : '--'

    return (
        <div style={styles.page}>
            <motion.div style={styles.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={styles.title}><span style={styles.gradient}>Audience</span> Demographics</h1>
                <p style={styles.subtitle}>Deep-dive into creator audience composition - age, gender, geography</p>
            </motion.div>

            {/* Creator Selector */}
            <div style={styles.selectorWrap}>
                <button style={styles.selectorBtn} onClick={() => setDropOpen(!dropOpen)}>
                    <span>{selectedCreator ? `${selectedCreator.name} - ${selectedCreator.platform}` : 'Select Creator'}</span>
                    <ChevronDown size={16} />
                </button>
                {dropOpen && (
                    <motion.div style={styles.dropdown} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                        {creators.map(c => (
                            <div
                                key={c.id}
                                style={{ ...styles.dropItem, ...(c.id === selectedId ? styles.dropItemActive : {}) }}
                                onClick={() => { setSelectedId(c.id); setDropOpen(false) }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.background = c.id === selectedId ? 'rgba(99,102,241,0.15)' : 'transparent'}
                            >
                                {c.name} - {c.platform} ({formatNum(c.followers)})
                            </div>
                        ))}
                    </motion.div>
                )}
            </div>

            {!demographics ? (
                <div style={styles.empty}><Users size={48} /><p>No demographics data available for this creator</p></div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <motion.div style={styles.summaryGrid} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        {[
                            { icon: Users, label: 'Total Audience', value: formatNum(totalAudience), color: '#6366f1' },
                            { icon: Users, label: 'Primary Age Group', value: primaryAge, color: '#10b981' },
                            { icon: Users, label: 'Gender Majority', value: genderMajority ? `${genderMajority.name} (${genderMajority.value}%)` : '--', color: '#f59e0b' },
                            { icon: MapPin, label: 'Top City', value: topCity, color: '#ef4444' },
                        ].map((card, i) => (
                            <motion.div key={i} style={styles.summaryCard} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }}>
                                <div style={{ ...styles.summaryIcon, background: `${card.color}20`, color: card.color }}>
                                    <card.icon size={20} />
                                </div>
                                <div style={styles.summaryValue}>{card.value}</div>
                                <div style={styles.summaryLabel}>{card.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Charts Row: Age Distribution + Gender Split */}
                    <div style={styles.chartsGrid}>
                        <motion.div style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <div style={styles.cardTitle}><Users size={16} /> Age Distribution</div>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={ageData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit="%" />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} name="Percentage" />
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>

                        <motion.div style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                            <div style={styles.cardTitle}><Users size={16} /> Gender Split</div>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={genderData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}%`} labelLine={{ stroke: '#94a3b8' }}>
                                        {genderData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={tooltipStyle} />
                                </PieChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>

                    {/* Locations Row: Top Cities + Top Countries */}
                    <div style={styles.chartsGrid}>
                        <motion.div style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <div style={styles.cardTitle}><MapPin size={16} /> Top 5 Cities</div>
                            {locationEntries.map(([city, pct], i) => (
                                <div key={city} style={styles.locationRow}>
                                    <div style={styles.locationName}>{city}</div>
                                    <div style={styles.locationBarBg}>
                                        <motion.div
                                            style={{ ...styles.locationBar, background: PIE_COLORS[i % PIE_COLORS.length] }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.6, delay: 0.3 + i * 0.08 }}
                                        />
                                    </div>
                                    <div style={styles.locationPct}>{pct}%</div>
                                </div>
                            ))}
                        </motion.div>

                        <motion.div style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                            <div style={styles.cardTitle}><Globe size={16} /> Top Countries</div>
                            {countryEntries.map(([country, pct], i) => (
                                <div key={country} style={styles.locationRow}>
                                    <div style={styles.locationName}>{country}</div>
                                    <div style={styles.locationBarBg}>
                                        <motion.div
                                            style={{ ...styles.locationBar, background: PIE_COLORS[i % PIE_COLORS.length] }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.6, delay: 0.35 + i * 0.08 }}
                                        />
                                    </div>
                                    <div style={styles.locationPct}>{pct}%</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </>
            )}
        </div>
    )
}
