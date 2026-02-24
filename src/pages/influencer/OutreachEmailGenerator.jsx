import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Mail, Copy, Check, Sparkles, User, Building2, Megaphone,
    ChevronDown, FileText, Pencil, RefreshCw, X
} from 'lucide-react'
import { getCreators, generateColdMessages } from '../../stores/influencerStore'

const styles = {
    page: { padding: '24px', maxWidth: 1200, margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { color: '#fff', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 },
    subtitle: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
    card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 },
    label: { color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
    select: { width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none', appearance: 'none', cursor: 'pointer', boxSizing: 'border-box' },
    textarea: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px', color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical', minHeight: 200, fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' },
    btnPrimary: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
    btnSecondary: { background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
    toneBtn: (active) => ({ background: active ? '#6366f1' : 'rgba(255,255,255,0.05)', color: active ? '#fff' : '#94a3b8', border: `1px solid ${active ? '#6366f1' : 'rgba(255,255,255,0.1)'}`, borderRadius: 20, padding: '6px 16px', fontSize: 13, cursor: 'pointer', fontWeight: active ? 600 : 400, transition: 'all 0.2s' }),
    templateCard: (active) => ({ background: active ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${active ? '#6366f1' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, padding: '12px 16px', cursor: 'pointer', transition: 'all 0.2s' }),
    badge: { background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 },
    row: { display: 'flex', gap: 10, marginBottom: 16 },
    formGroup: { marginBottom: 16, flex: 1 },
    copySuccess: { color: '#10b981', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 },
}

const emailTemplates = [
    { id: 'cold-intro', name: 'Cold Introduction', desc: 'First-time outreach to a new creator', tone: 'Professional' },
    { id: 'collab-pitch', name: 'Collaboration Pitch', desc: 'Specific campaign opportunity', tone: 'Enthusiastic' },
    { id: 'follow-up', name: 'Follow Up', desc: 'Second touch after no reply', tone: 'Casual' },
    { id: 'rate-inquiry', name: 'Rate Inquiry', desc: 'Ask about pricing and availability', tone: 'Professional' },
    { id: 'brand-intro', name: 'Brand Introduction', desc: 'Introduce brand before pitching', tone: 'Professional' },
]

function generateFromTemplate(template, creator, brand, campaign, tone) {
    const tonePrefix = {
        Professional: 'Dear',
        Casual: 'Hey',
        Enthusiastic: 'Hi there'
    }
    const toneClosing = {
        Professional: 'Best regards,\n[Your Name]\n[Your Agency]',
        Casual: 'Cheers!\n[Your Name]',
        Enthusiastic: 'Super excited to hear from you!\n[Your Name]'
    }
    const greeting = `${tonePrefix[tone] || 'Hi'} ${creator}`

    const bodies = {
        'cold-intro': `${greeting},\n\nI have been following your content and truly admire your creative style and authentic engagement with your audience. We are working with ${brand} and believe your content would be a perfect fit for their upcoming initiatives.\n\nWe would love to explore a potential collaboration. Would you be open to a brief conversation about this?\n\n${toneClosing[tone]}`,
        'collab-pitch': `${greeting},\n\nWe are running an exciting campaign called "${campaign}" with ${brand}, and your content style aligns perfectly with what we are looking for.\n\nHere is a quick overview:\n- Brand: ${brand}\n- Campaign: ${campaign}\n- Deliverables: To be discussed based on your availability\n- Timeline: Flexible\n\nWould love to share the full brief with you. When would be a good time to connect?\n\n${toneClosing[tone]}`,
        'follow-up': `${greeting},\n\nJust circling back on my previous message about the ${brand} campaign. I completely understand you are busy, so no pressure at all.\n\nIf you are interested in hearing more about "${campaign}", I am happy to share the brief or hop on a quick 5-minute call.\n\nLooking forward to hearing from you!\n\n${toneClosing[tone]}`,
        'rate-inquiry': `${greeting},\n\nWe are putting together a campaign for ${brand} and would love to include you. Could you share your current rates for the following:\n\n- Dedicated post/reel\n- Story series\n- Video integration\n\nAlso, could you let us know your availability for the next 4-6 weeks?\n\n${toneClosing[tone]}`,
        'brand-intro': `${greeting},\n\nI wanted to introduce you to ${brand} - they are doing some incredible work in their space and are now looking to partner with authentic creators like you.\n\nBefore we dive into any specifics, I thought it would be great to give you some context about the brand and see if this sounds like something you would be interested in.\n\nThe campaign "${campaign}" is focused on genuine storytelling. Would love to tell you more!\n\n${toneClosing[tone]}`,
    }

    return bodies[template] || bodies['cold-intro']
}

export default function OutreachEmailGenerator() {
    const [creators, setCreators] = useState([])
    const [creatorName, setCreatorName] = useState('')
    const [brand, setBrand] = useState('')
    const [campaign, setCampaign] = useState('')
    const [tone, setTone] = useState('Professional')
    const [selectedTemplate, setSelectedTemplate] = useState('cold-intro')
    const [emailContent, setEmailContent] = useState('')
    const [copied, setCopied] = useState(false)
    const [showTemplates, setShowTemplates] = useState(false)
    const [generatedMessages, setGeneratedMessages] = useState(null)

    useEffect(() => {
        setCreators(getCreators())
    }, [])

    function handleGenerate() {
        if (!creatorName || !brand) return
        const content = generateFromTemplate(selectedTemplate, creatorName, brand, campaign || 'Upcoming Campaign', tone)
        setEmailContent(content)
        const msgs = generateColdMessages(creatorName, brand)
        setGeneratedMessages(msgs)
    }

    function handleCopy() {
        navigator.clipboard.writeText(emailContent)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    function handleCreatorSelect(name) {
        setCreatorName(name)
    }

    return (
        <motion.div style={styles.page} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={styles.header}>
                <div>
                    <div style={styles.title}><Mail size={22} color="#6366f1" /> Outreach Email Generator</div>
                    <div style={styles.subtitle}>Draft personalized outreach emails with AI-powered templates</div>
                </div>
                <button style={styles.btnSecondary} onClick={() => setShowTemplates(!showTemplates)}>
                    <FileText size={14} /> Template Library
                </button>
            </div>

            <AnimatePresence>
                {showTemplates && (
                    <motion.div style={{ ...styles.card, marginBottom: 20 }} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                            <span style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>Template Library</span>
                            <button onClick={() => setShowTemplates(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={16} /></button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                            {emailTemplates.map(t => (
                                <div key={t.id} style={styles.templateCard(selectedTemplate === t.id)} onClick={() => { setSelectedTemplate(t.id); setShowTemplates(false) }}>
                                    <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{t.name}</div>
                                    <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>{t.desc}</div>
                                    <span style={styles.badge}>{t.tone}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={styles.grid}>
                <div>
                    <motion.div style={styles.card} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Sparkles size={16} color="#6366f1" /> Input Details
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Creator Name</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    style={styles.input}
                                    value={creatorName}
                                    onChange={e => setCreatorName(e.target.value)}
                                    placeholder="Type or select a creator..."
                                    list="creator-list"
                                />
                                <datalist id="creator-list">
                                    {creators.map(c => <option key={c.id} value={c.name} />)}
                                </datalist>
                            </div>
                        </div>

                        <div style={styles.row}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Brand</label>
                                <input style={styles.input} value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Nykaa" />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Campaign</label>
                                <input style={styles.input} value={campaign} onChange={e => setCampaign(e.target.value)} placeholder="e.g. Summer Glow" />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Template</label>
                            <select style={styles.select} value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}>
                                {emailTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Tone</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {['Professional', 'Casual', 'Enthusiastic'].map(t => (
                                    <button key={t} style={styles.toneBtn(tone === t)} onClick={() => setTone(t)}>{t}</button>
                                ))}
                            </div>
                        </div>

                        <button style={{ ...styles.btnPrimary, width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={handleGenerate}>
                            <Sparkles size={16} /> Generate Email
                        </button>
                    </motion.div>

                    {generatedMessages && (
                        <motion.div style={{ ...styles.card, marginTop: 16 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Quick Messages</div>
                            {generatedMessages.openers.map((msg, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px', marginBottom: 8, color: '#e2e8f0', fontSize: 13, lineHeight: 1.5, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}
                                    onClick={() => { setEmailContent(msg); navigator.clipboard.writeText(msg) }}>
                                    <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}>Opener {i + 1} (click to copy)</div>
                                    {msg}
                                </div>
                            ))}
                            {generatedMessages.followUps.map((msg, i) => (
                                <div key={`f${i}`} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px', marginBottom: 8, color: '#e2e8f0', fontSize: 13, lineHeight: 1.5, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}
                                    onClick={() => { setEmailContent(msg); navigator.clipboard.writeText(msg) }}>
                                    <div style={{ color: '#f59e0b', fontSize: 11, marginBottom: 4 }}>Follow-up {i + 1} (click to copy)</div>
                                    {msg}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </div>

                <motion.div style={styles.card} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Pencil size={16} color="#6366f1" /> Email Preview
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {emailContent && (
                                <>
                                    <button style={styles.btnSecondary} onClick={() => setEmailContent('')}><RefreshCw size={13} /> Clear</button>
                                    <button style={styles.btnSecondary} onClick={handleCopy}>
                                        {copied ? <><Check size={13} color="#10b981" /> Copied!</> : <><Copy size={13} /> Copy</>}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {emailContent ? (
                        <textarea
                            style={styles.textarea}
                            value={emailContent}
                            onChange={e => setEmailContent(e.target.value)}
                        />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, color: '#64748b' }}>
                            <Mail size={40} strokeWidth={1} />
                            <div style={{ marginTop: 12, fontSize: 14 }}>Fill in the details and click Generate</div>
                            <div style={{ fontSize: 12, marginTop: 4 }}>Your email draft will appear here</div>
                        </div>
                    )}

                    {emailContent && (
                        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ color: '#64748b', fontSize: 12 }}>{emailContent.split(/\s+/).length} words | {emailContent.length} chars</div>
                            {copied && <div style={styles.copySuccess}><Check size={12} /> Copied to clipboard</div>}
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    )
}
