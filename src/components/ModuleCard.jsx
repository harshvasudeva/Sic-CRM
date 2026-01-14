import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

function ModuleCard({ icon: Icon, title, description, features, path, color, delay = 0 }) {
    const navigate = useNavigate()

    return (
        <motion.div
            className="module-card"
            onClick={() => navigate(path)}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="module-card-header">
                <div className="module-card-icon" style={{ background: color }}>
                    <Icon size={26} />
                </div>
                <h3 className="module-card-title">{title}</h3>
            </div>
            <p className="module-card-description">{description}</p>
            <div className="module-card-features">
                {features.map((feature, index) => (
                    <span key={index} className="module-feature-tag">{feature}</span>
                ))}
            </div>
        </motion.div>
    )
}

export default ModuleCard
