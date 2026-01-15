import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, Users, Search, MoreVertical, Trash2, Phone, Mail, Video } from 'lucide-react'
import Modal from '../../components/Modal'
import FormInput from '../../components/FormInput'
import FormTextarea from '../../components/FormTextarea'
import { useToast } from '../../components/Toast'

const channels = [
    { id: 'general', name: 'General', type: 'channel', unread: 3 },
    { id: 'sales', name: 'Sales Team', type: 'channel', unread: 0 },
    { id: 'support', name: 'Support', type: 'channel', unread: 5 },
    { id: 'hr', name: 'HR', type: 'channel', unread: 0 },
]

const directMessages = [
    { id: 'john', name: 'John Smith', status: 'online', avatar: 'J', lastMessage: 'Sure, I can help with that', time: '2m' },
    { id: 'sarah', name: 'Sarah Johnson', status: 'away', avatar: 'S', lastMessage: 'Meeting at 3pm', time: '1h' },
    { id: 'mike', name: 'Mike Davis', status: 'offline', avatar: 'M', lastMessage: 'Thanks!', time: '1d' },
]

const mockMessages = {
    general: [
        { id: 1, user: 'John Smith', avatar: 'J', text: 'Good morning everyone!', time: '9:00 AM' },
        { id: 2, user: 'Sarah Johnson', avatar: 'S', text: 'Hey! How is everyone doing today?', time: '9:05 AM' },
        { id: 3, user: 'Mike Davis', avatar: 'M', text: 'Great! Ready for the quarterly review', time: '9:10 AM' },
        { id: 4, user: 'John Smith', avatar: 'J', text: 'Meeting starts at 10 AM in the main conference room', time: '9:15 AM' },
    ],
    sales: [
        { id: 1, user: 'Sarah Johnson', avatar: 'S', text: 'Q4 targets are looking good!', time: '8:30 AM' },
        { id: 2, user: 'John Smith', avatar: 'J', text: 'Yes, we already hit 80% of our goal', time: '8:45 AM' },
    ],
    support: [
        { id: 1, user: 'Mike Davis', avatar: 'M', text: 'New ticket #1234 - Customer unable to login', time: '7:00 AM' },
        { id: 2, user: 'Sarah Johnson', avatar: 'S', text: 'I\'ll take care of it', time: '7:15 AM' },
        { id: 3, user: 'Mike Davis', avatar: 'M', text: 'Thanks Sarah', time: '7:20 AM' },
    ],
    hr: [
        { id: 1, user: 'Sarah Johnson', avatar: 'S', text: 'Reminder: Performance reviews due next week', time: 'Yesterday' },
    ],
    john: [
        { id: 1, user: 'You', avatar: 'Y', text: 'Hi John, can you help me with the sales report?', time: '10:30 AM' },
        { id: 2, user: 'John Smith', avatar: 'J', text: 'Sure, I can help with that', time: '10:32 AM' },
    ],
    sarah: [
        { id: 1, user: 'Sarah Johnson', avatar: 'S', text: 'Hey, do you have time for a quick sync?', time: '11:00 AM' },
        { id: 2, user: 'You', avatar: 'Y', text: 'Sure, what time works for you?', time: '11:05 AM' },
        { id: 3, user: 'Sarah Johnson', avatar: 'S', text: 'Meeting at 3pm', time: '11:10 AM' },
    ],
    mike: [
        { id: 1, user: 'You', avatar: 'Y', text: 'Thanks for your help yesterday!', time: 'Yesterday' },
        { id: 2, user: 'Mike Davis', avatar: 'M', text: 'Anytime! Let me know if you need anything else', time: 'Yesterday' },
        { id: 3, user: 'You', avatar: 'Y', text: 'Thanks!', time: 'Yesterday' },
    ],
}

