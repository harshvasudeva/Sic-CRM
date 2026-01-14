import { motion } from 'framer-motion'

function FeatureSection({ icon: Icon, title, children, delay = 0 }) {
    return (
        <motion.section
            className="section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
        >
            <div className="section-header">
                <Icon className="section-icon" size={24} />
                <h2 className="section-title">{title}</h2>
            </div>
            {children}
        </motion.section>
    )
}

export default FeatureSection
