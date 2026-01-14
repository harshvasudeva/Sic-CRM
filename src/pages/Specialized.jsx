import { motion } from 'framer-motion'
import {
    Sparkles,
    ShoppingBag,
    MessageSquare,
    Calendar,
    Globe,
    CreditCard,
    Layout,
    MessageCircle,
    Smartphone,
    Send,
    Clock,
    Package,
    ShoppingCart,
    GraduationCap
} from 'lucide-react'
import FeatureSection from '../components/FeatureSection'
import FeatureItem from '../components/FeatureItem'

const specializedModules = [
    {
        icon: ShoppingBag,
        title: 'Point of Sale (POS)',
        description: 'Complete retail solution for in-store sales with touch-friendly interface',
        color: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        features: [
            { icon: Layout, title: 'Floor Plans', description: 'Design restaurant or store layouts' },
            { icon: CreditCard, title: 'Payment Processing', description: 'Multiple payment methods support' },
            { icon: Clock, title: 'Session Management', description: 'Cash register opening and closing' }
        ]
    },
    {
        icon: MessageSquare,
        title: 'Discuss',
        description: 'Internal communication hub for team collaboration',
        color: 'linear-gradient(135deg, #10b981, #34d399)',
        features: [
            { icon: MessageCircle, title: 'Direct Messages', description: 'Private conversations with team members' },
            { icon: Smartphone, title: 'WhatsApp Integration', description: 'Connect with WhatsApp for external chat' },
            { icon: Send, title: 'Canned Responses', description: 'Pre-defined replies for common queries' }
        ]
    },
    {
        icon: Calendar,
        title: 'Rental',
        description: 'Manage rental products, reservations, and availability',
        color: 'linear-gradient(135deg, #f59e0b, #fb923c)',
        features: [
            { icon: Package, title: 'Rental Products', description: 'Configure products available for rent' },
            { icon: Calendar, title: 'Reservation Tracking', description: 'Manage bookings and availability' },
            { icon: Clock, title: 'Pickup/Drop-off', description: 'Track rental item status and returns' }
        ]
    },
    {
        icon: Globe,
        title: 'Website & E-commerce',
        description: 'Build websites and manage online stores',
        color: 'linear-gradient(135deg, #ec4899, #f472b6)',
        features: [
            { icon: Globe, title: 'Website Builder', description: 'Drag-and-drop website creation tools' },
            { icon: ShoppingCart, title: 'Online Orders', description: 'E-commerce with cart and checkout' },
            { icon: GraduationCap, title: 'E-Learning', description: 'Create and sell online courses' }
        ]
    }
]

function Specialized() {
    return (
        <div className="page">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="page-title">
                    <span className="gradient-text">Specialized</span> Modules
                </h1>
                <p className="page-description">
                    Additional specialized modules for Point of Sale, internal communication,
                    rentals, website building, and e-commerce.
                </p>
            </motion.div>

            {specializedModules.map((module, moduleIndex) => (
                <FeatureSection
                    key={moduleIndex}
                    icon={module.icon}
                    title={module.title}
                    delay={0.2 + moduleIndex * 0.1}
                >
                    <motion.div
                        className="card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 + moduleIndex * 0.1 }}
                        style={{ marginBottom: '24px' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '16px',
                                background: module.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <module.icon size={32} color="white" />
                            </div>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <h3 style={{ marginBottom: '8px', fontSize: '1.25rem' }}>{module.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                    {module.description}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid-3">
                        {module.features.map((feature, featureIndex) => (
                            <motion.div
                                key={featureIndex}
                                className="card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.4 + moduleIndex * 0.1 + featureIndex * 0.05 }}
                                whileHover={{ scale: 1.02 }}
                                style={{ padding: '20px' }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '12px'
                                }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '10px',
                                        background: 'rgba(99, 102, 241, 0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <feature.icon size={18} color="var(--accent-primary)" />
                                    </div>
                                    <h4 style={{ fontSize: '0.95rem' }}>{feature.title}</h4>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {moduleIndex < specializedModules.length - 1 && (
                        <div style={{
                            margin: '40px 0',
                            height: '1px',
                            background: 'var(--border-color)'
                        }} />
                    )}
                </FeatureSection>
            ))}

            {/* Additional Info */}
            <motion.div
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                style={{
                    marginTop: '32px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    textAlign: 'center',
                    padding: '40px'
                }}
            >
                <Sparkles size={48} color="var(--accent-primary)" style={{ marginBottom: '16px' }} />
                <h3 style={{ marginBottom: '12px', fontSize: '1.5rem' }}>
                    Fully Integrated Suite
                </h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                    All Sic CRM modules work seamlessly together. Data flows automatically between
                    POS, Inventory, Accounting, and other modules for a unified business experience.
                </p>
            </motion.div>
        </div>
    )
}

export default Specialized
