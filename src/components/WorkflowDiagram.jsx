import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

function WorkflowDiagram({ steps }) {
    return (
        <div className="workflow">
            {steps.map((step, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                    <div className="workflow-step">
                        <div className="workflow-step-icon">
                            <step.icon size={20} />
                        </div>
                        <span className="workflow-step-label">{step.label}</span>
                    </div>
                    {index < steps.length - 1 && (
                        <ChevronRight className="workflow-arrow" size={24} />
                    )}
                </motion.div>
            ))}
        </div>
    )
}

export default WorkflowDiagram
