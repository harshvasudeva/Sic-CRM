import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Layout, Image, Type, Box, Palette, Save, Eye, Code, Smartphone } from 'lucide-react'
import Modal from '../../components/Modal'
import FormInput from '../../components/FormInput'
import FormTextarea from '../../components/FormTextarea'
import FormSelect from '../../components/FormInput'
import { useToast } from '../../components/Toast'

const templates = [
    { id: 1, name: 'Modern Business', preview: '🏢', sections: ['Hero', 'About', 'Services', 'Contact'] },
    { id: 2, name: 'E-commerce', preview: '🛒', sections: ['Hero', 'Products', 'Featured', 'Footer'] },
    { id: 3, name: 'Portfolio', preview: '🎨', sections: ['Hero', 'Gallery', 'About', 'Contact'] },
    { id: 4, name: 'Landing Page', preview: '🚀', sections: ['Hero', 'Features', 'Testimonials', 'CTA'] },
]

const components = [
    { id: 'hero', name: 'Hero Section', icon: <Layout size={16} /> },
    { id: 'text', name: 'Text Block', icon: <Type size={16} /> },
    { id: 'image', name: 'Image', icon: <Image size={16} /> },
    { id: 'button', name: 'Button', icon: <Box size={16} /> },
    { id: 'form', name: 'Contact Form', icon: <Code size={16} /> },
    { id: 'spacer', name: 'Spacer', icon: <Box size={16} /> },
]

