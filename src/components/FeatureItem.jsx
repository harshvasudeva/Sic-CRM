import { motion } from 'framer-motion'

function FeatureItem({ icon: Icon, title, description, delay = 0 }) {
    return (
        <motion.div
            className="feature-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay }}
            whileHover={{ scale: 1.01 }}
        >
            <div className="feature-icon">
                <Icon size={18} />
            </div>
            <div className="feature-content">
                <h4>{title}</h4>
                <p>{description}</p>
            </div>
        </motion.div>
    )
}

export default FeatureItem
