import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserPlus, Music2, Globe, MapPin, Mail,
  Phone, Link2, CheckCircle, Clock, Send, Eye, BarChart3, FileText
} from 'lucide-react'
import { Instagram, Youtube, platformIcons } from '../../components/PlatformIcons'

const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }
const accent = '#6366f1'
const muted = '#94a3b8'

const STORAGE_KEY = 'sic-creator-applications'

const platformOptions = ['Instagram', 'YouTube', 'TikTok', 'Twitter/X', 'LinkedIn']
const nicheOptions = ['Lifestyle', 'Tech', 'Fitness', 'Food', 'Travel', 'Comedy', 'Fashion', 'Gaming', 'Education', 'Finance']

const emptyForm = {
  name: '', platform: 'Instagram', handle: '', niche: '', city: '',
  email: '', phone: '', websiteUrl: '', socialLinks: '',
  followers: '', avgViews: '', engagementRate: '',
  termsAccepted: false
}

function getApplications() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch { return [] }
}

function saveApplication(app) {
  const apps = getApplications()
  apps.unshift({ ...app, id: `app-${Date.now()}`, status: 'pending', submittedAt: new Date().toISOString() })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps))
  return apps
}

export default function CreatorOnboarding() {
  const [form, setForm] = useState({ ...emptyForm })
  const [applications, setApplications] = useState([])
  const [tab, setTab] = useState('apply')
  const [submitted, setSubmitted] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setApplications(getApplications())
  }, [])

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.handle.trim()) errs.handle = 'Handle is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    if (!form.niche) errs.niche = 'Niche is required'
    if (!form.termsAccepted) errs.termsAccepted = 'You must accept the terms'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const apps = saveApplication(form)
    setApplications(apps)
    setForm({ ...emptyForm })
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const inputStyle = (hasError) => ({
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14,
    outline: 'none', boxSizing: 'border-box'
  })

  const labelStyle = { display: 'block', marginBottom: 6, fontSize: 12, color: muted, fontWeight: 500 }

  const PlatformIcon = platformIcons[form.platform] || Globe

  return (
    <div style={{ padding: 24, color: '#fff', maxWidth: 900, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <UserPlus size={28} color={accent} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Creator Onboarding</h1>
        </div>
        <p style={{ color: muted, fontSize: 14, marginBottom: 24 }}>
          Apply to join our creator network or track your application status
        </p>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {[
          { id: 'apply', label: 'Application Form', icon: FileText },
          { id: 'status', label: 'My Applications', icon: Clock }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 18px', borderRadius: 8, border: 'none',
              background: tab === t.id ? accent : 'rgba(255,255,255,0.05)',
              color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Application Form */}
      {tab === 'apply' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              style={{
                ...card, padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)'
              }}
            >
              <CheckCircle size={18} color="#10b981" />
              <span style={{ color: '#10b981', fontWeight: 600 }}>Application submitted successfully!</span>
            </motion.div>
          )}

          <div style={{ ...card, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Personal Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your full name" style={inputStyle(errors.name)} />
                {errors.name && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors.name}</div>}
              </div>
              <div>
                <label style={labelStyle}>Platform *</label>
                <select value={form.platform} onChange={e => update('platform', e.target.value)} style={inputStyle(false)}>
                  {platformOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Handle / Username *</label>
                <input value={form.handle} onChange={e => update('handle', e.target.value)} placeholder="@yourhandle" style={inputStyle(errors.handle)} />
                {errors.handle && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors.handle}</div>}
              </div>
              <div>
                <label style={labelStyle}>Niche / Category *</label>
                <select value={form.niche} onChange={e => update('niche', e.target.value)} style={inputStyle(errors.niche)}>
                  <option value="">Select niche</option>
                  {nicheOptions.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                {errors.niche && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors.niche}</div>}
              </div>
              <div>
                <label style={labelStyle}>City</label>
                <input value={form.city} onChange={e => update('city', e.target.value)} placeholder="Your city" style={inputStyle(false)} />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@email.com" type="email" style={inputStyle(errors.email)} />
                {errors.email && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors.email}</div>}
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91-XXXXX-XXXXX" style={inputStyle(false)} />
              </div>
              <div>
                <label style={labelStyle}>Website / Portfolio URL</label>
                <input value={form.websiteUrl} onChange={e => update('websiteUrl', e.target.value)} placeholder="https://..." style={inputStyle(false)} />
              </div>
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, marginTop: 24 }}>Stats Submission</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Followers / Subscribers</label>
                <input value={form.followers} onChange={e => update('followers', e.target.value)} placeholder="e.g. 520000" type="number" style={inputStyle(false)} />
              </div>
              <div>
                <label style={labelStyle}>Avg Views per Post</label>
                <input value={form.avgViews} onChange={e => update('avgViews', e.target.value)} placeholder="e.g. 45000" type="number" style={inputStyle(false)} />
              </div>
              <div>
                <label style={labelStyle}>Engagement Rate (%)</label>
                <input value={form.engagementRate} onChange={e => update('engagementRate', e.target.value)} placeholder="e.g. 8.5" type="number" step="0.1" style={inputStyle(false)} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Additional Social Links</label>
              <textarea
                value={form.socialLinks} onChange={e => update('socialLinks', e.target.value)}
                placeholder="Add other social media links, one per line..."
                rows={3}
                style={{ ...inputStyle(false), resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            {/* T&C */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox" checked={form.termsAccepted}
                  onChange={e => update('termsAccepted', e.target.checked)}
                  style={{ marginTop: 3, accentColor: accent }}
                />
                <span style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.5 }}>
                  I agree to the <span style={{ color: accent, textDecoration: 'underline' }}>Terms & Conditions</span> and
                  consent to sharing my public profile data for campaign matching purposes.
                </span>
              </label>
              {errors.termsAccepted && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4, marginLeft: 24 }}>{errors.termsAccepted}</div>}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowPreview(!showPreview)} style={{
                padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 14,
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                <Eye size={16} /> Preview
              </button>
              <button onClick={handleSubmit} style={{
                padding: '10px 24px', borderRadius: 8, border: 'none',
                background: accent, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                <Send size={16} /> Submit Application
              </button>
            </div>
          </div>

          {/* Profile Preview */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                style={{ ...card, padding: 24, marginTop: 20 }}
              >
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: muted }}>Profile Preview</h3>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 14, background: `${accent}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <PlatformIcon size={28} color={accent} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{form.name || 'Your Name'}</div>
                    <div style={{ color: muted, fontSize: 13, marginBottom: 8 }}>
                      {form.handle || '@handle'} | {form.platform} | {form.niche || 'Niche'} | {form.city || 'City'}
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div><span style={{ fontWeight: 700 }}>{form.followers || '0'}</span> <span style={{ color: muted, fontSize: 12 }}>followers</span></div>
                      <div><span style={{ fontWeight: 700 }}>{form.avgViews || '0'}</span> <span style={{ color: muted, fontSize: 12 }}>avg views</span></div>
                      <div><span style={{ fontWeight: 700 }}>{form.engagementRate || '0'}%</span> <span style={{ color: muted, fontSize: 12 }}>engagement</span></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Status Tracking */}
      {tab === 'status' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {applications.length === 0 ? (
            <div style={{ ...card, padding: 40, textAlign: 'center' }}>
              <Clock size={32} color={muted} style={{ marginBottom: 10 }} />
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No applications yet</div>
              <div style={{ color: muted, fontSize: 13 }}>Submit an application to track its status here</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {applications.map((app, i) => {
                const statusColors = {
                  pending: { bg: '#f59e0b22', color: '#f59e0b' },
                  approved: { bg: '#10b98122', color: '#10b981' },
                  rejected: { bg: '#ef444422', color: '#ef4444' }
                }
                const st = statusColors[app.status] || statusColors.pending
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ ...card, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserPlus size={18} color={accent} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{app.name}</div>
                        <div style={{ color: muted, fontSize: 12 }}>{app.handle} | {app.platform} | {app.niche}</div>
                        <div style={{ color: muted, fontSize: 11 }}>
                          Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      background: st.bg, color: st.color, padding: '4px 12px',
                      borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: 'capitalize'
                    }}>
                      {app.status}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
