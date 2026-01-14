import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Users, Calendar, Clock, Plus, Check } from 'lucide-react'
import { getTrainings, getEmployees, enrollInTraining, createTraining } from '../../stores/hrStore'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

function Trainings() {
    const toast = useToast()
    const [trainings, setTrainings] = useState([])
    const [employees, setEmployees] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({ title: '', description: '', startDate: '', endDate: '', duration: '', mode: 'online', capacity: 20, category: 'technical' })

    useEffect(() => {
        setTrainings(getTrainings())
        setEmployees(getEmployees())
    }, [])

    const handleSubmit = () => {
        if (!formData.title || !formData.startDate) {
            toast.error('Please fill required fields')
            return
        }
        createTraining(formData)
        toast.success('Training created')
        setIsModalOpen(false)
        setTrainings(getTrainings())
    }

    const handleEnroll = (trainingId, empId) => {
        enrollInTraining(trainingId, empId)
        toast.success('Enrolled successfully')
        setTrainings(getTrainings())
    }

    const categories = [
        { value: 'technical', label: 'Technical' },
        { value: 'leadership', label: 'Leadership' },
        { value: 'compliance', label: 'Compliance' },
        { value: 'soft-skills', label: 'Soft Skills' }
    ]

    const modes = [
        { value: 'online', label: 'Online' },
        { value: 'in-person', label: 'In-Person' },
        { value: 'hybrid', label: 'Hybrid' }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Training</span> Programs</h1>
                    <p className="page-description">Manage employee training and development.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> New Training
                </button>
            </motion.div>

            <div className="trainings-grid">
                {trainings.map((training, i) => (
                    <motion.div key={training.id} className="training-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <div className="training-header">
                            <span className={`training-category ${training.category}`}>{training.category}</span>
                            <span className={`training-status ${training.status}`}>{training.status}</span>
                        </div>
                        <h3>{training.title}</h3>
                        <p>{training.description}</p>
                        <div className="training-meta">
                            <span><Calendar size={14} /> {training.startDate}</span>
                            <span><Clock size={14} /> {training.duration}</span>
                            <span><Users size={14} /> {training.enrolled.length}/{training.capacity}</span>
                        </div>
                        <div className="training-mode">{training.mode}</div>
                    </motion.div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Training" size="medium">
                <div className="form-grid">
                    <FormInput label="Title *" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                    <FormSelect label="Category" options={categories} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                    <FormInput label="Start Date *" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                    <FormInput label="End Date" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                    <FormInput label="Duration" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g., 8 hours" />
                    <FormSelect label="Mode" options={modes} value={formData.mode} onChange={(e) => setFormData({ ...formData, mode: e.target.value })} />
                </div>
                <FormTextarea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit}>Create</button>
                </ModalFooter>
            </Modal>

            <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; }
        .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); }
        .trainings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        .training-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; }
        .training-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .training-category { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
        .training-category.technical { background: rgba(59, 130, 246, 0.15); color: var(--info); }
        .training-category.leadership { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
        .training-category.compliance { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
        .training-category.soft-skills { background: rgba(236, 72, 153, 0.15); color: #ec4899; }
        .training-status { font-size: 0.75rem; text-transform: capitalize; }
        .training-status.upcoming { color: var(--info); }
        .training-status.completed { color: var(--success); }
        .training-card h3 { font-size: 1rem; margin-bottom: 8px; }
        .training-card p { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px; }
        .training-meta { display: flex; gap: 16px; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px; }
        .training-meta span { display: flex; align-items: center; gap: 4px; }
        .training-mode { font-size: 0.8rem; color: var(--accent-primary); text-transform: capitalize; }
        .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px; }
      `}</style>
        </div>
    )
}

export default Trainings
