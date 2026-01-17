import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Phone, Mail, Calendar, CheckCircle, Clock, Filter, Check } from 'lucide-react'
import { getActivities, createActivity, completeActivity, getContacts } from '../../stores/crmStore'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

const activityTypes = [
    { value: 'call', label: 'Phone Call' },
    { value: 'email', label: 'Email' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'task', label: 'Task' }
]

function Activities() {
    const toast = useToast()
    const [activities, setActivities] = useState([])
    const [contacts, setContacts] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [filterType, setFilterType] = useState('')
    const [filterCompleted, setFilterCompleted] = useState('')

    const [formData, setFormData] = useState({
        type: 'call', subject: '', contactId: '', date: '', duration: '', notes: ''
    })

    const loadData = async () => {
        const filters = {}
        if (filterCompleted !== '') filters.completed = filterCompleted === 'true'
        try {
            const activitiesData = await getActivities(filters)
            setActivities(activitiesData.filter(a => !filterType || a.type === filterType))
            const contactsData = await getContacts()
            setContacts(contactsData)
        } catch (error) {
            console.error('Failed to load activity data', error)
        }
    }

    useEffect(() => { loadData() }, [filterType, filterCompleted])

    const handleSubmit = async () => {
        if (!formData.subject || !formData.date) {
            toast.error('Subject and date are required')
            return
        }
        try {
            await createActivity(formData)
            toast.success('Activity created')
            setIsModalOpen(false)
            setFormData({ type: 'call', subject: '', contactId: '', date: '', duration: '', notes: '' })
            loadData()
        } catch (err) {
            toast.error('Operation failed')
        }
    }

    const handleComplete = async (id) => {
        try {
            await completeActivity(id)
            toast.success('Activity completed')
            loadData()
        } catch (err) {
            toast.error('Update failed')
        }
    }

    const getContactName = (id) => {
        const contact = contacts.find(c => c.id === id)
        return contact ? `${contact.firstName} ${contact.lastName}` : '—'
    }

    const contactOptions = contacts.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))

    const pending = activities.filter(a => !a.completed)
    const completed = activities.filter(a => a.completed)

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Activities</span></h1>
                    <p className="page-description">Track calls, emails, meetings, and tasks.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={20} /> Log Activity</button>
            </motion.div>

            <div className="activity-stats">
                <div className="act-stat pending"><Clock size={18} /><span>{pending.length}</span> Pending</div>
                <div className="act-stat completed"><CheckCircle size={18} /><span>{completed.length}</span> Completed</div>
            </div>

            <div className="filters-bar">
                <div className="filter-group">
                    <Filter size={18} />
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="">All Types</option>
                        {activityTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <select value={filterCompleted} onChange={(e) => setFilterCompleted(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="false">Pending</option>
                        <option value="true">Completed</option>
                    </select>
                </div>
            </div>

            <div className="activities-list">
                {activities.map((act, i) => (
                    <motion.div key={act.id} className={`activity-card ${act.completed ? 'completed' : ''}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <div className={`activity-icon ${act.type}`}>
                            {act.type === 'call' && <Phone size={18} />}
                            {act.type === 'email' && <Mail size={18} />}
                            {act.type === 'meeting' && <Calendar size={18} />}
                            {act.type === 'task' && <CheckCircle size={18} />}
                        </div>
                        <div className="activity-content">
                            <div className="activity-header">
                                <strong>{act.subject}</strong>
                                <span className="activity-date">{act.date}</span>
                            </div>
                            <div className="activity-meta">
                                <span className="activity-type">{act.type}</span>
                                {act.contactId && <span className="activity-contact">{getContactName(act.contactId)}</span>}
                                {act.duration && <span className="activity-duration">{act.duration} min</span>}
                            </div>
                            {act.notes && <p className="activity-notes">{act.notes}</p>}
                        </div>
                        {!act.completed && (
                            <button className="complete-btn" onClick={() => handleComplete(act.id)}>
                                <Check size={16} /> Complete
                            </button>
                        )}
                        {act.completed && <span className="done-badge"><CheckCircle size={14} /> Done</span>}
                    </motion.div>
                ))}
            </div>

            {/* Add Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Activity" size="medium">
                <div className="form-grid">
                    <FormSelect label="Type" options={activityTypes} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} />
                    <FormInput label="Date *" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                    <FormInput label="Subject *" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
                    <FormSelect label="Contact" options={[{ value: '', label: 'Select contact' }, ...contactOptions]} value={formData.contactId} onChange={(e) => setFormData({ ...formData, contactId: e.target.value })} />
                    <FormInput label="Duration (min)" type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
                </div>
                <FormTextarea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit}>Log Activity</button>
                </ModalFooter>
            </Modal>

            <style>{`
        .page-header { display: flex; justify-content: space-between; }
        .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; }
        .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); }
        .activity-stats { display: flex; gap: 16px; margin-bottom: 24px; }
        .act-stat { display: flex; align-items: center; gap: 10px; padding: 14px 20px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); }
        .act-stat.pending svg { color: var(--warning); }
        .act-stat.completed svg { color: var(--success); }
        .act-stat span { font-weight: 600; font-size: 1.1rem; }
        .filters-bar { display: flex; gap: 16px; margin-bottom: 24px; }
        .filter-group { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); }
        .filter-group svg { color: var(--text-muted); }
        .filter-group select { background: transparent; border: none; color: var(--text-primary); }
        .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px; }
        .activities-list { display: flex; flex-direction: column; gap: 12px; }
        .activity-card { display: flex; align-items: flex-start; gap: 16px; padding: 16px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
        .activity-card.completed { opacity: 0.6; }
        .activity-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .activity-icon.call { background: rgba(59, 130, 246, 0.15); color: var(--info); }
        .activity-icon.email { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
        .activity-icon.meeting { background: rgba(236, 72, 153, 0.15); color: #ec4899; }
        .activity-icon.task { background: rgba(16, 185, 129, 0.15); color: var(--success); }
        .activity-content { flex: 1; }
        .activity-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
        .activity-header strong { font-size: 0.95rem; }
        .activity-date { font-size: 0.8rem; color: var(--text-muted); }
        .activity-meta { display: flex; gap: 12px; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px; }
        .activity-type { text-transform: capitalize; padding: 2px 8px; background: rgba(255,255,255,0.05); border-radius: 8px; }
        .activity-notes { font-size: 0.85rem; color: var(--text-secondary); }
        .complete-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: rgba(16, 185, 129, 0.15); color: var(--success); border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 500; }
        .done-badge { display: flex; align-items: center; gap: 6px; color: var(--success); font-size: 0.85rem; }
      `}</style>
        </div>
    )
}

export default Activities