function Discuss() {
    const toast = useToast()
    const [activeChannel, setActiveChannel] = useState('general')
    const [activeType, setActiveType] = useState('channels')
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState(mockMessages)
    const [searchTerm, setSearchTerm] = useState('')
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [activeChannel, messages])

    const handleSendMessage = () => {
        if (!message.trim()) return

        const newMessage = {
            id: Date.now(),
            user: 'You',
            avatar: 'Y',
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }

        setMessages({
            ...messages,
            [activeChannel]: [...(messages[activeChannel] || []), newMessage]
        })
        setMessage('')
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const filteredChannels = channels.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const filteredDMs = directMessages.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return 'bg-green-500'
            case 'away': return 'bg-yellow-500'
            case 'offline': return 'bg-gray-500'
            default: return 'bg-gray-500'
        }
    }

    return (
        <div className="flex h-[calc(100vh-80px)]">
            <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-700">
                    <h1 className="text-xl font-bold mb-4">Discuss</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="flex border-b border-gray-700">
                    <button
                        onClick={() => setActiveType('channels')}
                        className={`flex-1 py-3 text-sm font-medium ${
                            activeType === 'channels' ? 'bg-gray-700 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'
                        }`}
                    >
                        Channels
                    </button>
                    <button
                        onClick={() => setActiveType('dms')}
                        className={`flex-1 py-3 text-sm font-medium ${
                            activeType === 'dms' ? 'bg-gray-700 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'
                        }`}
                    >
                        Direct Messages
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {activeType === 'channels' ? (
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 px-3 py-2 uppercase tracking-wider">Channels</p>
                            {filteredChannels.map((channel) => (
                                <button
                                    key={channel.id}
                                    onClick={() => setActiveChannel(channel.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                                        activeChannel === channel.id ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    <Users size={18} />
                                    <span className="flex-1 text-left">{channel.name}</span>
                                    {channel.unread > 0 && (
                                        <span className="bg-blue-600 text-xs px-2 py-0.5 rounded-full">{channel.unread}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 px-3 py-2 uppercase tracking-wider">Direct Messages</p>
                            {filteredDMs.map((dm) => (
                                <button
                                    key={dm.id}
                                    onClick={() => setActiveChannel(dm.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                                        activeChannel === dm.id ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    <div className="relative">
                                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center font-medium">
                                            {dm.avatar}
                                        </div>
                                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(dm.status)}`} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-medium truncate">{dm.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{dm.lastMessage}</p>
                                    </div>
                                    <span className="text-xs text-gray-500">{dm.time}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-gray-900">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Users size={20} className="text-blue-400" />
                        <div>
                            <h2 className="font-semibold">
                                {channels.find(c => c.id === activeChannel)?.name || 
                                 directMessages.find(d => d.id === activeChannel)?.name}
                            </h2>
                            {directMessages.find(d => d.id === activeChannel) && (
                                <span className="text-xs text-gray-400">
                                    {directMessages.find(d => d.id === activeChannel)?.status}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-700 rounded">
                            <Phone size={18} />
                        </button>
                        <button className="p-2 hover:bg-gray-700 rounded">
                            <Video size={18} />
                        </button>
                        <button className="p-2 hover:bg-gray-700 rounded">
                            <MoreVertical size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages[activeChannel]?.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-3 ${msg.user === 'You' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium shrink-0 ${
                                msg.user === 'You' ? 'bg-blue-600' : 'bg-gray-600'
                            }`}>
                                {msg.avatar}
                            </div>
                            <div className={`max-w-md ${msg.user === 'You' ? 'items-end' : 'items-start'} flex flex-col`}>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className={`font-medium text-sm ${msg.user === 'You' ? 'text-blue-400' : ''}`}>
                                        {msg.user}
                                    </span>
                                    <span className="text-xs text-gray-500">{msg.time}</span>
                                </div>
                                <div className={`px-4 py-2 rounded-lg ${
                                    msg.user === 'You' ? 'bg-blue-600' : 'bg-gray-800'
                                }`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-gray-700">
                    <div className="flex gap-3">
                        <FormTextarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="flex-1 min-h-[44px] max-h-32 resize-none"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!message.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-4 rounded-lg flex items-center gap-2 transition-all"
                        >
                            <Send size={18} />
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Discuss
