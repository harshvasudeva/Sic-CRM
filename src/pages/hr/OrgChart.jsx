import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, ChevronDown, ChevronRight, Download } from 'lucide-react'

function OrgChart() {
    const [departments, setDepartments] = useState([])
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [dRes, eRes] = await Promise.all([
                fetch('http://localhost:5000/api/hr/departments'),
                fetch('http://localhost:5000/api/hr/employees')
            ])
            const depts = await dRes.json()
            const emps = await eRes.json()
            setDepartments(depts)
            setEmployees(emps)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Build hierarchy
    const buildHierarchy = () => {
        const CEO = employees.find(e => !e.managerId)
        if (!CEO) return null

        const buildNode = (person) => {
            const reports = employees.filter(e => e.managerId === person.id)
            return {
                ...person,
                children: reports.map(r => buildNode(r))
            }
        }
        return buildNode(CEO)
    }

    const tree = !loading ? buildHierarchy() : null

    const Node = ({ node }) => {
        const [expanded, setExpanded] = useState(true)
        const hasChildren = node.children && node.children.length > 0

        return (
            <div className="flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center bg-gray-800 border border-gray-700 rounded-lg p-3 min-w-[200px] hover:border-blue-500 transition-colors cursor-pointer relative z-10"
                    onClick={() => setExpanded(!expanded)}
                >
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mb-2">
                        {node.firstName[0]}{node.lastName[0]}
                    </div>
                    <div className="font-bold text-white mb-0.5">{node.firstName} {node.lastName}</div>
                    <div className="text-xs text-blue-400 mb-1">{node.position}</div>
                    <div className="text-xs text-gray-500">{node.department?.departmentName || 'No Dept'}</div>

                    {hasChildren && (
                        <div className="mt-2 text-gray-500">
                            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </div>
                    )}
                </motion.div>

                {hasChildren && expanded && (
                    <div className="flex flex-col items-center">
                        <div className="h-6 w-px bg-gray-600"></div>
                        <div className="flex gap-6 relative pt-6">
                            {node.children.map((child) => (
                                <div key={child.id} className="flex flex-col items-center relative">
                                    <div className="absolute -top-6 h-6 w-px bg-gray-600"></div>
                                    <Node node={child} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    if (loading) return <div>Loading...</div>

    return (
        <div className="p-6 h-full overflow-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Organization Chart</h1>
                <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm">
                    <Download size={16} /> Export
                </button>
            </div>

            <div className="min-w-full pb-20 flex justify-center">
                {tree ? (
                    <Node node={tree} />
                ) : (
                    <div className="text-center text-gray-500">
                        No hierarchy found. Make sure employees have managers assigned.
                    </div>
                )}
            </div>
        </div>
    )
}

export default OrgChart
