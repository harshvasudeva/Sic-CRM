import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, User, MoreHorizontal, Phone, Mail, FileText } from 'lucide-react'
import { useToast } from '../../components/Toast'

function RecruitmentBoard() {
    const [candidates, setCandidates] = useState([])
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newItem, setNewItem] = useState({ name: '', email: '', phone: '', status: 'applied', jobPostingId: '' })
    const toast = useToast()

    const stages = [
        { id: 'applied', name: 'Applied', color: 'bg-blue-500/10 text-blue-500' },
        { id: 'screening', name: 'Screening', color: 'bg-purple-500/10 text-purple-500' },
        { id: 'interview', name: 'Interview', color: 'bg-orange-500/10 text-orange-500' },
        { id: 'offer', name: 'Offer', color: 'bg-yellow-500/10 text-yellow-500' },
        { id: 'hired', name: 'Hired', color: 'bg-green-500/10 text-green-500' },
        { id: 'rejected', name: 'Rejected', color: 'bg-red-500/10 text-red-500' }
    ]

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [cRes, jRes] = await Promise.all([
                fetch('http://localhost:5000/api/hr/candidates'),
                fetch('http://localhost:5000/api/hr/job-postings')
            ])
            setCandidates(await cRes.json())
            setJobs(await jRes.json())
        } catch (err) {
            console.error(err)
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await fetch('http://localhost:5000/api/hr/candidates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            })
            toast.success('Candidate added')
            setIsModalOpen(false)
            setNewItem({ name: '', email: '', phone: '', status: 'applied', jobPostingId: '' })
            loadData()
        } catch (err) {
            toast.error('Failed to add candidate')
        }
    }

    const updateStatus = async (id, status) => {
        try {
            await fetch(`http://localhost:5000/api/hr/candidates/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            })
            toast.success('Status updated')
            loadData()
        } catch (err) {
            toast.error('Failed to update status')
        }
    }

    const getJobTitle = (id) => jobs.find(j => j.id === id)?.title || 'General Application'

    if (loading) return <div>Loading...</div>

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Recruitment Pipeline</h1>
                    <p className="text-gray-400">Track candidates across {stages.length} stages</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                    <Plus size={18} /> Add Candidate
                </button>
            </div>

            <div className="flex gap-4 overflow-x-auto h-full pb-4">
                {stages.map(stage => (
                    <div key={stage.id} className="min-w-[300px] bg-gray-900/50 rounded-xl flex flex-col border border-gray-800">
                        <div className={`p-3 border-b border-gray-800 font-medium flex justify-between items-center ${stage.color}`}>
                            <span>{stage.name}</span>
                            <span className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded text-xs">
                                {candidates.filter(c => c.status === stage.id).length}
                            </span>
                        </div>
                        <div className="p-2 flex-1 overflow-y-auto space-y-2">
                            {candidates.filter(c => c.status === stage.id).map(candidate => (
                                <motion.div
                                    layoutId={candidate.id}
                                    key={candidate.id}
                                    className="bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-blue-500/50 cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-white">{candidate.name}</h3>
                                        <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                    <div className="text-xs text-blue-400 mb-2 bg-blue-400/10 inline-block px-2 py-0.5 rounded">
                                        {getJobTitle(candidate.jobPostingId)}
                                    </div>
                                    <div className="flex gap-3 text-gray-400 text-xs">
                                        {candidate.email && <div className="flex items-center gap-1"><Mail size={12} /> Email</div>}
                                        {candidate.phone && <div className="flex items-center gap-1"><Phone size={12} /> Call</div>}
                                    </div>

                                    <div className="mt-3 pt-2 border-t border-gray-700/50 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {stage.id !== 'applied' && (
                                            <button onClick={(e) => { e.stopPropagation(); updateStatus(candidate.id, stages[stages.indexOf(stage) - 1].id) }} className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600">
                                                &lt; Prev
                                            </button>
                                        )}
                                        {stage.id !== 'rejected' && (
                                            <button onClick={(e) => { e.stopPropagation(); updateStatus(candidate.id, stages[stages.indexOf(stage) + 1]?.id || 'hired') }} className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600">
                                                Next &gt;
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-[500px]">
                        <h2 className="text-xl font-bold mb-4">Add Candidate</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                                <input className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" required
                                    value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                                    <input className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" required type="email"
                                        value={newItem.email} onChange={e => setNewItem({ ...newItem, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Phone</label>
                                    <input className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                                        value={newItem.phone} onChange={e => setNewItem({ ...newItem, phone: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Job Opening</label>
                                <select className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                                    value={newItem.jobPostingId} onChange={e => setNewItem({ ...newItem, jobPostingId: e.target.value })}
                                >
                                    <option value="">General Application</option>
                                    {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-white hover:bg-gray-800 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Candidate</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default RecruitmentBoard
