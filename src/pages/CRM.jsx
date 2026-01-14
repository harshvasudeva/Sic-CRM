import { motion } from 'framer-motion'
import {
    Users,
    Target,
    BarChart3,
    Star,
    MapPin,
    List,
    Calendar,
    PieChart,
    TrendingUp,
    ThumbsDown,
    Layers,
    Eye
} from 'lucide-react'
import FeatureSection from '../components/FeatureSection'
import FeatureItem from '../components/FeatureItem'

const pipelineStages = [
    { name: 'New', count: 24, description: 'Fresh leads awaiting qualification' },
    { name: 'Qualified', count: 18, description: 'Leads meeting criteria' },
    { name: 'Proposition', count: 12, description: 'Proposal sent to lead' },
    { name: 'Won', count: 8, description: 'Successfully closed deals' }
]

const viewOptions = [
    { icon: Layers, name: 'Kanban', description: 'Visual pipeline boards' },
    { icon: List, name: 'List', description: 'Tabular data view' },
    { icon: Calendar, name: 'Calendar', description: 'Schedule-based view' },
    { icon: PieChart, name: 'Pivot', description: 'Dynamic analysis' },
    { icon: BarChart3, name: 'Graph', description: 'Visual charts' },
    { icon: MapPin, name: 'Map View', description: 'Geographic locations' }
]

const lostReasons = [
    'Too Expensive',
    'Competitor Won',
    'No Budget',
    'Timeline Mismatch',
    'Feature Gap',
    'No Response'
]

function CRM() {
    return (
        <div className="page">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="page-title">
                    <span className="gradient-text">CRM</span> Module
                </h1>
                <p className="page-description">
                    Manage leads and sales opportunities through customizable pipelines.
                    Track every interaction, analyze probability, and close more deals.
                </p>
            </motion.div>

            {/* Pipeline Management */}
            <FeatureSection icon={Target} title="Pipeline Management" delay={0.2}>
                <div className="pipeline">
                    {pipelineStages.map((stage, index) => (
                        <motion.div
                            key={index}
                            className="pipeline-stage"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                            whileHover={{ scale: 1.03 }}
                        >
                            <div className="pipeline-stage-header">
                                <span className="pipeline-stage-name">{stage.name}</span>
                                <span className="pipeline-stage-count">{stage.count}</span>
                            </div>
                            <p className="pipeline-stage-description">{stage.description}</p>
                        </motion.div>
                    ))}
                </div>
            </FeatureSection>

            <div className="grid-2">
                {/* Lead Analysis */}
                <FeatureSection icon={TrendingUp} title="Lead Analysis" delay={0.3}>
                    <div className="feature-list">
                        <FeatureItem
                            icon={BarChart3}
                            title="Probability Percentage"
                            description="AI-calculated win probability based on lead data and history"
                            delay={0.1}
                        />
                        <FeatureItem
                            icon={Star}
                            title="Priority Rating"
                            description="Star-based prioritization system for hot leads"
                            delay={0.15}
                        />
                        <FeatureItem
                            icon={TrendingUp}
                            title="Lead Scoring"
                            description="Automated scoring based on engagement and fit criteria"
                            delay={0.2}
                        />
                    </div>

                    {/* Probability Display */}
                    <motion.div
                        className="card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        style={{ marginTop: '20px' }}
                    >
                        <h4 style={{ marginBottom: '16px' }}>Win Probability Indicators</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { label: 'High Priority Lead', probability: 85, color: 'var(--success)' },
                                { label: 'Medium Priority', probability: 55, color: 'var(--warning)' },
                                { label: 'Low Priority', probability: 25, color: 'var(--error)' }
                            ].map((item, index) => (
                                <div key={index}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '0.85rem' }}>{item.label}</span>
                                        <span style={{ fontSize: '0.85rem', color: item.color }}>{item.probability}%</span>
                                    </div>
                                    <div style={{
                                        height: '6px',
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: '3px',
                                        overflow: 'hidden'
                                    }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.probability}%` }}
                                            transition={{ duration: 1, delay: 0.6 + index * 0.2 }}
                                            style={{
                                                height: '100%',
                                                background: item.color,
                                                borderRadius: '3px'
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </FeatureSection>

                {/* Lost Reasons */}
                <FeatureSection icon={ThumbsDown} title="Lost Reasons" delay={0.4}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        Customizable reasons for unsuccessful deals to improve future strategies:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {lostReasons.map((reason, index) => (
                            <motion.span
                                key={reason}
                                className="badge warning"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 + index * 0.05 }}
                            >
                                {reason}
                            </motion.span>
                        ))}
                    </div>

                    <motion.div
                        className="card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        style={{ marginTop: '24px', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    >
                        <h4 style={{ marginBottom: '8px', color: 'var(--error)' }}>💡 Pro Tip</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Analyzing lost reasons helps identify patterns and improve your sales process over time.
                        </p>
                    </motion.div>
                </FeatureSection>
            </div>

            {/* View Options */}
            <FeatureSection icon={Eye} title="View Options" delay={0.5}>
                <div className="view-options">
                    {viewOptions.map((view, index) => (
                        <motion.div
                            key={index}
                            className="view-option"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                            whileHover={{ scale: 1.05, borderColor: 'var(--accent-primary)' }}
                        >
                            <view.icon size={18} />
                            <div>
                                <span style={{ fontWeight: 500 }}>{view.name}</span>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    {view.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    className="card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    style={{
                        marginTop: '24px',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1))',
                        borderColor: 'rgba(59, 130, 246, 0.3)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <MapPin size={24} color="var(--info)" />
                        <h4>Map View Feature</h4>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Locate customers and leads by address on an interactive map. Perfect for
                        field sales teams planning visits and territory management.
                    </p>
                </motion.div>
            </FeatureSection>
        </div>
    )
}

export default CRM
