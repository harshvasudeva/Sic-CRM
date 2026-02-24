import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, FileText, Copy, Check, Download, Clock, ChevronRight, Layout, Trash2 } from 'lucide-react'
import { getBriefTemplates, applyBriefTemplate } from '../../stores/influencerStore'

const PLATFORMS = ['Instagram', 'YouTube', 'Twitter', 'LinkedIn', 'TikTok']
const TONES = ['Professional', 'Casual', 'Playful', 'Bold', 'Inspirational', 'Informative']
const INDUSTRIES = ['Beauty', 'Tech', 'Food', 'Fitness', 'Travel', 'Fashion', 'Finance', 'Entertainment', 'Education', 'Health']

const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 }
const input = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#fff', width: '100%', fontSize: 14, outline: 'none' }
const btnPrimary = { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }
const btnSecondary = { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }

function generateBriefContent(form) {
    const { brandName, industry, targetAudience, keyMessages, tone, platform } = form
    const dosList = [
        `Use ${tone.toLowerCase()} tone throughout all content`,
        `Naturally showcase ${brandName} in everyday scenarios`,
        `Include clear call-to-action aligned with brand objectives`,
        `Engage with audience comments for first 2 hours post-publish`,
        `Tag @${brandName.toLowerCase().replace(/\s+/g, '')} in all posts`,
    ]
    const dontsList = [
        `Avoid mentioning competitor brands directly`,
        `Do not use aggressive sales language`,
        `Avoid controversial topics or political commentary`,
        `Do not alter brand logos or official assets`,
        `Do not post content outside the approved schedule`,
    ]
    const hashtags = [
        `#${brandName.replace(/\s+/g, '')}`,
        `#${industry}`,
        `#Ad`, `#Sponsored`, `#Collab`,
        `#${platform}Creator`,
        `#${brandName.replace(/\s+/g, '')}Partner`,
    ]
    const deliverables = platform === 'YouTube'
        ? ['1x Dedicated Video (8-12 min)', '2x YouTube Shorts', '1x Community Post', '1x Pinned Comment']
        : ['2x Reels (30-60 sec)', '3x Stories (with swipe-up/link)', '1x Carousel Post', '1x Static Post']

    return {
        objective: `Drive ${industry.toLowerCase()} awareness for ${brandName} among ${targetAudience} through authentic ${platform} content. The campaign will focus on building trust and engagement using a ${tone.toLowerCase()} approach, highlighting key product benefits and brand values.`,
        targetAudience: `Primary: ${targetAudience}. Demographics: 18-35, ${industry.toLowerCase()}-conscious consumers active on ${platform}. Psychographics: Value authenticity, seek recommendations from trusted creators, engage with lifestyle and ${industry.toLowerCase()} content regularly.`,
        keyMessagesList: keyMessages.split(',').map(m => m.trim()).filter(Boolean),
        contentGuidelines: `All content should be shot in natural lighting with ${tone.toLowerCase()} vibes. Product placement must feel organic -- not forced or scripted. Creators have creative freedom within brand guidelines. ${platform}-native formats preferred. Audio must include trending sounds or original voiceover.`,
        dos: dosList,
        donts: dontsList,
        hashtags,
        deliverables,
    }
}

