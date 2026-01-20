import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, Users, DollarSign, Plus, Edit, User } from 'lucide-react'
import { getDepartments, getEmployees, createDepartment } from '../../stores/hrStore'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput from '../../components/FormInput'
import { useToast } from '../../components/Toast'

function Departments() {
    const toast = useToast()
    const [departments, setDepartments] = useState([])
    const [employees, setEmployees] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '', budget: '' })

    useEffect(() => {
        const load = async () => {
            setDepartments(await getDepartments())
            setEmployees(await getEmployees())
        }
        load()
    }, [])

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error('Department name is required')
            return
        }
        await createDepartment({ ...formData, budget: parseFloat(formData.budget) || 0, employeeCount: 0 })
        toast.success('Department created')
        setIsModalOpen(false)
        setDepartments(await getDepartments())
    }

    const getHeadName = (id) => {
        const emp = employees.find(e => e.id === id)
        return emp ? `${emp.firstName} ${emp.lastName}` : 'Vacant'
    }

    const getDeptEmployeeCount = (deptName) => {
        return employees.filter(e => e.department === deptName).length
    }

    const totalBudget = departments.reduce((sum, d) => sum + (d.budget || 0), 0)
    const totalEmployees = employees.length

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Departments</span></h1>
                    <p className="page-description">Manage organizational structure and departments.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={20} /> Add Department</button>
            </motion.div>

            <div className="dept-stats">
                <div className="dept-stat"><Building2 size={24} /><span>{departments.length}</span><small>Departments</small></div>
                <div className="dept-stat"><Users size={24} /><span>{totalEmployees}</span><small>Employees</small></div>
                <div className="dept-stat"><DollarSign size={24} /><span>${(totalBudget / 1000).toFixed(0)}K</span><small>Total Budget</small></div>
            </div>

            <div className="dept-grid">
                {departments.map((dept, i) => (
                    <motion.div key={dept.id} className="dept-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <div className="dept-icon"><Building2 size={24} /></div>
                        <h3>{dept.name}</h3>
                        <div className="dept-details">
                            <div className="dept-detail"><User size={14} /> Head: <strong>{getHeadName(dept.head)}</strong></div>
                            <div className="dept-detail"><Users size={14} /> <strong>{getDeptEmployeeCount(dept.name)}</strong> employees</div>
                            <div className="dept-detail"><DollarSign size={14} /> Budget: <strong>${(dept.budget / 1000).toFixed(0)}K</strong></div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Department" size="small">
                <FormInput label="Department Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <div style={{ marginTop: 16 }}>
                    <FormInput label="Budget" type="number" icon={DollarSign} value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} />
                </div>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit}>Create</button>
                </ModalFooter>
            </Modal>

            <style>{`
        .page-header { display: flex; justify-content: space-between; }
        .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; }
        .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); }
        .dept-stats { display: flex; gap: 16px; margin-bottom: 24px; }
        .dept-stat { display: flex; align-items: center; gap: 12px; padding: 16px 24px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
        .dept-stat svg { color: var(--accent-primary); }
        .dept-stat span { font-size: 1.25rem; font-weight: 700; }
        .dept-stat small { font-size: 0.85rem; color: var(--text-muted); }
        .dept-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .dept-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; text-align: center; }
        .dept-icon { width: 56px; height: 56px; margin: 0 auto 16px; background: rgba(99, 102, 241, 0.15); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: var(--accent-primary); }
        .dept-card h3 { margin-bottom: 16px; }
        .dept-details { display: flex; flex-direction: column; gap: 10px; }
        .dept-detail { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.9rem; color: var(--text-secondary); }
        .dept-detail strong { color: var(--text-primary); }
      `}</style>
        </div>
    )
}

export default Departments
