import { useState, useEffect } from 'react'
import { Calendar, Clock, User, Download, Filter } from 'lucide-react'

function TimeSheet() {
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/hr/time-entries')
                setEntries(await res.json())
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchEntries()
    }, [])

    const formatDuration = (duration) => {
        if (!duration) return 'Active'
        const h = Math.floor(duration / 60)
        const m = duration % 60
        return `${h}h ${m}m`
    }

    if (loading) return <div>Loading...</div>

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Time Sheets</h1>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded text-sm"><Filter size={16} /> Filter</button>
                    <button className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded text-sm"><Download size={16} /> Export</button>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-800 text-gray-400 text-sm">
                        <tr>
                            <th className="p-4 font-medium">Employee</th>
                            <th className="p-4 font-medium">Description</th>
                            <th className="p-4 font-medium">Date</th>
                            <th className="p-4 font-medium">Start Time</th>
                            <th className="p-4 font-medium">End Time</th>
                            <th className="p-4 font-medium text-right">Duration</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {entries.map(entry => (
                            <tr key={entry.id} className="hover:bg-gray-800/50">
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <User size={14} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">{entry.employee?.firstName} {entry.employee?.lastName}</div>
                                        <div className="text-xs text-gray-500">{entry.employee?.employeeId}</div>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-300">{entry.description}</td>
                                <td className="p-4 text-gray-400">{new Date(entry.startTime).toLocaleDateString()}</td>
                                <td className="p-4 text-gray-400">{new Date(entry.startTime).toLocaleTimeString()}</td>
                                <td className="p-4 text-gray-400">{entry.endTime ? new Date(entry.endTime).toLocaleTimeString() : '-'}</td>
                                <td className="p-4 text-right font-mono text-blue-400">
                                    {formatDuration(entry.duration)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TimeSheet