export default function BriefGenerator() {
    const [templates, setTemplates] = useState([])
    const [selectedTemplate, setSelectedTemplate] = useState('')
    const [form, setForm] = useState({ brandName: '', industry: 'Beauty', targetAudience: '', keyMessages: '', tone: 'Professional', platform: 'Instagram' })
    const [brief, setBrief] = useState(null)
    const [generating, setGenerating] = useState(false)
    const [copied, setCopied] = useState(false)
    const [history, setHistory] = useState([])
    const [showHistory, setShowHistory] = useState(false)

    useEffect(() => { setTemplates(getBriefTemplates()) }, [])

    const handleTemplateSelect = templateId => {
        setSelectedTemplate(templateId)
        if (templateId) {
            const result = applyBriefTemplate(templateId, form.brandName, form.platform)
            if (result) {
                setForm(prev => ({ ...prev, keyMessages: result.messaging }))
            }
        }
    }

    const handleGenerate = () => {
        if (!form.brandName || !form.targetAudience) return
        setGenerating(true)
        setTimeout(() => {
            const result = generateBriefContent(form)
            setBrief(result)
            setHistory(prev => [{ ...form, brief: result, generatedAt: new Date().toISOString() }, ...prev])
            setGenerating(false)
        }, 1200)
    }

    const getBriefText = () => {
        if (!brief) return ''
        return `CREATIVE BRIEF: ${form.brandName}
========================================

OBJECTIVE
${brief.objective}

TARGET AUDIENCE
${brief.targetAudience}

KEY MESSAGES
${brief.keyMessagesList.map((m, i) => `${i + 1}. ${m}`).join('\n')}

CONTENT GUIDELINES
${brief.contentGuidelines}

DO'S
${brief.dos.map(d => `- ${d}`).join('\n')}

DON'TS
${brief.donts.map(d => `- ${d}`).join('\n')}

HASHTAGS
${brief.hashtags.join(' ')}

DELIVERABLES
${brief.deliverables.map(d => `- ${d}`).join('\n')}

Platform: ${form.platform} | Tone: ${form.tone} | Industry: ${form.industry}
Generated: ${new Date().toLocaleDateString()}`
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(getBriefText())
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleExport = () => {
        const blob = new Blob([getBriefText()], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `brief-${form.brandName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.txt`
        a.click()
        URL.revokeObjectURL(url)
    }

    const sectionStyle = { marginBottom: 20 }
    const sectionTitle = { fontSize: 14, fontWeight: 600, color: '#a78bfa', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }
    const sectionBody = { fontSize: 13, color: '#cbd5e1', lineHeight: 1.7 }

    return (
        <div style={{ padding: '24px 32px', color: '#fff', minHeight: '100vh' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}><span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Brief</span> Generator</h1>
                <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>Generate AI-powered creative briefs for your campaigns</p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: brief ? '1fr 1.4fr' : '1fr', gap: 20 }}>
                {/* Input Form */}
                <div>
                    {/* Template Selector */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ ...card, marginBottom: 16 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}><Layout size={16} /> Start from Template</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                            {templates.map(t => (
                                <button key={t.id} onClick={() => handleTemplateSelect(t.id)} style={{ ...card, padding: 10, cursor: 'pointer', textAlign: 'center', border: selectedTemplate === t.id ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', background: selectedTemplate === t.id ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)' }}>
                                    <div style={{ fontSize: 20, marginBottom: 4 }}>{t.icon}</div>
                                    <div style={{ fontSize: 12, fontWeight: 500 }}>{t.name}</div>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={card}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={16} /> Brief Details</h3>
                        <div style={{ display: 'grid', gap: 14 }}>
                            <div>
                                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Brand Name *</label>
                                <input style={input} placeholder="e.g. Nykaa" value={form.brandName} onChange={e => setForm(p => ({ ...p, brandName: e.target.value }))} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Industry</label>
                                    <select style={input} value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))}>
                                        {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Platform</label>
                                    <select style={input} value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}>
                                        {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Target Audience *</label>
                                <input style={input} placeholder="e.g. Women 18-30, skincare enthusiasts" value={form.targetAudience} onChange={e => setForm(p => ({ ...p, targetAudience: e.target.value }))} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Key Messages (comma separated)</label>
                                <textarea style={{ ...input, minHeight: 70, resize: 'vertical' }} placeholder="e.g. Natural ingredients, SPF protection, daily routine" value={form.keyMessages} onChange={e => setForm(p => ({ ...p, keyMessages: e.target.value }))} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Tone</label>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {TONES.map(t => (
                                        <button key={t} onClick={() => setForm(p => ({ ...p, tone: t }))} style={{ padding: '6px 14px', borderRadius: 20, border: form.tone === t ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', background: form.tone === t ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', color: form.tone === t ? '#a78bfa' : '#94a3b8', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button style={{ ...btnPrimary, justifyContent: 'center', opacity: generating || (!form.brandName || !form.targetAudience) ? 0.5 : 1 }} onClick={handleGenerate} disabled={generating || !form.brandName || !form.targetAudience}>
                                {generating ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Sparkles size={16} /></motion.div> : <Sparkles size={16} />}
                                {generating ? 'Generating...' : 'Generate Brief'}
                            </button>
                        </div>
                    </motion.div>

                    {/* History */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ ...card, marginTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowHistory(!showHistory)}>
                            <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={16} /> Brief History ({history.length})</h3>
                            <ChevronRight size={16} style={{ color: '#64748b', transform: showHistory ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                        </div>
                        <AnimatePresence>
                            {showHistory && history.length > 0 && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginTop: 12 }}>
                                    {history.map((h, i) => (
                                        <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 500 }}>{h.brandName} - {h.platform}</div>
                                                <div style={{ fontSize: 11, color: '#64748b' }}>{new Date(h.generatedAt).toLocaleString()}</div>
                                            </div>
                                            <button style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: 12 }} onClick={() => { setForm({ brandName: h.brandName, industry: h.industry, targetAudience: h.targetAudience, keyMessages: h.keyMessages, tone: h.tone, platform: h.platform }); setBrief(h.brief) }}>
                                                Load
                                            </button>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {showHistory && !history.length && <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>No briefs generated yet</div>}
                    </motion.div>
                </div>

                {/* Brief Preview */}
                {brief && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Sparkles size={18} color="#a78bfa" /> Generated Brief</h3>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button style={btnSecondary} onClick={handleCopy}>
                                    {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy'}
                                </button>
                                <button style={btnSecondary} onClick={handleExport}>
                                    <Download size={14} /> Export
                                </button>
                            </div>
                        </div>

                        <div style={{ borderLeft: '3px solid #6366f1', paddingLeft: 16, marginBottom: 24 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>{form.brandName}</h2>
                            <div style={{ fontSize: 13, color: '#94a3b8' }}>{form.platform} | {form.industry} | {form.tone}</div>
                        </div>

                        <div style={sectionStyle}>
                            <div style={sectionTitle}>Objective</div>
                            <div style={sectionBody}>{brief.objective}</div>
                        </div>

                        <div style={sectionStyle}>
                            <div style={sectionTitle}>Target Audience</div>
                            <div style={sectionBody}>{brief.targetAudience}</div>
                        </div>

                        <div style={sectionStyle}>
                            <div style={sectionTitle}>Key Messages</div>
                            <div style={{ display: 'grid', gap: 6 }}>
                                {brief.keyMessagesList.map((m, i) => (
                                    <div key={i} style={{ ...sectionBody, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                        <span style={{ background: '#6366f1', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{i + 1}</span>
                                        {m}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={sectionStyle}>
                            <div style={sectionTitle}>Content Guidelines</div>
                            <div style={sectionBody}>{brief.contentGuidelines}</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, ...sectionStyle }}>
                            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: 14 }}>
                                <div style={{ ...sectionTitle, color: '#10b981' }}>Do's</div>
                                {brief.dos.map((d, i) => (
                                    <div key={i} style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 6, display: 'flex', gap: 6 }}>
                                        <Check size={13} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} /> {d}
                                    </div>
                                ))}
                            </div>
                            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: 14 }}>
                                <div style={{ ...sectionTitle, color: '#ef4444' }}>Don'ts</div>
                                {brief.donts.map((d, i) => (
                                    <div key={i} style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 6, display: 'flex', gap: 6 }}>
                                        <Trash2 size={13} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} /> {d}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={sectionStyle}>
                            <div style={sectionTitle}>Hashtags</div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {brief.hashtags.map((h, i) => (
                                    <span key={i} style={{ background: 'rgba(99,102,241,0.12)', color: '#a78bfa', fontSize: 12, padding: '4px 10px', borderRadius: 20, fontWeight: 500 }}>{h}</span>
                                ))}
                            </div>
                        </div>

                        <div style={sectionStyle}>
                            <div style={sectionTitle}>Deliverables</div>
                            {brief.deliverables.map((d, i) => (
                                <div key={i} style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }} />
                                    {d}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
