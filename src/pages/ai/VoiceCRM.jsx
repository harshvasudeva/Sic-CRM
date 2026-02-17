import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Camera, Upload, CreditCard, Clipboard, Sparkles, Check, X, FileText, Zap, Globe } from 'lucide-react'
import { parseVoiceInput, parseScreenshotToContact, addClipboardNote, scanVisitingCard, getVoiceCrmData } from '../../stores/voiceCrmStore'

export default function VoiceCRM() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [parsedFields, setParsedFields] = useState(null)
  const [activeTab, setActiveTab] = useState('voice')
  const [screenshotText, setScreenshotText] = useState('')
  const [clipboardText, setClipboardText] = useState('')
  const [processing, setProcessing] = useState(false)
  const [history, setHistory] = useState(getVoiceCrmData().recordings || [])
  const recognitionRef = useRef(null)

  const startRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.onresult = (event) => {
        let final = ''
        for (let i = 0; i < event.results.length; i++) {
          final += event.results[i][0].transcript
        }
        setTranscript(final)
      }
      recognitionRef.current.start()
      setIsRecording(true)
    } else {
      alert('Speech recognition not supported in this browser')
    }
  }

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
      if (transcript) {
        setProcessing(true)
        const result = await parseVoiceInput(transcript)
        setParsedFields(result.fields || result)
        setHistory(getVoiceCrmData().recordings || [])
        setProcessing(false)
      }
    }
  }

  const handleManualTranscript = async () => {
    if (!transcript.trim()) return
    setProcessing(true)
    const result = await parseVoiceInput(transcript)
    setParsedFields(result.fields || result)
    setHistory(getVoiceCrmData().recordings || [])
    setProcessing(false)
  }

  const handleScreenshot = async () => {
    if (!screenshotText.trim()) return
    setProcessing(true)
    const result = await parseScreenshotToContact(screenshotText)
    setParsedFields(result.contact || result)
    setProcessing(false)
  }

  const handleCardScan = async () => {
    if (!screenshotText.trim()) return
    setProcessing(true)
    const result = await scanVisitingCard(screenshotText)
    setParsedFields(result.contact || result)
    setProcessing(false)
  }

  const handleClipboard = () => {
    if (!clipboardText.trim()) return
    addClipboardNote(clipboardText, window.location.href)
    setClipboardText('')
  }

  const tabs = [
    { id: 'voice', label: 'Voice to Field', icon: Mic },
    { id: 'screenshot', label: 'Screenshot to Contact', icon: Camera },
    { id: 'card', label: 'Card Scanner', icon: CreditCard },
    { id: 'clipboard', label: 'Contextual Copy', icon: Clipboard },
  ]

  return (
    <div className="voice-crm-page">
      <div className="page-header">
        <div>
          <h1>Invisible CRM</h1>
          <p className="subtitle">Zero-input data capture powered by AI</p>
        </div>
        <div className="header-badge">
          <Sparkles size={16} />
          <span>AI Powered</span>
        </div>
      </div>

      <div className="tab-bar">
        {tabs.map(tab => (
          <motion.button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.id); setParsedFields(null) }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="content-grid">
        <div className="input-panel">
          <AnimatePresence mode="wait">
            {activeTab === 'voice' && (
              <motion.div key="voice" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="panel-card">
                <h3><Mic size={20} /> Voice to Field</h3>
                <p className="panel-desc">Just talk naturally. AI extracts contacts, deals, notes, and stages automatically.</p>
                <div className="voice-area">
                  <motion.button
                    className={`record-btn ${isRecording ? 'recording' : ''}`}
                    onClick={isRecording ? stopRecording : startRecording}
                    animate={isRecording ? { scale: [1, 1.1, 1], boxShadow: ['0 0 0 0 rgba(239,68,68,0.4)', '0 0 0 20px rgba(239,68,68,0)', '0 0 0 0 rgba(239,68,68,0.4)'] } : {}}
                    transition={{ duration: 1.5, repeat: isRecording ? Infinity : 0 }}
                  >
                    {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
                  </motion.button>
                  <span className="record-label">{isRecording ? 'Tap to stop recording...' : 'Tap to start recording'}</span>
                </div>
                <div className="divider-text"><span>or type manually</span></div>
                <textarea
                  className="transcript-input"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder='e.g. "Met with John from Acme Corp, he&#39;s interested in the Pro plan but worried about cost. Deal value around $50k."'
                  rows={4}
                />
                <motion.button className="action-btn" onClick={handleManualTranscript} disabled={!transcript.trim() || processing} whileTap={{ scale: 0.95 }}>
                  <Zap size={18} /> {processing ? 'Parsing...' : 'Extract Fields'}
                </motion.button>
              </motion.div>
            )}

            {activeTab === 'screenshot' && (
              <motion.div key="screenshot" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="panel-card">
                <h3><Camera size={20} /> Screenshot to Contact</h3>
                <p className="panel-desc">Paste a LinkedIn profile, email signature, or any text. AI parses contact details.</p>
                <div className="upload-zone">
                  <Upload size={40} />
                  <p>Drag & drop an image or paste text below</p>
                </div>
                <textarea
                  className="transcript-input"
                  value={screenshotText}
                  onChange={(e) => setScreenshotText(e.target.value)}
                  placeholder={'Paste LinkedIn profile text, email signature, or any contact info...\n\nJohn Smith\nVP of Engineering at TechCorp\njohn.smith@techcorp.com\n+1 (555) 123-4567\nlinkedin.com/in/johnsmith'}
                  rows={6}
                />
                <motion.button className="action-btn" onClick={handleScreenshot} disabled={!screenshotText.trim() || processing} whileTap={{ scale: 0.95 }}>
                  <Sparkles size={18} /> {processing ? 'Parsing...' : 'Extract Contact'}
                </motion.button>
              </motion.div>
            )}

            {activeTab === 'card' && (
              <motion.div key="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="panel-card">
                <h3><CreditCard size={20} /> Visiting Card Scanner 2.0</h3>
                <p className="panel-desc">Scan a business card. OCR + LinkedIn enrichment for instant context.</p>
                <div className="upload-zone">
                  <CreditCard size={40} />
                  <p>Upload a business card image or paste the text</p>
                </div>
                <textarea
                  className="transcript-input"
                  value={screenshotText}
                  onChange={(e) => setScreenshotText(e.target.value)}
                  placeholder="Paste business card text here..."
                  rows={4}
                />
                <motion.button className="action-btn" onClick={handleCardScan} disabled={!screenshotText.trim() || processing} whileTap={{ scale: 0.95 }}>
                  <Globe size={18} /> {processing ? 'Scanning + Enriching...' : 'Scan & Enrich'}
                </motion.button>
              </motion.div>
            )}

            {activeTab === 'clipboard' && (
              <motion.div key="clipboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="panel-card">
                <h3><Clipboard size={20} /> Contextual Copy Helper</h3>
                <p className="panel-desc">Copy text from anywhere and add it to client notes instantly.</p>
                <textarea
                  className="transcript-input"
                  value={clipboardText}
                  onChange={(e) => setClipboardText(e.target.value)}
                  placeholder="Paste any text - news article, email snippet, meeting note..."
                  rows={4}
                />
                <motion.button className="action-btn" onClick={handleClipboard} disabled={!clipboardText.trim()} whileTap={{ scale: 0.95 }}>
                  <FileText size={18} /> Add to Client Notes
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="results-panel">
          <h3>Extracted Fields</h3>
          {processing && (
            <div className="processing-indicator">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Sparkles size={24} />
              </motion.div>
              <p>AI is parsing your input...</p>
            </div>
          )}
          {parsedFields && !processing && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="fields-list">
              {Object.entries(parsedFields).filter(([k]) => k !== 'rawTranscript' && k !== 'parsedAt' && k !== 'source').map(([key, value]) => (
                <div key={key} className="field-row">
                  <span className="field-key">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                  <span className="field-value">{String(value)}</span>
                  <button className="field-action"><Check size={14} /></button>
                </div>
              ))}
              <div className="field-actions-bar">
                <motion.button className="save-btn" whileTap={{ scale: 0.95 }}>Save to CRM</motion.button>
                <motion.button className="dismiss-btn" onClick={() => setParsedFields(null)} whileTap={{ scale: 0.95 }}><X size={14} /> Dismiss</motion.button>
              </div>
            </motion.div>
          )}
          {!parsedFields && !processing && (
            <div className="empty-results">
              <Sparkles size={40} />
              <p>Extracted fields will appear here</p>
            </div>
          )}

          {history.length > 0 && (
            <div className="history-section">
              <h4>Recent Extractions</h4>
              {history.slice(-5).reverse().map((item, i) => (
                <div key={i} className="history-item">
                  <span className="history-name">{item.contactName || item.company || 'Unknown'}</span>
                  <span className="history-date">{new Date(item.parsedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .voice-crm-page { padding: 0; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .page-header h1 { font-size: 1.8rem; font-weight: 700; color: var(--text-primary); margin: 0; }
        .subtitle { color: var(--text-muted); margin-top: 4px; font-size: 0.9rem; }
        .header-badge { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2)); border-radius: 20px; color: var(--accent-primary); font-size: 0.85rem; font-weight: 500; }
        .tab-bar { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
        .tab-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
        .tab-btn:hover { border-color: var(--accent-primary); color: var(--text-primary); }
        .tab-btn.active { background: rgba(99,102,241,0.15); border-color: var(--accent-primary); color: var(--accent-primary); }
        .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media (max-width: 900px) { .content-grid { grid-template-columns: 1fr; } }
        .panel-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px; padding: 24px; }
        .panel-card h3 { display: flex; align-items: center; gap: 8px; margin: 0 0 8px; color: var(--text-primary); font-size: 1.1rem; }
        .panel-desc { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 20px; }
        .voice-area { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 30px 0; }
        .record-btn { width: 80px; height: 80px; border-radius: 50%; background: var(--accent-gradient); border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .record-btn.recording { background: linear-gradient(135deg, #ef4444, #dc2626); }
        .record-label { color: var(--text-muted); font-size: 0.85rem; }
        .divider-text { text-align: center; margin: 16px 0; position: relative; }
        .divider-text::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: var(--border-color); }
        .divider-text span { background: var(--bg-secondary); padding: 0 12px; position: relative; color: var(--text-muted); font-size: 0.8rem; }
        .transcript-input { width: 100%; padding: 12px 16px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 12px; color: var(--text-primary); font-size: 0.9rem; resize: vertical; font-family: inherit; box-sizing: border-box; }
        .transcript-input:focus { outline: none; border-color: var(--accent-primary); }
        .transcript-input::placeholder { color: var(--text-muted); }
        .action-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 12px; margin-top: 12px; background: var(--accent-gradient); border: none; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .upload-zone { border: 2px dashed var(--border-color); border-radius: 12px; padding: 30px; text-align: center; color: var(--text-muted); margin-bottom: 16px; }
        .upload-zone p { margin-top: 8px; font-size: 0.85rem; }
        .results-panel { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px; padding: 24px; }
        .results-panel h3 { margin: 0 0 16px; color: var(--text-primary); font-size: 1.1rem; }
        .processing-indicator { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px 0; color: var(--accent-primary); }
        .fields-list { display: flex; flex-direction: column; gap: 8px; }
        .field-row { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: var(--bg-tertiary); border-radius: 10px; }
        .field-key { font-size: 0.8rem; color: var(--text-muted); min-width: 100px; text-transform: capitalize; }
        .field-value { flex: 1; color: var(--text-primary); font-size: 0.9rem; font-weight: 500; }
        .field-action { background: rgba(34,197,94,0.2); border: none; border-radius: 6px; padding: 4px; color: #22c55e; cursor: pointer; }
        .field-actions-bar { display: flex; gap: 8px; margin-top: 16px; }
        .save-btn { flex: 1; padding: 10px; background: var(--accent-gradient); border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer; }
        .dismiss-btn { display: flex; align-items: center; gap: 4px; padding: 10px 16px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 10px; color: var(--text-secondary); cursor: pointer; }
        .empty-results { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 0; color: var(--text-muted); }
        .history-section { margin-top: 24px; border-top: 1px solid var(--border-color); padding-top: 16px; }
        .history-section h4 { margin: 0 0 12px; color: var(--text-secondary); font-size: 0.9rem; }
        .history-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color); }
        .history-name { color: var(--text-primary); font-size: 0.85rem; }
        .history-date { color: var(--text-muted); font-size: 0.8rem; }
      `}</style>
    </div>
  )
}