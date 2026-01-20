import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Plus, Pin, Clock, Users, Trash2 } from 'lucide-react'
import { getAnnouncements, createAnnouncement, getDepartments } from '../../stores/hrStore'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

function Announcements() {
    const toast = useToast()
    const [announcements, setAnnouncements] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({ title: '', content: '', priority: 'medium', departments: ['all'], expiresAt: '', pinned: false })

    useEffect(() => {
        const load = async () => {
            setAnnouncements(await getAnnouncements())
        }
        load()
    }, [])

    const handleSubmit = async () => {
        if (!formData.title || !formData.content) {
            toast.error('Please fill required fields')
            return
        }
        await createAnnouncement({ ...formData, author: 'emp-004' })
        toast.success('Announcement posted')
        setIsModalOpen(false)
        setAnnouncements(await getAnnouncements())
    }

    const priorities = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Announcements</span></h1>
                    <p className="page-description">Post company-wide or department announcements.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={20} /> New Announcement</button>
            </motion.div>

            <div className="announcements-list">
                {announcements.map((ann, i) => (
                    <motion.div key={ann.id} className={`announcement-card ${ann.priority}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <div className="ann-header">
                            <div className="ann-meta">
                                {ann.pinned && <span className="pin-badge"><Pin size={12} /> Pinned</span>}
                                <span className={`priority-badge ${ann.priority}`}>{ann.priority}</span>
                            </div>
                            <span className="ann-date"><Clock size={14} /> {ann.createdAt}</span>
                        </div>
                        <h3>{ann.title}</h3>
                        <p>{ann.content}</p>
                        <div className="ann-footer">
                            <span className="ann-audience"><Users size={14} /> {ann.departments.join(', ')}</span>
                            {ann.expiresAt && <span className="ann-expires">Expires: {ann.expiresAt}</span>}
                        </div>
                    </motion.div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Announcement" size="medium">
                <FormInput label="Title *" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                <FormTextarea label="Content *" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={4} />
                <div className="form-row">
                    <FormSelect label="Priority" options={priorities} value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} />
                    <FormInput label="Expires On" type="date" value={formData.expiresAt} onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })} />
                </div>
                <label className="checkbox-label">
                    <input type="checkbox" checked={formData.pinned} onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })} />
                    Pin this announcement
                </label>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit}>Post</button>
                </ModalFooter>
            </Modal>

            <style>{`
        .page-header { display: flex; justify-content: space-between; }
        .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; }
        .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); }
        .announcements-list { display: flex; flex-direction: column; gap: 16px; }
        .announcement-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; border-left: 4px solid var(--border-color); }
        .announcement-card.high { border-left-color: var(--error); }
        .announcement-card.medium { border-left-color: var(--warning); }
        .announcement-card.low { border-left-color: var(--info); }
        .ann-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .ann-meta { display: flex; gap: 10px; }
        .pin-badge { display: flex; align-items: center; gap: 4px; padding: 4px 8px; background: rgba(245, 158, 11, 0.15); color: var(--warning); border-radius: 10px; font-size: 0.75rem; }
        .priority-badge { padding: 4px 10px; border-radius: 10px; font-size: 0.75rem; text-transform: capitalize; }
        .priority-badge.high { background: rgba(239, 68, 68, 0.15); color: var(--error); }
        .priority-badge.medium { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
        .priority-badge.low { background: rgba(59, 130, 246, 0.15); color: var(--info); }
        .ann-date { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--text-muted); }
        .announcement-card h3 { font-size: 1.1rem; margin-bottom: 8px; }
        .announcement-card p { color: var(--text-secondary); margin-bottom: 12px; line-height: 1.5; }
        .ann-footer { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); }
        .ann-audience { display: flex; align-items: center; gap: 6px; }
        .form-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 16px 0; }
        .checkbox-label { display: flex; align-items: center; gap: 10px; margin: 16px 0; font-size: 0.9rem; cursor: pointer; }
        .checkbox-label input { width: 18px; height: 18px; }
      `}</style>
        </div>
    )
}

export default Announcements
