import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Building2, Target, DollarSign, CheckCircle, ChevronRight, ChevronLeft, SkipForward } from 'lucide-react'

const STORAGE_KEY = 'sic-onboarding'
const s = {
  page: { minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 40, maxWidth: 560, width: '100%' },
  title: { fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: 8, textAlign: 'center' },
  sub: { color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', marginBottom: 24 },
  progress: { display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 },
  dot: (active, done) => ({ width: active ? 32 : 10, height: 10, borderRadius: 5, background: done ? '#10b981' : active ? '#6366f1' : 'rgba(255,255,255,0.15)', transition: 'all 0.3s' }),
  input: { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.95rem', marginBottom: 14 },
  select: { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.95rem', marginBottom: 14 },
  label: { color: '#94a3b8', fontSize: '0.8rem', marginBottom: 6, display: 'block' },
  btn: { padding: '10px 20px', borderRadius: 10, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', fontWeight: 500 },
  btnSec: { padding: '10px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' },
  footer: { display: 'flex', justifyContent: 'space-between', marginTop: 24 },
  checkbox: { display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer', marginTop: 8 },
  goalCard: (active) => ({ padding: '12px 16px', borderRadius: 10, border: `1px solid ${active ? '#6366f1' : 'rgba(255,255,255,0.1)'}`, background: active ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', marginBottom: 8, color: active ? '#818cf8' : '#94a3b8', fontSize: '0.9rem' }),
  confetti: { fontSize: '3rem', textAlign: 'center', marginBottom: 16 }
}

const goals = ['Brand Awareness', 'Product Launches', 'Engagement Growth', 'App Downloads', 'UGC Content', 'Lead Generation']
const industries = ['Beauty & Cosmetics', 'Technology', 'Food & Beverage', 'Fashion', 'Health & Fitness', 'Travel', 'Education', 'Finance', 'Entertainment', 'Other']

export default function OnboardingWizard() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({ brandName: '', website: '', industry: '', goals: [], budget: '200000', timeline: '3 months' })
  const [dontShow, setDontShow] = useState(false)

  const update = (field, value) => setData(prev => ({ ...prev, [field]: value }))
  const toggleGoal = (g) => update('goals', data.goals.includes(g) ? data.goals.filter(x => x !== g) : [...data.goals, g])
  const next = () => setStep(s => Math.min(s + 1, 4))
  const prev = () => setStep(s => Math.max(s - 1, 0))
  const complete = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: true, data, completedAt: new Date().toISOString(), dontShow }))
  }

  const steps = [
    { icon: Sparkles, title: 'Welcome to Sic CRM', sub: 'Let\'s set up your brand profile in just a few steps' },
    { icon: Building2, title: 'Brand Profile', sub: 'Tell us about your brand' },
    { icon: Target, title: 'Industry & Goals', sub: 'What are you looking to achieve?' },
    { icon: DollarSign, title: 'Budget & Timeline', sub: 'Help us recommend the right creators' },
    { icon: CheckCircle, title: 'You\'re All Set!', sub: 'Your brand profile is ready' }
  ]

  const StepIcon = steps[step].icon

  return (
    <div style={s.page}>
      <div style={s.progress}>
        {steps.map((_, i) => <div key={i} style={s.dot(i === step, i < step)} />)}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} style={s.card} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <StepIcon size={32} style={{ color: '#6366f1', marginBottom: 8 }} />
            <h2 style={s.title}>{steps[step].title}</h2>
            <p style={s.sub}>{steps[step].sub}</p>
          </div>

          {step === 0 && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#e2e8f0', lineHeight: 1.6, marginBottom: 16 }}>
                We'll walk you through setting up your brand profile, selecting your industry and goals, and configuring your budget preferences. This takes about 2 minutes.
              </p>
              <motion.div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: '2rem' }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>
                🎯 📊 🚀
              </motion.div>
            </div>
          )}

          {step === 1 && (
            <div>
              <label style={s.label}>Brand Name *</label>
              <input style={s.input} placeholder="e.g., Nykaa" value={data.brandName} onChange={e => update('brandName', e.target.value)} />
              <label style={s.label}>Website</label>
              <input style={s.input} placeholder="https://yourbrand.com" value={data.website} onChange={e => update('website', e.target.value)} />
              <label style={s.label}>Brand Logo</label>
              <div style={{ ...s.input, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, border: '2px dashed rgba(255,255,255,0.15)', cursor: 'pointer', color: '#94a3b8' }}>
                Click to upload logo
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <label style={s.label}>Industry *</label>
              <select style={s.select} value={data.industry} onChange={e => update('industry', e.target.value)}>
                <option value="">Select industry...</option>
                {industries.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              <label style={s.label}>Campaign Goals (select all that apply)</label>
              <div>
                {goals.map(g => (
                  <div key={g} style={s.goalCard(data.goals.includes(g))} onClick={() => toggleGoal(g)}>
                    {data.goals.includes(g) ? <CheckCircle size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} /> : null}
                    {g}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <label style={s.label}>Monthly Influencer Budget (INR)</label>
              <input style={s.input} type="number" value={data.budget} onChange={e => update('budget', e.target.value)} />
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: 14 }}>
                ~₹{(Number(data.budget) / 100000).toFixed(1)}L/month
              </div>
              <label style={s.label}>Campaign Timeline</label>
              <select style={s.select} value={data.timeline} onChange={e => update('timeline', e.target.value)}>
                {['1 month', '3 months', '6 months', '12 months', 'Ongoing'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}

          {step === 4 && (
            <div style={{ textAlign: 'center' }}>
              <div style={s.confetti}>🎉</div>
              <p style={{ color: '#e2e8f0', lineHeight: 1.6, marginBottom: 16 }}>
                Your brand profile for <strong>{data.brandName || 'your brand'}</strong> is ready! You can now start discovering creators, building campaigns, and tracking performance.
              </p>
              <label style={s.checkbox}>
                <input type="checkbox" checked={dontShow} onChange={e => setDontShow(e.target.checked)} />
                Don't show this wizard again
              </label>
            </div>
          )}

          <div style={s.footer}>
            {step > 0 && step < 4 ? <button style={s.btnSec} onClick={prev}><ChevronLeft size={16} /> Back</button> : <div />}
            <div style={{ display: 'flex', gap: 8 }}>
              {step < 4 && step > 0 && <button style={s.btnSec} onClick={next}><SkipForward size={14} /> Skip</button>}
              {step < 4 && <button style={s.btn} onClick={next}>
                {step === 0 ? 'Get Started' : 'Next'} <ChevronRight size={16} />
              </button>}
              {step === 4 && <button style={s.btn} onClick={complete}><CheckCircle size={16} /> Go to Dashboard</button>}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
