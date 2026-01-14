import { motion } from 'framer-motion'
import {
    UserCircle,
    Users,
    Building,
    FileText,
    Award,
    MapPin,
    Phone,
    GraduationCap,
    Briefcase,
    Heart,
    Home,
    LogOut
} from 'lucide-react'
import FeatureSection from '../components/FeatureSection'
import FeatureItem from '../components/FeatureItem'

const skills = [
    { category: 'Languages', items: ['English', 'Spanish', 'French', 'German'] },
    { category: 'Programming', items: ['Python', 'JavaScript', 'Java', 'SQL'] },
    { category: 'Soft Skills', items: ['Leadership', 'Communication', 'Problem Solving'] }
]

const workLocations = [
    { icon: Building, name: 'Office', description: 'On-site at company HQ' },
    { icon: Home, name: 'Home', description: 'Remote work from home' },
    { icon: MapPin, name: 'Branch', description: 'Regional office locations' }
]

const departureReasons = [
    { name: 'Resigned', color: 'var(--info)' },
    { name: 'Retired', color: 'var(--success)' },
    { name: 'Terminated', color: 'var(--error)' }
]

function HR() {
    return (
        <div className="page">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="page-title">
                    <span className="gradient-text">HR & Employees</span>
                </h1>
                <p className="page-description">
                    Sic CRM treats employees as a primary asset with comprehensive HR management.
                    Track profiles, organizational structure, contracts, and skills.
                </p>
            </motion.div>

            {/* Employee Profiles */}
            <FeatureSection icon={UserCircle} title="Employee Profiles" delay={0.2}>
                <div className="grid-3">
                    <motion.div className="card" whileHover={{ scale: 1.02 }}>
                        <div className="card-header">
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                <UserCircle size={24} />
                            </div>
                            <div>
                                <h3 className="card-title">Personal Information</h3>
                                <p className="card-subtitle">Private data management</p>
                            </div>
                        </div>
                        <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>• Contact details</li>
                            <li>• Date of birth</li>
                            <li>• Address information</li>
                            <li>• Bank account details</li>
                        </ul>
                    </motion.div>

                    <motion.div className="card" whileHover={{ scale: 1.02 }}>
                        <div className="card-header">
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
                                <GraduationCap size={24} />
                            </div>
                            <div>
                                <h3 className="card-title">Education & Citizenship</h3>
                                <p className="card-subtitle">Background information</p>
                            </div>
                        </div>
                        <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>• Education history</li>
                            <li>• Citizenship status</li>
                            <li>• Work permits</li>
                            <li>• Visa information</li>
                        </ul>
                    </motion.div>

                    <motion.div className="card" whileHover={{ scale: 1.02 }}>
                        <div className="card-header">
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)' }}>
                                <Phone size={24} />
                            </div>
                            <div>
                                <h3 className="card-title">Emergency Contacts</h3>
                                <p className="card-subtitle">Safety information</p>
                            </div>
                        </div>
                        <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>• Primary contact</li>
                            <li>• Relationship</li>
                            <li>• Phone numbers</li>
                            <li>• Medical info</li>
                        </ul>
                    </motion.div>
                </div>
            </FeatureSection>

            {/* Organizational Hierarchy */}
            <FeatureSection icon={Users} title="Organizational Hierarchy" delay={0.3}>
                <motion.div
                    className="card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    style={{ padding: '32px' }}
                >
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        Visual org chart showing the complete company structure:
                    </p>

                    {/* Org Chart Visualization */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px'
                    }}>
                        {/* CEO */}
                        <motion.div
                            style={{
                                padding: '16px 32px',
                                background: 'var(--accent-gradient)',
                                borderRadius: '12px',
                                color: 'white',
                                fontWeight: 600
                            }}
                            whileHover={{ scale: 1.05 }}
                        >
                            CEO
                        </motion.div>

                        {/* Connector */}
                        <div style={{ width: '2px', height: '20px', background: 'var(--border-color)' }} />

                        {/* Departments */}
                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {['Sales', 'Engineering', 'Marketing', 'Finance'].map((dept, index) => (
                                <motion.div
                                    key={dept}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                >
                                    <div style={{ width: '2px', height: '20px', background: 'var(--border-color)' }} />
                                    <div style={{
                                        padding: '12px 24px',
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '10px',
                                        fontWeight: 500
                                    }}>
                                        {dept}
                                    </div>
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: 'var(--text-muted)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center'
                                    }}>
                                        <span>↓</span>
                                        <span>Manager → Team</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </FeatureSection>

            <div className="grid-2">
                {/* Contracts */}
                <FeatureSection icon={FileText} title="Contracts" delay={0.4}>
                    <div className="feature-list">
                        <FeatureItem
                            icon={FileText}
                            title="Contract Management"
                            description="Create and track employee contracts with terms and conditions"
                            delay={0.1}
                        />
                        <FeatureItem
                            icon={Briefcase}
                            title="Wages & Salary"
                            description="Configure compensation packages and payment schedules"
                            delay={0.15}
                        />
                        <FeatureItem
                            icon={Heart}
                            title="Benefits"
                            description="Health insurance, retirement plans, and other perks"
                            delay={0.2}
                        />
                    </div>
                </FeatureSection>

                {/* Skill Management */}
                <FeatureSection icon={Award} title="Skill Management" delay={0.5}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        Track employee talents and competencies:
                    </p>
                    {skills.map((skillGroup, groupIndex) => (
                        <div key={groupIndex} style={{ marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-primary)' }}>
                                {skillGroup.category}
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {skillGroup.items.map((skill, index) => (
                                    <motion.span
                                        key={skill}
                                        className="badge"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6 + groupIndex * 0.1 + index * 0.05 }}
                                    >
                                        {skill}
                                    </motion.span>
                                ))}
                            </div>
                        </div>
                    ))}
                </FeatureSection>
            </div>

            {/* Work Options */}
            <FeatureSection icon={MapPin} title="Work Location Options" delay={0.6}>
                <div className="grid-3">
                    {workLocations.map((location, index) => (
                        <motion.div
                            key={index}
                            className="card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            style={{ textAlign: 'center', padding: '28px' }}
                        >
                            <div style={{
                                width: '56px',
                                height: '56px',
                                margin: '0 auto 16px',
                                borderRadius: '14px',
                                background: 'var(--accent-gradient)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <location.icon size={28} color="white" />
                            </div>
                            <h4 style={{ marginBottom: '8px' }}>{location.name}</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                {location.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </FeatureSection>

            {/* Departure Reasons */}
            <FeatureSection icon={LogOut} title="Departure Reasons" delay={0.7}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {departureReasons.map((reason, index) => (
                        <motion.div
                            key={index}
                            className="card"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                            style={{
                                padding: '16px 24px',
                                borderLeft: `3px solid ${reason.color}`,
                                flex: '1',
                                minWidth: '150px'
                            }}
                        >
                            <span style={{ fontWeight: 500 }}>{reason.name}</span>
                        </motion.div>
                    ))}
                </div>
            </FeatureSection>
        </div>
    )
}

export default HR
