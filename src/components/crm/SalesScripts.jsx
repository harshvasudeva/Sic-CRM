import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, X, ChevronRight, MessageCircle } from 'lucide-react'

function SalesScripts() {
    const [isOpen, setIsOpen] = useState(false)
    const [scripts, setScripts] = useState([])
    const [activeScript, setActiveScript] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen && scripts.length === 0) {
            loadScripts()
        }
    }, [isOpen])

    const loadScripts = async () => {
        setLoading(true)
        try {
            const res = await fetch('http://localhost:5000/api/crm/scripts')
            setScripts(await res.json())
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Toggle with hotkey could be added here

    return (
        <>
            <button
                className="fixed bottom-24 right-5 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg z-40 transition-transform hover:scale-105"
                onClick={() => setIsOpen(true)}
                title="Sales Scripts"
            >
                <BookOpen size={24} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        className="fixed top-0 right-0 h-full w-[400px] bg-gray-900 border-l border-gray-800 shadow-2xl z-50 flex flex-col"
                    >
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
                            <div className="flex items-center gap-2">
                                <BookOpen size={20} className="text-indigo-400" />
                                <h2 className="font-bold text-lg">Sales Scripts</h2>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col">
                            {!activeScript ? (
                                <div className="p-4 overflow-y-auto h-full space-y-3">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Available Scripts</h3>
                                    {scripts.map(script => (
                                        <button
                                            key={script.id}
                                            onClick={() => setActiveScript(script)}
                                            className="w-full text-left p-4 rounded-lg bg-gray-800 border border-gray-700 hover:border-indigo-500 transition-all group"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium group-hover:text-indigo-400">{script.title}</span>
                                                <ChevronRight size={16} className="text-gray-600 group-hover:text-indigo-400" />
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">{script.stage}</span>
                                            </div>
                                        </button>
                                    ))}
                                    {loading && <div className="text-center text-gray-500 py-4">Loading scripts...</div>}
                                    {!loading && scripts.length === 0 && (
                                        <div className="text-center text-gray-500 py-8">
                                            No scripts found. Add some in CRM Settings.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col h-full">
                                    <div className="p-2 border-b border-gray-800">
                                        <button
                                            onClick={() => setActiveScript(null)}
                                            className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                                        >
                                            <ChevronRight size={14} className="rotate-180" /> Back to list
                                        </button>
                                    </div>
                                    <div className="p-6 overflow-y-auto flex-1">
                                        <h3 className="text-xl font-bold mb-4 text-white">{activeScript.title}</h3>
                                        <div className="prose prose-invert prose-indigo max-w-none">
                                            <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-lg mb-6 text-indigo-200 text-sm italic flex gap-3">
                                                <MessageCircle size={18} className="shrink-0 mt-0.5" />
                                                Goal: Read this script when handling {activeScript.stage} objections.
                                            </div>
                                            <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                                                {activeScript.content}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default SalesScripts
