import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Zap, Copy, Mail, MessageSquare, IndianRupee, Users, Target,
    FileText, ChevronRight, Sparkles, CheckCircle, BarChart3
} from 'lucide-react'
import { generateCampaignIdea, getBriefTemplates, applyBriefTemplate } from '../../stores/influencerStore'
import { getCurrency } from '../../stores/settingsStore'

function CampaignGenerator() {
    const [input, setInput] = useState({
        brandName: '', industry: '', budget: '', objective: 'Brand Awareness', platform: 'Instagram'
    })
    const [result, setResult] = useState(null)
    const [copied, setCopied] = useState('')
    const [briefTemplates] = useState(getBriefTemplates())
    const [selectedTemplate, setSelectedTemplate] = useState('')
    const [appliedBrief, setAppliedBrief] = useState(null)

    function handleTemplateSelect(templateId) {
        setSelectedTemplate(templateId)
        if (templateId) {
            const brief = applyBriefTemplate(templateId, input.brandName)
            setAppliedBrief(brief)
            if (brief) setInput(i => ({ ...i, objective: brief.objective }))
        } else {
            setAppliedBrief(null)
        }
    }

    function handleGenerate(e) {
        e.preventDefault()
        if (!input.brandName || !input.industry || !input.budget) return
        const output = generateCampaignIdea(input)
        setResult(output)
    }

    function copyText(text, label) {
        navigator.clipboard.writeText(text)
        setCopied(label)
        setTimeout(() => setCopied(''), 2000)
    }

    const formatCurrency = (val) => {
        if (!val) return '—'
        const s = getCurrency().symbol
        if (val >= 100000) return `${s}${(val / 100000).toFixed(1)}L`
        if (val >= 1000) return `${s}${(val / 1000).toFixed(1)}K`
        return `${s}${val}`
    }

    const industries = ['Beauty', 'Tech', 'Food', 'Fashion', 'Health', 'Finance', 'Education', 'Quick Commerce', 'Electronics', 'FMCG', 'Gaming', 'Travel', 'Real Estate', 'SaaS']
    const objectives = ['Brand Awareness', 'Product Launch', 'App Downloads', 'Lead Generation', 'Sales']

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Campaign</span> Generator</h1>
                    <p className="page-description">Auto-generate campaign ideas, creator mix, cost splits, and pitch templates</p>
                </div>
            </motion.div>

            <div className="gen-layout">
                <motion.div className="gen-input-panel" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="gen-panel-header">
                        <Zap size={20} />
                        <h2>Campaign Input</h2>
                    </div>
                    <form onSubmit={handleGenerate} className="gen-form">
                        <div className="inf-form-group">
                            <label>Brand Name *</label>
                            <input value={input.brandName} onChange={e => setInput(i => ({ ...i, brandName: e.target.value }))}
                                placeholder="e.g., Boat, Nykaa, Zepto" required />
                        </div>
                        <div className="inf-form-group">
                            <label>Industry *</label>
                            <select value={input.industry} onChange={e => setInput(i => ({ ...i, industry: e.target.value }))} required>
                                <option value="">Select Industry</option>
                                {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                            </select>
                        </div>
                        <div className="inf-form-group">
                            <label>Budget ({getCurrency().symbol}) *</label>
                            <input type="number" value={input.budget} onChange={e => setInput(i => ({ ...i, budget: e.target.value }))}
                                placeholder="e.g., 500000" required />
                        </div>
                        <div className="inf-form-group">
                            <label>Objective</label>
                            <select value={input.objective} onChange={e => setInput(i => ({ ...i, objective: e.target.value }))}>
                                {objectives.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        <div className="inf-form-group">
                            <label>Platform</label>
                            <select value={input.platform} onChange={e => setInput(i => ({ ...i, platform: e.target.value }))}>
                                <option>Instagram</option><option>YouTube</option><option>Both</option>
                            </select>
                        </div>
                        <div className="inf-form-group">
                            <label>Brief Template</label>
                            <select value={selectedTemplate} onChange={e => handleTemplateSelect(e.target.value)}>
                                <option value="">Custom (No Template)</option>
                                {briefTemplates.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                            </select>
                        </div>

                        {appliedBrief && (
                            <div className="gen-brief-preview">
                                <div className="gen-brief-title">Template Brief</div>
                                <p className="gen-brief-text">{appliedBrief.brief}</p>
                                <div className="gen-brief-meta">
                                    <span>Deliverables: {appliedBrief.deliverables.join(', ')}</span>
                                    <span>Duration: {appliedBrief.duration}</span>
                                </div>
                            </div>
                        )}

                        <button type="submit" className="gen-submit-btn">
                            <Sparkles size={18} /> Generate Campaign Idea
                        </button>
                    </form>
                </motion.div>

                <div className="gen-output-panel">
                    {!result && (
                        <motion.div className="gen-placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Sparkles size={48} />
                            <h3>Enter brand details to generate</h3>
                            <p>Campaign name, content angles, creator mix, cost table, email pitch & WhatsApp message</p>
                        </motion.div>
                    )}

                    <AnimatePresence>
                        {result && (
                            <motion.div className="gen-result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="gen-result-header">
                                    <h2><Megaphone size={22} /> {result.campaignName}</h2>
                                    <span className="gen-budget-tag">{formatCurrency(result.totalBudget)} Budget</span>
                                </div>

                                {/* Content Angles */}
                                <div className="gen-section">
                                    <h3><Target size={18} /> Content Angles</h3>
                                    {result.contentAngles.map((angle, i) => (
                                        <div key={i} className="gen-angle">
                                            <span className="gen-angle-num">{i + 1}</span>
                                            <p>{angle}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Creator Mix */}
                                <div className="gen-section">
                                    <h3><Users size={18} /> Creator Mix</h3>
                                    <div className="gen-creator-mix">
                                        {result.creatorMix.map((mix, i) => (
                                            <div key={i} className="gen-mix-card">
                                                <div className="gen-mix-type">{mix.type}</div>
                                                <div className="gen-mix-count">{mix.count} creators</div>
                                                <div className="gen-mix-cost">{formatCurrency(mix.costEach)} each</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Cost Table */}
                                <div className="gen-section">
                                    <h3><IndianRupee size={18} /> Cost Split</h3>
                                    <table className="gen-cost-table">
                                        <thead>
                                            <tr><th>Item</th><th>Amount</th><th>%</th></tr>
                                        </thead>
                                        <tbody>
                                            {result.costSplit.map((row, i) => (
                                                <tr key={i}>
                                                    <td>{row.item}</td>
                                                    <td>{formatCurrency(row.amount)}</td>
                                                    <td>{((row.amount / result.totalBudget) * 100).toFixed(0)}%</td>
                                                </tr>
                                            ))}
                                            <tr className="gen-cost-total">
                                                <td>Total</td>
                                                <td>{formatCurrency(result.totalBudget)}</td>
                                                <td>100%</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Deliverables */}
                                <div className="gen-section">
                                    <h3><FileText size={18} /> Deliverables</h3>
                                    <div className="gen-deliverables">
                                        {result.deliverables.map((d, i) => (
                                            <span key={i} className="gen-del-chip">{d}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Email Pitch */}
                                <div className="gen-section">
                                    <div className="gen-section-header">
                                        <h3><Mail size={18} /> Email Pitch</h3>
                                        <button className="gen-copy-btn" onClick={() => copyText(result.emailPitch, 'email')}>
                                            {copied === 'email' ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                                        </button>
                                    </div>
                                    <pre className="gen-pitch-text">{result.emailPitch}</pre>
                                </div>

                                {/* WhatsApp Pitch */}
                                <div className="gen-section">
                                    <div className="gen-section-header">
                                        <h3><MessageSquare size={18} /> WhatsApp Pitch</h3>
                                        <button className="gen-copy-btn" onClick={() => copyText(result.whatsAppPitch, 'whatsapp')}>
                                            {copied === 'whatsapp' ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                                        </button>
                                    </div>
                                    <pre className="gen-pitch-text gen-wa">{result.whatsAppPitch}</pre>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <style>{`
                .gen-layout { display: grid; grid-template-columns: 360px 1fr; gap: 24px; align-items: flex-start; }
                .gen-input-panel {
                    background: rgba(30,30,45,0.6); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 16px; padding: 24px; position: sticky; top: 20px;
                }
                .gen-panel-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }
                .gen-form { display: flex; flex-direction: column; gap: 14px; }
                .gen-submit-btn {
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    padding: 14px; background: var(--accent-gradient); color: white;
                    border: none; border-radius: 12px; font-size: 0.9rem; font-weight: 600;
                    cursor: pointer; margin-top: 8px; transition: opacity 0.2s;
                }
                .gen-submit-btn:hover { opacity: 0.9; }

                .gen-output-panel { min-height: 400px; }
                .gen-placeholder {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    min-height: 400px; color: var(--text-muted); text-align: center; gap: 12px;
                }
                .gen-placeholder h3 { color: var(--text-secondary); }
                .gen-placeholder p { max-width: 400px; font-size: 0.85rem; }

                .gen-result {
                    background: rgba(30,30,45,0.6); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 16px; padding: 24px;
                }
                .gen-result-header {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
                }
                .gen-result-header h2 { display: flex; align-items: center; gap: 10px; font-size: 1.2rem; }
                .gen-budget-tag {
                    padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 600;
                    background: rgba(16,185,129,0.15); color: #10b981;
                }

                .gen-section { margin-bottom: 24px; }
                .gen-section h3 {
                    display: flex; align-items: center; gap: 8px;
                    font-size: 0.95rem; font-weight: 600; margin-bottom: 12px; color: var(--text-primary);
                }
                .gen-section-header { display: flex; justify-content: space-between; align-items: center; }

                .gen-angle {
                    display: flex; gap: 12px; padding: 12px; margin-bottom: 8px;
                    background: rgba(255,255,255,0.02); border-radius: 10px;
                }
                .gen-angle-num {
                    width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
                    background: rgba(99,102,241,0.15); color: var(--accent-primary);
                    display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem;
                }
                .gen-angle p { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4; }

                .gen-creator-mix { display: flex; gap: 12px; flex-wrap: wrap; }
                .gen-mix-card {
                    background: rgba(30,30,45,0.8); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 12px; padding: 16px; flex: 1; min-width: 140px; text-align: center;
                }
                .gen-mix-type { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 6px; }
                .gen-mix-count { font-size: 1.2rem; font-weight: 700; color: var(--accent-primary); }
                .gen-mix-cost { font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px; }

                .gen-cost-table { width: 100%; border-collapse: collapse; }
                .gen-cost-table th {
                    text-align: left; padding: 10px 12px; font-size: 0.75rem; font-weight: 600;
                    color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                .gen-cost-table td { padding: 10px 12px; font-size: 0.85rem; color: var(--text-secondary); border-bottom: 1px solid rgba(255,255,255,0.03); }
                .gen-cost-total td { font-weight: 700; color: var(--text-primary); border-top: 2px solid rgba(99,102,241,0.3); }

                .gen-deliverables { display: flex; flex-wrap: wrap; gap: 8px; }
                .gen-del-chip {
                    padding: 6px 14px; border-radius: 20px; font-size: 0.8rem;
                    background: rgba(99,102,241,0.1); color: var(--accent-primary); border: 1px solid rgba(99,102,241,0.2);
                }

                .gen-copy-btn {
                    display: flex; align-items: center; gap: 6px; padding: 6px 14px;
                    background: rgba(99,102,241,0.15); color: var(--accent-primary);
                    border: 1px solid rgba(99,102,241,0.3); border-radius: 8px;
                    font-size: 0.75rem; cursor: pointer; transition: all 0.15s;
                }
                .gen-copy-btn:hover { background: rgba(99,102,241,0.25); }

                .gen-pitch-text {
                    background: rgba(30,30,45,0.8); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 12px; padding: 16px; font-size: 0.85rem; color: var(--text-secondary);
                    line-height: 1.6; white-space: pre-wrap; font-family: inherit; margin-top: 8px;
                }
                .gen-wa { background: rgba(37,211,102,0.05); border-color: rgba(37,211,102,0.15); }

                .gen-brief-preview {
                    background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2);
                    border-radius: 12px; padding: 14px; margin-top: 4px;
                }
                .gen-brief-title { font-size: 0.75rem; font-weight: 600; color: var(--accent-primary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
                .gen-brief-text { font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 8px; }
                .gen-brief-meta { display: flex; flex-direction: column; gap: 4px; font-size: 0.75rem; color: var(--text-muted); }

                @media (max-width: 900px) { .gen-layout { grid-template-columns: 1fr; } .gen-input-panel { position: static; } }
            `}</style>
        </div>
    )
}

// Need the icon for result header
function Megaphone(props) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
}

export default CampaignGenerator