function WebsiteBuilder() {
    const toast = useToast()
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState(null)
    const [previewMode, setPreviewMode] = useState(false)
    const [activeSection, setActiveSection] = useState(null)
    const [siteName, setSiteName] = useState('')

    const [pages, setPages] = useState([
        { id: 'home', name: 'Home', sections: [
            { id: 1, type: 'hero', content: { title: 'Welcome to Our Business', subtitle: 'Building the future together' } },
            { id: 2, type: 'text', content: { text: 'We provide exceptional services to help your business grow.' } },
        ]},
    ])
    const [activePage, setActivePage] = useState('home')

    const handleSelectTemplate = (template) => {
        setSelectedTemplate(template)
        setSiteName(template.name)
        setIsTemplateModalOpen(false)
        toast.success(`Selected ${template.name} template`)
    }

    const handleAddSection = (type) => {
        const newSection = {
            id: Date.now(),
            type,
            content: {}
        }
        setPages(pages.map(p =>
            p.id === activePage
                ? { ...p, sections: [...p.sections, newSection] }
                : p
        ))
    }

    const handleRemoveSection = (sectionId) => {
        setPages(pages.map(p =>
            p.id === activePage
                ? { ...p, sections: p.sections.filter(s => s.id !== sectionId) }
                : p
        ))
    }

    const handleUpdateSection = (sectionId, content) => {
        setPages(pages.map(p =>
            p.id === activePage
                ? {
                    ...p,
                    sections: p.sections.map(s =>
                        s.id === sectionId ? { ...s, content } : s
                    )
                }
                : p
        ))
    }

    const handleSave = () => {
        const siteData = {
            name: siteName,
            template: selectedTemplate,
            pages
        }
        localStorage.setItem('website-' + Date.now(), JSON.stringify(siteData))
        toast.success('Website saved successfully!')
    }

    const activePageData = pages.find(p => p.id === activePage)

    const renderSectionEditor = (section) => {
        switch (section.type) {
            case 'hero':
                return (
                    <div className="space-y-3">
                        <FormInput
                            label="Title"
                            value={section.content.title || ''}
                            onChange={(e) => handleUpdateSection(section.id, { ...section.content, title: e.target.value })}
                            placeholder="Hero title"
                        />
                        <FormTextarea
                            label="Subtitle"
                            value={section.content.subtitle || ''}
                            onChange={(e) => handleUpdateSection(section.id, { ...section.content, subtitle: e.target.value })}
                            placeholder="Hero subtitle"
                        />
                    </div>
                )
            case 'text':
                return (
                    <FormTextarea
                        label="Text Content"
                        value={section.content.text || ''}
                        onChange={(e) => handleUpdateSection(section.id, { ...section.content, text: e.target.value })}
                        placeholder="Enter your text here..."
                        rows={4}
                    />
                )
            default:
                return <p className="text-gray-400">No editor for this component type</p>
        }
    }

    const renderSectionPreview = (section) => {
        switch (section.type) {
            case 'hero':
                return (
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-12 rounded-lg text-center">
                        <h1 className="text-4xl font-bold mb-4">{section.content.title || 'Hero Title'}</h1>
                        <p className="text-xl opacity-90">{section.content.subtitle || 'Hero subtitle'}</p>
                    </div>
                )
            case 'text':
                return (
                    <div className="bg-gray-800 p-8 rounded-lg">
                        <p className="text-gray-300">{section.content.text || 'Your text content here...'}</p>
                    </div>
                )
            case 'button':
                return (
                    <div className="bg-gray-800 p-8 rounded-lg flex justify-center">
                        <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium">
                            {section.content.text || 'Click Here'}
                        </button>
                    </div>
                )
            default:
                return (
                    <div className="bg-gray-800 p-8 rounded-lg text-center text-gray-400">
                        {section.type} component
                    </div>
                )
        }
    }

    if (!selectedTemplate) {
        return (
            <div className="p-6">
                <div className="text-center py-20">
                    <Layout size={64} className="mx-auto mb-6 text-blue-400" />
                    <h1 className="text-3xl font-bold mb-4">Website Builder</h1>
                    <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                        Create beautiful websites for your business using our drag-and-drop builder
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsTemplateModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
                    >
                        <Plus size={18} className="inline mr-2" />
                        Start with a Template
                    </motion.button>
                </div>

                <Modal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} title="Choose a Template">
                    <div className="grid grid-cols-2 gap-4">
                        {templates.map((template) => (
                            <motion.button
                                key={template.id}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => handleSelectTemplate(template)}
                                className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-blue-500 rounded-lg p-6 text-left transition-all"
                            >
                                <div className="text-4xl mb-3">{template.preview}</div>
                                <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                                <p className="text-sm text-gray-400">
                                    {template.sections.join(', ')}
                                </p>
                            </motion.button>
                        ))}
                    </div>
                </Modal>
            </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-80px)]">
            <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-700">
                    <FormInput
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        placeholder="Site Name"
                    />
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Pages</p>
                    <div className="space-y-1 mb-6">
                        {pages.map((page) => (
                            <button
                                key={page.id}
                                onClick={() => setActivePage(page.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                                    activePage === page.id ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                {page.name}
                            </button>
                        ))}
                        <button className="w-full text-left px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-700 flex items-center gap-2">
                            <Plus size={14} />
                            Add Page
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Components</p>
                    <div className="space-y-1">
                        {components.map((comp) => (
                            <button
                                key={comp.id}
                                onClick={() => handleAddSection(comp.id)}
                                className="w-full text-left px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 flex items-center gap-2 transition-all"
                            >
                                {comp.icon}
                                {comp.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t border-gray-700 space-y-2">
                    <button
                        onClick={handleSave}
                        className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg flex items-center justify-center gap-2"
                    >
                        <Save size={16} />
                        Save Website
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-800">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">Editing:</span>
                        <span className="font-medium">{activePageData?.name}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                previewMode ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                        >
                            <Eye size={16} />
                            {previewMode ? 'Edit' : 'Preview'}
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                            <Smartphone size={16} />
                            Mobile
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="max-w-4xl mx-auto space-y-6">
                            {activePageData?.sections.map((section) => (
                                <div
                                    key={section.id}
                                    className={`relative ${!previewMode && 'ring-2 ring-transparent hover:ring-blue-500 rounded-lg'} ${activeSection === section.id && 'ring-2 ring-blue-500 rounded-lg'}`}
                                    onClick={() => !previewMode && setActiveSection(section.id)}
                                >
                                    {!previewMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleRemoveSection(section.id) }}
                                            className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 rounded opacity-0 hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                    {renderSectionPreview(section)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {!previewMode && activeSection && (
                        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
                            <h3 className="font-semibold mb-4">Edit {activeSection.type}</h3>
                            {activePageData?.sections.find(s => s.id === activeSection.id) && (
                                renderSectionEditor(activePageData.sections.find(s => s.id === activeSection.id))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default WebsiteBuilder
